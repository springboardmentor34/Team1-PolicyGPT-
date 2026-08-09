-- PolicyGPT: Government Policy & Public Scheme Intelligence Platform
-- PostgreSQL Database Schema (init.sql)

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Administrator', 'Government Official', 'Citizen', 'Researcher', 'Organization', 'Guest User')),
    department VARCHAR(150),
    state VARCHAR(100),
    occupation VARCHAR(100),
    income_annual NUMERIC(12,2),
    age INT,
    gender VARCHAR(20),
    education_level VARCHAR(100),
    social_category VARCHAR(50),
    disability_status BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS policies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    summary TEXT,
    category VARCHAR(100) NOT NULL CHECK (category IN (
        'Education', 'Healthcare', 'Agriculture', 'Employment', 'Finance',
        'Women & Child Welfare', 'Housing', 'Environment', 'Digital Governance', 'Infrastructure'
    )),
    ministry VARCHAR(200) NOT NULL,
    department VARCHAR(200) NOT NULL,
    state VARCHAR(100) DEFAULT 'All India',
    sector VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'Draft', 'Pending Approval', 'Published', 'Archived')),
    rejection_reason TEXT,
    effective_date DATE,
    created_by_id INT REFERENCES users(id) ON DELETE SET NULL,
    approved_by_id INT REFERENCES users(id) ON DELETE SET NULL,
    document_url VARCHAR(500),
    view_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schemes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    policy_id INT REFERENCES policies(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN (
        'Scholarships', 'Farmer Welfare', 'Healthcare', 'Housing', 'Business Support',
        'Women Empowerment', 'Senior Citizen Welfare', 'Student Schemes', 'Employment Programs', 'Social Security'
    )),
    benefits TEXT NOT NULL,
    financial_assistance VARCHAR(200),
    budget_allocated NUMERIC(15,2),
    target_group VARCHAR(200),
    application_process TEXT,
    application_link VARCHAR(500),
    deadline DATE,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Under Review', 'Closed', 'Archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eligibility_rules (
    id SERIAL PRIMARY KEY,
    scheme_id INT REFERENCES schemes(id) ON DELETE CASCADE,
    min_age INT DEFAULT 0,
    max_age INT DEFAULT 120,
    gender VARCHAR(50) DEFAULT 'All',
    max_income NUMERIC(12,2) DEFAULT 99999999.99,
    occupation VARCHAR(100) DEFAULT 'All',
    education_level VARCHAR(100) DEFAULT 'All',
    location_type VARCHAR(50) DEFAULT 'All',
    social_category VARCHAR(50) DEFAULT 'All',
    disability_required BOOLEAN DEFAULT FALSE,
    additional_notes TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'General' CHECK (type IN ('Policy Alert', 'Policy Update', 'Scheme Update', 'Scheme Deadline', 'Application Update', 'System Alert', 'General')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(150),
    email VARCHAR(255),
    category VARCHAR(100) DEFAULT 'General Enquiry',
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'Open', 'In Progress', 'Resolved')),
    admin_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    format VARCHAR(20) CHECK (format IN ('PDF', 'Excel', 'CSV')),
    file_path VARCHAR(500),
    created_by_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS search_history (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    query_text VARCHAR(255),
    filters_json JSONB,
    results_count INT DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
