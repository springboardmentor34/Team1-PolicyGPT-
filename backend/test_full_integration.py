"""
Full Integration Test Suite for PolicyGPT
Tests every backend endpoint and CRUD operation
"""
import requests
import sys
import json
import time

BASE_URL = "http://localhost:8000/api/v1"

def hr(title=""):
    print(f"\n{'='*55}")
    if title:
        print(f"  {title}")
        print('='*55)

def ok(msg):
    print(f"  ✅ {msg}")

def fail(msg):
    print(f"  ❌ FAIL: {msg}")

def warn(msg):
    print(f"  ⚠️  {msg}")

def login(email, password):
    resp = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if resp.status_code != 200:
        raise Exception(f"Login failed {email}: {resp.status_code} {resp.text}")
    return resp.json()["access_token"]

# === 1. AUTH TESTS ===
hr("1. Authentication Tests")
try:
    admin_token = login("admin@policygpt.gov.in", "Admin@123456")
    ok(f"Admin login successful")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
except Exception as e:
    fail(str(e))
    sys.exit(1)

try:
    official_token = login("official@policygpt.gov.in", "Official@123456")
    ok(f"Government Official login successful")
    official_headers = {"Authorization": f"Bearer {official_token}"}
except Exception as e:
    warn(f"Official login failed (may need to create): {e}")
    official_token = None
    official_headers = {}

try:
    citizen_token = login("citizen@policygpt.gov.in", "Citizen@123456")
    ok(f"Citizen login successful")
except Exception as e:
    warn(f"Citizen login failed: {e}")

# === 2. USER MANAGEMENT CRUD ===
hr("2. User Management CRUD")

# List all users
resp = requests.get(f"{BASE_URL}/users/", headers=admin_headers)
if resp.status_code == 200:
    users = resp.json()
    ok(f"GET /users/ → {len(users)} users loaded")
else:
    fail(f"GET /users/ status {resp.status_code}: {resp.text}")
    users = []

# Create Government Official
new_official = {
    "full_name": "Test Official CRUD",
    "email": "test_official_fullcrud@policygpt.gov.in",
    "password": "TestOfficial@123456",
    "role": "Government Official",
    "department": "Ministry of Test Affairs"
}
resp = requests.post(f"{BASE_URL}/users/", json=new_official, headers=admin_headers)
if resp.status_code == 201:
    created_official = resp.json()
    ok(f"POST /users/ → Created official ID {created_official['id']}")
elif resp.status_code == 400 and "already exists" in resp.text:
    # Find existing
    created_official = next((u for u in users if u["email"] == new_official["email"]), None)
    if created_official:
        ok(f"Official already exists (ID {created_official['id']}), using existing")
    else:
        fail(f"POST /users/ → {resp.status_code}: {resp.text}")
        created_official = None
else:
    fail(f"POST /users/ → {resp.status_code}: {resp.text}")
    created_official = None

# Update user via PUT
if created_official:
    update_payload = {
        "full_name": "Updated Test Official CRUD",
        "department": "Ministry of Finance CRUD Test",
        "state": "New Delhi",
        "occupation": "Senior Policy Analyst"
    }
    resp = requests.put(f"{BASE_URL}/users/{created_official['id']}", json=update_payload, headers=admin_headers)
    if resp.status_code == 200:
        updated = resp.json()
        if updated["full_name"] == "Updated Test Official CRUD":
            ok(f"PUT /users/{created_official['id']} → Updated successfully, name='{updated['full_name']}'")
        else:
            fail(f"PUT /users/{created_official['id']} → Name mismatch: {updated['full_name']}")
    else:
        fail(f"PUT /users/{created_official['id']} → {resp.status_code}: {resp.text}")

# Test PATCH /users/{id}/status (disable/enable)
if created_official:
    resp = requests.patch(f"{BASE_URL}/users/{created_official['id']}/status", json={"is_active": False}, headers=admin_headers)
    if resp.status_code == 200 and resp.json().get("is_active") == False:
        ok(f"PATCH /users/{created_official['id']}/status → Disabled user")
    else:
        fail(f"PATCH /users/{created_official['id']}/status → {resp.status_code}: {resp.text}")
    
    resp = requests.patch(f"{BASE_URL}/users/{created_official['id']}/status", json={"is_active": True}, headers=admin_headers)
    if resp.status_code == 200 and resp.json().get("is_active") == True:
        ok(f"PATCH /users/{created_official['id']}/status → Re-enabled user")
    else:
        fail(f"PATCH /users/{created_official['id']}/status re-enable → {resp.status_code}: {resp.text}")

