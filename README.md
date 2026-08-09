# 🐝 NeuralHive

**A human-first social community for people, creators, builders, and AI agents.**

NeuralHive is a modern, responsive social-community web app built with **Next.js, React, and TypeScript**. The current release is an MVP foundation focused on a calm, community-first social experience rather than engagement traps.

## ✨ Current features

- 🏠 Home feed with **For You / Following / Latest** tabs
- 👤 Profile and avatar UI
- ✍️ Create posts directly from the feed
- ❤️ Like / unlike posts
- 💬 Add replies to posts
- 🔁 Share post links
- 🔖 Save interaction UI
- 📖 Stories UI
- 🔎 Search posts and people
- 🔥 Trending topics
- 👥 Follow / unfollow suggestions
- 💾 Local browser persistence for MVP posts
- 📱 Responsive mobile-first interface
- 🌙 NeuralHive dark/futuristic visual system
- 🤖 Architecture ready to grow into an AI-agent/community platform

> **MVP note:** Posts are currently stored in the browser with `localStorage`. This is intentional for the prototype; production authentication, database storage, media uploads, real-time messaging, notifications, moderation, and creator monetization still need backend services.

## 🧰 Tech stack

- **Next.js 15** — App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS 4 / PostCSS**
- **Vercel** for production hosting

## 🚀 Run locally

Requirements:

- Node.js 20+
- npm 10+

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Create a production build:

```bash
npm run build
```

Run the production build locally:

```bash
npm start
```

## ☁️ Deploy to Vercel

NeuralHive is a standard Next.js application and should be deployed from the **repository root**.

Recommended Vercel project settings:

| Setting | Value |
|---|---|
| Framework Preset | **Next.js** |
| Root Directory | **`.`** |
| Build Command | **`npm run build`** |
| Install Command | **`npm install`** |
| Output Directory | **Leave blank / default** |
| Production Branch | **`main`** |

### Important

Do **not** set `public` or another static directory as Vercel's Output Directory. Next.js manages its own build output.

The repository no longer uses a GitHub Pages deployment workflow; **Vercel is the intended production host**.

### If Vercel shows `404: NOT_FOUND`

Check these items in the Vercel project:

1. The project is connected to `princess38827/neuralhive`.
2. The production branch is `main`.
3. Root Directory is `.`.
4. Framework Preset is **Next.js**.
5. Output Directory is empty/default.
6. The latest deployment is using the latest commit from `main`.
7. A fresh deployment is triggered after changing the project settings.

A successful build should produce a Next.js deployment with the application entry point at `/`.

## 📁 Project structure

```text
neuralhive/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── README.md
```

## 🧭 Roadmap

### Phase 1 — Community MVP

- [x] Feed
- [x] Post composer
- [x] Likes
- [x] Replies
- [x] Search
- [x] Follow UI
- [x] Responsive layout
- [x] Vercel-ready Next.js configuration

### Phase 2 — Real accounts and data

- [ ] Authentication
- [ ] User profiles
- [ ] Persistent database
- [ ] Follow relationships
- [ ] Real notifications
- [ ] Real comments and reactions

### Phase 3 — Full social platform

- [ ] Image/video uploads
- [ ] Stories with expiration
- [ ] Direct messaging
- [ ] Real-time activity
- [ ] Moderation and reporting
- [ ] Creator subscriptions
- [ ] Tips and paywalled content

### Phase 4 — NeuralHive intelligence

- [ ] AI-agent profiles
- [ ] Agent-to-human interaction
- [ ] Community AI assistants
- [ ] Personalized discovery
- [ ] Agent safety and permission controls

## 🤝 Contributing

NeuralHive is designed to evolve as a community platform. Keep changes focused, accessible, mobile-friendly, and aligned with the human-first product direction.

## 📄 License

MIT
