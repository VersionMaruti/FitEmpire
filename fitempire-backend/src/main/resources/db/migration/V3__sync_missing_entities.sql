-- ============================================================
-- V3__sync_missing_entities.sql
-- Synchronize newly added entities and missing columns
-- ============================================================

-- 1. Missing columns in existing tables
ALTER TABLE payments ADD COLUMN IF NOT EXISTS is_settled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS wallet_type VARCHAR(50) DEFAULT 'USER';
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS gym_id UUID;

-- 2. Turnstile Audit Events
CREATE TABLE IF NOT EXISTS turnstile_audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    user_id UUID,
    gate_id VARCHAR(64),
    scanned_token VARCHAR(128),
    verdict VARCHAR(32) NOT NULL,
    failure_reason VARCHAR(255),
    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 3. Class Waitlists
CREATE TABLE IF NOT EXISTS class_waitlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID NOT NULL REFERENCES class_schedules(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    queue_position INT NOT NULL,
    notified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 4. Branch Operating Hours
CREATE TABLE IF NOT EXISTS branch_operating_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES gym_branches(id) ON DELETE CASCADE,
    day_of_week VARCHAR(16) NOT NULL,
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 5. Gym Registration Drafts
CREATE TABLE IF NOT EXISTS gym_registration_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_step INT NOT NULL DEFAULT 1,
    is_submitted BOOLEAN NOT NULL DEFAULT FALSE,
    draft_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 6. User Activity Logs
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(64) NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 7. User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    push_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sms_alerts_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    email_digest_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    preferred_city VARCHAR(64) DEFAULT 'Delhi-NCR',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 8. Commission Rules
CREATE TABLE IF NOT EXISTS commission_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    applicable_category VARCHAR(64),
    percentage NUMERIC(5,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 9. Platform Revenues
CREATE TABLE IF NOT EXISTS platform_revenues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(255) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    reference_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 10. Settlements
CREATE TABLE IF NOT EXISTS settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    commission_deducted NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    net_payable NUMERIC(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(64) NOT NULL DEFAULT 'PENDING',
    settlement_date TIMESTAMP WITH TIME ZONE,
    bank_ref_number VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 11. Settlement Logs
CREATE TABLE IF NOT EXISTS settlement_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    settlement_id UUID NOT NULL REFERENCES settlements(id) ON DELETE CASCADE,
    status VARCHAR(64) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 12. Refund Requests
CREATE TABLE IF NOT EXISTS refund_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    status VARCHAR(64) NOT NULL DEFAULT 'REQUESTED',
    refund_destination VARCHAR(64) NOT NULL,
    refund_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);
