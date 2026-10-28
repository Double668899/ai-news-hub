# ai-news-hub

> **不教 AI 怎么爬。只担保「抓什么」,并强制「来源怎么标」。**

一个给 AI Agent 用的 **信源白名单 + 来源分层披露规范**。

它解决的是一个具体的信任问题:当 Agent 给你一份「今天的 AI 新闻」,你分不清哪条来自官方发布、
哪条来自媒体转述、哪条是模型自己搜来的二手信息。这个 skill 把这件事变成可核查的结构。

---

## 它做什么

产出一份**可直接打开的 HTML 简报**,每条信息都带来源层级标识:

```html
<article data-source-tier="S1" data-source-layer="A"
         data-source-name="OpenAI" data-source-url="https://openai.com/news/...">
  <h2>标题</h2>
  <p>摘要</p>
</article>

<article data-source-tier="S2" data-source-kind="repost"
         data-source-name="example.com" data-source-url="https://example.com/...">
  <h2>标题</h2>
</article>
```

| 标记 | 含义 | 义务 |
|---|---|---|
| **S1** | 命中白名单(A 层一手 / B 层原创媒体) | 信源名 + 原始 URL + 层标 |
| **S2** | 模型自主检索、白名单未担保 | URL + 显式标注未经担保 |

**S2 不是被容忍的例外,是应当主动补充的来源。** 每条话题 S1 ≥ 1、S2 ≥ 1(交叉验证)。
白名单**不是围栏** —— Agent 可以检索任意范围,越界不违规,但必须诚实标注。

---

## 它明确不做什么

| 不做 | 为什么 |
|---|---|
| ❌ 不提供抓取脚本作为主路径 | 搜索与爬取是各家 Agent 厂商自己在优化的事,不该由一个 skill 重复造轮子 |
| ❌ 不做搜索引擎 / 爬虫 / MCP server / 代理池 | 同上 |
| ❌ 不限制 Agent 的抓取范围 | 白名单是可信地板,不是搜索上限 |
| ❌ 不依赖付费 API、不托管服务、不要 API Key | 零部署、零 Key 是硬要求 |
| ❌ 不规定 HTML 长什么样 | 结构与样式由模型自己决定,本 skill 只规定**语义** |
| ❌ 不担保内容正确性 | 只担保**信源身份与一手性**,不替内容背书 |

---

## 安装

把 `ai-news-hub/` 整个目录放进你的 Agent 读取的 skills 目录:

| Agent | 路径 |
|---|---|
| Mavis | `~/.minimax/skills/ai-news-hub/` |
| Claude Code | `~/.claude/skills/ai-news-hub/` |
| Codex / Gemini CLI / Copilot / OpenCode | `~/.agents/skills/ai-news-hub/` |

**零依赖。** 没有 npm 包,没有 `npm install`,没有 Node.js 也照样能用 ——
skill 里的工作流是 agent 路径,用 Agent 自带的联网能力即可完成。

---

## 预期效果与三个前提

这套 skill 的**知识资产**（87 条担保信源 + 实测原创率 + 输出规范）是环境无关的，谁下载都一样。
但**实际效果**取决于三件事，缺一件就打折：

| 前提 | 不满足会怎样 |
|---|---|
| ① 你的 Agent 有联网能力（`web_fetch` / 浏览器 / `fetch`） | 纯离线 Agent 拿不到任何东西 —— 这是 skill 成立的前提，不是 bug |
| ② 你的网络能到那些源 | 白名单 87 条里：**45 条**开箱即抓（标准 RSS/Atom）、**18 条**必须解析 HTML 列表页、**24 条**在部分网络下测不通（境外站超时、Substack 系 DNS 被劫持），换环境可能就通 |
| ③ 你的 Agent 遵守 S1/S2 标注 | 标注是**软约束**，没有代码能强制它。agent 忘了标 S2，这份简报的信任价值就没了 |

**S2 的质量是这个架构最大的变量。** S1 是确定的（信源身份与一手性已实测担保），S2 完全取决于
Agent 自己的搜索能力和判断力。「每条话题 S2 ≥ 1」能逼它做交叉验证——这是提升质量的地方，
也可能逼它在弱覆盖领域硬凑低质量补充。

**原创率是快照值**，判定于 2026-10-28，会随时间漂移。建议半年后重跑一次判定（方法见 `references/sources.md`）。

---

## 白名单:87 条担保信源

完整清单见 [`ai-news-hub/references/sources.md`](ai-news-hub/references/sources.md),实测于 2026-10-28。

**A 层 · 担保一手(60 条)** —— 信息由该源原创产生,发布即原始事实

