---
name: ai-news-hub
description: |
  汇总当天的 AI 行业新闻。抓取 111 个已实测信源(海外厂商官方博客与 RSS、IR 新闻室、
  白宫与欧盟政策源、arXiv、GitHub release/trending,国内厂商官网、中文财经媒体与 AI 媒体),
  在时间窗内过滤、去重、按"官方一手 > 聚合站 > 研究机构 > 媒体"排序,产出可直接用于选题的中文日报。
  零部署、零 API Key。
  Use this skill when the user asks for 今天的 AI 新闻 / AI 日报 / 今天 AI 圈发生了什么 /
  最近有什么 AI 大事 / 今日 AI 资讯 / AI 动态汇总,or wants the day's AI headlines gathered
  into one briefing. Triggers on phrases like "AI 日报"、"今日 AI 新闻"、"AI 圈今天"、
  "最近 AI 有什么大事"、"AI 新闻汇总"、"过去 24 小时 AI 动态"、"帮我盯一下 AI 新闻"。
  Do NOT use for:单个产品怎么用、生成口播稿或视频脚本、讲解技术原理或架构、纯论文检索
  (直接用 arXiv/HF 专项工具)、或用户只要某一个站点的某一篇内容(给链接更快)。
---

# AI News Hub

把"建一个热点站"这件需要 Docker + PostgreSQL + 模型 Key 的事,压成一份任何人拿到就能跑的配方。

## Inputs to collect

只在用户没说清时才问,以下都有合理默认:

- **时间窗**:默认 `24h`。用户说"今天""过去一天"就是 24h;说"这一周"用 `7d`。
- **关注档位**:默认全档。用户点名"只看大厂""只看开源"时,用 `--tier` 收窄。
- **输出目录**:默认当前工作目录下的 `ai-news-out/`。用户要归档到别处再指定。
- **要几条**:默认不限;用户要"五条以内"时,抓完再按排序取前 N 条。

## Procedure

1. **先定时间窗和档位**,再决定抓取范围。
   原因:全档 24 小时约 300-500 条原始条目,全部塞进上下文既贵又淹掉重点;收窄档位能把 token 压到三分之一。

2. **优先走脚本路径**(环境里有 Node.js 时):

   ```bash
   node scripts/fetch.mjs --window 24h --out ./ai-news-out
   ```

   可选参数:`--tier T1,T2` 限档位、`--group overseas,china,github` 限分组、`--limit 30` 限条数、
   `--check` 只做信源体检不抓数据、`--concurrency 12` 调并发、`--timeout 20000` 调超时(毫秒)。

   脚本已经替你做完:并发抓取、假 200 校验、时间窗过滤、标题归一化去重、分档排序、写 JSONL + Markdown。
   这样做的原因是这些步骤是确定性计算,让模型重复做只会浪费 token 且每次结果不一致。

3. **脚本不可用时走 agent 路径**:读 `references/sources.txt`,按文件里的顺序请求
   (`tier` 与 `group` 的先后就是优先级),一次请求一个地址,自己完成第 4 步。
   原因:不是所有 agent 环境都带 Node.js,配方不能绑死在脚本上。

4. **补 HTML 档**。信源表里 `kind=html` 的条目(国内厂商官网、中文财经媒体、Anthropic)脚本不处理,
   用联网读取工具直接打开这些地址,把标题、日期、链接抄进结果集。
   原因:国内厂商官网普遍没有 RSS(DeepSeek、智谱、字节、腾讯、百度、华为全都没有),
   中文财经媒体(澎湃、证券时报、财联社、36氪)同样没有 —— 只靠 feed 会漏掉国内一半的一手发布,
   而这一半恰好是 A 股/中概/政策面的选题来源。

5. **AIHOT 兜底**。当脚本和 agent 路径都没拿到足够条目时,直接取
   `https://aihot.news/api/v1/agent/latest` —— 它返回整理好的中文 Markdown,聚合了 885 个信源,
   匿名免 Key,是最省 token 的单接口方案。原因:它一个人顶几十个 feed,失败时它还能兜住底。

