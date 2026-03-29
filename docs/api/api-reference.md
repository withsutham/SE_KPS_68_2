# API Reference

The application exposes RESTful API endpoints built with **Next.js App Router** and backed by **Supabase**. All routes use the Supabase Admin client (bypassing Row-Level Security) to perform full CRUD operations.

## Base URL

| Environment | URL |
| :--- | :--- |
| Local development | `http://localhost:3000/api` |

---

## Available Entities

The following 20 entities have standard CRUD API endpoints:

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
| Package Order | `package_order` |
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

---

### `package_order`

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `package_order_id` | `int` | Auto | Primary key (auto-increment) |
| `customer_id` | `int` | ✅ | FK → `customer.customer_id` |
| `package_id` | `int` | ✅ | FK → `package.package_id` |
| `order_dateTime` | `timestamptz` | Auto | Timestamp of the order |
| `total_price` | `numeric` | ✅ | Total amount charged |
| `payment_status` | `text` | Auto | Payment status (`pending`, `completed`, etc.) |

> **Note:** Use the specialized `POST /api/package_order` endpoint (see below) to create a package order — it atomically creates the order, the payment record, and the `member_package` entitlements in a single transaction.

---

## Specialized Endpoints

The following endpoints go beyond basic CRUD and encapsulate business logic. They require authentication (via Supabase session cookie) unless stated otherwise.

---

### Get Booking History (Authenticated Customer)

```
GET /api/booking/history
```

Returns all past bookings for the currently authenticated customer, with nested payment, booking detail, massage, therapist, and room data.

**Auth required:** Yes  
**Response `200`:**
```json
{
    "success": true,
    "data": [
        {
            "booking_id": 1,
            "booking_dateTime": "2026-03-01T10:00:00+07:00",
            "payment": { "payment_status": "completed", "amount": 850 },
            "booking_detail": [ { "massage": { "massage_name": "..." }, ... } ]
        }
    ]
}
```

---

### Get Dashboard Analytics (Manager)

```
GET /api/dashboard
GET /api/dashboard?from=2026-01-01&to=2026-03-31
```

Returns a comprehensive analytics payload for the manager dashboard. Supports an optional date range (`from` / `to` in `YYYY-MM-DD` format; `from` defaults to the earliest possible date, `to` defaults to today).

**Auth required:** No (admin-client; protect at the route/layout level)  
**Query params:**

| Parameter | Format | Description |
| :--- | :--- | :--- |
| `from` | `YYYY-MM-DD` | Start of the date range (inclusive) |
| `to` | `YYYY-MM-DD` | End of the date range (inclusive) |

**Response `200` payload includes:**
- KPIs: `totalRevenue`, `totalBookings`, `newCustomersThisMonth`, `avgTransactionValue`, `availableTherapists`
- Period-over-period comparisons: `prevTotalRevenue`, `prevTotalBookings`
- Charts: `revenueByDay`, `popularServices`, `peakHours`, `roomUsage`, `therapistUtilization`
- Stats: `couponRedemption`, `packageSalesUsage`
- Live boards: `therapistStatus`, `roomStatus`

---

### Get Unused Member Packages

```
GET /api/member_package/unused?customer_id=[id]
```

Returns all unused (and non-expired) `member_package` entitlements for a given customer, with nested `package_detail`, `package`, and `massage` data.

**Auth required:** No (caller must supply `customer_id`)  
**Query params:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `customer_id` | `int` | ✅ | The customer whose unused packages to return |

**Response `200`:**
```json
{
    "success": true,
    "data": [
        {
            "member_package_id": 5,
            "is_used": false,
            "massage": { "massage_name": "Swedish Massage", "massage_time": 60 },
            "package": { "package_name": "Relaxation Bundle" }
        }
    ]
}
```

---

### Delete All Package Details by Package

```
DELETE /api/package_detail/by-package/[package_id]
```

Bulk-deletes all `package_detail` rows associated with the given `package_id`. Used internally when a manager replaces a package's service list during editing.

**Auth required:** No (protect at layout level)  
**Response `200`:**
```json
{ "success": true, "message": "package details cleared successfully" }
```

---

### Create Package Order (Checkout)

```
POST /api/package_order
```

Atomically purchases a package: creates a `package_order` record, a linked `payment` record, and one `member_package` entitlement per service in the package.

**Auth required:** No (caller supplies `customer_id`)  
**Headers:** `Content-Type: application/json`  
**Body:**
```json
{
    "customer_id": 42,
    "package_id": 3,
    "total_price": 1500.00,
    "payment_method": "cash",
    "payment_slip_url": "https://..."
}
```

**Response `201`:**
```json
{ "success": true, "data": { "package_order_id": 7 } }
```

---

### Get / Update Current User Profile

```
GET /api/profile
PUT /api/profile
```

Gets or updates the customer profile associated with the currently authenticated Supabase session.

**Auth required:** Yes  
**PUT body (updatable fields only):**
```json
{
    "first_name": "สมชาย",
    "last_name": "ใจดี",
    "phone_number": "0812345678"
}
```

**Response `200`:**
```json
{ "success": true, "data": { ...customerRecord } }
```

> **Note:** `phone_number` must be 9–10 digits (hyphens/spaces are stripped automatically).

---

### Upload Massage Image

```
POST /api/upload/massage-image
```

Uploads an image file to the `massage-images` Supabase Storage bucket and returns the public URL. Used by the manager UI when creating or editing a massage service.

**Auth required:** No (protect at layout level)  
**Headers:** `Content-Type: multipart/form-data`  
**Body:** `FormData` with a `file` field containing the image file.

**Response `201`:**
```json
{ "success": true, "url": "https://<project>.supabase.co/storage/v1/object/public/massage-images/..." }
```

