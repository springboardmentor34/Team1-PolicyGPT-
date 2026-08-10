import { Directive, ElementRef, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { AnimationService } from '../services/animation.service';

/**
 * PolicyGPT ScrollReveal Directive
 *
 * Attach [appScrollReveal] to any element to make it fade in when scrolled into view.
 *
 * @example
 *   <div appScrollReveal>...</div>
 *   <div appScrollReveal animDir="left" animDelay="2">...</div>
 *
 * @input animDir  — 'up' (default) | 'left' | 'right' | 'fade' | 'scale'
 * @input animDelay — '1'–'6', maps to CSS .anim-delay-N (60ms steps)
 */
@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  @Input() animDir: 'up' | 'left' | 'right' | 'fade' | 'scale' = 'up';
  @Input() animDelay: '1' | '2' | '3' | '4' | '5' | '6' | '' = '';

  private el = inject(ElementRef<HTMLElement>);
  private animService = inject(AnimationService);

  ngOnInit(): void {
    const host = this.el.nativeElement as HTMLElement;

    // Add base scroll-reveal class
    host.classList.add('scroll-reveal');

    // Add direction modifier if not default 'up'
    if (this.animDir === 'left')  host.classList.add('sr-left');
    if (this.animDir === 'right') host.classList.add('sr-right');
    if (this.animDir === 'fade')  host.classList.add('sr-fade');
    if (this.animDir === 'scale') host.classList.add('sr-scale');

    // Add stagger delay class
    if (this.animDelay) {
      host.classList.add(`anim-delay-${this.animDelay}`);
    }

    // Register with IntersectionObserver
    this.animService.observe(host);
  }

  ngOnDestroy(): void {
    this.animService.unobserve(this.el.nativeElement as HTMLElement);
  }
}
