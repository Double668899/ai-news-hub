# 抓取 / 去重 / 排序规则

## 1. 信源优先级

排序键:`tier` → `group` → `时间`。

| tier | 含义 | 为什么排这个位置 |
|---|---|---|
| **T1** | 厂商官方博客、官方 RSS、官方 GitHub | 一手信息,发布即事实。没有编辑损耗和二手转述,AI 圈大事几乎都先在这里出现 |
| **AGG** | 免密钥聚合站(AIHOT) | 已经聚合了上百个源并做过 AI 打分,单次请求顶几十个 feed。放在 T1 之后是因为它的条目仍是二手筛选结果,但密度极高 |
| **T2** | 研究机构、arXiv | 一手但滞后,论文不算"新闻"。用于补研究动态,不适合当日报主干 |
| **T3** | 媒体、开发者站、Newsletter | 二手转述,常带编辑立场和营销成分。放在最后是为了不讓它们挤掉一手源 |
| **GH** | GitHub trending / release / API | 第三优先档。开源生态重要但节奏慢、噪音大(trending 榜常被刷榜),单独成栏不与新闻混排 |

组内顺序固定:**海外 → 国内 → GitHub**。理由是 AI 圈重大事件绝大多数首发在海外,国内多为跟进报道;
GitHub 的 release 属于工程节奏,和新闻事件不同源,单列。

## 2. 档位内部怎么再排

- **T1**:按发布时间倒序。同一天内,官方博客 > 官方 GitHub release > 官方社交账号。
- **AGG**:按 AIHOT 自带 score 倒序(score 已在 0-100 区间,越高越值得看)。
- **T2**:论文按 arXiv 提交时间倒序;机构博客按发布时间。
- **T3**:媒体源之间不按源内分数排,按发布时间即可,同一条被多源报道的合并后以最早报道时间为准。
- **GH**:trending 榜按原榜序;release 按发布时间。

## 3. 时间窗

- 默认 24 小时,按**条目自身声明的时间戳**过滤,不是抓取时间。
- 条目没有时间戳时:GitHub Trending 这类只有 channel 级 pubDate 的,用 channel 日期;Markdown 类接口用抓取时刻。
- 完全没有时间信息的源不进入时间窗过滤,单独标注为"时间未知",避免误杀。

## 4. 去重

1. **标题归一化**:小写 → 去空白 → 去所有非字母数字字符 → 取前 60 字符作为键。
2. 同键合并,保留档位更高的那一条(T1 > T3);档位相同则保留摘要更长的。
3. **语义合并**(脚本做不了,需要模型做):同一件事被多家报道时,合成一条,标题取信息量最大的,
   摘要合并各方要点,并在条目上标注"多源印证:N 家"。
4. 转发与二次创作:标题高度相似且来源不同、但正文指向同一原始出处的,算同一条。

## 5. 抓取硬规则

这些不是建议,是踩过坑之后写进代码的硬约束。

1. **不能只看状态码**。必须同时校验 content-type 且解析 XML 根元素(`<rss>` / `<feed>` / `<channel>` / `<url>`)。
   已知假 200 见第 6 节。脚本已内置校验,agent 路径要自己判断。
2. **只用 GET,不用 HEAD**。`ifanr.com` HEAD 返回 403、GET 返回 200;`huxiu.com` HEAD 返回 405。
   用 HEAD 校验会把可用源误杀。
3. **带上正常浏览器 UA**。`blogs.microsoft.com`、`allenai.org` 无 UA 或普通 UA 会 403。
4. **Windows 下 curl 加 `--ssl-no-revoke`**。schannel 证书吊销检查离线会返回
   `CRYPT_E_REVOCATION_OFFLINE (0x80092013)`,导致大量境外站被误判为不可达。Node 的 fetch 不受此影响。
