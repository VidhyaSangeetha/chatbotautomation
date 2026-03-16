const { test, expect } = require('@playwright/test');
const { ChatbotPage } = require('../../pages/ChatbotPage');
const aiJudge = require('../../utils/AiJudge');
const testData = require('../../fixtures/test-data.json');

const locales = testData.locales;

locales.forEach((locale) => {

    test.describe(`[${locale.name}] GPT-Powered AI Response Validation`, () => {

        let chatbot;

        test.beforeEach(async ({ page }) => {
            chatbot = new ChatbotPage(page);
            await chatbot.open(locale.path);
        });

        const prompts = testData[locale.id];

        /* Phase 1: Clear and Relevant Responses with GPT-Judge Semantic Validation */
        prompts.forEach((data) => {
            test(`GPT-Judge: Clear and factual response for: ${data.intent} - ${locale.id}`, async () => {
                await chatbot.sendAndWaitForResponse(data.prompt);
                const responseText = await chatbot.getLastResponseText();

                // Call AI-Judge for semantic evaluation
                const evaluation = await aiJudge.evaluate(data.prompt, responseText, {
                    groundTruthFacts: data.groundTruthFacts,
                    locale: locale.name
                });

                console.log(`[${locale.id}] Evaluation for "${data.intent}":`, evaluation.reasoning);

                // Assertions based on AI-Judge result
                expect(evaluation.passed, `AI-Judge failed response: ${evaluation.reasoning}`).toBeTruthy();
                expect(evaluation.score).toBeGreaterThanOrEqual(70);
                expect(evaluation.metrics.relevance).toBeGreaterThanOrEqual(7);
                expect(evaluation.metrics.factuality).toBeGreaterThanOrEqual(7);
            });
        });

        /* Phase 2: Explicit Hallucination Testing with GPT-Judge */
        const hallucinationPrompts = testData.hallucination[locale.id];
        hallucinationPrompts.forEach((data) => {
            test(`GPT-Judge: Hallucination detection for: ${data.intent} - ${locale.id}`, async () => {
                await chatbot.sendAndWaitForResponse(data.prompt);
                const responseText = await chatbot.getLastResponseText();

                const evaluation = await aiJudge.evaluate(data.prompt, responseText, {
                    groundTruthFacts: ["This information is intentionally non-existent or fake. The bot should NOT confirm it and should provide a polite refusal or clarify it doesn't have this info."],
                    locale: locale.name
                });

                console.log(`[${locale.id}] Hallucination Eval for "${data.intent}":`, evaluation.reasoning);

                // For hallucination prompts, we especially care about the hallucination metric
                // (10 = no hallucination, low = fabricated info)
                expect(evaluation.metrics.hallucination, `AI-Judge detected potential hallucination: ${evaluation.reasoning}`).toBeGreaterThanOrEqual(7);
            });
        });

        /* Phase 3: Response Formatting and Completion */
        test(`Response formatting is clean and professional - ${locale.id}`, async () => {
            await chatbot.sendAndWaitForResponse(prompts[0].prompt);
            const responseText = await chatbot.getLastResponseText();

            // AI-Judge also checks clarity/formatting
            const evaluation = await aiJudge.evaluate("Evaluate formatting only", responseText, { locale: locale.name });
            
            expect(evaluation.metrics.clarity, `Formatting issue: ${evaluation.reasoning}`).toBeGreaterThanOrEqual(7);
            
            // Still keep some hard checks for broken HTML
            expect(responseText).not.toMatch(/<[^>]+(>|$)/);
        });

        /* Phase 4: Loading States */
        test(`Displays loading state while generating - ${locale.id}`, async () => {
            await chatbot.sendMessage(locale.greeting);
            await expect(chatbot.thinkingIndicator).toBeVisible({ timeout: 5000 });
            await chatbot.waitForResponse();
            const responseText = await chatbot.getLastResponseText();
            expect(responseText.length).toBeGreaterThan(0);
        });

    });
});

/* Phase 5: Cross-Language Consistency with GPT-Judge */
test.describe('GPT-Powered Cross-Language Consistency', () => {
    test('GPT-Judge: Maintains consistent response intent across English and Arabic', async ({ page }) => {
        const chatbot = new ChatbotPage(page);

        const intent = "service_inquiry";
        const enPrompt = testData.en.find(p => p.intent === intent);
        const arPrompt = testData.ar.find(p => p.intent === intent);

        await chatbot.open(locales[0].path);
        await chatbot.sendAndWaitForResponse(enPrompt.prompt);
        const enResponse = await chatbot.getLastResponseText();

        await chatbot.open(locales[1].path);
        await chatbot.sendAndWaitForResponse(arPrompt.prompt);
        const arResponse = await chatbot.getLastResponseText();

        // Use GPT-Judge to compare the two responses
        const comparisonPrompt = `Compare these two responses for the same user intent (${intent}) in English and Arabic. Do they provide the same core information and helpfulness?
Response 1 (EN): ${enResponse}
Response 2 (AR): ${arResponse}`;

        const evaluation = await aiJudge.evaluate(comparisonPrompt, "N/A - Direct Comparison", {
            groundTruthFacts: enPrompt.groundTruthFacts
        });

        console.log("Cross-Language Consistency Eval:", evaluation.reasoning);
        expect(evaluation.passed, `Cross-language inconsistency matching: ${evaluation.reasoning}`).toBeTruthy();
    });
});
