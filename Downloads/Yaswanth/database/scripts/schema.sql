-- =============================================================================
-- PolicyGPT Database Schema Script (PostgreSQL 14+)
-- Milestone 1: Core Database DDL, Constraints, Indexes & Sample Seed Data
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- Automatic updated_at Trigger Function
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================================================
-- 1. USERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20),                                         -- Register page: Phone Number field
    role VARCHAR(50) NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin', 'policy_officer')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);
CREATE INDEX IF NOT EXISTS ix_users_role ON users(role);
CREATE INDEX IF NOT EXISTS ix_users_phone_number ON users(phone_number);

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 2. POLICIES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    sector VARCHAR(100) NOT NULL,
    ministry_or_department VARCHAR(200) NOT NULL,
    effective_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
    uploaded_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_policies_title ON policies(title);
CREATE INDEX IF NOT EXISTS ix_policies_sector ON policies(sector);
CREATE INDEX IF NOT EXISTS ix_policies_ministry ON policies(ministry_or_department);
CREATE INDEX IF NOT EXISTS ix_policies_status ON policies(status);
CREATE INDEX IF NOT EXISTS ix_policies_uploaded_by ON policies(uploaded_by_id);

CREATE TRIGGER update_policies_updated_at
    BEFORE UPDATE ON policies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. SCHEMES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    benefits_summary TEXT NOT NULL,
    budget_allocation NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_schemes_policy_id ON schemes(policy_id);
CREATE INDEX IF NOT EXISTS ix_schemes_title ON schemes(title);
CREATE INDEX IF NOT EXISTS ix_schemes_code ON schemes(code);
CREATE INDEX IF NOT EXISTS ix_schemes_status ON schemes(status);

CREATE TRIGGER update_schemes_updated_at
    BEFORE UPDATE ON schemes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 4. ELIGIBILITY_RULES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS eligibility_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
    rule_name VARCHAR(150) NOT NULL,
    min_age INTEGER CHECK (min_age >= 0),
    max_age INTEGER CHECK (max_age >= min_age OR max_age IS NULL),
    max_income NUMERIC(12, 2) CHECK (max_income >= 0 OR max_income IS NULL),
    gender_requirement VARCHAR(20) NOT NULL DEFAULT 'all' CHECK (gender_requirement IN ('all', 'male', 'female', 'other')),
    caste_category VARCHAR(50) NOT NULL DEFAULT 'all',
    state_or_region VARCHAR(100) NOT NULL DEFAULT 'all',
    occupation_type VARCHAR(100) NOT NULL DEFAULT 'all',
    rule_criteria_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_eligibility_rules_scheme_id ON eligibility_rules(scheme_id);
CREATE INDEX IF NOT EXISTS ix_eligibility_rules_region ON eligibility_rules(state_or_region);