5. **跟随并记录最终 URL**。`zdnet.com/topic/artificial-intelligence/rss.xml` 会 302 到全站 `/rss/news/`,
   URL 看着有效但内容已经不是 AI 专属了。
6. **限流退避**:GitHub 对同一 IP 的并发 `releases.atom` 请求会打满,这类源降并发或加延迟;
   `venturebeat.com` 返回 429;AIHOT 单 IP 超过约 60 次/分钟返回 429,按 `Retry-After` 等。
7. **每源限流**:arXiv 一天能出几百篇论文,不设上限会把真正的新闻挤掉。脚本默认每源最多 25 条
   (`--per-source` 可调),按时间取最新。
8. **停更判定按源频率**:日更源超过 72 小时无更新即判停更;周更看 10 天;月更看 45 天。
   统一用 48 小时会把 BAIR、One Useful Thing 这类低频源误报成停更。
9. **超时不等于下线**。境外站点从国内网络访问大面积超时,这是网络策略问题。标为"本次不可达",
   不要写成"已失效",也不要从信源表里删。

## 6. 已知坏源与失效地址(2026-10-28 实测)

### 假 200(状态码正常但内容不是 feed)

| 地址 | 实际返回 |
|---|---|
| `ai-bot.cn/feed` | WordPress 的 `<error><title>Feed关闭</title></error>` |
| `36kr.com/feed` | content-type 为 `text/html` |
| `aihub.cn/feed` | 200 但无 `rss`/`feed`/`channel` 结构,非标准 RSS |
| `every.to/feed`、`7min.ai/feed`、`aitechnews.com/feed/`、`artificialintelligence-news.com/feed/` | 200 但 content-type 是 `text/html`,实际重定向到首页 |
| `qwen.ai/任意路径` | SPA,所有路径都返回 200 的 HTML 外壳 |
| `pixelstech.net/feed/ai` | 200 但是 HTML 展示页;真 RSS 在 `/feed/rss/ai` |
| `www.jiqizhixin.com/rss` | 302 跳到 `/data-service` 数据服务页,不是 feed |
| `www.zhidx.com/feed` | 500 |
| `wallstreetcn.com/rss.xml` | 200 + `application/xml`,但 body 是 S3 的 `<Error><Code>NoSuchKey</Code></Error>` 错误页;真 feed 在 `dedicated.wallstreetcn.com/rss.xml` |

**反向案例:content-type 撒谎但内容是真的。**
`dedicated.wallstreetcn.com/rss.xml` 的 content-type 是 `text/html`,body 却是合法 RSS。
所以校验不能只看 content-type,也不能只看状态码 —— 必须解析 XML 根元素。
脚本的判定顺序是:先看 body 前 400 字符有没有 `<?xml` / `<rss` / `<feed` / `<channel>` / `<url>`,
再排除 `<Error>` / `NoSuchKey` 这类错误页根节点。

### 域名失效或被劫持(禁止收录)

| 地址 | 现状 |
|---|---|
| `aisourcehub.info` | 302 跳到博彩站 `biz.radio.fm`,域名过期被劫持 |
| `deeptech.com` | 302 跳到 Canva 站点,原站失效 |
| `www.gongkong.com` | 实为"中国工控网",**不是高工机器人**,别混为一谈 |

### 看起来在更、实际停更

| 站点 | 最新日期 | 停更时长 |
|---|---|---|
| `ai.doocs.org`(Awesome AI 日报) | 2026-06-16 | 约 4 个月 |
| `guizang.ai`(归藏) | 2026-03-28 | 约 7 个月 |
| `devurls.com` | 2026-06-17 | 约 4 个月 |
| `aicpb.com`(AI 产品榜) | 2025-12-31 | 近 1 年 |
| `qwenlm.github.io/blog`(Qwen GitHub Pages) | 2025-09-22 | 约 1 年,官方已迁至 qwen.ai/blog |

### 本网络不可达(疑似地域限制,非站点下线)

