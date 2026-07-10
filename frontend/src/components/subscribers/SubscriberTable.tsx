import { Link } from 'react-router-dom';
import type { SubscriberSummary } from '../../types/subscriber';

interface SubscriberTableProps {
  subscribers: SubscriberSummary[];
  onClone: (subscriber: SubscriberSummary) => void;
  onDelete: (subscriber: SubscriberSummary) => void;
}

export function SubscriberTable({ subscribers, onClone, onDelete }: SubscriberTableProps) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>IMSI</th>
            <th>MSISDN</th>
            <th>DNN</th>
            <th>Slice</th>
            <th>K</th>
            <th>OP</th>
            <th>OPc</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map((subscriber) => (
            <tr key={subscriber.imsi}>
              <td>{subscriber.imsi}</td>
              <td>{subscriber.msisdn || 'n/a'}</td>
              <td>{subscriber.dnn || 'n/a'}</td>
              <td>{subscriber.sst ?? 'n/a'} / {subscriber.sd || 'n/a'}</td>
              <td>{subscriber.security.k_configured ? 'Configurada' : 'No'}</td>
              <td>{subscriber.security.op_configured ? 'Configurada' : 'No'}</td>
              <td>{subscriber.security.opc_configured ? 'Configurada' : 'No'}</td>
              <td className="inline-actions">
                <Link to={`/subscribers/${subscriber.imsi}`}>Ver</Link>
                <Link to={`/subscribers/${subscriber.imsi}/edit`}>Editar</Link>
                <button className="secondary" onClick={() => onClone(subscriber)}>Clonar</button>
                <button className="danger" onClick={() => onDelete(subscriber)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
