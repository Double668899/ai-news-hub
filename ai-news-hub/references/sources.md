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
| **原创率** | B 层专有。2026-10-28 实测：最近 15 条里该媒体**自己产生**的信息占比 |
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

## 判定方法（2026-10-28 实测）

对每个源，抓**最近 15 条**（feed 不足则取全部），逐条读标题与摘要——部分源进一步读到正文段落——
判断每条内容是**该媒体自己产生的**，还是**别人的内容被翻译/编译/聚合过来**。

**进 B 层要同时满足两个条件：**

1. **原创占比 ≥ 60%** —— 该媒体自己产生的信息的比例
2. **体裁是新闻采编 / 时事分析** —— 教程、榜单、链接摘要不算

**外加一条白名单前提**：凡是**需要 agent 逐条判断才可靠**的源，都不进白名单 —— 那正是 S2 该干的活。

> ⚠️ 上表所有 B 层的「原创率」都是实测值，不是印象判断。

## B1 · 海外原创媒体（19）

| 名称 | URL | 类型 | 权威 | 状态 | 频率 | 原创率 | 备注 |
|---|---|---|---|---|---|---|---|
| The Verge AI | https://www.theverge.com/rss/ai-artificial-intelligence/index.xml | rss | 4 | ok | daily | 100% | feed 仅 10 条，全部署名记者，含独家与现场采写 |
| Ars Technica AI | https://arstechnica.com/ai/feed/ | rss | 4 | ok | daily | 80% | 3/15 是授权转载 FT；AI feed 混入非 AI 题材，选题纯度低 |
| Ars Technica Technology Lab | https://feeds.arstechnica.com/arstechnica/technology-lab | rss | 4 | ok | daily | 100% | 自采安全漏洞追踪、自办问卷调研 |
| Ars Technica 全站 | https://feeds.arstechnica.com/arstechnica/index | rss | 3 | ok | daily | 100% | 与 Ars AI feed 重合 3/15，**二选一** |
| WIRED AI | https://www.wired.com/feed/tag/ai/latest/rss | rss | 4 | ok | daily | 100% | feed 仅 10 条，全部署名 WIRED 记者 |
| The Decoder | https://the-decoder.com/feed/ | rss | 3 | ok | daily | 100% | 有「appeared first on The Decoder」首发标记；4/10 属公告改写短讯 |
| TechCrunch AI | https://techcrunch.com/category/artificial-intelligence/feed/ | rss | 4 | ok | daily | 100% | 多条 Exclusive，自采融资/诉讼/本土信源 |
| TechCrunch 全站 | https://techcrunch.com/feed/ | rss | 3 | ok | daily | 100% | 与 TechCrunch AI feed 重合 **9/15**，**二选一** |
| CNBC Tech | https://www.cnbc.com/id/19854910/device/rss/rss.html | rss | 4 | ok | daily | — | ⚠️ **修正**：原用的 id 20910258 实为 Economy 频道（零 AI）；19854910 = Tech，前 15 条中 8-9 条为 AI |
| CNBC Business | https://www.cnbc.com/id/10001147/device/rss/rss.html | rss | 4 | ok | daily | 100% | 公司/行业/诉讼；与 Tech 频道标题交集为 0 |
| 404 Media | https://www.404media.co/rss/ | rss | 4 | ok | daily | 93% | 泄露文件/泄露录音/监管整改闭环，独家信源密度最高 |
| AI Business | https://aibusiness.com/rss.xml | rss | 3 | ok | weekly | 80% | 全部条目署名编辑，分析型为主；3 条为厂商公告改写 |
| Ben's Bites | https://www.bensbites.com/feed/ | rss | 3 | ok | daily | 100% | newsletter 但正文是作者一手内容（自建工具、DevDay 现场） |
| Latent Space | https://www.latent.space/feed | rss | 4 | retry | weekly | 100% | 播客逐字稿 + 原创长文；**本机需走代理读取** |
| Interconnects | https://www.interconnects.ai/feed | rss | 4 | ok | weekly | 100% | 第一人称原创分析，自建开源模型与许可证追踪表 |
| One Useful Thing | https://www.oneusefulthing.org/feed | rss | 4 | ok | weekly | 100% | 原创随笔，含本人早期实测与图表 |
| Import AI (Jack Clark) | https://importai.substack.com/feed | rss | 4 | retry | weekly | 100% | 逐篇拆解 8-13 篇论文 + 本人演讲稿；**本机需走代理读取** |
| Epoch AI | https://epochai.substack.com/feed | rss | 4 | retry | weekly | 100% | 自有研究报告与数据洞察；**本机需走代理读取** |
| AlphaSignal | https://alphasignalai.substack.com/feed | rss | 4 | retry | weekly | 100% | 自建防作弊编码基准实测；**本机需走代理读取** |

## B2 · 国内原创媒体（8）

