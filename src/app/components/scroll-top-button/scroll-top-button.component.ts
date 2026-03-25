import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-scroll-top-button',
  imports: [TranslatePipe],
  template: `
    @if (isVisible) {
      <button
        type="button"
        class="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-[var(--sea-dark)] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:bg-[var(--sea)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sea-dark)] focus-visible:ring-offset-2"
        (click)="scrollToTop()"
        [attr.aria-label]="'nav.backToTop' | translate"
      >
        {{ 'nav.backToTop' | translate }}
      </button>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollTopButtonComponent {
  protected isVisible = false;

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    this.isVisible = typeof window !== 'undefined' && window.scrollY > 320;
  }

  protected scrollToTop(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
