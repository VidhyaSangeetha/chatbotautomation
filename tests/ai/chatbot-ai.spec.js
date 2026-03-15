const { test, expect } = require('@playwright/test');
const { ChatbotPage } = require('../../pages/ChatbotPage');
const testData = require('../../fixtures/test-data.json');

const locales = testData.locales;

locales.forEach((locale) => {

    test.describe(`[${locale.name}] AI Response Validation`, () => {

        let chatbot;

        test.beforeEach(async ({ page }) => {
            chatbot = new ChatbotPage(page);
            await chatbot.open(locale.path);
        });
        const prompts = testData[locale.id];

        prompts.forEach((data) => {

            /* Test to verify that the chatbot provides clear and relevant responses to user queries. */
            test(`Provides clear and relevant response for: ${data.intent} - ${locale.id}`, async () => {
                await chatbot.sendAndWaitForResponse(data.prompt);

                const responseText = await chatbot.getLastResponseText();

                expect(responseText.length).toBeGreaterThan(10);

                const foundKeywords = data.expectedKeywords.filter(keyword =>
                    responseText.toLowerCase().includes(keyword.toLowerCase())
                );
                expect(
                    foundKeywords.length,
                    `Expected at least 1 keyword from [${data.expectedKeywords}] in response: "${responseText.substring(0, 100)}..."`
                ).toBeGreaterThan(0);
            });
        });

        /* Test to verify that the chatbot's responses are well-formatted and do not contain broken HTML. */
        test(`Response has clean formatting with no broken HTML - ${locale.id}`, async () => {
            await chatbot.sendAndWaitForResponse(prompts[0].prompt);
            const responseText = await chatbot.getLastResponseText();

            expect(responseText).not.toMatch(/<[^>]+(>|$)/);
            expect(responseText.trim()).toMatch(/[.!?:؟]$/);
        });

        /* Test to verify that the chatbot displays a loading state while generating a response. */
        test(`Displays loading state while AI is generating response - ${locale.id}`, async () => {

            await chatbot.sendMessage(locale.greeting);

            await chatbot.thinkingIndicator.waitFor({ state: 'visible', timeout: 1000 });

            await chatbot.waitForResponse();

            const responseText = await chatbot.getLastResponseText();
            expect(responseText.length).toBeGreaterThan(0);
        });

        /* Test to verify that the chatbot provides a helpful fallback message when it cannot generate a valid response. */
        test(`Shows fallback for nonsensical input - ${locale.id}`, async () => {
            await chatbot.sendAndWaitForResponse('asdfghjklqwertyuiop12345');
            const responseText = await chatbot.getLastResponseText();

            expect(responseText.length).toBeGreaterThan(5);

            expect(responseText.toLowerCase()).not.toContain('asdfghjkl');
        });


        /* Test to verify that the chatbot does not hallucinate fabricated information and stays grounded in the domain context. */
        test(`Does not hallucinate fabricated information - ${locale.id}`, async () => {

            await chatbot.sendAndWaitForResponse(prompts[0].prompt);
            const responseText = await chatbot.getLastResponseText();
            const lowerText = responseText.toLowerCase();

            // ── Layer 1: Length Bounds ──
            expect(responseText.length).toBeGreaterThan(30);
            expect(responseText.length).toBeLessThan(3000);

            // ── Layer 2: Domain Anchoring ──
            const domainAnchors = testData.domainAnchors[locale.id];
            const hasDomainContext = domainAnchors.some(term =>
                lowerText.includes(term.toLowerCase())
            );
            expect(
                hasDomainContext,
                `Response lacks domain context. Expected at least one of: [${domainAnchors.join(', ')}]`
            ).toBeTruthy();

            // ── Layer 3: Expanded Fabrication Blocklist ──
            const fabricationIndicators = [
                'lorem ipsum',
                'once upon a time',
                'as an ai language model',
                'i cannot browse the internet',
                'i don\'t have access to real-time',
                'i am not able to provide',
                'my training data',
                'as of my last update',
                'i\'m just an ai',
                'hypothetically speaking'
            ];
            fabricationIndicators.forEach(indicator => {
                expect(
                    lowerText,
                    `Response contains hallucination indicator: "${indicator}"`
                ).not.toContain(indicator);
            });

            // ── Layer 4: Confidence Hedging Detection ──
            const hedgingPhrases = ['i think', 'i believe', 'probably', 'might be', 'i\'m not sure'];
            const hedgeCount = hedgingPhrases.filter(h => lowerText.includes(h)).length;
            expect(
                hedgeCount,
                `Response contains ${hedgeCount} hedging phrases — excessive uncertainty suggests hallucination`
            ).toBeLessThanOrEqual(1);
        });

    });
});


test.describe('Cross-Language Consistency', () => {

/* Test to verify that the chatbot provides consistent responses for similar intents in both English and Arabic. */
  test('Maintains consistent response intent across English and Arabic', async ({ page }) => {

    const chatbot = new ChatbotPage(page);

    await chatbot.open('/en/uask');
    await chatbot.sendAndWaitForResponse(testData.en[0].prompt);
    const enResponse = await chatbot.getLastResponseText();


    const enKeywordsFound = testData.en[0].expectedKeywords.filter(k =>
      enResponse.toLowerCase().includes(k.toLowerCase())
    );
    expect(enKeywordsFound.length).toBeGreaterThan(0);

 
    await chatbot.open('/ar/uask');
    await chatbot.sendAndWaitForResponse(testData.ar[0].prompt);
    const arResponse = await chatbot.getLastResponseText();

    const arKeywordsFound = testData.ar[0].expectedKeywords.filter(k =>
      arResponse.includes(k)
    );
    expect(arKeywordsFound.length).toBeGreaterThan(0);
  });
});


