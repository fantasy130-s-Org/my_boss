import OpenAI from 'openai';

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate AI evaluation for a boss based on their scores
 */
export async function generateBossEvaluation(
  totalScore: number,
  dimensionScores: {
    business: number;
    leadership: number;
    communication: number;
    accountability: number;
    care: number;
  }
): Promise<string> {
  const prompt = `你是一个幽默风趣的职场观察员。请根据以下老板评分生成一段简短的评价（150字以内）：

总分：${totalScore}/100 (分数越低，老板越差)

各维度得分（满分20分）：
- 业务水平：${dimensionScores.business}/20
- 指挥水平：${dimensionScores.leadership}/20
- 沟通水平：${dimensionScores.communication}/20
- 背锅水平：${dimensionScores.accountability}/20
- 关怀水平：${dimensionScores.care}/20

要求：
1. 语气轻松幽默，带点调侃但不过分尖酸
2. 简明扼要，重点突出得分最低的1-2个维度
3. 给出建设性的评论或建议
4. 适合打工人发朋友圈吐槽
5. 不要使用"您"等尊称，用"这位老板"或"你老板"

直接输出评价内容，不要有标题或前缀。`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '你是一个幽默风趣的职场评论员，擅长用轻松调侃的语气评价老板。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 300,
    });

    return completion.choices[0]?.message?.content || '评价生成失败，请稍后重试';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return 'AI评价暂时不可用，但这不影响你老板的分数 😄';
  }
}
