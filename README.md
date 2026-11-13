# Mini Jack by MK

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:111827,50:164E63,100:06B6D4&height=200&section=header&text=Mini%20Jack&fontSize=65&fontColor=FFFFFF&animation=fadeIn&fontAlignY=38&desc=Your%20Khmer-Friendly%20AI%20Companion&descAlignY=60&descSize=17" width="100%" />
</p>

<p align="center">
  A Khmer-friendly conversational application built for natural, accessible, and everyday AI conversations.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-Powered-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini-API-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" />
</p>

---

## Overview

**Mini Jack by MK** is a Khmer-friendly conversational application designed around a clean, responsive chat interface and an approachable AI assistant experience.

Powered by the Gemini API, Mini Jack supports Khmer and English conversations, suggested prompts, animated interactions, and configurable assistant instructions.

The project is built as an independent React application using Vite and TypeScript.

## Features

- **Bilingual Conversations** — Support for Khmer and English interactions.
- **AI-Powered Responses** — Gemini API integration for conversational response generation.
- **Responsive Interface** — Optimized layouts for desktop and mobile devices.
- **Suggested Prompts** — Helpful conversation starters for new users.
- **Smooth Animations** — Animated message transitions and composing states.
- **Custom Assistant Identity** — Configurable system instructions for Mini Jack.
- **Environment Configuration** — External API configuration without hardcoding credentials into source files.

## Technology Stack

| Area | Technology |
|---|---|
| Frontend | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS 4, Custom CSS |
| Animation | Motion for React |
| Icons | Lucide React |
| AI Integration | Google Gemini API |
| SDK | `@google/genai` |

## Getting Started

### Prerequisites

Install the following before starting:

- Node.js
- npm
- A valid Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/LanKuzuMK/MK-BOT.git
cd MK-BOT
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local environment file:

```bash
cp .env.example .env.local
```

Add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Keep your actual API key private. Never commit `.env.local` or expose credentials in public repositories.

### 4. Start development

```bash
npm run dev
```

Vite will display the local development URL in your terminal.

## Production Build

Run the project checks:

```bash
npm run lint
```

Create the production build:

```bash
npm run build
```

Preview the generated production build:

```bash
npm run preview
```

The production output is generated in the `dist/` directory.

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `GEMINI_API_KEY` | Gemini API authentication key | Yes |
| `APP_URL` | Optional application URL | No |
| `DISABLE_HMR` | Optional flag to disable Vite HMR | No |

**Security Note:** Environment variables exposed through a browser-based frontend are not automatically secret. For production deployments, use a secure backend or server-side proxy to protect private API credentials. Verify the project's current API integration before deploying.

## Project Structure

```text
MK-BOT/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── lib/
│       └── utils.ts
├── index.html
├── vite.config.ts
├── package.json
├── package-lock.json
├── .env.example
└── README.md
```

## Deployment

Mini Jack is built as a Vite frontend application.

Typical deployment configuration:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Framework | Vite |
| Node.js | Compatible version required by dependencies |

Choose a static hosting provider that supports the application's production API architecture and environment configuration.

## Security

- Never publish real API keys.
- Keep `.env.local` out of Git.
- Review environment-variable exposure before production deployment.
- Avoid committing private credentials or user data.
- Keep dependencies updated.

## Contributing

Contributions and suggestions are welcome.

1. Create a feature branch.
2. Make a focused improvement.
3. Run the available project checks.
4. Submit a pull request describing your changes.

## License

This is a personal project by MK. Contact the owner before reusing its name, visual identity, copy, or interface assets.

---

<p align="center">
  **Mini Jack by MK**
  <br />
  Designed with care. Built for conversations.
  <br />
  <sub>© MK. All rights reserved.</sub>
</p>
