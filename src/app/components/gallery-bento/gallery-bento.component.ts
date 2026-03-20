import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RevealOnScrollDirective } from '../../directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-gallery-bento',
  imports: [RouterLink, TranslatePipe, RevealOnScrollDirective],
  templateUrl: './gallery-bento.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryBentoComponent { }
