import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-reports-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid p-0">
      <div class="mb-4">
        <span class="badge bg-warning text-dark px-3 py-1.5 rounded-pill mb-2"><i class="fa-solid fa-file-invoice me-1"></i> REPORTS & EXPORT ENGINE</span>
        <h2 class="fw-bold" style="color: var(--gov-navy-primary);">Policy & Public Scheme Reports</h2>
        <p class="text-muted">Generate and export formatted official PDF directives and Excel spreadsheet datasets.</p>
      </div>

      <!-- Quick Export Cards -->
      <div class="row g-4 mb-4">
        <div class="col-md-6">
          <div class="gov-card p-4 text-center h-100 d-flex flex-column justify-content-between">
            <div>
              <i class="fa-solid fa-file-pdf text-danger display-4 mb-3"></i>
              <h4 class="fw-bold text-dark mb-2">Policy Directive PDF Report</h4>
              <p class="text-secondary small mb-4">Generates an official document summarizing all approved national policies, ministry allocations, and operational codes.</p>
            </div>
            <button (click)="apiService.downloadPoliciesPdf()" class="btn btn-gov-navy py-2.5 fw-bold">
              <i class="fa-solid fa-download me-2"></i> Download Official Policy PDF
            </button>
          </div>
        </div>

        <div class="col-md-6">
          <div class="gov-card p-4 text-center h-100 d-flex flex-column justify-content-between">
            <div>
              <i class="fa-solid fa-file-excel text-success display-4 mb-3"></i>
              <h4 class="fw-bold text-dark mb-2">Public Scheme Dataset (Excel XLSX)</h4>
              <p class="text-secondary small mb-4">Exports complete tabular spreadsheet data of active schemes, budget outlays, financial assistance limits, and deadlines.</p>
            </div>
            <button (click)="apiService.downloadSchemesExcel()" class="btn btn-gov-saffron py-2.5 fw-bold">
              <i class="fa-solid fa-file-excel me-2"></i> Download Scheme Excel Dataset
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
