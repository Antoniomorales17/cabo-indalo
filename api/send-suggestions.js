const RESEND_API_URL = 'https://api.resend.com/emails';

module.exports = async function handler(req, res) {
  try {
    const method = String(req && req.method ? req.method : '').toUpperCase();

    if (method === 'GET') {
      return res.status(200).json({
        ok: true,
        service: 'send-suggestions',
        env: {
          resendApiKey: Boolean(process.env.RESEND_API_KEY),
          resendFromEmail: process.env.RESEND_FROM_EMAIL || '',
          suggestionsToEmail: process.env.SUGGESTIONS_TO_EMAIL || process.env.TRAVELERS_TO_EMAIL || '',
        },
      });
    }

    if (method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ ok: false, message: 'Method not allowed' });
    }

    const resendApiKey = process.env.RESEND_API_KEY || '';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Cabo Indalo <onboarding@resend.dev>';
    const toEmail = process.env.SUGGESTIONS_TO_EMAIL || process.env.TRAVELERS_TO_EMAIL || 'caboindalo@gmail.com';

    if (!resendApiKey) {
      return res.status(500).json({ ok: false, message: 'Missing RESEND_API_KEY' });
    }

    const body = parseBody(req ? req.body : null);
    const message = clean(body.message);
    const email = clean(body.email);
    const name = clean(body.name);
    const page = clean(body.page);
    const language = clean(body.language);

    if (message.length < 10 || message.length > 1200) {
      return res.status(400).json({ ok: false, message: 'Message length is invalid' });
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
        subject: 'Sugerencia web - Cabo Indalo',
        text: buildTextBody({ message, email, name, page, language }),
        html: buildHtmlBody({ message, email, name, page, language }),
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
      const errorMessage =
        payload.message || errorMessageFromObject || errorMessageFromString || `Resend HTTP ${resendResponse.status}`;
      return res.status(502).json({ ok: false, message: errorMessage });
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

function safeParse(raw) {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function buildTextBody(data) {
  return [
    'Nueva sugerencia desde la web',
    '',
    `Mensaje: ${data.message || '-'}`,
    `Nombre: ${data.name || '-'}`,
    `Email: ${data.email || '-'}`,
    `Idioma: ${data.language || '-'}`,
    `Pagina: ${data.page || '-'}`,
    `Fecha: ${new Date().toISOString()}`,
  ].join('\n');
}

function buildHtmlBody(data) {
  return `
  <div style="font-family: Arial, sans-serif; color: #0f172a;">
    <h2 style="margin: 0 0 12px;">Nueva sugerencia desde la web</h2>
    <p style="margin: 0 0 16px; white-space: pre-wrap;">${escapeHtml(data.message || '-')}</p>
    <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
      <tr>
        <td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Nombre</strong></td>
        <td style="border: 1px solid #cbd5e1; padding: 8px;">${escapeHtml(data.name || '-')}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Email</strong></td>
        <td style="border: 1px solid #cbd5e1; padding: 8px;">${escapeHtml(data.email || '-')}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Idioma</strong></td>
        <td style="border: 1px solid #cbd5e1; padding: 8px;">${escapeHtml(data.language || '-')}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Pagina</strong></td>
        <td style="border: 1px solid #cbd5e1; padding: 8px;">${escapeHtml(data.page || '-')}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Fecha</strong></td>
        <td style="border: 1px solid #cbd5e1; padding: 8px;">${escapeHtml(new Date().toISOString())}</td>
      </tr>
    </table>
  </div>
  `;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
