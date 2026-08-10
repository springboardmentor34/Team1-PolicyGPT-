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
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              // Unobserve after revealing to save memory — animate once
              this.observer?.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin: '0px 0px -36px 0px',
        }
      );
    }
  }

  /** Register an element to be watched for scroll-reveal. */
  observe(el: HTMLElement): void {
    this.observer?.observe(el);
  }

  /** Remove an element from the observer (call on destroy). */
  unobserve(el: HTMLElement): void {
    this.observer?.unobserve(el);
  }
}