- **海外厂商官方(20)**:OpenAI、Google DeepMind、Google AI Blog、Google Research、Anthropic(3)、Microsoft Research / AI Blog、NVIDIA Blog / 新闻室、Meta 工程博客、GitHub Blog、Apple ML Research、AWS ML Blog、Amazon Science、Mistral、xAI、Hugging Face
- **国内厂商官方(14)**:Qwen、DeepSeek、智谱、字节 Seed、腾讯混元、百度文心、MiniMax、Kimi、华为昇腾、智源 BAAI、上海 AI Lab、ModelScope
- **政策与监管(2)**:白宫 News、欧盟委员会 Press Corner
- **研究与论文(9)**:arXiv cs.AI/LG/CL/RO/CV、MIT News AI、BAIR、Stanford HAI、AllenAI
- **开源仓库(15)**:GitHub Trending 日/周榜、GitHub Search API、vllm、ollama、langchain、transformers、llama.cpp、open-webui、ComfyUI、sglang、dify、lobe-chat、codex、claude-code

**B 层 · 担保原创媒体(27 条)** —— 有原创采编能力,不是转载聚合

- **海外(19)**:The Verge AI、Ars Technica(3)、WIRED AI、The Decoder、TechCrunch(2)、CNBC(2)、404 Media、AI Business、Ben's Bites、Latent Space、Interconnects、One Useful Thing、Import AI、Epoch AI、AlphaSignal
- **国内(8)**:钛媒体、财联社、量子位、爱范儿、少数派、证券时报、极客公园、36氪

**已出局(24 条)** —— 不产原始信息、或体裁不是新闻采编、或需要逐条筛才可靠。命中时一律按 **S2** 处理:

| 类别 | 源 |
|---|---|
| 聚合站 / 自动聚合(9) | AIHOT 系列、RadarAI、PixelsTech AI、BestBlogs.dev、每日黎明 DailyDawn |
| 转载 / 编译型(13) | MarkTechPost、Techmeme、The Rundown AI、Last Week in AI、新智元、IT之家、博客园新闻、稀土掘金、InfoQ 中文、The Sequence、雷峰网、KDnuggets、MIT Technology Review AI |
| 需逐条判断 / 时段敏感(2) | 澎湃新闻、华尔街见闻 |

### 判定「一手」的标准

不是按「官方 vs 媒体」划线,而是看**是否产出了自己的原始信息**:

> 原创产生(官方公告、IR 披露、原始论文、官方仓库、原创报道)→ A 或 B 层
> 转载 / 聚合 / 转述别人的 → C 层,出局

### B 层的判定是逐条实测出来的,不是凭印象

2026-10-28 对全部 46 个媒体源做了逐条审计:每个源抓最近 15 条(不足则取全部),逐条读标题与摘要,部分源进一步读到正文段落,判断每条内容是该媒体自己产生的还是转述别人的。

**进 B 层要同时满足两个条件:**

1. **原创占比 ≥ 60%**
2. **体裁是新闻采编 / 时事分析**(教程、榜单、链接摘要不算)

**外加一条白名单前提**:凡是需要 agent 逐条判断才可靠的源,都不进白名单 —— 那正是 S2 该干的活。

审计修正了四个凭印象会判断错的地方:

| 源 | 凭印象的判断 | 实测结果 |
|---|---|---|
| InfoQ 中文 | 原创媒体 | **13%** —— 主体是官方公告编译 + 译自自家英文站 |
| 澎湃新闻 | 权威财经媒体 | **40%** —— 原创是署名记者稿,其余全是人民日报/央视网/新华网转载 |
| 华尔街见闻 | 原创财经媒体 | **20%** —— 12/15 明确标注「据彭博/据 The Information/据新华社」 |
| Ben's Bites / AlphaSignal | 链接摘要 newsletter | **100%** —— 正文是作者一手内容 |

---

## 主题 → 信源映射

按主题取源,不要扫全表(87 条全塞进上下文既贵又淹掉重点)。
见 [`ai-news-hub/references/topic-map.md`](ai-news-hub/references/topic-map.md),13 个主题组,并附**覆盖强度自查表**与**本期未覆盖清单**。

**弱覆盖主题(具身智能、出海全球化)和无覆盖主题(中文开发者社区)必须主动补 S2** ——
S2 在这些领域是主要来源,不是补充。

---

## 输出规范

见 [`ai-news-hub/references/output-template.md`](ai-news-hub/references/output-template.md)。

**三条硬约束**:

1. 每条信息有**机器可读**的层级标识(`data-source-tier` 等),且人类也能一眼看出
2. 每个来源的 **URL 必须在文档里**
3. 页面顶部有**来源构成声明**(S1/S2 各几条、S1 内 A/B 分布)

