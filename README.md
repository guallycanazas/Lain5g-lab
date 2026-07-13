# Lain5G-Lab

Lain5G-Lab es un entorno de investigación reproducible para desplegar, administrar y validar escenarios de laboratorio 4G LTE/EPC/IMS y 5G SA. Integra componentes abiertos ya existentes, principalmente Open5GS, UERANSIM, srsRAN y UHD, y añade una capa propia de configuración, automatización, validación, trazabilidad de ejecuciones y una interfaz React + FastAPI.

El repositorio no implementa un core 4G/5G ni una pila RAN desde cero. Su contribución es hacer reproducible la integración de esos componentes en escenarios aislados, con separación de redes Docker, validación por evidencias, configuración declarativa y protecciones para RF.

## Alcance científico y contribución

La contribución de Lain5G-Lab es una base experimental para estudiar y repetir flujos de despliegue y validación de redes celulares privadas de laboratorio. El software aporta:

- Escenarios Docker aislados para 5G SA software, 4G LTE/EPC/IMS software y rutas X310 controladas.
- Configuración local separada de los valores versionados, para no publicar claves, IMSI, MSISDN, planes de canal ni autorizaciones RF.
- Scripts de validación que distinguen `PASS`, `FAIL`, `WARNING` y `NOT_TESTED` y guardan evidencia en `runs/`.
- API FastAPI e interfaz React que reutilizan los flujos validados de terminal en lugar de duplicar lógica de despliegue.
- Guardas para RF: autorización explícita, manifest de seguridad, duración finita, auto-stop, logs y parada de emergencia.

Lain5G-Lab no es un producto de red móvil para producción, una implementación de referencia 3GPP ni una herramienta de certificación o conformidad. Los resultados obtenidos con el laboratorio dependen del host, la red Ethernet, el SDR, el entorno RF, el UE y las versiones fijadas de las dependencias.

## Estado y madurez de escenarios

| Escenario | Propósito | Estado reproducible | Limitaciones actuales |
| --- | --- | --- | --- |
| `5g-sa` | Core Open5GS, gNB y UE UERANSIM | Principal escenario software; valida registro, sesión PDU e IP cuando se cumplen todas las evidencias | Solo simulación software; no demuestra rendimiento ni conformidad con UE comercial |
| `4g-volte/sim` | EPC/IMS con RAN software | Disponible para pruebas de EPC, datos e IMS básico | VoLTE extremo a extremo requiere evidencia SIP/RTP adicional |
| `4g-volte/x310` | LTE con USRP X310 | Ruta de laboratorio con preflight y RF bloqueada por defecto | Requiere autorización, atenuación/aislamiento y validación específica del equipo |
| `5g-sa-x310` | 5G SA con USRP X310 y srsRAN Project | Experimental; incluye imagen UHD, core 5G, preflight, auto-stop y logs | No debe afirmarse registro de UE comercial, sesión PDU ni rendimiento estable sin evidencia de la ejecución publicada |
| `5g-vonr` | Preparación de VoNR software | Experimental | No debe presentarse como VoNR completo validado |

La evidencia mínima de éxito del escenario software 5G SA es: core iniciado, NG Setup, UE registrado, sesión PDU, interfaz TUN, IP asignada y ping desde el UE. Tener contenedores activos no es suficiente. Consulte `docs/validation.md`.

## Arquitectura

- Open5GS proporciona funciones de core 4G/5G y MongoDB almacena sus suscriptores.
- UERANSIM proporciona gNB y UE software en los escenarios simulados.
- srsRAN 4G y srsRAN Project proporcionan las rutas SDR para X310.
- UHD proporciona acceso a USRP sin actualizar firmware ni FPGA automáticamente.
- Kamailio y CoreDNS proporcionan servicios IMS mínimos para 4G.
- Docker Compose crea redes y volúmenes por escenario para evitar interferencias.
- `backend/` contiene la API FastAPI y `frontend/` la interfaz React.
- `runs/` contiene artefactos de validación locales; se ignora en Git para evitar publicar datos de operación.

La arquitectura detallada está en `docs/architecture.md`; las dependencias y avisos de licencias están en `THIRD_PARTY_NOTICES.md`.

## Requisitos

### Escenarios software

- Host GNU/Linux x86_64 con Docker Engine y Docker Compose v2.
- `make`, Git y acceso a Internet durante la primera construcción de imágenes.
- Kernel con SCTP y `/dev/net/tun` disponibles.
- Python 3 para backend y Node.js/npm para frontend, solo si se ejecutan fuera de Docker.
- Espacio de disco suficiente para imágenes, repositorios fuente compilados y volúmenes Docker.

