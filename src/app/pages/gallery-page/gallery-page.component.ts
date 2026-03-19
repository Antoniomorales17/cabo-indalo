import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-gallery-page',
  imports: [RouterLink, FooterComponent],
  templateUrl: './gallery-page.component.html',
})
export class GalleryPageComponent {
  protected readonly galleryImages = [
    {
      src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
      alt: 'Playa de aguas claras al amanecer',
    },
    {
      src: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1400&q=80',
      alt: 'Salon amplio y luminoso',
    },
    {
      src: 'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1400&q=80',
      alt: 'Dormitorio con textiles claros',
    },
    {
      src: 'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=1400&q=80',
      alt: 'Cocina abierta totalmente equipada',
    },
    {
      src: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1400&q=80',
      alt: 'Terraza exterior para comer al aire libre',
    },
    {
      src: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80',
      alt: 'Costa con olas suaves y atardecer',
    },
    {
      src: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80',
      alt: 'Detalle interior moderno y acogedor',
    },
    {
      src: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
      alt: 'Habitacion secundaria con luz natural',
    },
    {
      src: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1400&q=80',
      alt: 'Vistas al mar desde sendero costero',
    },
  ];
}
