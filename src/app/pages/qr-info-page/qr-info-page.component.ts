import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SuggestionsButtonComponent } from '../../components/suggestions-button/suggestions-button.component';

type GuideSlug = 'que-ver' | 'playas-cercanas' | 'como-llegar';

@Component({
  selector: 'app-qr-info-page',
  imports: [RouterLink, TranslatePipe, SuggestionsButtonComponent],
  templateUrl: './qr-info-page.component.html',
})
export class QrInfoPageComponent {
  protected readonly guideLinks: Array<{ slug: GuideSlug; key: string; }> = [
    { slug: 'que-ver', key: 'whatToVisit' },
    { slug: 'playas-cercanas', key: 'nearbyBeaches' },
    { slug: 'como-llegar', key: 'howToGetThere' },
  ];

  constructor(private readonly translate: TranslateService) { }

  protected get homeRoute(): string[] {
    const language = this.translate.currentLang || this.translate.getDefaultLang() || 'es';
    return ['/', language];
  }

  protected guideRoute(slug: GuideSlug): string[] {
    const language = this.translate.currentLang || this.translate.getDefaultLang() || 'es';
    return ['/', language, slug];
  }
}
