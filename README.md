# Mini Jack by MK

Mini Jack by MK is a Khmer-friendly conversational application built around a clean, responsive chat interface. It combines a focused visual identity with a practical assistant experience for everyday questions and guided conversations.

The application uses the Gemini API for response generation. The model integration is part of the product itself; this repository is an independent Vite and React project and does not depend on a hosted development studio.

## Features

- Responsive chat interface for desktop and mobile screens.
- Khmer and English conversation support.
- Suggested prompts for first-time visitors.
- Animated message transitions and a clear composing state.
- Configurable system instructions for the Mini Jack identity.
- Client-side application shell with environment-based API configuration.

## Technology

| Area | Technology |
| --- | --- |
| Frontend | React 19 and TypeScript |
| Build | Vite |
| Styling | Tailwind CSS 4 and custom CSS |
| Motion | Motion for React |
| Icons | Lucide React |
| Model API | `@google/genai` and Gemini |

## Local development

Install Node.js and npm, then install the dependencies:

```bash
npm install
```

Create a local environment file from the example:

```bash
cp .env.example .env.local
```

Set `GEMINI_API_KEY` in `.env.local` to a valid Gemini API key. Keep this file local and never commit it.

Start the development server:

```bash
npm run dev
```

The project is available at the local Vite address shown in the terminal.

## Production build

Run the TypeScript check and create the production bundle:

```bash
npm run lint
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Configuration

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Authenticates requests to the Gemini API. |
| `APP_URL` | Optional application URL used by the deployment environment. |
| `DISABLE_HMR` | Optional local flag for disabling Vite hot-module replacement. |

Never place a real API key in the repository, screenshots, issue reports, or public documentation.

## Project structure

```text
src/
  App.tsx       Chat layout, Mini Jack instructions, and message flow
  main.tsx      React entry point
  index.css     Global styles, typography, and theme tokens
  lib/utils.ts  Shared utility helpers
index.html      Document shell
vite.config.ts  Vite configuration and environment mapping
```

## Deployment

This is a standard Vite frontend. Use `npm run build` as the build command and publish the generated `dist` directory through a static host that can safely provide the required API configuration.

## License

This is a personal project. Contact the owner before reusing its name, visual identity, copy, or interface assets.
