# Installation

## Requisitos

- Docker con soporte de Compose v2.
- Kernel con SCTP y `/dev/net/tun` disponible.
- Acceso a Internet para clonar y compilar Open5GS y UERANSIM durante `make build-5g-sa`.

## Construcción

```bash
make build-5g-sa
```

Esto crea imágenes locales:

- `lain5g-lab/open5gs:local`
- `lain5g-lab/ueransim:local`

Las imágenes se construyen desde repositorios oficiales, no desde imágenes de terceros.

## Configuración inicial

```bash
cp deployments/5g-sa/.env.example deployments/5g-sa/.env
nano deployments/5g-sa/.env
```

Define `SUBSCRIBER_KEY` y `SUBSCRIBER_OPC` con valores de laboratorio de 32 caracteres hexadecimales. No uses claves reales.
