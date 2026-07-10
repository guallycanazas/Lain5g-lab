# Installation

## Requisitos

- Docker con soporte de Compose v2.
- Kernel con SCTP y `/dev/net/tun` disponible.
- Acceso a Internet para clonar y compilar Open5GS y UERANSIM durante `make build-5g-sa`.
- Para X310: red host preparada para USRP y herramientas UHD en host si se desea validar hardware fuera del contenedor.

## Construcción

```bash
make build-5g-sa
```

Para 4G software:

```bash
make build-4g-volte-sim
```

Para 4G X310:

```bash
make build-4g-lte-x310
```

La imagen X310 compila UHD y puede tardar bastante más que la ruta software.

Esto crea imágenes locales:

- `lain5g-lab/open5gs:local`
- `lain5g-lab/ueransim:local`
- `lain5g-lab/srsran4g-sim:local`
- `lain5g-lab/srsran4g-uhd:local`
- `lain5g-lab/kamailio:local`
- `lain5g-lab/ims-dns:local`

Las imágenes se construyen desde repositorios oficiales, no desde imágenes de terceros.

## Configuración inicial

```bash
cp deployments/5g-sa/.env.example deployments/5g-sa/.env
nano deployments/5g-sa/.env
```

Define `SUBSCRIBER_KEY` y `SUBSCRIBER_OPC` con valores de laboratorio de 32 caracteres hexadecimales. No uses claves reales.

Para 4G:

```bash
cp deployments/4g-volte/common/.env.example deployments/4g-volte/common/.env
nano deployments/4g-volte/common/.env
```

Los archivos RF reales `channel-plan.yaml` y `safety-manifest.yaml` no se versionan; ver `docs/rf_safety.md`.
