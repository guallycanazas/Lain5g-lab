# Backend FastAPI

El backend permite administrar el despliegue 5G SA existente sin reemplazar su arquitectura. Reutiliza los scripts ya validados en `deployments/5g-sa/scripts/` como fuente operativa principal.

## Instalación

```bash
make backend-install
```

## Variables de Entorno

Ejemplo en `backend/.env.example`:

```env
LAIN5G_PROJECT_ROOT=/home/gually/Lain5G-Lab
LAIN5G_SCENARIO=5g-sa
LAIN5G_DRY_RUN=false
LAIN5G_COMMAND_TIMEOUT=300
LAIN5G_LOG_TAIL_LINES=500
LAIN5G_CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

`backend/.env` no debe versionarse.

## Ejecución

```bash
make backend-dev
```

Equivalente:

```bash
.venv/bin/uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

El backend no inicia Docker al arrancar.

## Endpoints

- `GET /api/health`
- `GET /api/deployments`
- `GET /api/deployments/5g-sa`
- `POST /api/deployments/5g-sa/start`
- `POST /api/deployments/5g-sa/stop`
- `POST /api/deployments/5g-sa/restart`
- `GET /api/deployments/5g-sa/status`
- `GET /api/deployments/5g-sa/logs?container=amf&tail=200`
- `POST /api/deployments/5g-sa/validate`
- `GET /api/runs`
- `GET /api/runs/latest`
- `GET /api/runs/{run_id}`
- `GET /api/validation/latest`

## Ejemplos curl

```bash
curl http://127.0.0.1:8000/api/health
curl http://127.0.0.1:8000/api/deployments
curl -X POST http://127.0.0.1:8000/api/deployments/5g-sa/start
curl http://127.0.0.1:8000/api/deployments/5g-sa/status
curl -X POST http://127.0.0.1:8000/api/deployments/5g-sa/validate
curl http://127.0.0.1:8000/api/runs/latest
curl http://127.0.0.1:8000/api/deployments/5g-sa/logs?tail=200
curl -X POST http://127.0.0.1:8000/api/deployments/5g-sa/stop
```

## Modo dry-run

```bash
LAIN5G_DRY_RUN=true make backend-dev
```

En dry-run el backend no ejecuta Docker ni scripts operativos reales, no modifica `runs/` y devuelve el comando que habría ejecutado. Las validaciones se reportan como `NOT_TESTED`.

## Códigos de Error

- `400`: solicitud inválida.
- `404`: escenario o ejecución inexistente.
- `409`: conflicto de estado, por ejemplo iniciar un despliegue ya activo.
- `422`: validación de entrada FastAPI.
- `500`: error interno controlado o comando fallido.
- `504`: timeout de comando.

Ejemplo:

```json
{
  "detail": {
    "code": "DEPLOYMENT_START_FAILED",
    "message": "The 5G SA deployment could not be started.",
    "exit_code": 1,
    "stderr": "..."
  }
}
```

## Seguridad

- No se usa `shell=True`.
- Los scripts deben estar dentro del repositorio.
- Se rechazan enlaces simbólicos que resuelvan fuera del proyecto.
- No se devuelven variables de entorno completas.
- Se redactan valores asociados a `SUBSCRIBER_KEY`, `SUBSCRIBER_OPC`, `SUBSCRIBER_OP`, `K`, `KI`, `OP` y `OPC`.
- `runs/` se lee sin permitir path traversal ni archivos arbitrarios.

## Estructura

```text
backend/app/api/          routers FastAPI
backend/app/models/       modelos Pydantic
backend/app/services/     ejecución de comandos, despliegues, runs y validación
backend/tests/            pruebas y fixtures aislados
```

## Pruebas

```bash
make backend-test
make backend-cov
```

Las pruebas unitarias usan fixtures y `LAIN5G_DRY_RUN=true`; no requieren Docker real ni modifican el directorio real `runs/`.
