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

Kamailio se utiliza para los servicios IMS mínimos del escenario 4G LTE/IMS.

- Proyecto: https://www.kamailio.org/

## srsRAN

srsRAN 4G se utiliza para la ruta LTE software y para la preparación eNB X310. La ruta RF está bloqueada por defecto y requiere autorización explícita.

- Proyecto: https://www.srsran.com/

## UHD

UHD se utiliza en la imagen X310 para comunicación con USRP. Lain5G-Lab no actualiza firmware ni FPGA automáticamente.

- Proyecto: https://github.com/EttusResearch/uhd

## CoreDNS

CoreDNS se utiliza como DNS IMS de laboratorio en el escenario 4G.

- Proyecto: https://coredns.io/

## herlesupreeth/docker_open5gs

El paquete IMS real importa una instantánea revisada de configuraciones BSD-2-Clause de `herlesupreeth/docker_open5gs` y utiliza imágenes upstream fijadas por digest para Open5GS, Kamailio, pyHSS y MySQL. La procedencia y los hashes se registran en `deployments/ims-real/config-provenance.json`; las imágenes base se registran en `deployments/ims-real/images.lock.yaml`.

- Proyecto: https://github.com/herlesupreeth/docker_open5gs
- Licencia de las configuraciones importadas: BSD-2-Clause.

## pyHSS

pyHSS proporciona HSS IMS y aprovisionamiento interno en el paquete IMS real. Su API no se publica en el host.

- Proyecto: https://github.com/nickvsnetworking/pyhss
- Licencia: AGPL-3.0 según el proyecto upstream.

## RTPengine

RTPengine proporciona el relay de medios del paquete IMS real.

- Proyecto: https://github.com/sipwise/rtpengine
- Licencia: GPL-3.0 según el proyecto upstream.
