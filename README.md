# 妳 / Her

妳 is an open-source desktop AI companion app built with Electron, React, Express, and local SQLite/WASM storage.

The project focuses on a local-first companion experience: user-created characters, model provider configuration, relationship memory, proactive messages, persona consistency checks, and a desktop pet panel.

## Features

- Local-first desktop app, no login required by default.
- Configurable model providers: DeepSeek, OpenAI, SiliconFlow, and custom OpenAI-compatible endpoints.
- Character creation and local companion chat.
- Relationship memory driven by conversation and interaction patterns.
- Proactive message strategy controls.
- Persona stabilizer to reduce assistant-like or identity-breaking replies.
- Optional desktop pet panel.
- Local display name preference for the home welcome message.

## Tech Stack

- Electron 33
- React 19 + Vite
- Express
- sql.js
- electron-store
- TypeScript for the frontend

## Getting Started

Install root dependencies:

```bash
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Build the frontend:

```bash
cd frontend
npm run build
```

Run the desktop app from the project root:

```bash
npm start
```

Build the Windows package:

```bash
npm run build
```

The packaged app is written to `dist-her/`.

## Model Configuration

Open Settings in the app and configure a provider, API key, model, and base URL. API keys are stored locally through Electron storage and should not be committed.

## Repository Hygiene

Generated folders such as `node_modules/`, `frontend/dist/`, and `dist-her/` are ignored. Do not commit local databases, logs, environment files, or packaged executables.

## License

MIT
