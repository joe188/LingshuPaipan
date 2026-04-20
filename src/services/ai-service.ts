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
    max_tokens: 2000,
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
  const prompt = `你是一位精通周易六爻的专家。请详细解读以下卦象：

${request.question}

请从以下几个方面进行分析：
1. 卦象含义
2. 动爻解析
3. 吉凶判断
4. 建议

请用通俗易懂的语言进行解读。`;

  return await callAI(prompt);
};

/**
 * 分析八字
 */
export const analyzeBaZi = async (request: AIRequest): Promise<string> => {
  const prompt = `你是一位精通八字命理的专家。请详细解读以下八字：

${request.question}

请从以下几个方面进行分析：
1. 命局特点
2. 五行强弱
3. 性格特点
4. 运势建议

请用通俗易懂的语言进行解读。`;

  return await callAI(prompt);
};

/**
 * 分析奇门遁甲
 */
export const analyzeQiMen = async (request: AIRequest): Promise<string> => {
  const prompt = `你是一位精通奇门遁甲的专家。请详细解读以下奇门局：

${request.question}

请从以下几个方面进行分析：
1. 局象特点
2. 吉凶方位
3. 用神分析
4. 建议

请用通俗易懂的语言进行解读。`;

  return await callAI(prompt);
};

export default {
  analyzeLiuYao,
  analyzeBaZi,
  analyzeQiMen,
};
