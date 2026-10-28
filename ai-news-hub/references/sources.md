# AI 新闻信源白名单（A 层 + B 层）

**这份表是 skill 的核心资产。** 它定义「哪些信源我们担保」，不定义「怎么抓」。

## 字段说明

| 字段 | 含义 |
|---|---|
| **层** | `A` = 担保一手（原始产出）/ `B` = 担保原创媒体（有原创采编能力） |
| **类型** | `rss` / `atom` / `json` / `md` / `sitemap` / `html` — 首选抓取入口形态 |
| **权威度** | 1-5。5=官方发布即事实；4=机构/一线采编；3=二手编译或垂直媒体；2=一般 |
| **状态** | `ok` = 2026-10-28 本机实测通过且结构校验成功 / `retry` = 本机网络受限或被拦，需在目标环境复测（**不代表站点已死**） / `agent` = 只能由 agent 联网工具解析 HTML，脚本不处理 |
| **频率** | `daily` / `weekly` / `monthly` — 决定停更判定阈值 |
| **备注** | 抓取陷阱、入口变通、特殊定位 |

## 怎么用这张表

1. 先看 [`topic-map.md`](topic-map.md) 定位到相关主题组，**不要通读全表**。
2. 只取 S1 = 本表命中的源（A 或 B 层）。
3. 白名单覆盖不到的子领域，**主动**用自身搜索能力补 S2，并按 [`output-template.md`](output-template.md) 标注。
4. 抓取前先读 [`source-integrity.md`](source-integrity.md) —— 有 20 个已知会骗人的源。

> 白名单**不是围栏**。越界不违规，但必须标注为 S2。

---

# A 层 · 担保一手

信息由该源**原创产生**，发布即原始事实。

## A1 · 海外厂商官方（20）

| 名称 | URL | 类型 | 权威 | 状态 | 频率 | 备注 |
|---|---|---|---|---|---|---|
| OpenAI News | https://openai.com/news/rss.xml | rss | 5 | ok | daily | |
| Google DeepMind Blog | https://deepmind.google/blog/rss.xml | rss | 5 | ok | daily | |
| Google AI Blog | https://blog.google/technology/ai/rss/ | rss | 5 | ok | daily | |
| Google Research Blog | https://research.google/blog/rss/ | rss | 5 | retry | weekly | 部分网络环境 DNS 受影响 |
| Anthropic News（sitemap） | https://www.anthropic.com/sitemap.xml | sitemap | 5 | ok | daily | 无 RSS，靠 sitemap + lastmod |
| Anthropic News 列表页 | https://www.anthropic.com/news | html | 5 | agent | daily | |
| Anthropic Engineering | https://www.anthropic.com/engineering | html | 5 | agent | daily | |
| Microsoft Research | https://www.microsoft.com/en-us/research/feed/ | rss | 5 | ok | monthly | |
| Microsoft AI Blog | https://blogs.microsoft.com/ai/feed/ | rss | 5 | retry | daily | 无 UA 会 403 |
| NVIDIA Blog | https://blogs.nvidia.com/feed/ | rss | 5 | ok | daily | |
| NVIDIA 新闻室 | https://nvidianews.nvidia.com/releases.xml | rss | 5 | ok | daily | 财报/合作/资本信号 |
| Meta 工程博客 | https://engineering.fb.com/feed/ | rss | 5 | ok | daily | |
| GitHub Blog AI & ML | https://github.blog/ai-and-ml/feed/ | rss | 5 | ok | weekly | |
| Apple ML Research | https://machinelearning.apple.com/rss.xml | rss | 5 | ok | monthly | |
| AWS ML Blog | https://aws.amazon.com/blogs/machine-learning/feed/ | rss | 5 | retry | weekly | |
| Amazon Science | https://www.amazon.science/blog/feed/ | rss | 5 | retry | weekly | |
| Mistral AI News | https://mistral.ai/news/rss | rss | 5 | retry | weekly | |
| xAI News | https://x.ai/news/rss.xml | rss | 5 | retry | weekly | |
| Hugging Face Blog | https://huggingface.co/blog/feed.xml | rss | 5 | retry | daily | |
| Hugging Face Daily Papers | https://huggingface.co/papers/feed | rss | 4 | retry | daily | |

