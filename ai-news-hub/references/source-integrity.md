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
