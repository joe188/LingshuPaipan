/**
 * AI 服务 - 调用 AI API 进行解卦
 */

import { getAiConfig } from '../database/queries/ai-config';

interface AIRequest {
  question: string;
  provider?: string;
}

interface AIResponse {
  result: string;
}

/**
 * 调用 AI API
 */
const callAI = async (prompt: string): Promise<string> => {
  const config = await getAiConfig();
  
  if (!config) {
    throw new Error('请先在设置中配置 AI 大模型');
  }
  
  if (!config.baseUrl || !config.apiKey || !config.model) {
    throw new Error('请先在设置中配置 AI 大模型');
  }
  
  console.log('🤖 AI 配置:', {
    baseUrl: config.baseUrl,
    model: config.model,
    hasApiKey: !!config.apiKey,
  });
  
  // 构建请求 URL
  let url = config.baseUrl.replace(/\/$/, '');
  if (!url.endsWith('/v1')) {
    url = `${url}/v1`;
  }
  url = `${url}/chat/completions`;
  
  console.log('🤖 请求 URL:', url);
  
  // 构建请求体
  const body = {
    model: config.model,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 3000,
  };
  
  console.log('🤖 请求体:', JSON.stringify(body, null, 2));
  
  // 发送请求
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });
  
  console.log('🤖 响应状态:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('🤖 响应错误:', errorText);
    throw new Error(`AI API 错误: ${response.status} ${errorText}`);
  }
  
  const data = await response.json();
  console.log('🤖 响应数据:', JSON.stringify(data, null, 2));
  
  if (data.choices && data.choices.length > 0 && data.choices[0].message) {
    return data.choices[0].message.content;
  }
  
  throw new Error('AI API 返回数据格式错误');
};

/**
 * 分析六爻卦象
 */
export const analyzeLiuYao = async (request: AIRequest): Promise<string> => {
  const prompt = `你是一位精通周易六爻的专家，请按照以下六大核心维度进行系统分析：

${request.question}

【一、精准选取用神】
- 用神定位：明确代表所问之事的"主角"
- 常见用神：父母爻（长辈、文书、考试）、兄弟爻（竞争、花费）、官鬼爻（事业、压力）、妻财爻（财运、妻子）、子孙爻（子女、解忧）
- 多用神处理：取旺相之爻、动爻或临日月者为用神

【二、科学判断旺衰】
- 月建日辰：用神得月建生扶、日辰拱合则旺；被月克日冲则衰
- 动爻影响：动爻生扶用神则增旺，克害用神则减衰
- 特殊状态：注意用神是否旬空、月破、入墓等特殊情况

【三、世应关系分析】
- 世爻：代表求测者自己
- 应爻：代表对方、事情对象或环境
- 关系判断：世应相生相合为吉，相冲相克为凶

【四、动爻深度解析】
- 动爻特征：老阳、老阴为动爻，会引发爻变
- 动爻作用：动爻生克用神决定吉凶方向
- 病药原则：用神受克为"病"，生用神者为"药"

【五、卦象整体把握】
- 本卦与变卦：本卦代表现状，变卦代表发展趋势
- 六冲六合：六冲卦多主不顺，六合卦多主顺利
- 互卦分析：取本卦中间四爻，揭示事件发展过程中的隐藏因素

【六、外应结合】
- 外应定义：解卦时发生的意外现象
- 外应优先级：凶卦中突闻笑声→危机有转机；吉卦中见物品碎裂→成功但需防意外

请从以上六个方面进行详细分析，给出明确的吉凶判断和实用建议。`;

  return await callAI(prompt);
};

/**
 * 分析八字
 */
