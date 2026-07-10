# X310 LTE

`4g-lte-x310` prepara un eNB LTE con srsRAN 4G y UHD para USRP X310. El EPC e IMS pueden iniciarse sin RF; el eNB RF está en un perfil Compose separado llamado `rf`.

## Comandos Sin RF

```bash
make build-4g-lte-x310
make check-x310
make preflight-4g-lte-x310
make start-4g-lte-x310-epc
make status-4g-lte-x310
make stop-4g-lte-x310
```

## Inicio RF

No ejecutes RF hasta completar `docs/rf_safety.md`.

Requisitos mínimos:

- `deployments/4g-volte/x310/rf/channel-plan.yaml` creado desde el ejemplo y revisado.
- `deployments/4g-volte/x310/rf/safety-manifest.yaml` creado desde el ejemplo y con `authorization_confirmed: true`.
- `LAIN5G_ALLOW_RF_START=true` definido solo para la ejecución autorizada.
- Duración finita mediante `maximum_duration_seconds`.

Comando:

```bash
LAIN5G_ALLOW_RF_START=true make start-4g-lte-x310-rf
```

El script ejecuta preflight, arranca solo `enb-x310`, espera la duración definida y ejecuta auto-stop.

## Limitaciones Detectadas

En este host no se detectaron `uhd_find_devices`, `uhd_usrp_probe` ni `uhd_config_info` en `PATH`. Por eso la versión UHD host y el estado FPGA real del X310 no pudieron validarse desde esta sesión.

La imagen UHD no actualiza FPGA ni firmware al iniciar.
