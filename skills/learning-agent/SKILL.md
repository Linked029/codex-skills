---
name: learning-agent
description: 基于 RAG 的学习 Agent。支持 PDF 电子书的知识问答、掌握度评估、资料管理。从知识库检索资料来回答问题，支持 .md / .txt / .pdf 格式。当用户提出学习/知识类问题时自动启用。
---

# 学习 Agent（RAG）

## 工作模式

### 1. 知识问答模式
用户提问 → RAG 检索知识库 → 用检索结果作为上下文回答。

### 2. 知识掌握评估模式
按分层（了解/理解/掌握）逐级提问，评估后给出知识缺口分析。

### 3. 知识录入模式
用户放入新资料 → 告知已入库，下次查询即可命中。

## 知识库目录

```
knowledge-base/
├── books/        ← PDF/MD 电子书
├── notes/        ← Markdown 笔记
├── articles/     ← 文章资料
└── index/        ← 索引缓存（自动生成）
```

## PDF 处理

### 批量转换（推荐）
PDF 先用转换脚本转为 .md，RAG 直接读取：

```bash
# 转换 knowledge-base/books/ 下所有 PDF 为 .md
node scripts/convert-pdfs.mjs

# 指定目录
node scripts/convert-pdfs.mjs --source D:\电子书 --dest knowledge-base\books

# 强制重新转换
node scripts/convert-pdfs.mjs --force
```

转换后的 .md 文件保留原始文本结构，可手动编辑补充。

### 直接查询
如果 PDF 尚未转换，RAG 脚本会跳过它们。
请先运行转换脚本，确保知识库完整索引。

## 检索命令
```bash
node scripts/rag-query.mjs "你的问题" [--kb <路径>] [--top-k <数量>]
```

## 配合其他技能
1. 先用本 skill 检索知识库获取理论背景
2. 再切换 code-review skill 审查相关代码
3. 审查报告中引用学习阶段的资料
