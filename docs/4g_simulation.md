# 4G Software Simulation

`4g-volte-sim` ejecuta una ruta 4G aislada con Open5GS EPC, IMS mínimo, srsENB y srsUE.

## Uso

```bash
cp deployments/4g-volte/common/.env.example deployments/4g-volte/common/.env
nano deployments/4g-volte/common/.env
make build-4g-volte-sim
make start-4g-volte-sim
make status-4g-volte-sim
make validate-4g-volte-sim
make logs-4g-volte-sim
make stop-4g-volte-sim
```

## Validación

`make validate-4g-volte-sim` revisa servicios EPC, servicios IMS, evidencia S1, registro UE, bearer, interfaz UE, ping de datos y evidencia SIP si existe.

Estados posibles: `PASS`, `FAIL`, `WARNING`, `NOT_TESTED`.

El resultado se guarda en `runs/<run-id>/validation.json`.

## Notas

- `pgwc` y `pgwu` son nombres de servicio Compose. En Open5GS `v2.7.5` ejecutan `open5gs-smfd` y `open5gs-upfd` porque esa versión no instala binarios `open5gs-pgwcd` ni `open5gs-pgwud`.
- El IMS incluido es mínimo para laboratorio y no implica VoLTE completo por sí solo.
- Si se detiene el escenario, los contenedores de 4G se paran sin tocar `5g-sa`.
