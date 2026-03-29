# Getting Started

Follow these steps to set up the **Wellness Massage Management System** locally.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- An active [Supabase](https://supabase.com/) project (URL and API keys)

---

## 1. Clone the Repository

```bash
git clone https://github.com/withsutham/SE_KPS_68_2.git
cd SE_KPS_68_2
```

---

## 2. Install Dependencies

Navigate to the application directory and install the required packages:

```bash
cd src/application
npm install
```

---

## 3. Configure Environment Variables

Inside `src/application/` you will find a `.env.example` file.

1. **Copy** it to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. **Update** the values with your Supabase credentials:

```env
# src/application/.env.local

NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

> **Warning:** `.env.local` is ignored by Git. Never commit your `SUPABASE_SERVICE_ROLE_KEY` to version control.

---

## 4. Run the Development Server

From the `src/application/` directory:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to verify the app is running.

---

## 5. Run Unit Tests

The application includes automated unit tests for all 19 API modules using [Vitest](https://vitest.dev/). Tests use mocked Supabase clients to simulate database interactions safely.

```bash
# Run all tests once
npm run test

# Run tests in watch mode (useful during development)
npm run test:watch
```

Tests are located in `src/test/api/`.

---

## Next Steps

- **API Reference:** See [`docs/api/api-reference.md`](../api/api-reference.md) for all available endpoints.
- **UI Guidelines:** See [`src/application/README.md`](../../src/application/README.md) for component conventions and design system details.
- **AI Context:** See [`docs/guides/ai-context.md`](../guides/ai-context.md) if you are using an AI assistant to contribute to this project.
