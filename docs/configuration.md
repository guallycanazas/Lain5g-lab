# Configuration

## Archivos que edita el usuario

- `deployments/5g-sa/.env`
- `deployments/5g-sa/open5gs/*.yaml`
- `deployments/5g-sa/ueransim/*.yaml`

## Archivos creados por el sistema

- `runs/<run-id>/metadata.json`
- `runs/<run-id>/validation.json`
- `runs/<run-id>/metrics.json`
- `runs/<run-id>/logs/docker-compose.log` cuando se ejecuta `make logs-5g-sa`.

## Cambios comunes

Para cambiar MCC, MNC, TAC, SST, SD y DNN, edita manualmente `.env`, los YAML de Open5GS y los YAML de UERANSIM. En la primera versión no hay plantillas ni generadores.

Para cambiar IMSI, edita:

- `SUBSCRIBER_IMSI` en `deployments/5g-sa/.env`.
- `supi` en `deployments/5g-sa/ueransim/ue.yaml`.
