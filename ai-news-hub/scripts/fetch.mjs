#!/usr/bin/env node
// ai-news-hub fetch — 批量抓取 AI 新闻信源,校验、去重、排序、输出日报。
// 零依赖:只用 Node.js 内置模块(Node 18+ 需要全局 fetch)。
//
//   node scripts/fetch.mjs --check                 信源体检,不改数据
//   node scripts/fetch.mjs --window 24h --out ./out 抓取并生成当日日报
//   node scripts/fetch.mjs --group overseas         只抓某一档
//   node scripts/fetch.mjs --tier T1,T2 --limit 20  限定档位与条数

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SOURCES_FILE = path.join(ROOT, 'references', 'sources.txt');

const TIER_RANK = { T1: 0, AGG: 1, T2: 2, T3: 3, GH: 4 };
const GROUP_RANK = { OVERSEAS: 0, CHINA: 1, GITHUB: 2 };
const GROUP_LABEL = { OVERSEAS: '海外', CHINA: '国内', GITHUB: 'GitHub' };
const TIER_LABEL = { T1: '官方一手', AGG: '聚合站', T2: '研究机构', T3: '媒体', GH: 'GitHub 生态' };

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ---------- 参数 ----------
function parseArgs(argv) {
  const a = { window: '24h', out: null, groups: null, tiers: null, limit: 0, check: false, concurrency: 6, timeout: 20000, perSource: 25, help: false };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--check') a.check = true;
    else if (k === '--help' || k === '-h') a.help = true;
    else if (k === '--window') a.window = argv[++i];
    else if (k === '--out') a.out = argv[++i];
    else if (k === '--group') a.groups = argv[++i].split(',').map(s => s.trim().toLowerCase());
    else if (k === '--tier') a.tiers = argv[++i].split(',').map(s => s.trim().toUpperCase());
    else if (k === '--limit') a.limit = parseInt(argv[++i], 10) || 0;
    else if (k === '--per-source') a.perSource = parseInt(argv[++i], 10) || 0;
    else if (k === '--concurrency') a.concurrency = parseInt(argv[++i], 10) || 6;
    else if (k === '--timeout') a.timeout = parseInt(argv[++i], 10) || 20000;
  }
  return a;
}

// ---------- 信源表 ----------
async function loadSources() {
  const raw = await fs.readFile(SOURCES_FILE, 'utf8');
  const out = [];
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const p = t.split('|').map(s => s.trim());
    if (p.length < 5) continue;
    const [tier, group, name, url, kind] = p;
    out.push({ tier, group, name, url, kind, status: p[5] || 'ok', freq: p[6] || 'daily' });
  }
  return out;
}

// 每个源预期更新频率不同,停更判定不能一刀切 48 小时
const FREQ_STALE_HOURS = { daily: 72, weekly: 24 * 10, monthly: 24 * 45, low: 24 * 90 };
function staleHours(freq) { return FREQ_STALE_HOURS[freq] ?? FREQ_STALE_HOURS.daily; }

// 时间窗支持 24h / 7d / 2w,别让 parseInt('7d') 变成 7 小时
function parseWindow(s) {
  const m = /^(\d+)\s*([hdw])?$/i.exec(String(s).trim());
  if (!m) return 24;
  const n = parseInt(m[1], 10);
  const unit = (m[2] || 'h').toLowerCase();
  if (unit === 'd') return n * 24;
  if (unit === 'w') return n * 24 * 7;
  return n;
}

