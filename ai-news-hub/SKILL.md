---
name: ai-news-hub
description: |
  AI 行业新闻白名单与来源分层披露规范。基于 92 个已实测的担保信源(海外/国内厂商官方博客与
  政策源、arXiv、GitHub release、国内厂商官网、一线原创媒体)采集当天的 AI 动态,严格区分
  S1(白名单担保来源)与 S2(模型自主检索的未担保来源),最终产出可直接打开的 HTML 简报。
  不规定抓取方式——搜索与爬取由 agent 自带能力决定;只担保"抓什么"与"来源怎么标"。
  Use this skill when the user asks for 今天的 AI 新闻 / AI 日报 / 今天 AI 圈发生了什么 /
  最近有什么 AI 大事 / AI 新闻汇总 / 过去 24 小时 AI 动态,or wants the day's AI headlines
  gathered into an HTML briefing with per-item source tiers. Triggers on phrases like
  "AI 日报"、"今日 AI 新闻"、"AI 圈今天"、"最近 AI 有什么大事"、"帮我盯一下 AI 新闻"、
  "AI 行业动态"、"AI 简报"。
  Do NOT use for:单个产品怎么用、生成口播稿或视频脚本、讲解技术原理或架构、纯论文检索
  (直接用 arXiv/HF 专项工具)、或用户只要某一个站点的某一篇内容(给链接更快)。
---

# AI News Hub

**这份 skill 只干两件事：担保「抓什么」，强制「来源怎么标」。**

搜索、渲染、反爬、解析——全部由 agent 自己的联网能力决定，本 skill 不介入、不绑定任何
爬虫框架、不要求任何 API Key、不部署任何服务。

| 职责 | 归属 |
|---|---|
| 选哪些信源、担保哪些信源 | **本 skill** |
| 怎么搜、怎么爬、怎么渲染 | **agent 厂商** |
| 每条信息来自担保源还是自采源 | **本 skill** |
| HTML 怎么排版、怎么写样式 | **agent 自己** |

## Inputs to collect

只在用户没说清时才问，以下都有合理默认：

- **时间窗**：默认 `24h`。说「今天」「过去一天」= 24h；「这周」= `7d`；「最近」= `7d`。
- **主题**：默认 AI 全域。用户点名「只看芯片」「只看开源」「只看国内」时，用 [`topic-map.md`](references/topic-map.md) 的主题组收窄。
- **条数**：默认不限（去重后全量）。用户要「五条以内」再截断。
- **输出位置**：默认当前工作目录下的 `ai-news-YYYYMMDD.html`。

## Procedure

### 1. 定位信源（不要通读全表）

先读 [`topic-map.md`](references/topic-map.md) 找到相关主题组，再去 [`sources.md`](references/sources.md) 取那几组的具体源。
**92 条全塞进上下文既贵又淹掉重点**——按主题取，不要扫全表。

### 2. 抓取前的必读

读 [`source-integrity.md`](references/source-integrity.md)。里面有 **20 个已知会骗人的源**（假 200、HEAD 误杀、302 改内容、限流、停更）。
典型陷阱：`36kr.com/feed` 返回的是 HTML 不是 feed；`wallstreetcn.com/rss.xml` 是 S3 报错页；`ifanr.com` 用 HEAD 会被 403 误杀。
**只看状态码会把假源当好源。**

### 3. 采集

逐个源读取，**保留每条的原始 URL 与发布时间戳**。
- 时间窗按**条目自身声明的时间戳**过滤，不是抓取时间。
- 条目无时间戳 → 用 channel 级日期；完全无时间信息 → 标「时间未知」，不要误杀。
- 优先用 `type` 列标明的入口形态；`html` 型的用你的联网工具解析列表页。

### 4. 主动补充 S2（不是「允许」，是「应当」）

白名单覆盖不到的子领域（细分赛道、某地区、某条新技术线、某家公司），**主动**用你自己的搜索能力补一手信息。

