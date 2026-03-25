import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SuggestionsButtonComponent } from '../suggestions-button/suggestions-button.component';

@Component({
  selector: 'app-contact-section',
  imports: [TranslatePipe, SuggestionsButtonComponent],
  templateUrl: './contact-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactSectionComponent { }
