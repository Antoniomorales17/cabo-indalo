import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
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

  constructor(private readonly translate: TranslateService) {
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

  protected setLanguage(language: string): void {
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
  }

  private initializeLanguage(): void {
    const stored =
      typeof localStorage !== 'undefined' ? localStorage.getItem(this.languageStorageKey) : null;
    const browser =
      typeof navigator !== 'undefined' ? navigator.language.slice(0, 2).toLowerCase() : 'es';
    const initial = stored && this.languages.includes(stored) ? stored : this.languages.includes(browser) ? browser : 'es';
    this.setLanguage(initial);
  }
}
