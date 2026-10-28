#!/usr/bin/env node
// ai-news-hub 输出校验器 —— 把「来源分层披露」这条软约束变成可执行检查。
//
// 它不抓取、不联网、不决定任何内容,只检查产物是否满足规范:
//   1. 每个条目有机器可读的层级标识(S1 / S2)
//   2. S1 的层标是 A 或 B,S2 的是 —
//   3. S1 的信源名必须真的在白名单里(抓杜撰信源名)
//   4. 每个来源都有合法的 http(s) URL
//   5. 页面有来源构成声明、<article> 开合平衡
//
// 用法:
//   node scripts/validate.mjs <你的html文件>     校验一份产物
//   node scripts/validate.mjs --selftest        自检(校验规范自己的正例与反例)
//
// 零依赖,只用 Node.js 内置模块(Node 18+)。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = path.resolve(HERE, '..');

// ---------- 定位白名单 ----------
function findSourcesMd() {
  const candidates = [
    path.join(SKILL_DIR, 'references', 'sources.md'),          // skill 安装后的标准位置
    path.join(SKILL_DIR, '..', 'ai-news-hub', 'references', 'sources.md'), // 仓库布局
    path.join(SKILL_DIR, '..', '..', 'ai-news-hub', 'references', 'sources.md'),
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return null;
}

function loadWhitelist() {
  const p = findSourcesMd();
  if (!p) return { names: new Set(), found: false };
  const names = new Set();
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = /^\|\s*([^|]+?)\s*\|\s*(https?:\/\/[^|]+?)\s*\|/.exec(line);
    if (m && m[1] !== '名称' && !m[1].startsWith('---')) names.add(m[1]);
  }
  return { names, found: true };
}

// 白名单里有些名字带后缀(如「OpenAI News」),而产物里写「OpenAI」也算命中
function inWhitelist(name, names) {
  if (names.has(name)) return true;
  for (const w of names) {
    if (w.includes(name) || name.includes(w)) {
      // 只接受「一方是另一方子串」这种明确包含,避免「36氪」误配「极客公园」之类
      if (w.length >= 3 && name.length >= 3) return true;
    }
  }
  return false;
}

// ---------- 核心校验 ----------
function checkHtml(html, names) {
  const issues = [];
  const articles = [...html.matchAll(/<article\b([^>]*)>/gi)].map((m) => m[1]);
  const isFullDoc = /<!DOCTYPE html>/i.test(html);

  let s1 = 0, s2 = 0;

  for (const [i, attrs] of articles.entries()) {
    const tier = /data-source-tier="([^"]*)"/.exec(attrs)?.[1];
    const url = /data-source-url="([^"]*)"/.exec(attrs)?.[1];
    const name = /data-source-name="([^"]*)"/.exec(attrs)?.[1];
    const layer = /data-source-layer="([^"]*)"/.exec(attrs)?.[1];
    const tag = `#${i + 1} ${name || '(无信源名)'}`;

    if (!tier) issues.push(`${tag} 缺 data-source-tier`);
    else if (tier === 'S1') {
      s1++;
      if (!['A', 'B'].includes(layer)) issues.push(`${tag} S1 的 data-source-layer 必须是 A 或 B(得到 ${layer ?? '缺失'})`);
      if (name && names.size && !inWhitelist(name, names)) issues.push(`${tag} S1 的信源名不在白名单里 —— 杜撰信源名?`);
      if (name && /undefined|null|NaN/i.test(name)) issues.push(`${tag} 信源名是 ${name} —— 生成脚本里字段名写错了`);
    } else if (tier === 'S2') {
      s2++;
      if (layer && layer !== '—') issues.push(`${tag} S2 的 data-source-layer 必须是 —(得到 ${layer})`);
    } else {
      issues.push(`${tag} data-source-tier 非法: ${tier}`);
    }

    if (!url) issues.push(`${tag} 缺 data-source-url`);
    else if (!/^https?:\/\/\S/.test(url)) issues.push(`${tag} URL 非法: ${url}`);
  }

  // 来源行(条目内下挂的来源列表)也必须有层级标识
  const srcRows = [...html.matchAll(/<li\b([^>]*)>/gi)].map((m) => m[1]);
  let typed = 0;
  for (const attrs of srcRows) {
    const t = /data-source-tier="([^"]*)"/.exec(attrs)?.[1];
    if (t === 'S1' || t === 'S2') typed++;
  }

  if (isFullDoc) {
    const opened = (html.match(/<article\b/gi) || []).length;
    const closed = (html.match(/<\/article>/gi) || []).length;
    if (opened !== closed) issues.push(`<article> 开合不匹配: ${opened} 开 / ${closed} 合`);
    if (articles.length === 0) issues.push('文档里没有任何 <article> 条目');
    if (!/来源构成|S1\s*共\s*\d+|白名单构成/.test(html)) issues.push('缺页面级来源构成声明');
  }

  return { issues, s1, s2, total: articles.length, typedRows: typed, totalRows: srcRows.length, isFullDoc };
}

