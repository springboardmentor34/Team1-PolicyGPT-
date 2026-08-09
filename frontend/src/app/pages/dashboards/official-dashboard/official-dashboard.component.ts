import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Policy, Scheme } from '../../../core/models/models';

@Component({
  selector: 'app-official-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header Banner -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <span class="badge bg-info text-dark px-3 py-1.5 rounded-pill mb-2"><i class="fa-solid fa-user-tie me-1"></i> GOVERNMENT OFFICIAL WORKSPACE</span>
          <h2 class="fw-bold mb-0" style="color: var(--gov-navy-primary);">Department Publishing & Management Portal</h2>
        </div>
        <div class="btn-group btn-group-sm shadow-sm" role="group">
          <button (click)="openCreatePolicyModal()" class="btn btn-gov-navy"><i class="fa-solid fa-file-circle-plus me-1"></i> Upload Policy</button>
          <button (click)="openCreateSchemeModal()" class="btn btn-gov-saffron"><i class="fa-solid fa-hand-holding-medical me-1"></i> Upload Scheme</button>
          <button (click)="openCategoryModal()" class="btn btn-gov-outline"><i class="fa-solid fa-folder-plus me-1"></i> Category</button>
        </div>
      </div>

      <!-- Backend Error Banner -->
      <div *ngIf="loadError" class="alert alert-danger d-flex align-items-center justify-content-between mb-4 p-3 border-0 rounded-3">
        <div class="d-flex align-items-center gap-2">
          <i class="fa-solid fa-plug-circle-exclamation fs-5"></i>
          <div>
            <strong>Unable to connect to backend server.</strong>
            <span class="ms-1 text-muted small">Ensure the FastAPI server is running on port 8000.</span>
          </div>
        </div>
        <button (click)="loadData()" class="btn btn-danger btn-sm px-3">
          <i class="fa-solid fa-rotate-right me-1"></i> Retry
        </button>
      </div>

      <!-- Department Summary Cards -->
      <div class="row g-4 mb-4">
        <div class="col-sm-6 col-xl-3">
          <div class="stat-card">
            <span class="text-muted small fw-semibold text-uppercase">My Policies</span>
            <div class="stat-number">
              <span *ngIf="loadingData" class="spinner-border spinner-border-sm text-secondary"></span>
              <span *ngIf="!loadingData">{{ allPolicies.length }}</span>
            </div>
            <span class="fs-7 text-muted">{{ loadingData ? 'Loading...' : (publishedPolicyCount + ' Published') }}</span>
          </div>
        </div>
        <div class="col-sm-6 col-xl-3">
          <div class="stat-card green">
            <span class="text-muted small fw-semibold text-uppercase">My Public Schemes</span>
            <div class="stat-number text-success">
              <span *ngIf="loadingData" class="spinner-border spinner-border-sm text-success"></span>
              <span *ngIf="!loadingData">{{ allSchemes.length }}</span>
            </div>
            <span class="fs-7 text-muted">{{ loadingData ? 'Loading...' : 'Active Welfare Grants' }}</span>
          </div>
        </div>
        <div class="col-sm-6 col-xl-3">
          <div class="stat-card saffron">
            <span class="text-muted small fw-semibold text-uppercase">Awaiting Admin Verification</span>
            <div class="stat-number text-warning">
              <span *ngIf="loadingData" class="spinner-border spinner-border-sm text-warning"></span>
              <span *ngIf="!loadingData">{{ pendingPolicyCount }}</span>
            </div>
            <span class="fs-7 text-muted">Approval Pipeline</span>
          </div>
        </div>
        <div class="col-sm-6 col-xl-3">
          <div class="stat-card">
            <span class="text-muted small fw-semibold text-uppercase">Active Categories</span>
            <div class="stat-number">
              <span *ngIf="loadingData" class="spinner-border spinner-border-sm text-secondary"></span>
              <span *ngIf="!loadingData">{{ categories.length }}</span>
            </div>
            <span class="fs-7 text-muted">Synchronized in DB</span>
          </div>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- DEPARTMENT POLICY REPOSITORY -->
      <!-- ============================================================ -->
      <div class="gov-card p-4 mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
          <h4 class="fw-bold mb-0" style="color: var(--gov-navy-primary);"><i class="fa-solid fa-file-contract me-2"></i> Department Policy Repository</h4>
          <button (click)="openCreatePolicyModal()" class="btn btn-gov-navy btn-sm"><i class="fa-solid fa-plus me-1"></i> Add Policy Directive</button>
        </div>

        <!-- Policy Search & Filters -->
        <div class="row g-2 mb-3">
          <div class="col-md-5">
            <input type="text" [(ngModel)]="policySearch" (input)="applyPolicyFilters()"
              class="form-control form-control-sm" placeholder="Search by title, code, or ministry...">
          </div>
          <div class="col-md-3">
            <select [(ngModel)]="policyStatusFilter" (change)="applyPolicyFilters()" class="form-select form-select-sm">
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted (Pending)</option>
              <option value="PUBLISHED">Published</option>
              <option value="REJECTED">Rejected</option>
              <option value="ARCHIVED">Archived</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
          <div class="col-md-2">
            <button (click)="resetPolicyFilters()" class="btn btn-light btn-sm border w-100"><i class="fa-solid fa-rotate-left me-1"></i> Reset</button>
          </div>
          <div class="col-md-2 text-end">
            <span class="text-muted small">{{ filteredPolicies.length }} / {{ allPolicies.length }}</span>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 small">
            <thead class="table-light">
              <tr>
                <th>Code</th><th>Title</th><th>Category</th><th>Ministry</th><th>Status</th><th>Views</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="loadingPolicies">
                <td colspan="7" class="text-center py-4">
                  <div class="spinner-border spinner-border-sm text-secondary me-2"></div>
                  <span class="text-muted">Loading policies from database...</span>
                </td>
              </tr>
              <tr *ngIf="!loadingPolicies && filteredPolicies.length === 0">
                <td colspan="7" class="text-center py-4 text-muted"><i class="fa-solid fa-inbox me-1"></i> No policies found. Click "+ Add Policy Directive" to create one.</td>
              </tr>
              <tr *ngFor="let p of filteredPolicies">
                <td><span class="badge bg-secondary">{{ p.code }}</span></td>
                <td class="fw-semibold" style="max-width:200px;" title="{{ p.title }}">{{ p.title | slice:0:50 }}{{ p.title.length > 50 ? '...' : '' }}</td>
                <td><span class="badge bg-light text-dark border">{{ p.category }}</span></td>
                <td style="max-width:130px;">{{ p.ministry | slice:0:30 }}{{ p.ministry.length > 30 ? '...' : '' }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'bg-success': p.status === 'PUBLISHED' || p.status === 'Published',
                    'bg-warning text-dark': p.status === 'SUBMITTED' || p.status === 'Pending Approval',
                    'bg-secondary': p.status === 'ARCHIVED' || p.status === 'REJECTED',
                    'bg-light text-dark border': p.status === 'DRAFT'
                  }">{{ p.status }}</span>
                </td>
                <td>{{ p.view_count }}</td>
                <td>
                  <div class="d-flex gap-1">
                    <button type="button" (click)="openEditPolicyModal(p)" class="btn btn-outline-primary btn-sm px-2" title="Edit Policy">
                      <i class="fa-solid fa-pen"></i>
                    </button>
                    <button *ngIf="p.status !== 'ARCHIVED'" type="button" (click)="archivePolicy(p.id)" class="btn btn-gov-outline btn-sm px-2" title="Archive Policy">
                      <i class="fa-solid fa-box-archive"></i>
                    </button>
                    <button type="button" (click)="deletePolicyAction(p.id, p.title)" class="btn btn-danger btn-sm px-2" title="Delete Policy">
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
      <!-- DEPARTMENT SCHEMES REPOSITORY -->
      <!-- ============================================================ -->
      <div class="gov-card p-4 mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
          <h4 class="fw-bold mb-0" style="color: var(--gov-navy-primary);"><i class="fa-solid fa-hand-holding-hand me-2"></i> Department Schemes Repository</h4>
          <button (click)="openCreateSchemeModal()" class="btn btn-gov-saffron btn-sm"><i class="fa-solid fa-plus me-1"></i> Register Scheme</button>
        </div>

        <!-- Scheme Search & Filters -->
        <div class="row g-2 mb-3">
          <div class="col-md-5">
            <input type="text" [(ngModel)]="schemeSearch" (input)="applySchemeFilters()"
              class="form-control form-control-sm" placeholder="Search by scheme name or code...">
          </div>
          <div class="col-md-3">
            <select [(ngModel)]="schemeCategoryFilter" (change)="applySchemeFilters()" class="form-select form-select-sm">
              <option value="">All Categories</option>
              <option *ngFor="let cat of categories" [value]="cat.name">{{ cat.name }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <button (click)="resetSchemeFilters()" class="btn btn-light btn-sm border w-100"><i class="fa-solid fa-rotate-left me-1"></i> Reset</button>
          </div>
          <div class="col-md-2 text-end">
            <span class="text-muted small">{{ filteredSchemes.length }} / {{ allSchemes.length }}</span>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 small">
            <thead class="table-light">
              <tr>
                <th>Code</th><th>Scheme Name</th><th>Category</th><th>Financial Assistance</th><th>Target Group</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="loadingSchemes">
                <td colspan="7" class="text-center py-4">
                  <div class="spinner-border spinner-border-sm text-warning me-2"></div>
                  <span class="text-muted">Loading schemes from database...</span>
                </td>
              </tr>
              <tr *ngIf="!loadingSchemes && filteredSchemes.length === 0">
                <td colspan="7" class="text-center py-4 text-muted"><i class="fa-solid fa-inbox me-1"></i> No schemes found. Click "+ Register Scheme" to create one.</td>
              </tr>
              <tr *ngFor="let s of filteredSchemes">
                <td><span class="badge bg-secondary">{{ s.code }}</span></td>
                <td class="fw-semibold">{{ s.name }}</td>
                <td><span class="badge bg-navy text-white" style="background-color: var(--gov-navy-primary);">{{ s.category }}</span></td>
                <td class="fw-bold text-success">{{ s.financial_assistance || s.benefits | slice:0:40 }}</td>
                <td>{{ s.target_group || 'All Eligible Citizens' | slice:0:30 }}</td>
                <td><span class="badge bg-success">{{ s.status }}</span></td>
                <td>
                  <div class="d-flex gap-1">
                    <button type="button" (click)="openEditSchemeModal(s)" class="btn btn-outline-primary btn-sm px-2" title="Edit Scheme">
                      <i class="fa-solid fa-pen"></i>
                    </button>
                    <button *ngIf="s.status !== 'ARCHIVED'" type="button" (click)="archiveScheme(s.id)" class="btn btn-gov-outline btn-sm px-2" title="Archive Scheme">
                      <i class="fa-solid fa-box-archive"></i>
                    </button>
                    <button type="button" (click)="deleteSchemeAction(s.id, s.name)" class="btn btn-danger btn-sm px-2" title="Delete Scheme">
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
      <!-- MODAL: CREATE NEW CATEGORY -->
      <!-- ============================================================ -->
      <div *ngIf="showCategoryModal" class="modal d-block" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content p-4 gov-card border-0">
            <div class="modal-header border-0 pb-0">
              <h4 class="fw-bold mb-0" style="color: var(--gov-navy-primary);">Add Dynamic Category</h4>
              <button (click)="showCategoryModal = false" type="button" class="btn-close"></button>
            </div>
            <div class="modal-body">
              <form (ngSubmit)="submitCategory()">
                <div class="mb-3">
                  <label class="form-label fw-medium">Category Name *</label>
                  <input type="text" [(ngModel)]="newCategoryName" name="catName" class="form-control" placeholder="e.g. Digital Infrastructure" required>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Description</label>
                  <textarea [(ngModel)]="newCategoryDesc" name="catDesc" class="form-control" rows="2" placeholder="Brief description..."></textarea>
                </div>
                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button (click)="showCategoryModal = false" type="button" class="btn btn-light">Cancel</button>
                  <button type="submit" class="btn btn-gov-navy px-4">Create Category</button>
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
              <h4 class="fw-bold mb-0" style="color: var(--gov-navy-primary);">{{ editingPolicy ? 'Edit Policy Directive' : 'Upload Government Policy Directive' }}</h4>
              <button (click)="closePolicyModal()" type="button" class="btn-close"></button>
            </div>
            <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
              <form (ngSubmit)="submitPolicy()">
                <div class="row g-3">
                  <div class="col-md-8">
                    <label class="form-label fw-medium">Policy Title *</label>
                    <input type="text" [(ngModel)]="policyForm.title" name="title" class="form-control" placeholder="e.g. National Solar Energy Policy 2026" required>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-medium">Policy Code *</label>
                    <input type="text" [(ngModel)]="policyForm.code" name="code" class="form-control" [disabled]="!!editingPolicy" placeholder="e.g. POL-SOLAR-2026-01" required>
                  </div>
                  <div class="col-md-6">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <label class="form-label fw-medium mb-0">Category *</label>
                      <button type="button" (click)="openCategoryModal()" class="btn btn-link btn-sm p-0 text-decoration-none">+ Add Category</button>
                    </div>
                    <select [(ngModel)]="policyForm.category" name="category" class="form-select" required>
                      <option *ngFor="let c of categories" [value]="c.name">{{ c.name }}</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Ministry *</label>
                    <input type="text" [(ngModel)]="policyForm.ministry" name="ministry" class="form-control" placeholder="Ministry of New & Renewable Energy" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Department *</label>
                    <input type="text" [(ngModel)]="policyForm.department" name="department" class="form-control" placeholder="Department of Energy" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Sector *</label>
                    <input type="text" [(ngModel)]="policyForm.sector" name="sector" class="form-control" placeholder="Renewable Energy" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">State / Region</label>
                    <input type="text" [(ngModel)]="policyForm.state" name="state" class="form-control" placeholder="All India">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Effective Date</label>
                    <input type="date" [(ngModel)]="policyForm.effective_date" name="effective_date" class="form-control">
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-medium">Detailed Description *</label>
                    <textarea [(ngModel)]="policyForm.description" name="description" class="form-control" rows="3" required></textarea>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-medium">Summary (Optional)</label>
                    <textarea [(ngModel)]="policyForm.summary" name="summary" class="form-control" rows="2" placeholder="Brief summary for public..."></textarea>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-medium">Document URL</label>
                    <input type="url" [(ngModel)]="policyForm.document_url" name="document_url" class="form-control" placeholder="https://...">
                  </div>
                </div>
                <div *ngIf="!editingPolicy" class="alert alert-info small mt-3 mb-0">
                  <i class="fa-solid fa-circle-info me-1"></i>
                  Policy will be submitted with <strong>SUBMITTED</strong> status for Administrator approval.
                </div>
                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button (click)="closePolicyModal()" type="button" class="btn btn-light">Cancel</button>
                  <button type="submit" class="btn btn-gov-navy px-4">
                    <i class="fa-solid fa-save me-1"></i> {{ editingPolicy ? 'Save Changes' : 'Submit Policy' }}
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
              <h4 class="fw-bold mb-0" style="color: var(--gov-navy-primary);">{{ editingScheme ? 'Edit Public Welfare Scheme' : 'Register Public Welfare Scheme' }}</h4>
              <button (click)="closeSchemeModal()" type="button" class="btn-close"></button>
            </div>
            <div class="modal-body" style="max-height: 75vh; overflow-y: auto;">
              <form (ngSubmit)="submitScheme()">
                <h6 class="fw-bold text-dark border-bottom pb-2 mb-3">Basic Information & Category</h6>
                <div class="row g-3 mb-4">
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Scheme Name *</label>
                    <input type="text" [(ngModel)]="schemeForm.name" name="sname" class="form-control" placeholder="e.g. PM Solar Rooftop Subsidy" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Scheme Code *</label>
                    <input type="text" [(ngModel)]="schemeForm.code" name="scode" class="form-control" [disabled]="!!editingScheme" placeholder="e.g. SCH-SOLAR-01" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Category *</label>
                    <select [(ngModel)]="schemeForm.category" name="scategory" class="form-select" required>
                      <option *ngFor="let c of categories" [value]="c.name">{{ c.name }}</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Related Policy</label>
                    <select [(ngModel)]="schemeForm.policy_id" name="spolicy" class="form-select">
                      <option [ngValue]="null">Select Parent Policy (Optional)</option>
                      <option *ngFor="let p of allPolicies" [ngValue]="p.id">{{ p.code }}: {{ p.title | slice:0:40 }}</option>
                    </select>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-medium">Description *</label>
                    <textarea [(ngModel)]="schemeForm.description" name="sdesc" class="form-control" rows="3" required></textarea>
                  </div>
                </div>
                <h6 class="fw-bold text-dark border-bottom pb-2 mb-3">Benefits & Financial Information</h6>
                <div class="row g-3 mb-4">
                  <div class="col-12">
                    <label class="form-label fw-medium">Benefits Description *</label>
                    <textarea [(ngModel)]="schemeForm.benefits" name="sbenefits" class="form-control" rows="2" required></textarea>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Financial Assistance Amount</label>
                    <input type="text" [(ngModel)]="schemeForm.financial_assistance" name="sfinancial" class="form-control" placeholder="e.g. ₹6,000/year">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Target Group</label>
                    <input type="text" [(ngModel)]="schemeForm.target_group" name="starget" class="form-control" placeholder="e.g. Small & Marginal Farmers">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Application Link</label>
                    <input type="url" [(ngModel)]="schemeForm.application_link" name="slink" class="form-control" placeholder="https://...">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium">Deadline</label>
                    <input type="date" [(ngModel)]="schemeForm.deadline" name="sdeadline" class="form-control">
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-medium">Application Process</label>
                    <textarea [(ngModel)]="schemeForm.application_process" name="sprocess" class="form-control" rows="2"></textarea>
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
                    <i class="fa-solid fa-save me-1"></i> {{ editingScheme ? 'Save Changes' : 'Register Scheme' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class OfficialDashboardComponent implements OnInit {
  public allPolicies: Policy[] = [];
  public filteredPolicies: Policy[] = [];
  public allSchemes: Scheme[] = [];
  public filteredSchemes: Scheme[] = [];
  public categories: any[] = [];

  public publishedPolicyCount = 0;
  public pendingPolicyCount = 0;
  public loadingPolicies = true;
  public loadingSchemes = true;
  public loadingCategories = true;
  public loadError = false;

  // Filters
  public policySearch = '';
  public policyStatusFilter = '';
  public schemeSearch = '';
  public schemeCategoryFilter = '';

  // Modal visibility
  public showPolicyModal = false;
  public showSchemeModal = false;
  public showCategoryModal = false;

  // Edit state
  public editingPolicy: Policy | null = null;
  public editingScheme: Scheme | null = null;

  // Category form
  public newCategoryName = '';
  public newCategoryDesc = '';

  // Policy form
  public policyForm: any = {
    title: '', code: '', description: '', summary: '',
    category: '', ministry: '', department: '', sector: '',
    state: 'All India', document_url: '', effective_date: null
  };

  // Scheme form
  public schemeForm: any = {
    name: '', code: '', policy_id: null as number | null,
    description: '', category: '', benefits: '',
    financial_assistance: '', target_group: 'All Eligible Citizens',
    application_process: 'Apply online at official government portal.',
    application_link: 'https://india.gov.in', deadline: null, status: 'Active'
  };

  public schemeRuleForm = {
    min_age: 18, max_age: 75, gender: 'All', max_income: 500000,
    occupation: 'All', education_level: 'All', social_category: 'All',
    location_type: 'All', disability_required: false
  };

  get loadingData(): boolean {
    return this.loadingPolicies || this.loadingSchemes || this.loadingCategories;
  }

  private apiService = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loadError = false;
    this.fetchPolicies();
    this.fetchSchemes();
    this.fetchCategories();
  }

  fetchPolicies() {
    this.loadingPolicies = true;
    this.apiService.getPolicies().subscribe({
      next: (data) => {
        this.allPolicies = data || [];
        this.publishedPolicyCount = this.allPolicies.filter(p => p.status === 'PUBLISHED' || p.status === 'Published').length;
        this.pendingPolicyCount = this.allPolicies.filter(p => p.status === 'SUBMITTED' || p.status === 'Pending Approval').length;
        this.applyPolicyFilters();
        this.loadingPolicies = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading policies:', err);
        this.loadError = true;
        this.loadingPolicies = false;
        this.cdr.detectChanges();
      }
    });
  }

  fetchSchemes() {
    this.loadingSchemes = true;
    this.apiService.getSchemes().subscribe({
      next: (data) => {
        this.allSchemes = data || [];
        this.applySchemeFilters();
        this.loadingSchemes = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading schemes:', err);
        this.loadingSchemes = false;
        this.cdr.detectChanges();
      }
    });
  }

  fetchCategories() {
    this.loadingCategories = true;
    this.apiService.getCategories().subscribe({
      next: (data: any[]) => {
        this.categories = data || [];
        if (this.categories.length > 0) {
          if (!this.policyForm.category) this.policyForm.category = this.categories[0].name;
          if (!this.schemeForm.category) this.schemeForm.category = this.categories[0].name;
        }
        this.loadingCategories = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingCategories = false; this.cdr.detectChanges(); }
    });
  }

  // Filters
  applyPolicyFilters() {
    this.filteredPolicies = this.allPolicies.filter(p => {
      const matchSearch = !this.policySearch ||
        p.title.toLowerCase().includes(this.policySearch.toLowerCase()) ||
        p.code.toLowerCase().includes(this.policySearch.toLowerCase()) ||
        p.ministry.toLowerCase().includes(this.policySearch.toLowerCase());
      const matchStatus = !this.policyStatusFilter || p.status === this.policyStatusFilter;
      return matchSearch && matchStatus;
    });
  }

  resetPolicyFilters() {
    this.policySearch = '';
    this.policyStatusFilter = '';
    this.applyPolicyFilters();
  }

  applySchemeFilters() {
    this.filteredSchemes = this.allSchemes.filter(s => {
      const matchSearch = !this.schemeSearch ||
        s.name.toLowerCase().includes(this.schemeSearch.toLowerCase()) ||
        s.code.toLowerCase().includes(this.schemeSearch.toLowerCase());
      const matchCat = !this.schemeCategoryFilter || s.category === this.schemeCategoryFilter;
      return matchSearch && matchCat;
    });
  }

  resetSchemeFilters() {
    this.schemeSearch = '';
    this.schemeCategoryFilter = '';
    this.applySchemeFilters();
  }

  closeAllModals() {
    this.showPolicyModal = false;
    this.showSchemeModal = false;
    this.showCategoryModal = false;
  }

  // Policy modals
  openCreatePolicyModal() {
    this.closeAllModals();
    this.editingPolicy = null;
    this.policyForm = {
      title: '', code: '', description: '', summary: '',
      category: this.categories[0]?.name || '',
      ministry: '', department: '', sector: '',
      state: 'All India', document_url: '', effective_date: null
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
      state: pol.state, description: pol.description,
      summary: (pol as any).summary || '',
      document_url: (pol as any).document_url || '', effective_date: null
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
      alert('Please complete all required policy fields.'); return;
    }
    if (this.editingPolicy) {
      this.apiService.updatePolicy(this.editingPolicy.id, this.policyForm).subscribe({
        next: () => {
          alert('Policy updated successfully!');
          this.closePolicyModal();
          this.fetchPolicies();
        },
        error: (err) => alert(err?.error?.detail || 'Policy update failed.')
      });
    } else {
      if (!this.policyForm.code) { alert('Please enter a Policy Code.'); return; }
      this.apiService.createPolicy(this.policyForm).subscribe({
        next: () => {
          alert('Policy submitted successfully for Administrator approval!');
          this.closePolicyModal();
          this.fetchPolicies();
        },
        error: (err) => alert(err?.error?.detail || 'Policy creation failed.')
      });
    }
  }

  archivePolicy(id: number) {
    if (confirm('Archive this policy?')) {
      this.apiService.archivePolicy(id).subscribe({
        next: () => { alert('Policy archived.'); this.fetchPolicies(); }
      });
    }
  }

  deletePolicyAction(id: number, title: string) {
    if (confirm(`DELETE policy "${title}"?\n\nThis will permanently remove it from the database.`)) {
      this.apiService.deletePolicy(id).subscribe({
        next: () => { alert('Policy deleted successfully.'); this.fetchPolicies(); },
        error: (err) => alert(err?.error?.detail || 'Policy deletion failed.')
      });
    }
  }

  // Scheme modals
  openCreateSchemeModal() {
    this.closeAllModals();
    this.editingScheme = null;
    this.schemeForm = {
      name: '', code: '', policy_id: null,
      description: '', category: this.categories[0]?.name || '',
      benefits: '', financial_assistance: '',
      target_group: 'All Eligible Citizens',
      application_process: 'Apply online at official government portal.',
      application_link: 'https://india.gov.in', deadline: null, status: 'Active'
    };
    this.schemeRuleForm = {
      min_age: 18, max_age: 75, gender: 'All', max_income: 500000,
      occupation: 'All', education_level: 'All', social_category: 'All',
      location_type: 'All', disability_required: false
    };
    this.showSchemeModal = true;
    this.cdr.detectChanges();
  }

  openEditSchemeModal(s: Scheme) {
    this.closeAllModals();
    this.editingScheme = s;
    this.schemeForm = {
      name: s.name, code: s.code, policy_id: s.policy_id || null,
      description: s.description, category: s.category,
      benefits: s.benefits, financial_assistance: s.financial_assistance || '',
      target_group: s.target_group || '', application_process: s.application_process || '',
      application_link: s.application_link || '', deadline: null, status: s.status
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
      alert('Please complete all required scheme fields.'); return;
    }
    const payload = { ...this.schemeForm, eligibility_rule: this.schemeRuleForm };
    if (this.editingScheme) {
      this.apiService.updateScheme(this.editingScheme.id, payload).subscribe({
        next: () => {
          alert('Scheme updated successfully!');
          this.closeSchemeModal();
          this.fetchSchemes();
        },
        error: (err) => alert(err?.error?.detail || 'Scheme update failed.')
      });
    } else {
      if (!this.schemeForm.code) { alert('Please enter a Scheme Code.'); return; }
      this.apiService.createScheme(payload).subscribe({
        next: () => {
          alert('Public scheme registered successfully!');
          this.closeSchemeModal();
          this.fetchSchemes();
        },
        error: (err) => alert(err?.error?.detail || 'Scheme creation failed.')
      });
    }
  }

  archiveScheme(id: number) {
    if (confirm('Archive this scheme?')) {
      this.apiService.archiveScheme(id).subscribe({
        next: () => { alert('Scheme archived.'); this.fetchSchemes(); }
      });
    }
  }

  deleteSchemeAction(id: number, name: string) {
    if (confirm(`DELETE scheme "${name}"?\n\nThis will permanently remove it from the database.`)) {
      this.apiService.deleteScheme(id).subscribe({
        next: () => { alert('Scheme deleted successfully.'); this.fetchSchemes(); },
        error: (err) => alert(err?.error?.detail || 'Scheme deletion failed.')
      });
    }
  }

  // Category modal
  openCategoryModal() {
    this.closeAllModals();
    this.showCategoryModal = true;
    this.cdr.detectChanges();
  }

  submitCategory() {
    if (!this.newCategoryName.trim()) { alert('Please enter a category name.'); return; }
    this.apiService.createCategory(this.newCategoryName.trim(), this.newCategoryDesc).subscribe({
      next: (cat) => {
        alert(`Category '${cat.name}' created successfully!`);
        this.showCategoryModal = false;
        this.newCategoryName = '';
        this.newCategoryDesc = '';
        this.fetchCategories();
      },
      error: (err) => alert(err?.error?.detail || 'Category creation failed.')
    });
  }
}
