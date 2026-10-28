# 主题 → 信源组映射

**按主题取源，不要扫全表。** 92 条信源全塞进上下文既贵又淹掉重点。

用法：先在下面定位主题 → 拿到对应信源名 → 去 [`sources.md`](sources.md) 查 URL、入口形态、状态、实测备注。

「主源」= 事件首发地，优先读；「补充源」= 交叉验证与背景。

---

## 1. 模型发布与能力更新

- **主源**：OpenAI News、Google DeepMind、Anthropic News、Qwen、DeepSeek、智谱、字节 Seed、MiniMax、Kimi
- **补充源**：Google AI Blog、Microsoft AI Blog、Mistral、xAI、Hugging Face Blog、腾讯混元、百度文心
- **注意**：Anthropic 无 RSS，走 sitemap + 列表页。国内厂商官网几乎全是 HTML 列表页。

## 2. 算力 · 芯片 · 数据中心

- **主源**：NVIDIA 新闻室、NVIDIA Blog、华为昇腾
- **补充源**：AMD/AWS/Amazon Science、财联社、证券时报、CNBC 财经、钛媒体
- **注意**：NVIDIA 新闻室是**财报与资本动作**的一手信号源，别只看 Blog。

## 3. 开源生态与工程实践

- **主源**：GitHub Blog AI&ML、GitHub Trending 日榜/周榜、各项目 release notes（vllm / ollama / langchain / transformers / llama.cpp / open-webui / ComfyUI / sglang / dify / lobe-chat / codex / claude-code）
- **补充源**：Hugging Face Blog、少数派、InfoQ 中文、Interconnects、Latent Space
- **注意**：release notes 是**一手**（开发者自己写的变更记录）。Trending 榜噪音大、易刷榜，单独成栏不与新闻混排。

## 4. 研究前沿与论文

- **主源**：arXiv cs.AI / cs.LG / cs.CL / cs.RO / cs.CV、MIT News AI
- **补充源**：BAIR、Stanford HAI、Allen Institute for AI、Hugging Face Daily Papers
- **注意**：arXiv 是**预印本未评审**，权威度按 3 计，不宜当事实陈述。

## 5. 政策 · 监管 · 地缘

- **主源**：白宫 News、欧盟委员会 Press Corner
- **补充源**：财联社、澎湃新闻、证券时报、华尔街见闻、404 Media
- **注意**：政策口径要看**原文**。国内财经媒体的政策转述常有二次演绎，S2 性质要标出来。

## 6. 商业 · 资本 · 并购

- **主源**：TechCrunch、CNBC AI、36氪、钛媒体
- **补充源**：CNBC 财经、TechCrunch 全站、量子位、雷峰网、证券时报、Epoch AI
- **注意**：融资/IPO/并购在 TechCrunch 全站和 AI 分类 feed 里的**覆盖差异很大**，两个都读。

## 7. 产品与应用落地

- **主源**：Google AI Blog、Microsoft AI Blog、Apple ML Research、AWS ML Blog
- **补充源**：The Verge、The Decoder、AI Business、极客公园、InfoQ 中文、爱范儿
- **注意**：产品发布常先于官方博客出现在媒体上，两边都要，别只读一边。

## 8. 国内厂商与国内动态

- **主源**：字节 Seed、腾讯混元、百度文心、DeepSeek、智谱、MiniMax、Kimi、华为昇腾、Qwen、ModelScope
- **补充源**：智源 BAAI Hub、上海 AI Lab、量子位、36氪、财联社、澎湃新闻
- **注意**：国内厂商官网**普遍无 RSS**，全部走 HTML 列表页；通义千问旧 GitHub Pages 博客已停更在 2025-09。

## 9. 具身智能 · 机器人

- **主源**：arXiv cs.RO、NVIDIA Blog、华为昇腾
- **补充源**：MIT News AI、量子位、TechCrunch、The Verge
- **注意**：这个领域**白名单覆盖薄弱**——几乎一定要主动补 S2，标「白名单未覆盖」。

## 10. 开发者社区与实践

- **主源**：GitHub Blog、GitHub Trending、InfoQ 中文
- **补充源**：少数派、IT之家、爱范儿、Latent Space、One Useful Thing
- **注意**：中文开发者社区（掘金、博客园、V2EX 系）**已出局，不在白名单**。需要时按 S2 抓取并标注。

## 11. 平台治理与内容生态

- **主源**：404 Media、白宫 News、欧盟委员会
- **补充源**：The Decoder、TechCrunch、财联社
- **注意**：版权、监管、AI 内容政策类议题，首发常在 404 Media。

## 12. 出海与全球化

- **主源**：白宫 News、欧盟委员会、TechCrunch
- **补充源**：CNBC、证券时报、华尔街见闻、财联社
- **注意**：这个领域**白名单覆盖很弱**（缺少专门做中国科技出海的英文媒体）。必须主动补 S2。

---

## 覆盖情况自查

用之前先过一遍这份清单，避免漏掉盲区：

| 主题 | 白名单覆盖 | 覆盖强度 |
|---|---|---|
| 模型发布 | 全 | 强 |
| 开源生态 | 全 | 强 |
| 研究论文 | 全 | 强 |
| 政策监管（欧美） | 全 | 强 |
| 商业资本 | 全 | 中强 |
| 算力芯片 | 全 | 中 |
| 国内厂商 | 全 | 强 |
| 产品应用 | 全 | 中强 |
| 具身智能 | 偏弱 | 弱 → 必须补 S2 |
| 出海全球化 | 偏弱 | 弱 → 必须补 S2 |
| 中文开发者社区 | 无 | 出局 → 只能 S2 |
| 新兴细分赛道 | 无 | 必然 S2 |

**弱覆盖和无覆盖的主题，S2 是主要来源，不是补充。** 这一点要在输出里体现出来（可加「本期未覆盖领域」提示）。