export const analyzeBaZi = async (request: AIRequest): Promise<string> => {
  const prompt = `你是一位精通八字命理的专家，请按照以下三大维度进行综合研判：

${request.question}

【一、八字命理基础分析】

1. 八字格局与日主强弱判断
- 日主旺衰：通过月令、天干地支的生扶克泄关系判断日主强弱
- 十神关系：分析正官、七杀、正印、偏印、比肩、劫财、食神、伤官、正财、偏财等十神的配置
- 五行平衡：分析八字中金木水火土五行的分布与平衡状态

2. 大运流年与应期判断
- 大运趋势：每十年一换的大运决定人生阶段的整体运势基调
- 流年应期：流年干支与大运、命局相互作用，触发具体事件
- 喜忌神定位：根据日主旺衰确定喜用神与忌神

【二、卦象系统解析】

1. 体用关系与五行生克
- 体用定位：明确区分体卦（代表问卦人）与用卦（代表所问之事）
- 五行生克分析：结合八卦五行属性，分析体用、互卦、变卦之间的生克关系
- 旺衰判断：结合季节时令判断卦气强弱

2. 互卦与变卦的进程分析
- 互卦意义：揭示事件发展过程中的隐藏因素
- 变卦定结局：变卦决定最终结果
- 卦气旺衰：结合四值影响，分析卦气在不同时段的强弱变化

【三、外应与动态因素】

1. 外应即兴整合
- 外应修正：解卦时突发的外界现象可直接修正结论
- 真实五行 > 象征五行：卦象 + 真实现象→能量翻倍

2. 灵活变通与综合判断
- 规律与灵变的辩证：遵循"体用为骨，旺衰为血，外应为气，变卦为果"的原则
- 避免机械套用：结合现实逻辑与具体问题选择解读
- 多体系交叉验证：结合八字、六爻等多种预测体系辅助判断

请从以上三个方面进行详细分析，给出明确的命局特点、五行强弱、性格特点、运势建议。`;

  return await callAI(prompt);
};

/**
 * 分析奇门遁甲
 */
export const analyzeQiMen = async (request: AIRequest): Promise<string> => {
  const prompt = `你是一位精通奇门遁甲的专家，请按照以下六大核心维度进行系统分析：

${request.question}

【一、用神选取与定位】
- 用神定位：日干代表求测人，时干代表所问之事
- 常见用神：生门（财运）、天芮星（疾病）、乙庚关系（婚姻）、惊门（官司）
- 多用神处理：明确各角色用神，通过落宫对比判断关系走向

【二、符号系统分析】
- 九星象意：天蓬（冒险）、天任（稳定）、天冲（冲动）、天辅（教育）、天英（虚荣）、天芮（问题）、天柱（损失）、天心（计划）、天禽（中庸）
- 八门吉凶：吉门（开、休、生）主顺利，凶门（死、惊、伤）主阻碍
- 八神作用：值符（权威）、螣蛇（纠缠）、太阴（谋划）、六合（合作）、白虎（压力）、玄武（暗箱）、九天（远行）、九地（隐藏）

【三、旺衰判断】
- 月令决定旺衰：结合月令判断符号能量状态（旺、相、休、囚、死）
- 八门旺衰："与我同行，旺；我生之月，休；生我之月，相；我克之月，囚；克我之月，死"
- 旺衰影响：旺相星得势，衰弱星受困

【四、内外盘与格局分析】
- 阳遁：一、八、三、四宫为内盘（主近快），九、二、七、六宫为外盘（主远慢）
- 阴遁：相反
- 伏吟局：主停滞、反复，宜静守
- 反吟局：主动荡、变数，行动需速战速决
- 特殊格局：青龙返首、朱雀跌穴、天网四张等

【五、外应结合】
- 外应本质：宇宙能量在时空节点上的具象化投射
- 外应价值：可作为盘局信息的验证或补充
- 三才共鸣：外应是天地人三才的共鸣密码

【六、应期推断】
- 内盘外盘：阳遁内盘主近快，外盘主远慢；阴遁相反
- 伏吟反吟：伏吟迟，反吟速
- 干支冲合：天盘地盘相同应本干支，相冲应对冲干支
- 空亡填实：空亡遇填实或冲实应事

请从以上六个方面进行详细分析，给出明确的局象特点、吉凶方位、用神分析、建议。`;

  return await callAI(prompt);
};

export default {
  analyzeLiuYao,
  analyzeBaZi,
  analyzeQiMen,
};
