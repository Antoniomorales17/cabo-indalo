# Indalo Agent Guide

## 1) Proyecto

- Nombre: `cabo-indalo`
- Stack principal: Angular 21 (standalone components) + Tailwind CSS + SSR/prerender Angular.
- Objetivo: landing multidioma de alojamiento turístico en Cabo de Gata con:
  - Home comercial.
  - Guías locales (`que-ver`, `playas-cercanas`, `como-llegar`).
  - Ruta QR para huéspedes (`/info-qr`).
  - Formularios: registro de viajeros y sugerencias.
  - Endpoints API para envío por email (Resend).
  - Debes de hablarme como si fueras un desarrollador senior que se une al proyecto y necesita entender rápidamente cómo está organizado, cuáles son las rutas clave, los estándares de trabajo, y cómo operar el proyecto. El objetivo es que puedas contribuir de manera efectiva sin necesidad de una larga inducción. Llamame Don Antonio.

## 2) Rutas clave

- Front:
  - `/es`, `/en`, `/fr`, `/de`
  - `/:lang/galeria`
  - `/:lang/que-ver`
  - `/:lang/playas-cercanas`
  - `/:lang/como-llegar`
  - `/:lang/info-qr`
  - `**` -> página 404 útil.
- API:
  - `POST /api/send-travelers`
  - `POST /api/send-suggestions`
  - `GET /api/health` (uptime básico)

## 3) Estructura importante

- `src/app/components/`: secciones UI de la landing.
- `src/app/pages/`: vistas principales por ruta.
- `public/i18n/*.json`: traducciones (ES/EN/FR/DE).
- `api/*.js`: funciones backend serverless.
- `scripts/`: utilidades operativas (`deploy.ps1`, `backup-env.ps1`).

## 4) Estándar de trabajo (Angular)

- Usar standalone components (sin NgModules).
- Mantener componentes pequeños y orientados a una responsabilidad.
- Evitar lógica pesada en templates.
- Centralizar validaciones complejas en TS (custom validators).
- No duplicar reglas de negocio: compartir criterio entre frontend y backend.
- Mantener tipado explícito en formularios y modelos.
- Asegurar accesibilidad mínima:
  - `aria-label` en botones críticos.
  - foco claro en modales.
  - mensajes dinámicos con `aria-live` cuando aplique.

## 5) Estándar de trabajo (Tailwind)

- Priorizar consistencia visual (spacing, tipografía, contrastes).
- Evitar clases excesivas repetidas: consolidar patrones por sección.
- Preservar identidad actual de color (`--sea`, `--sea-dark`, `--foam`, `--sand`, `--sun`).
- Responsive primero:
  - móvil funcional sin overflow.
  - desktop limpio con jerarquía visual.

## 6) Formularios (criterio obligatorio)

- Estados UX claros: `enviando`, `enviado`, `error`.
- Evitar doble envío (deshabilitar botones y guardas lógicas).
- Mantener datos del usuario en fallo (no reset en error).
- Mostrar errores útiles (no mensajes genéricos).
- Validar campos críticos por formato:
  - DNI: 8 números + letra (y checksum).
  - NIE/pasaporte según formato.
  - email/teléfono/fecha/dirección con reglas coherentes.

## 7) i18n y contenido

- Cualquier nuevo texto debe agregarse en:
  - `public/i18n/es.json`
  - `public/i18n/en.json`
  - `public/i18n/fr.json`
  - `public/i18n/de.json`
- No dejar claves sin traducir.
- Mantener tono claro, útil y orientado al huésped.

## 8) SEO y rendimiento

- Respetar metadatos por ruta en `src/app/app.ts`.
- No romper canonical/alternate links.
- Optimizar cambios visuales sin aumentar bundle innecesariamente.
- Eliminar bloques comentados muertos y código no usado.

## 9) Operación

- Variables de entorno definidas en `.env` (usar `.env.example` como plantilla).
- Backup local de env:
  - `npm run ops:backup-env`
- Build reproducible de despliegue:
  - `npm run deploy:repro`
- Salud del servicio:
  - revisar `/api/health`

## 10) Comandos base

- Desarrollo:
  - `npm run start`
- Build:
  - `npm run build`
- SSR local (tras build):
  - `npm run serve:ssr:cabo-indalo`
- Test:
  - `npm run test`

## 11) Checklist antes de cerrar una tarea

- Compila sin errores (`npm run build`).
- No se rompen rutas ni i18n.
- UX móvil y desktop consistente.
- Formularios mantienen comportamiento esperado.
- No se introducen textos hardcodeados si ya existe i18n.
- Cambios documentados si afectan operación.

## 12) Principio rector

Gestionar este proyecto con enfoque de negocio real:
- claridad para el huésped,
- facilidad de mantenimiento para el equipo,
- fiabilidad en producción,
- y mejora continua sin sobreingeniería.
