const { test, expect } = require('@playwright/test');
const { ChatbotPage } = require('../../pages/ChatbotPage');
const { checkA11y, injectAxe } = require('axe-playwright');
const testData = require('../../fixtures/test-data.json');

const locales = testData.locales;

locales.forEach((locale) => {

    test.describe('[${locale.name}] Chatbot UI Behavior', () => {

        let chatbot;


        test.beforeEach(async ({ page }) => {
            chatbot = new ChatbotPage(page);
            await chatbot.open(locale.path);
        });

        /* Test to verify that the chatbot UI loads correctly on desktop viewport. */
        test(`Desktop view loads correctly - ${locale.id}`, async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            await chatbot.open(locale.path);
;
            await expect(chatbot.textInput).toBeVisible();
            await expect(chatbot.sendButton).toBeVisible();
        });

        /* Test to verify that the chatbot UI loads correctly on mobile viewport. */
        test(`Mobile view loads correctly - ${locale.id}`, async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 812 });
            await chatbot.open(locale.path);

            await expect(chatbot.sendButton).toBeVisible();
            await expect(chatbot.textInput).toBeVisible();
        });

        /* Test to verify that the user can send messages via the input box. */
        test(`User can send messages via input box - ${locale.id}`, async () => {

            await chatbot.sendMessage(locale.greeting);

            await expect(chatbot.userMessages.last()).toBeVisible();
            const messageText = await chatbot.getLastUserMessageText();
            expect(messageText).toContain(locale.greeting);
        });

        /* Test to verify that the input is cleared after sending a message. */
        test(`Input field is cleared after sending - ${locale.id}`, async () => {

            await chatbot.sendMessage(locale.greeting);
            // Wait for potential UI transitions
            await chatbot.page.waitForTimeout(1000);

            const inputValue = await chatbot.getInputValue();
            expect(inputValue).toBe('');
        });

        /* Test to verify that the send button is disabled when the input is empty. */
        test(`Send button is disabled when input is empty - ${locale.id}`, async () => {
            const isDisabled = await chatbot.isSendButtonDisabled();
            expect(isDisabled).toBeTruthy();
        });

        /* Test to verify that AI responses are rendered properly in the conversation area. */
        test(`AI responses are rendered properly in conversation area - ${locale.id}`, async () => {
            await chatbot.selectChatOptionAndWaitForResponse();

            await expect(chatbot.aiMessage.last()).toBeVisible();
            const responseText = await chatbot.getLastResponseText();
            expect(responseText.length).toBeGreaterThan(0);
        });

        /* Test to verify that the chatbot applies correct text direction (LTR/RTL) based on locale. */
        test(`Applies correct ${locale.direction.toUpperCase()} text direction - ${locale.id}`, async ({ page }) => {
            const bodyDirection = await chatbot.getDirection('body');
            expect(bodyDirection).toBe(locale.direction);
        });

        /* Test to verify that message bubbles respect the text direction (LTR/RTL) based on locale. */
        test(`Message bubbles respect ${locale.direction.toUpperCase()} direction - ${locale.id}`, async () => {
           // await chatbot.sendAndWaitForResponse(locale.greeting);
             await chatbot.selectChatOptionAndWaitForResponse();
            const aiMessageDirection = await chatbot.aiMessage.last().evaluate(
                el => window.getComputedStyle(el).direction
            );
            expect(aiMessageDirection).toBe(locale.direction);
        });

        /* Test to verify that the chat area auto-scrolls to the bottom when new messages are added. */
        test(`Auto-scrolls to bottom when new messages are added - ${locale.id}`, async () => {
            for (let i = 0; i < 3; i++) {
                await chatbot.sendMessage('${locale.greeting} ${i}');
                await chatbot.page.waitForTimeout(500);
            }
            await chatbot.sendAndWaitForResponse('${locale.greeting} final');

            const scrollInfo = await chatbot.getChatAreaScrollInfo();
            const distanceFromBottom = scrollInfo.scrollHeight - scrollInfo.scrollTop - scrollInfo.clientHeight;
            // Allow small margin for rounding errors
            expect(distanceFromBottom).toBeLessThan(100);
        });

        /* Test to verify that the chatbot UI maintains basic accessibility attributes. */
        test(`Maintains basic accessibility attributes - ${locale.id}`, async ({ page }) => {
            // Textarea should have a placeholder for screen readers
            const placeholder = await chatbot.textInput.getAttribute('placeholder');
            expect(placeholder).toBeTruthy();

            // Textarea should be focusable
           // await chatbot.textInput.focus();
           // await expect(chatbot.textInput).toBeFocused();

            // Send button should be a proper <button> element
            const tagName = await chatbot.sendButton.evaluate(el => el.tagName);
            expect(tagName).toBe('BUTTON');

            await chatbot.sendMessage(locale.greeting);;

            await chatbot.waitForResponse();

            // Check user message structure
            const userMsg = chatbot.userMessages.last();
            await expect(userMsg).toBeVisible();

            // Check AI message structure
          //  const aiMsg = chatbot.aiMessage.last();
          //  await expect(aiMsg).toBeVisible();

            // Accessibility scan
            await injectAxe(page);
            await checkA11y(page, null, {
                axeOptions: {
                    runOnly: {
                        type: 'tag',
                        values: ['color-contrast']
                    }
                }
            });

        });
    

    });
});
