import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { RevealOnScrollDirective } from '../../directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-cta-section',
  imports: [TranslatePipe, RevealOnScrollDirective],
  templateUrl: './cta-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtaSectionComponent { }
