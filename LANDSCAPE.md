---
description: AI 资讯聚合站全量调研背景(124 站 / 53 个开源项目)。查询时间 2026-10-28。信源配置以 sources.txt 为准。
verified_at: 2026-10-28
method: web_search + web_fetch + curl 实测状态码与 XML 根元素校验
---

# AI 资讯聚合站全量调研(背景资料)

> 这份是**调研背景**,不是执行配置。实际抓哪个源、什么优先级、以什么 URL 为准,
> 一律看 `references/sources.txt` 和 `references/rules.md`。
> 保留这份的原因是:信源会死、会改版、会停更,遇到问题时需要知道"同类还有哪些、谁不能用了、
> 当初为什么这么选"。AIHOT 仓库自带的 `industry/sources.json` 里,作者给每条信源标了
> T1/T1.5/T2 三级和轮询间隔,那套分级思路可以直接借鉴。

## 结论速览

| 类别 | 总数 | 可直接进抓取管道 |
|---|---|---|
| 中文站点 | 40 | 14(实测 RSS/JSON 200 + XML 结构校验通过) |
| 国际站点 | 84 | 31(同上) |
| **网站合计** | **124** | **45** |
| 开源可自建项目 | 53 | 4 免部署直连公网 |

---

## A 级：实测可抓（RSS / JSON Feed）

直接进 skill 抓取管道。这是唯一一组「状态码 + XML 根元素」双校验通过的。

### A1 · 中文聚合站 / 精选站

| 站点 | RSS / JSON | 状态 | 频率 | 与 AIHOT 的差异 |
|---|---|---|---|---|
| RadarAI | https://radarai.top/feed.xml | 200 application/rss+xml | 每日 | 上游直接引用 aihot.news / bestblogs.dev，是 AIHOT 的下游同源聚合 |
| 每日黎明 DailyDawn | https://dailydawn.dev/feed.xml<br>https://dailydawn.dev/zh.json（JSON Feed 1.1） | 200 application/rss+xml<br>200 application/feed+json | 每日 | 面向独立开发者的趋势+变现日报，锚 GitHub Trending / HN / Product Hunt |
| PixelsTech AI | https://www.pixelstech.net/feed/rss/ai | 200 application/rss+xml | 每日 | 每日打分推几条，但正文以英文站为主、中文少 |
| BestBlogs.dev | https://www.bestblogs.dev/feeds/rss | 200 application/xml | 每日 | 中文原创技术博客精选，是「博客精选」非「AI 事件流」 |
| 博客园新闻 | https://feed.cnblogs.com/news/rss | 200 application/rss+xml | 每日 | 全站新闻聚合，需按关键词二次过滤 AI 条目 |

### A2 · 中文垂直 AI 媒体 / 科技站

| 站点 | RSS | 状态 | 频率 | 备注 |
|---|---|---|---|---|
| 量子位 QbitAI | https://www.qbitai.com/feed | 200 application/rss+xml | 每日 | 商业发布 + 原创，无打分无聚类 |
| 新智元 | https://www.aiera.com.cn/feed | 200 application/rss+xml | 每日 | AI+产业/政策/投融资 |
| 爱范儿 ifanr | https://www.ifanr.com/feed | 200 application/xml | 每日 | 有「爱范儿早报」每日汇总；**必须用 GET 校验，HEAD 返回 403** |
| 极客公园 GeekPark | https://www.geekpark.net/rss | 200 application/xml | 每日 | **首页本身 403，RSS 通道可通** |
| 钛媒体 TMTPost | https://www.tmtpost.com/feed | 200 text/xml | 每日 | 商业/融资视角，非 AI 专项，需过滤 |
| 雷峰网 Leiphone | https://www.leiphone.com/feed | 200 application/rss+xml | 每日 | 智能汽车/具身智能/AI 芯片 |
| 少数派 sspai | https://sspai.com/feed | 200 application/xml | 每日 | 消费级工具实测，AI 只是子集 |
| 稀土掘金 Juejin | https://juejin.cn/rss | 200 text/xml | 每日 | 开发者实战内容（RAG/部署/Prompt） |
| IT之家 | https://www.ithome.com/rss/ | 200 text/xml | 每日 | 快讯型，密度极高深度低 |

