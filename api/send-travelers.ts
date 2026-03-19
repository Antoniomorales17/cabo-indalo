/// <reference types="node" />

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

type JsonObject = Record<string, unknown>;

const RESEND_API_URL = 'https://api.resend.com/emails';

export default async function handler(req: any, res?: any) {
  const isNodeStyle = Boolean(res && typeof res.status === 'function');

  try {
    const method = getMethod(req);

    if (method === 'GET') {
      return sendJson(
        isNodeStyle,
        res,
        200,
        {
          ok: true,
          service: 'send-travelers',
          timestamp: new Date().toISOString(),
          env: {
            resendApiKey: Boolean(getEnv('RESEND_API_KEY')),
            resendFromEmail: getEnv('RESEND_FROM_EMAIL'),
            travelersToEmail: getEnv('TRAVELERS_TO_EMAIL'),
          },
        },
        { Allow: 'GET, POST' },
      );
    }

    if (method !== 'POST') {
      return sendJson(isNodeStyle, res, 405, { ok: false, message: 'Method not allowed' }, { Allow: 'GET, POST' });
    }

    const resendApiKey = getEnv('RESEND_API_KEY');
    if (!resendApiKey) {
      return sendJson(isNodeStyle, res, 500, { ok: false, message: 'Missing RESEND_API_KEY' });
    }

    const fromEmail = getEnv('RESEND_FROM_EMAIL') || 'Cabo Indalo <onboarding@resend.dev>';
    const toEmail = getEnv('TRAVELERS_TO_EMAIL') || 'caboindalo@gmail.com';

    const body = await parseBody(req, isNodeStyle);
    const travelers = Array.isArray(body.travelers) ? body.travelers : [];

    if (!travelers.length) {
      return sendJson(isNodeStyle, res, 400, { ok: false, message: 'No travelers provided' });
    }

    const subject = `Registro de viajeros - ${travelers.length} personas`;

    const resendResponse = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject,
        text: buildTextBody(travelers),
        html: buildHtmlBody(travelers),
      }),
    });

    const resendRaw = await resendResponse.text();
    const resendPayload = safeJsonParse(resendRaw);

    if (!resendResponse.ok) {
      const resendMessage = getResendErrorMessage(resendPayload, resendResponse.status);
      return sendJson(isNodeStyle, res, 502, { ok: false, message: resendMessage });
    }

    return sendJson(isNodeStyle, res, 200, {
      ok: true,
      message: 'Email sent',
      id: typeof resendPayload.id === 'string' ? resendPayload.id : '',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    const stack = error instanceof Error ? error.stack?.split('\n').slice(0, 3) : [];
    return sendJson(isNodeStyle, res, 500, { ok: false, message, stack });
  }
}

function getMethod(req: any): string {
  const method = typeof req?.method === 'string' ? req.method : '';
  return method.toUpperCase();
}

function getEnv(name: string): string {
  if (typeof process === 'undefined' || !process?.env) {
    return '';
  }
  return process.env[name] || '';
}

async function parseBody(req: any, isNodeStyle: boolean): Promise<RequestBody> {
  if (isNodeStyle) {
    return parseBodyValue(req?.body);
  }

  if (!req || typeof req.json !== 'function') {
    return {};
  }

  try {
    const parsed = await req.json();
    return parseBodyValue(parsed);
  } catch {
    return {};
  }
}

function parseBodyValue(value: unknown): RequestBody {
  if (!value) {
    return {};
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as RequestBody;
    } catch {
      return {};
    }
  }

  if (typeof value === 'object') {
    return value as RequestBody;
  }

  return {};
}

function sendJson(
  isNodeStyle: boolean,
  res: any,
  statusCode: number,
  payload: JsonObject,
  extraHeaders?: Record<string, string>,
) {
  if (isNodeStyle) {
    if (extraHeaders) {
      for (const [header, value] of Object.entries(extraHeaders)) {
        res.setHeader(header, value);
      }
    }
    return res.status(statusCode).json(payload);
  }

  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
  });

  if (extraHeaders) {
    for (const [header, value] of Object.entries(extraHeaders)) {
      headers.set(header, value);
    }
  }

  return new Response(JSON.stringify(payload), {
    status: statusCode,
    headers,
  });
}

function safeJsonParse(value: string): JsonObject {
  if (!value) {
    return {};
  }
  try {
    return JSON.parse(value) as JsonObject;
  } catch {
    return {};
  }
}

function getResendErrorMessage(payload: JsonObject, statusCode: number): string {
  const message = typeof payload.message === 'string' ? payload.message.trim() : '';
  if (message) {
    return message;
  }

  const nestedError = payload.error;
  if (typeof nestedError === 'string' && nestedError.trim()) {
    return nestedError.trim();
  }

  if (nestedError && typeof nestedError === 'object') {
    const nestedMessage = (nestedError as JsonObject).message;
    if (typeof nestedMessage === 'string' && nestedMessage.trim()) {
      return nestedMessage.trim();
    }
  }

  return `Resend HTTP ${statusCode}`;
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
