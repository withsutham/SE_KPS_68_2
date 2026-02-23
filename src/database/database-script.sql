-- ==========================================
-- 1. ENUM TYPES
-- ==========================================

CREATE TYPE user_role_type AS ENUM ('customer', 'manager', 'therapist', 'shop_owner');
CREATE TYPE weekday_type AS ENUM ('SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT');

-- ==========================================
-- 2. INDEPENDENT TABLES
-- ==========================================

CREATE TABLE massage (
    massage_id SERIAL PRIMARY KEY,
    massage_name VARCHAR(255) NOT NULL,
    massage_price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE room (
    room_id SERIAL PRIMARY KEY,
    room_name VARCHAR(100) NOT NULL
);

CREATE TABLE coupon (
    coupon_id SERIAL PRIMARY KEY,
    coupon_name VARCHAR(100) NOT NULL,
    discount_percent DECIMAL(5, 2) NOT NULL,
    description TEXT
);

CREATE TABLE package (
    package_id SERIAL PRIMARY KEY,
    package_name VARCHAR(255) NOT NULL,
    package_price DECIMAL(10, 2) NOT NULL,
    campaign_start_dateTime TIMESTAMP WITH TIME ZONE,
    campaign_end_dateTime TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- 3. SUPABASE AUTH PROFILES
-- ==========================================

-- The uuid links directly to Supabase's built-in authentication table
CREATE TABLE profiles (
    uuid UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_type user_role_type NOT NULL
);

-- ==========================================
-- 4. FIRST-LEVEL DEPENDENT TABLES
-- ==========================================

CREATE TABLE customer (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    email_address VARCHAR(255),
    regis_dateTime TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uuid UUID REFERENCES profiles(uuid) ON DELETE CASCADE
);

CREATE TABLE employee (
    employee_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    work_since DATE,
    uuid UUID REFERENCES profiles(uuid) ON DELETE CASCADE
);

CREATE TABLE room_massage (
    room_massage_id SERIAL PRIMARY KEY,
    capacity INT NOT NULL,
    room_id INT REFERENCES room(room_id) ON DELETE CASCADE,
    massage_id INT REFERENCES massage(massage_id) ON DELETE CASCADE
);

CREATE TABLE package_detail (
    package_detail_id SERIAL PRIMARY KEY,
    package_id INT REFERENCES package(package_id) ON DELETE CASCADE,
    massage_id INT REFERENCES massage(massage_id) ON DELETE CASCADE
);

-- ==========================================
-- 5. SECOND-LEVEL DEPENDENT TABLES
-- ==========================================

CREATE TABLE therapist_massage_skill (
    therapist_massage_skill_id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employee(employee_id) ON DELETE CASCADE,
    massage_id INT REFERENCES massage(massage_id) ON DELETE CASCADE
);

CREATE TABLE work_schedule (
    work_schedule_id SERIAL PRIMARY KEY,
    weekday weekday_type NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    dateTime_added TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    employee_id INT REFERENCES employee(employee_id) ON DELETE CASCADE
);

CREATE TABLE leave_record (
    leave_record_id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employee(employee_id) ON DELETE CASCADE,
    approval_status VARCHAR(50),
    start_dateTime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_dateTime TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT
);

CREATE TABLE member_package (
    member_package_id SERIAL PRIMARY KEY,
    is_used BOOLEAN DEFAULT FALSE,
    expire_dateTime TIMESTAMP WITH TIME ZONE,
    member_id INT REFERENCES customer(customer_id) ON DELETE CASCADE,
    package_id INT REFERENCES package(package_id) ON DELETE CASCADE
);

CREATE TABLE booking (
    booking_id SERIAL PRIMARY KEY,
    booking_dateTime TIMESTAMP WITH TIME ZONE NOT NULL,
    is_coupon_use BOOLEAN DEFAULT FALSE,
    customer_id INT REFERENCES customer(customer_id) ON DELETE CASCADE
);

-- ==========================================
-- 6. THIRD-LEVEL DEPENDENT TABLES
-- ==========================================

CREATE TABLE booking_detail (
    booking_detail_id SERIAL PRIMARY KEY,
    massage_start_dateTime TIMESTAMP WITH TIME ZONE NOT NULL,
    massage_end_dateTime TIMESTAMP WITH TIME ZONE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    employee_id INT REFERENCES employee(employee_id) ON DELETE SET NULL,
    booking_id INT REFERENCES booking(booking_id) ON DELETE CASCADE,
    package_id INT REFERENCES package(package_id) ON DELETE SET NULL,
    room_id INT REFERENCES room(room_id) ON DELETE SET NULL,
    massage_id INT REFERENCES massage(massage_id) ON DELETE SET NULL
);

CREATE TABLE payment (
    payment_id SERIAL PRIMARY KEY,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(100),
    payment_status VARCHAR(50),
    amount DECIMAL(10, 2) NOT NULL,
    booking_id INT REFERENCES booking(booking_id) ON DELETE CASCADE
);

CREATE TABLE member_coupon (
    member_coupon_id SERIAL PRIMARY KEY,
    is_used BOOLEAN DEFAULT FALSE,
    expire_dateTime TIMESTAMP WITH TIME ZONE,
    coupon_id INT REFERENCES coupon(coupon_id) ON DELETE CASCADE,
    member_id INT REFERENCES customer(customer_id) ON DELETE CASCADE,
    booking_id INT REFERENCES booking(booking_id) ON DELETE SET NULL
);