#!/bin/bash
# 灵枢排盘 Sketch 素材导出脚本

SKETCH_FILE="/Users/joel/.openclaw/workspace/lingshu-paipan.sketch"
OUTPUT_DIR="/Users/joel/.openclaw/workspace/sketch-exports"
SKETCHTOOL="/Applications/Sketch.app/Contents/Resources/sketchtool/bin/sketchtool"

echo "🎨 开始导出灵枢排盘 Sketch 素材..."

# 创建输出目录
mkdir -p "$OUTPUT_DIR/artboards"
mkdir -p "$OUTPUT_DIR/layers"
mkdir -p "$OUTPUT_DIR/slices"

# 导出画板
echo "📐 导出画板..."
$SKETCHTOOL export artboards "$SKETCH_FILE" \
  --output="$OUTPUT_DIR/artboards" \
  --formats=png \
  --scales=1,2,3

# 导出图层
echo "🔷 导出图层..."
$SKETCHTOOL export layers "$SKETCH_FILE" \
  --output="$OUTPUT_DIR/layers" \
  --formats=png \
  --scales=1,2,3

# 导出切片
echo "✂️ 导出切片..."
$SKETCHTOOL export slices "$SKETCH_FILE" \
  --output="$OUTPUT_DIR/slices" \
  --formats=png \
  --scales=1,2,3

# 导出元数据
echo "📊 导出元数据..."
$SKETCHTOOL metadata "$SKETCH_FILE" \
  --outputJSON="$OUTPUT_DIR/metadata.json"

# 列出导出的文件
echo ""
echo "✅ 导出完成！文件列表："
echo "===================="
find "$OUTPUT_DIR" -type f -name "*.png" | sort
echo ""
echo "📁 元数据：$OUTPUT_DIR/metadata.json"
echo ""
echo "🎉 所有素材已导出到：$OUTPUT_DIR"
