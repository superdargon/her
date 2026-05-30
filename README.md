# 妳 / Her

妳是一款开源桌面 AI 陪伴软件，基于 Electron、React、Express 和本地 SQLite/WASM 存储构建。

项目目标是做一个本地优先、可自由接入大模型的陪伴应用：用户可以创建角色、配置模型服务、进行软件内聊天、记录关系记忆、管理主动消息策略，并可开启桌面宠物面板。

## 功能特性

- 本地优先的桌面应用，默认不需要登录账户。
- 支持 DeepSeek、OpenAI、SiliconFlow 和自定义 OpenAI 兼容接口。
- 支持创建角色并进行软件内陪伴聊天。
- 支持图片发送；当所选模型具备多模态能力时，可以识别用户发送的图片。
- 支持可选联网搜索增强，用于实时信息查询。
- 关系记忆会根据聊天内容和互动频率逐步变化。
- 主动消息策略可配置，包括空闲触发、发送间隔、免打扰时间和每日上限。
- 人设稳定器用于减少助手口吻、身份漂移和内部规则泄露。
- 可选桌面宠物面板。
- 支持本地自定义称呼，用于首页欢迎语。

## 技术栈

- Electron 33
- React 19 + Vite
- Express
- sql.js
- electron-store
- 前端 TypeScript

## 快速开始

安装根目录依赖：

```bash
npm install
```

安装前端依赖：

```bash
cd frontend
npm install
```

构建前端：

```bash
cd frontend
npm run build
```

从项目根目录启动桌面应用：

```bash
npm start
```

构建 Windows 安装包：

```bash
npm run build
```

构建产物会输出到 `dist-her/`。

## 模型配置

打开软件内的设置中心，配置模型服务商、API Key、模型名称和接口地址。

API Key 会通过 Electron 本地存储保存在用户电脑上，请不要提交到仓库。

## 开源注意事项

`.gitignore` 已排除 `node_modules/`、`frontend/dist/`、`dist-her/`、本地数据库、日志、环境变量文件和打包产物。

请不要提交 API Key、访问令牌、本地数据库、日志、用户数据或已打包的可执行文件。

## English

Her is an open-source desktop AI companion app built with Electron, React, Express, and local SQLite/WASM storage.

The project focuses on a local-first companion experience: user-created characters, model provider configuration, multimodal chat, optional web search, relationship memory, proactive messages, persona consistency checks, and a desktop pet panel.

## Features

- Local-first desktop app, no login required by default.
- Configurable model providers: DeepSeek, OpenAI, SiliconFlow, and custom OpenAI-compatible endpoints.
- Character creation and local companion chat.
- Image sending support; multimodal models can understand uploaded images.
- Optional web search enhancement for real-time information.
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

Generated folders such as `node_modules/`, `frontend/dist/`, and `dist-her/` are ignored. Do not commit local databases, logs, environment files, user data, packaged executables, or secrets.

## License

MIT
