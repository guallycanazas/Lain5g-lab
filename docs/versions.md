# Versiones y trazabilidad

Las versiones se definen en los Dockerfiles. Para reproducir un experimento se debe registrar el commit Git de Lain5G-Lab, el identificador inmutable de cada imagen Docker y los argumentos de construcción usados.

## Componentes software

- Open5GS: `v2.7.5`, definido por `OPEN5GS_VERSION` en `images/open5gs/Dockerfile`.
- UERANSIM: `v3.2.6`, usado por el escenario `5g-sa` y definido en `images/ueransim/Dockerfile`.
- srsRAN 4G: `release_23_11`, definido por `SRSRAN_4G_VERSION` en `images/srsran4g-uhd/Dockerfile`. El argumento `SRSRAN_4G_COMMIT` no tiene un valor por defecto; para una publicación reproducible debe fijarse un commit inmutable.
- srsRAN Project: `release_24_10_1`, commit `ef4b0749a12a3b1a8347ae01c937a621603b4069`, definido en `images/srsranproject-uhd/Dockerfile`.
- UHD: `v4.10.0.0` en las imágenes SDR `images/srsran4g-uhd` e `images/srsranproject-uhd`.
- Kamailio: `5.8.8`, compilado desde `https://github.com/kamailio/kamailio.git`.
- IMS DNS: `coredns/coredns:1.11.3`.

La imagen local `lain5g-lab/open5gs:local` contiene los binarios EPC `open5gs-mmed`, `open5gs-hssd`, `open5gs-sgwcd`, `open5gs-sgwud`, `open5gs-pcrfd`, `open5gs-smfd` y `open5gs-upfd`. Open5GS `v2.7.5` no instala `open5gs-pgwcd` ni `open5gs-pgwud`; el perfil 4G nombra los servicios `pgwc` y `pgwu`, pero ejecuta `open5gs-smfd` y `open5gs-upfd` como plano PGW compatible con esa versión.

## X310

Las comprobaciones de hardware usan `uhd_find_devices` y `uhd_usrp_probe` desde la imagen local UHD cuando el host no expone esas herramientas en `PATH`. Las validaciones deben registrar dirección de gestión anonimizada cuando sea necesario, versión de FPGA, daughterboards, MTU y velocidad de enlace.

Lain5G-Lab no actualiza firmware ni FPGA automáticamente. Cualquier actualización debe ejecutarse manualmente, documentarse como parte del experimento y contar con autorización del laboratorio.

## Recomendación para releases científicas

Antes de publicar resultados, capture `docker image inspect` para cada imagen `:local` y archive sus digest junto con el tag Git. Los tags locales no sustituyen un digest ni una release archivada con DOI.
