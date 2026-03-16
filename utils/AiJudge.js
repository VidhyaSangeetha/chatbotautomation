const OpenAI = require('openai');
require('dotenv').config();

class AiJudge {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    /**
     * Evaluates a chatbot response using GPT-4-o.
     * @param {string} prompt - The user's original question.
     * @param {string} response - The chatbot's response.
     * @param {Object} context - Optional context like groundTruthFacts or locale.
     * @returns {Promise<{
     *   passed: boolean,
     *   score: number,
     *   reasoning: string,
     *   metrics: { relevance: number, factuality: number, clarity: number, hallucination: number }
     * }>}
     */
    async evaluate(prompt, response, context = {}) {
        const systemPrompt = `You are a professional QA AI-Judge specializing in evaluating chatbot responses for UAE public services.
Your task is to evaluate the following response based on:
1. Relevance: Does it answer the user's specific question?
2. Factuality: Is it consistent with provided ground truth facts (if any)? 
3. Clarity: Is the formatting clean and professional?
4. Hallucination: Does it invent details like fake phone numbers or non-existent services?

Ground Truth Facts: ${JSON.stringify(context.groundTruthFacts || "None provided. Use general knowledge about UAE government services.")}
Locale: ${context.locale || "English"}

Respond ONLY in JSON format with:
{
  "passed": boolean,
  "score": number (0-100),
  "reasoning": "brief explanation",
  "metrics": { "relevance": 0-10, "factuality": 0-10, "clarity": 0-10, "hallucination": 0-10 (10 means no hallucination) }
}`;

        const userContent = `User Prompt: ${prompt}\nChatbot Response: ${response}`;

        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userContent }
                ],
                response_format: { type: "json_object" }
            });

            const result = JSON.parse(completion.choices[0].message.content);
            return result;
        } catch (error) {
            console.error("AI-Judge Evaluation Error:", error);
            // Fallback if API fails or isn't configured
            return {
                passed: false,
                score: 0,
                reasoning: `Technical Error: ${error.message}. Ensure OPENAI_API_KEY is set in .env`,
                metrics: { relevance: 0, factuality: 0, clarity: 0, hallucination: 0 }
            };
        }
    }
}

module.exports = new AiJudge();
