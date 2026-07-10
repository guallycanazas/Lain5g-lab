# Architecture

Lain5G-Lab no implementa un núcleo 4G/5G propio. Utiliza componentes externos y aporta una capa propia de despliegue, configuración, administración, validación y visualización.

La arquitectura separa escenarios por carpetas, proyectos Compose, redes y volúmenes para evitar interferencia entre 5G SA y 4G LTE/IMS.

## Componentes 5G SA

- MongoDB almacena datos de Open5GS, incluido el suscriptor de laboratorio.
- Open5GS ejecuta NRF, AMF, SMF, UPF, AUSF, UDM, UDR y PCF.
- UERANSIM ejecuta gNB y UE software.
- Docker Compose conecta todos los servicios en la red `lain5g-lab-5g-sa-core`.
- `runs/` almacena resultados mínimos por ejecución, sin copiar configuraciones completas ni código.

## Componentes 4G LTE/IMS

- Open5GS ejecuta MME, HSS, SGW-C, SGW-U, PCRF y plano PGW compatible con la versión actual.
- srsRAN 4G ejecuta eNB y UE en la ruta software.
- Kamailio ejecuta P-CSCF, I-CSCF y S-CSCF mínimos.
- CoreDNS resuelve nombres IMS de laboratorio.
- La ruta X310 separa `enb-x310` en perfil Compose `rf` y `network_mode: host`.
- Los manifiestos RF reales están ignorados por Git y deben crearse manualmente.

## Fuera de alcance actual

- VoLTE completo y VoNR completo no están implementados.
- No hay Kubernetes, microservicios ni Electron.
- No se ejecuta RF sin autorización explícita y preflight.
- La gestión API/frontend de 4G queda fuera de esta etapa.
