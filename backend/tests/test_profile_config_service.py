from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path

from fastapi.testclient import TestClient

from backend.app.dependencies import get_profile_config_service
from backend.app.main import create_app
from backend.app.services.profile_config_service import ProfileConfigService
from backend.app.settings import Settings

ROOT = Path(__file__).resolve().parents[2]


def make_profile_project(tmp_path: Path) -> Path:
    root = tmp_path / "project"
    shutil.copytree(ROOT / "config", root / "config")
    for rel in [
        "deployments/5g-sa/open5gs",
        "deployments/5g-sa/ueransim",
        "deployments/5g-vonr/open5gs",
        "deployments/5g-vonr/ueransim",
        "deployments/4g-volte/common/open5gs",
        "deployments/4g-volte/common/provisioning",
        "deployments/4g-volte/sim/ran",
        "deployments/4g-volte/x310/open5gs",
        "deployments/4g-volte/x310/ran",
        "deployments/4g-volte/x310/rf",
        "deployments/5g-sa-x310/rf",
    ]:
        shutil.copytree(ROOT / rel, root / rel)
    (root / "deployments/5g-sa/.env").write_text("SUBSCRIBER_KEY=SECRETKEY\nSUBSCRIBER_OPC=SECRETOPC\nSUBSCRIBER_SQN=SECRETSEQ\n", encoding="utf-8")
    (root / "deployments/5g-vonr/.env").write_text("SUBSCRIBER_KEY=SECRETKEY\nSUBSCRIBER_OPC=SECRETOPC\nSUBSCRIBER_SQN=SECRETSEQ\nIMS_AUTH_PASSWORD=SECRETIMS\n", encoding="utf-8")
    (root / "deployments/4g-volte/common/.env").write_text("SUBSCRIBER_KEY=SECRETKEY\nSUBSCRIBER_OPC=SECRETOPC\nSUBSCRIBER_SQN=SECRETSEQ\nIMS_AUTH_PASSWORD=SECRETIMS\n", encoding="utf-8")
    (root / "deployments/5g-sa-x310/.env").write_text("", encoding="utf-8")
    return root


def service(root: Path) -> ProfileConfigService:
    return ProfileConfigService(Settings(project_root=root, dry_run=True))


def test_loads_profiles_and_blocks_invalid_rf_defaults(tmp_path: Path):
    svc = service(make_profile_project(tmp_path))
    profiles = svc.list_profiles()
    assert {item["profile"] for item in profiles} == {"4g-volte-sim", "4g-lte-x310", "5g-sa", "5g-sa-x310", "5g-vonr"}
    validation = svc.validate_profile("5g-sa-x310")
    assert not validation["valid"]
    assert any("radio.band" in error for error in validation["errors"])
    assert any("radio.dl_arfcn" in error for error in validation["errors"])


def test_diff_apply_backup_and_secret_preservation(tmp_path: Path):
    root = make_profile_project(tmp_path)
    svc = service(root)
    tracked_before_update = snapshot_files(root)
    profile = svc.get_profile("5g-sa")
    profile["network"]["tac"] = 9
    profile["network"]["dnn"] = "labnet"
    profile["subscriber"]["imsi"] = "001010000000001"
    svc.update_profile("5g-sa", profile)
    tracked_before_apply = snapshot_files(root)
    diff = svc.diff_profile("5g-sa")
    assert any(file["changed"] for file in diff["files"])
    result = svc.apply_profile("5g-sa")
    assert result["backup"].startswith(".backups/config/5g-sa/")
    assert sorted(result["modified_files"]) == sorted(file["path"] for file in diff["files"] if file["changed"])
    env = (root / "deployments/5g-sa/.env").read_text(encoding="utf-8")
    assert "SUBSCRIBER_KEY=SECRETKEY" in env
    assert "SUBSCRIBER_OPC=SECRETOPC" in env
    assert "SUBSCRIBER_SQN=SECRETSEQ" in env
    assert "SUBSCRIBER_IMSI=001010000000001" in env
    assert "tac: 9" in (root / "deployments/5g-sa/open5gs/amf.yaml").read_text(encoding="utf-8")
    assert (root / result["backup"] / "deployments/5g-sa/.env").exists()
    changed_after_apply = changed_paths(tracked_before_apply, snapshot_files(root))
    assert changed_after_apply == set(result["modified_files"])
    assert not any(file["changed"] for file in svc.diff_profile("5g-sa")["files"])
    restore = svc.restore_profile("5g-sa")
    assert sorted(restore["restored_files"]) == sorted(result["modified_files"])
    restored_snapshot = snapshot_files(root)
    for path, content in tracked_before_update.items():
        if path.startswith("config/profiles/5g-sa.yaml"):
            continue
        assert restored_snapshot[path] == content


