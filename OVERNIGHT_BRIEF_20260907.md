# 通宵开发简报 — 2026-09-06 23:00 → 2026-09-07 07:30

> 本文件是今晚计划任务的完整作战指令。接手会话请从头到尾读完再动手。

## 产品定义（不可动摇）

**MimicryDB is an evidence-aware, interaction-centered, community-curated knowledge base of mimicry systems across the Tree of Life.**

## 当前进度（全部已上线，38/38 测试基线）

- 迁移 001–008 全部完成且已应用到 Supabase（项目 ylrtwccsnzeckrfhqpbt，凭证在 .env，**绝不提交**）
- 0.4.0–0.4.3：live 数据管线、双源 Harvester（Crossref + OpenAlex）、三级去重阶梯、每周定时采集 workflow
- 0.6.0 策展工作台（/curator/ 三队列 + 导出/应用 + 审计日志）
- 0.7.1 研究门户（类群/文献/系统页 EN+ZH）
- 0.8.1 公开 API（/api/ 静态 JSON + Supabase REST 文档）
- 详见 docs/ROADMAP.md 的 SOP 阶段表

## 硬红线（每一步都适用）

1. 只增不删：禁止 git reset --hard / clean -fd / force push / 改写历史
2. .env 与一切密钥绝不进仓库；提交前必查 git status
3. 演示数据永远带 DEMO 标注；不编造科学事实/文献/统计；LLM 只是 extractor/screener；必须能存 contradictory evidence
4. 提交前三关：npm run check（**显式看 errors=0 行，曾因 tail 截断漏检**）+ npm test 全绿 + npm run build 成功
5. push 失败是常态（网络间歇）：重试循环每 150s 一次直至成功，期间继续本地工作
6. 完成声明必须附验证证据（命令输出/截图），禁止"应该可以了"
7. LLM/社区输入只能进 candidate 层；published 只经策展发布
8. 新功能必须带测试（基线 38，今晚目标 45+）

## 今晚任务（按序，每项独立提交+推送）

### 1. 健康检查（23:00–23:40）
全门禁跑一遍；`npm run supabase:apply` 幂等重放验证；线上站点抽查；通读 docs/。

### 2. 0.7.0 高级搜索（★★★★★）
升级 /search/（EN+ZH）为分面搜索：mimicry_type / signal_modality / evidence_grade / model_kind / kingdom / 关键词，多面 AND 组合，实时结果计数，"Download these N interactions"（复用 DataProvider.query 与下载页的 Blob 导出模式），筛选状态持久化到 URL。浏览器实测交互。

### 3. 0.6.1 前置：发布管线（★★★★★）
`scripts/curation-publish.mjs`：对 accepted 的交互候选执行 SOP Phase 18 全部校验（字段完整、本体词有效、taxonomy 可解析、重复未决则拒、溯源齐备、分配 MIMICRY:NNNNNN 稳定 ID），产出 data/curation/publish-ready.json + 审计行。**不直写 Supabase**（无 service key），在文档写明人工/未来服务交接路径。全量测试覆盖。

### 4. 0.8.0 社区贡献（★★★★☆）
/contribute/（EN+ZH）：提交交互提案 / 提交文献（DOI 走现有 crossref 解析器）/ 建议修正。全部落 candidate 层 JSON（复用导出/应用工作流与审计日志），页面带 DEMO 免责与"不可直接发布"说明。

### 5. 发布系统（SOP Phase 34）
`scripts/generate-release.mjs` → data/releases/v0.4.0/：interactions/taxa/references/ontology/systems CSV + checksums.txt + CHANGELOG.md。npm run release:data 接线。测试覆盖。

### 6. 条件项：0.5.0 LLM screening
仅当 .env 出现 LLM_API_KEY / LLM_BASE_URL / LLM_MODEL 时实现（SOP Phase 9：screening_result 含 model/version/prompt_version/raw output、阈值分层 likely/maybe/irrelevant、绝不自动发布、fixture 测试）。无凭证则跳过并在报告注明。

### 7. 语料扩充
对现有三档案采集更多页；整理 runs.json 统计进报告。

### 8. 打磨
a11y 复查、img 宽高防布局抖动、404 页一致性、构建产物体积粗查。

## 收尾（07:00–07:30，无论进展如何必须执行）

写 **OVERNIGHT_REPORT_20260907.md**：逐项交付清单（附验证证据）、阻塞项及原因、SOP 阶段表刷新、明早人工决策点。最终全门禁 + 推送。**可交付定义：线上站点可用 + 主线全绿 + 报告完整。**

## 节奏纪律

每项完成立即提交+推送（带重试循环）。时间不够的项目宁可"parked + 下一步说明"，**绝不留半成品破坏可构建性**。深夜网络若完全中断：持续本地开发+本地提交，网络恢复后统一推送。
