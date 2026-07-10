import { StatusBadge } from '../StatusBadge';
import type { SubscriberConnectionStatus as Status } from '../../types/subscriber';

export function SubscriberConnectionStatus({ status }: { status: Status }) {
  return (
    <dl className="facts compact">
      <dt>MongoDB</dt><dd><StatusBadge status={status.status === 'connected' ? 'running' : status.status === 'dry_run' ? 'dry_run' : 'error'} /></dd>
      <dt>Base</dt><dd>{status.database}</dd>
      <dt>Colección</dt><dd>{status.collection}</dd>
      <dt>Servidor</dt><dd>{status.server}</dd>
      <dt>Latencia</dt><dd>{status.latency_ms === null ? 'n/a' : `${status.latency_ms} ms`}</dd>
      {status.message ? <><dt>Detalle</dt><dd>{status.message}</dd></> : null}
    </dl>
  );
}
