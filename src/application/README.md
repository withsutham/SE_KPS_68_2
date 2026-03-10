# ฟื้นใจ (Feun-Jai): Massage Shop Platform

Welcome to the **Feun-Jai** project repository! This is the core application for the multi-service massage shop, designed with a premium, Zen-inspired aesthetic.

## 🎯 Project Overview
This project aims to provide a seamless, "login-first" booking experience for Feun-Jai's customers. The current state includes the fully localized (Thai) and styled homepage, establishing the baseline UI/UX standards for the rest of the application.

## 🛠 Tech Stack
We are utilizing a scalable and modern web development stack:
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend/Auth**: [Supabase](https://supabase.com/)
- **Fonts**: `Mitr` (Headings) and `Sarabun` (Body) via Google Fonts.

## 🎨 UI/UX Guidelines (Feun-Jai Aesthetic)
When building new pages or components, please adhere to the established "Feun-Jai" aesthetic:
1. **Minimalism**: Utilize generous whitespace (`py-32`, `max-w-7xl` containers) to let the design breathe.
2. **Typography**: Always use class `font-mitr` for `<h1/>` through `<h6/>` tags. Body text should default to the `sans` family (Sarabun).
3. **Colors**: Rely on the predefined CSS variables in `globals.css`. The primary color is a calming "Sage" green (`bg-primary`, `text-primary`).
4. **Theme**: The application defaults to **Light Mode** to maintain a clean, spa-like feel, but dark mode is supported.

## 🚀 Getting Started Locally

### 1. Prerequisites
Ensure you have `Node.js` installed and an active Supabase project URL/Key.

### 2. Environment Variables
Create a `.env.local` file in the root directory and add your Supabase credentials (copy from `.env.example`):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Next Steps for the Team
- **Authentication**: Connect the localized Login/Register pages (`app/auth/`) to the Supabase backend workflow.
- **Booking Flow**: Develop the protected booking interface.
- **Dashboard**: Create a user dashboard for managing appointments.

