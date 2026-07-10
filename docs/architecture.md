# Architecture

Lain5G-Lab no implementa un núcleo 4G/5G propio. Utiliza componentes externos y aporta una capa propia de despliegue, configuración, administración, validación y visualización.

La primera versión contiene solo el despliegue terminal 5G SA.

## Componentes 5G SA

- MongoDB almacena datos de Open5GS, incluido el suscriptor de laboratorio.
- Open5GS ejecuta NRF, AMF, SMF, UPF, AUSF, UDM, UDR y PCF.
- UERANSIM ejecuta gNB y UE software.
- Docker Compose conecta todos los servicios en la red `lain5g-lab-5g-sa-core`.
- `runs/` almacena resultados mínimos por ejecución, sin copiar configuraciones completas ni código.

## Fuera de alcance actual

- VoLTE y VoNR no están implementados.
- No hay Kubernetes, microservicios ni Electron.
- No se ejecuta RF ni se automatizan SDR.
- Backend y frontend se implementarán solo después de validar 5G SA desde terminal.