Las versiones de software de radio y core se fijan en los Dockerfiles. Revise `docs/versions.md` y los `Dockerfile` antes de comparar resultados entre hosts.

### Escenarios USRP X310

Además de los requisitos anteriores:

- USRP X310 autorizado para el laboratorio, con FPGA/firmware compatible y daughterboards adecuados para la banda de prueba.
- Interfaz Ethernet dedicada, dirección IP en la subred del USRP y MTU compatible con el flujo UHD. Para flujos jumbo se requiere soporte extremo a extremo; la configuración del host debe verificarse antes de RF.
- Permisos para Docker, `NET_ADMIN`, prioridades de tiempo real y, cuando aplique, `cpupower`.
- Entorno conducido, blindado o formalmente autorizado, según normativa aplicable y política institucional.
- Manifiesto local de seguridad, plan de canal y confirmación explícita del operador.

No ejecute RF en bandas licenciadas sin autorización legal, técnica e institucional. Los comandos RF están bloqueados por defecto y no se describen aquí como una receta de transmisión; use `docs/rf_safety.md`, `docs/x310_lte.md` y `docs/5g_x310_cots_ue_checklist.md`.

## Inicio rápido: 5G SA software

Use valores de laboratorio no sensibles. Los archivos `.env` están ignorados por Git.

```bash
cp deployments/5g-sa/.env.example deployments/5g-sa/.env
make build-5g-sa
make start-5g-sa
make status-5g-sa
make validate-5g-sa
make logs-5g-sa
make stop-5g-sa
```

Antes de iniciar, defina `SUBSCRIBER_KEY` y `SUBSCRIBER_OPC` de laboratorio en `deployments/5g-sa/.env`. No use secretos, IMSI ni MSISDN de usuarios reales. Los archivos que normalmente se modifican son:

- `deployments/5g-sa/open5gs/amf.yaml`
- `deployments/5g-sa/open5gs/smf.yaml`
- `deployments/5g-sa/open5gs/upf.yaml`
- `deployments/5g-sa/ueransim/gnb.yaml`
- `deployments/5g-sa/ueransim/ue.yaml`

La guía del escenario está en `docs/5g_sa.md`.

## Escenarios 4G y X310 sin RF

Para 4G software:

```bash
cp deployments/4g-volte/common/.env.example deployments/4g-volte/common/.env
make build-4g-volte-sim
make start-4g-volte-sim
make validate-4g-volte-sim
make stop-4g-volte-sim
```

Para inspección no transmisora de 5G X310:

```bash
make build-5g-x310
make check-5g-x310
make preflight-5g-x310
make start-5g-x310-core
make dry-run-5g-x310
```

`dry-run-5g-x310` no transmite RF. La preparación completa de X310 se documenta en `docs/5g_x310_cots_ue_checklist.md`.

## Pruebas y validación reproducible

Instale dependencias de desarrollo y ejecute pruebas de backend:

```bash
make backend-install
make backend-test
make backend-cov
```

Para frontend:

```bash
make frontend-install
make frontend-test
make frontend-build
```

Para reproducibilidad estricta del frontend, use el lockfile con `npm ci` desde `frontend/`. Los comandos específicos de escenarios están en el `Makefile`, incluidos `test-4g-volte-sim`, `test-4g-lte-x310`, `test-5g-vonr-sim` y `test-5g-x310`.

Las validaciones deben conservar:

- La revisión Git exacta y las versiones de imágenes usadas.
- El comando ejecutado, fecha, sistema operativo, CPU, memoria, NIC/MTU y, para SDR, modelo/FPGA/daughterboard.
- Los archivos `runs/<run-id>/validation.json` y logs anonimizados relevantes.
- La configuración no sensible necesaria para repetir el escenario.
- Criterios de éxito y fallo, incluido el resultado de registro UE, sesión PDU, ping y métricas RF.

No publique `.env`, claves de suscriptor, IMSI/MSISDN reales, direcciones de infraestructura privada, planes RF operativos ni manifiestos de autorización.

## API y aplicación web

El backend administra el escenario 5G SA reutilizando scripts validados:

```bash
make backend-install
make backend-dev
curl http://127.0.0.1:8000/api/health
```

La aplicación Dockerizada requiere un archivo local `.env.app`:

```bash
cp .env.app.example .env.app
make app-up
```

