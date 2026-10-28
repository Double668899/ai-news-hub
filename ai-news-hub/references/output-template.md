# 输出规范：HTML + S1/S2 分层标注

**产物必须是 HTML。** 本文件规定**语义**，不规定**长相**——结构、样式、CSS、DOM 层级、是否用框架，全部由生成方自己决定。

---

## 一、三条硬约束

### 1. 每条信息必须有机器可读的层级标识

样式可以千变万化，但层级必须可解析。推荐用 `data-*` 属性（属性名可自拟，只要稳定可解析）：

```html
<article data-source-tier="S1"
         data-source-layer="A"
         data-source-name="OpenAI"
         data-source-url="https://openai.com/news/...">
```

| 属性 | 取值 | 必填 |
|---|---|---|
| `data-source-tier` | `S1` / `S2` | ✅ 必填 |
| `data-source-layer` | `A` / `B` / `—`（S2 无层级） | S1 必填 |
| `data-source-name` | 信源名（域名或品牌） | ✅ 必填 |
| `data-source-url` | 原始 URL | ✅ 必填 |
| `data-source-kind` | `repost`（可选，标注转述性质） | 可选 |

同时**人类也要能一眼看出** S1 / S2 的区别（徽章、边框、颜色、图标随你，但要有可辨识的视觉区分）。

### 2. 每个来源的 URL 必须在文档里

可点击或可见均可，但不能丢。丢失 URL 等于丢失可核查性，分层标识也就失去意义。

### 3. 页面顶部要有来源构成声明

让读者在读任何一条之前就知道这页的信任构成：

```html
<header>
  <h1>AI 日报 2026-10-28</h1>
  <p class="provenance">
    本页 S1 共 12 条（白名单担保）· S2 共 5 条（模型自主检索，未经担保）<br>
    白名单构成：A 层 9 条 · B 层 3 条
  </p>
</header>
```

---

## 二、S1 / S2 的定义与义务

| 标记 | 含义 | 义务 |
|---|---|---|
| **S1** | 命中白名单（[`sources.md`](sources.md) 的 A 层或 B 层） | 给信源名 + 原始 URL + 层标 A/B |
| **S2** | 白名单外的模型自主检索 | 给 URL + 显式标注未经担保；属转述性质时加 `data-source-kind="repost"` |

**S2 的地位是「应当主动补充」，不是「容忍的例外」**：
- 每个话题 S1 ≥ 1；白名单确实没覆盖 → 标「白名单未覆盖」并给 S2
- **S2 用于交叉验证，但不得凑数**：找到白名单外的独立来源就补；**找不到就只交 S1**，
  并在条目上标「**无 S2 交叉验证**」
- S2 不得只复述 S1 已有信息（假补充等于没补充）
- 纯官方发布的事件常常没有白名单外的独立报道——这时**不要把同一件事的转载算成 S2**

**白名单不是围栏。** 检索范围完全自由，越界不违规——只要标注诚实。

### 凑不出 S2 时的正确写法

```html
<article data-source-tier="S1" data-source-layer="A"
         data-source-name="OpenAI" data-source-url="https://openai.com/index/...">
  <h2>标题</h2>
  <p>摘要</p>
  <p class="note">无 S2 交叉验证 —— 该事件为厂商官方发布，未找到白名单外的独立报道。</p>
</article>
```

> ⚠️ **这是诚实，不是缺陷。** 凑出来的 S2 可能是编的，那比缺一条严重得多。
> 本 skill 存在的意义就是「不骗人」，一条标着「无 S2 交叉验证」的 S1，
> 比一条混着编造内容的「S1 + S2」可信得多。

---

## 三、去重与归因在 HTML 里的表现

### 同事件多源 → 合并成一条，S1 为主干

```html
<article data-source-tier="S1" data-source-layer="A"
         data-source-name="OpenAI" data-source-url="https://openai.com/news/...">
  <h2>OpenAI 发布新模型</h2>
  <p>摘要（合并各方要点）</p>
  <p class="corroboration">多源确认：3 家</p>
  <ul class="sources">
    <li data-source-tier="S1" data-source-layer="A">
      <a href="https://openai.com/news/...">OpenAI</a> — 官方发布
    </li>
    <li data-source-tier="S1" data-source-layer="B">
      <a href="https://techcrunch.com/...">TechCrunch</a> — 原创报道
    </li>
    <li data-source-tier="S2" data-source-kind="repost">
      <a href="https://example.com/...">example.com</a> — 模型自采 · 转述 · 未担保
    </li>
  </ul>
</article>
```

