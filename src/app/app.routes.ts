import { CanMatchFn, Routes } from '@angular/router';
import { GalleryPageComponent } from './pages/gallery-page/gallery-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';

const supportedLanguages = ['es', 'en', 'fr', 'de'];
const languageCanMatch: CanMatchFn = (_route, segments) => {
  const language = segments[0]?.path?.toLowerCase();
  return Boolean(language && supportedLanguages.includes(language));
};

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'es',
  },
  {
    path: 'galeria',
    pathMatch: 'full',
    redirectTo: 'es/galeria',
  },
  {
    path: ':lang',
    canMatch: [languageCanMatch],
    component: HomePageComponent,
  },
  {
    path: ':lang/galeria',
    canMatch: [languageCanMatch],
    component: GalleryPageComponent,
  },
  {
    path: '**',
    redirectTo: 'es',
  },
];