## A2 · 国内厂商官方（14）

国内厂商官网普遍**没有 RSS**，绝大多数只能由 agent 解析 HTML 列表页。

| 名称 | URL | 类型 | 权威 | 状态 | 频率 | 备注 |
|---|---|---|---|---|---|---|
| Qwen 官方博客 | https://qwen.ai/blog | html | 5 | agent | daily | 当前主站 |
| 通义千问 Qwen Blog（旧） | https://qwenlm.github.io/blog/index.xml | rss | 5 | ok | monthly | **已迁站，内容停更在 2025-09** |
| DeepSeek 更新日志 | https://api-docs.deepseek.com/updates/ | html | 5 | agent | daily | |
| DeepSeek News | https://api-docs.deepseek.com/news/ | html | 5 | agent | daily | |
| 智谱 GLM | https://www.zhipuai.cn/news | html | 5 | agent | daily | |
| 字节 Seed | https://seed.bytedance.com/blog | html | 5 | agent | daily | |
| 腾讯混元 | https://hunyuan.tencent.com/ | html | 5 | agent | daily | |
| 百度文心 | https://wenxin.baidu.com/ | html | 5 | agent | daily | |
| MiniMax | https://www.minimaxi.com/news | html | 5 | agent | daily | |
| 月之暗面 Kimi | https://www.kimi.com/ | html | 5 | agent | daily | |
| 华为昇腾 | https://www.hiascend.com/ | html | 5 | agent | daily | |
| 智源 BAAI Hub | https://hub.baai.ac.cn/ | html | 4 | agent | daily | |
| 上海 AI Lab | https://www.shlab.org.cn/ | html | 4 | agent | daily | |
| ModelScope 魔搭 | https://www.modelscope.cn/ | html | 4 | agent | daily | 国产模型/数据集发布 |

## A3 · 政策与监管（2）

| 名称 | URL | 类型 | 权威 | 状态 | 频率 | 备注 |
|---|---|---|---|---|---|---|
| 白宫 News | https://www.whitehouse.gov/news/feed/ | rss | 5 | ok | daily | AI 行政令/监管原文 |
| 欧盟委员会 Press Corner | https://ec.europa.eu/commission/presscorner/api/rss?language=en | rss | 5 | ok | daily | AI Act 进展 |

## A4 · 研究机构与论文（9）

| 名称 | URL | 类型 | 权威 | 状态 | 频率 | 备注 |
|---|---|---|---|---|---|---|
| arXiv cs.AI | http://export.arxiv.org/rss/cs.AI | rss | 3 | ok | daily | 预印本，未评审 |
| arXiv cs.LG | http://export.arxiv.org/rss/cs.LG | rss | 3 | ok | daily | |
| arXiv cs.CL | http://export.arxiv.org/rss/cs.CL | rss | 3 | ok | daily | |
| arXiv cs.RO | http://export.arxiv.org/rss/cs.RO | rss | 3 | ok | daily | 具身智能 |
| arXiv cs.CV | http://export.arxiv.org/rss/cs.CV | rss | 3 | ok | daily | |
| MIT News AI | https://news.mit.edu/rss/topic/artificial-intelligence2 | rss | 4 | ok | daily | |
| BAIR | https://bair.berkeley.edu/blog/feed.xml | rss | 4 | ok | monthly | |
| Stanford HAI | https://hai.stanford.edu/news/rss.xml | rss | 4 | retry | weekly | |
| Allen Institute for AI | https://allenai.org/blog/rss.xml | rss | 4 | retry | weekly | |

## A5 · 开源仓库生态（15）

release notes 是**一手**（开发者自己写的变更记录）。

