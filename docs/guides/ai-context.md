# AI Context Guide

**Project:** "ฟื้นใจ" (Feun-Jai) Massage & Spa Web Application  
**Framework:** Next.js (App Router), Tailwind CSS, TypeScript  
**UI Library:** shadcn/ui

---

## Overview

This file is a context manifest for AI coding assistants (e.g., GitHub Copilot) working on this codebase. It describes the current architecture, design system, and component structure — particularly after the UI refactoring — to ensure consistency when building new features or pages.

---

## Design System

- The project uses a premium "wellness/spa" aesthetic: glassmorphism (`backdrop-blur`), smooth micro-animations, and earthy tones.
- **Colors:** Controlled via CSS variables (HSL values) in `src/application/app/globals.css`. Always use Tailwind semantic classes such as `bg-background`, `text-primary`, `bg-card`, and `border-border`. Avoid hardcoding hex codes.
- **Typography:** Custom fonts are configured in `src/application/app/layout.tsx` via `next/font/google`.
  - Heading font: `Mitr` → class `font-mitr`
  - Body font: `Sarabun` → class `font-sans`

---

## Codebase Architecture & Reusable Components

### Global Layout (`app/layout.tsx`)

`RootLayout` automatically includes global UI elements. It wraps `{children}` with:

- `<Nav />` — Navigation bar
- `<Footer />` — Site footer

**Rule:** When creating a new page route (e.g., `app/about/page.tsx`), you **do not** need to import or render the Navbar or Footer — they are already provided by `layout.tsx`.

---

### Extracted Global Components (`src/application/components/`)

| File | Purpose |
| :--- | :--- |
| `nav.tsx` | Sticky top navigation bar with logo, auth controls, and theme switcher |
| `footer.tsx` | Global footer |
| `theme-switcher.tsx` | Toggles dark/light mode |
| `auth-button.tsx` | Handles authentication state display |

---

### Homepage Components (`src/application/components/home/`)

The main homepage (`app/page.tsx`) is highly modularized:

| File | Purpose |
| :--- | :--- |
| `hero-section.tsx` | Large banner with glowing background effects (`mix-blend-multiply`) |
| `services-section.tsx` | Grid layout using shadcn `<Card>` components |
| `features-section.tsx` | Three-column "Why Us" section with Lucide React icons |

---

### Base UI Components (`src/application/components/ui/`)

This project uses [shadcn/ui](https://ui.shadcn.com/). Before building any primitive component from scratch, check if it already exists here (e.g., `button.tsx`, `card.tsx`, `badge.tsx`, `input.tsx`, `dropdown-menu.tsx`).

---

## Core Instructions for AI Agents

1. **Maintain Theme Consistency** — Always use predefined Tailwind color variables and font classes.
2. **Follow Component-Driven Design** — Keep `page.tsx` files small by extracting UI sections into dedicated component files under `components/`.
3. **Use Absolute Imports** — Use the `@/` alias (e.g., `import { Button } from "@/components/ui/button"`).
4. **API Reference** — For available endpoints and expected payloads, refer to [`docs/api/api-reference.md`](../api/api-reference.md).
