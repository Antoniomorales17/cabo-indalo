import { Routes } from '@angular/router';
import { GalleryPageComponent } from './pages/gallery-page/gallery-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
  },
  {
    path: 'galeria',
    component: GalleryPageComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
