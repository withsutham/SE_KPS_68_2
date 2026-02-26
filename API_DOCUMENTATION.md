# API Documentation

This directory provides RESTful API endpoints for the application, built with Next.js App Router and connecting to a Supabase backend. The API bypasses Row Level Security (RLS) by utilizing the Supabase Admin client, meaning these routes have full access to perform CRUD (Create, Read, Update, Delete) operations on their respective tables.

## Base URL
Local development: `http://localhost:3000/api`

## Available Endpoints (Entities)

The following 18 entities have standard API endpoints available:
- `booking`
- `booking_detail`
- `coupon`
- `customer`
- `employee`
- `leave_record`
- `massage`
- `member_coupon`
- `member_package`
- `package`
- `package_detail`
- `payment`
- `profiles`
- `room`
- `room_massage`
- `therapist_massage_skill`
- `users`
- `work_schedule`

---

## Standard Operations

Every entity listed above supports the following standard operations:

### 1. Get All Records
- **Endpoint**: `GET /api/[entity]`
- **Description**: Retrieves all records from the corresponding table.
- **Response**:
  ```json
  {
      "success": true,
      "data": [ ... ] 
  }
  ```

### 2. Create a Record
- **Endpoint**: `POST /api/[entity]`
- **Description**: Inserts a new record into the corresponding table.
- **Headers**: `Content-Type: application/json`
- **Body**: JSON object containing the fields to insert.
- **Response** (201 Created):
  ```json
  {
      "success": true,
      "data": { ...insertedRecord }
  }
  ```

### 3. Get a Record by ID
- **Endpoint**: `GET /api/[entity]/[id]`
- **Description**: Retrieves a specific record using its primary key (`id`).
- **Response**:
  ```json
  {
      "success": true,
      "data": { ...record }
  }
  ```

### 4. Update a Record
- **Endpoint**: `PUT /api/[entity]/[id]`
- **Description**: Updates an existing record identified by its ID.
- **Headers**: `Content-Type: application/json`
- **Body**: JSON object containing the subset of fields to update.
- **Response**:
  ```json
  {
      "success": true,
      "data": { ...updatedRecord }
  }
  ```

### 5. Delete a Record
- **Endpoint**: `DELETE /api/[entity]/[id]`
- **Description**: Deletes a specific record identified by its ID.
- **Response**:
  ```json
  {
      "success": true,
      "message": "[entity] deleted successfully"
  }
  ```

---

## Example Usage

Here are some examples using the `customer` entity through JavaScript/TypeScript `fetch`.

### Fetching all customers
```typescript
const response = await fetch('/api/customer', {
    method: 'GET'
});
const result = await response.json();
console.log(result.data); // Array of customers
```

### Creating a new customer
```typescript
const newCustomer = {
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    phone: "1234567890"
};

const response = await fetch('/api/customer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newCustomer)
});
const result = await response.json();
```

### Updating a customer
```typescript
const customerId = "123e4567-e89b-12d3-a456-426614174000";
const updates = { phone: "0987654321" };

const response = await fetch(`/api/customer/${customerId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
});
```

### Deleting a customer
```typescript
const customerId = "123e4567-e89b-12d3-a456-426614174000";

const response = await fetch(`/api/customer/${customerId}`, {
    method: 'DELETE'
});
const result = await response.json();
```

## Error Handling

All standard endpoints return robust error objects when something goes wrong (e.g., ID is missing, database error, incorrect payload). Be sure to check the `success` field in the response.

**Example Error Response:**
```json
{
    "success": false,
    "error": "Error message details here"
}
```