**主条目取层级最高的那一条**（S1 优先于 S2；同层取摘要更长的），但**所有来源都要列出并各自标层**。

### S1 与 S2 冲突 → 都保留，明确标出，不替读者裁决

```html
<article data-source-tier="S1" data-source-layer="A" data-source-name="OpenAI" data-source-url="https://openai.com/news/...">
  <h2>标题</h2>
  <p>官方说法：……</p>
  <p class="conflict">⚠ 与下方补充来源数据不一致（价格：官方称未调整 / 补充源称已下调 40%）。两说并存，请自行判断。</p>
</article>
```

### 原始公告在窗口外、但事件在窗口内密集跟进

**主条目用窗口内的来源**，官方原文挂在来源列表里并标注日期：

```html
<article data-source-tier="S1" data-source-layer="B"
         data-source-name="Ars Technica AI" data-source-url="https://arstechnica.com/ai/2026/10/...">
  <h2>标题</h2>
  <p>摘要</p>
  <ul class="sources">
    <li data-source-tier="S1" data-source-layer="B">
      <a href="https://arstechnica.com/ai/2026/10/...">Ars Technica AI</a> — 窗口内报道
    </li>
    <li data-source-tier="S1" data-source-layer="A">
      <a href="https://www.anthropic.com/news/s1-sec">Anthropic</a> — 官方原文 · 原始公告 Oct 26 · 窗口外
    </li>
  </ul>
</article>
```

> 不要把窗口外的官方原文直接当窗口内条目塞进主条目——那会让读者以为「今天刚发」。

---

## 四、四种违规反例

### ❌ 反例 1：S2 混进正文，不作标识

```html
<!-- 错：这条来自模型自采，但和 S1 条目长得一模一样 -->
<article data-source-tier="S1" data-source-layer="A" data-source-name="某聚合站"
         data-source-url="https://example.com/...">
```

**后果**：读者以为聚合站是官方发布。**这是最严重的违规**——把未担保信息伪装成担保信息，比不做分层更糟。

### ❌ 反例 2：缺 URL

```html
<!-- 错：没有 data-source-url，也没有可见链接 -->
<article data-source-tier="S1" data-source-layer="B" data-source-name="TechCrunch">
  <h2>某公司完成 10 亿美元融资</h2>
</article>
```

**后果**：无法回溯核查，分层标识形同虚设。

### ❌ 反例 3：标识不可解析

```html
<!-- 错：层级只存在于 CSS 类名 / 颜色 / 图标里，机器读不出来 -->
<article class="card accent-blue">
  <h2>标题</h2>
</article>
```

**后果**：下游工具、AI 解析器无法区分 S1/S2，分层规范失去意义。
**正解**：颜色图标可以是辅助，但**必须**同时有 `data-source-tier` 这类可解析标记。

### ❌ 反例 4：无来源构成声明

```html
<!-- 错：直接开写条目，页头没有任何信任构成说明 -->
<body>
  <article data-source-tier="S1" ...>...</article>
</body>
```

**后果**：读者要读完全文才能知道这页有多少未担保内容。

---

## 五、落盘方式

- **优先生成单个自包含 `.html` 文件**（内联 CSS），可直接双击打开、便于分发与归档。
- 环境不支持写文件时，可内联 HTML 片段输出。
- **不提供 Markdown 降级版**——规范一旦可绕过就会被绕过。
- 文件名建议 `ai-news-YYYYMMDD.html`。

## 六、可选增强

以下是**建议**，不是强制：

- 顶部加**时间窗**说明（如「覆盖 2026-10-27 18:00 → 2026-10-28 18:00」）
- 给 S2 条目加一句「**未经白名单担保**」的显式文字提示（不只靠颜色）
- 多源确认条目可加置信度标记（多源印证 / 单源未证）
- 结尾加**本期未覆盖领域**提示（让读者知道信源盲区）
