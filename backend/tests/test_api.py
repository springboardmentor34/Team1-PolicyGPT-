import time
from fastapi.testclient import TestClient
from app.main import app, startup_db_seed

startup_db_seed()
client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Online"

def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_health_db_endpoint():
    response = client.get("/health/database")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"

def test_login_all_roles():
    roles = [
        ("admin@policygpt.gov.in", "Admin@123456", "Administrator"),
        ("official@policygpt.gov.in", "Official@123456", "Government Official"),
        ("citizen@policygpt.gov.in", "Citizen@123456", "Citizen"),
        ("researcher@policygpt.gov.in", "Researcher@123456", "Researcher"),
        ("org@policygpt.gov.in", "Org@123456", "Organization")
    ]
    for email, password, expected_role in roles:
        response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
        assert response.status_code == 200, f"Login failed for {email}"
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == expected_role

def test_admin_self_register_blocked():
    response = client.post("/api/v1/auth/register", json={
        "full_name": "Fake Admin Attempt",
        "email": "hacker_admin@example.com",
        "password": "Password123!",
        "role": "Administrator"
    })
    assert response.status_code == 403
    assert "Public self-registration is permitted for Citizen accounts only" in response.json()["detail"]

def test_rbac_citizen_blocked_from_users():
    login_res = client.post("/api/v1/auth/login", json={"email": "citizen@policygpt.gov.in", "password": "Citizen@123456"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    users_res = client.get("/api/v1/users/", headers=headers)
    assert users_res.status_code == 403

def test_policy_search_and_workflow():
    off_res = client.post("/api/v1/auth/login", json={"email": "official@policygpt.gov.in", "password": "Official@123456"})
    off_token = off_res.json()["access_token"]
    off_headers = {"Authorization": f"Bearer {off_token}"}

    unique_code = f"POL-TEST-{int(time.time())}"
    create_res = client.post("/api/v1/policies/", json={
        "title": "National Green Energy Policy 2026",
        "code": unique_code,
        "description": "Framework promoting rooftop solar panels and EV subsidies.",
        "category": "Environment",
        "ministry": "Ministry of Power & Renewable Energy",
        "department": "Department of Energy",
        "state": "All India",
        "sector": "Renewable Energy"
    }, headers=off_headers)

    assert create_res.status_code == 201
    policy_id = create_res.json()["id"]
    assert create_res.json()["status"] == "SUBMITTED"

    adm_res = client.post("/api/v1/auth/login", json={"email": "admin@policygpt.gov.in", "password": "Admin@123456"})
    adm_token = adm_res.json()["access_token"]
    adm_headers = {"Authorization": f"Bearer {adm_token}"}

    appr_res = client.post(f"/api/v1/policies/{policy_id}/status", json={"status": "PUBLISHED"}, headers=adm_headers)
    assert appr_res.status_code == 200
    assert appr_res.json()["status"] == "PUBLISHED"

def test_eligibility_check():
    response = client.post("/api/v1/eligibility/check", json={
        "age": 28,
        "gender": "Female",
        "income_annual": 180000.0,
        "occupation": "Farmer",
        "education_level": "Graduate",
        "location_type": "All",
        "social_category": "OBC",
        "disability_status": False
    })
    assert response.status_code == 200
    results = response.json()
    assert len(results) > 0
    assert "match_score" in results[0]

def test_scheme_comparison():
    response = client.get("/api/v1/compare/schemes?scheme_ids=1&scheme_ids=2")
    assert response.status_code == 200
    data = response.json()
    assert "compared_items" in data
    assert len(data["compared_items"]) == 2

def test_notifications_authenticated():
    login_res = client.post("/api/v1/auth/login", json={"email": "citizen@policygpt.gov.in", "password": "Citizen@123456"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    notif_res = client.get("/api/v1/notifications/", headers=headers)
    assert notif_res.status_code == 200
    assert isinstance(notif_res.json(), list)

def test_notification_full_lifecycle_and_user_isolation():
    # 1. Login Accounts
    cit_res = client.post("/api/v1/auth/login", json={"email": "citizen@policygpt.gov.in", "password": "Citizen@123456"})
    cit_token = cit_res.json()["access_token"]
    cit_headers = {"Authorization": f"Bearer {cit_token}"}

    adm_res = client.post("/api/v1/auth/login", json={"email": "admin@policygpt.gov.in", "password": "Admin@123456"})
    adm_token = adm_res.json()["access_token"]
    adm_headers = {"Authorization": f"Bearer {adm_token}"}

    off_res = client.post("/api/v1/auth/login", json={"email": "official@policygpt.gov.in", "password": "Official@123456"})
    off_token = off_res.json()["access_token"]
    off_headers = {"Authorization": f"Bearer {off_token}"}

    # 2. Citizen Submits Inquiry -> Triggers Admin Notification & Citizen Confirmation
    fb_res = client.post("/api/v1/feedback/", json={
        "subject": "End-to-End Notification Test",
        "category": "General Enquiry",
        "message": "Testing automatic event-driven notifications."
    }, headers=cit_headers)
    assert fb_res.status_code == 201
    fb_id = fb_res.json()["id"]

    # Check Citizen received Inquiry Received notification
    cit_notifs_res = client.get("/api/v1/notifications/", headers=cit_headers)
    assert cit_notifs_res.status_code == 200
    cit_notifs = cit_notifs_res.json()
    assert any("Inquiry Submitted" in n["title"] for n in cit_notifs)

    # Check Admin received New Support Inquiry notification
    adm_notifs_res = client.get("/api/v1/notifications/", headers=adm_headers)
    assert adm_notifs_res.status_code == 200
    adm_notifs = adm_notifs_res.json()
    assert any("New Support Inquiry" in n["title"] for n in adm_notifs)

    # 3. Admin Responds to Inquiry -> Triggers Citizen Notification
    resp_res = client.put(f"/api/v1/feedback/{fb_id}/respond?response_text=Resolved+by+Admin&status_update=RESOLVED", headers=adm_headers)
    assert resp_res.status_code == 200

    cit_notifs_res2 = client.get("/api/v1/notifications/", headers=cit_headers)
    cit_notifs2 = cit_notifs_res2.json()
    assert any("Support Ticket Update" in n["title"] for n in cit_notifs2)

    # 4. Unread Count & Mark Read / Mark All Read
    unread_res = client.get("/api/v1/notifications/unread-count", headers=cit_headers)
    assert unread_res.status_code == 200
    assert unread_res.json()["unread_count"] > 0

    first_notif_id = cit_notifs2[0]["id"]
    mark_res = client.put(f"/api/v1/notifications/{first_notif_id}/read", headers=cit_headers)
    assert mark_res.status_code == 200
    assert mark_res.json()["is_read"] is True

    mark_all_res = client.put("/api/v1/notifications/read-all", headers=cit_headers)
    assert mark_all_res.status_code == 200
    assert mark_all_res.json()["message"] == "All notifications marked as read"

    unread_res2 = client.get("/api/v1/notifications/unread-count", headers=cit_headers)
    assert unread_res2.json()["unread_count"] == 0

    # 5. Delete Notification & User Isolation Verification
    del_res = client.delete(f"/api/v1/notifications/{first_notif_id}", headers=cit_headers)
    assert del_res.status_code == 200

    # Verification: Government Official CANNOT access or delete Citizen's private notification
    if len(cit_notifs2) > 1:
        other_cit_notif_id = cit_notifs2[1]["id"]
        unauth_del_res = client.delete(f"/api/v1/notifications/{other_cit_notif_id}", headers=off_headers)
        assert unauth_del_res.status_code == 404

def test_feedback_submission():
    response = client.post("/api/v1/feedback/", json={
        "user_name": "Test User",
        "email": "testuser@example.com",
        "category": "General Enquiry",
        "subject": "Portal Query",
        "message": "Testing feedback submission endpoint."
    })
    assert response.status_code == 201
    assert response.json()["status"] == "OPEN"

