# Validation

La validación automática está en `deployments/5g-sa/scripts/validate.sh` y se ejecuta con:

```bash
make validate-5g-sa
```

Cada comprobación devuelve uno de estos estados:

- `PASS`
- `FAIL`
- `WARNING`
- `NOT_TESTED`

## Comprobaciones 5G SA

- MongoDB activo.
- NRF activo.
- AMF activo.
- SMF activo.
- UPF activo.
- AUSF activo.
- UDM activo.
- UDR activo.
- PCF activo.
- conexión NG entre gNB y AMF.
- registro del UE.
- establecimiento de sesión PDU.
- interfaz TUN `uesimtun0`.
- IP asignada al UE.
- ping desde el UE hacia `PING_TARGET`.

El resultado se guarda en `runs/<run-id>/validation.json`.

## Comprobaciones 4G LTE/IMS

```bash
make validate-4g-volte-sim
make validate-4g-lte-x310
```

La ruta software revisa EPC, IMS, evidencia S1, registro UE, bearer, interfaz UE, ping de datos y evidencia SIP cuando existe.

La ruta X310 separa validación de hardware, UHD, FPGA, EPC, IMS, preflight RF, auto-stop y logs del eNB. En modo seco se reporta `NOT_TESTED` sin iniciar RF.

La evidencia VoLTE completa requiere SIP de llamada y RTP bidireccional; ver `docs/volte_validation.md`.