### A3 · 国际 Newsletter（实测 200，9 个）

| 站点 | RSS | 频率 | 差异 |
|---|---|---|---|
| The Rundown AI | https://www.therundown.ai/feed | 每日（23期/月） | 人工编排 + 视频演示，无 API/MCP |
| One Useful Thing | https://www.oneusefulthing.org/feed | 每周（2期/月） | 单一作者深度长文 |
| Latent Space | https://www.latent.space/feed | 每周多次（16期/月） | AI 工程实践访谈/教程，附 AINews 日更板块 |
| Ben's Bites | https://www.bensbites.com/feed | 每周多次（9期/月） | 个人视角 + 工具试用 |
| Ahead of AI（Raschka） | https://magazine.sebastianraschka.com/feed | 每月 | 论文讲解型长文 |
| Exponential View | https://www.exponentialview.co/feed | 每周（8期/月） | AI+经济/指数技术战略框架 |
| Interconnects | https://www.interconnects.ai/feed | 每周（7期/月） | 开源模型与实验室策略的作者原创判断 |
| AI Tidbits | https://www.aitidbits.ai/feed | 不定期 | 面向开发者的短精选 |
| Last Week in AI | https://lastweekin.ai/feed | 每周 | 学界视角周更 |

### A4 · 国际科技站 AI 频道（实测 200，12 个）

| 站点 | RSS | 差异 |
|---|---|---|
| The Verge AI | https://www.theverge.com/rss/ai-artificial-intelligence/index.xml | 单一编辑部，无跨源聚合 |
| Ars Technica AI | https://arstechnica.com/ai/feed/ | 技术深度报道 |
| Ars Technica Technology Lab | https://feeds.arstechnica.com/arstechnica/technology-lab | 消费电子+AI |
| MIT Technology Review AI | https://www.technologyreview.com/topic/artificial-intelligence/feed | 政策议题深度 |
| WIRED AI | https://www.wired.com/feed/tag/ai/latest/rss | AI 是大标签下混合内容 |
| The Decoder | https://the-decoder.com/feed/ | 纯 AI 垂直媒体 |
| TechCrunch AI | https://techcrunch.com/category/artificial-intelligence/feed/ | 创业/融资向；另有 WordPress JSON API |
| ZDNet | https://www.zdnet.com/topic/artificial-intelligence/rss.xml | **302 跳全站流，已退化**，按最终 URL 判定 |
| AI Business | https://aibusiness.com/rss.xml | B2B 企业 AI 案例 |
| 404 Media | https://www.404media.co/rss/ | 平台商业模式调查 |
| MarkTechPost | https://www.marktechpost.com/feed/ | 高频技术博客，噪音高无打分 |
| KDnuggets | https://www.kdnuggets.com/feed | 数据科学向，混招聘 |

### A5 · 国际论文/研究向（实测 200，9 个）

| 站点 | RSS |
|---|---|
| arXiv cs.AI | http://export.arxiv.org/rss/cs.AI（仅 export 域名稳定） |
| arXiv cs.LG | http://export.arxiv.org/rss/cs.LG |
| arXiv cs.CL | http://export.arxiv.org/rss/cs.CL |
| The Gradient | https://thegradient.pub/rss/ |
| Synced Review | https://syncedreview.com/feed/ |
| BAIR Blog | https://bair.berkeley.edu/blog/feed.xml |
| MIT News AI | https://news.mit.edu/rss/topic/artificial-intelligence2 |
| OpenAI News | https://openai.com/news/rss.xml |
| Google DeepMind Blog | https://deepmind.google/blog/rss.xml |

### A6 · 国际聚合器（实测 200，1 个）

