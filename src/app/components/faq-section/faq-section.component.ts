import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { RevealOnScrollDirective } from '../../directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-faq-section',
  imports: [TranslatePipe, RevealOnScrollDirective],
  templateUrl: './faq-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqSectionComponent {
  protected openIndex: number | null = null;

  protected readonly faqKeys = [
    'location',
    'beach',
    'pets',
    'amenities',
    'parking',
    'shops',
    'booking',
    'activities',
  ];

  protected toggle(index: number): void {
    this.openIndex = this.openIndex === index ? null : index;
  }
}
