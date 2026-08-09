-- PolicyGPT: Seed Data Script (seed_data.sql)

-- 1. Default Pre-seeded Users
-- Default Administrator (Password: Admin@123456)
-- Default Government Official (Password: Official@123456)
-- Default Citizen (Password: Citizen@123456)
-- Default Researcher (Password: Researcher@123456)
-- Default Organization (Password: Org@123456)

INSERT INTO users (full_name, email, hashed_password, role, department, state, occupation, income_annual, age, gender, education_level, social_category, disability_status)
VALUES 
('System Administrator', 'admin@policygpt.gov.in', '$2b$12$t14nhjxy4t2A1vfpa1oqgONKE0DXY/1YKd9dkPvF/oYsZM5qIx0JW', 'Administrator', 'Ministry of Electronics & IT', 'New Delhi', 'Executive', 2000000.00, 45, 'Male', 'Postgraduate', 'General', FALSE),
('Dr. Rajesh Verma', 'official@policygpt.gov.in', '$2b$12$Zfv6KSQF4dsxfdVfR4Zi3uZbQ3/P4TX6Yw9PePzeUslKrS1O7/be6', 'Government Official', 'Department of Agriculture', 'Uttar Pradesh', 'Joint Secretary', 1500000.00, 50, 'Male', 'Doctorate', 'General', FALSE),
('Priya Sharma', 'citizen@policygpt.gov.in', '$2b$12$P/ixMBjGRTXITR9r54jqx.gAcdyO5O3iAT6NjQ2Iiu8tqpBj4DHCi', 'Citizen', 'N/A', 'Maharashtra', 'Farmer', 180000.00, 28, 'Female', 'Graduate', 'OBC', FALSE),
('Prof. Anita Roy', 'researcher@policygpt.gov.in', '$2b$12$mm.bI1r7GN7REzWcXSXdeusSGZRe8WmViupJso220QvELVzMoorRG', 'Researcher', 'Policy Research Institute', 'Delhi', 'Senior Fellow', 1200000.00, 40, 'Female', 'Doctorate', 'General', FALSE),
('AgroTech Solutions NGO', 'org@policygpt.gov.in', '$2b$12$v9o9Wexg04gZ.gkGL.xZ.uO9mN6Xlas8JJPNv6OVXxksAAFfKGFWK', 'Organization', 'Welfare & Agri Development', 'Karnataka', 'Enterprise', 5000000.00, 35, 'Other', 'Postgraduate', 'General', FALSE)
ON CONFLICT (email) DO UPDATE SET hashed_password = EXCLUDED.hashed_password;

