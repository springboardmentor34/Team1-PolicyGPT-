import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { ScrollRevealDirective } from '../../core/directives/scroll-reveal.directive';

@Component({
  selector: 'app-reports-analytics',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  template: `
    <div class="container-fluid p-0">
      <div appScrollReveal class="mb-4">
        <span class="badge bg-warning text-dark px-3 py-1.5 rounded-pill mb-2"><i class="fa-solid fa-file-invoice me-1"></i> REPORTS & EXPORT ENGINE</span>
        <h2 class="fw-bold" style="color: var(--gov-navy-primary);">Policy & Public Scheme Reports</h2>
        <p class="text-muted">Generate and export formatted official PDF directives and Excel spreadsheet datasets.</p>
      </div>

      <!-- Quick Export Cards -->
      <div appScrollReveal animDelay="1" class="row g-4 mb-4">
        <div class="col-md-6 col-xl-3">
          <div class="gov-card p-4 text-center h-100 d-flex flex-column justify-content-between">
            <div>
              <i class="fa-solid fa-file-pdf text-danger display-5 mb-3"></i>
              <h5 class="fw-bold text-dark mb-2">Policy Directive PDF</h5>
              <p class="text-secondary small mb-3">Summary of approved national policies and ministry allocations.</p>
            </div>
            <button (click)="apiService.downloadPoliciesPdf()" class="btn btn-gov-navy btn-sm fw-bold">
              <i class="fa-solid fa-download me-1"></i> Policy PDF
            </button>
          </div>
        </div>

        <div class="col-md-6 col-xl-3">
          <div class="gov-card p-4 text-center h-100 d-flex flex-column justify-content-between">
            <div>
              <i class="fa-solid fa-file-excel text-success display-5 mb-3"></i>
              <h5 class="fw-bold text-dark mb-2">Scheme Dataset (Excel)</h5>
              <p class="text-secondary small mb-3">Tabular spreadsheet of active schemes, budgets, and deadlines.</p>
            </div>
            <button (click)="apiService.downloadSchemesExcel()" class="btn btn-gov-saffron btn-sm fw-bold">
              <i class="fa-solid fa-file-excel me-1"></i> Scheme Excel
            </button>
          </div>
        </div>

        <div class="col-md-6 col-xl-3">
          <div class="gov-card p-4 text-center h-100 d-flex flex-column justify-content-between">
            <div>
              <i class="fa-solid fa-building-columns text-primary display-5 mb-3"></i>
              <h5 class="fw-bold text-dark mb-2">Department PDF</h5>
              <p class="text-secondary small mb-3">Department-specific policy directives and scheme breakdown.</p>
            </div>
            <button (click)="apiService.downloadDepartmentPdf()" class="btn btn-outline-primary btn-sm fw-bold">
              <i class="fa-solid fa-download me-1"></i> Department PDF
            </button>
          </div>
        </div>

        <div class="col-md-6 col-xl-3">
          <div class="gov-card p-4 text-center h-100 d-flex flex-column justify-content-between">
            <div>
              <i class="fa-solid fa-chart-pie text-warning display-5 mb-3"></i>
              <h5 class="fw-bold text-dark mb-2">Executive Analytics PDF</h5>
              <p class="text-secondary small mb-3">System-wide executive summary of users, policies, and schemes.</p>
            </div>
            <button (click)="apiService.downloadAnalyticsPdf()" class="btn btn-warning text-dark btn-sm fw-bold">
              <i class="fa-solid fa-download me-1"></i> Analytics PDF
            </button>
          </div>
        </div>
      </div>


      <!-- Global Summary Cards -->
      <div *ngIf="summary" class="gov-card p-4">
        <h4 class="fw-bold mb-3" style="color: var(--gov-navy-primary);">Real-time Platform Activity Overview</h4>
        <div class="row g-3 text-center">
          <div class="col-sm-6 col-md-3">
            <div class="p-3 bg-light rounded border">
              <h3 class="fw-bold mb-0" style="color: var(--gov-navy-primary);">{{ summary.policies.total }}</h3>
              <span class="text-muted small">Total Policies</span>
            </div>
          </div>
          <div class="col-sm-6 col-md-3">
            <div class="p-3 bg-light rounded border">
              <h3 class="fw-bold text-success mb-0">{{ summary.schemes.active }}</h3>
              <span class="text-muted small">Active Schemes</span>
            </div>
          </div>
          <div class="col-sm-6 col-md-3">
            <div class="p-3 bg-light rounded border">
              <h3 class="fw-bold text-warning mb-0">{{ summary.users.total }}</h3>
              <span class="text-muted small">Registered Users</span>
            </div>
          </div>
          <div class="col-sm-6 col-md-3">
            <div class="p-3 bg-light rounded border">
              <h3 class="fw-bold text-info mb-0">100%</h3>
              <span class="text-muted small">RBAC Secured</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class ReportsAnalyticsComponent implements OnInit {
  public summary: any = null;
  public apiService = inject(ApiService);

  ngOnInit() {
    this.apiService.getAnalyticsSummary().subscribe(data => this.summary = data);
  }
}
