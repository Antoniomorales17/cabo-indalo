const RESEND_API_URL = 'https://api.resend.com/emails';
const DNI_REGEX = /^\d{8}[A-Za-z]$/;
const NIE_REGEX = /^[XYZ]\d{7}[A-Za-z]$/i;
const PASSPORT_REGEX = /^[A-Za-z0-9]{6,15}$/;
const PHONE_REGEX = /^\+?[0-9]{9,15}$/;
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/u;
const ADDRESS_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9.,'\/ -]+$/u;

module.exports = async function handler(req, res) {
  try {
    const method = String(req && req.method ? req.method : '').toUpperCase();

    if (method === 'GET') {
      return res.status(200).json({
        ok: true,
        service: 'send-travelers',
        env: {
          resendApiKey: Boolean(process.env.RESEND_API_KEY),
          resendFromEmail: process.env.RESEND_FROM_EMAIL || '',
          travelersToEmail: process.env.TRAVELERS_TO_EMAIL || '',
        },
      });
    }

    if (method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ ok: false, message: 'Method not allowed' });
    }

    const resendApiKey = process.env.RESEND_API_KEY || '';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Cabo Indalo <onboarding@resend.dev>';
    const toEmail = process.env.TRAVELERS_TO_EMAIL || 'caboindalo@gmail.com';

    if (!resendApiKey) {
      return res.status(500).json({ ok: false, message: 'Missing RESEND_API_KEY' });
    }

    const body = parseBody(req ? req.body : null);
    const travelersRaw = Array.isArray(body.travelers) ? body.travelers : [];

    if (!travelersRaw.length) {
      return res.status(400).json({ ok: false, message: 'No travelers provided' });
    }

    if (travelersRaw.length > 20) {
      return res.status(400).json({ ok: false, message: 'Too many travelers in one request' });
    }

    const travelers = travelersRaw.map(normalizeTraveler);
    const invalid = travelers.find((traveler) => !isValidTraveler(traveler));
    if (invalid) {
      return res.status(400).json({
        ok: false,
        message: 'Traveler data is invalid. Check required fields and document format.',
      });
    }

    const resendResponse = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: `Registro de viajeros - ${travelers.length} personas`,
        text: buildTextBody(travelers),
        html: buildHtmlBody(travelers),
      }),
    });

    const raw = await resendResponse.text();
    const payload = safeParse(raw);

    if (!resendResponse.ok) {
      const errorMessageFromObject =
        typeof payload.error === 'object' && payload.error && typeof payload.error.message === 'string'
          ? payload.error.message
          : '';
      const errorMessageFromString = typeof payload.error === 'string' ? payload.error : '';
      const message =
        payload.message || errorMessageFromObject || errorMessageFromString || `Resend HTTP ${resendResponse.status}`;
      return res.status(502).json({ ok: false, message });
    }

    return res.status(200).json({ ok: true, message: 'Email sent', id: payload.id || '' });
  } catch (error) {
    const message = error && error.message ? error.message : 'Unexpected server error';
    return res.status(500).json({ ok: false, message });
  }
};

