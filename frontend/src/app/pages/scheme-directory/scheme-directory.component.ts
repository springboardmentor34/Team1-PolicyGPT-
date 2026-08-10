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
  public allSchemes: Scheme[] = [
    {
      id: 1,
      name: 'PM-KISAN Samman Nidhi Scheme',
      code: 'SCH-AGRI-001',
      category: 'Farmer Welfare',
      description: 'Direct income support scheme providing ₹6,000 per year to landholding farmer families across the country in three equal quadruply installments.',
      benefits: '₹6,000 direct benefit transfer (DBT) annually into bank accounts, free soil testing cards, and 50% seed subsidy.',
      financial_assistance: '₹6,000 per year',
      target_group: 'Small and marginal landholding farmers',
      application_process: 'Apply online at PM-KISAN portal with Aadhaar card, land ownership certificate, and bank account details.',
      application_link: 'https://pmkisan.gov.in',
      status: 'Active',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
      code: 'SCH-HLTH-002',
      category: 'Healthcare',
      description: 'World\'s largest health insurance scheme providing health cover of ₹5 Lakhs per family per year for secondary and tertiary care hospitalization.',
      benefits: 'Cashless and paperless access to healthcare services at empaneled public and private hospitals nationwide.',
      financial_assistance: 'Up to ₹500,000 coverage/year',
      target_group: 'Low-income households identified via SECC database',
      application_process: 'Check eligibility online, visit nearest Ayushman Mitra center with Golden Card or ration card.',
      application_link: 'https://pmjay.gov.in',
      status: 'Active',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Post-Matric Scholarship for Higher Education',
      code: 'SCH-EDU-003',
      category: 'Scholarships',
      description: 'Financial scholarship assistance to students belonging to SC/ST/OBC and economically weaker sections pursuing post-secondary studies.',
      benefits: '100% tuition fee reimbursement + monthly maintenance allowance up to ₹1,200/month.',
      financial_assistance: 'Full tuition + Maintenance stipend',
      target_group: 'Students pursuing Diploma, UG, or PG degrees',
      application_process: 'Submit application through National Scholarship Portal (NSP) with income certificate and marksheets.',
      application_link: 'https://scholarships.gov.in',
      status: 'Active',
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Pradhan Mantri Awas Yojana (Urban & Rural)',
      code: 'SCH-HOUS-004',
      category: 'Housing',
      description: 'Central credit-linked subsidy scheme providing interest subvention and financial grant for building new pucca homes or upgrading existing houses.',
      benefits: 'Direct grant of ₹1.20 Lakhs to ₹2.67 Lakhs interest subvention on home loans.',
      financial_assistance: 'Grant up to ₹2.67 Lakhs',
      target_group: 'EWS, LIG, and MIG families without pucca house',
      application_process: 'Apply via PMAY online portal or CSC center with Aadhaar and income proof.',
      application_link: 'https://pmaymis.gov.in',
      status: 'Active',
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      name: 'Mudra Yojana & Stand Up Women Entrepreneur Grant',
      code: 'SCH-BUS-005',
      category: 'Business Support',
      description: 'Micro-credit scheme offering loans up to ₹10 Lakhs without collateral for non-corporate, non-farm micro/small enterprises.',
      benefits: 'Collateral-free business loans, low interest rates (7.5%), and 3-year moratorium period.',
      financial_assistance: 'Loans up to ₹1,000,000',
      target_group: 'Women entrepreneurs, self-employed artisans, micro-businesses',
      application_process: 'Apply through any commercial bank, RRB, or Udyamimitra online portal.',
      application_link: 'https://mudra.org.in',
      status: 'Active',
      created_at: new Date().toISOString()
    }
  ];

  public filteredSchemes: Scheme[] = [...this.allSchemes];
  public categories: any[] = [];
  public searchQuery = '';
  public selectedCategory = '';

  private apiService = inject(ApiService);

  ngOnInit() {
    this.apiService.getCategories().subscribe(cats => this.categories = cats || []);
    this.apiService.getSchemes().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.allSchemes = data;
          this.filteredSchemes = data;
        }
      }
    });
  }

  applyFilters() {
    this.filteredSchemes = this.allSchemes.filter(s => {
      const matchQuery = !this.searchQuery ||
        s.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchCat = !this.selectedCategory || s.category === this.selectedCategory;
      return matchQuery && matchCat;
    });
  }
}
