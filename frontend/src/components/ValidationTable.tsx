import type { ValidationCheck } from '../types/validation';
import { extractDetectedValue, validationDescription } from '../utils/status';
import { StatusBadge } from './StatusBadge';

const orderedChecks = ['mongo', 'nrf', 'amf', 'smf', 'upf', 'ausf', 'udm', 'udr', 'pcf', 'ng_connection', 'ue_registration', 'pdu_session', 'ue_tun', 'ue_ip', 'ping'];

export function ValidationTable({ checks, checkedAt }: { checks: ValidationCheck[]; checkedAt?: string | null }) {
  const byId = new Map(checks.map((check) => [check.id, check]));
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Control</th><th>Estado</th><th>Valor</th><th>Evidencia</th><th>Fecha</th></tr>
        </thead>
        <tbody>
          {orderedChecks.map((id) => {
            const check = byId.get(id);
            return (
              <tr key={id}>
                <td>{validationDescription(id)}</td>
                <td><StatusBadge status={check?.status || 'NOT_TESTED'} kind="validation" /></td>
                <td>{extractDetectedValue(check?.detail)}</td>
                <td>{check?.detail || 'Sin evidencia reportada'}</td>
                <td>{checkedAt || 'Sin fecha'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
