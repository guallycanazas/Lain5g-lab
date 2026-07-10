SHELL := /bin/bash

.PHONY: build-5g-sa start-5g-sa stop-5g-sa restart-5g-sa status-5g-sa logs-5g-sa validate-5g-sa clean-5g-sa backend-install backend-dev backend-test backend-cov

build-5g-sa:
	@if [ "$${LAIN5G_DRY_RUN:-false}" = "true" ]; then \
		echo "docker build -t lain5g-lab/open5gs:local images/open5gs"; \
		echo "docker build -t lain5g-lab/ueransim:local images/ueransim"; \
	else \
		docker build -t lain5g-lab/open5gs:local images/open5gs && \
		docker build -t lain5g-lab/ueransim:local images/ueransim; \
	fi

start-5g-sa:
	@deployments/5g-sa/scripts/start.sh

stop-5g-sa:
	@deployments/5g-sa/scripts/stop.sh

restart-5g-sa:
	@deployments/5g-sa/scripts/restart.sh

status-5g-sa:
	@deployments/5g-sa/scripts/status.sh

logs-5g-sa:
	@deployments/5g-sa/scripts/logs.sh

validate-5g-sa:
	@deployments/5g-sa/scripts/validate.sh

clean-5g-sa:
	@if [ "$${LAIN5G_DRY_RUN:-false}" = "true" ]; then \
		echo "docker compose --env-file deployments/5g-sa/.env -f deployments/5g-sa/docker-compose.yml down -v --remove-orphans"; \
	else \
		docker compose --env-file deployments/5g-sa/.env -f deployments/5g-sa/docker-compose.yml down -v --remove-orphans; \
	fi

backend-install:
	python3 -m venv .venv
	.venv/bin/pip install -r backend/requirements.txt -r backend/requirements-dev.txt

backend-dev:
	.venv/bin/uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

backend-test:
	.venv/bin/pytest backend/tests

backend-cov:
	.venv/bin/pytest --cov=backend/app --cov-report=term-missing backend/tests
