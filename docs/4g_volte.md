# 4G LTE, IMS y Preparación VoLTE

El escenario `deployments/4g-volte` agrega una ruta 4G aislada del despliegue `5g-sa`. No reutiliza redes, volúmenes ni nombres de proyecto Compose de 5G SA.

Perfiles disponibles:

- `4g-volte-sim`: EPC + IMS + srsRAN 4G en modo software.
- `4g-lte-x310`: EPC + IMS + eNB srsRAN 4G para USRP X310, con RF bloqueada por defecto.

## Alcance Actual

- EPC 4G basado en Open5GS `v2.7.5`.
- IMS mínimo con Kamailio `5.8.8` y base SQL inicial.
- Provisionamiento de APN `internet` e `ims` para un suscriptor de laboratorio.
- Validaciones estáticas y scripts operativos desde terminal.
- Sin integración API/frontend para 4G en esta etapa.

## Límites

- No se declara llamada VoLTE completa todavía.
- No se inicia RF sin manifiesto real, plan de canal real y autorización explícita.
- La ruta X310 no actualiza firmware ni FPGA automáticamente.

No se declarará llamada VoLTE completa sin evidencia de `INVITE`, `100 Trying`, `180 Ringing`, `200 OK`, `ACK`, RTP bidireccional y `BYE`.

## Preparación

```bash
cp deployments/4g-volte/common/.env.example deployments/4g-volte/common/.env
nano deployments/4g-volte/common/.env
```

Define claves de laboratorio para `SUBSCRIBER_KEY` y `SUBSCRIBER_OPC`. No uses IMSI, Ki, OPc ni MSISDN reales sin anonimizar.

## Comandos Principales

```bash
make build-4g-volte-sim
make start-4g-volte-sim
make validate-4g-volte-sim
make stop-4g-volte-sim
```

```bash
make build-4g-lte-x310
make check-x310
make preflight-4g-lte-x310
make start-4g-lte-x310-epc
```

El inicio RF real usa `make start-4g-lte-x310-rf` y está documentado en `docs/x310_lte.md` y `docs/rf_safety.md`.
