# VoLTE Validation

Estado actual: preparación 4G LTE/IMS. No hay afirmación de llamada VoLTE completa.

## Evidencia Mínima Para Declarar VoLTE

Se requiere capturar y conservar evidencia de:

- Registro LTE del UE.
- Bearer de datos y APN `ims` provisionado.
- `SIP REGISTER` exitoso.
- Flujo de llamada con `INVITE`, `100 Trying`, `180 Ringing`, `200 OK`, `ACK` y `BYE`.
- RTP bidireccional entre extremos.
- Logs de EPC, IMS, eNB y UE asociados al mismo `run-id`.

## Estados De Validación

- `PASS`: evidencia encontrada.
- `FAIL`: requisito obligatorio ausente o servicio crítico caído.
- `WARNING`: evidencia parcial o no concluyente.
- `NOT_TESTED`: la prueba no aplica o no se ejecutó.

## Salidas

Las validaciones escriben JSON en `runs/<run-id>/`. Estos archivos son evidencia operativa, no sustituyen una captura SIP/RTP completa.