`huggingface.co` 全部路径、`research.google`、Substack 全系(`*.substack.com` 的 DNS 被解析到
Twitter/Facebook IP 段)、`mistral.ai`、`x.ai`、`api-hot.imsyy.top`、`rsshub.app`、
`aisecret.us`、`founderpark.com`、`xpinnews.com`。

## 7. 免密钥聚合接口速查

| 接口 | 用途 | 返回 |
|---|---|---|
| `https://aihot.news/api/v1/items?mode=selected&window=24h&limit=50` | 当日精选 JSON | `schemaVersion/query/items/page`;item 含 `id/title/originalTitle/summary/source/links/publishedAt/category/score/selected/reason/attribution`;**原文 URL 在 `links.original`,顶层没有 `url`** |
| `https://aihot.news/api/v1/agent/latest` | 给 agent 的中文 Markdown | 最省 token,单接口顶几十个 feed |
| `https://aihot.news/api/v1/hot-topics` | 热点榜 Top10 | item 含 `rank/title/links/sourceCount/signalCount/latestAt` |
| `https://aihot.news/api/v1/dailies/latest` | 最新日报 | `report.sections[].items` + `report.flashes` |
| `https://aihot.news/feed.xml` | 精选 RSS | 最近 50 条 |
| `https://aihot.news/api/mcp` | 远程 MCP | 8 个只读工具 |
| `https://aihot.news/openapi-v1.json` | OpenAPI 2.0.0 | 28 个端点的机器可读定义 |

全部匿名只读、免 API Key。用 `Accept-Encoding: gzip` 体积约为 1/4~1/8,带 ETag + `If-None-Match` 可省带宽。

**旧接口 `/api/public/*` 将于 2026-10-31 停用**,老代码要改到 `/api/v1/*`。
字段也变了:`source` 从字符串变成对象 `{name}`,`url` 挪到了 `links.original`。

## 8. 开源自建背景(为什么这个 skill 用"配方"而不是"建站")

调研到的相关开源项目共 53 个,分三档:

- **免部署、公网直连(4 个)**:AIHOT 官方站(含 9 个已实测 200 的接口 + 官方 Agent Skill)、
  `hot.foxnan.com`(AIHOT 衍生 AI 站,feed.xml 实测 200)、`free-news-api`(trending.json 实测 200)、
  `newsnow`(实例 403/200 抖动,不可作稳定生产依赖)。
- **自建成本低、不需模型 Key(6 个)**:RSSHub(46.7k★)、newsnow(22.2k★)、DailyHotApi(4.1k★)、
  OOIUa/DailyHot(Go 单二进制)、aktools、DailyHot 前端/Vercel 分支。
- **需模型 Key 或深度改造(约 40 个)**:Horizon(11k★,有官方 Agent Skill,支持 Ollama 免 Key)、
  CloudFlare-AI-Insight-Daily(1.8k★)、last30days-skill-cn(2.0k★)、chubbyskills(1.3k★) 等。

**成本硬数据**:AIHOT issue #191 有用户自建后每天烧约 90 美元(纯 LLM 流水线)。
自建的真实代价就在这里 —— 而本 skill 只用免费公开接口,零服务器成本。

**AIHOT 衍生实例**(Discussions 作品展示区实测 9 个自建站):AI4Math Radar、xabcnews.com、
RoboHot、MediaStack、newsiq.xyz、营销通鉴、青砚(环保垂类,含公众号免费采集管道)、
大厂观察、hot.foxnan.com。

## 9. 使用许可

- **AIHOT**:个人非商业、公益非商业、组织内部使用免费;面向外部的商业产品、收费服务、客户交付、
  代理接口、数据转售、公开镜像、批量再分发须事先取得书面授权(`wzglyay@virxact.com`)。
  官方 Skill 包的 MIT 只覆盖指令文件,不覆盖服务、数据和第三方原文。