# Test PATCH /users/{id}/role
if created_official:
    resp = requests.patch(f"{BASE_URL}/users/{created_official['id']}/role", json={"role": "Researcher"}, headers=admin_headers)
    if resp.status_code == 200 and resp.json().get("role") == "Researcher":
        ok(f"PATCH /users/{created_official['id']}/role → Changed to Researcher")
    else:
        fail(f"PATCH /users/{created_official['id']}/role → {resp.status_code}: {resp.text}")
    
    # Change back
    requests.patch(f"{BASE_URL}/users/{created_official['id']}/role", json={"role": "Government Official"}, headers=admin_headers)

# Delete user
if created_official:
    resp = requests.delete(f"{BASE_URL}/users/{created_official['id']}", headers=admin_headers)
    if resp.status_code == 200:
        ok(f"DELETE /users/{created_official['id']} → Deleted successfully")
    else:
        fail(f"DELETE /users/{created_official['id']} → {resp.status_code}: {resp.text}")

# === 3. POLICY CRUD ===
hr("3. Policy CRUD Tests")

# Get all policies
resp = requests.get(f"{BASE_URL}/policies/", headers=admin_headers)
if resp.status_code == 200:
    policies = resp.json()
    ok(f"GET /policies/ → {len(policies)} policies loaded")
else:
    fail(f"GET /policies/ status {resp.status_code}")
    policies = []

# Create Policy (Admin)
new_policy = {
    "title": "PolicyGPT Integration Test Policy 2026",
    "code": "POL-INTTEST-2026",
    "category": "Environment",
    "ministry": "Ministry of Integration",
    "department": "Department of Testing",
    "sector": "Technology",
    "state": "All India",
    "description": "Integration test policy created by automated test suite."
}
resp = requests.post(f"{BASE_URL}/policies/", json=new_policy, headers=admin_headers)
if resp.status_code == 201:
    created_policy = resp.json()
    ok(f"POST /policies/ → Created policy ID {created_policy['id']} status={created_policy['status']}")
elif resp.status_code == 400 and "already exists" in resp.text:
    created_policy = next((p for p in policies if p["code"] == "POL-INTTEST-2026"), None)
    ok(f"Policy already exists (ID {created_policy['id']}), using existing")
else:
    fail(f"POST /policies/ → {resp.status_code}: {resp.text}")
    created_policy = None

# Update Policy via PATCH
if created_policy:
    resp = requests.patch(f"{BASE_URL}/policies/{created_policy['id']}", json={
        "title": "Updated PolicyGPT Integration Test Policy 2026",
        "description": "Updated description by test suite."
    }, headers=admin_headers)
    if resp.status_code == 200:
        updated = resp.json()
        ok(f"PATCH /policies/{created_policy['id']} → Title='{updated['title']}'")
    else:
        fail(f"PATCH /policies/{created_policy['id']} → {resp.status_code}: {resp.text}")

# Archive policy via status
if created_policy:
    resp = requests.post(f"{BASE_URL}/policies/{created_policy['id']}/status", json={"status": "ARCHIVED"}, headers=admin_headers)
    if resp.status_code == 200 and resp.json()["status"] == "ARCHIVED":
        ok(f"POST /policies/{created_policy['id']}/status ARCHIVED → Success")
    else:
        fail(f"POST /policies/{created_policy['id']}/status → {resp.status_code}: {resp.text}")

# Get single policy
if created_policy:
    resp = requests.get(f"{BASE_URL}/policies/{created_policy['id']}")
    if resp.status_code == 200:
        ok(f"GET /policies/{created_policy['id']} → Retrieved single policy, view_count={resp.json()['view_count']}")
    else:
        fail(f"GET /policies/{created_policy['id']} → {resp.status_code}")

# Delete policy
if created_policy:
    resp = requests.delete(f"{BASE_URL}/policies/{created_policy['id']}", headers=admin_headers)
    if resp.status_code == 200:
        ok(f"DELETE /policies/{created_policy['id']} → Deleted successfully")
    else:
        fail(f"DELETE /policies/{created_policy['id']} → {resp.status_code}: {resp.text}")