| 名称 | URL | 类型 | 权威 | 状态 | 频率 | 备注 |
|---|---|---|---|---|---|---|
| GitHub Trending 日榜 | https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml | rss | 3 | ok | daily | 需按 topic 过滤 |
| GitHub Trending 周榜 | https://mshibanami.github.io/GitHubTrendingRSS/weekly/all.xml | rss | 3 | ok | weekly | |
| GitHub 仓库搜索 API | https://api.github.com/search/repositories?q=stars:%3E100+topic:ai&sort=updated&per_page=30 | json | 3 | ok | daily | 匿名调用有速率限制 |
| vllm release | https://github.com/vllm-project/vllm/releases.atom | atom | 4 | ok | weekly | |
| ollama release | https://github.com/ollama/ollama/releases.atom | atom | 4 | ok | weekly | |
| langchain release | https://github.com/langchain-ai/langchain/releases.atom | atom | 4 | retry | weekly | GitHub 连发会限流 |
| transformers release | https://github.com/huggingface/transformers/releases.atom | atom | 4 | retry | weekly | |
| llama.cpp release | https://github.com/ggml-org/llama.cpp/releases.atom | atom | 4 | retry | weekly | |
| open-webui release | https://github.com/open-webui/open-webui/releases.atom | atom | 4 | retry | weekly | |
| ComfyUI release | https://github.com/comfyanonymous/ComfyUI/releases.atom | atom | 4 | retry | weekly | |
| sglang release | https://github.com/sgl-project/sglang/releases.atom | atom | 4 | retry | weekly | |
| dify release | https://github.com/langgenius/dify/releases.atom | atom | 4 | retry | weekly | |
| lobe-chat release | https://github.com/lobehub/lobe-chat/releases.atom | atom | 4 | retry | weekly | |
| openai/codex release | https://github.com/openai/codex/releases.atom | atom | 4 | retry | weekly | |
| claude-code release | https://github.com/anthropics/claude-code/releases.atom | atom | 4 | retry | weekly | |

---

# B 层 · 担保原创媒体

有**原创采编能力**的媒体 —— 报道内容是他们自己采写或原创分析，不是转载聚合。

## B1 · 海外原创媒体（19）

| 名称 | URL | 类型 | 权威 | 状态 | 频率 | 备注 |
|---|---|---|---|---|---|---|
| The Verge AI | https://www.theverge.com/rss/ai-artificial-intelligence/index.xml | rss | 4 | ok | daily | |
| Ars Technica AI | https://arstechnica.com/ai/feed/ | rss | 4 | ok | daily | |
| Ars Technica Technology Lab | https://feeds.arstechnica.com/arstechnica/technology-lab | rss | 4 | ok | daily | |
| Ars Technica 全站 | https://feeds.arstechnica.com/arstechnica/index | rss | 3 | ok | daily | 覆盖更广，需 topic 过滤 |
| MIT Technology Review AI | https://www.technologyreview.com/topic/artificial-intelligence/feed | rss | 4 | ok | daily | |
| WIRED AI | https://www.wired.com/feed/tag/ai/latest/rss | rss | 4 | ok | daily | |
| TechCrunch AI | https://techcrunch.com/category/artificial-intelligence/feed/ | rss | 4 | ok | daily | |
| TechCrunch 全站 | https://techcrunch.com/feed/ | rss | 3 | ok | daily | 融资/IPO/并购覆盖更全 |
| CNBC AI | https://www.cnbc.com/id/20910258/device/rss/rss.html | rss | 4 | ok | daily | 商业视角：融资/财报/产业链 |
| CNBC 财经 | https://www.cnbc.com/id/10001147/device/rss/rss.html | rss | 4 | ok | daily | 宏观背景对 AI 估值的影响 |
| 404 Media | https://www.404media.co/rss/ | rss | 4 | ok | daily | 平台监管与创作者经济 |
| AI Business | https://aibusiness.com/rss.xml | rss | 3 | ok | weekly | 垂直产业报 |
| The Decoder | https://the-decoder.com/feed/ | rss | 3 | ok | daily | |
| Epoch AI | https://epochai.substack.com/feed | rss | 4 | retry | weekly | 原创研究机构分析 |
| Import AI (Jack Clark) | https://importai.substack.com/feed | rss | 4 | retry | weekly | 本网络 DNS 被劫持 |
| The Sequence (Hugging Face) | https://thesequence.substack.com/feed | rss | 4 | retry | weekly | |
| Latent Space | https://www.latent.space/feed | rss | 4 | ok | weekly | 原创播客/分析 |
| Interconnects | https://www.interconnects.ai/feed | rss | 4 | ok | weekly | 原创模型分析 |
| One Useful Thing | https://www.oneusefulthing.org/feed | rss | 4 | ok | weekly | 原创工作流分析 |

