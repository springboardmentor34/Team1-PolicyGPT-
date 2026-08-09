import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-researcher-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid p-0">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <span class="badge bg-success text-white px-3 py-1.5 rounded-pill mb-2"><i class="fa-solid fa-graduation-cap me-1"></i> POLICY RESEARCHER & ACADEMIC HUB</span>
          <h2 class="fw-bold mb-0" style="color: var(--gov-navy-primary);">Policy Analytics & Data Intelligence</h2>
        </div>
        <div class="d-flex gap-2">
          <button (click)="apiService.downloadPoliciesPdf()" class="btn btn-gov-navy btn-sm"><i class="fa-solid fa-file-pdf me-1"></i> Export PDF Summary</button>
          <button (click)="apiService.downloadSchemesExcel()" class="btn btn-gov-saffron btn-sm"><i class="fa-solid fa-file-excel me-1"></i> Download Scheme Dataset</button>
        </div>
      </div>

      <!-- Quantitative Research Metrics -->
      <div class="row g-4 mb-4">
        <div class="col-md-4">
          <div class="stat-card">
            <span class="text-muted small fw-semibold text-uppercase">Sectoral Coverage</span>
            <div class="stat-number">10 Categories</div>
            <span class="fs-7 text-muted">Agriculture, Health, Edu, Housing...</span>
          </div>
        </div>
        <div class="col-md-4">
          <div class="stat-card green">
            <span class="text-muted small fw-semibold text-uppercase">Budget Outlay Evaluated</span>
            <div class="stat-number text-success">₹260+ Billion</div>
            <span class="fs-7 text-muted">Active Direct Benefit Transfer</span>
          </div>
        </div>
        <div class="col-md-4">
          <div class="stat-card saffron">
            <span class="text-muted small fw-semibold text-uppercase">Comparative Matrix Ready</span>
            <div class="stat-number text-warning">Side-by-Side</div>
            <span class="fs-7 text-muted">Multi-Ministry Policy Alignment</span>
          </div>
        </div>
      </div>

      <!-- Research Quick Actions Grid -->
      <div class="row g-4">
        <div class="col-md-6">
          <div class="gov-card p-4 h-100">
            <h4 class="fw-bold mb-2" style="color: var(--gov-navy-primary);"><i class="fa-solid fa-chart-pie me-2"></i> Comparative Policy Matrix</h4>
            <p class="text-secondary small mb-3">Analyze regulatory differences, budget allocation variances, and target groups side-by-side across ministries.</p>
            <a routerLink="/compare" class="btn btn-gov-outline btn-sm">Open Policy Comparison Grid <i class="fa-solid fa-arrow-right ms-1"></i></a>
          </div>
        </div>

        <div class="col-md-6">
          <div class="gov-card p-4 h-100">
            <h4 class="fw-bold mb-2" style="color: var(--gov-navy-primary);"><i class="fa-solid fa-file-export me-2"></i> Export Academic Datasets</h4>
            <p class="text-secondary small mb-3">Download comprehensive tabular reports of active public schemes in PDF and Excel formats for economic research.</p>
            <a routerLink="/reports" class="btn btn-gov-saffron btn-sm">Go to Reports Portal <i class="fa-solid fa-arrow-right ms-1"></i></a>
          </div>
        </div>
      </div>

    </div>
  `
})
export class ResearcherDashboardComponent implements OnInit {
  public apiService = inject(ApiService);
  ngOnInit() {}
}
