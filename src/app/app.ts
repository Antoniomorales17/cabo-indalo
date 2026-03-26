import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { ScrollTopButtonComponent } from './components/scroll-top-button/scroll-top-button.component';

type Language = 'es' | 'en' | 'fr' | 'de';

type LocalizedSeo = {
  title: string;
  description: string;
};

type PageSeoConfig = {
  slug: string | null;
  localized: Record<Language, LocalizedSeo>;
};


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ScrollTopButtonComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly supportedLanguages: Language[] = ['es', 'en', 'fr', 'de'];
  private readonly baseUrl = 'https://www.caboindalo.es';
  private readonly document = inject(DOCUMENT);
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
    const hasLang = Boolean(first && this.supportedLanguages.includes(first as Language));
    const lang = hasLang ? first : 'es';
    const pagePath = hasLang ? `/${segments.slice(1).join('/')}` : `/${segments.join('/')}`;
    return { lang, pagePath };
  }

  private applyLanguage(language: string): void {
    if (this.translate.currentLang !== language) {
      this.translate.use(language);
    }

    this.document.documentElement.lang = language;
  }

  private applySeoMeta(language: string, pagePath: string): void {
    const normalizedLanguage = this.normalizeLanguage(language);
    const pageMeta = this.resolvePageMeta(pagePath, normalizedLanguage);
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

    const canonicalLink = this.getOrCreateLink('canonical');
    canonicalLink.setAttribute('href', canonicalUrl);

    this.updateAlternateLinks(pageMeta.slug);
    this.updateVacationRentalStructuredData(canonicalUrl, normalizedLanguage);
  }

  private resolvePageMeta(pagePath: string, language: Language): { slug: string | null; title: string; description: string } {
    const map: Record<string, PageSeoConfig> = {
      '/galeria': {
        slug: 'galeria',
        localized: {
          es: {
            title: 'Galeria completa | Cabo Indalo - Casa turistica en Cabo de Gata',
            description: 'Descubre la galeria completa de Cabo Indalo: casa turistica en Cabo de Gata con ambiente mediterraneo, cerca de playas y naturaleza.',
          },
          en: {
            title: 'Full Gallery | Cabo Indalo - Holiday Home in Cabo de Gata',
            description: 'Explore the full Cabo Indalo gallery: a holiday home in Cabo de Gata near beaches, nature, and Mediterranean landscapes.',
          },
          fr: {
            title: 'Galerie complete | Cabo Indalo - Maison touristique a Cabo de Gata',
            description: 'Decouvrez toute la galerie de Cabo Indalo, maison touristique a Cabo de Gata proche des plages et de la nature.',
          },
          de: {
            title: 'Vollstandige Galerie | Cabo Indalo - Ferienhaus in Cabo de Gata',
            description: 'Entdecke die komplette Galerie von Cabo Indalo, einem Ferienhaus in Cabo de Gata nahe Strand und Natur.',
          },
        },
      },
      '/que-ver': {
        slug: 'que-ver',
        localized: {
          es: {
            title: 'Que ver en Cabo de Gata | Guia local Cabo Indalo',
            description: 'Que ver en Cabo de Gata en 1, 2 o 3 dias: ruta facil con salinas, Arrecife de las Sirenas y pueblos con encanto.',
          },
          en: {
            title: 'What to See in Cabo de Gata | Cabo Indalo Local Guide',
            description: 'A simple Cabo de Gata itinerary for 1, 2, or 3 days with salt flats, iconic viewpoints, and charming villages.',
          },
          fr: {
            title: 'Que voir a Cabo de Gata | Guide local Cabo Indalo',
            description: 'Itineraire simple a Cabo de Gata sur 1, 2 ou 3 jours avec salines, points de vue et villages pleins de charme.',
          },
          de: {
            title: 'Was man in Cabo de Gata sehen kann | Lokaler Guide Cabo Indalo',
            description: 'Einfache Route fur 1, 2 oder 3 Tage in Cabo de Gata mit Salinen, Aussichtspunkten und charmanten Orten.',
          },
        },
      },
      '/playas-cercanas': {
        slug: 'playas-cercanas',
        localized: {
          es: {
            title: 'Playas cercanas a Cabo Indalo | Cabo de Gata',
            description: 'Las mejores playas cerca de Cabo Indalo con tiempos reales, consejos de acceso y plan recomendado para cada dia.',
          },
          en: {
            title: 'Beaches Near Cabo Indalo | Cabo de Gata',
            description: 'The best beaches near Cabo Indalo with practical access tips and a recommended beach plan for your stay.',
          },
          fr: {
            title: 'Plages proches de Cabo Indalo | Cabo de Gata',
            description: 'Les plus belles plages proches de Cabo Indalo avec conseils d acces et plan recommande pour votre sejour.',
          },
          de: {
            title: 'Strande in der Nahe von Cabo Indalo | Cabo de Gata',
            description: 'Die besten Strande in der Nahe von Cabo Indalo mit Zugangstipps und empfohlenem Tagesplan.',
          },
        },
      },
      '/como-llegar': {
        slug: 'como-llegar',
        localized: {
          es: {
            title: 'Como llegar a Cabo Indalo | San Miguel de Cabo de Gata',
            description: 'Como llegar a Cabo Indalo desde aeropuerto o carretera: tiempos actualizados y consejos para aparcar y moverte.',
          },
          en: {
            title: 'How to Get to Cabo Indalo | San Miguel de Cabo de Gata',
            description: 'How to reach Cabo Indalo from airport or road, plus practical parking and mobility tips.',
          },
          fr: {
            title: 'Comment arriver a Cabo Indalo | San Miguel de Cabo de Gata',
            description: 'Comment rejoindre Cabo Indalo depuis l aeroport ou la route, avec conseils pratiques de stationnement.',
          },
          de: {
            title: 'Anreise nach Cabo Indalo | San Miguel de Cabo de Gata',
            description: 'So erreichst du Cabo Indalo vom Flughafen oder mit dem Auto, inklusive Tipps zu Parken und Mobilitat.',
          },
        },
      },
      '/info-qr': {
        slug: 'info-qr',
        localized: {
          es: {
            title: 'Info QR para huespedes | Cabo Indalo',
            description: 'Guia rapida para huespedes de Cabo Indalo: WiFi, contacto, mapa, urgencias y enlaces utiles.',
          },
          en: {
            title: 'Guest QR Info | Cabo Indalo',
            description: 'Quick guest guide for Cabo Indalo with WiFi, contacts, map, emergency details, and useful links.',
          },
          fr: {
            title: 'Info QR pour hotes | Cabo Indalo',
            description: 'Guide rapide des hotes avec WiFi, contact, carte, urgences et liens utiles a Cabo Indalo.',
          },
          de: {
            title: 'QR-Infos fur Gaste | Cabo Indalo',
            description: 'Schneller Gaste-Guide fur Cabo Indalo mit WLAN, Kontakten, Karte, Notfallen und wichtigen Links.',
          },
        },
      },
      '/': {
        slug: null,
        localized: {
          es: {
            title: 'Cabo Indalo | Casa turistica en Cabo de Gata (Almeria)',
            description: 'Disfruta de Cabo Indalo, alojamiento vacacional en Cabo de Gata. Playa a 5 minutos, entorno natural y reserva segura.',
          },
          en: {
            title: 'Cabo Indalo | Holiday Home in Cabo de Gata (Almeria)',
            description: 'Enjoy Cabo Indalo, a holiday home in Cabo de Gata just 5 minutes from the beach with secure booking.',
          },
          fr: {
            title: 'Cabo Indalo | Maison touristique a Cabo de Gata (Almeria)',
            description: 'Profitez de Cabo Indalo, hebergement touristique a Cabo de Gata, a 5 minutes de la plage.',
          },
          de: {
            title: 'Cabo Indalo | Ferienhaus in Cabo de Gata (Almeria)',
            description: 'Geniesse Cabo Indalo, ein Ferienhaus in Cabo de Gata, nur 5 Minuten vom Strand entfernt.',
          },
        },
      },
    };

    const page = map[pagePath] ?? map['/'];
    const localized = page.localized[language];
    return {
      slug: page.slug,
      title: localized.title,
      description: localized.description,
    };
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

  private normalizeLanguage(language: string): Language {
    return this.supportedLanguages.includes(language as Language) ? (language as Language) : 'es';
  }

  private updateVacationRentalStructuredData(canonicalUrl: string, language: Language): void {
    const script = this.document.getElementById('vacation-rental-jsonld');
    if (!script || !script.textContent) {
      return;
    }

    try {
      const parsed = JSON.parse(script.textContent) as Record<string, unknown>;
      const next = {
        ...parsed,
        url: canonicalUrl,
        inLanguage: language,
      };
      script.textContent = JSON.stringify(next);
    } catch {
      // If JSON-LD is not parseable we keep the current content unchanged.
    }
  }

  private updateAlternateLinks(slug: string | null): void {
    for (const language of this.supportedLanguages) {
      const href = `${this.baseUrl}/${language}${slug ? `/${slug}` : ''}`;
      const alternateLink = this.getOrCreateLink('alternate', language);
      alternateLink.setAttribute('href', href);
    }

    const defaultHref = `${this.baseUrl}/es${slug ? `/${slug}` : ''}`;
    const xDefaultLink = this.getOrCreateLink('alternate', 'x-default');
    xDefaultLink.setAttribute('href', defaultHref);
  }

  private getOrCreateLink(rel: string, hreflang?: string): HTMLLinkElement {
    const hreflangSelector = hreflang ? `[hreflang="${hreflang}"]` : '';
    const selector = `link[rel="${rel}"]${hreflangSelector}`;
    let link = this.document.querySelector(selector) as HTMLLinkElement | null;
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', rel);
      if (hreflang) {
        link.setAttribute('hreflang', hreflang);
      }
      this.document.head.appendChild(link);
    }
    return link;
  }
}
