#!/usr/bin/env node
/**
 * Convert gua.json (lunarPHP) to TypeScript seeds
 * Usage: node convert-gua-json.js <input.json> <output.ts>
 *
 * Input format: [{id, name, content}, ...]
 * Output format: export const LiuyaoInterpretationSeeds = [{...}];
 */

const fs = require('fs');
const path = require('path');

function main() {
  const [inputPath, outputPath] = process.argv.slice(2);

  if (!inputPath || !outputPath) {
    console.error('Usage: node convert-gua-json.js <input.json> <output.ts>');
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, 'utf-8');
  const data = JSON.parse(raw);

  const rows = data.map((item) => {
    const name = item.name || '';
    const id = item.id || '';
    const content = item.content || '';

    // Extract hexagram: first 2-3 Chinese chars ending with 卦
    let hexagramName = '';
    const hexagramMatch = name.match(/^([\u4e00-\u9fa5]{2,3}卦?)/);
    if (hexagramMatch) hexagramName = hexagramMatch[1];

    // Determine scenario by keywords
    const scenarioKeywords = ['婚姻', '恋爱', '事业', '工作', '财运', '健康', '疾病', '出行', '考试', '诉讼', '合作', '购房', '经营', '子女', '择业', '男命', '女命'];
    let scenario = 'general';
    for (const kw of scenarioKeywords) {
      if (name.includes(kw)) { scenario = kw; break; }
    }

    // Target: yao_X or hexagram
    const yaoMatch = name.match(/(\d)爻动/);
    let target = yaoMatch ? `yao_${yaoMatch[1]}` : 'hexagram';

    return {
      id,
      hexagram_name: hexagramName,
      scenario,
      target,
      yao_condition: yaoMatch ? yaoMatch[1] : null,
      content,
    };
  });

  // Generate TypeScript output
  const lines = rows.map((row, i) => `  { id: ${row.id}, hexagram_name: '${row.hexagram_name}', scenario: '${row.scenario}', target: '${row.target}', yao_condition: ${row.yao_condition ? `'${row.yao_condition}'` : 'null'}, content: \`${row.content.replace(/`/g, '\\`')}\` }${i < rows.length - 1 ? ',' : ''}`);

  const output = `// AUTO-GENERATED - DO NOT EDIT
// Source: ${path.basename(inputPath)}
// Records: ${rows.length}
// Generated: ${new Date().toISOString()}

export const LiuyaoInterpretationSeeds = [
${lines.join('\n')}
];
`;

  fs.writeFileSync(outputPath, output, 'utf-8');
  console.log(`✅ Generated ${rows.length} records to ${outputPath}`);
}

main();
