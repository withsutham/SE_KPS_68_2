# Generative AI Context File

**Project:** "ฟื้นใจ" (Feun-Jai) Massage & Spa Web Application
**Framework:** Next.js (App Router), Tailwind CSS, TypeScript
**UI Library:** shadcn/ui

## Overview
This file serves as a context manifest for other Generative AI models working on this codebase. It describes the current architecture, design system, and component structure, specifically focusing on recent UI refactoring to ensure consistency when building new features or pages.

## Design System
- The project uses a premium "wellness/spa" aesthetic featuring glassmorphism (`backdrop-blur`), smooth micro-animations, and earthy tones.
- **Colors:** Theme colors are controlled via CSS variables (HSL values) in `src/application/app/globals.css`. Always use Tailwind classes like `bg-background`, `text-primary`, `bg-card`, and `border-border`. Avoid hardcoding hex codes.
- **Typography:** Custom fonts are configured in `src/application/app/layout.tsx` using `next/font/google`.
  - Heading font: `Mitr` (`font-mitr`)
  - Body font: `Sarabun` (`font-sans`)

## Codebase Architecture & Reusable Components

### 1. Global Layout (`app/layout.tsx`)
The `RootLayout` has been refactored to automatically include global UI elements. It wraps the `{children}` with:
- `<Nav />` (Navigation Bar)
- `<Footer />` (Site Footer)

**Rule for New Pages:** When creating a new page route (e.g., `app/about/page.tsx`), you **do not** need to import or render the Navbar or Footer. They are already provided by `layout.tsx`.

### 2. Extracted Global Components (`src/application/components/`)
- `nav.tsx`: The sticky top navigation bar with the logo, auth controls, and theme switcher.
- `footer.tsx`: The global footer.
- `theme-switcher.tsx`: Toggles dark/light mode.
- `auth-button.tsx`: Handles authentication state.

### 3. Homepage Components (`src/application/components/home/`)
The main homepage (`app/page.tsx`) is highly modularized. If you need to borrow layout ideas for marketing sections, check:
- `hero-section.tsx`: Large banner with glowing background effects (`mix-blend-multiply`).
- `services-section.tsx`: Grid layout using shadcn `<Card>` components.
- `features-section.tsx`: Three-column "Why Us" section with Lucide React icons.

### 4. Base UI Components (`src/application/components/ui/`)
This project utilizes shadcn/ui. Before building primitive components from scratch, check if they exist here (e.g., `button.tsx`, `card.tsx`, `badge.tsx`, `input.tsx`, `dropdown-menu.tsx`).

## Core Instructions for AI Agents
1. **Maintain Theme Consistency:** Always use predefined Tailwind color variables and font classes.
2. **Follow Component-Driven Design:** Keep `page.tsx` files small by extracting UI sections into dedicated component files.
3. **Use Absolute Imports:** Use the `@/` alias for importing components and libraries (e.g., `import { Button } from "@/components/ui/button"`).
4. **API Instructions:** For instructions related to APIs, available endpoints, and expected payloads, always refer to the `API_DOCUMENTATION.md` file located in the root directory.
