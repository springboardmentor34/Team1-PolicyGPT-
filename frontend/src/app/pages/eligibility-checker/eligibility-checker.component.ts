import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { SchemeEligibilityResult } from '../../core/models/models';
import { ScrollRevealDirective } from '../../core/directives/scroll-reveal.directive';

type EvaluationState = 'INITIAL' | 'LOADING' | 'SUCCESS' | 'NO_RESULTS' | 'API_ERROR';

@Component({
  selector: 'app-eligibility-checker',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollRevealDirective],
  template: `
    <div class="container-fluid p-0">
      <div appScrollReveal class="mb-4">
        <span class="badge bg-warning text-dark px-3 py-1.5 rounded-pill mb-2">
          <i class="fa-solid fa-calculator me-1"></i> AUTOMATED MATCHING ENGINE
        </span>
        <h2 class="fw-bold" style="color: var(--gov-navy-primary);">Public Scheme Eligibility Evaluation</h2>
        <p class="text-muted mb-0">Enter your demographic profile to calculate instant match scores and step-by-step application guidance.</p>
      </div>

      <div class="row g-4">
        <!-- Input Form Column -->
        <div class="col-lg-5 col-xl-4">
          <div class="gov-card p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="fw-bold mb-0" style="color: var(--gov-navy-primary);">
                <i class="fa-solid fa-sliders me-2"></i> Demographic Parameters
              </h4>
              <button *ngIf="state !== 'INITIAL'" (click)="resetForm()" type="button" class="btn btn-outline-secondary btn-sm fs-8">
                <i class="fa-solid fa-rotate-left me-1"></i> Reset
              </button>
            </div>
            
            <form (ngSubmit)="onCheck()">
              <!-- Age Field -->
              <div class="mb-3">
                <label class="form-label fw-medium">Age (Years) *</label>
                <input type="number" [(ngModel)]="inputData.age" (change)="onFieldChange()" (input)="onFieldChange()" name="age" class="form-control" placeholder="e.g. 28" required min="1" max="120">
              </div>

              <!-- Gender Field -->
              <div class="mb-3">
                <label class="form-label fw-medium">Gender *</label>
                <select [(ngModel)]="inputData.gender" (change)="onFieldChange()" name="gender" class="form-select" required>
                  <option value="">Select Gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <!-- Household Income Field -->
              <div class="mb-3">
                <label class="form-label fw-medium">Annual Household Income (₹) *</label>
                <input type="number" [(ngModel)]="inputData.income_annual" (change)="onFieldChange()" (input)="onFieldChange()" name="income_annual" class="form-control" placeholder="e.g. 180000" required min="0">
              </div>

              <!-- Occupation Dropdown -->
              <div class="mb-3">
                <label class="form-label fw-medium">Occupation *</label>
                <select [(ngModel)]="inputData.occupation" (change)="onFieldChange()" name="occupation" class="form-select" required>
                  <option value="">Select Occupation</option>
                  <option value="Farmer">Farmer / Agriculture</option>
                  <option value="Student">Student / Scholar</option>
                  <option value="Entrepreneur / Self-Employed">Entrepreneur / Self-Employed</option>
                  <option value="Salaried Employee">Salaried Employee</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Retired">Retired</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <!-- Education Level Dropdown -->
              <div class="mb-3">
                <label class="form-label fw-medium">Education Level *</label>
                <select [(ngModel)]="inputData.education_level" (change)="onFieldChange()" name="education_level" class="form-select" required>
                  <option value="">Select Education</option>
                  <option value="High School Passed">High School Passed</option>
                  <option value="Graduate">Graduate (UG)</option>
                  <option value="Postgraduate">Postgraduate (PG)</option>
                  <option value="Doctorate">Doctorate (PhD)</option>
                </select>
              </div>

              <!-- Social Category Dropdown -->
              <div class="mb-3">
                <label class="form-label fw-medium">Social Category *</label>
                <select [(ngModel)]="inputData.social_category" (change)="onFieldChange()" name="social_category" class="form-select" required>
                  <option value="">Select Category</option>
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">Economically Weaker Section (EWS)</option>
                </select>
              </div>

              <!-- Scheme Category Filter -->
              <div class="mb-3">
                <label class="form-label fw-medium">Scheme Category Filter</label>
                <select [(ngModel)]="inputData.category" (change)="onFieldChange()" name="scheme_category" class="form-select">
                  <option value="All">All Categories</option>
                  <option *ngFor="let cat of categories" [value]="cat.name">{{ cat.name }}</option>
                </select>
              </div>

              <!-- PwD Checkbox -->
              <div class="mb-3 form-check">
                <input type="checkbox" [(ngModel)]="inputData.disability_status" (change)="onFieldChange()" name="disability" class="form-check-input" id="disabilityCheck">
                <label class="form-check-label fw-medium" for="disabilityCheck">Person with Disability (PwD) Certificate Holder</label>
              </div>

              <!-- Manual Trigger Button -->
              <button type="submit" [disabled]="state === 'LOADING' || !isFormComplete()" class="btn btn-gov-navy w-100 py-2.5 mt-2">
                <span *ngIf="state === 'LOADING'" class="spinner-border spinner-border-sm me-2"></span>
                <span *ngIf="state === 'LOADING'">Finding eligible schemes...</span>
                <span *ngIf="state !== 'LOADING' && state !== 'INITIAL'"><i class="fa-solid fa-rotate-right me-2"></i> Recalculate Matched Schemes</span>
                <span *ngIf="state === 'INITIAL'"><i class="fa-solid fa-calculator me-2"></i> Calculate Matched Schemes</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Dynamic Results Area -->
        <div class="col-lg-7 col-xl-8">

          <!-- STATE 1: INITIAL (Form Incomplete or Unsubmitted) -->
          <div *ngIf="state === 'INITIAL'" class="gov-card p-5 text-center bg-white">
            <div class="mb-3">
              <span class="p-3 bg-light rounded-circle d-inline-block">
                <i class="fa-solid fa-sliders fs-1 text-muted"></i>
              </span>
            </div>
            <h4 class="fw-bold mb-2" style="color: var(--gov-navy-primary);">Enter Your Profile to Check Eligibility</h4>
            <p class="text-muted small mb-3">Complete all demographic parameters on the left to evaluate matching government schemes against official database criteria.</p>
            <div class="badge bg-light text-dark border px-3 py-2 fs-7">
              <i class="fa-solid fa-circle-info text-info me-1"></i> Form status: 
              <span *ngIf="isFormComplete()" class="text-success fw-bold">Complete & Ready!</span>
              <span *ngIf="!isFormComplete()" class="text-warning fw-bold">Please complete required fields (*)</span>
            </div>
          </div>

          <!-- STATE 2: LOADING -->
          <div *ngIf="state === 'LOADING'" class="gov-card p-5 text-center bg-white">
            <div class="spinner-border text-warning mb-3" style="width: 3rem; height: 3rem;" role="status"></div>
            <h5 class="fw-bold text-dark mb-1">Evaluating Scheme Eligibility...</h5>
            <p class="text-muted small mb-0">Analyzing demographic rules across central & state welfare databases.</p>
          </div>

          <!-- STATE 5: API ERROR -->
          <div *ngIf="state === 'API_ERROR'" class="gov-card p-5 text-center bg-white border-danger">
            <i class="fa-solid fa-triangle-exclamation fs-1 text-danger mb-3"></i>
            <h5 class="fw-bold text-danger mb-2">Unable to Evaluate Eligibility</h5>
            <p class="text-muted small mb-3">The system encountered an issue connecting to the eligibility engine. Please verify your connection or try again.</p>
            <button (click)="evaluateEligibility()" class="btn btn-gov-outline btn-sm px-4">Retry Calculation</button>
          </div>

          <!-- STATE 4: NO RESULTS -->
          <div *ngIf="state === 'NO_RESULTS'" class="gov-card p-5 text-center bg-white">
            <i class="fa-solid fa-circle-info fs-1 text-warning mb-3"></i>
            <h5 class="fw-bold text-dark mb-2">No Matching Schemes Found</h5>
            <p class="text-muted small mb-0">No active government welfare schemes currently match all entered demographic parameters. Try adjusting annual income, occupation, or category filters to view broader eligibility options.</p>
          </div>

          <!-- STATE 3: SUCCESS WITH RESULTS -->
          <div *ngIf="state === 'SUCCESS' && results.length > 0">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h4 class="fw-bold mb-0" style="color: var(--gov-navy-primary);">Matching Public Schemes</h4>
                <span class="fs-7 text-muted">{{ results.length }} evaluated · {{ eligibleCount }} fully eligible</span>
              </div>
              <span class="badge bg-success px-3 py-2 fs-7">{{ eligibleCount }} Fully Eligible</span>
            </div>

            <div *ngFor="let res of results" class="gov-card p-4 mb-4">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <span class="badge bg-light text-dark border me-2">{{ res.scheme.code }}</span>
                  <span class="badge bg-navy text-white" style="background-color: var(--gov-navy-primary);">{{ res.scheme.category }}</span>
                </div>
                <div class="text-end">
                  <span class="fs-4 fw-extrabold" [ngClass]="res.match_score > 70 ? 'text-success' : 'text-warning'">{{ res.match_score }}%</span>
                  <span class="fs-7 text-muted d-block">Match Score</span>
                </div>
              </div>

              <h4 class="fw-bold text-dark mb-2">{{ res.scheme.name }}</h4>
              <p class="text-secondary small mb-3">{{ res.scheme.benefits }}</p>

              <!-- Satisfied Criteria -->
              <div class="mb-3">
                <h6 class="fs-7 text-uppercase fw-bold text-success mb-2"><i class="fa-solid fa-circle-check me-1"></i> Satisfied Criteria</h6>
                <ul class="list-unstyled mb-0 fs-7 text-secondary">
                  <li *ngFor="let reason of res.reasons" class="mb-1">
                    <i class="fa-solid fa-check text-success me-2"></i> {{ reason }}
                  </li>
                </ul>
              </div>

              <!-- Unmet Criteria -->
              <div *ngIf="res.missing_criteria.length > 0" class="mb-3">
                <h6 class="fs-7 text-uppercase fw-bold text-danger mb-2"><i class="fa-solid fa-circle-xmark me-1"></i> Unmet Criteria</h6>
                <ul class="list-unstyled mb-0 fs-7 text-secondary">
                  <li *ngFor="let miss of res.missing_criteria" class="mb-1">
                    <i class="fa-solid fa-xmark text-danger me-2"></i> {{ miss }}
                  </li>
                </ul>
              </div>

              <!-- Application Guidance Box -->
              <div class="p-3 bg-light rounded border mb-3">
                <strong class="fs-7 d-block mb-1" style="color: var(--gov-navy-primary);"><i class="fa-solid fa-circle-info me-1"></i> Application Guidance:</strong>
                <p class="mb-0 fs-7 text-muted">{{ res.application_guidance }}</p>
              </div>

              <a [href]="res.scheme.application_link || '#'" target="_blank" class="btn btn-gov-saffron btn-sm px-4">
                <i class="fa-solid fa-external-link me-1"></i> Official Portal Application
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  `
})
export class EligibilityCheckerComponent implements OnInit {
  public inputData = {
    age: null as number | null,
    gender: '',
    income_annual: null as number | null,
    occupation: '',
    education_level: '',
    location_type: 'All',
    social_category: '',
    disability_status: false,
    category: 'All'
  };