// ---------- 自检:用规范自己的正例与反例验证校验器 ----------
function extractHtmlBlocks(md) {
  const out = [];
  const re = /```html\r?\n([\s\S]*?)```/g;
  let m, prevEnd = 0;
  while ((m = re.exec(md)) !== null) {
    const between = md.slice(prevEnd, m.index);
    const tail = between.split('\n').filter((l) => l.trim()).slice(-1).join('\n');
    out.push({ html: m[1], isViolation: /❌/.test(tail) });
    prevEnd = m.index + m[0].length;
  }
  return out;
}

function selftest(names) {
  const tplPath = path.join(SKILL_DIR, 'references', 'output-template.md');
  if (!fs.existsSync(tplPath)) {
    console.log('找不到 references/output-template.md,无法自检');
    return 1;
  }
  const blocks = extractHtmlBlocks(fs.readFileSync(tplPath, 'utf8'));
  let fail = 0, checked = 0;

  for (const [i, b] of blocks.entries()) {
    checked++;
    const r = checkHtml(b.html, names);
    if (b.isViolation) {
      // 反例必须被检出问题 —— 否则说明校验器漏了这类违规
      if (r.issues.length === 0) {
        fail++;
        console.log(`FAIL  output-template.md [块${i + 1}·反例] — 反例竟通过了校验`);
      } else {
        console.log(`PASS  output-template.md [块${i + 1}·反例] — 已检出 ${r.issues.length} 处问题`);
      }
    } else {
      if (r.issues.length) {
        fail++;
        console.log(`FAIL  output-template.md [块${i + 1}] — ${r.issues.length} 处问题`);
        r.issues.forEach((x) => console.log(`        · ${x}`));
      } else {
        console.log(`PASS  output-template.md [块${i + 1}] — ${r.total} 条目,标识可解析`);
      }
    }
  }
  console.log(`\n自检 ${checked} 个示例块 · ${fail === 0 ? '校验器工作正常' : fail + ' 处异常'}`);
  return fail;
}

// ---------- 入口 ----------
const args = process.argv.slice(2);
const { names, found } = loadWhitelist();

if (!found) {
  console.log('⚠️ 找不到 references/sources.md —— 将跳过「S1 信源名必须在白名单」这一项检查');
}

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log('用法:');
  console.log('  node scripts/validate.mjs <html文件>   校验一份产物');
  console.log('  node scripts/validate.mjs --selftest    自检(用规范自己的正例/反例验证校验器)');
  process.exit(0);
}

if (args[0] === '--selftest') {
  process.exit(selftest(names));
}

const file = path.resolve(process.cwd(), args[0]);
if (!fs.existsSync(file)) {
  console.log(`找不到文件: ${file}`);
  process.exit(1);
}

const html = fs.readFileSync(file, 'utf8');
const r = checkHtml(html, names);

console.log(`文件: ${file}`);
console.log(`条目: ${r.total}  (S1 ${r.s1} · S2 ${r.s2})`);
console.log(`带层级的来源行: ${r.typedRows} / ${r.totalRows}`);
console.log('');

if (r.issues.length) {
  console.log(`❌ ${r.issues.length} 处问题:`);
  r.issues.forEach((x) => console.log(`   · ${x}`));
  process.exit(1);
} else {
  console.log('✅ 通过：层级标识完整、S1 信源名均在白名单内、URL 齐全、声明区齐备');
  if (r.s2 === 0) console.log('ℹ️ 本页没有 S2 条目。若是纯官方发布事件，记得标注「无 S2 交叉验证」，不要硬凑。');
  process.exit(0);
}