| 站点 | RSS | 差异 |
|---|---|---|
| Techmeme | https://www.techmeme.com/feed.xml | 全科技人工聚簇，**不分 AI 领域，需自行按 topic 过滤**；只有 /feed.xml 有效，/feed 404 |

### A7 · AIHOT 开源仓库自带的 18 条示范信源（作者已筛过一遍）

本机实测：13 条 200，5 条本网络超时（疑似地域限制，未确认下线）。

| 状态 | 信源 |
|---|---|
| ✅ 200 | OpenAI News、Google DeepMind、NVIDIA Blog、AWS ML Blog、GitHub Blog AI&ML、Microsoft Research、BAIR、The Verge AI、Ars Technica AI、MIT Tech Review AI、The Decoder、Simon Willison、Latent Space |
| ⚠️ 本网络超时 | Google Research、Hugging Face Blog、Mistral AI、TechCrunch AI、Import AI |

作者原始 RSS 配置见 `industry/sources.json`（https://raw.githubusercontent.com/KKKKhazix/AIHOT/main/industry/sources.json），含 tier 分级（T1/T1.5/T2）与轮询间隔，可直接抄。

---

## B 级：实测可达，但只能解析 HTML

有清晰日报/快讯结构，但没有可用 RSS。

| 站点 | 日报入口 | 备注 |
|---|---|---|
| AI 工具集 · 每日 AI 资讯 | https://ai-bot.cn/daily-ai-news/ | **/feed 返回 200 但正文是 `<error><title>Feed关闭</title></error>`**，只能解析 HTML |
| AIBase 每日 AI 简报 | https://news.aibase.com/zh | Nuxt/SSR，列表在 `__NUXT_DATA__`；无 rss+xml alternate |
| AIbase AI 资讯 | https://www.aibase.com/zh/news | 与产品库同域，条目偏产品榜单 |
| StormZhang AI Daily | https://news.stormzhang.ai/ | 中英双语，20 条/天，08:02 更新；本机 curl 000 但 web_fetch 成功 |
| Awesome AI（doocs） | https://ai.doocs.org/daily | **形态最像 AIHOT，但实际已停更 4 个月**（最新 2026-06-16） |
| 归藏的 AI 资讯 | https://www.guizang.ai/ | **已停更 7 个月**（最新 2026-03-28） |
| AIGC Weekly | https://quaily.com/op7418 | 周更，旧域名 quail.ink 301 到此 |
| 机器之心 Synced | https://www.jiqizhixin.com/ | **/rss 302 跳到 /data-service 数据服务页**；/feed 404 |
| 智东西 | https://www.zhidx.com/ | **/feed 返回 500** |
| 36氪（含智能涌现） | https://36kr.com/ | **/feed 200 但 content-type text/html** |
| 智源社区 BAAI Hub | https://hub.baai.ac.cn/ | /feed 404；学术热榜多于行业新闻 |
| AIHub | https://aihub.cn/news | /feed 200 但无 rss/feed/channel 结构，非标准 RSS |
| 机器人大讲堂 | https://www.leaderobot.com/ | 具身智能垂类；/feed 404 |
| Pollack AI Lab | https://lab.pollack.ai/ | 论文+实验复现；所有 feed 路径 404 |
| InfoQ 中文 · AI&大模型 | https://www.infoq.cn/topic/AI | 无 UA 时 451，需浏览器 UA + GET |
| 虎嗅 | https://www.huxiu.com/ | **HEAD 请求 405，须用 GET** |
| AI产品榜 AICPB | https://www.aicpb.com/ | 页面最新日期 2025-12-31，已近一年未更 |
| DevURLs | https://devurls.com/ | **已停更 4 个月**（2026-06-17） |
| AI 新闻聚合类（国际） | Particle News / Trace / 4d.news / explainx.ai / ai.doocs.org | 未验证可达或无 RSS |

