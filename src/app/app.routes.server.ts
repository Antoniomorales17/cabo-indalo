import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: ':lang',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return [{ lang: 'es' }, { lang: 'en' }, { lang: 'fr' }, { lang: 'de' }];
    },
  },
  {
    path: ':lang/galeria',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return [{ lang: 'es' }, { lang: 'en' }, { lang: 'fr' }, { lang: 'de' }];
    },
  },
  {
    path: ':lang/que-ver',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return [{ lang: 'es' }, { lang: 'en' }, { lang: 'fr' }, { lang: 'de' }];
    },
  },
  {
    path: ':lang/playas-cercanas',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return [{ lang: 'es' }, { lang: 'en' }, { lang: 'fr' }, { lang: 'de' }];
    },
  },
  {
    path: ':lang/como-llegar',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return [{ lang: 'es' }, { lang: 'en' }, { lang: 'fr' }, { lang: 'de' }];
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
