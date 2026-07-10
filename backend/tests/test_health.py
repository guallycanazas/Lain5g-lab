def test_health_responds_ok(client):
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "lain5g-lab-backend",
        "dry_run": True,
    }