- **第三方原文**版权归原作者,聚合站只是阅读索引。
- 各媒体站 feed 的再分发遵循其各自条款,抓取本身用于个人阅读通常没问题,公开发布整站内容则另说。

## 10. 国内一手源的结构性现实

eval 阶段(有 skill vs 无 skill 两路对比)实测出的结论,直接影响信源设计:

**国内厂商官网没有 RSS。** DeepSeek、智谱、字节 Seed、腾讯混元、百度文心、MiniMax、月之暗面、
华为昇腾、智源、上海 AI Lab、ModelScope —— 全部实测无 feed。
唯一可用的是通义千问的 GitHub Pages 博客(`qwenlm.github.io/blog/index.xml`),但内容已停更一年。

**更麻烦的是它们全是前端渲染的 SPA。** eval 那路 agent 逐个打开后确认:
这些页面直接抓取拿不到带日期的条目列表,只有 Anthropic 的 news/sitemap 这类服务端渲染的能用。
所以国内厂商的一手发布,在本 skill 里只能靠 `kind=html` 交给 agent 解析,且不保证能拿到日期。
现实办法是让国内媒体(雷峰网、IT之家、新智元、极客公园、爱范儿、InfoQ)承接这一段。

**中文财经媒体同样没有 RSS。** 澎湃、证券时报、中国证券网、经济日报、财联社、CGTN、腾讯新闻 ——
全部 404 或超时。但这些恰恰是**商业与政策面**选题的来源(AI 公司融资上市、算力招投标、中概股、监管口径),
基线那路就是靠它们拿到了 Anthropic S-1 的财务细节。所以它们以 `kind=html` 收进信源表,
不能因为抓不到就删 —— 删了这块的商业敏感度就没了。

**因此补了一条财经向信源组**:NVIDIA 新闻室(一手财报/合作/资本)、Meta 工程博客、白宫 News、
欧盟委员会新闻(AI Act)、CNBC AI 主题、CNBC 财经、华尔街见闻、TechCrunch 全部、Ars Technica 全部。
这些解决了"海外一手商业信号"和"中文财经"两个缺口。

## 11. eval 结果(2026-10-28)

同一个请求跑了两路:一路加载本 skill,一路只用通用工具。

| | 有 skill | 无 skill 基线 |
|---|---|---|
| 原始条目 | 430 条去重条目 | 8 次搜索 + 12 次抓取,约 30 个页面 / 18 个站点 |
| 日报条目 | 20 条,5 栏 | 26 条,16 主 + 10 简讯 |
| 链接 | 35 个,逐条验过可达 | 43 个 |
| 结构 | 按 skill 的 Output contract 分栏,每条带"为什么值得关注"、信源、时间、多源印证家数 | 自由散文体,分析味更浓 |
| 商业纵深 | 较弱(信源表原本偏科技官方) | 更强(靠澎湃/证券时报/CGTN 补的财经细节) |
| 诚实度 | 明确列出 27 个不可达源并区分"网络限制"vs"站点下线" | 未声明覆盖缺口 |
| 可复现 | 是,任何人跑同一条命令得到同构结果 | 否,依赖当次搜索运气 |

结论:**skill 的价值不在"抓得比通用搜索多",而在"结构稳定 + 覆盖可声明 + 零搭建"**。
基线那路靠 20 次工具调用和人工交叉核对拿到了更深的财经细节,这说明信源表要继续往商业与政策方向加。
两路都抓到了 Anthropic 递交 S-1,说明这套信源对当天真正的大事件没有漏。

## 12. 定期维护

- 每月跑一次 `node scripts/fetch.mjs --check`,把新出现的"假 200"和"停更"补进第 6 节。
- 失败但重试成功的源不需要改信源表;连续多次失败的再考虑标 `retry` 或换 URL。
- 信源表改了格式(增删列)要同步改 `scripts/fetch.mjs` 的 `loadSources()`。
