import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Policy, Scheme } from '../../core/models/models';
import { ScrollRevealDirective } from '../../core/directives/scroll-reveal.directive';

@Component({
  selector: 'app-policy-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollRevealDirective],
  template: `
    <div class="container-fluid p-0">
      <div appScrollReveal class="mb-4">
        <span class="badge bg-warning text-dark px-3 py-1.5 rounded-pill mb-2"><i class="fa-solid fa-magnifying-glass me-1"></i> INTELLIGENT SEARCH ENGINE</span>
        <h2 class="fw-bold" style="color: var(--gov-navy-primary);">Government Policy & Circular Search</h2>
        <p class="text-muted">Search across central and state policies, ministries, sectors, and active directives.</p>
      </div>

      <!-- Search & Faceted Filter Bar -->
      <div appScrollReveal animDelay="1" class="gov-card p-4 mb-4">
        <div class="row g-3">
          <div class="col-lg-5">
            <label class="form-label fw-semibold">Search Keywords</label>
            <div class="input-group">
              <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass text-muted"></i></span>
              <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="onSearch()" class="form-control" placeholder="Search by title, code, ministry, or keywords...">
            </div>
          </div>

          <div class="col-md-3 col-lg-2">
            <label class="form-label fw-semibold">Category</label>
            <select [(ngModel)]="selectedCategory" (change)="onSearch()" class="form-select">
              <option value="">All Categories</option>
              <option *ngFor="let cat of categories" [value]="cat.name">{{ cat.name }}</option>
            </select>
          </div>

          <div class="col-md-3 col-lg-2">
            <label class="form-label fw-semibold">State</label>
            <select [(ngModel)]="selectedState" (change)="onSearch()" class="form-select">
              <option value="">All India / Any State</option>
              <option value="All India">All India</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Delhi">Delhi</option>
            </select>
          </div>

          <div class="col-md-6 col-lg-3 d-flex align-items-end gap-2">
            <button (click)="onSearch()" class="btn btn-gov-navy w-100"><i class="fa-solid fa-filter me-1"></i> Search</button>
            <button (click)="resetFilters()" class="btn btn-gov-outline"><i class="fa-solid fa-rotate-left"></i></button>
          </div>
        </div>
      </div>

      <!-- Search Results Header -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold text-dark mb-0">Search Results ({{ totalResults }} items found)</h5>
      </div>

      <!-- Policy Cards Grid -->
      <div class="row g-4">
        <div *ngFor="let p of policies" class="col-md-6 col-xl-4">
          <div class="gov-card p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="badge bg-light text-dark border fw-semibold">{{ p.category }}</span>
                <span class="badge bg-success">{{ p.status }}</span>
              </div>
              <h5 class="fw-bold mb-2 text-dark">{{ p.title }}</h5>
              <p class="text-secondary small mb-3">{{ p.description | slice:0:140 }}...</p>

              <div class="row g-2 mb-3 fs-7 border-top pt-2">
                <div class="col-12"><strong class="text-muted">Ministry:</strong> {{ p.ministry }}</div>
                <div class="col-6"><strong class="text-muted">State:</strong> {{ p.state }}</div>
                <div class="col-6"><strong class="text-muted">Code:</strong> {{ p.code }}</div>
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center pt-3 border-top">
              <span class="fs-7 text-muted"><i class="fa-solid fa-eye me-1"></i> {{ p.view_count }} views</span>
              <button (click)="openDetail(p)" class="btn btn-gov-navy btn-sm">View Directive <i class="fa-solid fa-chevron-right ms-1"></i></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Policy Detail Modal -->
      <div *ngIf="selectedPolicy" class="modal d-block" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content p-4 gov-card border-0">
            <div class="modal-header border-0 pb-0">
              <span class="badge bg-light text-dark border">{{ selectedPolicy.category }}</span>
              <button (click)="selectedPolicy = null" class="btn-close"></button>
            </div>
            <div class="modal-body">
              <h3 class="fw-bold mb-2" style="color: var(--gov-navy-primary);">{{ selectedPolicy.title }}</h3>
              <p class="text-muted small mb-3">Policy Code: {{ selectedPolicy.code }} | Ministry: {{ selectedPolicy.ministry }}</p>
              <hr>
              <h6 class="fw-bold text-dark">Policy Summary & Directives</h6>
              <p class="text-secondary mb-4">{{ selectedPolicy.description }}</p>

              <div class="p-3 bg-light rounded border mb-4">
                <div class="row g-2 fs-7">
                  <div class="col-md-6"><strong>Department:</strong> {{ selectedPolicy.department }}</div>
                  <div class="col-md-6"><strong>Applicable Region:</strong> {{ selectedPolicy.state }}</div>
                  <div class="col-md-6"><strong>Sector:</strong> {{ selectedPolicy.sector }}</div>
                  <div class="col-md-6"><strong>Status:</strong> {{ selectedPolicy.status }}</div>
                </div>
              </div>
              
              <a [href]="selectedPolicy.document_url || '#'" target="_blank" class="btn btn-gov-saffron w-100">
                <i class="fa-solid fa-file-pdf me-2"></i> Download Official Policy Circular PDF
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class PolicySearchComponent implements OnInit {
  public searchQuery = '';
  public selectedCategory = '';
  public selectedState = '';
  public categories: any[] = [];
  public policies: Policy[] = [];
  public totalResults = 0;
  public selectedPolicy: Policy | null = null;

  private apiService = inject(ApiService);

  ngOnInit() {
    this.apiService.getCategories().subscribe(cats => this.categories = cats);
    this.onSearch();
  }

  onSearch() {
    const filters = {
      category: this.selectedCategory,
      state: this.selectedState
    };
    this.apiService.search(this.searchQuery, filters).subscribe(res => {
      this.policies = res.policies;
      this.totalResults = res.total_results;
    });
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedState = '';
    this.onSearch();
  }

  openDetail(policy: Policy) {
    this.selectedPolicy = policy;
  }
}
