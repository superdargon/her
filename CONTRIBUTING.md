# Contributing

Thanks for helping improve 妳 / Her.

## Local Setup

1. Install root dependencies with `npm install`.
2. Install frontend dependencies with `cd frontend && npm install`.
3. Build the frontend with `npm run build` inside `frontend`.
4. Run the Electron app from the project root with `npm start`.

## Pull Requests

- Keep changes focused and easy to review.
- Do not commit generated output, local databases, logs, packaged executables, or secrets.
- Run `npm run build` in `frontend` before submitting frontend changes.
- Run `node --check main.cjs` for main process changes.

## Product Direction

The app should stay local-first, safe, and companion-oriented. Relationship and emotion systems should be driven by user interaction and conversation context, not manipulative pressure.
