import type { DeploymentState } from '../types/deployment';
import type { ValidationState } from '../types/validation';

export function deploymentLabel(status: DeploymentState | string): string {
  const labels: Record<string, string> = {
    running: 'En ejecución',
    stopped: 'Detenido',
    partial: 'Parcial',
    error: 'Error',
    unknown: 'Desconocido',
    dry_run: 'Dry-run',
  };
  return labels[status] || status;
}

export function validationLabel(status: ValidationState | string): string {
  const labels: Record<string, string> = {
    PASS: 'PASS',
    PARTIAL: 'PARTIAL',
    FAIL: 'FAIL',
    WARNING: 'WARNING',
    NOT_TESTED: 'NOT TESTED',
  };
  return labels[status] || status;
}

export function validationDescription(id: string): string {
  const labels: Record<string, string> = {
    mongo: 'MongoDB disponible',
    nrf: 'NRF activo',
    amf: 'AMF activo',
    smf: 'SMF activo',
    upf: 'UPF activo',
    ausf: 'AUSF activo',
    udm: 'UDM activo',
    udr: 'UDR activo',
    pcf: 'PCF activo',
    ng_connection: 'Conexión NG establecida',
    ue_registration: 'UE registrado',
    pdu_session: 'Sesión PDU establecida',
    ue_tun: 'Interfaz TUN creada',
    ue_ip: 'Dirección IP asignada',
    ping: 'Ping de datos exitoso',
  };
  return labels[id] || id;
}

export function extractDetectedValue(detail?: string | null): string {
  if (!detail) return 'No disponible';
  const ip = detail.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
  if (ip) return ip[0];
  if (/succeeded|successful|exists|assigned|responds|running/i.test(detail)) return 'Detectado';
  return 'No disponible';
}
