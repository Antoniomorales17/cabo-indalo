import { Component } from '@angular/core';
import { CtaSectionComponent } from '../../components/cta-section/cta-section.component';
import { ContactSectionComponent } from '../../components/contact-section/contact-section.component';
import { FeaturesSectionComponent } from '../../components/features-section/features-section.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { GalleryBentoComponent } from '../../components/gallery-bento/gallery-bento.component';
import { GuestRegistrationSectionComponent } from '../../components/guest-registration-section/guest-registration-section.component';
import { HeroSectionComponent } from '../../components/hero-section/hero-section.component';
import { LocationSectionComponent } from '../../components/location-section/location-section.component';

@Component({
  selector: 'app-home-page',
  imports: [
    HeroSectionComponent,
    GalleryBentoComponent,
    FeaturesSectionComponent,
    LocationSectionComponent,
    GuestRegistrationSectionComponent,
    CtaSectionComponent,
    ContactSectionComponent,
    FooterComponent,
  ],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {}
