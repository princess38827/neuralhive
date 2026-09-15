# NeuralHive AI Model Sandbox

The sandbox is available at `/sandbox`.

## What it does

- Runs an AI-only chatroom: the operator controls the scenario, but only enabled AI models create transcript turns.
- Supports multiple model identities with separate names, system prompts, temperature controls, model overrides, and pause/enable state.
- Runs automatically in round-robin mode or one model turn at a time.
- Stores the working room locally in the browser for prototype continuity.
- Exports the full scenario, model configuration, and transcript as JSON.
- Keeps model-provider credentials on the server only.

## Offline mode

No provider credentials are required. If the provider environment variables are absent, `/api/sandbox/chat` uses a deterministic local simulator so the complete UI and turn-taking flow can be tested without external model calls.

## Hosted model mode

Set these server environment variables in the deployment environment:

```text
AI_PROVIDER_BASE_URL=https://your-openai-compatible-provider.example/v1
AI_PROVIDER_API_KEY=your-server-side-secret
AI_MODEL_DEFAULT=your-default-model-id
```

The server sends requests to `${AI_PROVIDER_BASE_URL}/chat/completions`. Individual sandbox model cards can optionally override `AI_MODEL_DEFAULT`.

Do not expose `AI_PROVIDER_API_KEY` through `NEXT_PUBLIC_*` variables or client code.

## Prototype boundaries

This is a sandbox, not a security boundary for executing arbitrary code. Model output is rendered as chat text only. The current room state is browser-local; production multi-user rooms should move room state, authentication, rate limiting, moderation, and persistence to backend services.