CREATE TRIGGER update_eligibility_rules_updated_at
    BEFORE UPDATE ON eligibility_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 5. NOTIFICATIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL DEFAULT 'system',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS ix_notifications_is_read ON notifications(is_read);

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 6. FEEDBACK TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheme_id UUID REFERENCES schemes(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS ix_feedback_scheme_id ON feedback(scheme_id);

CREATE TRIGGER update_feedback_updated_at
    BEFORE UPDATE ON feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 7. REPORTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    parameters_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS ix_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS ix_reports_status ON reports(status);

CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 8. AUDIT_LOGS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    details_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS ix_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS ix_audit_logs_entity_type ON audit_logs(entity_type);

-- =============================================================================
-- 9. SEARCH_HISTORY TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    filters_applied JSONB NOT NULL DEFAULT '{}'::jsonb,
    results_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_search_history_user_id ON search_history(user_id);

CREATE TRIGGER update_search_history_updated_at
    BEFORE UPDATE ON search_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SAMPLE DATA INSERTS
-- =============================================================================

-- Insert Users
INSERT INTO users (id, email, hashed_password, full_name, phone_number, role, is_active, is_verified) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@policygpt.gov.in', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'System Administrator', '+91-9000000001', 'admin', TRUE, TRUE),
('22222222-2222-2222-2222-222222222222', 'officer.agriculture@gov.in', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'Rajesh Sharma', '+91-9000000002', 'policy_officer', TRUE, TRUE),
('33333333-3333-3333-3333-333333333333', 'citizen.priya@gmail.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'Priya Patel', '+91-9000000003', 'citizen', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- Insert Policies
INSERT INTO policies (id, title, description, sector, ministry_or_department, effective_date, status, uploaded_by_id) VALUES
('44444444-4444-4444-4444-444444444444', 'National Agriculture Growth Policy 2026', 'Comprehensive national policy to enhance agricultural output, income security, and sustainable farming methods across rural India.', 'Agriculture', 'Ministry of Agriculture and Farmers Welfare', '2026-01-01', 'active', '22222222-2222-2222-2222-222222222222'),
('55555555-5555-5555-5555-555555555555', 'Digital Literacy and Education Empowerment Framework', 'Policy aimed at bridging the digital divide in primary and secondary education institutions across tier-2 and tier-3 cities.', 'Education', 'Ministry of Education', '2025-06-15', 'active', '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- Insert Schemes
INSERT INTO schemes (id, policy_id, title, code, summary, benefits_summary, budget_allocation, status) VALUES
('66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', 'PM Kisan Samman Nidhi Scheme', 'PM-KISAN-2026', 'Direct income support scheme transferring Rs. 6,000 per year in three equal installments to eligible farmer families.', 'Rs 6,000 annual direct benefit transfer into bank accounts.', 60000000000.00, 'active'),
('77777777-7777-7777-7777-777777777777', '55555555-5555-5555-5555-555555555555', 'Digital Student Tablet Grant Scheme', 'DSTG-2026', 'Providing tablet devices and free educational internet connectivity to underprivileged students.', 'Free 10-inch Android tablet with 100GB monthly data.', 15000000000.00, 'active')
ON CONFLICT (code) DO NOTHING;

-- Insert Eligibility Rules
INSERT INTO eligibility_rules (id, scheme_id, rule_name, min_age, max_age, max_income, gender_requirement, caste_category, state_or_region, occupation_type, rule_criteria_json) VALUES
('88888888-8888-8888-8888-888888888888', '66666666-6666-6666-6666-666666666666', 'Small & Marginal Farmers Criteria', 18, 75, 250000.00, 'all', 'all', 'all', 'Farmer', '{"land_holding_limit_acres": 5, "require_land_records": true}'),
('99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-777777777777', 'Secondary Student Eligibility', 12, 18, 180000.00, 'all', 'all', 'all', 'Student', '{"enrolled_in_govt_school": true, "minimum_attendance_pct": 75}')
ON CONFLICT DO NOTHING;

-- Insert Notifications
INSERT INTO notifications (id, user_id, title, message, notification_type, is_read) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'PM Kisan Installment Released', 'Your 16th installment under PM Kisan Samman Nidhi has been credited to your bank account.', 'scheme_alert', FALSE)
ON CONFLICT DO NOTHING;

-- Insert Feedback
INSERT INTO feedback (id, user_id, scheme_id, rating, comments, category) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 5, 'The direct bank transfer was fast and hassle-free!', 'scheme_inquiry')
ON CONFLICT DO NOTHING;

-- Insert Reports
INSERT INTO reports (id, user_id, report_type, title, parameters_json, content_json, status) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'scheme_comparison', 'Q1 2026 Agriculture Scheme Impact Report', '{"sector": "Agriculture", "year": 2026}', '{"total_beneficiaries": 12000000, "disbursed_amount_inr": 24000000000}', 'completed')
ON CONFLICT DO NOTHING;

-- Insert Audit Logs
INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, ip_address, details_json) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'CREATE_POLICY', 'policy', '44444444-4444-4444-4444-444444444444', '192.168.1.50', '{"policy_title": "National Agriculture Growth Policy 2026"}')
ON CONFLICT DO NOTHING;

-- Insert Search History
INSERT INTO search_history (id, user_id, search_query, filters_applied, results_count) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 'farmer direct subsidy schemes 2026', '{"sector": "Agriculture", "max_income": 250000}', 5)
ON CONFLICT DO NOTHING;