  public state: EvaluationState = 'INITIAL';
  public results: SchemeEligibilityResult[] = [];
  public eligibleCount = 0;
  public categories: any[] = [];

  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    // 1. Fetch categories for Scheme Category Filter
    this.apiService.getCategories().subscribe({
      next: (cats) => { 
        this.categories = cats || []; 
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error loading categories:', err)
    });

    // 2. Pre-fill user demographic profile if logged in
    const user = this.authService.currentUser();
    if (user) {
      if (user.age) this.inputData.age = Number(user.age);
      if (user.gender) this.inputData.gender = user.gender;
      if (user.income_annual !== null && user.income_annual !== undefined) this.inputData.income_annual = Number(user.income_annual);
      
      const validOccupations = ['Farmer', 'Student', 'Entrepreneur / Self-Employed', 'Salaried Employee', 'Unemployed', 'Retired', 'Other'];
      const profileOcc = user.occupation || '';
      if (validOccupations.includes(profileOcc)) {
        this.inputData.occupation = profileOcc;
      }

      if (user.education_level) this.inputData.education_level = user.education_level;
      if (user.social_category) this.inputData.social_category = user.social_category;
      if (user.disability_status !== undefined) this.inputData.disability_status = Boolean(user.disability_status);
    }

    // DO NOT CALL API ON MOUNT! INITIAL PAGE LOAD REMAINS IN 'INITIAL' STATE.
    this.state = 'INITIAL';
    this.cdr.detectChanges();
  }

