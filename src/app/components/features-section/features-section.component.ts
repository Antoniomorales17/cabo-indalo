import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { RevealOnScrollDirective } from '../../directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-features-section',
  imports: [TranslatePipe, RevealOnScrollDirective],
  templateUrl: './features-section.component.html',
})
export class FeaturesSectionComponent {}
