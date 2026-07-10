SHELL := /bin/bash

.PHONY: build-5g-sa start-5g-sa stop-5g-sa restart-5g-sa status-5g-sa logs-5g-sa validate-5g-sa clean-5g-sa backend-install backend-dev backend-test backend-cov frontend-install frontend-dev frontend-build frontend-test app-build app-up app-down app-logs app-ps subscribers-test subscribers-integration-test build-4g-volte-sim start-4g-volte-sim stop-4g-volte-sim status-4g-volte-sim logs-4g-volte-sim validate-4g-volte-sim test-4g-volte-sim build-4g-lte-x310 check-x310 preflight-4g-lte-x310 start-4g-lte-x310-epc start-4g-lte-x310-rf emergency-stop-4g-lte-x310 stop-4g-lte-x310 status-4g-lte-x310 logs-4g-lte-x310 validate-4g-lte-x310 test-4g-lte-x310

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

frontend-install:
	cd frontend && npm install

frontend-dev:
	cd frontend && npm run dev

frontend-build:
	cd frontend && npm run build

frontend-test:
	cd frontend && npm test

app-build:
	@if [ ! -f .env.app ]; then \
		echo "Missing .env.app. Create it with: cp .env.app.example .env.app" >&2; \
		exit 2; \
	fi
	docker compose --env-file .env.app -f docker-compose.app.yml build

app-up:
	@if [ ! -f .env.app ]; then \
		echo "Missing .env.app. Create it with: cp .env.app.example .env.app" >&2; \
		exit 2; \
	fi
	docker compose --env-file .env.app -f docker-compose.app.yml up -d --build

app-down:
	@if [ ! -f .env.app ]; then \
		echo "Missing .env.app. Create it with: cp .env.app.example .env.app" >&2; \
		exit 2; \
	fi
	docker compose --env-file .env.app -f docker-compose.app.yml down

app-logs:
	@if [ ! -f .env.app ]; then \
		echo "Missing .env.app. Create it with: cp .env.app.example .env.app" >&2; \
		exit 2; \
	fi
	docker compose --env-file .env.app -f docker-compose.app.yml logs -f

app-ps:
	@if [ ! -f .env.app ]; then \
		echo "Missing .env.app. Create it with: cp .env.app.example .env.app" >&2; \
		exit 2; \
	fi
	docker compose --env-file .env.app -f docker-compose.app.yml ps

subscribers-test:
	.venv/bin/pytest backend/tests/test_open5gs_connection_service.py backend/tests/test_subscriber_service.py backend/tests/test_subscribers_api.py
	cd frontend && npm test -- subscribers

subscribers-integration-test:
	@if [ "$${LAIN5G_ALLOW_INTEGRATION_WRITES:-false}" != "true" ]; then \
		echo "Refusing to modify Open5GS MongoDB. Set LAIN5G_ALLOW_INTEGRATION_WRITES=true to run subscriber integration writes." >&2; \
		exit 2; \
	fi
	@echo "Run the documented subscriber integration workflow in docs/subscribers.md."

build-4g-volte-sim:
	docker build -t lain5g-lab/srsran4g-sim:local images/srsran4g-sim
	docker build -t lain5g-lab/kamailio:local images/kamailio
	docker build -t lain5g-lab/ims-dns:local images/ims-dns

start-4g-volte-sim:
	@deployments/4g-volte/sim/scripts/start.sh

stop-4g-volte-sim:
	@deployments/4g-volte/sim/scripts/stop.sh

status-4g-volte-sim:
	@deployments/4g-volte/sim/scripts/status.sh

logs-4g-volte-sim:
	@deployments/4g-volte/sim/scripts/logs.sh

validate-4g-volte-sim:
	@deployments/4g-volte/sim/scripts/validate.sh

test-4g-volte-sim:
	.venv/bin/pytest backend/tests/test_4g_volte_static.py
	@deployments/4g-volte/sim/scripts/test.sh

build-4g-lte-x310:
	docker build -t lain5g-lab/srsran4g-uhd:local images/srsran4g-uhd
	docker build -t lain5g-lab/kamailio:local images/kamailio
	docker build -t lain5g-lab/ims-dns:local images/ims-dns

check-x310:
	@deployments/4g-volte/x310/scripts/hardware-check.sh
	@deployments/4g-volte/x310/scripts/uhd-check.sh
	@deployments/4g-volte/x310/scripts/fpga-check.sh

preflight-4g-lte-x310:
	@deployments/4g-volte/x310/scripts/preflight.sh

start-4g-lte-x310-epc:
	@deployments/4g-volte/x310/scripts/start-epc.sh

start-4g-lte-x310-rf:
	@deployments/4g-volte/x310/scripts/start-enb.sh

emergency-stop-4g-lte-x310:
	@deployments/4g-volte/x310/scripts/emergency-stop.sh

stop-4g-lte-x310:
	@deployments/4g-volte/x310/scripts/stop.sh

status-4g-lte-x310:
	@deployments/4g-volte/x310/scripts/status.sh

logs-4g-lte-x310:
	@deployments/4g-volte/x310/scripts/logs.sh

validate-4g-lte-x310:
	@deployments/4g-volte/x310/scripts/validate.sh

test-4g-lte-x310:
	.venv/bin/pytest backend/tests/test_4g_volte_static.py
	@deployments/4g-volte/x310/scripts/test.sh
