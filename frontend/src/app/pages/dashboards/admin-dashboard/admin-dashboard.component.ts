import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Policy, Scheme, User, FeedbackItem } from '../../../core/models/models';
import { ScrollRevealDirective } from '../../../core/directives/scroll-reveal.directive';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollRevealDirective],
  template: `
    <div class="container-fluid p-0">
      <!-- Header Bar -->
      <div appScrollReveal class="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3">
        <div>
          <span class="badge bg-danger text-white px-3 py-1.5 rounded-pill mb-2"><i class="fa-solid fa-user-shield me-1"></i> SYSTEM ADMINISTRATOR CONTROL CENTER</span>
          <h2 class="fw-bold mb-0" style="color: var(--gov-navy-primary);">Global Platform Governance & Account Provisioning</h2>
        </div>
        <div class="d-flex flex-wrap align-items-center gap-2">
          <div class="btn-group btn-group-sm shadow-sm" role="group">
            <button (click)="openUserModal()" class="btn btn-success"><i class="fa-solid fa-user-plus me-1"></i> Provision User</button>
            <button (click)="openCreatePolicyModal()" class="btn btn-gov-navy"><i class="fa-solid fa-file-circle-plus me-1"></i> Policy</button>
            <button (click)="openCreateSchemeModal()" class="btn btn-gov-saffron"><i class="fa-solid fa-hand-holding-medical me-1"></i> Scheme</button>
            <button (click)="openCategoryModal()" class="btn btn-gov-outline"><i class="fa-solid fa-folder-plus me-1"></i> Category</button>
          </div>
          <div class="btn-group btn-group-sm shadow-sm" role="group">
            <button (click)="apiService.downloadPoliciesPdf()" class="btn btn-light border" title="Export Policies PDF"><i class="fa-solid fa-file-pdf me-1 text-danger"></i> PDF</button>
            <button (click)="apiService.downloadSchemesExcel()" class="btn btn-light border" title="Export Schemes Excel"><i class="fa-solid fa-file-excel me-1 text-success"></i> Excel</button>
          </div>
        </div>
      </div>

      <!-- Metrics Row -->
      <div class="row g-4 mb-4">
        <div class="col-sm-6 col-xl-3">
          <div class="stat-card">
            <span class="text-muted small fw-semibold text-uppercase">Total Policies</span>
            <div class="stat-number">
              <span *ngIf="loadingStats" class="spinner-border spinner-border-sm text-secondary"></span>
              <span *ngIf="!loadingStats">{{ stats?.policies?.total || 0 }}</span>
            </div>
            <span class="fs-7 text-success"><i class="fa-solid fa-check me-1"></i>{{ stats?.policies?.published || 0 }} Published</span>
          </div>
        </div>
        <div class="col-sm-6 col-xl-3">
          <div class="stat-card saffron">
            <span class="text-muted small fw-semibold text-uppercase">Pending Approvals</span>
            <div class="stat-number text-warning">
              <span *ngIf="loadingStats" class="spinner-border spinner-border-sm text-warning"></span>
              <span *ngIf="!loadingStats">{{ stats?.policies?.pending || 0 }}</span>
            </div>
            <span class="fs-7 text-muted">Awaiting Admin Workflow</span>
          </div>
        </div>
        <div class="col-sm-6 col-xl-3">
          <div class="stat-card green">
            <span class="text-muted small fw-semibold text-uppercase">Active Schemes</span>
            <div class="stat-number text-success">
              <span *ngIf="loadingStats" class="spinner-border spinner-border-sm text-success"></span>
              <span *ngIf="!loadingStats">{{ stats?.schemes?.active || 0 }}</span>
            </div>
            <span class="fs-7 text-muted">Total: {{ stats?.schemes?.total || 0 }}</span>
          </div>
        </div>
        <div class="col-sm-6 col-xl-3">
          <div class="stat-card">
            <span class="text-muted small fw-semibold text-uppercase">Registered Users</span>
            <div class="stat-number">
              <span *ngIf="loadingStats" class="spinner-border spinner-border-sm text-secondary"></span>
              <span *ngIf="!loadingStats">{{ stats?.users?.total || 0 }}</span>
            </div>
            <span class="fs-7 text-muted">RBAC Active</span>
          </div>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- SECTION 1: PENDING POLICY APPROVALS -->
      <!-- ============================================================ -->
      <div class="gov-card p-4 mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="fw-bold mb-0" style="color: var(--gov-navy-primary);"><i class="fa-solid fa-clock-rotate-left me-2"></i> Policies Awaiting Workflow Approval</h4>
          <span class="badge bg-warning text-dark">{{ pendingPolicies.length }} Pending</span>
        </div>
        <div *ngIf="loadingPending" class="p-4 text-center text-muted">
          <div class="spinner-border spinner-border-sm text-warning me-2"></div>
          <span>Loading pending workflow items...</span>
        </div>
        <div *ngIf="!loadingPending && pendingPolicies.length === 0" class="p-4 text-center text-muted bg-light rounded">
          <i class="fa-solid fa-circle-check fs-3 text-success mb-2"></i>
          <p class="mb-0 fw-semibold">No pending policies requiring approval.</p>
        </div>
        <div *ngIf="!loadingPending && pendingPolicies.length > 0" class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Code</th><th>Policy Title</th><th>Category</th><th>Ministry</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let pol of pendingPolicies">
                <td><span class="badge bg-secondary">{{ pol.code }}</span></td>
                <td class="fw-semibold">{{ pol.title }}</td>
                <td><span class="badge bg-light text-dark border">{{ pol.category }}</span></td>
                <td>{{ pol.ministry }}</td>
                <td><span class="badge bg-warning text-dark">{{ pol.status }}</span></td>
                <td>
                  <button (click)="approvePolicy(pol.id)" class="btn btn-success btn-sm me-1 px-3">
                    <i class="fa-solid fa-check me-1"></i> Approve
                  </button>
                  <button (click)="rejectPolicyPrompt(pol.id)" class="btn btn-outline-danger btn-sm px-3">
                    <i class="fa-solid fa-xmark me-1"></i> Reject
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- SECTION 2: POLICY MANAGEMENT -->
      <!-- ============================================================ -->
      <div class="gov-card p-4 mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
          <div>
            <h4 class="fw-bold mb-0" style="color: var(--gov-navy-primary);"><i class="fa-solid fa-file-contract me-2"></i> Policy Management</h4>
            <p class="text-muted small mb-0">Create, edit, approve, archive, and delete all government policies.</p>
          </div>
          <button (click)="openCreatePolicyModal()" class="btn btn-gov-navy btn-sm"><i class="fa-solid fa-plus me-1"></i> + Create Policy</button>
        </div>

        <!-- Policy Search & Filters -->
        <div class="row g-2 mb-3">
          <div class="col-md-4">
            <input type="text" [(ngModel)]="policySearch" (input)="applyPolicyFilters()"
              class="form-control form-control-sm" placeholder="Search by title, code, or ministry...">
          </div>
          <div class="col-md-3">
            <select [(ngModel)]="policyStatusFilter" (change)="applyPolicyFilters()" class="form-select form-select-sm">
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="PUBLISHED">Published</option>
              <option value="REJECTED">Rejected</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div class="col-md-3">
            <select [(ngModel)]="policyCategoryFilter" (change)="applyPolicyFilters()" class="form-select form-select-sm">
              <option value="">All Categories</option>
              <option *ngFor="let cat of categories" [value]="cat.name">{{ cat.name }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <button (click)="resetPolicyFilters()" class="btn btn-light btn-sm border w-100">
              <i class="fa-solid fa-rotate-left me-1"></i> Reset
            </button>
          </div>
        </div>
        <div class="text-muted small mb-2">Showing {{ filteredPolicies.length }} of {{ allPolicies.length }} policies</div>

        <div *ngIf="loadingPolicies" class="p-4 text-center text-muted">
          <div class="spinner-border spinner-border-sm text-secondary me-2"></div>
          <span>Loading policies from database...</span>
        </div>
        <div class="table-responsive" *ngIf="!loadingPolicies">
          <table class="table table-hover align-middle mb-0 small">
            <thead class="table-light">
              <tr>
                <th>Code</th><th>Title</th><th>Category</th><th>Ministry</th><th>Status</th><th>Views</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filteredPolicies.length === 0">
                <td colspan="7" class="text-center py-4 text-muted"><i class="fa-solid fa-inbox me-1"></i> No policies found matching current filters.</td>
              </tr>
              <tr *ngFor="let pol of filteredPolicies">
                <td><span class="badge bg-navy text-white font-monospace px-2 py-1" style="background-color: var(--gov-navy-primary);">{{ pol.code }}</span></td>
                <td class="fw-semibold" style="max-width: 200px;" title="{{ pol.title }}">
                  {{ pol.title | slice:0:50 }}{{ pol.title.length > 50 ? '...' : '' }}
                </td>
                <td><span class="badge bg-light text-dark border">{{ pol.category }}</span></td>
                <td style="max-width: 130px;" title="{{ pol.ministry }}">{{ pol.ministry | slice:0:30 }}{{ pol.ministry.length > 30 ? '...' : '' }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'bg-success': pol.status === 'PUBLISHED',
                    'bg-warning text-dark': pol.status === 'SUBMITTED' || pol.status === 'DRAFT',
                    'bg-secondary': pol.status === 'ARCHIVED',
                    'bg-danger': pol.status === 'REJECTED'
                  }">{{ pol.status }}</span>
                </td>
                <td>{{ pol.view_count }}</td>
                <td>
                  <div class="d-flex gap-1">
                    <button (click)="openEditPolicyModal(pol)" class="btn btn-outline-primary btn-sm px-2" title="Edit">
                      <i class="fa-solid fa-pen"></i>
                    </button>
                    <button *ngIf="pol.status === 'SUBMITTED'" (click)="approvePolicy(pol.id)" class="btn btn-success btn-sm px-2" title="Approve">
                      <i class="fa-solid fa-check"></i>
                    </button>
                    <button *ngIf="pol.status !== 'ARCHIVED'" (click)="archivePolicyAction(pol.id)" class="btn btn-outline-secondary btn-sm px-2" title="Archive">
                      <i class="fa-solid fa-box-archive"></i>
                    </button>
                    <button (click)="deletePolicyAction(pol.id, pol.title)" class="btn btn-danger btn-sm px-2" title="Delete">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- SECTION 3: SCHEME MANAGEMENT -->
      <!-- ============================================================ -->
      <div class="gov-card p-4 mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
          <div>
            <h4 class="fw-bold mb-0" style="color: var(--gov-navy-primary);"><i class="fa-solid fa-hand-holding-hand me-2"></i> Scheme Management</h4>
            <p class="text-muted small mb-0">Create, edit, archive, and delete public welfare schemes from the database.</p>
          </div>
          <button (click)="openCreateSchemeModal()" class="btn btn-gov-saffron btn-sm"><i class="fa-solid fa-plus me-1"></i> + Create Scheme</button>
        </div>

        <!-- Scheme Search & Filters -->
        <div class="row g-2 mb-3">
          <div class="col-md-4">
            <input type="text" [(ngModel)]="schemeSearch" (input)="applySchemeFilters()"
              class="form-control form-control-sm" placeholder="Search by name or code...">
          </div>
          <div class="col-md-3">
            <select [(ngModel)]="schemeCategoryFilter" (change)="applySchemeFilters()" class="form-select form-select-sm">
              <option value="">All Categories</option>
              <option *ngFor="let cat of categories" [value]="cat.name">{{ cat.name }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <select [(ngModel)]="schemeStatusFilter" (change)="applySchemeFilters()" class="form-select form-select-sm">
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
              <option value="Under Review">Under Review</option>
            </select>
          </div>
          <div class="col-md-2">
            <button (click)="resetSchemeFilters()" class="btn btn-light btn-sm border w-100">
              <i class="fa-solid fa-rotate-left me-1"></i> Reset
            </button>
          </div>
        </div>
        <div class="text-muted small mb-2">Showing {{ filteredSchemes.length }} of {{ allSchemes.length }} schemes</div>

        <div *ngIf="loadingSchemes" class="p-4 text-center text-muted">
          <div class="spinner-border spinner-border-sm text-warning me-2"></div>
          <span>Loading schemes from database...</span>
        </div>
        <div class="table-responsive" *ngIf="!loadingSchemes">
          <table class="table table-hover align-middle mb-0 small">
            <thead class="table-light">
              <tr>
                <th>Code</th><th>Scheme Name</th><th>Category</th><th>Financial Assistance</th><th>Target Group</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filteredSchemes.length === 0">
                <td colspan="7" class="text-center py-4 text-muted"><i class="fa-solid fa-inbox me-1"></i> No schemes found.</td>
              </tr>
              <tr *ngFor="let s of filteredSchemes">
                <td><span class="badge bg-secondary">{{ s.code }}</span></td>
                <td class="fw-semibold">{{ s.name }}</td>
                <td><span class="badge" style="background-color: var(--gov-navy-primary);" class="text-white">{{ s.category }}</span></td>
                <td class="fw-bold text-success small">{{ s.financial_assistance || s.benefits | slice:0:40 }}</td>
                <td class="small text-muted">{{ s.target_group || 'All Citizens' | slice:0:30 }}</td>
                <td>
                  <span class="badge" [ngClass]="s.status === 'Active' ? 'bg-success' : 'bg-secondary'">{{ s.status }}</span>
                </td>
                <td>
                  <div class="d-flex gap-1">
                    <button (click)="openEditSchemeModal(s)" class="btn btn-outline-primary btn-sm px-2" title="Edit">
                      <i class="fa-solid fa-pen"></i>
                    </button>
                    <button *ngIf="s.status !== 'Archived'" (click)="archiveSchemeAction(s.id)" class="btn btn-outline-secondary btn-sm px-2" title="Archive">
                      <i class="fa-solid fa-box-archive"></i>
                    </button>
                    <button (click)="deleteSchemeAction(s.id, s.name)" class="btn btn-danger btn-sm px-2" title="Delete">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- SECTION 4: USER MANAGEMENT -->
      <!-- ============================================================ -->
      <div class="gov-card p-4 mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
          <div>
            <h4 class="fw-bold mb-0" style="color: var(--gov-navy-primary);"><i class="fa-solid fa-users-gear me-2"></i> User Provisioning & Access Control</h4>
            <p class="text-muted small mb-0">Manage platform users. Only Citizens can self-register; all other role accounts are provisioned here.</p>
          </div>
          <button (click)="openUserModal()" class="btn btn-gov-navy btn-sm"><i class="fa-solid fa-user-plus me-1"></i> + Create User</button>
        </div>

        <!-- User Search & Filters -->
        <div class="row g-2 mb-3">
          <div class="col-md-4">
            <input type="text" [(ngModel)]="userSearch" (input)="onUserSearchChange()"
              class="form-control form-control-sm" placeholder="Search by name, email, or department...">
          </div>
          <div class="col-md-3">
            <select [(ngModel)]="roleFilter" (change)="fetchUsers()" class="form-select form-select-sm">
              <option value="">All Roles</option>
              <option value="Administrator">Administrator</option>
              <option value="Government Official">Government Official</option>
              <option value="Citizen">Citizen</option>
              <option value="Researcher">Researcher</option>
              <option value="Organization">Organization</option>
            </select>
          </div>
          <div class="col-md-3">
            <select [(ngModel)]="statusFilter" (change)="fetchUsers()" class="form-select form-select-sm">
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Disabled Only</option>
            </select>
          </div>
          <div class="col-md-2">
            <button (click)="resetUserFilters()" class="btn btn-light btn-sm border w-100">
              <i class="fa-solid fa-rotate-left me-1"></i> Reset
            </button>
          </div>
        </div>
        <div class="text-muted small mb-2">{{ users.length }} user{{ users.length !== 1 ? 's' : '' }} found</div>

        <div *ngIf="loadingUsers" class="p-4 text-center text-muted">
          <div class="spinner-border spinner-border-sm text-secondary me-2"></div>
          <span>Loading registered users from database...</span>
        </div>
        <div *ngIf="!loadingUsers" class="table-responsive">
          <table class="table table-hover align-middle mb-0 small">
            <thead class="table-light">
              <tr>
                <th>ID</th><th>Full Name</th><th>Email</th><th>Role</th><th>Status</th><th>Change Role</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="users.length === 0">
                <td colspan="7" class="text-center py-4 text-muted">No users found matching current filters.</td>
              </tr>
              <tr *ngFor="let u of users">
                <td>#{{ u.id }}</td>
                <td class="fw-semibold">{{ u.full_name }}</td>
                <td>{{ u.email }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'bg-danger': u.role === 'Administrator',
                    'bg-navy text-white': u.role === 'Government Official',
                    'bg-info text-dark': u.role === 'Citizen',
                    'bg-warning text-dark': u.role === 'Researcher',
                    'bg-secondary': u.role === 'Organization'
                  }">{{ u.role }}</span>
                </td>
                <td>
                  <span class="badge" [ngClass]="u.is_active ? 'bg-success' : 'bg-danger'">
                    {{ u.is_active ? 'Active' : 'Disabled' }}
                  </span>
                </td>
                <td>
                  <select *ngIf="u.role !== 'Administrator'" [ngModel]="u.role" (change)="changeRole(u.id, $event)" class="form-select form-select-sm" style="width:160px;">
                    <option value="Government Official">Government Official</option>
                    <option value="Citizen">Citizen</option>
                    <option value="Researcher">Researcher</option>
                    <option value="Organization">Organization</option>
                  </select>
                  <span *ngIf="u.role === 'Administrator'" class="text-muted small">Protected Admin</span>
                </td>
                <td>
                  <div class="d-flex gap-1 align-items-center">
                    <button (click)="openEditUserModal(u)" class="btn btn-outline-primary btn-sm px-2" title="Edit Account Details">
                      <i class="fa-solid fa-pen"></i>
                    </button>
                    <button (click)="toggleUserStatus(u)" class="btn btn-sm" [ngClass]="u.is_active ? 'btn-outline-danger' : 'btn-outline-success'">
                      {{ u.is_active ? 'Disable' : 'Enable' }}
                    </button>
                    <button *ngIf="u.role !== 'Administrator'" (click)="deleteUser(u.id)" class="btn btn-danger btn-sm" title="Delete Account">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>

              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- SECTION 5: CATEGORIES -->
      <!-- ============================================================ -->
      <div class="gov-card p-4 mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="fw-bold mb-0" style="color: var(--gov-navy-primary);"><i class="fa-solid fa-folder-tree me-2"></i> Master Categories & Taxonomies</h4>
          <button (click)="showCategoryModal = true" class="btn btn-gov-navy btn-sm"><i class="fa-solid fa-plus me-1"></i> + New Category</button>
        </div>
        <div class="row g-3">
          <div *ngFor="let cat of categories" class="col-md-4 col-lg-3">
            <div class="p-3 border rounded bg-light d-flex justify-content-between align-items-center">
              <div>
                <strong class="d-block text-dark fs-7">{{ cat.name }}</strong>
                <span class="text-muted small fs-8">Slug: {{ cat.slug }}</span>
              </div>
              <button (click)="deactivateCategory(cat.id)" class="btn btn-link text-danger btn-sm p-0 text-decoration-none" title="Deactivate Category">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- SECTION 6: AUDIT LOGS -->
      <!-- ============================================================ -->
      <div class="gov-card p-4 mb-4">
        <h4 class="fw-bold mb-3" style="color: var(--gov-navy-primary);"><i class="fa-solid fa-list-check me-2"></i> System Security Audit Logs Stream</h4>
        <div class="list-group list-group-flush">
          <div *ngFor="let audit of stats?.recent_audit_logs" class="list-group-item px-0 d-flex justify-content-between align-items-center">
            <div>
              <span class="badge bg-success me-2">{{ audit.action }}</span>
              <strong class="me-2 text-dark">{{ audit.resource }}</strong>
              <span class="text-secondary small">{{ audit.details }}</span>
            </div>
            <span class="fs-7 text-muted">{{ audit.timestamp | date:'medium' }}</span>
          </div>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- SECTION 7: USER QUERIES & SUPPORT TICKETS -->
      <!-- ============================================================ -->
      <div class="gov-card p-4 mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
          <div>
            <h4 class="fw-bold mb-0" style="color: var(--gov-navy-primary);"><i class="fa-solid fa-headset me-2"></i> User Queries & Support Tickets Management</h4>
            <p class="text-muted small mb-0">Review, respond to, and manage citizen support tickets and inquiry submissions.</p>
          </div>
          <span class="badge bg-navy text-white" style="background-color: var(--gov-navy-primary);">{{ queries.length }} Total Tickets</span>
        </div>

        <!-- Search & Filter Bar for Queries -->
        <div class="row g-2 mb-3">
          <div class="col-md-4">
            <input type="text" [(ngModel)]="querySearch" (input)="onQuerySearchChange()"
              class="form-control form-control-sm" placeholder="Search by ID, name, email, subject, message...">
          </div>
          <div class="col-md-3">
            <select [(ngModel)]="queryStatusFilter" (change)="fetchQueries()" class="form-select form-select-sm">
              <option value="">All Statuses</option>
              <option value="OPEN">Open / Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div class="col-md-3">
            <select [(ngModel)]="queryCategoryFilter" (change)="fetchQueries()" class="form-select form-select-sm">
              <option value="">All Categories</option>
              <option value="Eligibility Inquiry">Eligibility Inquiry</option>
              <option value="Policy Clarification">Policy Clarification</option>
              <option value="Technical Bug Report">Technical Bug Report</option>
              <option value="General Enquiry">General Enquiry</option>
            </select>
          </div>
          <div class="col-md-2">
            <button (click)="resetQueryFilters()" class="btn btn-light btn-sm border w-100">
              <i class="fa-solid fa-rotate-left me-1"></i> Reset
            </button>
          </div>
        </div>

        <div *ngIf="loadingQueries" class="p-4 text-center text-muted">
          <div class="spinner-border spinner-border-sm text-secondary me-2"></div>
          <span>Loading support tickets from database...</span>
        </div>
        <div *ngIf="!loadingQueries" class="table-responsive">
          <table class="table table-hover align-middle mb-0 small">
            <thead class="table-light">
              <tr>
                <th>Ticket ID</th><th>User Name</th><th>Email</th><th>Category</th><th>Subject</th><th>Status</th><th>Submitted</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="queries.length === 0">
                <td colspan="8" class="text-center py-4 text-muted"><i class="fa-solid fa-inbox me-1"></i> No support queries found.</td>
              </tr>
              <tr *ngFor="let q of queries">
                <td><span class="badge bg-secondary">#{{ q.id }}</span></td>
                <td class="fw-semibold">{{ q.user_name || 'Guest Citizen' }}</td>
                <td>{{ q.email }}</td>
                <td><span class="badge bg-light text-dark border">{{ q.category }}</span></td>
                <td style="max-width:200px;" title="{{ q.subject }}">{{ q.subject | slice:0:35 }}{{ q.subject.length > 35 ? '...' : '' }}</td>
                <td>
                  <select [ngModel]="q.status" (change)="updateQueryStatus(q.id, $event)" class="form-select form-select-sm py-0 px-2 fw-bold" [ngClass]="{
                    'text-danger border-danger': q.status === 'OPEN' || q.status === 'Pending',
                    'text-warning border-warning': q.status === 'IN_PROGRESS',
                    'text-success border-success': q.status === 'RESOLVED',
                    'text-secondary border-secondary': q.status === 'CLOSED'
                  }" style="width:135px; font-size: 0.8rem;">
                    <option value="OPEN">Open / Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </td>
                <td>{{ q.created_at | date:'shortDate' }}</td>
                <td>
                  <div class="d-flex gap-1">
                    <button (click)="openQueryModal(q)" class="btn btn-outline-primary btn-sm px-2" title="View & Respond">
                      <i class="fa-solid fa-reply me-1"></i> Respond
                    </button>
                    <button (click)="deleteQueryAction(q.id)" class="btn btn-danger btn-sm px-2" title="Delete Ticket">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- SECTION 8: DEPARTMENT ANALYTICS & COMPARISON -->
      <!-- ============================================================ -->

      <div class="gov-card p-4 mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 class="fw-bold mb-0" style="color: var(--gov-navy-primary);"><i class="fa-solid fa-building-columns me-2"></i> Department Analytics & Comparative Metrics</h4>
            <p class="text-muted small mb-0">Overview of policies, schemes, and official personnel across government departments.</p>
          </div>
          <button (click)="apiService.downloadDepartmentPdf()" class="btn btn-outline-primary btn-sm">
            <i class="fa-solid fa-file-pdf me-1"></i> Department PDF Report
          </button>
        </div>

        <div *ngIf="loadingDepts" class="p-4 text-center text-muted">
          <div class="spinner-border spinner-border-sm text-secondary me-2"></div>
          <span>Loading department analytics from PostgreSQL...</span>
        </div>
        <div *ngIf="!loadingDepts" class="table-responsive">
          <table class="table table-hover align-middle mb-0 small">
            <thead class="table-light">
              <tr>
                <th>Department Name</th><th>Total Directives</th><th>Published Directives</th><th>Assigned Officials</th><th>Export</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="departmentAnalytics.length === 0">
                <td colspan="5" class="text-center py-3 text-muted">No department data found.</td>
              </tr>
              <tr *ngFor="let dept of departmentAnalytics">
                <td class="fw-bold text-dark">{{ dept.department }}</td>
                <td><span class="badge bg-secondary">{{ dept.total_policies }}</span></td>
                <td><span class="badge bg-success">{{ dept.published_policies }}</span></td>
                <td><span class="badge bg-info text-dark">{{ dept.officials_count }} Officials</span></td>
                <td>
                  <button (click)="apiService.downloadDepartmentPdf(dept.department)" class="btn btn-sm btn-light border px-2">
                    <i class="fa-solid fa-download text-danger me-1"></i> PDF
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- SECTION 9: REAL SYSTEM USAGE STATISTICS -->
      <!-- ============================================================ -->
      <div class="gov-card p-4 mb-4">
        <h4 class="fw-bold mb-3" style="color: var(--gov-navy-primary);"><i class="fa-solid fa-chart-line me-2"></i> System Usage Statistics & Search Activity</h4>
        <div *ngIf="loadingUsage" class="p-4 text-center text-muted">
          <div class="spinner-border spinner-border-sm text-secondary me-2"></div>
          <span>Loading usage statistics...</span>
        </div>
        <div *ngIf="!loadingUsage && usageStats" class="row g-4">
          <div class="col-md-3">
            <div class="p-3 bg-light rounded border text-center">
              <span class="text-muted fs-7 font-monospace fw-semibold text-uppercase">Total Policy Searches</span>
              <h3 class="fw-bold text-primary mb-0 mt-1">{{ usageStats.total_searches }}</h3>
            </div>
          </div>
          <div class="col-md-3">
            <div class="p-3 bg-light rounded border text-center">
              <span class="text-muted fs-7 font-monospace fw-semibold text-uppercase">Eligibility Checks</span>
              <h3 class="fw-bold text-success mb-0 mt-1">{{ usageStats.eligibility_check_count }}</h3>
            </div>
          </div>
          <div class="col-md-3">
            <div class="p-3 bg-light rounded border text-center">
              <span class="text-muted fs-7 font-monospace fw-semibold text-uppercase">Schemes Compared</span>
              <h3 class="fw-bold text-warning mb-0 mt-1">{{ usageStats.comparison_count }}</h3>
            </div>
          </div>
          <div class="col-md-3">
            <div class="p-3 bg-light rounded border text-center">
              <span class="text-muted fs-7 font-monospace fw-semibold text-uppercase">Reports Generated</span>
              <h3 class="fw-bold text-info mb-0 mt-1">{{ usageStats.report_generation_count }}</h3>
            </div>
          </div>

          <!-- Top Search Keywords -->
          <div class="col-md-6">
            <div class="p-3 border rounded bg-white">
              <h6 class="fw-bold text-dark mb-2"><i class="fa-solid fa-fire me-1 text-danger"></i> Top Search Queries</h6>
              <div *ngIf="usageStats.top_search_terms?.length === 0" class="text-muted small">No searches recorded yet.</div>
              <ul class="list-group list-group-flush small">
                <li *ngFor="let item of usageStats.top_search_terms" class="list-group-item d-flex justify-content-between align-items-center px-0 py-1.5">
                  <span class="fw-medium text-dark">{{ item.query }}</span>
                  <span class="badge bg-primary rounded-pill">{{ item.count }} searches</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Recent Searches Stream -->
          <div class="col-md-6">
            <div class="p-3 border rounded bg-white">
              <h6 class="fw-bold text-dark mb-2"><i class="fa-solid fa-clock-rotate-left me-1 text-secondary"></i> Recent Search Activity Stream</h6>
              <div *ngIf="usageStats.recent_searches?.length === 0" class="text-muted small">No recent searches.</div>
              <ul class="list-group list-group-flush small">
                <li *ngFor="let s of usageStats.recent_searches" class="list-group-item d-flex justify-content-between align-items-center px-0 py-1.5">
                  <div>
                    <strong class="text-dark">{{ s.query || 'Category Filter' }}</strong>
                    <span class="text-muted ms-2 fs-8">({{ s.results }} results)</span>
                  </div>
                  <span class="text-muted fs-8">{{ s.time | date:'shortTime' }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="showQueryModal" class="modal d-block" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content p-4 gov-card border-0">
            <div class="modal-header border-0 pb-0">
              <h4 class="fw-bold mb-0" style="color: var(--gov-navy-primary);">Support Ticket #{{ activeQuery?.id }} — {{ activeQuery?.subject }}</h4>
              <button (click)="closeQueryModal()" type="button" class="btn-close"></button>
            </div>
            <div class="modal-body" *ngIf="activeQuery">
              <div class="p-3 bg-light rounded border mb-3">
                <div class="row g-2 small mb-2">
                  <div class="col-md-6"><strong>User:</strong> {{ activeQuery.user_name }} ({{ activeQuery.email }})</div>
                  <div class="col-md-6"><strong>Category:</strong> <span class="badge bg-secondary">{{ activeQuery.category }}</span></div>
                  <div class="col-md-12"><strong>Submitted:</strong> {{ activeQuery.created_at | date:'medium' }}</div>
                </div>
                <div class="p-2 bg-white rounded border text-dark">
                  <strong>Query Message:</strong>
                  <p class="mb-0 mt-1 fs-7 text-secondary">{{ activeQuery.message }}</p>
                </div>
              </div>

              <form (ngSubmit)="submitQueryResponse()">
                <div class="mb-3">
                  <label class="form-label fw-medium">Update Status *</label>
                  <select [(ngModel)]="queryResponseStatus" name="qStatus" class="form-select" required>
                    <option value="OPEN">Open / Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Official Admin Response / Resolution Details *</label>
                  <textarea [(ngModel)]="queryResponseText" name="qResponse" class="form-control" rows="4" placeholder="Type resolution or guidance for the user..." required></textarea>
                </div>
                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button (click)="closeQueryModal()" type="button" class="btn btn-light">Cancel</button>
                  <button type="submit" class="btn btn-gov-navy px-4"><i class="fa-solid fa-paper-plane me-1"></i> Save Resolution</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- MODAL: PROVISION NEW USER ACCOUNT -->
      <!-- ============================================================ -->
      <div *ngIf="showUserModal" class="modal d-block" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content p-4 gov-card border-0">
            <div class="modal-header border-0 pb-0">
              <h4 class="fw-bold mb-0" style="color: var(--gov-navy-primary);">Provision Non-Citizen User Account</h4>
              <button (click)="closeUserModal()" type="button" class="btn-close"></button>
            </div>
            <div class="modal-body">
              <form (ngSubmit)="submitNewUser()">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Select Account Role *</label>
                    <select [(ngModel)]="newUser.role" name="uRole" class="form-select" required>
                      <option value="Government Official">Government Official</option>
                      <option value="Organization">Organization / Enterprise</option>
                      <option value="Researcher">Researcher / Scholar</option>
                      <option value="Citizen">Citizen (Admin Created)</option>
                      <option value="Administrator">Administrator (System Admin)</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Full Name / Entity Name *</label>
                    <input type="text" [(ngModel)]="newUser.full_name" name="uName" class="form-control" placeholder="e.g. Dr. Rajesh Verma" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Email Address *</label>
                    <input type="email" [(ngModel)]="newUser.email" name="uEmail" class="form-control" placeholder="name@domain.gov.in" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Initial Password *</label>
                    <input type="password" [(ngModel)]="newUser.password" name="uPassword" class="form-control" placeholder="Temporary password..." required>
                  </div>
                  <div *ngIf="newUser.role === 'Government Official'" class="col-md-6">
                    <label class="form-label fw-medium">Department / Ministry</label>
                    <input type="text" [(ngModel)]="newUser.department" name="uDept" class="form-control" placeholder="e.g. Ministry of Agriculture">
                  </div>
                  <div *ngIf="newUser.role === 'Government Official' || newUser.role === 'Citizen'" class="col-md-6">
                    <label class="form-label fw-medium">State / Region</label>
                    <input type="text" [(ngModel)]="newUser.state" name="uState" class="form-control" placeholder="e.g. New Delhi">
                  </div>
                  <div *ngIf="newUser.role === 'Organization' || newUser.role === 'Researcher'" class="col-md-6">
                    <label class="form-label fw-medium">Organization / Institution</label>
                    <input type="text" [(ngModel)]="newUser.department" name="uInst" class="form-control" placeholder="e.g. Indian Institute of Public Policy">
                  </div>
                  <div *ngIf="newUser.role === 'Researcher' || newUser.role === 'Citizen'" class="col-md-6">
                    <label class="form-label fw-medium">Occupation / Research Area</label>
                    <input type="text" [(ngModel)]="newUser.occupation" name="uOcc" class="form-control" placeholder="e.g. Economic Analytics">
                  </div>
                </div>
                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button (click)="closeUserModal()" type="button" class="btn btn-light">Cancel</button>
                  <button type="submit" class="btn btn-success px-4"><i class="fa-solid fa-user-plus me-1"></i> Provision Account</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- MODAL: EDIT USER / GOVERNMENT OFFICIAL ACCOUNT -->
      <!-- ============================================================ -->
      <div *ngIf="showEditUserModal" class="modal d-block" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content p-4 gov-card border-0">
            <div class="modal-header border-0 pb-0">
              <h4 class="fw-bold mb-0" style="color: var(--gov-navy-primary);"><i class="fa-solid fa-user-pen me-2"></i> Edit Account Details (#{{ editingUser.id }})</h4>
              <button (click)="showEditUserModal = false" type="button" class="btn-close"></button>
            </div>
            <div class="modal-body">
              <div *ngIf="userEditError" class="alert alert-danger mb-3 py-2 px-3 small">{{ userEditError }}</div>
              <form (ngSubmit)="saveEditUser()">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Full Name / Entity Name *</label>
                    <input type="text" [(ngModel)]="editingUser.full_name" name="euName" class="form-control" placeholder="e.g. Dr. Rajesh Verma" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Email Address *</label>
                    <input type="email" [(ngModel)]="editingUser.email" name="euEmail" class="form-control" placeholder="name@domain.gov.in" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Role *</label>
                    <select [(ngModel)]="editingUser.role" name="euRole" class="form-select" [disabled]="editingUser.role === 'Administrator'" required>
                      <option value="Government Official">Government Official</option>
                      <option value="Citizen">Citizen</option>
                      <option value="Researcher">Researcher</option>
                      <option value="Organization">Organization</option>
                      <option value="Administrator">Administrator</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Department / Ministry / Institution</label>
                    <input type="text" [(ngModel)]="editingUser.department" name="euDept" class="form-control" placeholder="e.g. Ministry of Agriculture">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">State / Region</label>
                    <input type="text" [(ngModel)]="editingUser.state" name="euState" class="form-control" placeholder="e.g. New Delhi">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Occupation / Research Domain</label>
                    <input type="text" [(ngModel)]="editingUser.occupation" name="euOcc" class="form-control" placeholder="e.g. Economic Analytics">
                  </div>
                </div>
                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button (click)="showEditUserModal = false" type="button" class="btn btn-light">Cancel</button>
                  <button type="submit" [disabled]="savingEditUser" class="btn btn-gov-navy px-4">
                    <span *ngIf="savingEditUser" class="spinner-border spinner-border-sm me-1"></span>
                    <i *ngIf="!savingEditUser" class="fa-solid fa-floppy-disk me-1"></i> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>


      <!-- ============================================================ -->
      <!-- MODAL: CREATE/EDIT POLICY -->
      <!-- ============================================================ -->
      <div *ngIf="showPolicyModal" class="modal d-block" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content p-4 gov-card border-0">
            <div class="modal-header border-0 pb-0">
              <h4 class="fw-bold mb-0" style="color: var(--gov-navy-primary);">{{ editingPolicy ? 'Edit Policy' : 'Create New Policy' }}</h4>
              <button (click)="closePolicyModal()" type="button" class="btn-close"></button>
            </div>
            <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
              <form (ngSubmit)="submitPolicy()">
                <div class="row g-3">
                  <div class="col-md-8">
                    <label class="form-label fw-medium">Policy Title *</label>
                    <input type="text" [(ngModel)]="policyForm.title" name="pTitle" class="form-control" placeholder="e.g. National Solar Energy Policy 2026" required>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-medium">Policy Code *</label>
                    <input type="text" [(ngModel)]="policyForm.code" name="pCode" class="form-control" [disabled]="!!editingPolicy" placeholder="e.g. POL-SOLAR-2026" required>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-medium">Category *</label>
                    <select [(ngModel)]="policyForm.category" name="pCategory" class="form-select" required>
                      <option *ngFor="let c of categories" [value]="c.name">{{ c.name }}</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-medium">Ministry *</label>
                    <input type="text" [(ngModel)]="policyForm.ministry" name="pMinistry" class="form-control" placeholder="Ministry of Agriculture" required>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-medium">Department *</label>
                    <input type="text" [(ngModel)]="policyForm.department" name="pDept" class="form-control" placeholder="Department of Agriculture" required>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-medium">Sector *</label>
                    <input type="text" [(ngModel)]="policyForm.sector" name="pSector" class="form-control" placeholder="Agriculture" required>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-medium">State / Region</label>
                    <input type="text" [(ngModel)]="policyForm.state" name="pState" class="form-control" placeholder="All India">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-medium">Status</label>
                    <select [(ngModel)]="policyForm.status" name="pStatus" class="form-select">
                      <option value="DRAFT">Draft</option>
                      <option value="SUBMITTED">Submitted</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-medium">Effective Date</label>
                    <input type="date" [(ngModel)]="policyForm.effective_date" name="pDate" class="form-control">
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-medium">Description *</label>
                    <textarea [(ngModel)]="policyForm.description" name="pDesc" class="form-control" rows="3" required></textarea>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-medium">Summary (Optional)</label>
                    <textarea [(ngModel)]="policyForm.summary" name="pSummary" class="form-control" rows="2" placeholder="Brief summary for public display..."></textarea>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-medium">Document URL</label>
                    <input type="url" [(ngModel)]="policyForm.document_url" name="pDocUrl" class="form-control" placeholder="https://...">
                  </div>
                </div>
                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button (click)="closePolicyModal()" type="button" class="btn btn-light">Cancel</button>
                  <button type="submit" class="btn btn-gov-navy px-4">
                    <i class="fa-solid fa-save me-1"></i> {{ editingPolicy ? 'Save Changes' : 'Create Policy' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- MODAL: CREATE/EDIT SCHEME -->
      <!-- ============================================================ -->
      <div *ngIf="showSchemeModal" class="modal d-block" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content p-4 gov-card border-0">
            <div class="modal-header border-0 pb-0">
              <h4 class="fw-bold mb-0" style="color: var(--gov-navy-primary);">{{ editingScheme ? 'Edit Scheme' : 'Create New Scheme' }}</h4>
              <button (click)="closeSchemeModal()" type="button" class="btn-close"></button>
            </div>
            <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
              <form (ngSubmit)="submitScheme()">
                <h6 class="fw-bold text-dark border-bottom pb-2 mb-3">Basic Information</h6>
                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Scheme Name *</label>
                    <input type="text" [(ngModel)]="schemeForm.name" name="sName" class="form-control" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Scheme Code *</label>
                    <input type="text" [(ngModel)]="schemeForm.code" name="sCode" class="form-control" [disabled]="!!editingScheme" required>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-medium">Category *</label>
                    <select [(ngModel)]="schemeForm.category" name="sCategory" class="form-select" required>
                      <option *ngFor="let c of categories" [value]="c.name">{{ c.name }}</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-medium">Status</label>
                    <select [(ngModel)]="schemeForm.status" name="sStatus" class="form-select">
                      <option value="Active">Active</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-medium">Related Policy</label>
                    <select [(ngModel)]="schemeForm.policy_id" name="sPolicyId" class="form-select">
                      <option [ngValue]="null">No Parent Policy</option>
                      <option *ngFor="let p of allPolicies" [ngValue]="p.id">{{ p.code }}: {{ p.title | slice:0:40 }}</option>
                    </select>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-medium">Description *</label>
                    <textarea [(ngModel)]="schemeForm.description" name="sDesc" class="form-control" rows="3" required></textarea>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-medium">Benefits *</label>
                    <textarea [(ngModel)]="schemeForm.benefits" name="sBenefits" class="form-control" rows="2" required></textarea>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Financial Assistance</label>
                    <input type="text" [(ngModel)]="schemeForm.financial_assistance" name="sFinancial" class="form-control" placeholder="e.g. ₹6,000/year">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Target Group</label>
                    <input type="text" [(ngModel)]="schemeForm.target_group" name="sTarget" class="form-control" placeholder="e.g. Small Farmers">
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-medium">Application Process</label>
                    <textarea [(ngModel)]="schemeForm.application_process" name="sProcess" class="form-control" rows="2"></textarea>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Application Link</label>
                    <input type="url" [(ngModel)]="schemeForm.application_link" name="sLink" class="form-control" placeholder="https://...">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Deadline</label>
                    <input type="date" [(ngModel)]="schemeForm.deadline" name="sDeadline" class="form-control">
                  </div>
                </div>
                <h6 class="fw-bold text-dark border-bottom pb-2 mb-3">Eligibility Rules</h6>
                <div class="row g-3">
                  <div class="col-md-3"><label class="form-label fw-medium small">Min Age</label>
                    <input type="number" [(ngModel)]="schemeRuleForm.min_age" name="srMinAge" class="form-control form-control-sm"></div>
                  <div class="col-md-3"><label class="form-label fw-medium small">Max Age</label>
                    <input type="number" [(ngModel)]="schemeRuleForm.max_age" name="srMaxAge" class="form-control form-control-sm"></div>
                  <div class="col-md-3"><label class="form-label fw-medium small">Gender</label>
                    <select [(ngModel)]="schemeRuleForm.gender" name="srGender" class="form-select form-select-sm">
                      <option value="All">All</option><option value="Male">Male</option><option value="Female">Female</option>
                    </select></div>
                  <div class="col-md-3"><label class="form-label fw-medium small">Max Income (₹)</label>
                    <input type="number" [(ngModel)]="schemeRuleForm.max_income" name="srIncome" class="form-control form-control-sm"></div>
                  <div class="col-md-4"><label class="form-label fw-medium small">Occupation</label>
                    <input type="text" [(ngModel)]="schemeRuleForm.occupation" name="srOcc" class="form-control form-control-sm" placeholder="All"></div>
                  <div class="col-md-4"><label class="form-label fw-medium small">Social Category</label>
                    <input type="text" [(ngModel)]="schemeRuleForm.social_category" name="srSocial" class="form-control form-control-sm" placeholder="All"></div>
                  <div class="col-md-4"><label class="form-label fw-medium small">Education Level</label>
                    <input type="text" [(ngModel)]="schemeRuleForm.education_level" name="srEdu" class="form-control form-control-sm" placeholder="All"></div>
                </div>
                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button (click)="closeSchemeModal()" type="button" class="btn btn-light">Cancel</button>
                  <button type="submit" class="btn btn-gov-saffron px-4">
                    <i class="fa-solid fa-save me-1"></i> {{ editingScheme ? 'Save Changes' : 'Create Scheme' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- MODAL: CREATE NEW CATEGORY -->
      <!-- ============================================================ -->
      <div *ngIf="showCategoryModal" class="modal d-block" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content p-4 gov-card border-0">
            <div class="modal-header border-0 pb-0">
              <h4 class="fw-bold mb-0" style="color: var(--gov-navy-primary);">Add Dynamic Category</h4>
              <button (click)="closeCategoryModal()" type="button" class="btn-close"></button>
            </div>
            <div class="modal-body">
              <form (ngSubmit)="submitCategory()">
                <div class="mb-3">
                  <label class="form-label fw-medium">Category Name *</label>
                  <input type="text" [(ngModel)]="newCategoryName" name="catName" class="form-control" placeholder="e.g. Artificial Intelligence & Robotics" required>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Description</label>
                  <textarea [(ngModel)]="newCategoryDesc" name="catDesc" class="form-control" rows="2" placeholder="Brief category scope..."></textarea>
                </div>
                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button (click)="closeCategoryModal()" type="button" class="btn btn-light">Cancel</button>
                  <button type="submit" class="btn btn-gov-navy px-4">Create Category</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  public stats: any = null;
  public pendingPolicies: Policy[] = [];
  public allPolicies: Policy[] = [];
  public filteredPolicies: Policy[] = [];
  public allSchemes: Scheme[] = [];
  public filteredSchemes: Scheme[] = [];
  public users: User[] = [];
  public categories: any[] = [];
  public queries: FeedbackItem[] = [];
  public departmentAnalytics: any[] = [];
  public usageStats: any = null;

  // Loading states
  public loadingStats = true;
  public loadingPending = true;
  public loadingPolicies = true;
  public loadingSchemes = true;
  public loadingUsers = true;
  public loadingQueries = true;
  public loadingDepts = true;
  public loadingUsage = true;

  // Modal visibility
  public showCategoryModal = false;
  public showUserModal = false;
  public showEditUserModal = false;
  public showPolicyModal = false;
  public showSchemeModal = false;
  public showQueryModal = false;

  // Edit state
  public editingPolicy: Policy | null = null;
  public editingScheme: Scheme | null = null;
  public editingUser: any = { id: 0 };
  public savingEditUser = false;
  public userEditError: string | null = null;
  public successMessage: string | null = null;
  public activeQuery: FeedbackItem | null = null;

  // Filters
  public policySearch = '';
  public policyStatusFilter = '';
  public policyCategoryFilter = '';
  public schemeSearch = '';
  public schemeCategoryFilter = '';
  public schemeStatusFilter = '';
  public userSearch = '';
  public roleFilter = '';
  public statusFilter = '';
  public querySearch = '';
  public queryStatusFilter = '';
  public queryCategoryFilter = '';

  public queryResponseText = '';
  public queryResponseStatus = 'RESOLVED';

  private userSearchTimer: any;
  private querySearchTimer: any;

  // Forms
  public newCategoryName = '';
  public newCategoryDesc = '';

  public newUser = {
    full_name: '', email: '', password: '', role: 'Government Official',
    department: '', state: '', occupation: ''
  };

  public policyForm: any = {
    title: '', code: '', category: '', ministry: '', department: '',
    sector: '', state: 'All India', status: 'PUBLISHED', description: '',
    summary: '', document_url: '', effective_date: null
  };

  public schemeForm: any = {
    name: '', code: '', category: '', description: '', benefits: '',
    financial_assistance: '', target_group: '', application_process: '',
    application_link: '', deadline: null, status: 'Active', policy_id: null
  };

  public schemeRuleForm = {
    min_age: 0, max_age: 120, gender: 'All', max_income: 99999999,
    occupation: 'All', social_category: 'All', education_level: 'All',
    location_type: 'All', disability_required: false
  };

  public apiService = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.fetchStats();
    this.fetchPendingPolicies();
    this.fetchAllPolicies();
    this.fetchAllSchemes();
    this.fetchUsers();
    this.fetchCategories();
    this.fetchQueries();
    this.fetchDepartmentAnalytics();
    this.fetchUsageStats();
  }

  fetchDepartmentAnalytics() {
    this.loadingDepts = true;
    this.apiService.getDepartmentAnalytics().subscribe({
      next: (data) => { this.departmentAnalytics = data || []; this.loadingDepts = false; this.cdr.detectChanges(); },
      error: () => { this.loadingDepts = false; this.cdr.detectChanges(); }
    });
  }

  fetchUsageStats() {
    this.loadingUsage = true;
    this.apiService.getUsageStatistics().subscribe({
      next: (data) => { this.usageStats = data; this.loadingUsage = false; this.cdr.detectChanges(); },
      error: () => { this.loadingUsage = false; this.cdr.detectChanges(); }
    });
  }

  fetchStats() {

    this.loadingStats = true;
    this.apiService.getAnalyticsSummary().subscribe({
      next: (data) => { this.stats = data; this.loadingStats = false; this.cdr.detectChanges(); },
      error: () => { this.loadingStats = false; this.cdr.detectChanges(); }
    });
  }

  fetchPendingPolicies() {
    this.loadingPending = true;
    this.apiService.getPolicies({ status: 'SUBMITTED' }).subscribe({
      next: (data) => {
        const submitted = (data || []).filter(p => p.status === 'SUBMITTED' || p.status === 'Pending Approval');
        if (submitted.length === 0) {
          this.apiService.getPolicies().subscribe({
            next: (all) => {
              this.pendingPolicies = (all || []).filter(p => p.status === 'SUBMITTED' || p.status === 'Pending Approval');
              this.loadingPending = false;
              this.cdr.detectChanges();
            },
            error: () => { this.loadingPending = false; this.cdr.detectChanges(); }
          });
        } else {
          this.pendingPolicies = submitted;
          this.loadingPending = false;
          this.cdr.detectChanges();
        }
      },
      error: () => { this.loadingPending = false; this.cdr.detectChanges(); }
    });
  }

  fetchAllPolicies() {
    this.loadingPolicies = true;
    this.apiService.getPolicies().subscribe({
      next: (data) => {
        this.allPolicies = data || [];
        this.applyPolicyFilters();
        this.loadingPolicies = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingPolicies = false; this.cdr.detectChanges(); }
    });
  }

  fetchAllSchemes() {
    this.loadingSchemes = true;
    this.apiService.getSchemes().subscribe({
      next: (data) => {
        this.allSchemes = data || [];
        this.applySchemeFilters();
        this.loadingSchemes = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingSchemes = false; this.cdr.detectChanges(); }
    });
  }

  fetchUsers() {
    this.loadingUsers = true;
    const isActive = this.statusFilter === '' ? undefined : this.statusFilter === 'true';
    this.apiService.getUsers(this.roleFilter || undefined, this.userSearch || undefined, isActive).subscribe({
      next: (data) => { this.users = data || []; this.loadingUsers = false; this.cdr.detectChanges(); },
      error: () => { this.loadingUsers = false; this.cdr.detectChanges(); }
    });
  }

  fetchCategories() {
    this.apiService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats || [];
        if (this.categories.length > 0 && !this.policyForm.category) {
          this.policyForm.category = this.categories[0].name;
          this.schemeForm.category = this.categories[0].name;
        }
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });
  }

  // Policy Filters
  applyPolicyFilters() {
    this.filteredPolicies = this.allPolicies.filter(p => {
      const matchSearch = !this.policySearch ||
        p.title.toLowerCase().includes(this.policySearch.toLowerCase()) ||
        p.code.toLowerCase().includes(this.policySearch.toLowerCase()) ||
        p.ministry.toLowerCase().includes(this.policySearch.toLowerCase());
      const matchStatus = !this.policyStatusFilter || p.status === this.policyStatusFilter;
      const matchCat = !this.policyCategoryFilter || p.category === this.policyCategoryFilter;
      return matchSearch && matchStatus && matchCat;
    });
  }

  resetPolicyFilters() {
    this.policySearch = '';
    this.policyStatusFilter = '';
    this.policyCategoryFilter = '';
    this.applyPolicyFilters();
  }

  // Scheme Filters
  applySchemeFilters() {
    this.filteredSchemes = this.allSchemes.filter(s => {
      const matchSearch = !this.schemeSearch ||
        s.name.toLowerCase().includes(this.schemeSearch.toLowerCase()) ||
        s.code.toLowerCase().includes(this.schemeSearch.toLowerCase());
      const matchCat = !this.schemeCategoryFilter || s.category === this.schemeCategoryFilter;
      const matchStatus = !this.schemeStatusFilter || s.status === this.schemeStatusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }

  resetSchemeFilters() {
    this.schemeSearch = '';
    this.schemeCategoryFilter = '';
    this.schemeStatusFilter = '';
    this.applySchemeFilters();
  }

  // User Search with debounce
  onUserSearchChange() {
    clearTimeout(this.userSearchTimer);
    this.userSearchTimer = setTimeout(() => this.fetchUsers(), 400);
  }

  resetUserFilters() {
    this.userSearch = '';
    this.roleFilter = '';
    this.statusFilter = '';
    this.fetchUsers();
  }

  // Policy CRUD
  openCreatePolicyModal() {
    this.closeAllModals();
    this.editingPolicy = null;
    this.policyForm = {
      title: '', code: '', category: this.categories[0]?.name || '',
      ministry: '', department: '', sector: '', state: 'All India',
      status: 'PUBLISHED', description: '', summary: '', document_url: '', effective_date: null
    };
    this.showPolicyModal = true;
    this.cdr.detectChanges();
  }

  openEditPolicyModal(pol: Policy) {
    this.closeAllModals();
    this.editingPolicy = pol;
    this.policyForm = {
      title: pol.title, code: pol.code, category: pol.category,
      ministry: pol.ministry, department: pol.department, sector: pol.sector,
      state: pol.state, status: pol.status, description: pol.description,
      summary: (pol as any).summary || '', document_url: (pol as any).document_url || '',
      effective_date: null
    };
    this.showPolicyModal = true;
    this.cdr.detectChanges();
  }

  closePolicyModal() {
    this.showPolicyModal = false;
    this.editingPolicy = null;
    this.cdr.detectChanges();
  }

  submitPolicy() {
    if (!this.policyForm.title || !this.policyForm.description) {
      alert('Please fill in all required fields.'); return;
    }
    if (this.editingPolicy) {
      this.apiService.updatePolicy(this.editingPolicy.id, this.policyForm).subscribe({
        next: () => {
          alert('Policy updated successfully!');
          this.closePolicyModal();
          this.fetchAllPolicies();
          this.fetchStats();
        },
        error: (err) => alert(err?.error?.detail || 'Update failed.')
      });
    } else {
      this.apiService.createPolicy(this.policyForm).subscribe({
        next: () => {
          alert('Policy created successfully!');
          this.closePolicyModal();
          this.fetchAllPolicies();
          this.fetchPendingPolicies();
          this.fetchStats();
        },
        error: (err) => alert(err?.error?.detail || 'Creation failed.')
      });
    }
  }

  approvePolicy(id: number) {
    this.apiService.approvePolicy(id).subscribe({
      next: () => { alert('Policy approved and published!'); this.loadData(); }
    });
  }

  rejectPolicyPrompt(id: number) {
    const reason = prompt('Enter rejection reason for official feedback:');
    if (reason) {
      this.apiService.updatePolicyStatus(id, 'REJECTED', reason).subscribe({
        next: () => { alert('Policy rejected.'); this.loadData(); }
      });
    }
  }

  archivePolicyAction(id: number) {
    if (confirm('Archive this policy?')) {
      this.apiService.archivePolicy(id).subscribe({
        next: () => { this.fetchAllPolicies(); this.fetchStats(); this.fetchPendingPolicies(); }
      });
    }
  }

  deletePolicyAction(id: number, title: string) {
    if (confirm(`DELETE policy "${title}"?\n\nThis will permanently remove it from the database. This action cannot be undone.`)) {
      this.apiService.deletePolicy(id).subscribe({
        next: () => { alert('Policy deleted.'); this.fetchAllPolicies(); this.fetchPendingPolicies(); this.fetchStats(); },
        error: (err) => alert(err?.error?.detail || 'Delete failed.')
      });
    }
  }

  // Scheme CRUD
  openCreateSchemeModal() {
    this.closeAllModals();
    this.editingScheme = null;
    this.schemeForm = {
      name: '', code: '', category: this.categories[0]?.name || '',
      description: '', benefits: '', financial_assistance: '', target_group: '',
      application_process: '', application_link: '', deadline: null, status: 'Active', policy_id: null
    };
    this.schemeRuleForm = {
      min_age: 0, max_age: 120, gender: 'All', max_income: 99999999,
      occupation: 'All', social_category: 'All', education_level: 'All',
      location_type: 'All', disability_required: false
    };
    this.showSchemeModal = true;
    this.cdr.detectChanges();
  }

  openEditSchemeModal(s: Scheme) {
    this.closeAllModals();
    this.editingScheme = s;
    this.schemeForm = {
      name: s.name, code: s.code, category: s.category,
      description: s.description, benefits: s.benefits,
      financial_assistance: s.financial_assistance || '',
      target_group: s.target_group || '', application_process: s.application_process || '',
      application_link: s.application_link || '', deadline: null, status: s.status, policy_id: s.policy_id || null
    };
    if (s.eligibility_rules) {
      const r = s.eligibility_rules;
      this.schemeRuleForm = {
        min_age: r.min_age, max_age: r.max_age, gender: r.gender,
        max_income: r.max_income, occupation: r.occupation,
        social_category: r.social_category, education_level: r.education_level,
        location_type: r.location_type || 'All', disability_required: r.disability_required
      };
    }
    this.showSchemeModal = true;
    this.cdr.detectChanges();
  }

  closeSchemeModal() {
    this.showSchemeModal = false;
    this.editingScheme = null;
    this.cdr.detectChanges();
  }


  submitScheme() {
    if (!this.schemeForm.name || !this.schemeForm.description || !this.schemeForm.benefits) {
      alert('Please fill in all required fields.'); return;
    }
    const payload = { ...this.schemeForm, eligibility_rule: this.schemeRuleForm };
    if (this.editingScheme) {
      this.apiService.updateScheme(this.editingScheme.id, payload).subscribe({
        next: () => {
          alert('Scheme updated successfully!');
          this.closeSchemeModal();
          this.fetchAllSchemes();
          this.fetchStats();
        },
        error: (err) => alert(err?.error?.detail || 'Update failed.')
      });
    } else {
      this.apiService.createScheme(payload).subscribe({
        next: () => {
          alert('Scheme created successfully!');
          this.closeSchemeModal();
          this.fetchAllSchemes();
          this.fetchStats();
        },
        error: (err) => alert(err?.error?.detail || 'Creation failed.')
      });
    }
  }

  archiveSchemeAction(id: number) {
    if (confirm('Archive this scheme?')) {
      this.apiService.archiveScheme(id).subscribe({
        next: () => { this.fetchAllSchemes(); this.fetchStats(); }
      });
    }
  }

  deleteSchemeAction(id: number, name: string) {
    if (confirm(`DELETE scheme "${name}"?\n\nThis will permanently remove it from the database including eligibility rules.`)) {
      this.apiService.deleteScheme(id).subscribe({
        next: () => { alert('Scheme deleted.'); this.fetchAllSchemes(); this.fetchStats(); },
        error: (err) => alert(err?.error?.detail || 'Delete failed.')
      });
    }
  }

  // User Management
  submitNewUser() {
    if (!this.newUser.full_name || !this.newUser.email || !this.newUser.password) {
      alert('Please fill in required fields: Name, Email, and Password.'); return;
    }
    this.apiService.createUser(this.newUser).subscribe({
      next: (u) => {
        alert(`Account created for '${u.full_name}' as '${u.role}'!`);
        this.showUserModal = false;
        this.newUser = { full_name: '', email: '', password: '', role: 'Government Official', department: '', state: '', occupation: '' };
        this.fetchUsers();
        this.fetchStats();
      },
      error: (err) => alert(err?.error?.detail || 'User provisioning failed.')
    });
  }

  openEditUserModal(u: User) {
    this.closeAllModals();
    this.userEditError = null;
    this.editingUser = {
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      role: u.role,
      department: u.department || '',
      state: u.state || '',
      occupation: u.occupation || '',
      is_active: u.is_active
    };
    this.showEditUserModal = true;
    this.cdr.detectChanges();
  }

  saveEditUser() {
    if (!this.editingUser.full_name || !this.editingUser.email) {
      this.userEditError = 'Full Name and Email Address are required.';
      return;
    }
    this.savingEditUser = true;
    this.userEditError = null;
    this.apiService.updateUser(this.editingUser.id, this.editingUser).subscribe({
      next: (updatedUser) => {
        this.savingEditUser = false;
        this.showEditUserModal = false;
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        this.fetchUsers();
        this.fetchStats();
        this.successMessage = `User account for '${updatedUser.full_name}' updated successfully!`;
        setTimeout(() => this.successMessage = null, 4000);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.savingEditUser = false;
        this.userEditError = err?.error?.detail || 'Failed to update user account.';
        this.cdr.detectChanges();
      }
    });
  }



  changeRole(userId: number, event: Event) {
    const newRole = (event.target as HTMLSelectElement).value;
    if (newRole) {
      this.apiService.updateUserRole(userId, newRole).subscribe({
        next: () => { alert('User role updated!'); this.fetchUsers(); this.fetchStats(); },
        error: (err) => alert(err?.error?.detail || 'Failed to update role.')
      });
    }
  }

  toggleUserStatus(u: User) {
    this.apiService.updateUserStatus(u.id, !u.is_active).subscribe({
      next: () => this.fetchUsers()
    });
  }

  deleteUser(id: number) {
    if (confirm('Delete this user account? This cannot be undone.')) {
      this.apiService.deleteUser(id).subscribe({
        next: () => this.fetchUsers()
      });
    }
  }

  closeAllModals() {
    this.showUserModal = false;
    this.showEditUserModal = false;
    this.showPolicyModal = false;
    this.showSchemeModal = false;
    this.showCategoryModal = false;
    this.showQueryModal = false;
  }

  openUserModal() {
    this.closeAllModals();
    this.showUserModal = true;
    this.cdr.detectChanges();
  }

  closeUserModal() {
    this.showUserModal = false;
    this.cdr.detectChanges();
  }

  openCategoryModal() {
    this.closeAllModals();
    this.showCategoryModal = true;
    this.cdr.detectChanges();
  }

  closeCategoryModal() {
    this.showCategoryModal = false;
    this.cdr.detectChanges();
  }

  // Category Management
  submitCategory() {
    if (!this.newCategoryName.trim()) { alert('Please enter a category name.'); return; }
    this.apiService.createCategory(this.newCategoryName.trim(), this.newCategoryDesc).subscribe({
      next: (cat) => {
        alert(`Category '${cat.name}' created!`);
        this.showCategoryModal = false;
        this.newCategoryName = '';
        this.newCategoryDesc = '';
        this.fetchCategories();
        this.fetchStats();
      },
      error: (err) => alert(err?.error?.detail || 'Category creation failed.')
    });
  }

  deactivateCategory(id: number) {
    if (confirm('Deactivate this category?')) {
      this.apiService.deleteCategory(id).subscribe({
        next: () => this.fetchCategories(),
        error: (err) => alert(err?.error?.detail || 'Deactivation failed.')
      });
    }
  }

  // Support Queries / Tickets Management
  fetchQueries() {
    this.loadingQueries = true;
    this.apiService.getFeedbackList(this.querySearch || undefined, this.queryStatusFilter || undefined, this.queryCategoryFilter || undefined).subscribe({
      next: (data) => { this.queries = data || []; this.loadingQueries = false; this.cdr.detectChanges(); },
      error: () => { this.loadingQueries = false; this.cdr.detectChanges(); }
    });
  }

  onQuerySearchChange() {
    clearTimeout(this.querySearchTimer);
    this.querySearchTimer = setTimeout(() => this.fetchQueries(), 400);
  }

  resetQueryFilters() {
    this.querySearch = '';
    this.queryStatusFilter = '';
    this.queryCategoryFilter = '';
    this.fetchQueries();
  }

  openQueryModal(q: FeedbackItem) {
    this.closeAllModals();
    this.activeQuery = q;
    this.queryResponseText = q.admin_response || '';
    this.queryResponseStatus = q.status || 'RESOLVED';
    this.showQueryModal = true;
    this.cdr.detectChanges();
  }

  closeQueryModal() {
    this.showQueryModal = false;
    this.activeQuery = null;
    this.cdr.detectChanges();
  }

  submitQueryResponse() {
    if (!this.activeQuery) return;
    this.apiService.respondFeedback(this.activeQuery.id, this.queryResponseText, this.queryResponseStatus).subscribe({
      next: () => {
        alert('Support ticket response saved successfully!');
        this.closeQueryModal();
        this.fetchQueries();
        this.fetchStats();
      },
      error: (err) => alert(err?.error?.detail || 'Failed to update ticket.')
    });
  }

  updateQueryStatus(id: number, event: Event) {
    const newStatus = (event.target as HTMLSelectElement).value;
    if (newStatus) {
      this.apiService.updateFeedbackStatus(id, newStatus).subscribe({
        next: () => { this.fetchQueries(); this.fetchStats(); },
        error: (err) => alert(err?.error?.detail || 'Failed to update status.')
      });
    }
  }

  deleteQueryAction(id: number) {
    if (confirm(`Delete support ticket #${id}? This action cannot be undone.`)) {
      this.apiService.deleteFeedback(id).subscribe({
        next: () => { alert('Support ticket deleted.'); this.fetchQueries(); this.fetchStats(); },
        error: (err) => alert(err?.error?.detail || 'Failed to delete support ticket.')
      });
    }
  }
}
