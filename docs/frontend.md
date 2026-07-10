# Frontend React

El frontend es una aplicación React + TypeScript para operar el despliegue `5g-sa` a través del backend FastAPI.

## Desarrollo Local

```bash
make frontend-install
make frontend-dev
```

El servidor Vite escucha en `http://127.0.0.1:5173` y reenvía `/api` a `http://127.0.0.1:8000`.

## Variables

Ejemplo en `frontend/.env.example`:

```env
VITE_API_BASE_URL=
```

Déjalo vacío para usar rutas relativas `/api`. Para conectar contra otro backend durante desarrollo puedes definir, por ejemplo, `VITE_API_BASE_URL=http://127.0.0.1:8000`.

## Scripts

```bash
make frontend-build
make frontend-test
```

También puedes ejecutar directamente dentro de `frontend/`:

```bash
npm run build
npm test
```

## Rutas Principales

- `/`: estado del backend, estado del despliegue y acciones `start`, `stop`, `restart`, `validate`.
- `/validation`: último reporte de validación y ejecución manual.
- `/logs`: logs del despliegue por contenedor y número de líneas.
- `/runs`: historial de ejecuciones.
- `/runs/:runId`: detalle de una ejecución.

## Producción

La imagen Docker compila el frontend con Vite y sirve `dist/` con Nginx. Nginx también reenvía `/api` al servicio backend del stack de aplicación.
