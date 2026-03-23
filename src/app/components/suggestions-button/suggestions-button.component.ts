import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

const SUGGESTIONS_API_URL = '/api/send-suggestions';

@Component({
  selector: 'app-suggestions-button',
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './suggestions-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuggestionsButtonComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly translate = inject(TranslateService);
  private readonly isBrowser = typeof window !== 'undefined';

  protected readonly isOpen = signal(false);
  protected readonly isSending = signal(false);
  protected readonly statusMessage = signal('');
  protected readonly statusKind = signal<'' | 'ok' | 'error'>('');

  protected readonly suggestionForm = this.fb.group({
    name: ['', [Validators.maxLength(80)]],
    email: ['', [Validators.email, Validators.maxLength(120)]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1200)]],
  });

  protected openModal(): void {
    this.statusMessage.set('');
    this.statusKind.set('');
    this.isOpen.set(true);
  }

  protected closeModal(): void {
    this.isOpen.set(false);
  }

  protected hasError(path: string): boolean {
    const control = this.suggestionForm.get(path);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  protected async sendSuggestion(): Promise<void> {
    if (this.suggestionForm.invalid) {
      this.suggestionForm.markAllAsTouched();
      return;
    }

    this.isSending.set(true);
    this.statusMessage.set('');
    this.statusKind.set('');

    const value = this.suggestionForm.getRawValue();
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 15000);

    try {
      const response = await fetch(SUGGESTIONS_API_URL, {
        method: 'POST',
        signal: abortController.signal,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: value.name.trim(),
          email: value.email.trim(),
          message: value.message.trim(),
          page: this.isBrowser ? window.location.href : '',
          language: this.translate.currentLang || this.translate.getDefaultLang() || 'es',
        }),
      });

      if (!response.ok) {
        const rawResponse = await response.text();
        let backendMessage = '';
        try {
          const parsed = JSON.parse(rawResponse) as { message?: string };
          backendMessage = typeof parsed.message === 'string' ? parsed.message.trim() : '';
        } catch {
          backendMessage = '';
        }

        if (!backendMessage) {
          const plainResponse = rawResponse.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          if (plainResponse) {
            backendMessage = `Error ${response.status}: ${plainResponse.slice(0, 160)}`;
          }
        }

        this.statusKind.set('error');
        this.statusMessage.set(
          backendMessage || this.translate.instant('suggestions.status.sendError'),
        );
        return;
      }

      this.statusKind.set('ok');
      this.statusMessage.set(this.translate.instant('suggestions.status.sent'));
      this.suggestionForm.reset({
        name: '',
        email: '',
        message: '',
      });
    } catch {
      this.statusKind.set('error');
      this.statusMessage.set(this.translate.instant('suggestions.status.networkError'));
    } finally {
      clearTimeout(timeoutId);
      this.isSending.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.isOpen()) {
      this.closeModal();
    }
  }
}