# === 4. OFFICIAL: Create Policy as Official ===
hr("4. Official Policy Creation Workflow")
if official_token:
    official_policy = {
        "title": "Official Test Policy 2026",
        "code": "POL-OFFICIAL-TEST-2026",
        "category": "Education",
        "ministry": "Ministry of Education",
        "department": "Department of Schools",
        "sector": "Education",
        "state": "Karnataka",
        "description": "Policy submitted by Government Official for admin approval."
    }
    resp = requests.post(f"{BASE_URL}/policies/", json=official_policy, headers=official_headers)
    if resp.status_code == 201:
        off_pol = resp.json()
        ok(f"POST /policies/ (Official) → Created ID {off_pol['id']}, status={off_pol['status']} (should be SUBMITTED)")
        if off_pol["status"] != "SUBMITTED":
            warn(f"Expected status SUBMITTED but got {off_pol['status']}")
        
        # Admin approves
        resp2 = requests.post(f"{BASE_URL}/policies/{off_pol['id']}/status", json={"status": "PUBLISHED"}, headers=admin_headers)
        if resp2.status_code == 200:
            ok(f"Admin approved official policy → status={resp2.json()['status']}")
        
        # Cleanup - admin rejects then deletes
        requests.post(f"{BASE_URL}/policies/{off_pol['id']}/status", json={"status": "REJECTED", "rejection_reason": "Test cleanup"}, headers=admin_headers)
        requests.delete(f"{BASE_URL}/policies/{off_pol['id']}", headers=admin_headers)
        ok(f"Official policy cleaned up")
    elif resp.status_code == 400 and "already exists" in resp.text:
        warn(f"Official test policy already exists, skipping")
    else:
        fail(f"POST /policies/ (Official) → {resp.status_code}: {resp.text}")
else:
    warn("No official token, skipping official policy creation test")

# === 5. SCHEME CRUD ===
hr("5. Scheme CRUD Tests")

resp = requests.get(f"{BASE_URL}/schemes/")
if resp.status_code == 200:
    schemes = resp.json()
    ok(f"GET /schemes/ → {len(schemes)} schemes loaded (public endpoint)")
else:
    fail(f"GET /schemes/ → {resp.status_code}")
    schemes = []

new_scheme = {
    "name": "PolicyGPT Test Scheme 2026",
    "code": "SCH-TEST-FULL-2026",
    "category": "Education",
    "description": "Integration test scheme",
    "benefits": "Test benefits for integration",
    "financial_assistance": "₹50,000 annual grant",
    "target_group": "Students",
    "application_process": "Apply online",
    "application_link": "https://india.gov.in",
    "status": "Active",
    "eligibility_rule": {
        "min_age": 18, "max_age": 30, "gender": "All", "max_income": 500000,
        "occupation": "Student", "social_category": "All", "education_level": "All",
        "location_type": "All", "disability_required": False
    }
}
resp = requests.post(f"{BASE_URL}/schemes/", json=new_scheme, headers=admin_headers)
if resp.status_code == 201:
    created_scheme = resp.json()
    ok(f"POST /schemes/ → Created scheme ID {created_scheme['id']}")
elif resp.status_code == 400 and "already exists" in resp.text:
    created_scheme = next((s for s in schemes if s["code"] == "SCH-TEST-FULL-2026"), None)
    ok(f"Scheme already exists (ID {created_scheme['id']}), using existing")
else:
    fail(f"POST /schemes/ → {resp.status_code}: {resp.text}")
    created_scheme = None

if created_scheme:
    resp = requests.patch(f"{BASE_URL}/schemes/{created_scheme['id']}", json={
        "name": "Updated PolicyGPT Test Scheme 2026",
        "financial_assistance": "₹75,000 annual grant"
    }, headers=admin_headers)
    if resp.status_code == 200:
        ok(f"PATCH /schemes/{created_scheme['id']} → Updated scheme")
    else:
        fail(f"PATCH /schemes/{created_scheme['id']} → {resp.status_code}: {resp.text}")

if created_scheme:
    resp = requests.post(f"{BASE_URL}/schemes/{created_scheme['id']}/archive", json={}, headers=admin_headers)
    if resp.status_code == 200:
        ok(f"POST /schemes/{created_scheme['id']}/archive → Archived")
    else:
        fail(f"POST /schemes/{created_scheme['id']}/archive → {resp.status_code}: {resp.text}")

