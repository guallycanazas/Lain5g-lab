# IMS

El escenario 4G incluye un IMS mínimo para laboratorio:

- `pcscf` con Kamailio.
- `icscf` con Kamailio.
- `scscf` con Kamailio.
- `ims-database` con esquema SQL inicial.
- `dns` con CoreDNS para dominios IMS de laboratorio.

## Configuración

Los dominios IMS se definen en `deployments/4g-volte/common/.env`:

```bash
IMS_DOMAIN=ims.mnc001.mcc001.3gppnetwork.org
PCSCF_DOMAIN=pcscf.ims.mnc001.mcc001.3gppnetwork.org
ICSCF_DOMAIN=icscf.ims.mnc001.mcc001.3gppnetwork.org
SCSCF_DOMAIN=scscf.ims.mnc001.mcc001.3gppnetwork.org
```

El provisionamiento inicial vive en:

- `deployments/4g-volte/common/provisioning/ims-subscriber-init.sql`.
- `deployments/4g-volte/common/ims/database/init.sql`.
- `deployments/4g-volte/common/ims/dns/Corefile`.
- `deployments/4g-volte/common/ims/dns/ims.hosts`.

## Alcance

IMS corriendo no equivale a VoLTE completo. La validación completa requiere señalización SIP de llamada y RTP bidireccional; ver `docs/volte_validation.md`.
