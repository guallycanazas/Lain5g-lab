# Lain5G-Lab Frontend

Frontend React + TypeScript para administrar el despliegue 5G SA mediante la API FastAPI.

## Desarrollo

```bash
make frontend-install
make frontend-dev
```

## Pruebas y Build

```bash
make frontend-test
make frontend-build
```

## Suscriptores

La ruta `/subscribers` permite listar, crear, editar, clonar y eliminar documentos de suscriptor Open5GS a través de FastAPI.

El frontend no recibe ni almacena secretos completos. Los campos K, OP y OPc solo se envían durante creación o edición y no se guardan en `localStorage` ni aparecen en URLs.
