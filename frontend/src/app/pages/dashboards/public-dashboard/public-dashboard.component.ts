import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Policy, Scheme } from '../../../core/models/models';

@Component({
  selector: 'app-public-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Hero Banner Section -->
    <div class="text-white py-5 position-relative overflow-hidden" style="background: linear-gradient(135deg, #0b192c 0%, #1e3e62 100%); border-bottom: 3px solid var(--gov-saffron);">
      <div class="container py-4">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <span class="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-3">
              <i class="fa-solid fa-landmark me-1"></i> PUBLIC INFORMATION PORTAL
            </span>
            <h1 class="display-5 text-white fw-bold mb-3">Government Policy & Public Scheme Intelligence</h1>
            <p class="lead text-light opacity-90 mb-4" style="max-width: 680px;">
              Discover trusted information about government policies and public welfare schemes through one centralized platform.
            </p>
            <div class="d-flex flex-wrap gap-3">
              <a routerLink="/login" class="btn btn-gov-saffron btn-lg px-4">
                <i class="fa-solid fa-right-to-bracket me-2"></i> Sign In
              </a>
              <a routerLink="/register" class="btn btn-gov-outline btn-lg px-4 text-white border-white">
                <i class="fa-solid fa-user-plus me-2"></i> Create Account
              </a>
            </div>
          </div>
          <div class="col-lg-4 d-none d-lg-block text-center">
            <div class="p-4 rounded-3 bg-white text-dark shadow-sm border border-light">
              <i class="fa-solid fa-shield-halved text-primary fs-1 mb-3" style="color: var(--gov-navy-primary) !important;"></i>
              <h4 class="fw-bold mb-2" style="color: var(--gov-navy-primary);">Institutional Intelligence</h4>
              <p class="small text-muted mb-0">Structured policy directives, scheme benefit guidelines, and direct access for verified roles.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container py-5">

      <!-- Featured Government Schemes Section -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1" style="color: var(--gov-navy-primary);">Featured Government Schemes</h3>
          <p class="text-muted small mb-0">Preview of key central and state welfare initiatives.</p>
        </div>
        <button (click)="navigateToLogin()" class="btn btn-gov-outline btn-sm">Sign in to view all schemes <i class="fa-solid fa-arrow-right ms-1 fs-7"></i></button>
      </div>

      <div class="row g-4 mb-5">
        <div *ngFor="let scheme of schemes" class="col-md-6 col-lg-4">
          <div class="gov-card h-100 p-4 d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex justify-content-between align-items-start mb-3">
                <span class="badge bg-light text-dark border px-2 py-1 fs-7 fw-semibold">{{ scheme.category }}</span>
                <span class="badge bg-success-subtle text-success fs-7">{{ scheme.status }}</span>
              </div>
              <h5 class="fw-bold mb-2 text-dark">{{ scheme.name }}</h5>
              <p class="text-secondary small mb-3">{{ scheme.description | slice:0:110 }}...</p>
              
              <div class="p-3 bg-light rounded mb-3">
                <span class="fs-7 text-muted d-block fw-semibold">Key Assistance:</span>
                <span class="fw-semibold text-dark fs-7"><i class="fa-solid fa-indian-rupee-sign me-1 text-success"></i>{{ scheme.benefits }}</span>
              </div>
            </div>
            
            <button (click)="navigateToLogin()" class="btn btn-gov-navy btn-sm w-100">
              <i class="fa-solid fa-lock me-1 fs-7"></i> Sign in to view details
            </button>
          </div>
        </div>
      </div>

      <!-- Latest Government Policies Section -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1" style="color: var(--gov-navy-primary);">Latest Government Policies</h3>
          <p class="text-muted small mb-0">Official directives and regulatory circulars published by Ministries.</p>
        </div>
        <button (click)="navigateToLogin()" class="btn btn-gov-outline btn-sm">Sign in to search policies <i class="fa-solid fa-arrow-right ms-1 fs-7"></i></button>
      </div>

      <div class="row g-4 mb-5">
        <div *ngFor="let policy of policies" class="col-md-6 col-lg-4">
          <div class="gov-card h-100 p-4 d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge bg-light text-dark border fs-7">{{ policy.category }}</span>
                <span class="fs-7 text-muted"><i class="fa-solid fa-eye me-1"></i> {{ policy.view_count }}</span>
              </div>
              <h5 class="fw-bold mb-2 text-dark">{{ policy.title }}</h5>
              <p class="text-secondary small mb-3">{{ policy.summary || (policy.description | slice:0:120) }}...</p>
              
              <div class="fs-7 text-muted mb-3">
                <i class="fa-solid fa-building me-1"></i> {{ policy.ministry }}
              </div>
            </div>

            <button (click)="navigateToLogin()" class="btn btn-gov-outline btn-sm w-100">
              <i class="fa-solid fa-lock me-1 fs-7"></i> Sign in to view directive
            </button>
          </div>
        </div>
      </div>

      <!-- About PolicyGPT Section -->
      <div class="gov-card p-5 mb-5 bg-white border border-light">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <h3 class="fw-bold mb-3" style="color: var(--gov-navy-primary);">About PolicyGPT</h3>
            <p class="text-secondary mb-3">
              PolicyGPT is a centralized platform designed to make government policies and public welfare scheme information easier to discover and understand.
            </p>
            <p class="text-secondary small mb-0">
              Built for citizens, government officials, academic researchers, and enterprise organizations to streamline access to official notifications, comparative scheme evaluation, and demographic eligibility matching.
            </p>
          </div>
          <div class="col-lg-4 text-center mt-4 mt-lg-0 border-start ps-lg-4">
            <h5 class="fw-bold text-dark mb-2">Ready to Get Started?</h5>
            <p class="text-muted small mb-3">Access full policy search, scheme comparison, and eligibility tools.</p>
            <a routerLink="/register" class="btn btn-gov-saffron w-100 rounded-2">Create Account</a>
          </div>
        </div>
      </div>

      <!-- Help / FAQ Link Bar -->
      <div class="p-4 rounded-3 text-white d-flex flex-column flex-md-row justify-content-between align-items-center" style="background-color: var(--gov-navy-primary);">
        <div>
          <h5 class="fw-bold text-white mb-1"><i class="fa-solid fa-circle-question me-2 text-warning"></i> Need Help or Have Inquiries?</h5>
          <p class="text-light opacity-75 small mb-0">Browse our Helpdesk FAQs or submit a policy query ticket.</p>
        </div>
        <a routerLink="/feedback" class="btn btn-gov-saffron btn-sm mt-3 mt-md-0 px-4">
          Visit Help & FAQs <i class="fa-solid fa-arrow-right ms-1"></i>
        </a>
      </div>

    </div>
  `
})
export class PublicDashboardComponent implements OnInit {
  public schemes: Scheme[] = [];
  public policies: Policy[] = [];
  
  private apiService = inject(ApiService);
  private router = inject(Router);

  ngOnInit() {
    // Load real records from PostgreSQL API (3 schemes, 3 policies)
    this.apiService.getSchemes().subscribe(data => this.schemes = data.slice(0, 3));
    this.apiService.getPolicies({ status: 'PUBLISHED' }).subscribe(data => this.policies = data.slice(0, 3));
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
