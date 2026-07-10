import type { ContainerStatus } from '../types/deployment';
import { StatusBadge } from './StatusBadge';

const expected = ['mongo', 'nrf', 'amf', 'smf', 'upf', 'ausf', 'udm', 'udr', 'pcf', 'gnb', 'ue'];

export function ContainerStatusTable({ containers }: { containers: ContainerStatus[] }) {
  const byService = new Map(containers.map((container) => [container.service, container]));
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Componente</th><th>Servicio</th><th>Estado</th><th>Identificador</th><th>Observaciones</th></tr>
        </thead>
        <tbody>
          {expected.map((service) => {
            const container = byService.get(service);
            return (
              <tr key={service}>
                <td>{service.toUpperCase()}</td>
                <td>{container?.service || service}</td>
                <td>{container ? <StatusBadge status={container.running ? 'running' : 'stopped'} /> : <StatusBadge status="unknown" />}</td>
                <td>{container?.name || 'No detectado'}</td>
                <td>{container ? container.status : 'La API no reportó este contenedor'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
