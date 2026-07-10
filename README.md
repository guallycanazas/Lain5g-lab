# Lain5G-Lab

Lain5G-Lab es una plataforma sencilla, entendible y mantenible para desplegar, administrar y validar laboratorios 4G y 5G basados en Open5GS, UERANSIM y, en etapas futuras, componentes IMS.

Lain5G-Lab no implementa un núcleo 4G/5G propio. Utiliza componentes externos y aporta una capa propia de despliegue, configuración, administración, validación y visualización.

## Estado actual

La primera entrega se centra exclusivamente en 5G SA con Open5GS y UERANSIM desde terminal. VoLTE, VoNR, frontend, backend y RF quedan fuera de esta primera etapa hasta validar 5G SA con evidencia real.

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
