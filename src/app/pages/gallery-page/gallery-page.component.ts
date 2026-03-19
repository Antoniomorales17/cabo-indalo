import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-gallery-page',
  imports: [RouterLink, FooterComponent, TranslatePipe],
  templateUrl: './gallery-page.component.html',
})
export class GalleryPageComponent {
  protected readonly galleryImages = [
    {
      src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
      altKey: 'galleryPage.alt.sunrise',
    },
    {
      src: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1400&q=80',
      altKey: 'galleryPage.alt.living',
    },
    {
      src: 'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1400&q=80',
      altKey: 'galleryPage.alt.bedroom',
    },
    {
      src: 'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=1400&q=80',
      altKey: 'galleryPage.alt.kitchen',
    },
    {
      src: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1400&q=80',
      altKey: 'galleryPage.alt.terrace',
    },
    {
      src: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80',
      altKey: 'galleryPage.alt.coast',
    },
    {
      src: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80',
      altKey: 'galleryPage.alt.interior',
    },
    {
      src: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
      altKey: 'galleryPage.alt.room',
    },
    {
      src: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1400&q=80',
      altKey: 'galleryPage.alt.path',
    },
  ];
}
