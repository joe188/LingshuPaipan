#!/bin/bash

# Summarize 状态检查脚本
# 用法: bash check-summarize.sh

echo "🧾 Summarize 状态检查"
echo "======================"
echo ""

# 1. CLI 检查
if command -v summarize &> /dev/null; then
    echo "✅ CLI 工具: $(summarize --version)"
else
    echo "❌ CLI 工具未安装"
    exit 1
fi

# 2. 配置文件检查
CONFIG_FILE="$HOME/.summarize/config.json"
if [ -f "$CONFIG_FILE" ]; then
    echo "✅ 配置文件: $CONFIG_FILE"
    echo "   内容:"
    cat "$CONFIG_FILE" | sed 's/^/   /'
else
    echo "❌ 配置文件不存在: $CONFIG_FILE"
fi

# 3. API Key 检查
echo ""
echo "🔑 API Keys 状态:"
KEYS_FOUND=0

if [ -n "$GEMINI_API_KEY" ]; then
    echo "  ✅ GEMINI_API_KEY = ${GEMINI_API_KEY:0:10}..."
    KEYS_FOUND=$((KEYS_FOUND+1))
else
    echo "  ❌ GEMINI_API_KEY 未设置"
fi

if [ -n "$OPENAI_API_KEY" ]; then
    echo "  ✅ OPENAI_API_KEY = ${OPENAI_API_KEY:0:10}..."
    KEYS_FOUND=$((KEYS_FOUND+1))
else
    echo "  ❌ OPENAI_API_KEY 未设置"
fi

if [ -n "$ANTHROPIC_API_KEY" ]; then
    echo "  ✅ ANTHROPIC_API_KEY = ${ANTHROPIC_API_KEY:0:10}..."
    KEYS_FOUND=$((KEYS_FOUND+1))
else
    echo "  ❌ ANTHROPIC_API_KEY 未设置"
fi

if [ -n "$XAI_API_KEY" ]; then
    echo "  ✅ XAI_API_KEY = ${XAI_API_KEY:0:10}..."
    KEYS_FOUND=$((KEYS_FOUND+1))
else
    echo "  ❌ XAI_API_KEY 未设置"
fi

if [ -n "$OPENROUTER_API_KEY" ]; then
    echo "  ✅ OPENROUTER_API_KEY = ${OPENROUTER_API_KEY:0:10}..."
    KEYS_FOUND=$((KEYS_FOUND+1))
else
    echo "  ❌ OPENROUTER_API_KEY 未设置"
fi

# 4. .zshrc 检查
ZSHRC="$HOME/.zshrc"
if grep -q "GEMINI_API_KEY\|OPENAI_API_KEY\|ANTHROPIC_API_KEY\|XAI_API_KEY" "$ZSHRC" 2>/dev/null; then
    echo ""
    echo "✅ 在 $ZSHRC 中找到了 API key 设置"
else
    echo ""
    echo "⚠️  $ZSHRC 中没有保存 API key（可能仅临时设置）"
fi

# 5. 总结
echo ""
echo "======================"
if [ $KEYS_FOUND -gt 0 ]; then
    echo "✅ 配置基本完整，可以使用 summarize"
else
    echo "❌ 缺少 API key，请运行: bash scripts/setup-summarize.sh"
fi
