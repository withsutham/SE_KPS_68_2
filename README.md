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

### 5. API Documentation

The application provides standardized RESTful API endpoints for all 18 database tables (e.g., `profiles`, `users`, `customer`, `employee`, `booking`, `massage`, etc.).

All endpoints are located at `http://localhost:3000/api/[table_name]`.

#### Supported Operations (CRUD)

**1. Create (POST)**
- **Endpoint:** `POST /api/[table_name]`
- **Body:** JSON object matching the table schema.
- **Description:** Inserts a new record into the specified table.

**2. Read (GET)**
- **Endpoint (All):** `GET /api/[table_name]`
  - fetches all records in the table.
- **Endpoint (Single):** `GET /api/[table_name]/[id]`
  - Fetches a specific record by its primary key UUID.

**3. Update (PUT)** *(Only generated tables currently support PUT)*
- **Endpoint:** `PUT /api/[table_name]/[id]`
- **Body:** JSON object containing the fields to update.
- **Description:** Updates the specified record. 

**4. Delete (DELETE)** *(Only generated tables currently support DELETE)*
- **Endpoint:** `DELETE /api/[table_name]/[id]`
- **Description:** Deletes the specified record by its primary key.

#### Examples using the `customer` table:
*   `GET http://localhost:3000/api/customer`
*   `GET http://localhost:3000/api/customer/123e4567-e89b-12d3...`
*   `POST http://localhost:3000/api/customer` (with JSON body)
*   `PUT http://localhost:3000/api/customer/123e4567-e89b-12d3...` (with JSON body)
*   `DELETE http://localhost:3000/api/customer/123e4567-e89b-12d3...`

### 6. Running Unit Tests

The application includes automated unit testing for all 18 API modules using [Vitest](https://vitest.dev/). The tests use mocked Supabase clients to simulate database interactions safely and quickly.

**Running the tests:**
From the `src/application` folder:
```bash
npm run test
```

This will run all test suites in the `src/test/api/` directory and print a summary of which test modules pass or fail.

**Running tests in watch mode (for development):**
```bash
npm run test:watch
```