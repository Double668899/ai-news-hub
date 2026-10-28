# ai-news-hub

> 把"建一个 AI 热点站"这件事,变成任何人拿到就能跑的一份配方。

AIHOT 这类站点很牛 —— 盯 885 个信源、AI 打分精选、每天早上 8 点出日报。但复刻它的成本并不低:
Docker + PostgreSQL + Node.js 24 + 一个 OpenAI 兼容的模型 Key,而且纯 LLM 流水线的真实开销
在 AIHOT 仓库 issue #191 里有人实测过:**每天约 90 美元**。

这个 skill 是另一条路:**不建站,只给配方。**
把经过实测的 98 个信源、三档优先级、抓取步骤、去重排序规则写进一个 SKILL.md,
任何拿到它的智能体都能直接照着跑 —— **零部署、零 API Key、零服务器**。

---

## 它做什么

抓取 24 小时窗口内的 AI 行业动态,按「官方一手 > 聚合站 > 研究机构 > 媒体」排序,产出一份可直接用于选题的中文日报。

```
node scripts/fetch.mjs --window 24h --out ./ai-news-out
```

输出两个文件:

| 文件 | 内容 |
|---|---|
| `<日期>.jsonl` | 每行一条:title / link / summary / published / source / tier / group |
| `<日期>.md` | 按档位分组的 Markdown 日报 |

## 安装

把 `ai-news-hub/` 整个目录放进你的 Agent 读取的 skills 目录即可:

| Agent | 路径 |
|---|---|
| Mavis | `~/.minimax/skills/ai-news-hub/` |
| Claude Code | `~/.claude/skills/ai-news-hub/` |
| Codex / Gemini CLI / Copilot / OpenCode | `~/.agents/skills/ai-news-hub/` |

依赖:Node.js 18+(用到全局 `fetch`)。**没有 npm 依赖,不需要 `npm install`。**

没有 Node.js 的环境也能用 —— skill 里写了完整的 agent 路径,直接按信源表逐个请求即可。

## 信源覆盖

98 个信源,实测于 2026-10-28。完整清单见 [`ai-news-hub/references/sources.txt`](ai-news-hub/references/sources.txt)。

**第一优先:海外官方一手**

OpenAI、Google DeepMind、Google AI Blog、Microsoft Research、NVIDIA、Apple ML Research、GitHub Blog AI&ML、Anthropic(无 RSS,走 sitemap + lastmod)、Qwen、Mistral、xAI、Hugging Face、AWS ML Blog、Google Research、Microsoft AI Blog、Amazon Science……

**第二优先:国内一手与媒体**

通义千问(唯一实测可用的国内官方 RSS)、DeepSeek、智谱、字节 Seed、腾讯混元、百度文心、MiniMax、月之暗面、华为昇腾、智源、上海 AI Lab、ModelScope(以上走官方列表页),以及量子位、新智元、爱范儿、极客公园、钛媒体、雷峰网、少数派、IT 之家、InfoQ 中文、稀土掘金等(走 RSS)。

**第三优先:GitHub 生态**

Trending 日榜/周榜、GitHub Search API,以及 vllm、transformers、llama.cpp、ollama、open-webui、ComfyUI、sglang、dify、lobe-chat、codex、claude-code 等主仓的 `releases.atom`。

**兜底:AIHOT 官方接口**

AIHOT 提供了 28 个免密钥 REST 端点、7 个 RSS 和一个远程 MCP。全部匿名只读。
skill 把 `https://aihot.news/api/v1/agent/latest` 作为兜底路径 —— 它直接返回整理好的中文 Markdown,
一个请求顶几十个 feed,是所有源都不可用时的保命符。

## 设计上的几个取舍

**只做一手源。** 二手媒体放最后一位,不是为了贬低它们,是因为一手源没有编辑损耗和转述失真。