**停更陷阱清单（抓取前必须做新鲜度校验，否则会把陈旧条目当今天新闻）**
Awesome AI（4个月）、归藏（7个月）、DevURLs（4个月）、AICPB（近1年）、机器之心 /rss 已变数据服务页。

---

## C 级：本网络不可达 / 未验证（需在目标部署网络复测）

Founder Park、AI Secret、差评 XPinNews、具身智能之心、高工机器人、汽车之心/autobit.xyz、硅星人 Pro、
Substack 全系（AlphaSignal、The Sequence、Import AI、Marcus on AI、Deep (Learning) Focus、ChinAI、Epoch AI、Don't Worry About the Vase）、
Hugging Face Daily Papers、Papers with Code、Google Research Blog、VentureBeat AI（429 限流非下线）、
TLDR AI、The Batch、The Deep View、Techpresso、AIpresso、Not A Bot、Machine Learnings、ScienceDaily、
VentureBeat / 7min.ai / Every / artificialintelligence-news.com / aitechnews.com。

**两个 Substack 系硬事实**：Substack 的 `/feed` 是公开可抓的，本批全部超时是**本机 DNS 被劫持到 Twitter/Facebook IP 段**（解析到 128.242.245.125 / 31.13.x.x / 103.252.x.x），非站点问题。

**国际侧实测 403 反爬（feed 存在，需换 UA / 走代理 / 用 RSSHub 中转）**：
Superhuman AI、The Neuron、The AI Report、Turing Post、AI Breakfast(beehiiv)、FutureTools Weekly(beehiiv)、Mindstream。

---

## 域名失效 / 被劫持（禁止收录）

| 域名 | 现状 |
|---|---|
| https://www.aisourcehub.info | **302 跳转到博彩站 biz.radio.fm**，域名过期被劫持 |
| https://www.deeptech.com | 302 跳到 Canva 站点，原站已失效 |
| https://www.gongkong.com | 实为「中国工控网」，**不是高工机器人**，别搞混 |

---

## 开源项目（53 个）

### 第一档：免部署，公网 API/RSS 直接拿当日 AI 新闻（4 个）

| 项目 | 接口 |
|---|---|
| **AIHOT 官方站** | `/api/v1/items`（28 个端点）、`/api/v1/hot-topics`、`/api/v1/dailies/latest`、`/api/v1/agent`（Markdown）、6+ 个 RSS、`/api/mcp`（8 个只读工具）、`/api/v1/agent` 全免 Key 匿名 |
| hot.foxnan.com（AIHOT 衍生 AI 站） | https://hot.foxnan.com/feed.xml → 200 RSS（标题实测为当日 AI 新闻） |
| free-news-api | https://ethos6.github.io/free-news-api/v1/trending.json → 200 JSON（零部署零 Key） |
| newsnow | https://newsnow.busiyi.world/api/s?id=weibo → 403/200 抖动，**不可作稳定生产依赖** |

### 第二档：自建成本低、不需模型 API Key（6 个）

RSSHub(46.7k★)、newsnow(22.2k★)、DailyHotApi(4.1k★)、OOIUa/DailyHot(Go 单二进制)、aktools、DailyHot 前端/Vercel 分支。
AIHOT issue #219 就是为把 RSSHub/aktools 接进来而开的 SSRF 白名单。

### 第三档：需模型 Key 或深度改造（约 40 个）

Horizon(11k★，有官方 Agent Skill，支持 Ollama 免 Key)、CloudFlare-AI-Insight-Daily(1.8k★)、vigorX777/ai-daily-digest(1.7k★)、
Jesseovo/last30days-skill-cn(2.0k★，Skill 形态最成熟样本)、chubbyskills(1.3k★)、dailybrief(383)、condenseit(92，Ollama 免 Key) 等。

**AIHOT 衍生实例（Discussions 作品展示区实测 9 个自建站）**：
AI4Math Radar、xabcnews.com、RoboHot(robohot.news)、MediaStack(mediastack.work)、newsiq.xyz、
营销通鉴(yingxiaoclub.com)、青砚(环保垂类，**含公众号免费采集管道可抄**)、大厂观察(innews.site)、hot.foxnan.com。

