import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Scheme } from '../../core/models/models';
import { ScrollRevealDirective } from '../../core/directives/scroll-reveal.directive';

@Component({
  selector: 'app-scheme-directory',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ScrollRevealDirective],
  template: `
    <div class="container-fluid p-0">
      <div appScrollReveal class="mb-4">
        <span class="badge bg-warning text-dark px-3 py-1.5 rounded-pill mb-2"><i class="fa-solid fa-hand-holding-hand me-1"></i> PUBLIC SCHEMES DIRECTORY</span>
        <h2 class="fw-bold" style="color: var(--gov-navy-primary);">Central & State Welfare Schemes</h2>
        <p class="text-muted">Explore financial support, health cover, scholarships, and housing grants.</p>
      </div>

      <!-- Filter Controls -->
      <div appScrollReveal animDelay="1" class="row g-3 mb-4">
        <div class="col-md-7 col-lg-8">
          <input type="text" [(ngModel)]="searchQuery" (keyup)="applyFilters()" class="form-control" placeholder="Filter schemes by name or benefit...">
        </div>
        <div class="col-md-5 col-lg-4">
          <select [(ngModel)]="selectedCategory" (change)="applyFilters()" class="form-select">
            <option value="">All Scheme Categories</option>
            <option *ngFor="let cat of categories" [value]="cat.name">{{ cat.name }}</option>
          </select>
        </div>
      </div>

      <!-- Schemes Cards Grid -->
      <div class="row g-4">
        <div *ngFor="let s of filteredSchemes" class="col-md-6 col-xl-4">
          <div class="gov-card h-100 p-4 d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge bg-navy text-white fw-bold" style="background-color: var(--gov-navy-primary);">{{ s.category }}</span>
                <span class="badge bg-light text-dark border">{{ s.code }}</span>
              </div>
              <h4 class="fw-bold text-dark mb-2">{{ s.name }}</h4>
              <p class="text-secondary small mb-3">{{ s.description }}</p>

              <div class="p-3 bg-light rounded mb-3">
                <span class="fs-7 text-muted d-block fw-semibold">Financial Assistance:</span>
                <span class="fw-bold text-success fs-6"><i class="fa-solid fa-indian-rupee-sign me-1"></i>{{ s.financial_assistance || s.benefits }}</span>
              </div>

              <div class="fs-7 text-muted mb-3">
                <strong>Target Demographic:</strong> {{ s.target_group || 'All Eligible Citizens' }}
              </div>
            </div>

            <div>
              <a [href]="s.application_link || '#'" target="_blank" class="btn btn-gov-saffron btn-sm w-100 mb-2">
                <i class="fa-solid fa-external-link me-1"></i> Official Portal Application
              </a>
              <a routerLink="/eligibility" class="btn btn-gov-outline btn-sm w-100">
                <i class="fa-solid fa-user-check me-1"></i> Verify Your Eligibility
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class SchemeDirectoryComponent implements OnInit {
  public allSchemes: Scheme[] = [];
  public filteredSchemes: Scheme[] = [];
  public categories: any[] = [];
  public searchQuery = '';
  public selectedCategory = '';

  private apiService = inject(ApiService);

  ngOnInit() {
    this.apiService.getCategories().subscribe(cats => this.categories = cats);
    this.apiService.getSchemes().subscribe(data => {
      this.allSchemes = data;
      this.filteredSchemes = data;
    });
  }

  applyFilters() {
    this.filteredSchemes = this.allSchemes.filter(s => {
      const matchQuery = !this.searchQuery || s.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || s.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchCat = !this.selectedCategory || s.category === this.selectedCategory;
      return matchQuery && matchCat;
    });
  }
}
