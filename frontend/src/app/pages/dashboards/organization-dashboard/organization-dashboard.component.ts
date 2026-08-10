import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Scheme } from '../../../core/models/models';

@Component({
  selector: 'app-organization-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid p-0">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <span class="badge bg-dark text-white px-3 py-1.5 rounded-pill mb-2"><i class="fa-solid fa-building me-1"></i> ENTERPRISE & NGO PORTAL</span>
          <h2 class="fw-bold mb-0" style="color: var(--gov-navy-primary);">Business Grants & Public Schemes Directory</h2>
        </div>
        <div class="d-flex gap-2">
          <button (click)="apiService.downloadSchemesExcel()" class="btn btn-gov-saffron btn-sm"><i class="fa-solid fa-file-excel me-1"></i> Download Scheme Excel</button>
          <a routerLink="/schemes" class="btn btn-gov-navy btn-sm"><i class="fa-solid fa-briefcase me-1"></i> Explore MSME Schemes</a>
        </div>
      </div>

      <!-- Organization Analytics Metrics Cards -->
      <div *ngIf="analytics" class="row g-4 mb-4">
        <div class="col-md-4">
          <div class="stat-card">
            <span class="text-muted small fw-semibold text-uppercase">Eligible Schemes</span>
            <div class="stat-number text-navy">{{ analytics.relevant_schemes_count }}</div>
            <span class="fs-7 text-muted">MSME & NGO Targeted</span>
          </div>
        </div>
        <div class="col-md-4">
          <div class="stat-card green">
            <span class="text-muted small fw-semibold text-uppercase">Total Budget Pool</span>
            <div class="stat-number text-success">₹{{ analytics.total_budget_available | number:'1.0-0' }}</div>
            <span class="fs-7 text-muted">Available Business Grants</span>
          </div>
        </div>
        <div class="col-md-4">
          <div class="stat-card saffron">
            <span class="text-muted small fw-semibold text-uppercase">Related Policy Directives</span>
            <div class="stat-number text-warning">{{ analytics.relevant_policies_count }}</div>
            <span class="fs-7 text-muted">Financial & Industrial Sector</span>
          </div>
        </div>
      </div>

      <!-- Business Support Schemes Section -->
      <div class="gov-card p-4">
        <h4 class="fw-bold mb-3" style="color: var(--gov-navy-primary);"><i class="fa-solid fa-coins me-2"></i> Corporate & NGO Eligible Schemes</h4>
        <div class="row g-4">
          <div *ngFor="let s of businessSchemes" class="col-md-6">
            <div class="p-3 border rounded-3 bg-light">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge bg-navy text-white" style="background-color: var(--gov-navy-primary);">{{ s.category }}</span>
                <span class="badge bg-light text-dark border">{{ s.code }}</span>
              </div>
              <h5 class="fw-bold text-dark mb-1">{{ s.name }}</h5>
              <p class="text-secondary small mb-2">{{ s.description }}</p>
              <div class="p-2 bg-white rounded border small mb-2">
                <span class="fw-bold text-success">Target Group:</span> {{ s.target_group }}
              </div>
              <a [href]="s.application_link || '#'" target="_blank" class="btn btn-gov-saffron btn-sm w-100">
                <i class="fa-solid fa-external-link me-1"></i> View Application Directives
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class OrganizationDashboardComponent implements OnInit {
  public businessSchemes: Scheme[] = [];
  public analytics: any = null;
  public apiService = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.apiService.getSchemes().subscribe(data => {
      this.businessSchemes = data.filter(s => s.category === 'Business Support' || s.category === 'Farmer Welfare' || s.category === 'Housing' || s.category === 'Employment Programs');
    });

    this.apiService.getOrganizationAnalytics().subscribe({
      next: (data) => { this.analytics = data; this.cdr.detectChanges(); },
      error: () => this.cdr.detectChanges()
    });
  }
}

