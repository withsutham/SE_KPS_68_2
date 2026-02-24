# Wellness Massage Management System

## Getting Started

Follow these steps to set up the project locally:

### 1. Install Dependencies
Navigate to the application directory and install the required packages:
```bash
cd src/application
npm install
```

### 2. Configure Environment Variables
Inside the `src/application` directory, you will find a `.env.example` file.
1.  **Rename/Copy** this file to `.env.local`.
2.  **Update the keys** with your Supabase credentials:

```bash
# src/application/.env.local

NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

> **Note:** `.env.local` is ignored by Git. Never share your `SUPABASE_SERVICE_ROLE_KEY` publicly.

### 3. Run the Development Server
From the `src/application` folder:
```bash
npm run dev
```

### 4. Verify the Setup
*   **Web App:** Visit [http://localhost:3000](http://localhost:3000)
*   **API Test (Profiles):** Visit [http://localhost:3000/api/profiles](http://localhost:3000/api/profiles)
*   **API Test (Auth Users):** Visit [http://localhost:3000/api/users](http://localhost:3000/api/users) (Admin Required)
*   **API Test (Single Item):** Use `api/profiles/[id]` or `api/users/[id]` with a valid UUID.