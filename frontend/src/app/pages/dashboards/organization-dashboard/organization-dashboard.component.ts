import { Component, OnInit, inject } from '@angular/core';
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
        <a routerLink="/schemes" class="btn btn-gov-navy btn-sm"><i class="fa-solid fa-briefcase me-1"></i> Explore MSME Schemes</a>
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
  private apiService = inject(ApiService);

  ngOnInit() {
    this.apiService.getSchemes().subscribe(data => {
      this.businessSchemes = data.filter(s => s.category === 'Business Support' || s.category === 'Farmer Welfare' || s.category === 'Housing');
    });
  }
}