## B2 · 国内原创媒体（13）

| 名称 | URL | 类型 | 权威 | 状态 | 频率 | 备注 |
|---|---|---|---|---|---|---|
| 量子位 QbitAI | https://www.qbitai.com/feed | rss | 4 | ok | daily | |
| 36氪 | https://36kr.com/ | html | 4 | agent | daily | 创投与公司动态，无 RSS |
| 钛媒体 TMTPost | https://www.tmtpost.com/feed | rss | 4 | ok | daily | |
| 极客公园 GeekPark | https://www.geekpark.net/rss | rss | 3 | ok | daily | 首页 403，RSS 可通 |
| 爱范儿 ifanr | https://www.ifanr.com/feed | rss | 3 | ok | daily | **必须 GET**，HEAD 返回 403 |
| 少数派 | https://sspai.com/feed | rss | 3 | ok | daily | |
| IT之家 | https://www.ithome.com/rss/ | rss | 3 | ok | daily | 快讯为主 |
| InfoQ 中文 | https://www.infoq.cn/feed | rss | 3 | ok | daily | 独家技术采访 |
| 雷峰网 | https://www.leiphone.com/feed | rss | 3 | ok | daily | |
| 华尔街见闻 | https://dedicated.wallstreetcn.com/rss.xml | rss | 4 | ok | daily | ⚠️ 主站 `wallstreetcn.com/rss.xml` 是 S3 报错页，**必须用 dedicated 域** |
| 财联社 | https://www.cls.cn/ | html | 4 | agent | daily | 快讯与政策，无 RSS |
| 证券时报 | https://www.stcn.com/ | html | 4 | agent | daily | A 股 AI 公司与产业链，无 RSS |
| 澎湃新闻 | https://www.thepaper.cn/ | html | 4 | agent | daily | 国内财经与政策口径，无 RSS |

---

# 已出局（C 层）

以下 19 个源**不在白名单内**。它们要么是聚合站、要么是转载/编译型媒体 —— 不产原始信息，命中时一律按 **S2** 处理。

| 类别 | 源 |
|---|---|
| 聚合站（5） | AIHOT 精选 JSON / Agent Markdown / RSS / 热点榜 / 日报 |
| 海外转载型（7） | MarkTechPost、KDnuggets、Techmeme、The Rundown AI、Ben's Bites、Last Week in AI、AlphaSignal |
| 国内转载型（3） | 新智元、博客园新闻、稀土掘金 |
| 榜单聚合（4） | RadarAI、PixelsTech AI、BestBlogs.dev、每日黎明 DailyDawn |

**出局理由**：这类源的内容全部来自别处，命中时无法回溯到原始出处，不构成「担保」。AIHOT 是好的**发现雷达**（单次请求顶几十个 feed），但它给的是二手筛选结果 —— 想要它就当 S2 用，并在输出里标明「来自聚合站，未回溯原始出处」。

---

# 维护

- **状态字段基于 2026-10-28 本机实测**。网络环境不同结果会变，`retry` 不等于已死。
- 信源死了标 `stale`，**从表里删掉**——但先确认是不是入口改版（优先找新入口，而不是直接弃用）。
- 新增信源必须回答：它**原创产出**信息吗？走 A 层还是 B 层？
- 信源规模变化时，同步更新 [`topic-map.md`](topic-map.md) 的主题分组。