// ---------- HTML / XML 小工具 ----------
function decodeEntities(s) {
  if (!s) return '';
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}
function stripTags(s) {
  return decodeEntities(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
function tag(block, name) {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return m ? decodeEntities(m[1]).trim() : '';
}
function linkOf(block, isAtom) {
  if (isAtom) {
    const alt = block.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i);
    if (alt) return decodeEntities(alt[1]);
    const any = block.match(/<link[^>]*href=["']([^"']+)["']/i);
    return any ? decodeEntities(any[1]) : '';
  }
  const l = tag(block, 'link');
  if (l) return l;
  const g = tag(block, 'guid');
  return /^https?:/i.test(g) ? g : '';
}
function parseDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

// ---------- 抓取 ----------
// 按 hostname 限制并发:同一个域名同时打十几个请求会被限流或直接断连,
// github.com 的 releases.atom 尤其明显(单发正常,并发必失败)。
const PER_HOST = 2;
const HOST_GAP_MS = 400;
const hostSem = new Map();
function hostGate(host) {
  let g = hostSem.get(host);
  if (!g) {
    let active = 0;
    const queue = [];
    const next = () => {
      if (active >= PER_HOST || queue.length === 0) return;
      active++;
      const { fn, resolve, reject } = queue.shift();
      // reject 必须原样抛出:如果把错误当成功值 resolve,上层拿到的是 Error 对象而不是 Response
      fn().then(resolve, reject).finally(() => {
        // 同域名请求之间留一点间隔:github.com 连续请求会限流,实测单发正常、连发必挂
        setTimeout(() => { active--; next(); }, HOST_GAP_MS);
      });
    };
    g = { run: (fn) => new Promise((resolve, reject) => { queue.push({ fn, resolve, reject }); next(); }) };
    hostSem.set(host, g);
  }
  return g;
}

async function fetchOne(src, timeout) {
  const started = Date.now();
  const base = { ...src, ok: false, status: 0, contentType: '', items: [], error: '', newest: null, ms: 0 };
  const host = (() => { try { return new URL(src.url).host; } catch { return src.url; } })();
  // 重试一次:境外站点偶发 TLS/DNS 抖动,单次失败不代表源失效
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await hostGate(host).run(() => fetch(src.url, {
        headers: {
          'User-Agent': UA,
          'Accept': src.kind === 'json' ? 'application/json' : 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(timeout),
      }));
      base.status = res.status;
      base.contentType = (res.headers.get('content-type') || '').split(';')[0].trim();
      const body = await res.text();
      if (!res.ok) { base.error = `HTTP ${res.status}`; return base; }

      if (src.kind === 'json') {
        base.items = parseJsonFeed(body, src);
      } else if (src.kind === 'md') {
        base.items = parseMarkdownFeed(body, src);
      } else {
        // 假 200 防线:光看状态码会把 HTML 报错页当 feed,
        // 光看 content-type 也不够 —— 有些站(如 dedicated.wallstreetcn.com)会谎报 text/html 但 body 是真 RSS,
        // 有些站(如 wallstreetcn.com/rss.xml)会返回 S3 的 <Error>NoSuchKey</Error> 错误页
        const head = body.slice(0, 400).toLowerCase();
        const looksXml = /<(\?xml|rss|feed|channel|url)\b/.test(head);
        const isErrorPage = /<error[\s>]|<code>nosuchkey|<error>/i.test(body.slice(0, 600));
        if (isErrorPage || (!looksXml && !/xml/.test(base.contentType))) {
          base.error = isErrorPage
            ? '返回的是错误页而非 feed'
            : `非 XML 响应(ct=${base.contentType || 'none'}),已丢弃`;
          return base;
        }
        base.items = parseXmlFeed(body, src);
      }
      base.ok = true;
      if (base.items.length) {
        base.newest = base.items.reduce((m, it) => (it.published && (!m || it.published > m) ? it.published : m), null);
      }
      break;
    } catch (err) {
      const msg = String(err && err.message ? err.message : err);
      base.error = /abort|timeout/i.test(msg) ? '请求超时' : msg;
      if (attempt < 2) await new Promise(r => setTimeout(r, 1500));
    }
  }
  base.ms = Date.now() - started;
  return base;
}