**成本硬数据**：AIHOT issue #191 有用户自建后**每天烧约 90 美元**（纯 LLM 流水线）。自建真实代价就在这里。

---

## AIHOT API 契约（可直接复用）

- 线上：`https://aihot.news`（旧域 aihot.virxact.com 将于 **2026-10-31 停用**）
- REST v2.0.0：`/api/v1/*`，28 个端点；`openapi-v1.json` 为机器可读定义
- Agent 专用：`/api/v1/agent` 返回中文 Markdown + 回答提示；`/api/v1/agent/latest|search|hot|daily|weekly|monthly`
- RSS：`/feed.xml`（精选摘要）、`/feed/full.xml`、`/feed/all.xml`、`/feed/daily.xml`、`/feed/weekly.xml`、`/feed/monthly.xml`、`/feed/category/{slug}.xml`
- MCP：`https://aihot.news/api/mcp`，8 个只读工具
- 官方 Skill 包：`https://aihot.news/aihot-skill/SKILL.md`（+ LICENSE + agents/openai.yaml，3 文件，带 SHA-256 清单）
- **全部匿名只读、免 API Key**

### `/api/v1/items` 返回结构（已实测）

```
顶层: schemaVersion, query, items, page
item: id, title, originalTitle, summary, source, links, publishedAt,
      discoveredAt, category, score, selected, reason, attribution
links: { aihot, original }      ← 原文 URL 在 links.original，item 顶层没有 url
source: { name }               ← 是对象不是字符串
attribution: { name, url }
page: { count, hasMore, nextCursor }
```

参数：`mode=selected|all`、`window=24h|7d`、`by=timeline|published`、`category=ai-models|ai-products|industry|paper|tip|opinion`、`q=`、`limit`、`cursor`。

**用 gzip/br + ETag + If-None-Match**；单 IP 超约 60 次/分钟返回 429，按 Retry-After 等。

---

## 抓取硬规则（写进 skill 的执行约束）

1. **禁止只信状态码**。必须校验 content-type 且解析 XML 根元素（`<rss>` / `<feed>` / `<channel>`）。
   已知假 200：`ai-bot.cn/feed`（Feed关闭）、`36kr.com/feed`（text/html）、`aihub.cn/feed`（非标准）、`every.to/feed`、`7min.ai/feed`、`aitechnews.com/feed/`、`artificialintelligence-news.com/feed/`。
2. **只用 GET，不用 HEAD**。`ifanr.com` HEAD 403 / GET 200；`huxiu.com` HEAD 405。
3. **本机 curl 必须带 `--ssl-no-revoke`**。Windows schannel 吊销检查离线（CRYPT_E_REVOCATION_OFFLINE）会让 44 个 URL 里约 25 个误报 000。
4. **每次抓取校验新鲜度**。条目日期距今超过 48h 即判定停更，丢弃该源并告警。
5. **跟随并记录最终 URL**（`%{url_effective}`）。ZDNet AI 频道会 302 到全站流。
6. **限流退避**：VentureBeat 返回 429；AIHOT 单 IP 约 60 次/分钟。
7. **黑名单**：`aisourcehub.info`、`deeptech.com`（已被劫持/失效）。
8. **归档不抓原站**：机器之心 /rss 是数据服务页，智东西 /feed 是 500，不要当 feed 用。

---

## 使用规则（合规）

AIHOT 的公开使用规则：个人非商业、公益非商业、组织内部使用免费；**面向外部的商业产品、收费服务、客户交付、代理接口、数据转售、公开镜像、批量再分发须事先取得书面授权**（wzglyay@virxact.com）。SKILL 包的 MIT 只覆盖 Skill 指令文件，不覆盖 AIHOT 服务、数据与第三方原文。

第三方原文版权归原作者，AIHOT 是聚合摘要与阅读索引。
