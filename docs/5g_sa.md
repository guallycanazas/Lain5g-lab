# 5G SA

5G SA es la prioridad inicial del proyecto.

## Comandos

```bash
cp deployments/5g-sa/.env.example deployments/5g-sa/.env
make build-5g-sa
make start-5g-sa
make status-5g-sa
make validate-5g-sa
make logs-5g-sa
make stop-5g-sa
```

## Archivos editables

- `deployments/5g-sa/open5gs/amf.yaml`
- `deployments/5g-sa/open5gs/smf.yaml`
- `deployments/5g-sa/open5gs/upf.yaml`
- `deployments/5g-sa/ueransim/gnb.yaml`
- `deployments/5g-sa/ueransim/ue.yaml`
- `deployments/5g-sa/.env`

Estos archivos no se generan automáticamente.

## Evidencia esperada

La validación solo debe considerarse completa si hay evidencia real de:

- Open5GS iniciado.
- gNB conectado al AMF.
- UE registrado.
- sesión PDU establecida.
- interfaz `uesimtun0` creada.
- IP asignada al UE.
- ping exitoso desde el UE.

Contenedores activos por sí solos no validan el escenario.
