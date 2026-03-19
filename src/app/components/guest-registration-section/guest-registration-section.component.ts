import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RevealOnScrollDirective } from '../../directives/reveal-on-scroll.directive';

interface TravelerAddress {
  direccion: string;
  informacionAdicional: string;
  pais: string;
  provincia: string;
  municipio: string;
}

interface Traveler {
  id: string;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  fechaNacimiento: string;
  nacionalidad: string;
  sexo: string;
  tipoDocumento: string;
  documento: string;
  soporteDocumento: string;
  telefono: string;
  telefonoAdicional: string;
  correo: string;
  parentesco: string;
  direccionViajero: TravelerAddress;
}

const STORAGE_KEY = 'cabo-indalo-viajeros';
const EMAIL_API_URL = '/api/send-travelers';

@Component({
  selector: 'app-guest-registration-section',
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, RevealOnScrollDirective],
  templateUrl: './guest-registration-section.component.html',
})
export class GuestRegistrationSectionComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly translate = inject(TranslateService);
  private readonly isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

  protected readonly sexOptions = ['male', 'female', 'other'];
  protected readonly documentTypeOptions = ['dni', 'nie', 'passport'];
  protected readonly relationshipOptions = [
    'holder',
    'partner',
    'child',
    'family',
    'friend',
    'other',
  ];

  protected readonly travelerForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(80)]],
    primerApellido: ['', [Validators.required, Validators.maxLength(80)]],
    segundoApellido: ['', [Validators.maxLength(80)]],
    fechaNacimiento: ['', Validators.required],
    nacionalidad: ['', [Validators.required, Validators.maxLength(60)]],
    sexo: ['', Validators.required],
    tipoDocumento: ['', Validators.required],
    documento: ['', [Validators.required, Validators.maxLength(30)]],
    soporteDocumento: ['', Validators.maxLength(30)],
    telefono: ['', [Validators.maxLength(25)]],
    telefonoAdicional: ['', [Validators.maxLength(25)]],
    correo: ['', Validators.email],
    parentesco: ['', Validators.required],
    direccionViajero: this.fb.group({
      direccion: ['', [Validators.required, Validators.maxLength(120)]],
      informacionAdicional: ['', Validators.maxLength(120)],
      pais: ['', [Validators.required, Validators.maxLength(80)]],
      provincia: ['', [Validators.required, Validators.maxLength(80)]],
      municipio: ['', [Validators.required, Validators.maxLength(80)]],
    }),
  });

  protected travelers: Traveler[] = this.loadTravelers();
  protected emailStatus = '';
  protected emailStatusKind: 'ok' | 'error' | '' = '';
  protected isSendingEmail = false;

  protected addTraveler(): void {
    if (this.travelerForm.invalid) {
      this.travelerForm.markAllAsTouched();
      return;
    }

    const value = this.travelerForm.getRawValue();
    const traveler: Traveler = {
      id: this.createTravelerId(),
      ...value,
    };

    this.travelers = [...this.travelers, traveler];
    this.saveTravelers();
    this.travelerForm.reset(this.initialFormValue());
  }

  protected removeTraveler(id: string): void {
    this.travelers = this.travelers.filter((traveler) => traveler.id !== id);
    this.saveTravelers();
  }

  protected clearTravelers(): void {
    this.travelers = [];
    this.saveTravelers();
  }

  protected resetForm(): void {
    this.travelerForm.reset(this.initialFormValue());
  }

  protected async sendByEmail(): Promise<void> {
    if (!this.travelers.length) {
      this.setEmailStatus('error', this.translate.instant('guest.status.noTravelers'));
      return;
    }

    this.isSendingEmail = true;
    this.setEmailStatus('', '');
    this.cdr.markForCheck();

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 15000);

    try {
      const response = await fetch(EMAIL_API_URL, {
        method: 'POST',
        signal: abortController.signal,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          travelers: this.travelers,
        }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
        this.setEmailStatus(
          'error',
          errorPayload?.message || this.translate.instant('guest.status.sendError'),
        );
        this.cdr.markForCheck();
        return;
      }

      this.setEmailStatus('ok', this.translate.instant('guest.status.sent'));
      this.cdr.markForCheck();
    } catch {
      this.setEmailStatus('error', this.translate.instant('guest.status.networkError'));
      this.cdr.markForCheck();
    } finally {
      clearTimeout(timeoutId);
      this.isSendingEmail = false;
      this.cdr.markForCheck();
    }
  }

  protected hasError(path: string): boolean {
    const control = this.travelerForm.get(path);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  protected trackByTravelerId(_index: number, traveler: Traveler): string {
    return traveler.id;
  }

  private initialFormValue() {
    return {
      nombre: '',
      primerApellido: '',
      segundoApellido: '',
      fechaNacimiento: '',
      nacionalidad: '',
      sexo: '',
      tipoDocumento: '',
      documento: '',
      soporteDocumento: '',
      telefono: '',
      telefonoAdicional: '',
      correo: '',
      parentesco: '',
      direccionViajero: {
        direccion: '',
        informacionAdicional: '',
        pais: '',
        provincia: '',
        municipio: '',
      },
    };
  }

  private loadTravelers(): Traveler[] {
    if (!this.isBrowser) {
      return [];
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Traveler[]) : [];
    } catch {
      return [];
    }
  }

  private saveTravelers(): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.travelers));
  }

  private createTravelerId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return `traveler-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
  }

  private setEmailStatus(kind: 'ok' | 'error' | '', message: string): void {
    this.emailStatusKind = kind;
    this.emailStatus = message;
  }
}

