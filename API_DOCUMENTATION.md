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
- `operate_time`
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
const customerId = 1;
const updates = { phone: "0987654321" };

const response = await fetch(`/api/customer/${customerId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
});
```

### Deleting a customer
```typescript
const customerId = 1;

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

---

## Table Schemas

### `massage`

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `massage_id` | `int` | Auto | Primary key (auto-increment) |
| `massage_name` | `text` | ✅ | Name of the massage service |
| `massage_price` | `numeric` | ✅ | Price in Thai Baht |
| `massage_time` | `int` | ❌ | Duration in minutes (e.g. `60`, `90`, `120`) |
| `image_src` | `text` | ❌ | Public URL to the massage image (e.g. from Supabase Storage) |

**Example POST body:**
```json
{
    "massage_name": "นวดน้ำมันหอมระเหย (Aromatherapy Oil Massage)",
    "massage_price": 850.00,
    "massage_time": 90,
    "image_src": "https://<project>.supabase.co/storage/v1/object/public/massage-images/aromatherapy.jpg"
}
```

### `operate_time`

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `operate_time_id` | `int` | Auto | Primary key (auto-increment) |
| `open_time` | `time` | ✅ | Shop opening time (e.g. "09:00:00") |
| `close_time` | `time` | ✅ | Shop closing time (e.g. "21:00:00") |
| `create_date` | `timestamptz` | Auto | Timestamp of record creation |

**Example POST body:**
```json
{
    "open_time": "10:00:00",
    "close_time": "22:00:00"
}
```

### `package`

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `package_id` | `int` | Auto | Primary key (auto-increment) |
| `package_name` | `text` | ✅ | Name of the package |
| `package_price` | `numeric` | ✅ | Total price of the package |
| `campaign_start_dateTime` | `timestamptz` | ❌ | Start of the promotion |
| `campaign_end_dateTime` | `timestamptz` | ❌ | End of the promotion |
| `image_src` | `text` | ❌ | URL to the package image |

### `coupon`

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `coupon_id` | `int` | Auto | Primary key (auto-increment) |
| `coupon_name` | `text` | ✅ | Name of the coupon |
| `discount_percent` | `numeric` | ✅ | Discount percentage (e.g. `10.00`) |
| `description` | `text` | ❌ | Description of the coupon |
| `collect_deadline` | `timestamptz` | ❌ | Last day the coupon can be collected |

> **Note on `/api/coupon` GET requests:**
> By default, `GET /api/coupon` only returns coupons where `collect_deadline` is null or in the future. To retrieve all coupons (including expired ones, e.g., for manager views), append the `show_all` parameter: `GET /api/coupon?show_all=true`.
