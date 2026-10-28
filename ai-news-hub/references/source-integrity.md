# 信源真实性与可达性判读

**抓取前必读。** 这些是踩过坑写下来的硬约束，与用哪个爬虫工具无关——agent 用自己的联网能力时同样适用。

> 核心原则：**只看状态码会把假源当好源。**

---

## 一、六个判读硬规则

### 1. 不能只看状态码

必须同时校验 **content-type** 且解析 **XML 根元素**（`<rss>` / `<feed>` / `<channel>` / `<url>`）。
状态 200 但 body 是「Feed已关闭」/ 错误页 / HTML，是聚合站最常见的伪装。

### 2. 只用 GET，不用 HEAD

- `ifanr.com` — HEAD 返回 403，GET 返回 200
- `huxiu.com` — HEAD 返回 405

用 HEAD 校验会把可用源**误杀**。

### 3. 带上正常浏览器 UA

`blogs.microsoft.com`、`allenai.org` 在无 UA 或普通 UA 时返回 403。

### 4. 跟随并记录最终 URL

`zdnet.com/topic/artificial-intelligence/rss.xml` 会 302 到全站 `/rss/news/`——URL 看着有效，内容已经不是 AI 专属了。
**记录最终 URL，否则信源名和内容会对不上。**

### 5. 限流退避

| 源 | 表现 |
|---|---|
| GitHub `releases.atom` | 同一 IP 并发会打满，需降并发或加延迟 |
| `venturebeat.com` | 返回 429 |
| AIHOT | 单 IP 超约 60 次/分钟返回 429，按 `Retry-After` 等 |
| GitHub API | 匿名调用有速率限制 |

### 6. 超时不等于下线

境外站点从国内网络访问**大面积超时**，这是网络策略问题，不是站点问题。
标为「本次不可达」，**不要写成「已失效」，更不要从信源表里删掉**。

---

## 二、已知问题源清单

### 假 200（状态正常，内容是假的）

| 源 | 真实情况 |
|---|---|
| `ai-bot.cn/feed` | 返回「Feed关闭」提示页 |
| `36kr.com/feed` | content-type 是 text/html，不是 feed |
| `aihub.cn/feed` | 非标准格式 |
| `wallstreetcn.com/rss.xml` | S3 `NoSuchKey` 错误页 |
| `aibot.cn`、`wallstreetcn.com` | 同上 |
| `aisourcehub.info` | **DNS 被劫持到博彩站** |
| `deeptech.com` | DNS 被劫持到 Canva |

### 入口改版

| 源 | 正确入口 | 说明 |
|---|---|---|
| 华尔街见闻 | `dedicated.wallstreetcn.com/rss.xml` | 主站 `rss.xml` 是错误页；dedicated 域的 content-type 谎报 text/html，但 **body 是真 RSS** |
| Qwen 博客 | `qwen.ai/blog` | 旧 `qwenlm.github.io/blog/index.xml` 是真 feed，但内容停更在 2025-09 |
| 机器之心 | `/rss` | 302 到数据服务页，**无 feed** |
| 智东西 | `/feed` | 500 |

### Substack 系全部需要走代理（本机实测 2026-10-28）

`importai` / `thesequence` / `epochai` / `alphasignalai` / `latent.space` 全部是 Substack 域名，
**直连必然失败**：DNS 解析到 Facebook/Meta 的 IP 段（`2a03:2880::face:b00c`、`31.13.x.x`、`157.240.x.x`），
`fetch` 报 `connect ETIMEDOUT`，`web_fetch` 同样失败。

- ✅ **可用的读取路径**：`curl -x http://127.0.0.1:7897 -L <feed-url>`（本机代理实测通，4 个源各拿到完整 15 条，228KB–917KB）
- ❌ DoH（alidns / 223.5.5.5）**不可用**：返回的 IP 同样被污染，直连一律超时
- ⚠️ `latent.space` 直连 `curl -L` 只能拿到 7 条，**经代理才返回完整 15 条**
- 换环境复测时先确认代理是否在线，否则会误判成「源已死」

### CNBC 的 feed id 会骗人

`https://www.cnbc.com/id/20910258/device/rss/rss.html` 的 channel title 实为 **Economy**
（`seo=cnbc.com/economy/`），内容全是央行、财政、宏观经济，**零 AI**。
真正含 AI 内容的频道是 **`id=19854910` = Tech**（实测前 15 条中 8–9 条为 AI 主题）。
`id=10001147` = Business News（公司/行业/诉讼），两个频道标题交集为 0。

> 看 feed 时**必须先读 channel 的 title 和 seo 字段**，别看 URL 猜内容。

### MIT Technology Review 的 AI feed 已被厂商投放占据

该 feed 的 10 条里 **7 条不是编辑部产出**，正文自带声明：
「This content was produced by Microsoft / EXL / WD / HPE / TripleTen… not written by MIT Technology Review's editorial staff」
或「produced by Insights, MIT TR's custom content arm, not its editorial staff」，另有活动推广稿。
**只有 3 条是本部原创**（现场特写、原创分析、具名评论）。

→ 用它必须**逐条筛**，不能整条 feed 当新闻源。

### 同一家的多个 feed 会重复计权（实测前 15 条标题重合）

| 组合 | 重合 |
|---|---|
| TechCrunch AI ↔ TechCrunch 全站 | **9 / 15** |
| Ars Technica AI ↔ Ars Technica 全站 | 3 / 15 |
| Ars Technica Technology Lab ↔ Ars Technica 全站 | 1 / 15 |
| CNBC Economy ↔ CNBC Business | 0 / 15 |

