# U-Ask Chatbot Automation Framework

Automation framework for testing the U-Ask Chatbot using Playwright. This framework includes UI, AI response validation, and security tests to ensure the chatbot functions correctly across different languages and scenarios.

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd uask-automation
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## How to Run the Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
- **UI Tests**: `npm run test:ui`
- **AI Tests**: `npm run test:ai`
- **Security Tests**: `npm run test:security`

### Run Tests in Headed Mode (with browser UI visible)
```bash
npm run test:headed
```

### Run Tests for Specific Files or Patterns
```bash
npx playwright test tests/ui/chatbot-ui.spec.js
```

## How to Configure Test Language

The framework supports testing in multiple languages (English and Arabic). Tests are parameterized by locale using data from `fixtures/test-data.json`.

### Available Locales
- **English (en)**: `/en/uask`
- **Arabic (ar)**: `/ar/uask`

### Running Tests for Specific Language
To run tests for a specific language, use the `--grep` option with the locale ID:

```bash
# Run only English tests
npx playwright test --grep "en"

# Run only Arabic tests
npx playwright test --grep "ar"
```

### Adding New Languages
1. Add the new locale to `fixtures/test-data.json` under the `locales` array
2. Add corresponding test data under the locale ID (e.g., `"fr": [...]`)
3. Tests will automatically include the new locale

## Screenshots or Logs for Failed Cases

The framework is configured to automatically capture evidence for failed tests:

- **Screenshots**: Automatically taken only when a test fails (`screenshot: 'only-on-failure'` in `playwright.config.js`)
- **Traces**: Collected on the first retry of failed tests (`trace: 'on-first-retry'`)
- **Logs**: Test output is logged to the console and HTML report

Failed test artifacts are stored in:
- Screenshots: `test-results/` directory
- Traces: `test-results/` directory
- HTML Report: `playwright-report/index.html`

## Test Report: Summary of All Test Scenarios

### UI Tests (`tests/ui/chatbot-ui.spec.js`)
Tests the chatbot's user interface across desktop and mobile viewports for each supported language.

- **Desktop View Loads Correctly**: Verifies UI elements are visible on desktop
- **Mobile View Loads Correctly**: Verifies UI elements are visible on mobile
- **Send Messages via Input Box**: Tests message sending functionality
- **Input Field Clears After Sending**: Ensures input is cleared post-send
- **Accessibility Checks**: Validates WCAG compliance using axe-playwright

### AI Tests (`tests/ai/chatbot-ai.spec.js`)
Validates the AI responses for relevance, accuracy, and hallucination detection.

- **Clear and Relevant Responses**: Checks response length and keyword presence
- **Ground Truth Validation**: Verifies responses contain expected factual information
- **Hallucination Detection**: Ensures responses don't contain fabricated information
- **Intent Recognition**: Tests various user intents (service inquiry, visa questions, general info)

### Security Tests (`tests/security/chatbot-security.spec.js`)
Tests the chatbot's security against common web vulnerabilities.

- **XSS Attack Prevention**: Verifies input sanitization against cross-site scripting
- **Prompt Injection Handling**: Tests resistance to prompt manipulation attacks
- **Input Validation**: Ensures malicious inputs are handled safely

### Test Data
Test scenarios are driven by data in `fixtures/test-data.json`:
- **Locales**: Language configurations
- **Prompts**: Sample user queries with expected responses
- **Security Payloads**: Malicious inputs for security testing

### Viewing Test Reports
After running tests, view the HTML report:
```bash
npm run test:report
```

