const locators = require('../fixtures/locators.json');
/* This class represents the Chatbot page and encapsulates all interactions with it. */
class ChatbotPage {
    constructor(page) {
        // Initialize locators and page reference
        this.page = page;
        this.chatArea = page.locator(locators.chatArea);
        this.chatOptions = page.locator(locators.chatOptions);
        this.chatOption = page.locator(locators.chatOption);
        this.textInput = page.locator(locators.textInput);
        this.sendButton = page.locator(locators.sendButton);
        this.aiMessages = page.locator(locators.aiMessage);
        this.userMessages = page.locator(locators.userMessage);
        this.acceptButton = page.locator(locators.acceptButton);
    }

    /* Method to open the chatbot page and wait for it to load. */
    async open(path) {
        await this.page.goto(path, { waitUntil: 'networkidle' });
        try {
            if (await this.acceptButton.isVisible({ timeout: 60000 })) {
                await this.acceptButton.click();
            }
        } catch (e) {
            // Ignore if popup doesn't appear
        }
        await this.textInput.waitFor({ state: 'visible', timeout: 30000 });
    }

    /* Method to send a message to the chatbot. */
    async sendMessage(message) {
        await this.textInput.waitFor({ state: 'visible' });
        await this.textInput.fill(message);
        await this.sendButton.click();
    }

     /* Method to select a query and send to the chatbot. */
    async selectChatOption() {
        await this.chatOption.waitFor({ state: 'visible' });
        await this.chatOptions.first().click();
    }

    /* Method to wait for the chatbot's response after sending a message. */
    async waitForResponse() {
        await this.page.waitForTimeout(30000);
        await this.aiMessages.last().waitFor({ state: 'visible', timeout: 30000 });
        await this.page.waitForTimeout(60000);
    }

    /* Convenience method to send a message and wait for the response in one step. */
    async sendAndWaitForResponse(message) {
        await this.sendMessage(message);
        await this.waitForResponse();
    }

 /* Convenience method to select a chat option and wait for the response */
    async selectChatOptionAndWaitForResponse(idex) {
        await this.selectChatOption();
        await this.waitForResponse();
    }


    /* Method to retrieve the text of the last message from the chatbot. */
    async getLastResponseText() {
        return await this.aiMessages.last().innerText();
    }

    /* Method to retrieve the text of the last message sent by the user. */
    async getLastUserMessageText() {
        return await this.userMessages.last().innerText();
    }

    /* Method to check if the text input is visible on the page. */
    async getInputValue() {
        return await this.textInput.inputValue();
    }

    /* Method to check if the send button is disabled. */
    async isSendButtonDisabled() {
        return await this.sendButton.isDisabled();
    }

    /* Method to get the LTR/RTL direction of a specified element. */
    async getDirection(selector) {
        return await this.page.locator(selector).evaluate(el =>
            window.getComputedStyle(el).direction
        );
    }

    /* Method to get the scroll position and dimensions of the chat area. */
    async getChatAreaScrollInfo() {
        return await this.chatArea.evaluate(el => ({
            scrollTop: el.scrollTop,
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight,
        }));
    }

}
module.exports = { ChatbotPage };