**国内厂商官网普遍没有 RSS。** DeepSeek、智谱、字节、腾讯、百度、华为全部实测无 feed。
所以国内档只能走 HTML 列表页由 agent 解析,这也是 `kind=html` 这一类存在的意义 —— 只靠 RSS 会漏掉国内一半的一手发布。

**每个源都要校验,不能只看状态码。** `ai-bot.cn/feed` 返回 200,正文却是 `<error><title>Feed关闭</title></error>`;
`36kr.com/feed` 返回 200 但 content-type 是 `text/html`;`every.to/feed`、`7min.ai/feed` 同类。
只看状态码会把报错页当新闻条目收进来。脚本内置了 XML 根元素校验。

**只用 GET,不用 HEAD。** `ifanr.com` HEAD 返回 403、GET 返回 200;`huxiu.com` HEAD 返回 405。
用 HEAD 校验会把可用源误杀。

**按域名限并发。** GitHub 的 `releases.atom` 单发正常、连发必挂。脚本对同一 hostname 限制 2 并发并留 400ms 间隔,
实测把 GitHub 档从 5/15 拉到 15/15。

**停更判定按源频率。** 日更源超 72 小时无更新才算停更,周更看 10 天,月更看 45 天。
统一用 48 小时会把 BAIR、One Useful Thing 这类低频源误报成停更。

**每源限流。** arXiv 一天能出几百篇论文,不设上限会把真正的新闻挤掉。默认每源最多 25 条。

## 目录结构

```
ai-news-hub/
├── SKILL.md                    # 主配方:输入、流程、输出约定、失败处理
├── references/
│   ├── sources.txt             # 信源表(机器可读,脚本读这个)
│   ├── rules.md                # 抓取/去重/排序规则、已知坏源、许可边界
│   └── landscape.md            # 全量调研背景:124 个同类站 / 53 个开源项目
└── scripts/
    └── fetch.mjs               # Node.js 零依赖抓取器
```

`fetch.mjs` 的命令行:

```bash
node scripts/fetch.mjs --check                  # 信源体检:状态码、条目数、最新时间、停更标记
node scripts/fetch.mjs --window 24h --out ./out  # 抓取并生成日报
node scripts/fetch.mjs --window 7d --tier GH     # 只看 GitHub 档,7 天窗口
node scripts/fetch.mjs --group overseas --limit 30
```

常用参数:`--tier T1,T2`、`--group overseas,china,github`、`--limit N`、`--per-source N`、
`--concurrency N`、`--timeout 毫秒`。

## 已知坑都在 rules.md 里

- **假 200**:返回 200 但内容不是 feed 的地址清单
- **被劫持域名**:`aisourcehub.info` 现在跳博彩站,`deeptech.com` 被 Canva 接管
- **停更名单**:Awesome AI 日报停更 4 个月、归藏 7 个月、DevURLs 4 个月
- **接口变更**:AIHOT 的 `/api/public/*` 将于 2026-10-31 停用,且 v1 字段变了
  (`source` 变成对象、`url` 挪到 `links.original`)
- **Windows 特例**:schannel 证书吊销检查离线会让大量境外站误报连接失败,curl 需加 `--ssl-no-revoke`

## 致谢与许可

本项目 MIT 许可。

信源清单里的 AIHOT 接口由 [数字生命卡兹克](https://github.com/KKKKhazix) 提供
([aihot.news](https://aihot.news),MIT 开源)。
AIHOT 的**服务与数据**适用其公开使用规则:个人非商业、公益非商业、组织内部使用免费;
面向外部的商业产品、收费服务、数据转售、公开镜像或批量再分发须事先取得书面授权。

第三方原文版权归原作者所有,本项目只是聚合与阅读索引。

## 一点说明

这个 skill 追求的是「**够用且不骗人**」,不是「信息最全」。
它会明确告诉你哪些源这次没抓到、哪些源可能停更,而不是给你一份看起来很满、实际混入陈旧条目的日报。