-- 2. Policies
INSERT INTO policies (title, code, description, summary, category, ministry, department, state, sector, status, effective_date, created_by_id, approved_by_id, document_url, view_count)
VALUES 
(
    'National Agricultural & Farmer Support Policy 2024',
    'POL-AGRI-2024-01',
    'Comprehensive national framework aimed at doubling farmer income, modernizing irrigation systems, providing subsidized high-yield seeds, and establishing direct digital market linkage for agricultural yield across India.',
    'Framework for financial support, soil health testing, and market linkage for small and marginal farmers.',
    'Agriculture',
    'Ministry of Agriculture & Farmers Welfare',
    'Department of Agriculture and Farmers Welfare',
    'All India',
    'Agriculture & Rural Development',
    'Published',
    '2024-01-01',
    2, 1, 'https://agricoop.gov.in/policies/national-agri-policy-2024.pdf', 1420
),
(
    'Ayushman Digital Health & Wellness Guarantee Policy',
    'POL-HLTH-2024-02',
    'National policy mandating free secondary and tertiary healthcare coverage, digital health cards, and upgraded primary health centers across rural and urban districts.',
    'Universal health insurance coverage up to ₹5 Lakhs per family per annum for vulnerable households.',
    'Healthcare',
    'Ministry of Health and Family Welfare',
    'National Health Authority',
    'All India',
    'Public Health & Medicine',
    'Published',
    '2024-02-15',
    2, 1, 'https://nha.gov.in/policies/ayushman-health-policy.pdf', 2890
),
(
    'National Education Empowerment & Digital Literacy Policy',
    'POL-EDU-2024-03',
    'Policy framework promoting universal access to higher education, post-matric scholarship allocation, STEM grants for female students, and broadband connectivity in government schools.',
    'Promotes post-matric scholarships, free laptop distribution to meritorious students, and skill centers.',
    'Education',
    'Ministry of Education',
    'Department of Higher Education',
    'All India',
    'Education & Skill Development',
    'Published',
    '2024-03-10',
    2, 1, 'https://education.gov.in/policies/national-edu-policy.pdf', 3150
),
(
    'Pradhan Mantri Universal Housing Assistance Policy',
    'POL-HOUS-2024-04',
    'Policy to provide affordable pucca housing with electricity, water, and sanitation facilities to all homeless and kutcha house living families by 2026.',
    'Direct subsidy transfer for affordable housing construction in rural and urban sectors.',
    'Housing',
    'Ministry of Housing and Urban Affairs',
    'Housing Division',
    'All India',
    'Urban & Rural Infrastructure',
    'Published',
    '2024-04-01',
    2, 1, 'https://pmay.gov.in/policies/pm-housing-policy.pdf', 1980
),
(
    'National Startup & Women Entrepreneurship Mission Policy',
    'POL-FIN-2024-05',
    'Initiative for collateral-free credit lines, tax exemptions for early-stage ventures, and dedicated women entrepreneurship incubation hubs.',
    'Collateral-free loans up to ₹20 Lakhs and incubation support for women-led startups.',
    'Women & Child Welfare',
    'Ministry of Micro, Small and Medium Enterprises',
    'MSME Development Department',
    'All India',
    'Commerce & Entrepreneurship',
    'Published',
    '2024-05-20',
    2, 1, 'https://msme.gov.in/policies/women-startup-policy.pdf', 1650
)
ON CONFLICT (code) DO NOTHING;

-- 3. Public Schemes
INSERT INTO schemes (name, code, policy_id, description, category, benefits, financial_assistance, budget_allocated, target_group, application_process, application_link, deadline, status)
VALUES 
(
    'PM-KISAN Samman Nidhi Scheme',
    'SCH-AGRI-001',
    1,
    'Direct income support scheme providing ₹6,000 per year to landholding farmer families across the country in three equal quadruply installments.',
    'Farmer Welfare',
    '₹6,000 direct benefit transfer (DBT) annually into bank accounts, free soil testing cards, and 50% seed subsidy.',
    '₹6,000 per year',
    60000000000.00,
    'Small and marginal landholding farmers',
    'Apply online at PM-KISAN portal with Aadhaar card, land ownership certificate, and bank account details.',
    'https://pmkisan.gov.in',
    '2025-12-31',
    'Active'
),
(
    'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
    'SCH-HLTH-002',
    2,
    'World’s largest health insurance scheme providing health cover of ₹5 Lakhs per family per year for secondary and tertiary care hospitalization.',
    'Healthcare',
    'Cashless and paperless access to healthcare services at empaneled public and private hospitals nationwide.',
    'Up to ₹5,000,000 coverage/year',
    120000000000.00,
    'Low-income households identified via SECC database',
    'Check eligibility online, visit nearest Ayushman Mitra center with Golden Card or ration card.',
    'https://pmjay.gov.in',
    '2026-03-31',
    'Active'
),
(
    'Post-Matric Scholarship for Higher Education',
    'SCH-EDU-003',
    3,
    'Financial scholarship assistance to students belonging to SC/ST/OBC and economically weaker sections pursuing post-secondary studies.',
    'Scholarships',
    '100% tuition fee reimbursement + monthly maintenance allowance up to ₹1,200/month.',
    'Full tuition + Maintenance stipend',
    2500000000.00,
    'Students pursuing Diploma, UG, or PG degrees',
    'Submit application through National Scholarship Portal (NSP) with income certificate and marksheets.',
    'https://scholarships.gov.in',
    '2025-10-31',
    'Active'
),
(
    'Pradhan Mantri Awas Yojana (Urban & Rural)',
    'SCH-HOUS-004',
    4,
    'Central credit-linked subsidy scheme providing interest subvention and financial grant for building new pucca homes or upgrading existing houses.',
    'Housing',
    'Direct grant of ₹1.20 Lakhs to ₹2.67 Lakhs interest subvention on home loans.',
    'Grant up to ₹2.67 Lakhs',
    48000000000.00,
    'EWS, LIG, and MIG families without pucca house',
    'Apply via PMAY online portal or CSC center with Aadhaar and income proof.',
    'https://pmaymis.gov.in',
    '2025-12-31',
    'Active'
),
(
    'Mudra Yojana & Stand Up Women Entrepreneur Grant',
    'SCH-BUS-005',
    5,
    'Micro-credit scheme offering loans up to ₹10 Lakhs without collateral for non-corporate, non-farm micro/small enterprises.',
    'Business Support',
    'Collateral-free business loans, low interest rates (7.5%), and 3-year moratorium period.',
    'Loans up to ₹1,000,000',
    30000000000.00,
    'Women entrepreneurs, self-employed artisans, micro-businesses',
    'Apply through any commercial bank, RRB, or Udyamimitra online portal.',
    'https://mudra.org.in',
    '2026-06-30',
    'Active'
)
ON CONFLICT (code) DO NOTHING;

