import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

export class ServerTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    const safeLang = this.normalizeLanguage(lang);
    const candidates = [
      join(process.cwd(), 'public', 'i18n', `${safeLang}.json`),
      join(process.cwd(), 'dist', 'cabo-indalo', 'browser', 'i18n', `${safeLang}.json`),
      join(process.cwd(), 'browser', 'i18n', `${safeLang}.json`),
    ];

    for (const filePath of candidates) {
      if (!existsSync(filePath)) {
        continue;
      }

      try {
        const content = readFileSync(filePath, 'utf8');
        return of(JSON.parse(content));
      } catch {
        break;
      }
    }

    return of({});
  }

  private normalizeLanguage(language: string): string {
    const base = language.toLowerCase().slice(0, 2);
    return ['es', 'en', 'fr', 'de'].includes(base) ? base : 'es';
  }
}