function parseBody(body) {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

function normalizeTraveler(input) {
  const t = input && typeof input === 'object' ? input : {};
  const a = t.direccionViajero && typeof t.direccionViajero === 'object' ? t.direccionViajero : {};
  return {
    ...t,
    nombre: normalizeText(t.nombre),
    primerApellido: normalizeText(t.primerApellido),
    segundoApellido: normalizeText(t.segundoApellido),
    fechaNacimiento: normalizeText(t.fechaNacimiento),
    nacionalidad: normalizeText(t.nacionalidad),
    sexo: normalizeText(t.sexo),
    tipoDocumento: normalizeText(t.tipoDocumento).toLowerCase(),
    documento: normalizeText(t.documento).toUpperCase(),
    soporteDocumento: normalizeText(t.soporteDocumento).toUpperCase(),
    telefono: normalizeText(t.telefono),
    telefonoAdicional: normalizeText(t.telefonoAdicional),
    correo: normalizeText(t.correo),
    parentesco: normalizeText(t.parentesco),
    direccionViajero: {
      ...a,
      direccion: normalizeText(a.direccion),
      informacionAdicional: normalizeText(a.informacionAdicional),
      pais: normalizeText(a.pais),
      provincia: normalizeText(a.provincia),
      municipio: normalizeText(a.municipio),
    },
  };
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidTraveler(traveler) {
  const requiredMissing =
    !traveler.nombre ||
    !traveler.primerApellido ||
    !traveler.fechaNacimiento ||
    !traveler.nacionalidad ||
    !traveler.sexo ||
    !traveler.tipoDocumento ||
    !traveler.documento ||
    !traveler.parentesco ||
    !traveler.direccionViajero?.direccion ||
    !traveler.direccionViajero?.pais ||
    !traveler.direccionViajero?.provincia ||
    !traveler.direccionViajero?.municipio;

  if (requiredMissing) return false;

  if (!NAME_REGEX.test(traveler.nombre) || !NAME_REGEX.test(traveler.primerApellido)) return false;
  if (traveler.segundoApellido && !NAME_REGEX.test(traveler.segundoApellido)) return false;
  if (!NAME_REGEX.test(traveler.nacionalidad)) return false;
  if (!ADDRESS_REGEX.test(traveler.direccionViajero.direccion)) return false;
  if (!NAME_REGEX.test(traveler.direccionViajero.pais)) return false;
  if (!NAME_REGEX.test(traveler.direccionViajero.provincia)) return false;
  if (!NAME_REGEX.test(traveler.direccionViajero.municipio)) return false;

  const birthDate = new Date(traveler.fechaNacimiento);
  if (Number.isNaN(birthDate.getTime())) return false;
  if (birthDate > new Date()) return false;

  if (traveler.telefono && !PHONE_REGEX.test(traveler.telefono)) return false;
  if (traveler.telefonoAdicional && !PHONE_REGEX.test(traveler.telefonoAdicional)) return false;

  if (!isValidDocument(traveler.tipoDocumento, traveler.documento)) return false;

  return true;
}

function isValidDocument(type, document) {
  if (type === 'dni') {
    return isValidDni(document);
  }
  if (type === 'nie') {
    return isValidNie(document);
  }
  if (type === 'passport') {
    return PASSPORT_REGEX.test(document);
  }
  return false;
}

function isValidDni(document) {
  if (!DNI_REGEX.test(document)) return false;
  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const number = parseInt(document.slice(0, 8), 10);
  const expected = letters[number % 23];
  return document.slice(-1).toUpperCase() === expected;
}

function isValidNie(document) {
  if (!NIE_REGEX.test(document)) return false;
  const map = { X: '0', Y: '1', Z: '2' };
  const prefix = document[0].toUpperCase();
  const normalized = `${map[prefix]}${document.slice(1, 8)}${document.slice(-1).toUpperCase()}`;
  return isValidDni(normalized);
}

function safeParse(raw) {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function buildTextBody(travelers) {
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
      `Direccion: ${safe(traveler.direccionViajero && traveler.direccionViajero.direccion)}`,
      `Info adicional: ${safe(traveler.direccionViajero && traveler.direccionViajero.informacionAdicional)}`,
      `Pais: ${safe(traveler.direccionViajero && traveler.direccionViajero.pais)}`,
      `Provincia: ${safe(traveler.direccionViajero && traveler.direccionViajero.provincia)}`,
      `Municipio: ${safe(traveler.direccionViajero && traveler.direccionViajero.municipio)}`,
      '',
    ])
    .join('\n');
}

function buildHtmlBody(travelers) {
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
        <td>${escapeHtml(safe(traveler.direccionViajero && traveler.direccionViajero.direccion))}</td>
        <td>${escapeHtml(safe(traveler.direccionViajero && traveler.direccionViajero.provincia))}</td>
        <td>${escapeHtml(safe(traveler.direccionViajero && traveler.direccionViajero.municipio))}</td>
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
      <tbody>${rows}</tbody>
    </table>
  </div>
  `;
}

function fullName(traveler) {
  return [safe(traveler.nombre), safe(traveler.primerApellido), safe(traveler.segundoApellido)]
    .filter((part) => part !== '-')
    .join(' ')
    .trim();
}

function safe(value) {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || '-';
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