6. **产出口语化日报**。从抓到的条目里挑出真正值得知道的,写成中文简报:
   - 按"模型发布 / 产品与工具 / 行业与商业 / 研究与论文 / 开源生态"分栏目
   - 每条一句话说清"发生了什么 + 为什么值得关注",不要复述标题
   - 保留原文链接,并标明信源名和北京时间
   - 同一件事被多个源报道时合成一条,注明"多源印证"

   原因:抓取器只保证"不漏"和"不重",判断"这条重不重要"是模型该做的事;把选择权留给模型,
   才能产出人类愿意读的日报,而不是一份链接流水账。

7. **报健康度**。如果某些档位整体不可达(通常是本地网络限制,不是站点下线),
   在日报末尾用一行说明"X 个源本次不可达",不要假装覆盖了全部信源。
   同时说明哪些 HTML 档取到了、哪些是 SPA 渲染拿不到 —— 国内厂商官网普遍如此,这是已知限制不是失败。

## Output contract

- `<输出目录>/<YYYY-MM-DD>.jsonl` —— 每行一条:title / link / summary / published / source / tier / group
- `<输出目录>/<YYYY-MM-DD>.md` —— 按档位分组的 Markdown 日报
- 终端回复:一份 10-20 条的中文摘要 + 两三个文件路径

如果用户只要口头答案、不需要文件,就直接给摘要并说明原始数据在 `<目录>/<日期>.jsonl`。

## Failure handling

- **超时或 fetch failed**:多数是本地网络到境外站不通,不是源失效。重试一次,仍失败就跳过该源并计入不可达数,
  不要因此判定站点已死。
- **HTTP 403**:多为反爬或 UA 拦截。换一个正常浏览器 UA 再试一次;仍失败则走 `references/rules.md` 里列的
  代理或 RSSHub 中转方案。
- **HTTP 404**:URL 错了或站点改了路径。查 `references/sources.txt` 是否有更新;没有就标记这个源待复核。
- **返回 200 但正文是 HTML**:这是最危险的一类,只看状态码会把报错页当新闻条目收进来。
  信源表里的 `status` 列和 `references/rules.md` 的黑名单标出了已知这类情况,遇到新情况要顺手补进黑名单。
- **条目全是几天前的**:信源停更了。按 `freq` 列判断阈值,超时的源本次跳过,并在健康度里标出。
- **窗口内一条都没有**:先跑 `--check` 看是不是全部源不可达;是的话优先退到第 5 步的 AIHOT 单接口。

## Examples

Input:「今天 AI 圈有什么大事?」
Output:抓取 24 小时窗口,输出 12-15 条中文简报,分模型发布 / 产品工具 / 行业商业 / 开源四栏,
每条带原文链接和信源名,并注明"3 个源本次不可达(境外网络限制)"。

Input:「只看开源生态这周有什么动静」
Output:`node scripts/fetch.mjs --window 7d --tier GH --out ./ai-news-out`,
产出以 GitHub trending 和主要仓库 release 为主的中文摘要。

## Windows (win32) platform notes

- 脚本用 Node.js 写,跨平台,Windows 直接跑 `node scripts\fetch.mjs --window 24h --out .\ai-news-out`。
- `node` 不在 PATH 时先确认:`node --version`。本机验证版本为 v24.16.0。
- 没有 Node.js 的 Windows 环境:跳过脚本,走第 3 步的 agent 路径,用联网读取工具直接请求信源表里的地址。
- Windows 自带 `curl.exe` 但不带 `curl`;若需要手动调单个 feed,用 `curl.exe -sSL --compressed -m 20 -A "Mozilla/5.0" "<url>"`。
  Windows 的 schannel 证书吊销检查在离线时会误报连接失败,必要时加 `--ssl-no-revoke`。
- 输出目录用反斜杠或正斜杠都行,脚本内部会做路径解析。

## 参考

- 信源表(机器可读):`references/sources.txt`
- 抓取/去重/排序规则、已知坏源清单、开源选型背景、使用许可:`references/rules.md`
- 同类产品全量调研(124 个站 / 53 个开源项目,含被劫持域名与停更名单):`references/landscape.md`
