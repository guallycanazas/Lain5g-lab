SHELL := /bin/bash

.PHONY: build-5g-sa start-5g-sa stop-5g-sa restart-5g-sa status-5g-sa logs-5g-sa validate-5g-sa clean-5g-sa backend-install backend-dev backend-test backend-cov frontend-install frontend-dev frontend-build frontend-test app-build app-up app-down app-logs app-ps subscribers-test subscribers-integration-test

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