| 名称 | URL | 类型 | 权威 | 状态 | 频率 | 原创率 | 备注 |
|---|---|---|---|---|---|---|---|
| 钛媒体 TMTPost | https://www.tmtpost.com/feed | rss | 4 | ok | daily | 87% | 投稿制原创专栏为主（表外表里/锦缎等）；混有「来自海外」英文翻译与品牌推广稿 |
| 财联社 | https://www.cls.cn/ | html | 4 | agent | daily | 87% | 电报为自采快讯（带自己记者署名），**仅快讯无深度**；主站被 WAF / 接口签名挡住，需走 RSSHub 镜像 |
| 量子位 QbitAI | https://www.qbitai.com/feed | rss | 4 | ok | daily | 75% | 记者署名 + 现场报道 + 一手实测；约 1/4 为企业公关与会议稿，信噪比打折 |
| 爱范儿 ifanr | https://www.ifanr.com/feed | rss | 3 | ok | daily | 80% | 大量首发体验与拆解，署名作者明确；**必须 GET**，HEAD 返回 403 |
| 少数派 | https://sspai.com/feed | rss | 3 | ok | daily | 80% | 自有评测/教程/体验；含派早报与社区速递 |
| 证券时报 | https://www.stcn.com/ | html | 4 | agent | daily | 80% | 逐篇详情页带「来源」字段，12/15 为自采；无 RSS，需先抓首页列表再逐篇读 |
| 极客公园 GeekPark | https://www.geekpark.net/rss | rss | 3 | ok | daily | 67% | 深度解读 + 本土产业稿，带作者与编辑署名；首页 403，RSS 可通 |
| 36氪 | https://36kr.com/ | html | 4 | agent | daily | 60% | 快讯频道卡线通过（自采 9/15）；全站被火山引擎 WAF 拦截，需走 RSSHub 镜像 |

---

# 已出局（C 层）

**判定标准**：不产原始信息，或体裁不是新闻采编，或需要逐条筛才可靠。
命中这些源时，一律按 **S2** 处理，并在输出里标明「未担保」。

## 聚合站 / RSS 自动聚合（9）

| 源 | 实测原创率 | 说明 |
|---|---|---|
| AIHOT 精选 JSON / Agent Markdown / RSS / 热点榜 / 日报 | 0% | 好的**发现雷达**，但给的是二手筛选结果，命中按 S2 |
| RadarAI | 0% | 频道标题自称「聚合」；作者栏直指爱范儿等外部作者，链接跳向 bestblogs.dev / aihot.news |
| BestBlogs.dev | 0% | 100 条博客文章 + AI 生成的一句话摘要，作者栏是原博客作者，链接为站内镜像页 |
| PixelsTech AI | 0% | 「curated daily」，条目全是英文他站原文，链接指向站内 `/feed/link/*` 跳转聚合页 |
| 每日黎明 DailyDawn | 0% | 素材来自 GitHub Trending 星标数 / HN 评论 / Product Hunt 热度，再由 AI 生成解读 |

## 需逐条判断 / 时段敏感（2）

| 源 | 实测原创率 | 出局原因 |
|---|---|---|
| 澎湃新闻 | 40% | 站点**自带官方 `trackOriginality` 标记**（见 source-integrity），实测原创 6/15 —— 原创的是署名记者稿与首席评论，其余 9 条全是人民日报 / 央视网 / 新华网 / 央视军事 / 新华社客户端转载；时政频道（中国政库）转载率更高 |
| 华尔街见闻 | 20%（扩窗到最近 30 条为 33–43%） | 最近 15 条里 12 条明确标注外部来源（据彭博 ×2 / 据华尔街日报 / 据 The Information / 新华社 / Anthropic 官网 / 摩根士丹利 / 摩根大通 / 德银研报 / 希捷电话会英文记录）；原创只有 2 条 A股/港股行情快讯 + 1 条本土融资信源。扩样后原创率仍 < 60%，且结论对取样时段高度敏感 |

## 转载 / 编译型（13）

| 源 | 实测原创率 | 出局原因 |
|---|---|---|
| 新智元 | 0% | 篇篇附外媒/论文「参考资料」，是中文重写 |
| IT之家 | 0% | RSS 是纯快讯流，每条注明「据路透社/据科创板日报」；站内原创深度文不进此 feed |
| 博客园新闻 | 0% | 他站全文聚合，逐条注明来源，自身零采编 |
| 稀土掘金 | 0% | 个人开发者 UGC，社区内容聚合 |
| InfoQ 中文 | 13% | 主体是官方公告编译 + 译自自家英文站，自采仅 13% |
| Techmeme | 0% | 纯聚合器，标题自带外媒署名与 `Source:` 前缀 |
| The Rundown AI | 20% | 12/15 是外部新闻转述，常明示外部来源 |
| Last Week in AI | 0% | newsletter 连一句评论都没有，纯链接 + 原文摘录 |
| MarkTechPost | 20% | 厂商发布稿改写，基准分全是 self-reported，无独立测试 |
| The Sequence | 40% | Radar/Knowledge/Robotics 栏目是链接合集与论文摘要 |
| 雷峰网 | 40% | 现场/独家/论文解读是原创，但通稿与官方发布复述接近一半 |
| KDnuggets | 70% | 原创占比够，但体裁是教程/榜单/SEO 内容，非新闻采编 |
| MIT Technology Review AI | 30% | AI feed 的 10 条里 7 条是厂商投放（正文自带「not written by MIT Technology Review's editorial staff」），必须逐条筛 |

---

# 维护

- **状态字段基于 2026-10-28 本机实测**。网络环境不同结果会变，`retry` 不等于已死。
  **`status` 是快照，不是永久结论** —— 境外站超时、Substack 系劫持都是网络问题，不是源的问题；
  换环境结论可能翻转。
- **B 层的「原创率」是抽样实测值**（每个源 10-20 条），会随时间漂移。半年后建议重跑一次判定。
- 信源死了标 `stale`，**从表里删掉**——但先确认是不是入口改版（优先找新入口，而不是直接弃用）。
- 新增信源必须回答：它**原创产出**信息吗？体裁是新闻采编吗？走 A 层还是 B 层？
- **同一家媒体的多个 feed 不要同时订阅**（TechCrunch / Ars Technica 实测重合 3-9 条），否则会重复计权。
- 信源规模变化时，同步更新 [`topic-map.md`](topic-map.md) 的主题分组。
