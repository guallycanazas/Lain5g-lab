# Lain5G-Lab

Lain5G-Lab es una plataforma sencilla, entendible y mantenible para desplegar, administrar y validar laboratorios 4G y 5G basados en Open5GS, UERANSIM y, en etapas futuras, componentes IMS.

Lain5G-Lab no implementa un núcleo 4G/5G propio. Utiliza componentes externos y aporta una capa propia de despliegue, configuración, administración, validación y visualización.

## Estado actual

La primera entrega se centra en 5G SA con Open5GS y UERANSIM. El laboratorio puede operarse desde terminal y también desde una aplicación React + FastAPI dockerizada que reutiliza los mismos scripts validados.

## Uso inicial 5G SA

```bash
cp deployments/5g-sa/.env.example deployments/5g-sa/.env
make build-5g-sa
make start-5g-sa
make status-5g-sa
make validate-5g-sa
make logs-5g-sa
make stop-5g-sa
```

Antes de iniciar, edita `deployments/5g-sa/.env` y define valores de prueba para `SUBSCRIBER_KEY` y `SUBSCRIBER_OPC`. No uses claves reales ni IMSI reales sin anonimizar.

## Archivos editables principales

```bash
nano deployments/5g-sa/open5gs/amf.yaml
nano deployments/5g-sa/open5gs/smf.yaml
nano deployments/5g-sa/ueransim/gnb.yaml
nano deployments/5g-sa/ueransim/ue.yaml
```

Estos archivos son permanentes y no se generan automáticamente.

## Escenarios

- `deployments/5g-sa`: objetivo inicial.
- `deployments/4g-volte`: reservado para una etapa posterior.
- `deployments/5g-vonr`: reservado para una etapa posterior.

## Backend FastAPI

El backend mínimo administra el despliegue 5G SA reutilizando los scripts validados en `deployments/5g-sa/scripts/`.

```bash
make backend-install
make backend-test
make backend-dev
```

API local:

```bash
curl http://127.0.0.1:8000/api/health
curl http://127.0.0.1:8000/api/deployments
curl -X POST http://127.0.0.1:8000/api/deployments/5g-sa/start
curl -X POST http://127.0.0.1:8000/api/deployments/5g-sa/validate
curl -X POST http://127.0.0.1:8000/api/deployments/5g-sa/stop
```

Ver detalles en `docs/backend.md`.

## Aplicación Web Dockerizada

```bash
cp .env.app.example .env.app
make app-up
```

Antes de iniciar, edita `.env.app` y define `LAIN5G_PROJECT_ROOT` con la ruta absoluta del repositorio.

Interfaz local:

```text
http://127.0.0.1:8080
```

Ver detalles en `docs/frontend.md` y `docs/dockerized_app.md`.
