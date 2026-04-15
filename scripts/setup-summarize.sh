#!/bin/bash

# Summarize API Key 自动配置脚本
# 用法: bash setup-summarize.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_DIR="$HOME/.summarize"
CONFIG_FILE="$CONFIG_DIR/config.json"
ZSHRC="$HOME/.zshrc"

echo "🧾 Summarize API Key 配置向导"
echo "================================"
echo ""

# 1. 检查 summarize 是否安装
if ! command -v summarize &> /dev/null; then
    echo "❌ summarize CLI 未安装或不在 PATH 中"
    echo "请先安装: https://github.com/steipete/summarize"
    exit 1
fi

echo "✅ summarize 已安装: $(summarize --version)"
echo ""

# 2. 读取当前配置
if [ -f "$CONFIG_FILE" ]; then
    echo "📋 当前配置:"
    cat "$CONFIG_FILE"
    echo ""
fi

# 3. 检测现有的 API keys
echo "🔍 检测可用的 API keys..."
API_KEYS=()

# 检查各种可能的 API key 环境变量
if [ -n "$GEMINI_API_KEY" ]; then
    API_KEYS+=("GEMINI_API_KEY")
    echo "  ✅ GEMINI_API_KEY 已设置"
fi
if [ -n "$OPENAI_API_KEY" ]; then
    API_KEYS+=("OPENAI_API_KEY")
    echo "  ✅ OPENAI_API_KEY 已设置"
fi
if [ -n "$ANTHROPIC_API_KEY" ]; then
    API_KEYS+=("ANTHROPIC_API_KEY")
    echo "  ✅ ANTHROPIC_API_KEY 已设置"
fi
if [ -n "$XAI_API_KEY" ]; then
    API_KEYS+=("XAI_API_KEY")
    echo "  ✅ XAI_API_KEY 已设置"
fi
if [ -n "$OPENROUTER_API_KEY" ]; then
    API_KEYS+=("OPENROUTER_API_KEY")
    echo "  ✅ OPENROUTER_API_KEY 已设置"
fi

echo ""

# 4. 选择配置方式
echo "选择配置方式:"
echo "  1) 使用已设置的环境变量"
echo "  2) 手动输入 API key"
echo "  3) 跳过（稍后手动配置）"
read -p "请输入选项 [1-3]: " choice

case $choice in
    1)
        if [ ${#API_KEYS[@]} -eq 0 ]; then
            echo "❌ 未检测到任何 API keys，请先设置环境变量或选择手动输入"
            exit 1
        fi

        echo "可用的 API keys:"
        for i in "${!API_KEYS[@]}"; do
            echo "  $((i+1))) ${API_KEYS[$i]}"
        done
        read -p "选择要使用的 API key 编号: " key_choice

        SELECTED_KEY="${API_KEYS[$((key_choice-1))]}"
        echo "✅ 选择: $SELECTED_KEY"
        ;;
    2)
        echo "选择 API key 类型:"
        echo "  1) Google Gemini (推荐)"
        echo "  2) OpenAI"
        echo "  3) Anthropic"
        echo "  4) xAI (Groq)"
        echo "  5) OpenRouter (多模型聚合)"
        read -p "请输入选项 [1-5]: " provider_choice

        case $provider_choice in
            1) VAR_NAME="GEMINI_API_KEY"; DEFAULT_MODEL="google/gemini-3-flash-preview" ;;
            2) VAR_NAME="OPENAI_API_KEY"; DEFAULT_MODEL="openai/gpt-4o" ;;
            3) VAR_NAME="ANTHROPIC_API_KEY"; DEFAULT_MODEL="anthropic/claude-sonnet-4" ;;
            4) VAR_NAME="XAI_API_KEY"; DEFAULT_MODEL="xai/grok-beta" ;;
            5) VAR_NAME="OPENROUTER_API_KEY"; DEFAULT_MODEL="openrouter/anthropic/claude-3-opus" ;;
            *) echo "无效选项"; exit 1 ;;
        esac

        read -p "输入 $VAR_NAME 的值: " API_KEY_VALUE
        export "$VAR_NAME"="$API_KEY_VALUE"
        SELECTED_KEY="$VAR_NAME"
        echo "✅ 已设置 $VAR_NAME"
        ;;
    3)
        echo "跳过配置。你可以稍后手动运行此脚本或编辑 $CONFIG_FILE"
        echo "手动设置 API key 示例:"
        echo "  export GEMINI_API_KEY=\"your-key-here\""
        exit 0
        ;;
    *)
        echo "无效选项"
        exit 1
        ;;
esac

# 5. 构建配置文件
echo ""
echo "📝 创建配置文件..."

mkdir -p "$CONFIG_DIR"

# 根据选择的 key 确定模型
case "$SELECTED_KEY" in
    GEMINI_API_KEY) MODEL="google/gemini-3-flash-preview" ;;
    OPENAI_API_KEY) MODEL="openai/gpt-4o" ;;
    ANTHROPIC_API_KEY) MODEL="anthropic/claude-sonnet-4" ;;
    XAI_API_KEY) MODEL="xai/grok-beta" ;;
    OPENROUTER_API_KEY) MODEL="openrouter/anthropic/claude-3-opus" ;;
    *) MODEL="google/gemini-3-flash-preview" ;;
esac

# 生成配置
cat > "$CONFIG_FILE" <<EOF
{
  "model": "$MODEL",
  "length": "medium",
  "max_output_tokens": 2000
}
EOF

echo "✅ 配置文件已创建: $CONFIG_FILE"
echo "   模型: $MODEL"
echo ""

# 6. 提示保存到 .zshrc（如果是临时环境变量）
if [[ "$choice" == "2" ]]; then
    echo "💾 要将 $SELECTED_KEY 永久保存到 $ZSHRC 吗？"
    read -p "这将把 export 语句追加到 .zshrc [y/N]: " save_choice
    if [[ "$save_choice" =~ ^[Yy]$ ]]; then
        echo "" >> "$ZSHRC"
        echo "# Summarize CLI 配置" >> "$ZSHRC"
        echo "export $SELECTED_KEY=\"\$$SELECTED_KEY\"" >> "$ZSHRC"
        echo "✅ 已保存到 $ZSHRC"
        echo "   运行 'source $ZSHRC' 使其立即生效"
    fi
fi

# 7. 测试配置
echo ""
echo "🧪 测试 summarize 配置..."
if [ -n "$(eval echo \$$SELECTED_KEY)" ]; then
    echo "  尝试获取帮助..."
    summarize --help > /dev/null 2>&1 && echo "✅ summarize 命令正常" || echo "⚠️  summarize 可能有兼容性问题"
else
    echo "⚠️  环境变量 $SELECTED_KEY 未在当前会话中设置"
    echo "   请运行 'source \$ZSHRC' 或重新打开终端"
fi

echo ""
echo "🎉 配置完成！"
echo ""
echo "快速使用:"
echo "  summarize \"https://example.com\""
echo "  summarize \"document.pdf\""
echo "  summarize \"https://youtu.be/xxx\" --youtube auto"
echo ""
echo "更多帮助: summarize --help"
