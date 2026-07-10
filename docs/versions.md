# Versiones

## Componentes Existentes

- Open5GS: `v2.7.5`, definido por `OPEN5GS_VERSION` en `images/open5gs/Dockerfile`.
- UERANSIM: `v3.2.6`, usado únicamente por el escenario `5g-sa`.

La imagen local `lain5g-lab/open5gs:local` contiene los binarios EPC `open5gs-mmed`, `open5gs-hssd`, `open5gs-sgwcd`, `open5gs-sgwud`, `open5gs-pcrfd`, `open5gs-smfd` y `open5gs-upfd`. Open5GS `v2.7.5` no instala `open5gs-pgwcd` ni `open5gs-pgwud`; el perfil 4G nombra los servicios `pgwc` y `pgwu`, pero ejecuta `open5gs-smfd` y `open5gs-upfd` como plano PGW compatible con la versión actual.

## Versiones Nuevas Fijadas

- srsRAN 4G: `release_23_11`, repositorio `https://github.com/srsran/srsRAN_4G.git`.
- UHD: `v4.6.0.0`, repositorio `https://github.com/EttusResearch/uhd.git`.
- Kamailio: `5.8.8`, compilado desde `https://github.com/kamailio/kamailio.git`.
- IMS DNS: `coredns/coredns:1.11.3`.

## X310

El host actual no expone `uhd_find_devices`, `uhd_usrp_probe` ni `uhd_config_info` en `PATH`, por lo que la versión UHD host y FPGA X310 no pudieron detectarse desde esta sesión.

La ruta X310 no actualiza firmware ni FPGA automáticamente. Cualquier actualización debe ejecutarse manualmente y fuera de esta entrega bajo autorización del laboratorio.
