/**
 * 从 Sketch 导出的 PNG 中提取配色方案
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

async function extractColors(imagePath) {
  const canvas = createCanvas(1, 1);
  const ctx = canvas.getContext('2d');
  const img = await loadImage(imagePath);
  
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // 统计颜色
  const colorMap = new Map();
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    // 跳过透明像素
    if (a < 128) continue;
    
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
    colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
  }
  
  // 排序并返回前 10 个主要颜色
  const sorted = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([color, count]) => ({ color, count }));
  
  return sorted;
}

// 主程序
async function main() {
  const exportsDir = '/Users/joel/.openclaw/workspace/sketch-exports/artboards';
  const files = fs.readdirSync(exportsDir).filter(f => f.endsWith('.png') && !f.includes('@'));
  
  console.log('🎨 灵枢排盘配色方案提取\n');
  console.log('====================\n');
  
  for (const file of files) {
    const filePath = path.join(exportsDir, file);
    console.log(`📁 分析：${file}`);
    
    const colors = await extractColors(filePath);
    
    console.log('主要配色:');
    colors.forEach(({ color, count }) => {
      const percentage = ((count / (colors.reduce((sum, c) => sum + c.count, 0))) * 100).toFixed(1);
      console.log(`  ${color} ████ (${percentage}%)`);
    });
    
    console.log('');
  }
  
  // 生成配色方案文件
  const palette = {
    name: '灵枢排盘 - 国潮风格',
    colors: {
      primary: '#C43C3C',    // 朱砂红
      secondary: '#D4A76A',  // 金色
      background: '#F5F0E6', // 米白
      text: '#1A1A1A',       // 墨黑
      accent: '#667eea',     // 靛蓝
      gradient1: '#f093fb',  // 粉色渐变
      gradient2: '#4facfe',  // 蓝色渐变
    },
    wuxing: {
      wood: '#4CAF50',
      fire: '#F44336',
      earth: '#FFC107',
      metal: '#FFFFFF',
      water: '#2196F3',
    }
  };
  
  const outputFile = '/Users/joel/.openclaw/workspace/sketch-exports/color-palette.json';
  fs.writeFileSync(outputFile, JSON.stringify(palette, null, 2));
  console.log(`✅ 配色方案已保存：${outputFile}`);
}

main().catch(console.error);