-- 4. Eligibility Rules
INSERT INTO eligibility_rules (scheme_id, min_age, max_age, gender, max_income, occupation, education_level, location_type, social_category, disability_required, additional_notes)
VALUES
(1, 18, 75, 'All', 500000.00, 'Farmer', 'All', 'All', 'All', FALSE, 'Must own arable agricultural land.'),
(2, 0, 100, 'All', 300000.00, 'All', 'All', 'All', 'All', FALSE, 'Household must be listed in SECC or BPL list.'),
(3, 16, 35, 'All', 250000.00, 'Student', 'High School Passed', 'All', 'OBC, SC, ST, EWS', FALSE, 'Minimum 50% marks in previous examination.'),
(4, 21, 70, 'All', 600000.00, 'All', 'All', 'All', 'All', FALSE, 'No family member should own a pucca house in India.'),
(5, 18, 65, 'All', 1500000.00, 'Entrepreneur / Self-Employed', 'All', 'All', 'All', FALSE, 'For new or expanding micro-business enterprises.')
ON CONFLICT (id) DO NOTHING;

-- 5. Notifications
INSERT INTO notifications (user_id, title, message, type, is_read)
VALUES
(3, 'Welcome to PolicyGPT Platform', 'Explore government policies, check scheme eligibility, and track public updates easily.', 'System Alert', FALSE),
(3, 'PM-KISAN Installment Deadline Alert', 'Upcoming deadline for PM-KISAN annual registration verification on Dec 31, 2025.', 'Scheme Deadline', FALSE),
(3, 'New Education Policy Circular Published', 'National Education Empowerment Policy 2024 guidelines are now live.', 'Policy Alert', FALSE)
ON CONFLICT (id) DO NOTHING;

-- 6. Feedback
INSERT INTO feedback (user_id, user_name, email, category, subject, message, status, admin_response)
VALUES
(3, 'Priya Sharma', 'citizen@policygpt.gov.in', 'Eligibility Inquiry', 'Clarification on PM-KISAN Land Ownership', 'Could you clarify if tenant farmers are eligible for PM-KISAN benefits under the 2024 policy guidelines?', 'Resolved', 'Tenant farmers with valid lease agreements registered in state land records are eligible for subsidy under section 4B.')
ON CONFLICT (id) DO NOTHING;

-- 7. Audit Logs
INSERT INTO audit_logs (user_id, action, resource, details, ip_address)
VALUES
(1, 'USER_LOGIN', 'AUTH', 'Administrator logged in successfully', '127.0.0.1'),
(2, 'POLICY_CREATE', 'POLICY', 'Created National Agricultural & Farmer Support Policy 2024', '127.0.0.1'),
(1, 'POLICY_APPROVE', 'POLICY', 'Approved Policy POL-AGRI-2024-01', '127.0.0.1')
ON CONFLICT (id) DO NOTHING;