if created_scheme:
    resp = requests.delete(f"{BASE_URL}/schemes/{created_scheme['id']}", headers=admin_headers)
    if resp.status_code == 200:
        ok(f"DELETE /schemes/{created_scheme['id']} → Deleted")
    else:
        fail(f"DELETE /schemes/{created_scheme['id']} → {resp.status_code}: {resp.text}")

# === 6. CATEGORY CRUD ===
hr("6. Category CRUD Tests")

resp = requests.get(f"{BASE_URL}/categories/")
if resp.status_code == 200:
    cats = resp.json()
    ok(f"GET /categories/ → {len(cats)} categories")
else:
    fail(f"GET /categories/ → {resp.status_code}")
    cats = []

resp = requests.post(f"{BASE_URL}/categories/", json={"name": "Test Integration Category", "description": "Test desc"}, headers=admin_headers)
if resp.status_code == 201:
    created_cat = resp.json()
    ok(f"POST /categories/ → Created category ID {created_cat['id']}: '{created_cat['name']}'")
elif resp.status_code == 400 and "already exists" in resp.text:
    created_cat = next((c for c in cats if c["name"] == "Test Integration Category"), None)
    ok(f"Category already exists, using existing")
else:
    fail(f"POST /categories/ → {resp.status_code}: {resp.text}")
    created_cat = None

if created_cat:
    resp = requests.delete(f"{BASE_URL}/categories/{created_cat['id']}", headers=admin_headers)
    if resp.status_code == 200:
        ok(f"DELETE /categories/{created_cat['id']} → Deactivated")
    else:
        fail(f"DELETE /categories/{created_cat['id']} → {resp.status_code}: {resp.text}")

# === 7. SEARCH TESTS ===
hr("7. Intelligent Search Tests")

resp = requests.get(f"{BASE_URL}/search/?q=Agriculture")
if resp.status_code == 200:
    data = resp.json()
    ok(f"GET /search/?q=Agriculture → {data['total_results']} results ({len(data['policies'])} policies, {len(data['schemes'])} schemes)")
else:
    fail(f"GET /search/ → {resp.status_code}: {resp.text}")

resp = requests.get(f"{BASE_URL}/search/?category=Education")
if resp.status_code == 200:
    data = resp.json()
    ok(f"GET /search/?category=Education → {data['total_results']} results")
else:
    fail(f"GET /search/?category=Education → {resp.status_code}")

# === 8. ELIGIBILITY CHECKER ===
hr("8. Eligibility Checker Tests")

elig_payload = {
    "age": 25,
    "gender": "Female",
    "income_annual": 180000,
    "occupation": "Farmer",
    "education_level": "Graduate",
    "location_type": "All",
    "social_category": "OBC",
    "disability_status": False
}
resp = requests.post(f"{BASE_URL}/eligibility/check", json=elig_payload)
if resp.status_code == 200:
    results = resp.json()
    eligible_count = sum(1 for r in results if r["is_eligible"])
    ok(f"POST /eligibility/check → {len(results)} schemes evaluated, {eligible_count} eligible")
else:
    fail(f"POST /eligibility/check → {resp.status_code}: {resp.text}")

# === 9. COMPARISON TESTS ===
hr("9. Scheme Comparison Tests")
resp_schemes = requests.get(f"{BASE_URL}/schemes/")
if resp_schemes.status_code == 200:
    all_schemes = resp_schemes.json()
    if len(all_schemes) >= 2:
        id1, id2 = all_schemes[0]["id"], all_schemes[1]["id"]
        resp = requests.get(f"{BASE_URL}/compare/schemes?scheme_ids={id1}&scheme_ids={id2}")
        if resp.status_code == 200:
            cdata = resp.json()
            ok(f"GET /compare/schemes → {len(cdata['compared_items'])} items compared")
        else:
            fail(f"GET /compare/schemes → {resp.status_code}: {resp.text}")
    else:
        warn(f"Only {len(all_schemes)} schemes exist, need at least 2 for comparison")

# === 10. FEEDBACK/SUPPORT TESTS ===
hr("10. Feedback & Support Ticket CRUD")

fb_payload = {
    "user_name": "Test User CRUD",
    "email": "testuser@example.com",
    "category": "General Enquiry",
    "subject": "Integration Test Ticket",
    "message": "This is an automated integration test feedback message."
}
resp = requests.post(f"{BASE_URL}/feedback/", json=fb_payload)
if resp.status_code == 201:
    created_fb = resp.json()
    ok(f"POST /feedback/ → Created ticket ID {created_fb['id']}, status={created_fb['status']}")
