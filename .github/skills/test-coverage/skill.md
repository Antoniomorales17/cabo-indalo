## Skill: Test Coverage en Angular (SSR + Tailwind)

### Objetivo
Asegurar que la app mantiene una cobertura de tests adecuada y sostenible, cubriendo lógica crítica, formularios, componentes y rutas clave, tanto en unitarios como integración básica (SSR/API).

---

### Checklist mínimo

- [ ] Cada componente standalone tiene su spec.ts asociado y ejecuta al menos un test relevante.
- [ ] Formularios: tests de validación y UX (estados, errores, submit, guards de doble envío).
- [ ] Servicios: tests de lógica de negocio y mocks de dependencias externas.
- [ ] SSR: al menos un test de renderizado server-side (si aplica).
- [ ] API: tests de endpoints críticos (mock/fake fetch, no real network).
- [ ] No hay tests con `skip` o `only` en main.
- [ ] Cobertura mínima recomendada: 80% líneas/funciones (ver comando abajo).

---

### Comandos útiles

```bash
npm run test           # Ejecuta todos los tests unitarios
npm run test -- --code-coverage   # Genera informe de cobertura (./coverage/)
# Para ver el informe en navegador:
npx http-server ./coverage/cabo-indalo
```

---

### Buenas prácticas

- Usar TestBed y harnesses para componentes Angular.
- Mockear servicios y dependencias externas (no peticiones reales).
- Validar estados UX: loading, error, success.
- Usar datos de ejemplo realistas (fixtures).
- No testear lógica de Tailwind, solo clases condicionales si afectan UX.
- Para SSR, usar Angular Universal testing utilities si aplica.
- Mantener tests claros, sin lógica duplicada ni mocks innecesarios.

---

### Ejemplo básico (componente)

```ts
import { render, screen } from '@testing-library/angular';
import { HeroSectionComponent } from 'src/app/components/hero-section/hero-section.component';

describe('HeroSectionComponent', () => {
	it('debe renderizar el título principal', async () => {
		await render(HeroSectionComponent, { componentProperties: { title: 'Bienvenido' } });
		expect(screen.getByText('Bienvenido')).toBeTruthy();
	});
});
```

---

### Recursos
- [Testing Angular Standalone Components](https://angular.dev/guide/testing-components)
- [Testing Library Angular](https://testing-library.com/docs/angular-testing-library/intro/)
- [Angular SSR Testing](https://angular.dev/guide/universal-testing)

---

> Mantén este skill actualizado si cambian los criterios de negocio, herramientas o convenciones del equipo.
