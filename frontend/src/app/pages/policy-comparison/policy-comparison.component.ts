import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Scheme } from '../../core/models/models';

@Component({
  selector: 'app-policy-comparison',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="mb-4">
        <span class="badge bg-warning text-dark px-3 py-2 rounded-pill mb-2 fs-7">
          <i class="fa-solid fa-code-compare me-1"></i> COMPARATIVE ANALYSIS
        </span>
        <h2 class="fw-bold mb-1" style="color: var(--gov-navy-primary);">Side-by-Side Scheme Comparison</h2>
        <p class="text-muted mb-0">Select any two schemes from the dropdowns below to instantly generate a detailed side-by-side feature matrix.</p>
      </div>

      <!-- Scheme Selector Panel -->
      <div class="gov-card p-4 mb-4">
        <h5 class="fw-bold mb-3" style="color: var(--gov-navy-primary);">
          <i class="fa-solid fa-sliders me-2 text-warning"></i> Choose Schemes to Compare
        </h5>

        <!-- Loading schemes -->
        <div *ngIf="loadingSchemes" class="d-flex align-items-center gap-3 py-3">
          <div class="spinner-border text-warning" style="width:1.5rem;height:1.5rem;" role="status"></div>
          <span class="text-muted">Loading published schemes from database...</span>
        </div>

        <!-- Scheme Error -->
        <div *ngIf="!loadingSchemes && schemeError" class="alert alert-danger d-flex align-items-center gap-2 mb-0">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span>Failed to load schemes. <button (click)="loadSchemes()" class="btn btn-sm btn-danger ms-2">Retry</button></span>
        </div>

        <!-- Two Dropdowns -->
        <div *ngIf="!loadingSchemes && !schemeError" class="row g-4 align-items-end">
          <div class="col-md-5">
            <label class="form-label fw-semibold text-dark mb-1">
              <span class="badge bg-warning text-dark me-1">1</span> First Scheme
            </label>
            <select [(ngModel)]="selectedId1" (change)="onSelectionChange()" class="form-select form-select-lg shadow-sm">
              <option [ngValue]="null" disabled>-- Select a scheme --</option>
              <option *ngFor="let s of allSchemes" [ngValue]="s.id" [disabled]="s.id === selectedId2">
                {{ s.name }} ({{ s.category }})
              </option>
            </select>
          </div>

          <div class="col-md-2 text-center pb-1">
            <div class="fw-bold text-muted fs-4" style="letter-spacing:2px;">VS</div>
          </div>

          <div class="col-md-5">
            <label class="form-label fw-semibold text-dark mb-1">
              <span class="badge bg-warning text-dark me-1">2</span> Second Scheme
            </label>
            <select [(ngModel)]="selectedId2" (change)="onSelectionChange()" class="form-select form-select-lg shadow-sm">
              <option [ngValue]="null" disabled>-- Select a scheme --</option>
              <option *ngFor="let s of allSchemes" [ngValue]="s.id" [disabled]="s.id === selectedId1">
                {{ s.name }} ({{ s.category }})
              </option>
            </select>
          </div>

          <!-- Action Buttons -->
          <div class="col-12 d-flex gap-2 justify-content-start pt-2">
            <button (click)="loadComparison()" [disabled]="!selectedId1 || !selectedId2 || comparing" class="btn btn-gov-saffron px-4 py-2">
              <span *ngIf="comparing" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i *ngIf="!comparing" class="fa-solid fa-arrows-rotate me-2"></i>
              Compare These Schemes
            </button>
            <button (click)="clearComparison()" class="btn btn-outline-secondary px-3 py-2">
              <i class="fa-solid fa-rotate-left me-1"></i> Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Compare Error Alert -->
      <div *ngIf="compareError" class="alert alert-danger mb-4 d-flex align-items-center gap-2">
        <i class="fa-solid fa-circle-exclamation fs-5"></i>
        <span>{{ compareError }}</span>
      </div>

      <!-- Comparison Matrix Table -->
      <div *ngIf="comparisonData" class="gov-card p-4 fade-in mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="fw-bold mb-0" style="color: var(--gov-navy-primary);">
            <i class="fa-solid fa-table-columns me-2"></i> Comparison Matrix
          </h4>
          <span class="badge bg-success px-3 py-2 fs-7">{{ comparisonData.compared_items.length }} Schemes Compared</span>
        </div>

        <div class="table-responsive">
          <table class="table table-bordered align-middle mb-0 shadow-sm" style="min-width:600px;">
            <thead style="background: var(--gov-navy-primary); color: #fff;">
              <tr>
                <th style="width: 22%;" class="ps-3">Feature</th>
                <th *ngFor="let item of comparisonData.compared_items; let i = index" class="text-center" style="width: 39%;">
                  <div class="badge bg-warning text-dark mb-1 fs-7">Scheme {{ i + 1 }}</div>
                  <div class="fw-bold fs-6">{{ item.name }}</div>
                  <span class="fs-8 text-light font-monospace">SCH-{{ item.category.substring(0,3).toUpperCase() }}-00{{ item.id }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="fw-semibold bg-light ps-3">Category</td>
                <td *ngFor="let item of comparisonData.compared_items" class="text-center">
                  <span class="badge bg-secondary fs-7">{{ item.category }}</span>
                </td>
              </tr>
              <tr>
                <td class="fw-semibold bg-light ps-3">Financial Assistance / Benefits</td>
                <td *ngFor="let item of comparisonData.compared_items" class="text-center fw-bold text-success">
                  {{ item.financial_assistance || 'N/A' }}
                </td>
              </tr>
              <tr>
                <td class="fw-semibold bg-light ps-3">Target Group</td>
                <td *ngFor="let item of comparisonData.compared_items" class="text-center">
                  {{ item.target_group || 'All Eligible Citizens' }}
                </td>
              </tr>
              <tr>
                <td class="fw-semibold bg-light ps-3">Allocated Budget (₹)</td>
                <td *ngFor="let item of comparisonData.compared_items" class="text-center fw-semibold">
                  {{ item.budget_allocated ? ('₹' + (item.budget_allocated | number)) : '—' }}
                </td>
              </tr>
              <tr>
                <td class="fw-semibold bg-light ps-3">Description</td>
                <td *ngFor="let item of comparisonData.compared_items" class="small text-secondary" style="max-width:250px; white-space:normal;">
                  {{ item.description || '—' }}
                </td>
              </tr>
              <tr>
                <td class="fw-semibold bg-light ps-3">Application Process</td>
                <td *ngFor="let item of comparisonData.compared_items" class="small text-secondary">
                  {{ item.application_process || '—' }}
                </td>
              </tr>
              <tr>
                <td class="fw-semibold bg-light ps-3">Status</td>
                <td *ngFor="let item of comparisonData.compared_items" class="text-center">
                  <span class="badge bg-success">{{ item.status || 'Active' }}</span>
                </td>
              </tr>
              <tr>
                <td class="fw-semibold bg-light ps-3">Apply Online</td>
                <td *ngFor="let item of comparisonData.compared_items" class="text-center">
                  <a [href]="item.application_link || 'https://india.gov.in'" target="_blank" class="btn btn-gov-saffron btn-sm">
                    <i class="fa-solid fa-external-link me-1"></i> Apply Now
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty Comparison Placeholder -->
      <div *ngIf="!comparisonData && !loadingSchemes && !comparing" class="gov-card p-5 text-center text-muted">
        <i class="fa-solid fa-scale-balanced fs-1 mb-3" style="color: var(--gov-navy-primary); opacity: 0.3;"></i>
        <h5 class="fw-bold mb-1">No Comparison Yet</h5>
        <p class="small mb-0">Select two schemes above and click <strong>Compare These Schemes</strong> to see the side-by-side matrix.</p>
      </div>
    </div>
  `,
  styles: [`
    .fade-in { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class PolicyComparisonComponent implements OnInit {
  public allSchemes: Scheme[] = [];
  public selectedId1: number | null = null;
  public selectedId2: number | null = null;

  public loadingSchemes = true;
  public schemeError = false;
  public comparing = false;
  public compareError = '';
  public comparisonData: any = null;

  private apiService = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadSchemes();
  }

  loadSchemes() {
    this.loadingSchemes = true;
    this.schemeError = false;
    this.cdr.markForCheck();

    this.apiService.getSchemes().subscribe({
      next: (data) => {
        this.allSchemes = data || [];
        this.loadingSchemes = false;
        
        if (this.allSchemes.length >= 2) {
          if (!this.selectedId1) this.selectedId1 = this.allSchemes[0].id;
          if (!this.selectedId2) this.selectedId2 = this.allSchemes[1].id;
          // Load default comparison once schemes list is bound
          this.loadComparison();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading schemes for comparison:', err);
        this.loadingSchemes = false;
        this.schemeError = true;
        this.cdr.detectChanges();
      }
    });
  }

  onSelectionChange() {
    this.comparisonData = null;
    this.compareError = '';
    this.cdr.markForCheck();
  }

  clearComparison() {
    this.comparisonData = null;
    this.compareError = '';
    this.selectedId1 = null;
    this.selectedId2 = null;
    this.cdr.markForCheck();
  }

  loadComparison() {
    if (!this.selectedId1 || !this.selectedId2) return;
    this.compareError = '';
    this.comparing = true;
    this.comparisonData = null;
    this.cdr.markForCheck();

    const ids = [this.selectedId1, this.selectedId2];
    this.apiService.compareSchemes(ids).subscribe({
      next: (data) => {
        this.comparisonData = data;
        this.comparing = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.compareError = err?.error?.detail || 'Comparison failed. Please try again.';
        this.comparing = false;
        this.cdr.detectChanges();
      }
    });
  }
}
