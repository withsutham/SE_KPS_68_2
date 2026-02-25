-- ==========================================
-- 1. DROP EXISTING TABLES AND TYPES
-- ==========================================

-- Drop tables with CASCADE to handle foreign key dependencies automatically
DROP TABLE IF EXISTS booking_detail CASCADE;
DROP TABLE IF EXISTS member_package CASCADE;
DROP TABLE IF EXISTS member_coupon CASCADE;
DROP TABLE IF EXISTS payment CASCADE;
DROP TABLE IF EXISTS booking CASCADE;
DROP TABLE IF EXISTS package_detail CASCADE;
DROP TABLE IF EXISTS package CASCADE;
DROP TABLE IF EXISTS coupon CASCADE;
DROP TABLE IF EXISTS work_schedule CASCADE;
DROP TABLE IF EXISTS leave_record CASCADE;
DROP TABLE IF EXISTS therapist_massage_skill CASCADE;
DROP TABLE IF EXISTS room_massage CASCADE;
DROP TABLE IF EXISTS massage CASCADE;
DROP TABLE IF EXISTS room CASCADE;
DROP TABLE IF EXISTS employee CASCADE;
DROP TABLE IF EXISTS customer CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS user_type_enum CASCADE;
DROP TYPE IF EXISTS weekday_enum CASCADE;


-- ==========================================
-- 2. CREATE CUSTOM TYPES (ENUMS)
-- ==========================================

CREATE TYPE user_type_enum AS ENUM ('customer', 'manager', 'therapist', 'shop_owner');
CREATE TYPE weekday_enum AS ENUM ('SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT');


-- ==========================================
-- 3. CREATE TABLES
-- ==========================================

-- Supabase Auth Profile Mapping
CREATE TABLE profiles (
    profile_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_type user_type_enum NOT NULL
);

CREATE TABLE customer (
    customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT,
    email_address TEXT,
    regis_dateTime TIMESTAMPTZ DEFAULT NOW(),
    profile_id UUID REFERENCES profiles(profile_id) ON DELETE SET NULL
);

CREATE TABLE employee (
    employee_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT,
    work_since DATE,
    profile_id UUID REFERENCES profiles(profile_id) ON DELETE SET NULL
);

CREATE TABLE room (
    room_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_name TEXT NOT NULL
);

CREATE TABLE massage (
    massage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    massage_name TEXT NOT NULL,
    massage_price NUMERIC(10, 2) NOT NULL
);

CREATE TABLE room_massage (
    room_massage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capacity INT NOT NULL DEFAULT 1,
    room_id UUID REFERENCES room(room_id) ON DELETE CASCADE,
    massage_id UUID REFERENCES massage(massage_id) ON DELETE CASCADE
);

CREATE TABLE therapist_massage_skill (
    therapist_massage_skill_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employee(employee_id) ON DELETE CASCADE,
    massage_id UUID REFERENCES massage(massage_id) ON DELETE CASCADE
);

CREATE TABLE leave_record (
    leave_record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_status TEXT DEFAULT 'pending',
    start_dateTime TIMESTAMPTZ NOT NULL,
    end_dateTime TIMESTAMPTZ NOT NULL,
    reason TEXT,
    employee_id UUID REFERENCES employee(employee_id) ON DELETE CASCADE
);

CREATE TABLE work_schedule (
    work_schedule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    weekday weekday_enum NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    dateTime_added TIMESTAMPTZ DEFAULT NOW(),
    employee_id UUID REFERENCES employee(employee_id) ON DELETE CASCADE
);

CREATE TABLE coupon (
    coupon_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_name TEXT NOT NULL,
    discount_percent NUMERIC(5, 2) NOT NULL,
    description TEXT
);

CREATE TABLE package (
    package_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_name TEXT NOT NULL,
    package_price NUMERIC(10, 2) NOT NULL,
    campaign_start_dateTime TIMESTAMPTZ,
    campaign_end_dateTime TIMESTAMPTZ
);

CREATE TABLE package_detail (
    package_detail_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID REFERENCES package(package_id) ON DELETE CASCADE,
    massage_id UUID REFERENCES massage(massage_id) ON DELETE CASCADE
);

CREATE TABLE booking (
    booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_email TEXT,
    booking_dateTime TIMESTAMPTZ NOT NULL,
    is_coupon_use BOOLEAN DEFAULT FALSE,
    customer_id UUID REFERENCES customer(customer_id) ON DELETE SET NULL
);

CREATE TABLE payment (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    amount NUMERIC(10, 2) NOT NULL,
    booking_id UUID REFERENCES booking(booking_id) ON DELETE CASCADE
);

CREATE TABLE member_coupon (
    member_coupon_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_used BOOLEAN DEFAULT FALSE,
    expire_dateTime TIMESTAMPTZ,
    coupon_id UUID REFERENCES coupon(coupon_id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customer(customer_id) ON DELETE CASCADE,
    booking_id UUID REFERENCES booking(booking_id) ON DELETE SET NULL
);

CREATE TABLE member_package (
    member_package_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_used BOOLEAN DEFAULT FALSE,
    expire_dateTime TIMESTAMPTZ,
    member_id UUID REFERENCES customer(customer_id) ON DELETE CASCADE, 
    package_detail_id UUID REFERENCES package_detail(package_detail_id) ON DELETE CASCADE
);

CREATE TABLE booking_detail (
    booking_detail_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    massage_start_dateTime TIMESTAMPTZ NOT NULL,
    massage_end_dateTime TIMESTAMPTZ NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    employee_id UUID REFERENCES employee(employee_id) ON DELETE SET NULL,
    booking_id UUID REFERENCES booking(booking_id) ON DELETE CASCADE,
    member_package_id UUID REFERENCES member_package(member_package_id) ON DELETE SET NULL,
    room_id UUID REFERENCES room(room_id) ON DELETE SET NULL,
    massage_id UUID REFERENCES massage(massage_id) ON DELETE SET NULL
);