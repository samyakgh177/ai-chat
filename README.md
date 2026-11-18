# NexusChat

A fast, modern AI chat interface supporting multiple LLMs via OpenRouter, with real-time streaming, conversation search, and token cost tracking.

## Features

- **Multi-Model Support**: Switch between models dynamically powered by OpenRouter.
- **Real-Time Streaming**: Low-latency AI responses with markdown and code highlighting.
- **Token & Cost Counter**: Live tracking of prompt and completion tokens with estimated costs.
- **Search & Quick Navigation**: Fast debounced search across chats with `Cmd+K` shortcut.
- **Export Conversations**: Download chats as Markdown (`.md`), JSON, or copy to clipboard.

## Tech Stack

- **Framework**: Next.js 16 (Turbopack, App Router)
- **Database & ORM**: PostgreSQL & Prisma ORM
- **AI Integration**: Vercel AI SDK & OpenRouter
- **Styling**: Tailwind CSS & Base UI

## Getting Started

1. **Clone & install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file with:
   ```env
   DATABASE_URL="your-database-connection-string"
   OPENROUTER_API_KEY="your-openrouter-key"
   BETTER_AUTH_SECRET="your-secret"
   BETTER_AUTH_URL="http://localhost:3000"
   ```

3. **Run database migrations:**
   ```bash
   npx prisma db push
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to start chatting.
