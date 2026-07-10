# Third Party Notices

Lain5G-Lab no implementa un núcleo 4G/5G propio. Utiliza componentes externos y aporta una capa propia de despliegue, configuración, administración, validación y visualización.

## Open5GS

Open5GS es utilizado como núcleo 4G/5G externo. La imagen local lo clona desde su repositorio oficial y lo compila desde una versión fijada.

- Proyecto: https://github.com/open5gs/open5gs
- Licencia: AGPL-3.0-or-later según el proyecto upstream.

## UERANSIM

UERANSIM es utilizado como simulador software de gNB y UE 5G SA. La imagen local lo clona desde su repositorio oficial y lo compila desde una versión fijada.

- Proyecto: https://github.com/aligungr/UERANSIM
- Licencia: GPL-3.0 según el proyecto upstream.

## MongoDB

MongoDB se utiliza como base de datos requerida por Open5GS.

- Proyecto: https://www.mongodb.com/
- Imagen Docker: https://hub.docker.com/_/mongo

## Docker

Docker y Docker Compose se utilizan para construir y ejecutar el laboratorio.

- Proyecto: https://www.docker.com/

## FastAPI

FastAPI está previsto para la etapa de backend posterior a la validación terminal de 5G SA.

- Proyecto: https://fastapi.tiangolo.com/

## PyMongo

PyMongo se utiliza en el backend para acceder a MongoDB de Open5GS sin agregar una segunda capa de persistencia.

- Proyecto: https://pymongo.readthedocs.io/

## dnspython

`dnspython` es una dependencia transitiva de PyMongo para resolución DNS.

- Proyecto: https://www.dnspython.org/

## React

React está previsto para la etapa de frontend posterior al backend.

- Proyecto: https://react.dev/

## Kamailio

Kamailio se considerará cuando se implemente IMS para VoLTE/VoNR. No forma parte de la primera entrega 5G SA.

- Proyecto: https://www.kamailio.org/

## srsRAN

srsRAN se considerará solo en etapas futuras. No se implementa RF ni transmisión radio en esta versión.

- Proyecto: https://www.srsran.com/

## herlesupreeth/docker_open5gs

El proyecto `herlesupreeth/docker_open5gs` se reconoce únicamente como referencia metodológica e histórica para despliegues Docker de Open5GS/IMS. Lain5G-Lab no copia sus carpetas completas ni reutiliza sus imágenes como base.

- Proyecto: https://github.com/herlesupreeth/docker_open5gs
