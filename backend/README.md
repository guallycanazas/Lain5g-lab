# Lain5G-Lab Backend

Backend FastAPI mínimo para administrar el despliegue 5G SA existente mediante los scripts ya validados en `deployments/5g-sa/scripts/`.

## Desarrollo

```bash
make backend-install
make backend-dev
```

## Pruebas

```bash
make backend-test
make backend-cov
```

La API no inicia Docker durante el arranque. Las operaciones reales se ejecutan solo al llamar endpoints de despliegue.