function parseXmlFeed(body, src) {
  // sitemap 用 <url><loc>+<lastmod>,条目没有标题结构,单独处理
  if (src.kind === 'sitemap') {
    const blocks = body.match(/<url\b[\s\S]*?<\/url>/gi) || [];
    const items = [];
    for (const b of blocks) {
      const loc = tag(b, 'loc');
      if (!loc) continue;
      // 只保留新闻与研究页,滤掉 /company /careers /policy 这类常驻页面
      if (!/\/(news|research|engineering)\//.test(loc) && !/\/(news|research|engineering)$/.test(loc)) continue;
      items.push({
        title: loc.split('/').filter(Boolean).pop() || loc,
        link: loc,
        summary: '',
        published: parseDate(tag(b, 'lastmod')),
        source: src.name,
        tier: src.tier,
        group: src.group,
      });
    }
    return items;
  }

  const isAtom = /<feed\b/i.test(body.slice(0, 600)) || src.kind === 'atom';
  const blocks = body.match(isAtom ? /<entry\b[\s\S]*?<\/entry>/gi : /<item\b[\s\S]*?<\/item>/gi) || [];
  // GitHub Trending 这类聚合 feed 条目不带 pubDate,只有 channel 级日期
  const channelDate = isAtom ? null : parseDate(tag(body.match(/<channel\b[\s\S]*?<\/channel>/i)?.[0] || '', 'pubDate'));
  const items = [];
  for (const b of blocks) {
    const title = stripTags(tag(b, 'title'));
    if (!title) continue;
    const dateStr = isAtom ? (tag(b, 'updated') || tag(b, 'published')) : (tag(b, 'pubDate') || tag(b, 'dc:date'));
    const summaryRaw = isAtom
      ? (tag(b, 'content') || tag(b, 'summary'))
      : (tag(b, 'content:encoded') || tag(b, 'description') || tag(b, 'summary'));
    items.push({
      title,
      link: linkOf(b, isAtom),
      summary: stripTags(summaryRaw).slice(0, 400),
      published: parseDate(dateStr) || channelDate,
      source: src.name,
      tier: src.tier,
      group: src.group,
    });
  }
  return items;
}

function parseJsonFeed(body, src) {
  let j;
  try { j = JSON.parse(body); } catch { return []; }

  // 归一成候选条目数组,覆盖 AIHOT 的三种形状
  let raw = [];
  if (Array.isArray(j)) raw = j;
  else if (Array.isArray(j.items)) raw = j.items;
  else if (Array.isArray(j.data)) raw = j.data;
  else if (Array.isArray(j.results)) raw = j.results;
  else if (j.report && Array.isArray(j.report.sections)) {
    // AIHOT 日报: report.sections[].items + report.flashes
    for (const sec of j.report.sections) {
      for (const it of (sec.items || [])) raw.push({ ...it, _section: sec.label });
    }
    for (const it of (j.report.flashes || [])) raw.push({ ...it, _section: '快讯' });
  }

  const items = [];
  for (const it of raw) {
    if (!it || typeof it !== 'object') continue;
    const title = stripTags(it.title || it.name || it.label || '');
    if (!title) continue;
    const links = it.links || {};
    const link = (links.original && links.original.url) || links.original || links.self || it.url || it.link || '';
    const dateRaw = it.publishedAt || it.latestAt || it.published_at || it.date
      || it.createdAt || it.updatedAt || it.pubDate || it.generatedAt;
    const summaryBits = [it._section, it.summary, it.description, it.reason, it.content].filter(Boolean).join(' · ');
    items.push({
      title,
      link: typeof link === 'string' ? link : (link.href || link.url || ''),
      summary: stripTags(summaryBits).slice(0, 400),
      published: parseDate(dateRaw),
      source: src.name,
      tier: src.tier,
      group: src.group,
    });
  }
  return items;
}

function parseMarkdownFeed(body, src) {
  // 形如 [标题](链接) 的 markdown 列表,AIHOT /api/v1/agent 用这个格式
  const items = [];
  const re = /\[([^\]\n]{4,160})\]\((https?:\/\/[^\s)]+)\)/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const title = stripTags(m[1]);
    if (!title || /^https?:/i.test(title)) continue;
    items.push({
      title,
      link: m[2],
      summary: '',
      published: new Date(), // markdown 版不带逐条时间,交给上层按抓取时刻处理
      source: src.name,
      tier: src.tier,
      group: src.group,
    });
  }
  return items;
}

