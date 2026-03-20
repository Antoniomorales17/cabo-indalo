import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FooterComponent } from '../../components/footer/footer.component';

type GuideKey = 'whatToVisit' | 'nearbyBeaches' | 'howToGetThere';

@Component({
  selector: 'app-local-guide-page',
  imports: [RouterLink, TranslatePipe, FooterComponent],
  templateUrl: './local-guide-page.component.html',
})
export class LocalGuidePageComponent {
  protected readonly guideKey: GuideKey;

  constructor(
    private readonly translate: TranslateService,
    private readonly route: ActivatedRoute,
  ) {
    this.guideKey = (this.route.snapshot.data['guideKey'] as GuideKey) ?? 'whatToVisit';
  }

  protected get homeRoute(): string[] {
    const language = this.translate.currentLang || this.translate.getDefaultLang() || 'es';
    return ['/', language];
  }
}