def test_vonr_apply_preserves_ims_and_subscriber_secrets_when_fields_are_absent(tmp_path: Path):
    root = make_profile_project(tmp_path)
    svc = service(root)
    profile = svc.get_profile("5g-vonr")
    profile["subscriber"]["imsi"] = "001010000000002"
    svc.update_profile("5g-vonr", profile)
    result = svc.apply_profile("5g-vonr")
    env = (root / "deployments/5g-vonr/.env").read_text(encoding="utf-8")
    assert "SUBSCRIBER_KEY=SECRETKEY" in env
    assert "SUBSCRIBER_OPC=SECRETOPC" in env
    assert "SUBSCRIBER_SQN=SECRETSEQ" in env
    assert "IMS_AUTH_PASSWORD=SECRETIMS" in env
    assert "SUBSCRIBER_IMSI=001010000000002" in env
    assert result["modified_files"]


def test_api_uses_profile_service_without_file_paths(tmp_path: Path):
    svc = service(make_profile_project(tmp_path))
    app = create_app()
    app.dependency_overrides[get_profile_config_service] = lambda: svc
    with TestClient(app) as client:
        assert client.get("/api/profiles").status_code == 200
        response = client.put("/api/profiles/5g-sa", json={"network": {"tac": 2}, "file": "/etc/passwd"})
        assert response.status_code == 422
        response = client.put("/api/profiles/5g-sa", json={"network": {"tac": 2}})
        assert response.status_code == 200
        assert client.post("/api/profiles/5g-sa/validate").json()["valid"] is True
        assert client.get("/api/profiles/5g-sa/diff").status_code == 200
    app.dependency_overrides.clear()


def test_cli_profile_commands_use_temporary_project(tmp_path: Path):
    root = make_profile_project(tmp_path)
    env = {**os.environ, "LAIN5G_PROJECT_ROOT": str(root)}
    list_result = subprocess.run([str(ROOT / "lain5g"), "profile", "list"], cwd=ROOT, env=env, text=True, capture_output=True, check=False)
    assert list_result.returncode == 0
    assert "5g-sa" in list_result.stdout
    validate_result = subprocess.run([str(ROOT / "lain5g"), "profile", "validate", "5g-sa-x310"], cwd=ROOT, env=env, text=True, capture_output=True, check=False)
    assert validate_result.returncode == 1
    assert "radio.band" in validate_result.stdout


def test_no_rf_start_commands_in_profile_service():
    text = (ROOT / "backend/app/services/profile_config_service.py").read_text(encoding="utf-8")
    forbidden = ["docker compose up", "start-gnb", "start-enb", "uhd_image_loader", "docker system prune"]
    for item in forbidden:
        assert item not in text


def snapshot_files(root: Path) -> dict[str, str]:
    files: dict[str, str] = {}
    for path in root.rglob("*"):
        if not path.is_file() or ".backups" in path.parts:
            continue
        files[str(path.relative_to(root))] = path.read_text(encoding="utf-8")
    return files


def changed_paths(before: dict[str, str], after: dict[str, str]) -> set[str]:
    return {path for path, content in after.items() if before.get(path) != content}
