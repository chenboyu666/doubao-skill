# Doubao Skill

豆包 Skill 文档集合，用于沉淀豆包、飞书/Lark、金融分析、创意生产、浏览器任务等 Agent 工作流能力。

这个仓库不是传统 Web/App 源码项目，而是一套可被 Agent 加载和执行的技能知识库。每个技能目录都包含一个 `SKILL.md` 入口文件，并按需配套 `references/`、`scripts/`、`assets/` 等资源。

## 项目概览

- 技能数量：37 个
- 主要内容：Markdown 工作流文档、Python 辅助脚本、示例 JSON/HTML/XML 资源
- 核心目录：`.skills/`
- 适用场景：为 Agent 提供领域流程、工具调用规范、数据契约、写作模板和质量校验规则

## 目录结构

```text
.
├── .skills/
│   ├── doubao-*
│   ├── lark-*
│   ├── browser-task/
│   └── skill-creator-for-task/
├── .skill_meta_list.md
├── .gitattributes
├── .gitignore
└── README.md
```

每个技能通常采用以下结构：

```text
skill-name/
├── SKILL.md          # 技能入口和触发说明
├── references/       # 任务分流、格式规范、示例、数据契约等
├── scripts/          # 可复用的校验、渲染、生成或处理脚本
├── assets/           # 模板、示例数据或静态资源
└── agents/           # 可选的 Agent 配置
```

## 技能分类

### 豆包能力

覆盖网页应用生成、创意设计、视频生成、产品问答、可视化等场景。

代表目录：

- `.skills/doubao-app-builder`
- `.skills/doubao-creative-design`
- `.skills/doubao-creative-video`
- `.skills/doubao-qa`
- `.skills/doubao-visualization`

### 金融分析

面向个股日报、板块热度、市场热点、财报分析等任务，强调可追溯数据、事实契约、质量校验和报告渲染。

代表目录：

- `.skills/doubao-daily-stock`
- `.skills/doubao-finance-sector`
- `.skills/doubao-market-hotspot`
- `.skills/doubao-earnings-analysis`

### 飞书/Lark 工具

面向飞书文档、表格、多维表格、云空间、日历、即时消息、邮箱、任务、会议纪要等操作场景。

代表目录：

- `.skills/lark-doc`
- `.skills/lark-sheets`
- `.skills/lark-base`
- `.skills/lark-drive`
- `.skills/lark-im`
- `.skills/lark-mail`
- `.skills/lark-calendar`
- `.skills/lark-task`

### 通用任务与技能创建

包含浏览器任务处理和创建新 Skill 的规范。

代表目录：

- `.skills/browser-task`
- `.skills/skill-creator-for-task`

## 使用方式

1. 根据用户需求匹配对应技能的 frontmatter：
   - `name`
   - `description`
2. 加载对应目录下的 `SKILL.md`。
3. 按 `SKILL.md` 的分流规则读取必要的 `references/` 文件。
4. 如技能要求使用脚本，优先复用 `scripts/` 中已有工具。
5. 生成结果前执行技能要求的校验、渲染或复核流程。

## 维护建议

- 保持每个技能的 `SKILL.md` 入口清晰，`description` 应准确说明触发场景。
- 大型参考内容放入 `references/`，避免入口文件过长。
- 可重复、易出错的流程优先沉淀为 `scripts/`。
- 不提交 `__pycache__/`、`.pyc`、临时工作目录和日志文件。
- 在 Windows 环境读取中文 Markdown 时，建议显式使用 UTF-8。

## 当前注意事项

- `.skill_meta_list.md` 目前为空，可后续生成技能索引。
- 部分文档存在跨目录引用，维护时建议定期检查本地 Markdown 链接。
- 如果在 Windows 上运行 Python 校验脚本，脚本读取文本文件时应指定 `encoding="utf-8"`。

## 使用声明

本仓库内容仅限个人学习、研究与交流使用，不用于商业用途。

仓库中部分内容可能来源于公开资料、产品文档或个人整理。若相关内容涉及版权、商标、平台规则或其他权利归属，请以原权利方说明为准。若存在不当引用或侵权风险，请联系删除或调整。

仓库中部分技能目录自带独立许可证文件。使用、分发或改造前，请优先检查对应目录下的 `LICENSE.txt` 或相关授权说明，并遵守原始授权要求。