文件里附了**四种违规反例**:S2 混进正文不标识、缺 URL、标识不可解析、无来源声明。

**去重与归因**:同事件多源 → 合并成一条、S1 为主干、标「多源确认」、下挂全部来源及各自层级;
S1 与 S2 冲突 → 两者都保留并标出冲突,**不替读者裁决**。

---

## 信源真实性判读

见 [`ai-news-hub/references/source-integrity.md`](ai-news-hub/references/source-integrity.md)。

**只看状态码会把假源当好源。** 已实测记录的坑:

- **假 200**:`ai-bot.cn/feed` 返回「Feed关闭」;`36kr.com/feed` 的 content-type 是 `text/html`;
  `wallstreetcn.com/rss.xml` 是 S3 `NoSuchKey` 错误页(真 feed 在 `dedicated.wallstreetcn.com/rss.xml`)
- **被劫持域名**:`aisourcehub.info` 跳博彩站,`deeptech.com` 被 Canva 接管
- **只用 GET 不用 HEAD**:`ifanr.com` HEAD 403 / GET 200;`huxiu.com` HEAD 405
- **content-type 会撒谎**:必须解析 XML 根元素,不能只看 header
- **302 会改内容**:`zdnet.com` 的 AI 专题 feed 跳到全站 `/rss/news/`
- **限流**:GitHub `releases.atom` 单发正常、连发必挂;AIHOT 单 IP 约 60 次/分钟返回 429
- **停更判定按源频率**:日更 72h / 周更 10 天 / 月更 45 天,统一用 48h 会误杀低频源
- **超时不等于下线**:境外站大面积超时是网络策略问题,标「本次不可达」而非「已失效」
- **Windows 特例**:schannel 证书吊销检查离线会让大量境外站误报失败,curl 需加 `--ssl-no-revoke`

---

## 目录结构

```
ai-news-hub-repo/
├── README.md                        # 本文件
├── LICENSE                          # MIT
├── NOTICE                           # 第三方信源与许可边界
├── LANDSCAPE.md                     # 调研背景:124 个同类站 / 53 个开源项目的扫描结论
├── ai-news-hub/                     # ← 这才是 skill 本体,整个目录拷进 skills 目录
│   ├── SKILL.md                     # 定位、工作流、输出规范、边界
│   └── references/
│       ├── sources.md               # ★ 核心资产:87 条 A/B 层担保信源 + 元数据 + 实测状态 + 实测原创率
│       ├── topic-map.md             # 主题 → 信源组映射 + 覆盖强度自查
│       ├── output-template.md       # HTML 输出模板 + S1/S2 规范 + 四种违规反例
│       └── source-integrity.md      # 信源真实性判读规则与已知坏源
└── tools/                           # ← 维护者区,不属于 skill 运行时
    ├── fetch.mjs                    # 信源体检脚本(零依赖 Node.js)
    └── sources.tsv                  # 体检清单(111 条,含已出局 C 层,用于监控复活)
```

### tools/ 是干什么的

`tools/` **不参与 skill 的使用**。它的唯一作用是维护信源白名单的实测状态:
批量体检 → 发现停更/改版/限流 → 回写状态字段。

```bash
node tools/fetch.mjs --check                     # 信源体检,不改数据
node tools/fetch.mjs --window 24h --out ./out    # 抓取并生成日报(调试用)
node tools/fetch.mjs --tier T1,T2 --limit 20     # 限定档位与条数
```

---

## 致谢与许可

本项目 MIT 许可(见 [LICENSE](LICENSE))。

信源清单里的 AIHOT 接口由 [数字生命卡兹克](https://github.com/KKKKhazix) 提供
([aihot.news](https://aihot.news),MIT 开源)。
AIHOT 的**服务与数据**适用其公开使用规则:个人非商业、公益非商业、组织内部使用免费;
面向外部的商业产品、收费服务、数据转售、公开镜像或批量再分发须事先取得书面授权。
AIHOT 已在本项目白名单中出局(属 C 层聚合站),仅作为**发现雷达**保留在体检清单里。

第三方原文版权归原作者所有,本项目只是聚合与阅读索引。
详见 [NOTICE](NOTICE)。

---

## 一点说明

这个 skill 追求的是「**够用且不骗人**」,不是「信息最全」。

它会明确告诉你哪些是担保源、哪些是模型自采,哪些领域白名单没覆盖(该领域 S2 才是主要来源),
而不是给你一份看起来很满、实际混着陈旧条目和未标注二手信息的日报。

**把「不骗人」放在「信息全」前面,是因为一份日报的可信度取决于它的下限,不是它的上限。**
