import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly supportedLanguages = ['es', 'en', 'fr', 'de'];
  private readonly baseUrl = 'https://www.caboindalo.es';
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  constructor() {
    this.translate.setDefaultLang('es');
    this.syncFromRoute();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.syncFromRoute());
  }

  private syncFromRoute(): void {
    const { lang, pagePath } = this.readRouteState();
    this.applyLanguage(lang);
    this.applySeoMeta(lang, pagePath);
  }

  private readRouteState(): { lang: string; pagePath: string } {
    const url = this.router.url.split(/[?#]/)[0];
    const segments = url.split('/').filter(Boolean);
    const first = segments[0]?.toLowerCase();
    const hasLang = Boolean(first && this.supportedLanguages.includes(first));
    const lang = hasLang ? first : 'es';
    const pagePath = hasLang ? `/${segments.slice(1).join('/')}` : `/${segments.join('/')}`;
    return { lang, pagePath };
  }

  private applyLanguage(language: string): void {
    if (this.translate.currentLang !== language) {
      this.translate.use(language);
    }

    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }

  private applySeoMeta(language: string, pagePath: string): void {
    const pageMeta = this.resolvePageMeta(pagePath);
    const localizedPath = pageMeta.slug ? `/${language}/${pageMeta.slug}` : `/${language}`;
    const canonicalUrl = `${this.baseUrl}${localizedPath}`;
    const title = pageMeta.title;
    const description = pageMeta.description;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:locale', content: this.mapOgLocale(language) });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    if (typeof document !== 'undefined') {
      const canonicalLink = this.getOrCreateLink('canonical');
      canonicalLink.setAttribute('href', canonicalUrl);
    }
  }

  private resolvePageMeta(pagePath: string): { slug: string | null; title: string; description: string } {
    const map: Record<string, { slug: string | null; title: string; description: string }> = {
      '/galeria': {
        slug: 'galeria',
        title: 'Galeria completa | Cabo Indalo - Casa turistica en Cabo de Gata',
        description:
          'Descubre la galeria completa de Cabo Indalo: casa turistica en Cabo de Gata con ambiente mediterraneo, cerca de playas y naturaleza.',
      },
      '/que-ver': {
        slug: 'que-ver',
        title: 'Que ver en Cabo de Gata | Guia local Cabo Indalo',
        description:
          'Que ver en Cabo de Gata en 1, 2 o 3 dias: ruta facil con salinas, Arrecife de las Sirenas y pueblos con encanto. Planifica tu escapada sin perder tiempo.',
      },
      '/playas-cercanas': {
        slug: 'playas-cercanas',
        title: 'Playas cercanas a Cabo Indalo | Cabo de Gata',
        description:
          'Las mejores playas cerca de Cabo Indalo: Cabo de Gata, Genoveses y Monsul con tiempos reales, consejos de acceso y plan recomendado para cada dia.',
      },
      '/como-llegar': {
        slug: 'como-llegar',
        title: 'Como llegar a Cabo Indalo | San Miguel de Cabo de Gata',
        description:
          'Como llegar a Cabo Indalo desde aeropuerto o carretera: tiempos actualizados, donde aparcar y como moverte por Cabo de Gata de forma sencilla.',
      },
      '/': {
        slug: null,
        title: 'Cabo Indalo | Casa turistica en Cabo de Gata (Almeria)',
        description:
          'Disfruta de Cabo Indalo, alojamiento vacacional en Cabo de Gata. Playa a 5 minutos, entorno natural y reserva segura.',
      },
    };

    return map[pagePath] ?? map['/'];
  }

  private mapOgLocale(language: string): string {
    const map: Record<string, string> = {
      es: 'es_ES',
      en: 'en_US',
      fr: 'fr_FR',
      de: 'de_DE',
    };
    return map[language] ?? 'es_ES';
  }

  private getOrCreateLink(rel: string): HTMLLinkElement {
    let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', rel);
      document.head.appendChild(link);
    }
    return link;
  }
}
