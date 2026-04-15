# Errors

Command failures and integration errors.

## 2026-04-14: summarize CLI 安装网络问题

**Problem**: Homebrew 安装 summarize 时多次遇到下载失败、rate limit 和 SIGKILL。

**Root Cause**: 网络不稳定，Homebrew 下载大文件时容易中断。

**Solution**: 最终通过查看 GitHub releases 手动下载并安装成功。

**Lessons**:
- 当 Homebrew 安装反复失败时，可以直接从 GitHub releases 下载预编译二进制
- macOS ARM64 版本路径: `summarize-macos-arm64-v0.13.0.tar.gz`
- 安装位置推荐: `~/.local/bin` 或 `/opt/homebrew/bin`
- 需要配置 API key 后才可使用

**Status**: ✅ summarize CLI v0.13.0 已安装到 `/opt/homebrew/bin/summarize`

---
