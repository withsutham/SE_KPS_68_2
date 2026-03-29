# Wellness Massage Management System

**ฟื้นใจ (Feun-Jai)** — A premium multi-service massage shop management platform built with Next.js, Tailwind CSS, and Supabase.

---

## Documentation

| Document | Description |
| :--- | :--- |
| [Getting Started](docs/getting-started/setup.md) | Install dependencies, configure environment variables, and run the app locally |
| [API Reference](docs/api/api-reference.md) | All available REST endpoints, request/response formats, table schemas, and code examples |
| [AI Context Guide](docs/guides/ai-context.md) | Architecture overview, design system rules, and component conventions for AI assistants |
| [Application README](src/application/README.md) | Tech stack details and UI/UX guidelines for the Next.js application |

---

## Quick Start

```bash
# 1. Install dependencies
cd src/application && npm install

# 2. Copy and configure environment variables (run from src/application/)
cp .env.example .env.local   # then fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SERVICE_ROLE_KEY

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> See [docs/getting-started/setup.md](docs/getting-started/setup.md) for full setup instructions.