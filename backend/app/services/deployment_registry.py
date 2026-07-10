from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class DeploymentDefinition:
    id: str
    name: str
    description: str
    deployment_path: str
    mode: str
    supported_actions: list[str]
    validation_checks: list[str]
    rf_capable: bool = False
    expected_services: list[str] = field(default_factory=list)
    log_services: list[str] = field(default_factory=list)
    scripts_path: str | None = None

    @property
    def scripts_dir(self) -> str:
        return self.scripts_path or f"{self.deployment_path}/scripts"


COMMON_5G_CHECKS = ["ng_setup", "ue_registration", "pdu_session", "ue_ip", "ue_tun", "ping"]

DEPLOYMENTS: dict[str, DeploymentDefinition] = {
    "5g-sa": DeploymentDefinition(
        id="5g-sa",
        name="5G SA",
        description="Open5GS 5GC with UERANSIM gNB/UE and internet PDU validation.",
        deployment_path="deployments/5g-sa",
        mode="simulation",
        supported_actions=["start", "stop", "restart", "status", "logs", "validate"],
        validation_checks=COMMON_5G_CHECKS,
        expected_services=["mongo", "nrf", "amf", "smf", "upf", "ausf", "udm", "udr", "pcf", "gnb", "ue"],
        log_services=["mongo", "nrf", "amf", "smf", "upf", "ausf", "udm", "udr", "pcf", "gnb", "ue"],
    ),
    "4g-volte-sim": DeploymentDefinition(
        id="4g-volte-sim",
        name="4G LTE + VoLTE Signaling",
        description="srsRAN 4G ZMQ LTE, Open5GS EPC, lab IMS, DNS, and authenticated SIP REGISTER.",
        deployment_path="deployments/4g-volte/sim",
        mode="simulation",
        supported_actions=["start", "stop", "restart", "status", "logs", "validate"],
        validation_checks=["s1_setup", "ue_registration", "default_bearer", "ue_ip", "ue_tun", "data_ping", "ims_dns", "sip_register"],
        expected_services=["mongo", "mme", "hss", "sgwc", "sgwu", "pgwc", "pgwu", "pcrf", "enb", "ue", "pcscf", "icscf", "scscf", "dns"],
        log_services=["mongo", "mme", "hss", "sgwc", "sgwu", "pgwc", "pgwu", "pcrf", "enb", "ue", "pcscf", "icscf", "scscf", "dns", "sip-register"],
    ),
    "5g-vonr-sim": DeploymentDefinition(
        id="5g-vonr-sim",
        name="5G SA + VoNR Signaling",
        description="5G SA simulation with internet and IMS PDU sessions plus authenticated SIP REGISTER over the IMS path.",
        deployment_path="deployments/5g-vonr",
        mode="simulation",
        supported_actions=["start", "stop", "restart", "status", "logs", "validate"],
        validation_checks=["ng_setup", "ue_registration", "pdu_internet", "pdu_ims", "ue_internet_ip", "ue_ims_ip", "ue_internet_tun", "ue_ims_tun", "data_ping", "ims_dns", "sip_register"],
        expected_services=["mongo", "nrf", "amf", "smf", "upf", "ausf", "udm", "udr", "pcf", "gnb", "ue", "pcscf", "icscf", "scscf", "dns"],
        log_services=["mongo", "nrf", "amf", "smf", "upf", "ausf", "udm", "udr", "pcf", "gnb", "ue", "pcscf", "icscf", "scscf", "dns", "sip-register"],
    ),
    "4g-lte-x310": DeploymentDefinition(
        id="4g-lte-x310",
        name="LTE RF + USRP X310",
        description="RF CONTROLADO: X310 LTE profile limited to hardware checks, preflight, EPC, logs, S1 evidence, and emergency stop from the app.",
        deployment_path="deployments/4g-volte/x310",
        mode="rf-controlled",
        supported_actions=["stop", "status", "logs", "validate", "hardware-check", "preflight", "start-epc", "emergency-stop"],
        validation_checks=["hardware_detected", "ethernet_link", "uhd_available", "uhd_fpga_compatible", "epc_services", "mme_ready", "rf_preflight", "enb_started", "s1_setup", "auto_stop", "logs_captured"],
        rf_capable=True,
        expected_services=["mongo", "mme", "hss", "sgwc", "sgwu", "pgwc", "pgwu", "pcrf", "pcscf", "icscf", "scscf", "dns", "enb-x310"],
        log_services=["mongo", "mme", "hss", "sgwc", "sgwu", "pgwc", "pgwu", "pcrf", "pcscf", "icscf", "scscf", "dns", "enb-x310"],
    ),
}


def get_deployment_definition(scenario: str) -> DeploymentDefinition | None:
    return DEPLOYMENTS.get(scenario)


def list_deployment_definitions() -> list[DeploymentDefinition]:
    return list(DEPLOYMENTS.values())
