def test_list_deployments_includes_5g_sa(client):
    response = client.get("/api/deployments")

    assert response.status_code == 200
    payload = response.json()
    assert payload[0]["id"] == "5g-sa"
    assert payload[0]["status"] == "dry_run"


def test_get_deployment_detail(client):
    response = client.get("/api/deployments/5g-sa")

    assert response.status_code == 200
    assert response.json()["supported_actions"] == ["start", "stop", "restart", "status", "validate", "logs"]


def test_unknown_deployment_returns_404(client):
    response = client.get("/api/deployments/unknown")

    assert response.status_code == 404
    assert response.json()["detail"]["code"] == "DEPLOYMENT_NOT_FOUND"


def test_start_dry_run_does_not_execute_script(client):
    response = client.post("/api/deployments/5g-sa/start")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "dry_run"
    assert payload["command"]["dry_run"] is True
    assert payload["command"]["stdout"].startswith("DRY RUN:")


def test_stop_dry_run_does_not_execute_script(client):
    response = client.post("/api/deployments/5g-sa/stop")

    assert response.status_code == 200
    assert response.json()["command"]["dry_run"] is True


def test_restart_dry_run_does_not_execute_script(client):
    response = client.post("/api/deployments/5g-sa/restart")

    assert response.status_code == 200
    assert response.json()["command"]["dry_run"] is True


def test_status_returns_model(client):
    response = client.get("/api/deployments/5g-sa/status")

    assert response.status_code == 200
    payload = response.json()
    assert payload["id"] == "5g-sa"
    assert payload["status"] == "dry_run"
    assert payload["command"]["exit_code"] == 0


def test_logs_validates_tail_range(client):
    response = client.get("/api/deployments/5g-sa/logs?tail=0")

    assert response.status_code == 422


def test_logs_rejects_unknown_container(client):
    response = client.get("/api/deployments/5g-sa/logs?container=../../bad&tail=100")

    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "BAD_REQUEST"