  isFormComplete(): boolean {
    return (
      this.inputData.age !== null && this.inputData.age > 0 &&
      !!this.inputData.gender &&
      this.inputData.income_annual !== null && this.inputData.income_annual >= 0 &&
      !!this.inputData.occupation &&
      !!this.inputData.education_level &&
      !!this.inputData.social_category
    );
  }

  onFieldChange() {
    if (this.isFormComplete()) {
      this.evaluateEligibility();
    } else {
      if (this.state !== 'INITIAL') {
        this.state = 'INITIAL';
        this.results = [];
        this.eligibleCount = 0;
        this.cdr.detectChanges();
      }
    }
  }

  onCheck() {
    if (this.isFormComplete()) {
      this.evaluateEligibility();
    } else {
      alert('Please complete all required demographic fields marked with an asterisk (*).');
    }
  }

  evaluateEligibility() {
    if (!this.isFormComplete()) return;

    this.state = 'LOADING';
    this.results = [];
    this.eligibleCount = 0;
    this.cdr.detectChanges();

    const payload = {
      age: Number(this.inputData.age),
      gender: String(this.inputData.gender),
      income_annual: Number(this.inputData.income_annual),
      occupation: String(this.inputData.occupation),
      education_level: String(this.inputData.education_level),
      location_type: 'All',
      social_category: String(this.inputData.social_category),
      disability_status: Boolean(this.inputData.disability_status),
      category: this.inputData.category || 'All'
    };

    this.apiService.checkEligibility(payload).subscribe({
      next: (data) => {
        this.results = data || [];
        this.eligibleCount = this.results.filter(r => r.is_eligible).length;
        this.state = this.results.length === 0 ? 'NO_RESULTS' : 'SUCCESS';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Eligibility check error:', err);
        this.state = 'API_ERROR';
        this.cdr.detectChanges();
      }
    });
  }

  resetForm() {
    this.inputData = {
      age: null,
      gender: '',
      income_annual: null,
      occupation: '',
      education_level: '',
      location_type: 'All',
      social_category: '',
      disability_status: false,
      category: 'All'
    };
    this.state = 'INITIAL';
    this.results = [];
    this.eligibleCount = 0;
    this.cdr.detectChanges();
  }
}
