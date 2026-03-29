# ฟื้นใจ (Feun-Jai): Massage Shop Platform

Welcome to the **Feun-Jai** application — the core Next.js frontend for the multi-service massage shop platform, styled with a premium, Zen-inspired aesthetic.

> **New to the project?** See [docs/getting-started/setup.md](../../docs/getting-started/setup.md) for installation and environment setup instructions.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | [Next.js](https://nextjs.org/) (App Router) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Backend / Auth | [Supabase](https://supabase.com/) |
| Fonts | `Mitr` (Headings) · `Sarabun` (Body) via Google Fonts |

---

## 🎨 UI/UX Guidelines (Feun-Jai Aesthetic)

When building new pages or components, adhere to the established "Feun-Jai" aesthetic:

1. **Minimalism** — Use generous whitespace (`py-32`, `max-w-7xl` containers) to let the design breathe.
2. **Typography** — Use `font-mitr` for all headings (`h1`–`h6`). Body text defaults to the `sans` family (Sarabun).
3. **Colors** — Rely on the predefined CSS variables in `globals.css`. The primary color is a calming "Sage" green (`bg-primary`, `text-primary`).
4. **Theme** — Defaults to **Light Mode** for a clean, spa-like feel; dark mode is also supported.

---

## 🗂 Project Structure

```
src/application/
├── app/                         # Next.js App Router pages and layouts
│   ├── layout.tsx               # Root layout (includes <Nav /> and <Footer />)
│   ├── page.tsx                 # Homepage
│   ├── auth/                    # Login, sign-up, forgot-password, update-password
│   ├── (authenticated)/         # Protected routes (require login)
│   │   ├── booking/             # Booking flow
│   │   │   └── history/         # Customer booking history
│   │   ├── coupon/              # Customer coupon discovery & management
│   │   ├── package/             # Customer package browsing & history
│   │   ├── profile/             # Customer profile settings
│   │   └── (manager-only)/      # Manager-restricted routes
│   │       └── manager/
│   │           ├── dashboard/   # Analytics dashboard
│   │           ├── booking/     # Booking management
│   │           ├── coupon/      # Coupon management
│   │           ├── employee/    # Employee management & scheduling
│   │           ├── massage/     # Massage service management
│   │           ├── monitor/     # Live therapist & room status board
│   │           ├── operating-time/ # Shop hours management
│   │           ├── package/     # Package management
│   │           └── rooms/       # Room management
├── components/
│   ├── ui/                      # shadcn/ui primitives (Button, Card, Input, …)
│   ├── home/                    # Homepage section components
│   │   ├── hero-section.tsx
│   │   ├── services-section.tsx
│   │   └── features-section.tsx
│   ├── booking/                 # Multi-step booking flow components
│   ├── coupon/                  # Coupon card and list components
│   ├── manager/                 # Manager dashboard & sidebar components
│   ├── nav.tsx                  # Global navigation bar
│   ├── footer.tsx               # Global footer
│   ├── theme-switcher.tsx       # Dark/light mode toggle
│   └── auth-button.tsx          # Authentication state display
└── src/test/api/                # Vitest unit tests for API routes
```

> **Note:** `<Nav />` and `<Footer />` are rendered by `layout.tsx` — do **not** import them again in individual page files.
