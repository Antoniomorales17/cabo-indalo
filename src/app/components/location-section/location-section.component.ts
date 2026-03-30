import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { RevealOnScrollDirective } from '../../directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-location-section',
  imports: [TranslatePipe, RevealOnScrollDirective],
  templateUrl: './location-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationSectionComponent {
  readonly isMapVisible = signal(false);

  showMap(): void {
    this.isMapVisible.set(true);
  }
}
