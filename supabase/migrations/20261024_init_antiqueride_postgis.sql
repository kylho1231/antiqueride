-- ==============================================================================
-- ANTIQUERIDE — Province-Wide Smart Transportation Platform
-- Initial Migration: PostGIS, Spatial Schemas, RLS Policies, and Audit Framework
-- Initial Operating Municipality: San Jose de Buenavista, Antique, Philippines
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. ENUMS
CREATE TYPE user_role_enum AS ENUM ('COMMUTER', 'DRIVER', 'SUPER_ADMIN');
CREATE TYPE verification_status_enum AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE driver_availability_enum AS ENUM ('AVAILABLE', 'RESERVED', 'ARRIVING', 'ON_TRIP', 'OFFLINE', 'GPS_UNAVAILABLE', 'STALE_LOCATION');
CREATE TYPE ride_type_enum AS ENUM ('REGULAR', 'SPECIAL');
CREATE TYPE ride_status_enum AS ENUM ('REQUESTED', 'ACCEPTED', 'HEADING_TO_PICKUP', 'ARRIVED', 'PASSENGER_VERIFIED', 'TRIP_STARTED', 'TRIP_COMPLETED', 'CANCELLED');
CREATE TYPE queue_mode_enum AS ENUM ('PILA', 'ON_DEMAND');
CREATE TYPE vehicle_category_enum AS ENUM ('TRICYCLE', 'JEEPNEY', 'VAN', 'BUS');

-- 3. PROFILES & ROLES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    full_name TEXT NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'COMMUTER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TODA ASSOCIATIONS (San Jose de Buenavista & Antique)
CREATE TABLE IF NOT EXISTS public.toda_associations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    acronym VARCHAR(20) NOT NULL UNIQUE,
    municipality VARCHAR(100) NOT NULL DEFAULT 'San Jose de Buenavista',
    barangay VARCHAR(100) NOT NULL,
    accreditation_number VARCHAR(100) NOT NULL UNIQUE,
    contact_person TEXT NOT NULL,
    contact_phone VARCHAR(30) NOT NULL,
    active_units INT NOT NULL DEFAULT 0,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TERMINALS & STATIONS (With PostGIS Spatial Point)
CREATE TABLE IF NOT EXISTS public.terminals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    toda_id UUID REFERENCES public.toda_associations(id) ON DELETE RESTRICT,
    municipality VARCHAR(100) NOT NULL DEFAULT 'San Jose de Buenavista',
    barangay VARCHAR(100) NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    verification_source TEXT NOT NULL,
    supported_vehicle_type vehicle_category_enum NOT NULL DEFAULT 'TRICYCLE',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    capacity INT NOT NULL DEFAULT 20,
    queue_mode queue_mode_enum NOT NULL DEFAULT 'PILA',
    date_confirmed DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_terminals_location ON public.terminals USING GIST (location);

-- 6. FARE POLICIES & ORDINANCES
CREATE TABLE IF NOT EXISTS public.fare_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    municipality VARCHAR(100) NOT NULL DEFAULT 'San Jose de Buenavista',
    operating_zone VARCHAR(100) NOT NULL,
    source_ordinance VARCHAR(150) NOT NULL,
    ordinance_title TEXT NOT NULL,
    approval_reference TEXT NOT NULL,
    valid_from DATE NOT NULL,
    valid_until DATE,
    base_fare_regular NUMERIC(8, 2) NOT NULL DEFAULT 15.00,
    base_km_regular NUMERIC(4, 2) NOT NULL DEFAULT 2.00,
    succeeding_per_km_regular NUMERIC(8, 2) NOT NULL DEFAULT 2.50,
    special_trip_base_fare NUMERIC(8, 2) NOT NULL DEFAULT 50.00,
    student_discount_pct NUMERIC(4, 2) NOT NULL DEFAULT 0.20,
    senior_pwd_discount_pct NUMERIC(4, 2) NOT NULL DEFAULT 0.20,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. DRIVER PROFILES
