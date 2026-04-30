# 🤖 Multilingual AI Chatbot QA Framework

> **A production-grade E2E testing framework for LLM-powered public sector chatbots, specializing in Multilingual (English/Arabic) quality assurance.**

---

## 🌟 Overview

This framework was architected to solve the unique challenges of testing AI chatbots in the **UAE / International public sector context**. It validates not just the UI, but the **quality, consistency, and safety** of AI responses across different locales.

### Key Differentiators:
- **🌍 Bi-Directional (RTL/LTR) Support**: Automated UI validation for both English (Left-to-Right) and Arabic (Right-to-Left) layouts.
- **🧠 Semantic Response Validation**: Beyond simple string matching—validating that AI responses in different languages carry the same intent and factual accuracy.
- **🔒 Security & Safety Gates**: Testing for prompt injection and ensuring the AI refuses harmful content.
- **🏗️ Industrial-Strength POM**: A highly maintainable Page Object Model built with Playwright for maximum stability.

---

## 🛠️ Tech Stack

- **Engine**: [Playwright](https://playwright.dev/) (Fast, modern, and auto-waiting)
- **Language**: JavaScript / Node.js
- **Pattern**: Page Object Model (POM)
- **Reporting**: Playwright HTML Reports / Allure
- **CI/CD**: GitHub Actions Ready

---

## 📁 Framework Architecture

```
chatbot-qa-framework/
├── 📂 tests/
│   ├── 📄 chatbot-en.spec.js       # English locale test suite
│   ├── 📄 chatbot-ar.spec.js       # Arabic (RTL) locale test suite
│   └── 📄 security-guardrails.spec.js # Safety & Injection tests
├── 📂 pages/
│   ├── 📄 ChatbotPage.js           # Core POM with shared logic
│   └── 📄 BasePage.js              # Generic UI methods
├── 📂 fixtures/
│   └── 📄 test-data.json           # Multilingual test prompts & expected intents
└── playwright.config.js            # Cross-browser & Parallel config
```

---

## 🧪 Key Test Scenarios

### 1. Multilingual Parity (EN/AR)
Ensuring the AI provides equivalent quality of information in both languages. 
- *Scenario*: "Ask for public services in English, then in Arabic. Compare semantic score."

### 2. RTL UI Validation
Automated checks to ensure that when the language switches to Arabic:
- Chat bubbles align correctly.
- Input fields flip direction.
- Icons and navigation are correctly mirrored.

### 3. Response Latency & UI States
Validating the "user experience" of the AI:
- Typing indicators appear immediately.
- Fallback messages appear if the AI times out.
- Smooth transitions between suggested questions.

---

## 🚀 The "Lead" Philosophy
This project isn't just a collection of scripts; it's a **Quality Strategy**. 

In the age of LLMs, traditional "hard-coded" assertions fail. This framework uses **Intent-Based Validation** and **UI-Directional Logic** to ensure that the chatbot provides a premium experience to all users, regardless of their native language.

---

## 👩‍💻 Author
**Vidhya Sasidharan** — Senior QA Engineer | AI Quality Specialist
- 🌍 Dubai, UAE
- 💼 10+ years in Quality Engineering
- 🤖 Specialized in Multilingual AI/LLM Quality Assurance

---

> [!NOTE]
> *This framework was developed for an AI-powered service chatbot. While the original target was a specific beta environment, the underlying patterns (Multilingual POM, AI Scoring, RTL Logic) are designed to be portable to any enterprise chatbot platform.*