async function pool(items, limit, fn) {
  const results = [];
  let idx = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

// ---------- 去重 / 排序 ----------
function normTitle(t) {
  return t.toLowerCase()
    .replace(/[\s\u3000]+/g, '')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .slice(0, 60);
}
function dedupe(items) {
  const seen = new Map();
  const out = [];
  for (const it of items) {
    const key = normTitle(it.title);
    if (!key) continue;
    if (!seen.has(key)) { seen.set(key, it); out.push(it); }
    else {
      const prev = seen.get(key);
      // 保留分级更高的那条(T1 优先于 T3),同级保留描述更长的
      const prevRank = TIER_RANK[prev.tier] ?? 9;
      const curRank = TIER_RANK[it.tier] ?? 9;
      if (curRank < prevRank || (curRank === prevRank && (it.summary || '').length > (prev.summary || '').length)) {
        seen.set(key, it);
        out[out.indexOf(prev)] = it;
      }
    }
  }
  return out;
}
function rank(items) {
  return items.sort((a, b) => {
    const t = (TIER_RANK[a.tier] ?? 9) - (TIER_RANK[b.tier] ?? 9);
    if (t) return t;
    const g = (GROUP_RANK[a.group] ?? 9) - (GROUP_RANK[b.group] ?? 9);
    if (g) return g;
    const ta = a.published ? a.published.getTime() : 0;
    const tb = b.published ? b.published.getTime() : 0;
    return tb - ta;
  });
}

// ---------- 输出 ----------
function fmtTime(d) {
  if (!d) return '未知时间';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function renderMarkdown(items, meta) {
  const L = [];
  L.push(`# AI 日报 · ${meta.date}`);
  L.push('');
  L.push(`窗口 ${meta.window} | 条目 ${items.length} | 信源 ${meta.okCount}/${meta.totalCount} 可用`);
  L.push('');
  if (!items.length) {
    L.push('窗口内没有条目。检查信源健康度:`node scripts/fetch.mjs --check`');
    L.push('');
    return L.join('\n');
  }
  const byGroup = new Map();
  for (const it of items) {
    if (!byGroup.has(it.group)) byGroup.set(it.group, []);
    byGroup.get(it.group).push(it);
  }
  for (const g of [...byGroup.keys()].sort((a, b) => (GROUP_RANK[a] ?? 9) - (GROUP_RANK[b] ?? 9))) {
    const list = byGroup.get(g);
    L.push(`## ${GROUP_LABEL[g] || g}(${list.length})`);
    L.push('');
    const byTier = new Map();
    for (const it of list) {
      if (!byTier.has(it.tier)) byTier.set(it.tier, []);
      byTier.get(it.tier).push(it);
    }
    for (const t of [...byTier.keys()].sort((a, b) => (TIER_RANK[a] ?? 9) - (TIER_RANK[b] ?? 9))) {
      L.push(`### ${TIER_LABEL[t] || t}`);
      L.push('');
      for (const it of byTier.get(t)) {
        const title = it.link ? `[${it.title}](${it.link})` : it.title;
        L.push(`- ${title}`);
        L.push(`  - ${fmtTime(it.published)} · ${it.source}`);
        if (it.summary) L.push(`  - ${it.summary}`);
      }
      L.push('');
    }
  }
  return L.join('\n');
}

// ---------- 主流程 ----------
async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(`ai-news-hub fetch — 批量抓取 AI 新闻信源并生成当日日报

用法:
  node scripts/fetch.mjs --check                    只做信源体检,不抓数据
  node scripts/fetch.mjs --window 24h --out ./out   抓取并生成日报

参数:
  --window <24h|7d|2w>   时间窗,默认 24h
  --out <目录>           输出目录,默认 ./ai-news-out
  --tier <T1,AGG,T2,T3,GH>   只抓指定档位
  --group <overseas,china,github>   只抓指定分组
  --limit <N>            最终最多保留多少条
  --per-source <N>       每个源最多保留多少条,默认 25(arXiv 一天几百篇会淹没其他)
  --concurrency <N>      全局并发,默认 6
  --timeout <毫秒>       单个请求超时,默认 20000
  --help                 显示本帮助

输出:
  <out>/<YYYY-MM-DD>.jsonl   每行一条:title/link/summary/published/source/tier/group
  <out>/<YYYY-MM-DD>.md      按档位分组的 Markdown 日报

同域名并发限制为 2 且请求间隔 400ms —— github.com 的 releases.atom 连发必挂,这是实测踩出来的。`);
    return;
  }
  let sources = await loadSources();

  if (args.groups) {
    const g = args.groups;
    sources = sources.filter(s => g.includes(s.group.toLowerCase()) || g.includes('all'));
  }
  if (args.tiers) {
    sources = sources.filter(s => args.tiers.includes(s.tier));
  }
  // HTML 档由 agent 用联网工具解析,脚本不碰,否则会被误报成失败
  const agentOnly = sources.filter(s => s.kind === 'html');
  sources = sources.filter(s => s.kind !== 'html');

  if (args.check) {
    const results = await pool(sources, args.concurrency, s => fetchOne(s, args.timeout));
    const rows = [];
    let alive = 0;
    for (const r of results) {
      const ageH = r.newest ? (Date.now() - r.newest.getTime()) / 3600000 : null;
      const threshold = staleHours(r.freq);
      const stale = ageH !== null && ageH > threshold;
      if (r.ok && r.items.length) alive++;
      rows.push({
        源: r.name, 档: r.tier, 组: GROUP_LABEL[r.group] || r.group, 频率: r.freq, 状态: r.status,
        条目: r.items.length, 最新: r.newest ? fmtTime(r.newest) : '-',
        停更: stale ? `是(${ageH.toFixed(0)}h > ${threshold}h)` : '否', 耗时ms: r.ms, 问题: r.error || '',
      });
    }
    console.log(`信源体检:${alive}/${sources.length} 个可用\n`);
    console.table(rows);
    return;
  }

  const now = new Date();
  const winH = parseWindow(args.window);
  const cutoff = new Date(now.getTime() - winH * 3600000);

  const results = await pool(sources, args.concurrency, s => fetchOne(s, args.timeout));
  const okResults = results.filter(r => r.ok);

  let items = okResults.flatMap(r => r.items);
  items = items.filter(it => it.published && it.published >= cutoff);
  // 每源限流:arXiv 一天能出几百篇论文,不设限会把真正的新闻挤掉
  if (args.perSource) {
    const bySrc = new Map();
    for (const it of items) {
      if (!bySrc.has(it.source)) bySrc.set(it.source, []);
      bySrc.get(it.source).push(it);
    }
    const capped = [];
    for (const [, list] of bySrc) {
      list.sort((a, b) => (b.published?.getTime() || 0) - (a.published?.getTime() || 0));
      capped.push(...list.slice(0, args.perSource));
    }
    items = capped;
  }
  items = dedupe(items);
  items = rank(items);
  if (args.limit) items = items.slice(0, args.limit);

  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const outDir = path.resolve(args.out || path.join(process.cwd(), 'ai-news-out'));
  await fs.mkdir(outDir, { recursive: true });

  const jsonlPath = path.join(outDir, `${dateStr}.jsonl`);
  const mdPath = path.join(outDir, `${dateStr}.md`);
  const meta = { date: dateStr, window: `${winH}h`, okCount: okResults.length, totalCount: sources.length };

  await fs.writeFile(jsonlPath, items.map(it => JSON.stringify({
    title: it.title, link: it.link, summary: it.summary,
    published: it.published ? it.published.toISOString() : null,
    source: it.source, tier: it.tier, group: it.group,
  })).join('\n') + '\n', 'utf8');

  await fs.writeFile(mdPath, renderMarkdown(items, meta), 'utf8');

  const failed = results.filter(r => !r.ok);
  console.log(`窗口 ${winH}h · 信源 ${okResults.length}/${sources.length} 可用 · 条目 ${items.length} 条(去重后)`);
  console.log(`JSONL: ${jsonlPath}`);
  console.log(`MD   : ${mdPath}`);
  if (agentOnly.length) {
    console.log(`\n另有 ${agentOnly.length} 个 HTML 档信源需由 agent 解析:`);
    for (const f of agentOnly) console.log(`  ${f.name} — ${f.url}`);
  }
  if (failed.length) {
    console.log(`\n不可用信源 ${failed.length} 个:`);
    for (const f of failed) console.log(`  ${f.name} — ${f.error}`);
  }
}

main().catch(e => { console.error('fetch failed:', e); process.exit(1); });
