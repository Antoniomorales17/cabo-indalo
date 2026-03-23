import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
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
const DNI_REGEX = /^\d{8}[A-Za-z]$/;
const NIE_REGEX = /^[XYZ]\d{7}[A-Za-z]$/i;
const PASSPORT_REGEX = /^[A-Za-z0-9]{6,15}$/;
const PHONE_REGEX = /^\+?[0-9]{9,15}$/;
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/u;
const ADDRESS_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9.,'\/ -]+$/u;
const SUPPORT_DOC_REGEX = /^[A-Za-z0-9\-\/]{3,30}$/;

function optionalPatternValidator(pattern: RegExp, errorKey: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value || '').trim();
    if (!value) {
      return null;
    }
    return pattern.test(value) ? null : { [errorKey]: true };
  };
}

function birthDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = String(control.value || '').trim();
    if (!raw) {
      return null;
    }

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) {
      return { invalidBirthDate: true };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date > today) {
      return { futureBirthDate: true };
    }

    const oldestAllowed = new Date('1900-01-01');
    if (date < oldestAllowed) {
      return { invalidBirthDate: true };
    }

    return null;
  };
}

function isValidDniLetter(value: string): boolean {
  if (!DNI_REGEX.test(value)) {
    return false;
  }
  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const number = parseInt(value.slice(0, 8), 10);
  const expected = letters[number % 23];
  return value.slice(-1).toUpperCase() === expected;
}

function isValidNieLetter(value: string): boolean {
  if (!NIE_REGEX.test(value)) {
    return false;
  }

  const prefix = value[0].toUpperCase();
  const map: Record<string, string> = { X: '0', Y: '1', Z: '2' };
  const normalized = `${map[prefix]}${value.slice(1, 8)}${value.slice(-1).toUpperCase()}`;
  return isValidDniLetter(normalized);
}

function documentValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value || '').trim().toUpperCase();
    if (!value) {
      return null;
    }

    const type = String(control.parent?.get('tipoDocumento')?.value || '').toLowerCase();

    if (type === 'dni') {
      if (!DNI_REGEX.test(value)) {
        return { invalidDocumentFormat: true };
      }
      return isValidDniLetter(value) ? null : { invalidDocumentChecksum: true };
    }

    if (type === 'nie') {
      if (!NIE_REGEX.test(value)) {
        return { invalidDocumentFormat: true };
      }
      return isValidNieLetter(value) ? null : { invalidDocumentChecksum: true };
    }

    if (type === 'passport') {
      return PASSPORT_REGEX.test(value) ? null : { invalidDocumentFormat: true };
    }

    return { invalidDocumentFormat: true };
  };
}

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
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80), Validators.pattern(NAME_REGEX)]],
    primerApellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80), Validators.pattern(NAME_REGEX)]],
    segundoApellido: ['', [Validators.maxLength(80), optionalPatternValidator(NAME_REGEX, 'invalidName')]],
    fechaNacimiento: ['', [Validators.required, birthDateValidator()]],
    nacionalidad: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60), Validators.pattern(NAME_REGEX)]],
    sexo: ['', Validators.required],
    tipoDocumento: ['', Validators.required],
    documento: ['', [Validators.required, Validators.maxLength(30), documentValidator()]],
    soporteDocumento: ['', [Validators.maxLength(30), optionalPatternValidator(SUPPORT_DOC_REGEX, 'invalidSupportDoc')]],
    telefono: ['', [Validators.maxLength(25), optionalPatternValidator(PHONE_REGEX, 'invalidPhone')]],
    telefonoAdicional: ['', [Validators.maxLength(25), optionalPatternValidator(PHONE_REGEX, 'invalidPhone')]],
    correo: ['', Validators.email],
    parentesco: ['', Validators.required],
    direccionViajero: this.fb.group({
      direccion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(120), Validators.pattern(ADDRESS_REGEX)]],
      informacionAdicional: ['', Validators.maxLength(120)],
      pais: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80), Validators.pattern(NAME_REGEX)]],
      provincia: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80), Validators.pattern(NAME_REGEX)]],
      municipio: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80), Validators.pattern(NAME_REGEX)]],
    }),
  });

  protected travelers: Traveler[] = this.loadTravelers();
  protected emailStatus = '';
  protected emailStatusKind: 'ok' | 'error' | '' = '';
  protected isSendingEmail = false;

  constructor() {
    this.travelerForm.get('tipoDocumento')?.valueChanges.subscribe(() => {
      this.travelerForm.get('documento')?.updateValueAndValidity({ onlySelf: true });
    });
  }

  protected addTraveler(): void {
    if (this.travelerForm.invalid) {
      this.travelerForm.markAllAsTouched();
      return;
    }

    const value = this.travelerForm.getRawValue();
    const traveler: Traveler = {
      id: this.createTravelerId(),
      ...this.normalizeTraveler(value),
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

        this.setEmailStatus(
          'error',
          backendMessage || this.translate.instant('guest.status.sendError'),
        );
        this.cdr.markForCheck();
        return;
      }

      this.clearTravelers();
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

  protected hasErrorByKey(path: string, errorKey: string): boolean {
    const control = this.travelerForm.get(path);
    return Boolean(control && control.errors?.[errorKey] && (control.touched || control.dirty));
  }

  protected normalizeDocument(): void {
    const control = this.travelerForm.get('documento');
    if (!control) return;
    const normalized = String(control.value || '')
      .toUpperCase()
      .replace(/\s+/g, '')
      .trim();
    if (normalized !== control.value) {
      control.setValue(normalized);
    }
  }

  protected documentFormatHintKey(): string {
    const type = String(this.travelerForm.get('tipoDocumento')?.value || '').toLowerCase();
    if (type === 'dni') return 'guest.invalidDniFormat';
    if (type === 'nie') return 'guest.invalidNieFormat';
    if (type === 'passport') return 'guest.invalidPassportFormat';
    return 'guest.invalidDocumentFormat';
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

  private normalizeTraveler(value: Omit<Traveler, 'id'>): Omit<Traveler, 'id'> {
    return {
      ...value,
      nombre: value.nombre.trim(),
      primerApellido: value.primerApellido.trim(),
      segundoApellido: value.segundoApellido.trim(),
      nacionalidad: value.nacionalidad.trim(),
      tipoDocumento: value.tipoDocumento.trim(),
      documento: value.documento.trim().toUpperCase(),
      soporteDocumento: value.soporteDocumento.trim().toUpperCase(),
      telefono: value.telefono.trim(),
      telefonoAdicional: value.telefonoAdicional.trim(),
      correo: value.correo.trim(),
      parentesco: value.parentesco.trim(),
      direccionViajero: {
        direccion: value.direccionViajero.direccion.trim(),
        informacionAdicional: value.direccionViajero.informacionAdicional.trim(),
        pais: value.direccionViajero.pais.trim(),
        provincia: value.direccionViajero.provincia.trim(),
        municipio: value.direccionViajero.municipio.trim(),
      },
    };
  }
}

