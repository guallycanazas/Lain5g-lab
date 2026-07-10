# Aplicación Dockerizada

El stack de aplicación dockerizado ejecuta dos servicios separados del laboratorio 5G SA:

- `frontend`: Nginx sirviendo la aplicación React y proxy `/api`.
- `backend`: FastAPI con Docker CLI para invocar los scripts existentes de `deployments/5g-sa`.

No reemplaza ni modifica `deployments/5g-sa/docker-compose.yml`.

## Preparación

```bash
cp .env.app.example .env.app
```

Edita `.env.app` y define `LAIN5G_PROJECT_ROOT` con la ruta absoluta del repositorio en el host:

```env
LAIN5G_PROJECT_ROOT=/home/gually/Lain5G-Lab
```

La ruta debe ser absoluta y debe coincidir con la ruta que ve el daemon Docker del host. Esto es necesario porque el backend usa `/var/run/docker.sock` y el compose de 5G SA contiene bind mounts relativos.

Si quieres que el backend ejecute comandos reales, prepara también el entorno del escenario:

```bash
cp deployments/5g-sa/.env.example deployments/5g-sa/.env
```

## Uso

```bash
make app-up
make app-ps
make app-logs
make app-down
```

Interfaz web:

```text
http://127.0.0.1:8080
```

API expuesta para depuración local:

```text
http://127.0.0.1:8000/api/health
```

## Build Manual

```bash
make app-build
```

Equivalente:

```bash
docker compose --env-file .env.app -f docker-compose.app.yml build
```

## Modo Dry-Run

Para probar la aplicación sin iniciar contenedores 5G SA reales:

```env
LAIN5G_DRY_RUN=true
```

En este modo el backend devuelve los comandos que habría ejecutado y las validaciones aparecen como `NOT_TESTED`.

## Seguridad Operativa

- El backend monta `/var/run/docker.sock`; cualquier usuario con acceso a este stack puede controlar Docker en el host.
- Expón la aplicación solo en redes confiables.
- `.env.app`, `backend/.env`, `frontend/.env` y `deployments/5g-sa/.env` no deben versionarse.
- No uses claves reales ni IMSI reales sin anonimizar en el laboratorio.

## Relación con el Laboratorio 5G SA

El backend llama a los scripts existentes:

```text
deployments/5g-sa/scripts/start.sh
deployments/5g-sa/scripts/stop.sh
deployments/5g-sa/scripts/restart.sh
deployments/5g-sa/scripts/status.sh
deployments/5g-sa/scripts/logs.sh
deployments/5g-sa/scripts/validate.sh
```

El stack de aplicación vive en `docker-compose.app.yml`. El stack operativo 5G SA sigue viviendo en `deployments/5g-sa/docker-compose.yml`.

## Gestión de Suscriptores

El backend usa `pymongo` para acceder al MongoDB de Open5GS cuando el laboratorio está activo. La app no depende de MongoDB para arrancar: si 5G SA está detenido, `/api/subscribers/connection` devuelve `disconnected` o `timeout` y el resto de la aplicación sigue funcionando.

La conexión se controla con:

```env
LAIN5G_OPEN5GS_MONGO_URI=mongodb://mongo:27017/open5gs
LAIN5G_OPEN5GS_MONGO_DATABASE=open5gs
LAIN5G_OPEN5GS_SUBSCRIBER_COLLECTION=subscribers
LAIN5G_OPEN5GS_DOCKER_NETWORK=lain5g-lab-5g-sa-core
```

El backend solo intenta unirse a la red Docker 5G SA cuando el contenedor MongoDB está en ejecución, para no reservar direcciones IP de la red antes del arranque del laboratorio.

Ver `docs/subscribers.md`.