CREATE TABLE IF NOT EXISTS public.driver_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    full_name TEXT NOT NULL,
    phone VARCHAR(30) NOT NULL,
    license_number VARCHAR(50) NOT NULL,
    license_classification VARCHAR(50) NOT NULL,
    license_expiry DATE NOT NULL,
    vehicle_plate VARCHAR(20) NOT NULL,
    body_number VARCHAR(20) NOT NULL,
    toda_id UUID REFERENCES public.toda_associations(id) ON DELETE RESTRICT,
    terminal_id UUID REFERENCES public.terminals(id) ON DELETE RESTRICT,
    franchise_mtop_number VARCHAR(50) NOT NULL,
    mtop_expiry DATE NOT NULL,
    operating_zone TEXT NOT NULL,
    verification_status verification_status_enum NOT NULL DEFAULT 'PENDING',
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    total_trips INT NOT NULL DEFAULT 0,
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    availability driver_availability_enum NOT NULL DEFAULT 'OFFLINE',
    last_location GEOMETRY(Point, 4326),
    last_gps_update TIMESTAMPTZ,
    gps_accuracy_meters NUMERIC(6, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_driver_last_location ON public.driver_profiles USING GIST (last_location);

-- 8. COMMUTER PROFILES
CREATE TABLE IF NOT EXISTS public.commuter_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    full_name TEXT NOT NULL,
    phone VARCHAR(30) NOT NULL,
    is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_status verification_status_enum NOT NULL DEFAULT 'UNVERIFIED',
    id_document_type VARCHAR(50),
    id_document_url TEXT,
    discount_category VARCHAR(30) NOT NULL DEFAULT 'NONE',
    emergency_contact_name TEXT,
    emergency_contact_phone VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. RIDE REQUESTS & TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.ride_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commuter_id UUID REFERENCES public.commuter_profiles(id) ON DELETE RESTRICT,
    pickup_name TEXT NOT NULL,
    pickup_location GEOMETRY(Point, 4326) NOT NULL,
    destination_name TEXT NOT NULL,
    destination_location GEOMETRY(Point, 4326) NOT NULL,
    ride_type ride_type_enum NOT NULL DEFAULT 'REGULAR',
    estimated_distance_km NUMERIC(6, 2) NOT NULL,
    fare_amount NUMERIC(8, 2) NOT NULL,
    fare_snapshot JSONB NOT NULL,
    passenger_count INT NOT NULL DEFAULT 1,
    pin_code VARCHAR(6) NOT NULL,
    status ride_status_enum NOT NULL DEFAULT 'REQUESTED',
    driver_id UUID REFERENCES public.driver_profiles(id) ON DELETE SET NULL,
    driver_location GEOMETRY(Point, 4326),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    arrived_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancelled_by VARCHAR(30),
    cancellation_reason TEXT,
    passenger_rating INT CHECK (passenger_rating BETWEEN 1 AND 5),
    passenger_feedback TEXT
);
CREATE INDEX IF NOT EXISTS idx_rides_pickup_loc ON public.ride_requests USING GIST (pickup_location);

-- 10. SAFETY INCIDENT REPORTS
CREATE TABLE IF NOT EXISTS public.incident_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL,
    reporter_name TEXT NOT NULL,
    reporter_role user_role_enum NOT NULL,
    reporter_phone VARCHAR(30) NOT NULL,
    ride_id UUID REFERENCES public.ride_requests(id) ON DELETE SET NULL,
    driver_body_number VARCHAR(30),
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_REVIEW',
    action_taken_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 11. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL,
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. POSTGIS SPATIAL DISPATCH FUNCTION
-- Matches closest available verified driver within radius
CREATE OR REPLACE FUNCTION public.find_nearby_available_drivers(
    pickup_lat DOUBLE PRECISION,
    pickup_lng DOUBLE PRECISION,
    radius_km DOUBLE PRECISION DEFAULT 4.0,
    max_drivers INT DEFAULT 5
)
RETURNS TABLE (
    driver_id UUID,
    full_name TEXT,
    body_number VARCHAR(20),
    distance_km DOUBLE PRECISION,
    toda_name TEXT,
    rating NUMERIC(3,2)
)
LANGUAGE sql
STABLE
AS $$
    SELECT 
        d.id,
        d.full_name,
        d.body_number,
        ST_Distance(d.last_location, ST_SetSRID(ST_MakePoint(pickup_lng, pickup_lat), 4326)::geography) / 1000.0 AS distance_km,
        t.name AS toda_name,
        d.rating
    FROM public.driver_profiles d
    LEFT JOIN public.toda_associations t ON d.toda_id = t.id
    WHERE d.is_online = TRUE 
      AND d.availability = 'AVAILABLE'
      AND d.verification_status = 'VERIFIED'
      AND d.last_location IS NOT NULL
      AND ST_DWithin(d.last_location, ST_SetSRID(ST_MakePoint(pickup_lng, pickup_lat), 4326)::geography, radius_km * 1000)
    ORDER BY distance_km ASC
    LIMIT max_drivers;
$$;

-- 13. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commuter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toda_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fare_policies ENABLE ROW LEVEL SECURITY;

-- Public read for verified terminals and fare policies
CREATE POLICY "Public read terminals" ON public.terminals FOR SELECT USING (true);
CREATE POLICY "Public read toda" ON public.toda_associations FOR SELECT USING (true);
CREATE POLICY "Public read fare policies" ON public.fare_policies FOR SELECT USING (true);

-- Drivers can update their own presence and read assigned rides
CREATE POLICY "Drivers manage self" ON public.driver_profiles FOR ALL USING (auth.uid() = user_id);
-- Commuters manage self
CREATE POLICY "Commuters manage self" ON public.commuter_profiles FOR ALL USING (auth.uid() = user_id);

-- Ride privacy: only commuter or assigned driver or admin can view ride details
CREATE POLICY "Users view own rides" ON public.ride_requests FOR SELECT USING (
    auth.uid() IN (
        SELECT user_id FROM public.commuter_profiles WHERE id = ride_requests.commuter_id
        UNION
        SELECT user_id FROM public.driver_profiles WHERE id = ride_requests.driver_id
    )
);
