import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appScrollFx]',
})
export class ScrollFxDirective implements AfterViewInit, OnDestroy {
  @Input() parallaxStrength = 24;
  @Input() scrollStart = 0;
  @Input() scrollEnd = 1;
  @Input() opacityFrom = 1;
  @Input() opacityTo = 1;

  private rafId: number | null = null;
  private onScroll?: () => void;
  private onResize?: () => void;
  private prefersReducedMotion = false;

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
  ) {}

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (this.prefersReducedMotion) {
      this.applyStyles(0, this.opacityFrom);
      return;
    }

    const element = this.elementRef.nativeElement;
    this.renderer.setStyle(element, 'will-change', 'transform, opacity');

    this.onScroll = () => this.requestTick();
    this.onResize = () => this.requestTick();

    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onResize, { passive: true });

    this.requestTick();
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      if (this.onScroll) {
        window.removeEventListener('scroll', this.onScroll);
      }

      if (this.onResize) {
        window.removeEventListener('resize', this.onResize);
      }
    }

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private requestTick(): void {
    if (this.rafId !== null) {
      return;
    }

    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.updateStyles();
    });
  }

  private updateStyles(): void {
    const element = this.elementRef.nativeElement;
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || 1;

    const rawProgress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
    const progress = this.clamp(rawProgress, 0, 1);

    const zoneProgress = this.normalize(progress, this.scrollStart, this.scrollEnd);
    const centeredProgress = zoneProgress - 0.5;

    const translateY = centeredProgress * this.parallaxStrength * -1;
    const opacity = this.opacityFrom + (this.opacityTo - this.opacityFrom) * zoneProgress;

    this.applyStyles(translateY, opacity);
  }

  private applyStyles(translateY: number, opacity: number): void {
    const element = this.elementRef.nativeElement;
    this.renderer.setStyle(element, 'transform', `translate3d(0, ${translateY.toFixed(2)}px, 0)`);
    this.renderer.setStyle(element, 'opacity', `${this.clamp(opacity, 0, 1).toFixed(3)}`);
  }

  private normalize(value: number, start: number, end: number): number {
    if (end <= start) {
      return 0;
    }

    return this.clamp((value - start) / (end - start), 0, 1);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
}