→ 订阅其中**一个**即可，不要同时订阅同家的分类 feed 与全站 feed。

### 国内财经站被 WAF 挡住时的读取路径（实测 2026-10-28）

三个站的主站在本机直接抓都会被拦，各有各的绕法：

| 站 | 直接抓的结果 | 可用绕法 |
|---|---|---|
| **财联社** | `cls.cn` node fetch `fetch failed`（TLS 层不通）、curl HTTPS 超时 19s、`/telegraph` 只返回「需启用JS」空壳、`/v1/roll/get_roll_list` 返回 `{"errno":"10012","msg":"签名错误"}`、`/nodeapi/telegraphList` 404 | RSSHub 镜像 `hub.slarker.me/cls/telegraph` ✅ 取到 20 条 |
| **36氪** | 全站被火山引擎 WAF 拦截（web_fetch / node fetch / curl 三种方式都返回「正在进行安全检测」挑战页，curl 200 也是挑战页）、`gateway.36kr.com` POST 404/500、rsshub.app 不可达 | RSSHub 镜像 `rsshub.rssforever.com/36kr/newsflashes` ✅ 取到 20 条 |
| **澎湃新闻** | `api.thepaper.cn` 的 POST 接口被 WAF 403 | 站点自身 SSR 数据：`https://www.thepaper.cn/list_25949` 的 `__NEXT_DATA__` ✅ 带逐条 `trackOriginality` |
| **证券时报** | 无 RSS，无公开 JSON 接口 | 首页 SSR 抓出 119 条 `/article/detail/*.html` 链接，再逐篇读详情页的**「来源」字段** ✅ |

> ⚠️ 这几个站的「深度频道 / 文章流」样本仍然缺位（主站被 WAF 与接口签名挡住）。
> 上面财联社 87% 与 36氪 60% 的结论**只覆盖快讯频道**，用的时候注意这个边界。

### 澎湃新闻带官方「原创标记」字段（可直接读，不用猜）

澎湃的页面内嵌 `__NEXT_DATA__`，条目对象里有 **`trackOriginality`**（`是` / `否`）与 `trackAuthor`（作者/来源名）。
拉 `https://www.thepaper.cn/list_25949`（首页推荐流）即可拿到最近条目及其**官方原创标记**。

```javascript
fetch('https://www.thepaper.cn/list_25949', {headers:{'user-agent':'Mozilla/5.0'}})
// → JSON.parse(页面中 __NEXT_DATA__ 的内容).props.pageProps
// → 递归找 {trackOriginality, name, trackAuthor, publishTime}
```

- ✅ 这是**唯一一个有官方原创标记**的中文源 —— 判定原创性不用靠读正文猜
- ⚠️ 但它的首页流里 `trackAuthor` 大量是「人民日报客户端 / 央视网 / 新华网」→ **转载占比高**，实测原创仅约 40%
- 注意：`list_25462` 是「中国政库」频道（要闻转载为主），`list_25949` 才是首页推荐流

### 只能由 agent 解析（脚本处理不了）

所有 `status=agent` 的源：Anthropic Engineering / Anthropic News 列表页、国内 14 个厂商官网、36氪、澎湃、证券时报、财联社。

### 停更（不要浪费时间读）

| 源 | 停更时长 |
|---|---|
| Awesome AI (ai.doocs.org) | 4 个月 |
| 归藏 | 7 个月 |
| DevURLs | 4 个月 |
| AICPB | 近 1 年 |
| Qwen GitHub Pages | 2025-09 起 |

---

## 三、停更判定（按源频率，不能一刀切）

| 源频率 | 判定阈值 |
|---|---|
| 日更 | 超过 72 小时无更新 |
| 周更 | 10 天 |
| 月更 | 45 天 |
| 低频（`low`） | 单独判断 |

**统一用 48 小时会把 BAIR、One Useful Thing 这类低频源误报成停更。**

---

## 四、每源条数上限

arXiv 一天能出几百篇论文，不设上限会把真正的新闻挤掉。
**每源最多取 25 条**（按时间取最新）。

---

## 五、已知抓取坑（补充）

- **Windows schannel 证书吊销检查离线** → 境外站大面积误报不可达，报 `CRYPT_E_REVOCATION_OFFLINE (0x80092013)`。curl 加 `--ssl-no-revoke`；Node 的 `fetch` 不受影响。
- **Substack 系全站 DNS 被劫持**到 Twitter/Facebook IP 段（importai / thesequence / epochai / alphasignalai）——`retry` 状态多半是这个原因，不是 Substack 挂了。
- **huggingface.co / research.google / mistral.ai / x.ai** 在部分网络下不可达——同上，属于网络策略。
- **不要为了「凑够条数」而放宽校验**。宁可少一条，不要引入假信息源。

---

## 六、判定结果该怎么记

| 现象 | 标记 | 动作 |
|---|---|---|
| 抓到且结构校验通过 | `ok` | 正常用 |
| 超时 / 被拦 / DNS 异常 | `retry` | 保留在表里，换环境复测 |
| 只能解析 HTML | `agent` | 交给 agent 联网工具 |
| 内容结构错误、站点改版 | `stale` | 找新入口；找不到才从表里删 |
| 确认长期无更新 | `stale` | 从表里删，并同步更新 `topic-map.md` |
