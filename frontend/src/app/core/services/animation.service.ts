import { Injectable } from '@angular/core';

/**
 * PolicyGPT AnimationService
 *
 * Provides a single shared IntersectionObserver that adds `.is-visible`
 * to any registered element when it enters the viewport.
 *
 * Usage: inject and call observe(el) / unobserve(el).
 * The ScrollRevealDirective handles this automatically via [appScrollReveal].
 */
@Injectable({ providedIn: 'root' })
export class AnimationService {
  private observer: IntersectionObserver | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting || entry.intersectionRatio > 0) {
              entry.target.classList.add('is-visible');
              this.observer?.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.01,
          rootMargin: '0px 0px 100px 0px',
        }
      );
    }
  }

  /** Register an element to be watched for scroll-reveal. */
  observe(el: HTMLElement): void {
    if (!this.observer) {
      el.classList.add('is-visible');
      return;
    }
    this.observer.observe(el);

    // Instant viewport check to ensure elements visible on screen get revealed immediately
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 100 && rect.bottom > -50) {
          el.classList.add('is-visible');
        }
      });
    }
  }

  /** Remove an element from the observer (call on destroy). */
  unobserve(el: HTMLElement): void {
    this.observer?.unobserve(el);
  }
}
