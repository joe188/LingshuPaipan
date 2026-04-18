#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

const harnessDir = path.join(__dirname, 'cli-anything-repo', 'sketch', 'agent-harness');
const inputFile = path.join(__dirname, 'lingshu-sketch-design.json');
const outputFile = path.join(__dirname, 'lingshu-paipan.sketch');

try {
  console.log('🎨 正在生成 Sketch 设计稿...');
  const result = execSync(
    `node src/cli.js build -i ${inputFile} -o ${outputFile}`,
    { cwd: harnessDir, encoding: 'utf-8' }
  );
  console.log('✅ Sketch 文件生成成功！');
  console.log(result);
  console.log(`📁 文件位置：${outputFile}`);
} catch (error) {
  console.error('❌ 生成失败:', error.message);
  process.exit(1);
}
