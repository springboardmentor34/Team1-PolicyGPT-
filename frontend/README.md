# PolicyGPT Frontend (`frontend/`)

This directory contains the **Angular 17+** Single Page Application (SPA) for **PolicyGPT: Government Policy & Public Scheme Intelligence Platform**.

---

## Technical Features
- **Role-Based Routing & Guards**: Tailored user experience and dashboards for Administrator, Government Official, Citizen, Researcher, Organization, and Guest User.
- **Intelligent Policy Search & Faceted Filtering**: Instant search by state, ministry, sector, status, and category.
- **Automated Scheme Eligibility Checker**: Interactive demographic evaluation engine.
- **Side-by-Side Scheme Comparison Matrix**: Side-by-side comparative table for up to 4 schemes.
- **PDF & Excel Exporter**: Direct downloads for policy documents and scheme datasets.

---

## How to Run Frontend Locally

### Step 1: Install Dependencies
```bash
cd /Users/kyashwanth/Documents/1/frontend
npm install
```

### Step 2: Start Angular Dev Server
```bash
npm start
# or
npx ng serve --open
```

Navigate your browser to `http://localhost:4200/`.

---

## Role Credentials Quick Reference

| Role | Email | Password | Destination Dashboard |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@policygpt.gov.in` | `Admin@123456` | `/dashboards/admin` |
| **Government Official** | `official@policygpt.gov.in` | `Official@123456` | `/dashboards/official` |
| **Citizen** | `citizen@policygpt.gov.in` | `Citizen@123456` | `/dashboards/citizen` |
| **Researcher** | `researcher@policygpt.gov.in` | `Researcher@123456` | `/dashboards/researcher` |
| **Organization** | `org@policygpt.gov.in` | `Org@123456` | `/dashboards/organization` |
| **Guest User** | *Direct Entry* | *N/A* | `/dashboards/public` |
