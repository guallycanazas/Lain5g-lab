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
