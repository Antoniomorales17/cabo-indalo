/// <reference types="node" />

import { Resend } from 'resend';

type TravelerAddress = {
  direccion?: string;
  informacionAdicional?: string;
  pais?: string;
  provincia?: string;
  municipio?: string;
};

type Traveler = {
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  fechaNacimiento?: string;
  nacionalidad?: string;
  sexo?: string;
  tipoDocumento?: string;
  documento?: string;
  soporteDocumento?: string;
  telefono?: string;
  telefonoAdicional?: string;
  correo?: string;
  parentesco?: string;
  direccionViajero?: TravelerAddress;
};

type RequestBody = {
  travelers?: Traveler[];
};

const toEmail = process.env['TRAVELERS_TO_EMAIL'] || 'caboindalo@gmail.com';
const fromEmail = process.env['RESEND_FROM_EMAIL'] || 'Cabo Indalo <onboarding@resend.dev>';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  const resendApiKey = process.env['RESEND_API_KEY'];
  if (!resendApiKey) {
    return res.status(500).json({ ok: false, message: 'Missing RESEND_API_KEY' });
  }

  const body = parseBody(req.body);
  const travelers = Array.isArray(body.travelers) ? body.travelers : [];

  if (!travelers.length) {
    return res.status(400).json({ ok: false, message: 'No travelers provided' });
  }

  try {
    const resend = new Resend(resendApiKey);
    const subject = `Registro de viajeros - ${travelers.length} personas`;

    const emailResult = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject,
      text: buildTextBody(travelers),
      html: buildHtmlBody(travelers),
    });

    if (emailResult.error) {
      return res.status(502).json({ ok: false, message: emailResult.error.message || 'Resend send error' });
    }

    return res.status(200).json({ ok: true, message: 'Email sent', id: emailResult.data?.id || '' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return res.status(500).json({ ok: false, message });
  }
}

function parseBody(body: unknown): RequestBody {
  if (!body) {
    return {};
  }

  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as RequestBody;
    } catch {
      return {};
    }
  }

  return body as RequestBody;
}

function buildTextBody(travelers: Traveler[]): string {
  return travelers
    .flatMap((traveler, index) => [
      `Viajero ${index + 1}`,
      `Nombre: ${fullName(traveler)}`,
      `Fecha nacimiento: ${safe(traveler.fechaNacimiento)}`,
      `Nacionalidad: ${safe(traveler.nacionalidad)}`,
      `Sexo: ${safe(traveler.sexo)}`,
      `Documento: ${safe(traveler.tipoDocumento)} ${safe(traveler.documento)}`.trim(),
      `Soporte documento: ${safe(traveler.soporteDocumento)}`,
      `Telefono: ${safe(traveler.telefono)}`,
      `Telefono adicional: ${safe(traveler.telefonoAdicional)}`,
      `Correo: ${safe(traveler.correo)}`,
      `Parentesco: ${safe(traveler.parentesco)}`,
      `Direccion: ${safe(traveler.direccionViajero?.direccion)}`,
      `Info adicional: ${safe(traveler.direccionViajero?.informacionAdicional)}`,
      `Pais: ${safe(traveler.direccionViajero?.pais)}`,
      `Provincia: ${safe(traveler.direccionViajero?.provincia)}`,
      `Municipio: ${safe(traveler.direccionViajero?.municipio)}`,
      '',
    ])
    .join('\n');
}

function buildHtmlBody(travelers: Traveler[]): string {
  const rows = travelers
    .map(
      (traveler, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(fullName(traveler))}</td>
        <td>${escapeHtml(safe(traveler.fechaNacimiento))}</td>
        <td>${escapeHtml(safe(traveler.nacionalidad))}</td>
        <td>${escapeHtml(safe(traveler.sexo))}</td>
        <td>${escapeHtml(`${safe(traveler.tipoDocumento)} ${safe(traveler.documento)}`.trim())}</td>
        <td>${escapeHtml(safe(traveler.parentesco))}</td>
        <td>${escapeHtml(safe(traveler.correo))}</td>
        <td>${escapeHtml(safe(traveler.telefono))}</td>
        <td>${escapeHtml(safe(traveler.direccionViajero?.direccion))}</td>
        <td>${escapeHtml(safe(traveler.direccionViajero?.provincia))}</td>
        <td>${escapeHtml(safe(traveler.direccionViajero?.municipio))}</td>
      </tr>
    `,
    )
    .join('');

  return `
  <div style="font-family: Arial, sans-serif; color: #0f172a;">
    <h2 style="margin: 0 0 12px;">Registro de viajeros</h2>
    <p style="margin: 0 0 16px;">Total viajeros: <strong>${travelers.length}</strong></p>
    <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
      <thead>
        <tr>
          <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">#</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Nombre</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Nacimiento</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Nacionalidad</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Sexo</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Documento</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Parentesco</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Correo</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Telefono</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Direccion</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Provincia</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Municipio</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>
  `;
}

function fullName(traveler: Traveler): string {
  return [safe(traveler.nombre), safe(traveler.primerApellido), safe(traveler.segundoApellido)]
    .filter((part) => part !== '-')
    .join(' ')
    .trim();
}

function safe(value: unknown): string {
  const text = typeof value === 'string' ? value.trim() : '';
  return text ? text : '-';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

