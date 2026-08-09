import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="bg-dark text-light pt-5 pb-4 mt-5 border-top border-warning border-2" style="background-color: #060e1a !important;">
      <div class="container">
        <div class="row g-4">
          <div class="col-lg-4 col-md-6">
            <div class="d-flex align-items-center mb-3">
              <div class="text-white rounded-2 d-flex align-items-center justify-content-center me-2" style="width: 32px; height: 32px; background-color: var(--gov-saffron);">
                <i class="fa-solid fa-shield-halved fs-6"></i>
              </div>
              <h5 class="text-white mb-0 fw-bold">PolicyGPT</h5>
            </div>
            <p class="text-secondary small mb-3">
              Government Policy & Public Scheme Intelligence Platform. A centralized platform designed to make government policies and public welfare scheme information easier to discover and understand.
            </p>
            <div class="d-flex gap-3 text-secondary">
              <a href="#" class="text-light text-decoration-none"><i class="fa-brands fa-x-twitter"></i></a>
              <a href="#" class="text-light text-decoration-none"><i class="fa-brands fa-linkedin"></i></a>
              <a href="#" class="text-light text-decoration-none"><i class="fa-brands fa-facebook"></i></a>
            </div>
          </div>

          <div class="col-lg-2 col-md-6">
            <h6 class="text-warning text-uppercase fs-7 fw-bold mb-3">Platform</h6>
            <ul class="list-unstyled text-secondary small">
              <li class="mb-2"><a routerLink="/" class="text-decoration-none text-light">Home</a></li>
              <li class="mb-2"><a routerLink="/feedback" class="text-decoration-none text-light">Help & FAQs</a></li>
              <li class="mb-2"><a routerLink="/login" class="text-decoration-none text-light">Sign In</a></li>
              <li class="mb-2"><a routerLink="/register" class="text-decoration-none text-light">Sign Up</a></li>
            </ul>
          </div>

          <div class="col-lg-3 col-md-6">
            <h6 class="text-warning text-uppercase fs-7 fw-bold mb-3">Government Portals</h6>
            <ul class="list-unstyled text-secondary small">
              <li class="mb-2"><a href="https://india.gov.in" target="_blank" class="text-decoration-none text-light"><i class="fa-solid fa-arrow-up-right-from-square me-1 fs-7"></i> India National Portal</a></li>
              <li class="mb-2"><a href="https://pmkisan.gov.in" target="_blank" class="text-decoration-none text-light"><i class="fa-solid fa-arrow-up-right-from-square me-1 fs-7"></i> PM-KISAN Portal</a></li>
              <li class="mb-2"><a href="https://pmjay.gov.in" target="_blank" class="text-decoration-none text-light"><i class="fa-solid fa-arrow-up-right-from-square me-1 fs-7"></i> Ayushman Bharat PM-JAY</a></li>
              <li class="mb-2"><a href="https://scholarships.gov.in" target="_blank" class="text-decoration-none text-light"><i class="fa-solid fa-arrow-up-right-from-square me-1 fs-7"></i> National Scholarship Portal</a></li>
            </ul>
          </div>

          <div class="col-lg-3 col-md-6">
            <h6 class="text-warning text-uppercase fs-7 fw-bold mb-3">Contact & Support</h6>
            <p class="text-secondary small mb-1"><i class="fa-solid fa-location-dot me-2 text-warning"></i> CGO Complex, Lodhi Road, New Delhi</p>
            <p class="text-secondary small mb-1"><i class="fa-solid fa-envelope me-2 text-warning"></i> support&#64;policygpt.gov.in</p>
            <p class="text-secondary small"><i class="fa-solid fa-phone me-2 text-warning"></i> Helpline: 1800-11-2024</p>
          </div>
        </div>

        <hr class="border-secondary opacity-25 my-4">

        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-center text-secondary small">
          <div>© 2026 PolicyGPT Platform. Designed for Government Policy & Public Scheme Intelligence.</div>
          <div class="d-flex gap-3">
            <a href="javascript:void(0)" class="text-secondary text-decoration-none">Terms of Service</a>
            <a href="javascript:void(0)" class="text-secondary text-decoration-none">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
