import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Policy, Scheme } from '../../../core/models/models';
import { ScrollRevealDirective } from '../../../core/directives/scroll-reveal.directive';

@Component({
  selector: 'app-public-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ScrollRevealDirective],
  template: `
    <!-- Hero Banner Section -->
    <div class="text-white position-relative overflow-hidden d-flex align-items-center"
         style="background: linear-gradient(135deg, #0b192c 0%, #1e3e62 60%, #0b2d52 100%);
                border-bottom: 3px solid var(--gov-saffron);
                min-height: calc(100vh - 72px);">

      <!-- Decorative background glow circles -->
      <div style="position:absolute;width:600px;height:600px;border-radius:50%;
                  background:radial-gradient(circle,rgba(217,119,6,0.10) 0%,transparent 70%);
                  top:-150px;right:-100px;pointer-events:none;"></div>
      <div style="position:absolute;width:400px;height:400px;border-radius:50%;
                  background:radial-gradient(circle,rgba(30,62,98,0.5) 0%,transparent 70%);
                  bottom:-80px;left:-60px;pointer-events:none;"></div>

      <div class="container py-5">
        <div class="row align-items-center g-5">
          <div class="col-lg-7">
            <span class="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-4 hero-badge d-inline-block">
              <i class="fa-solid fa-landmark me-1"></i> PUBLIC INFORMATION PORTAL
            </span>
            <h1 class="display-4 text-white fw-bold mb-4 hero-title lh-sm">Government Policy &amp; Public Scheme Intelligence</h1>
            <p class="lead text-light opacity-90 mb-5 hero-desc" style="max-width: 600px; font-size: 1.15rem;">
              Discover trusted information about government policies and public welfare schemes through one centralized platform.
            </p>
            <div class="d-flex flex-wrap gap-3 mb-5 hero-actions">
              <a routerLink="/login" class="btn btn-gov-saffron btn-lg px-5 py-3">
                <i class="fa-solid fa-right-to-bracket me-2"></i> Sign In
              </a>
              <a routerLink="/register" class="btn btn-gov-outline btn-lg px-5 py-3 text-white border-white">
                <i class="fa-solid fa-user-plus me-2"></i> Create Account
              </a>
            </div>
            <!-- Trust badges row -->
            <div class="d-flex flex-wrap gap-4 text-light opacity-75">
              <span class="small"><i class="fa-solid fa-shield-check me-1 text-warning"></i> Secure & Verified</span>
              <span class="small"><i class="fa-solid fa-landmark me-1 text-warning"></i> Government of India</span>
              <span class="small"><i class="fa-solid fa-users me-1 text-warning"></i> 5+ User Roles Supported</span>
            </div>
          </div>
          <div class="col-lg-5 d-none d-lg-block">
            <div class="hero-card">
              <!-- Main Feature Card -->
              <div class="p-5 rounded-4 text-dark shadow-lg border-0 mb-4"
                   style="background: rgba(255,255,255,0.97); backdrop-filter: blur(12px);">
                <div class="text-center mb-4">
                  <div class="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
                       style="width:64px;height:64px;background:linear-gradient(135deg,#0b192c,#1e3e62);">
                    <i class="fa-solid fa-shield-halved text-white fs-3"></i>
                  </div>
                  <h4 class="fw-bold mb-2" style="color: var(--gov-navy-primary);">Institutional Intelligence</h4>
                  <p class="small text-muted mb-0">Structured policy directives, scheme benefit guidelines, and direct access for verified roles.</p>
                </div>
                <hr class="my-3">
                <div class="row text-center g-3">
                  <div class="col-4">
                    <div class="fw-bold fs-5" style="color:var(--gov-navy-primary);">50+</div>
                    <div class="text-muted" style="font-size:0.75rem;">Policies</div>
                  </div>
                  <div class="col-4">
                    <div class="fw-bold fs-5" style="color:var(--gov-saffron);">5</div>
                    <div class="text-muted" style="font-size:0.75rem;">User Roles</div>
                  </div>
                  <div class="col-4">
                    <div class="fw-bold fs-5" style="color:#059669;">Live</div>
                    <div class="text-muted" style="font-size:0.75rem;">Database</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Latest Schemes Horizontal Marquee Ticker Section -->
    <div class="scheme-ticker-section d-flex align-items-stretch" *ngIf="allSchemes.length > 0">
      <div class="scheme-ticker-label">
        <i class="fa-solid fa-bullhorn me-1"></i>
        <span>Latest Schemes</span>
      </div>
      <div class="scheme-ticker-track-wrap">
        <div class="scheme-ticker-track">
          <ng-container *ngFor="let scheme of duplicatedTickerSchemes">
            <a (click)="onSchemeClick(scheme, $event)" class="scheme-ticker-item">
              <span class="ticker-dot"></span>
              <span class="ticker-category">[{{ scheme.category || 'Welfare' }}]</span>
              <strong class="text-white">{{ scheme.name }}</strong>
              <span class="opacity-75 small ms-1" *ngIf="scheme.benefits">- {{ scheme.benefits | slice:0:40 }}</span>
            </a>
            <span class="scheme-ticker-divider">•</span>
          </ng-container>
        </div>
      </div>
    </div>

    <div class="container py-5">

      <!-- Featured Government Schemes Section -->
      <div appScrollReveal class="mb-5">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div>
            <span class="d-block text-uppercase fw-bold mb-1" style="color:var(--gov-saffron);font-size:0.78rem;letter-spacing:0.09em;"><i class="fa-solid fa-hand-holding-hand me-1"></i> Welfare Schemes</span>
            <h2 class="fw-bold mb-1" style="color: var(--gov-navy-primary); font-size:1.75rem;">Featured Government Schemes</h2>
            <p class="text-muted mb-0">Preview of key central and state welfare initiatives.</p>
          </div>
          <button (click)="navigateToLogin()" class="btn btn-gov-outline btn-sm d-none d-md-inline-flex align-items-center gap-1">
            View all schemes <i class="fa-solid fa-arrow-right fs-7"></i>
          </button>
        </div>
      </div>

      <div class="row g-4 mb-5">
        <div *ngFor="let scheme of schemes; let i = index" class="col-md-6 col-lg-4">
          <div appScrollReveal [animDelay]="getDelay(i)" class="gov-card h-100 p-0 d-flex flex-column overflow-hidden">
            <!-- Card colour accent top bar -->
            <div style="height:4px;background:linear-gradient(90deg,var(--gov-navy-primary),var(--gov-saffron));"></div>
            <div class="p-4 d-flex flex-column flex-grow-1">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <span class="badge bg-light text-dark border px-2 py-1 fs-7 fw-semibold">{{ scheme.category }}</span>
                <span class="badge bg-success-subtle text-success fs-7">{{ scheme.status }}</span>
              </div>
              <h5 class="fw-bold mb-2 text-dark">{{ scheme.name }}</h5>
              <p class="text-secondary small mb-4 flex-grow-1">{{ scheme.description | slice:0:120 }}...</p>

              <div class="p-3 rounded-3 mb-3" style="background:rgba(11,25,44,0.04);border-left:3px solid var(--gov-saffron);">
                <span class="fs-7 text-muted d-block fw-semibold mb-1">Key Assistance:</span>
                <span class="fw-semibold text-dark fs-7"><i class="fa-solid fa-indian-rupee-sign me-1 text-success"></i>{{ scheme.benefits }}</span>
              </div>

              <button (click)="navigateToLogin()" class="btn btn-gov-navy btn-sm w-100 mt-auto">
                <i class="fa-solid fa-lock me-1 fs-7"></i> Sign in to view details
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Latest Government Policies Section -->
      <div appScrollReveal class="mb-5">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div>
            <span class="d-block text-uppercase fw-bold mb-1" style="color:var(--gov-saffron);font-size:0.78rem;letter-spacing:0.09em;"><i class="fa-solid fa-file-shield me-1"></i> Policy Directives</span>
            <h2 class="fw-bold mb-1" style="color: var(--gov-navy-primary); font-size:1.75rem;">Latest Government Policies</h2>
            <p class="text-muted mb-0">Official directives and regulatory circulars published by Ministries.</p>
          </div>
          <button (click)="navigateToLogin()" class="btn btn-gov-outline btn-sm d-none d-md-inline-flex align-items-center gap-1">
            Search policies <i class="fa-solid fa-arrow-right fs-7"></i>
          </button>
        </div>
      </div>

      <div class="row g-4 mb-5">
        <div *ngFor="let policy of policies; let i = index" class="col-md-6 col-lg-4">
          <div appScrollReveal [animDelay]="getDelay(i)" class="gov-card h-100 p-0 d-flex flex-column overflow-hidden">
            <div style="height:4px;background:linear-gradient(90deg,var(--gov-saffron),var(--gov-navy-primary));"></div>
            <div class="p-4 d-flex flex-column flex-grow-1">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="badge bg-light text-dark border fs-7">{{ policy.category }}</span>
                <span class="fs-7 text-muted"><i class="fa-solid fa-eye me-1"></i> {{ policy.view_count }}</span>
              </div>
              <h5 class="fw-bold mb-2 text-dark">{{ policy.title }}</h5>
              <p class="text-secondary small mb-3 flex-grow-1">{{ policy.summary || (policy.description | slice:0:130) }}...</p>

              <div class="d-flex align-items-center gap-2 py-2 border-top mb-3">
                <i class="fa-solid fa-building text-muted fs-7"></i>
                <span class="fs-7 text-muted">{{ policy.ministry }}</span>
              </div>

              <button (click)="navigateToLogin()" class="btn btn-gov-outline btn-sm w-100">
                <i class="fa-solid fa-lock me-1 fs-7"></i> Sign in to view directive
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- About PolicyGPT Section -->
      <div appScrollReveal animDir="fade" class="gov-card p-5 mb-5 overflow-hidden position-relative" style="border:none;background:linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%);">
        <!-- decorative element -->
        <div style="position:absolute;right:-40px;top:-40px;width:200px;height:200px;border-radius:50%;background:rgba(11,25,44,0.04);pointer-events:none;"></div>
        <div class="row align-items-center g-4">
          <div class="col-lg-7">
            <span class="d-block text-uppercase fw-bold mb-2" style="color:var(--gov-saffron);font-size:0.78rem;letter-spacing:0.09em;"><i class="fa-solid fa-circle-info me-1"></i> About the Platform</span>
            <h2 class="fw-bold mb-3" style="color: var(--gov-navy-primary);">About PolicyGPT</h2>
            <p class="text-secondary mb-4">
              PolicyGPT is a centralized platform designed to make government policies and public welfare scheme information easier to discover and understand.
            </p>
            <div class="row g-3">
              <div class="col-6">
                <div class="d-flex align-items-start gap-2">
                  <i class="fa-solid fa-magnifying-glass text-warning mt-1"></i>
                  <div><div class="fw-semibold text-dark small">Intelligent Search</div><div class="text-muted" style="font-size:0.8rem;">Across policies & ministries</div></div>
                </div>
              </div>
              <div class="col-6">
                <div class="d-flex align-items-start gap-2">
                  <i class="fa-solid fa-code-compare text-warning mt-1"></i>
                  <div><div class="fw-semibold text-dark small">Scheme Comparison</div><div class="text-muted" style="font-size:0.8rem;">Side-by-side analysis</div></div>
                </div>
              </div>
              <div class="col-6">
                <div class="d-flex align-items-start gap-2">
                  <i class="fa-solid fa-user-check text-warning mt-1"></i>
                  <div><div class="fw-semibold text-dark small">Eligibility Checker</div><div class="text-muted" style="font-size:0.8rem;">Instant match scoring</div></div>
                </div>
              </div>
              <div class="col-6">
                <div class="d-flex align-items-start gap-2">
                  <i class="fa-solid fa-file-export text-warning mt-1"></i>
                  <div><div class="fw-semibold text-dark small">PDF &amp; Excel Export</div><div class="text-muted" style="font-size:0.8rem;">Official report generation</div></div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-5">
            <div class="p-4 rounded-4 text-center" style="background:var(--gov-navy-primary);">
              <div class="d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style="width:56px;height:56px;background:rgba(255,255,255,0.12);">
                <i class="fa-solid fa-shield-halved text-white fs-4"></i>
              </div>
              <h5 class="fw-bold text-white mb-2">Ready to Get Started?</h5>
              <p class="text-light opacity-75 small mb-4">Access full policy search, scheme comparison, and eligibility tools.</p>
              <a routerLink="/register" class="btn btn-gov-saffron w-100 fw-bold rounded-3"><i class="fa-solid fa-user-plus me-2"></i>Create Free Account</a>
              <div class="mt-3">
                <a routerLink="/login" class="text-warning text-decoration-none small fw-semibold">Already have an account? Sign In →</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Help / FAQ Link Bar -->
      <div appScrollReveal animDir="up" class="rounded-4 text-white py-5 px-4 px-md-5 d-flex flex-column flex-md-row justify-content-between align-items-center gap-4"
           style="background: linear-gradient(135deg, var(--gov-navy-primary) 0%, #1e3e62 100%); border-left: 5px solid var(--gov-saffron);">
        <div>
          <h4 class="fw-bold text-white mb-2"><i class="fa-solid fa-circle-question me-2 text-warning"></i> Need Help or Have Inquiries?</h4>
          <p class="text-light opacity-75 mb-0">Browse our Helpdesk FAQs or submit a policy query ticket. Available 24×7.</p>
        </div>
        <a routerLink="/feedback" class="btn btn-gov-saffron px-5 py-3 fw-bold text-nowrap flex-shrink-0">
          Visit Help &amp; FAQs <i class="fa-solid fa-arrow-right ms-2"></i>
        </a>
      </div>

    </div>

    <!-- Interactive Scheme Details Modal -->
    <div *ngIf="selectedScheme" class="modal fade show d-block" style="background: rgba(0,0,0,0.65); z-index: 1055;" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header text-white p-4" style="background: linear-gradient(135deg, var(--gov-navy-primary), #1e3e62);">
            <div>
              <span class="badge bg-warning text-dark px-3 py-1 fs-7 fw-bold mb-2">{{ selectedScheme.category || 'Welfare' }}</span>
              <h4 class="modal-title fw-bold text-white mb-0">{{ selectedScheme.name }}</h4>
            </div>
            <button type="button" (click)="closeModal()" class="btn-close btn-close-white"></button>
          </div>
          <div class="modal-body p-4 bg-light">
            <div class="gov-card p-4 bg-white mb-3">
              <h6 class="fw-bold text-dark mb-2"><i class="fa-solid fa-align-left me-2 text-primary"></i> Scheme Overview</h6>
              <p class="text-secondary small mb-0">{{ selectedScheme.description }}</p>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-6" *ngIf="selectedScheme.benefits">
                <div class="gov-card p-3 bg-white h-100 border-start border-4 border-success">
                  <span class="fs-7 text-muted d-block fw-semibold mb-1"><i class="fa-solid fa-hand-holding-dollar text-success me-1"></i> Key Assistance / Benefits:</span>
                  <span class="fw-bold text-dark fs-7">{{ selectedScheme.benefits }}</span>
                </div>
              </div>
              <div class="col-md-6" *ngIf="selectedScheme.target_group">
                <div class="gov-card p-3 bg-white h-100 border-start border-4 border-info">
                  <span class="fs-7 text-muted d-block fw-semibold mb-1"><i class="fa-solid fa-users text-info me-1"></i> Target Group:</span>
                  <span class="fw-bold text-dark fs-7">{{ selectedScheme.target_group }}</span>
                </div>
              </div>
            </div>

            <div class="gov-card p-3 bg-white mb-2" *ngIf="selectedScheme.application_process">
              <span class="fs-7 text-muted d-block fw-semibold mb-1"><i class="fa-solid fa-list-check text-warning me-1"></i> Application Procedure:</span>
              <p class="text-secondary small mb-0">{{ selectedScheme.application_process }}</p>
            </div>
          </div>
          <div class="modal-footer bg-white p-3 d-flex justify-content-between align-items-center">
            <a *ngIf="selectedScheme.application_link" [href]="selectedScheme.application_link" target="_blank" class="btn btn-outline-primary btn-sm">
              <i class="fa-solid fa-arrow-up-right-from-square me-1"></i> Official Government Portal
            </a>
            <div class="d-flex gap-2 ms-auto">
              <button (click)="closeModal()" class="btn btn-light btn-sm px-3">Close</button>
              <button (click)="navigateToLogin()" class="btn btn-gov-saffron btn-sm px-4 fw-bold">
                <i class="fa-solid fa-right-to-bracket me-1"></i> Sign In to Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PublicDashboardComponent implements OnInit {
  public schemes: Scheme[] = [];
  public policies: Policy[] = [];
  public allSchemes: Scheme[] = [];
  public selectedScheme: Scheme | null = null;
  
  private apiService = inject(ApiService);
  private router = inject(Router);

  ngOnInit() {
    // Load real scheme and policy records from PostgreSQL API
    this.apiService.getSchemes().subscribe(data => {
      this.allSchemes = data || [];
      this.schemes = this.allSchemes.slice(0, 3);
    });
    this.apiService.getPolicies({ status: 'PUBLISHED' }).subscribe(data => {
      this.policies = (data || []).slice(0, 3);
    });
  }

  /** Multiplies schemes to ensure smooth seamless 360 loop in ticker */
  get duplicatedTickerSchemes(): Scheme[] {
    if (!this.allSchemes || this.allSchemes.length === 0) return [];
    return [...this.allSchemes, ...this.allSchemes, ...this.allSchemes, ...this.allSchemes];
  }

  onSchemeClick(scheme: Scheme, event: Event) {
    event.preventDefault();
    this.selectedScheme = scheme;
  }

  closeModal() {
    this.selectedScheme = null;
  }

  navigateToLogin() {
    this.selectedScheme = null;
    this.router.navigate(['/login']);
  }

  /** Maps index 0–5 to valid delay string '1'–'6' */
  getDelay(i: number): '1' | '2' | '3' | '4' | '5' | '6' | '' {
    const delays: ('1' | '2' | '3' | '4' | '5' | '6')[] = ['1', '2', '3', '4', '5', '6'];
    return delays[i] ?? '';
  }
}