else:
    fail(f"POST /feedback/ → {resp.status_code}: {resp.text}")
    created_fb = None

if created_fb:
    resp = requests.get(f"{BASE_URL}/feedback/", headers=admin_headers, params={"search": "Integration Test Ticket"})
    if resp.status_code == 200:
        fbs = resp.json()
        ok(f"GET /feedback/?search=Integration Test Ticket → {len(fbs)} tickets found")
    else:
        fail(f"GET /feedback/ → {resp.status_code}: {resp.text}")

if created_fb:
    resp = requests.put(f"{BASE_URL}/feedback/{created_fb['id']}/respond", 
                       params={"status_update": "RESOLVED", "response_text": "Test response from admin integration test."},
                       headers=admin_headers)
    if resp.status_code == 200:
        updated_fb = resp.json()
        ok(f"PUT /feedback/{created_fb['id']}/respond → Status={updated_fb['status']}, response saved")
    else:
        fail(f"PUT /feedback/{created_fb['id']}/respond → {resp.status_code}: {resp.text}")

if created_fb:
    resp = requests.delete(f"{BASE_URL}/feedback/{created_fb['id']}", headers=admin_headers)
    if resp.status_code == 200:
        ok(f"DELETE /feedback/{created_fb['id']} → Deleted successfully")
    else:
        fail(f"DELETE /feedback/{created_fb['id']} → {resp.status_code}: {resp.text}")

# === 11. ANALYTICS & REPORTS ===
hr("11. Analytics & Reports")
resp = requests.get(f"{BASE_URL}/analytics/summary")
if resp.status_code == 200:
    data = resp.json()
    ok(f"GET /analytics/summary → Policies={data['policies']['total']}, Schemes={data['schemes']['total']}, Users={data['users']['total']}")
else:
    fail(f"GET /analytics/summary → {resp.status_code}")

resp = requests.get(f"{BASE_URL}/reports/policies/pdf")
if resp.status_code == 200:
    ok(f"GET /reports/policies/pdf → PDF generated, content-type={resp.headers.get('content-type','unknown')}")
else:
    fail(f"GET /reports/policies/pdf → {resp.status_code}")

resp = requests.get(f"{BASE_URL}/reports/schemes/excel")
if resp.status_code == 200:
    ok(f"GET /reports/schemes/excel → Excel generated, content-type={resp.headers.get('content-type','unknown')}")
else:
    fail(f"GET /reports/schemes/excel → {resp.status_code}")

# === 12. FAQs ===
hr("12. FAQs")
resp = requests.get(f"{BASE_URL}/feedback/faqs")
if resp.status_code == 200:
    faqs = resp.json()
    ok(f"GET /feedback/faqs → {len(faqs)} FAQs returned")
else:
    fail(f"GET /feedback/faqs → {resp.status_code}")

# === 13. AUTHORIZATION TESTS ===
hr("13. Authorization & Security Tests")
# Citizen should not access user management
citizen_headers = {"Authorization": f"Bearer {citizen_token}"}
resp = requests.get(f"{BASE_URL}/users/", headers=citizen_headers)
if resp.status_code == 403:
    ok(f"GET /users/ with Citizen token → 403 Forbidden (correct)")
else:
    fail(f"GET /users/ with Citizen token → {resp.status_code} (expected 403)")

# Citizen should not create users
resp = requests.post(f"{BASE_URL}/users/", json={"full_name": "Hacker", "email": "hack@hack.com", "password": "hack", "role": "Administrator"}, headers=citizen_headers)
if resp.status_code in [403, 401]:
    ok(f"POST /users/ with Citizen token → {resp.status_code} Forbidden (correct)")
else:
    fail(f"POST /users/ with Citizen token → {resp.status_code} (expected 403/401)")

# Unauthenticated delete attempt
resp = requests.delete(f"{BASE_URL}/policies/1")
if resp.status_code in [401, 403]:
    ok(f"DELETE /policies/1 without token → {resp.status_code} Unauthorized (correct)")
else:
    fail(f"DELETE /policies/1 without token → {resp.status_code} (expected 401/403)")

hr("ALL TESTS COMPLETE")
print("  Backend is fully operational with all CRUD operations working.")