规则（缺一不可）：
1. 每条话题 **S1 ≥ 1**；若白名单确实没有覆盖该话题，标「白名单未覆盖」并给 S2。
2. 每条话题 **S2 ≥ 1** —— 交叉验证，防单一来源偏差。
3. 白名单未覆盖的领域，S2 不设条数上限。
4. S2 **不得只复述 S1 已有信息**（假补充等于没补充）。
5. S2 **不受限制**，可以超出白名单任意检索。白名单是可信地板，不是搜索上限。

### 5. 去重与归因

1. **标题归一化**：小写 → 去空白 → 去所有非字母数字字符 → 取前 60 字符作键。
2. 同键合并，**保留层级更高的那一条**（S1 优先于 S2）；同层保留摘要更长的。
3. **语义合并**（需要模型判断）：同一件事被多家报道 → 合成一条，标题取信息量最大的，摘要合并各方要点，标注「多源确认：N 家」，并下挂**全部来源及各自层级**。
4. 转发与二次创作：标题高度相似、正文指向同一原始出处的，算同一条。
5. **S1 与 S2 冲突 → 两者都保留，明确标出冲突，不替读者裁决。**

### 6. 输出 HTML

读 [`output-template.md`](references/output-template.md)，按它的规范产出。

**硬约束**：
- 产物是 **HTML**（单文件自包含优先）。不写 Markdown 降级版。
- **每条信息必须有机器可读的层级标识**，且人类也能一眼看出 S1 / S2。
- **每个来源的 URL 必须在文档里**。
- 页面顶部要有**来源构成声明**（S1/S2 各几条、S1 内 A/B 分布）。
- **S2 伪装成 S1 = 规范违规。**

HTML 的结构、样式、CSS 方案、DOM 层级**完全由你决定**——本 skill 不规定长相，只规定语义。

## 边界：这个 skill 明确不做什么

1. ❌ **不提供、不维护抓取脚本作为主路径**。怎么爬是 agent 的事。
2. ❌ 不做搜索引擎、爬虫、MCP server、代理池。
3. ❌ **不限制 agent 的抓取范围**。白名单不是围栏，越界不违规——但必须标注为 S2。
4. ❌ 不依赖付费 API、不托管服务、不要求 API Key。
5. ❌ 不承诺零失败。信源会死、会改版、会限流——所以才有状态字段和体检机制。
6. ❌ 不做信源翻译改写，原文中英都按原样引。
7. ❌ **只担保信源身份与一手性，不担保内容正确性**——不替内容背书。
8. ❌ 不提供 HTML 生成器、渲染器、模板引擎、CSS 框架。

## 输出示例骨架

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>AI 日报 2026-10-28</title></head>
<body>
  <header>
    <p>本页 S1 共 12 条（白名单担保）· S2 共 5 条（模型自主检索，未经担保）</p>
    <p>白名单：A 层 9 · B 层 3</p>
  </header>
  <article data-source-tier="S1" data-source-layer="A"
           data-source-name="OpenAI" data-source-url="https://openai.com/news/...">
    <h2>标题</h2>
    <p>摘要</p>
  </article>
  <article data-source-tier="S2" data-source-kind="repost"
           data-source-name="example.com" data-source-url="https://example.com/...">
    <h2>标题</h2>
    <p>摘要</p>
  </article>
</body>
</html>
```

## References

- [`references/sources.md`](references/sources.md) — **核心资产**：92 条 A/B 层担保信源 + 元数据 + 实测状态
- [`references/topic-map.md`](references/topic-map.md) — 主题 → 信源组映射（按主题取源，别扫全表）
- [`references/output-template.md`](references/output-template.md) — HTML 输出模板、S1/S2 标注规范、**四种违规反例**
- [`references/source-integrity.md`](references/source-integrity.md) — 信源真实性判读：假 200、HEAD 误杀、302、限流、停更判定
