# API Reference

The application exposes RESTful API endpoints built with **Next.js App Router** and backed by **Supabase**. All routes use the Supabase Admin client (bypassing Row-Level Security) to perform full CRUD operations.

## Base URL

| Environment | URL |
| :--- | :--- |
| Local development | `http://localhost:3000/api` |

---

## Available Entities

The following 19 entities have standard API endpoints:

| Entity | Table Name |
| :--- | :--- |
| Booking | `booking` |
| Booking Detail | `booking_detail` |
| Coupon | `coupon` |
| Customer | `customer` |
| Employee | `employee` |
| Leave Record | `leave_record` |
| Massage | `massage` |
| Member Coupon | `member_coupon` |
| Member Package | `member_package` |
| Operate Time | `operate_time` |
| Package | `package` |
| Package Detail | `package_detail` |
| Payment | `payment` |
| Profiles | `profiles` |
| Room | `room` |
| Room Massage | `room_massage` |
| Therapist Massage Skill | `therapist_massage_skill` |
| Users | `users` |
| Work Schedule | `work_schedule` |

---

## Standard CRUD Operations

Every entity supports the following operations:

### Get All Records

```
GET /api/[entity]
```

**Response `200`:**
```json
{
    "success": true,
    "data": [ ... ]
}
```

---

### Create a Record

```
POST /api/[entity]
```

**Headers:** `Content-Type: application/json`  
**Body:** JSON object matching the entity's schema.

**Response `201`:**
```json
{
    "success": true,
    "data": { ...insertedRecord }
}
```

---

### Get a Record by ID

```
GET /api/[entity]/[id]
```

**Response `200`:**
```json
{
    "success": true,
    "data": { ...record }
}
```

---

### Update a Record

```
PUT /api/[entity]/[id]
```

**Headers:** `Content-Type: application/json`  
**Body:** JSON object with the fields to update.

**Response `200`:**
```json
{
    "success": true,
    "data": { ...updatedRecord }
}
```

---

### Delete a Record

```
DELETE /api/[entity]/[id]
```

**Response `200`:**
```json
{
    "success": true,
    "message": "[entity] deleted successfully"
}
```

---

## Error Handling

All endpoints return a consistent error shape when something goes wrong (missing ID, database error, invalid payload, etc.). Always check the `success` field.

```json
{
    "success": false,
    "error": "Descriptive error message"
}
```

---

## Code Examples

The examples below use the `customer` entity with the JavaScript `fetch` API.

### Fetch All Customers

```typescript
const res = await fetch('/api/customer');
const { data } = await res.json();
console.log(data); // Customer[]
```

### Create a Customer

```typescript
const res = await fetch('/api/customer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
    }),
});
const { data } = await res.json();
```

### Update a Customer

```typescript
const res = await fetch(`/api/customer/${customerId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '0987654321' }),
});
```

### Delete a Customer

```typescript
const res = await fetch(`/api/customer/${customerId}`, { method: 'DELETE' });
const { message } = await res.json();
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
| `image_src` | `text` | ❌ | Public URL to the massage image |

**Example POST body:**
```json
{
    "massage_name": "นวดน้ำมันหอมระเหย (Aromatherapy Oil Massage)",
    "massage_price": 850.00,
    "massage_time": 90,
    "image_src": "https://<project>.supabase.co/storage/v1/object/public/massage-images/aromatherapy.jpg"
}
```

---

### `operate_time`

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `operate_time_id` | `int` | Auto | Primary key (auto-increment) |
| `open_time` | `time` | ✅ | Shop opening time (e.g. `"09:00:00"`) |
| `close_time` | `time` | ✅ | Shop closing time (e.g. `"21:00:00"`) |
| `create_date` | `timestamptz` | Auto | Timestamp of record creation |

**Example POST body:**
```json
{
    "open_time": "10:00:00",
    "close_time": "22:00:00"
}
```

---

### `package`

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `package_id` | `int` | Auto | Primary key (auto-increment) |
| `package_name` | `text` | ✅ | Name of the package |
| `package_price` | `numeric` | ✅ | Total price of the package |
| `campaign_start_dateTime` | `timestamptz` | ❌ | Start of the promotion |
| `campaign_end_dateTime` | `timestamptz` | ❌ | End of the promotion |
| `image_src` | `text` | ❌ | URL to the package image |

---

### `coupon`

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `coupon_id` | `int` | Auto | Primary key (auto-increment) |
| `coupon_name` | `text` | ✅ | Name of the coupon |
| `discount_percent` | `numeric` | ✅ | Discount percentage (e.g. `10.00`) |
| `description` | `text` | ❌ | Description of the coupon |
| `collect_deadline` | `timestamptz` | ❌ | Last day the coupon can be collected |

> **Note on `GET /api/coupon`:** By default only coupons where `collect_deadline` is `null` or in the future are returned. To include expired coupons (e.g. for manager views), append `?show_all=true`.
