import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RevealOnScrollDirective } from '../../directives/reveal-on-scroll.directive';

type GuideSlug = 'que-ver' | 'playas-cercanas' | 'como-llegar';

@Component({
  selector: 'app-local-guides-section',
  imports: [RouterLink, TranslatePipe, RevealOnScrollDirective],
  templateUrl: './local-guides-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalGuidesSectionComponent {
  protected readonly guides: Array<{ slug: GuideSlug; key: string }> = [
    { slug: 'que-ver', key: 'whatToVisit' },
    { slug: 'playas-cercanas', key: 'nearbyBeaches' },
    { slug: 'como-llegar', key: 'howToGetThere' },
  ];

  constructor(private readonly translate: TranslateService) {}

  protected guideRoute(slug: GuideSlug): string[] {
    const language = this.translate.currentLang || this.translate.getDefaultLang() || 'es';
    return ['/', language, slug];
  }
}

