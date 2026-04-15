# Feature Requests

Capabilities requested by the user.

## 2026-04-14: Summarize 技能 API Key 配置提醒

**Request**: 需要配置 summarize CLI 的 API key 才能正常使用。

**Suggested Solution**:
- 支持 OpenClaw 内置的 API key 管理，自动注入到 summarize 命令中
- 或者在 OpenClaw 配置中添加 `summarize.apiKey` 字段

**Current Workaround**:
手动设置环境变量：
```bash
export GEMINI_API_KEY="your-key-here"
# 或使用其他提供商
export OPENAI_API_KEY="..."
```

**Priority**: Medium (blocking usage)

---
