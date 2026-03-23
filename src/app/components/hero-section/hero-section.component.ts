import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-hero-section',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './hero-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSectionComponent {
  private readonly languageStorageKey = 'cabo-indalo-lang';

  protected isMobileMenuOpen = false;
  protected hasScrolled = false;
  protected currentLanguage = 'es';
  protected readonly languages = ['es', 'en', 'fr', 'de'];

  constructor(
    private readonly translate: TranslateService,
    private readonly router: Router,
  ) {
    this.initializeLanguage();
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    this.hasScrolled = window.scrollY > 24;
  }

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  protected closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  protected get galleryRoute(): string[] {
    return ['/', this.currentLanguage, 'galeria'];
  }

  protected get homeRoute(): string[] {
    return ['/', this.currentLanguage];
  }

  protected setLanguage(language: string, updateUrl = true): void {
    if (!this.languages.includes(language)) {
      return;
    }

    this.currentLanguage = language;
    this.translate.use(language);

    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.languageStorageKey, language);
    }

    if (updateUrl) {
      this.navigateToLanguage(language);
    }
  }

  private initializeLanguage(): void {
    const fromUrl = this.readLanguageFromUrl();
    const stored =
      typeof localStorage !== 'undefined' ? localStorage.getItem(this.languageStorageKey) : null;
    const browser =
      typeof navigator !== 'undefined' ? navigator.language.slice(0, 2).toLowerCase() : 'es';
    const initial = fromUrl
      ?? (stored && this.languages.includes(stored) ? stored : null)
      ?? (this.languages.includes(browser) ? browser : 'es');
    this.setLanguage(initial, false);
  }

  private readLanguageFromUrl(): string | null {
    const path = this.router.url.split(/[?#]/)[0];
    const firstSegment = path.split('/').filter(Boolean)[0]?.toLowerCase();
    return firstSegment && this.languages.includes(firstSegment) ? firstSegment : null;
  }

  private navigateToLanguage(language: string): void {
    const path = this.router.url.split(/[?#]/)[0];
    const segments = path.split('/').filter(Boolean);
    const cleanSegments = [...segments];

    if (cleanSegments[0] && this.languages.includes(cleanSegments[0])) {
      cleanSegments.shift();
    }

    this.router.navigate(['/', language, ...cleanSegments]);
  }
}