La interfaz queda disponible en `http://127.0.0.1:8080`. Consulte `docs/backend.md`, `docs/frontend.md`, `docs/dockerized_app.md` y `docs/subscribers.md`.

## Seguridad, datos y trazabilidad

- La RF requiere guardas explícitas, duración finita y auto-stop; consulte `docs/rf_safety.md`.
- Las rutas X310 no actualizan firmware ni FPGA automáticamente.
- Los datos de suscriptores son datos de laboratorio y deben anonimizarse antes de cualquier publicación.
- El repositorio usa perfiles de ejemplo y archivos locales ignorados para separar software publicable de operación del laboratorio.
- La limpieza destructiva de Docker no forma parte de los flujos automatizados de escenario.

## Licencia, dependencias y citación

El código propio de Lain5G-Lab se distribuye bajo licencia MIT; consulte `LICENSE`. Las dependencias integradas conservan sus propias licencias y condiciones. Antes de una distribución académica o industrial, revise `THIRD_PARTY_NOTICES.md` y confirme la compatibilidad de las imágenes y artefactos redistribuidos con las licencias upstream.

Todavía no existe un `CITATION.cff` ni DOI de versión archivada. Antes de citar o enviar una versión a una revista, cree una release inmutable, archive esa release en Zenodo u otro repositorio con DOI y añada `CITATION.cff` con autores, ORCID, versión, fecha, URL y DOI.

## Preparación para SoftwareX

SoftwareX requiere un artículo descriptivo de hasta 4000 palabras y una distribución de software open source con material de soporte. La entrega debe demostrar relevancia científica, disponibilidad pública, validación y potencial de reutilización. El manuscrito debe usar la plantilla vigente de SoftwareX e incluir, como mínimo, resumen de hasta 250 palabras, de 1 a 7 palabras clave en inglés, declaración de disponibilidad de datos y las declaraciones editoriales aplicables. Los highlights son recomendados: 3 a 5 viñetas, cada una de hasta 85 caracteres. Para una versión apta para revisión se necesita completar, como mínimo:

1. Crear una release inmutable con tag semántico, changelog, hash de commit y DOI archivado.
2. Añadir `CITATION.cff`, autores/ORCID, contacto de mantenimiento y política de contribución.
3. Añadir integración continua que ejecute las pruebas backend/frontend y validaciones estáticas en un clon limpio.
4. Fijar de forma reproducible dependencias Python, Node y bases de imágenes; documentar SO, CPU, memoria, Docker y red usados para los experimentos.
5. Publicar un protocolo experimental reproducible con entradas anonimizadas, comandos, criterios de éxito, resultados esperados y logs o tablas de resultados anonimizados.
6. Incluir casos de uso y evaluación cuantitativa. Para X310: registro UE, sesión PDU, conectividad, pérdida, latencia, throughput, estabilidad RF y configuración de red/MTU, comparados bajo condiciones declaradas.
7. Separar de forma explícita resultados de simulación, SDR y UE comercial; no extrapolar resultados de un escenario a otro.
8. Completar revisión de licencias y procedencia de imágenes, generar un SBOM y definir el método de redistribución de componentes AGPL/GPL y binarios compilados.
9. Traducir al inglés la documentación principal y preparar el manuscrito con la plantilla vigente de SoftwareX, con resumen, palabras clave, highlights, figuras reproducibles, disponibilidad de código/datos y declaración de conflictos, financiación y uso de IA si corresponde.
10. Añadir una guía de seguridad, gobernanza y soporte: `CONTRIBUTING.md`, `SECURITY.md`, política de versiones y canal de incidencias.

La [guía editorial oficial de SoftwareX](https://www.sciencedirect.com/journal/softwarex/publish/guide-for-authors) debe comprobarse inmediatamente antes del envío, ya que los requisitos pueden cambiar.

## Documentación

- `docs/installation.md`: instalación y configuración inicial.
- `docs/architecture.md`: componentes y fronteras del proyecto.
- `docs/validation.md`: evidencias de validación esperadas.
- `docs/configuration.md`: perfiles y configuración.
- `docs/troubleshooting.md`: diagnóstico de problemas.
- `docs/4g_volte.md`, `docs/4g_simulation.md`, `docs/ims.md` y `docs/volte_validation.md`: 4G/IMS.
- `docs/x310_lte.md`, `docs/5g_x310_cots_ue_checklist.md` y `docs/rf_safety.md`: SDR y seguridad RF.
- `docs/versions.md` y `docs/third_party.md`: versiones y dependencias.
