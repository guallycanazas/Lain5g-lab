import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ActionButton } from '../components/ActionButton';
import { EmptyState } from '../components/EmptyState';
import { ErrorAlert } from '../components/ErrorAlert';
import { LoadingState } from '../components/LoadingState';
import { SubscriberCloneDialog } from '../components/subscribers/SubscriberCloneDialog';
import { SubscriberConnectionStatus } from '../components/subscribers/SubscriberConnectionStatus';
import { SubscriberDeleteDialog } from '../components/subscribers/SubscriberDeleteDialog';
import { SubscriberTable } from '../components/subscribers/SubscriberTable';
import { useSubscriberActions, useSubscriberConnection, useSubscribers } from '../hooks/useSubscribers';
import type { SubscriberSummary } from '../types/subscriber';

const pageSize = 25;

export function SubscribersPage() {
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [cloneTarget, setCloneTarget] = useState<SubscriberSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SubscriberSummary | null>(null);
  const connection = useSubscriberConnection();
  const subscribers = useSubscribers({ limit: pageSize, offset, search });
  const actions = useSubscriberActions();
  const mutationError = actions.clone.error || actions.delete.error;

  return (
    <section className="panel page-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Open5GS</span>
          <h2>Suscriptores</h2>
        </div>
        <Link className="action-link" to="/subscribers/new">Nuevo suscriptor</Link>
      </div>

      {connection.isLoading ? <LoadingState /> : null}
      {connection.error ? <ErrorAlert error={connection.error} onRetry={() => connection.refetch()} /> : null}
      {connection.data ? <SubscriberConnectionStatus status={connection.data} /> : null}

      {mutationError ? <ErrorAlert error={mutationError} /> : null}

      <div className="controls-panel subscriber-controls">
        <label>Búsqueda IMSI/MSISDN<input value={search} onChange={(event) => { setOffset(0); setSearch(event.target.value); }} /></label>
        <ActionButton variant="secondary" onClick={() => subscribers.refetch()} loading={subscribers.isFetching}>Actualizar</ActionButton>
      </div>

      {subscribers.isLoading ? <LoadingState /> : null}
      {subscribers.error ? <ErrorAlert error={subscribers.error} onRetry={() => subscribers.refetch()} /> : null}
      {subscribers.data && subscribers.data.items.length > 0 ? <SubscriberTable subscribers={subscribers.data.items} onClone={setCloneTarget} onDelete={setDeleteTarget} /> : null}
      {subscribers.data && subscribers.data.items.length === 0 ? <EmptyState title="Sin suscriptores" message="No hay documentos de suscriptor para los filtros actuales o MongoDB no está disponible." /> : null}

      {subscribers.data ? (
        <div className="pagination-row">
          <button className="secondary" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - pageSize))}>Anterior</button>
          <span>{offset + 1}-{Math.min(offset + pageSize, subscribers.data.total)} de {subscribers.data.total}</span>
          <button className="secondary" disabled={offset + pageSize >= subscribers.data.total} onClick={() => setOffset(offset + pageSize)}>Siguiente</button>
        </div>
      ) : null}

      <SubscriberCloneDialog
        subscriber={cloneTarget}
        loading={actions.clone.isPending}
        onCancel={() => setCloneTarget(null)}
        onConfirm={(imsi, payload) => actions.clone.mutate({ imsi, payload }, { onSuccess: () => setCloneTarget(null) })}
      />
      <SubscriberDeleteDialog
        subscriber={deleteTarget}
        loading={actions.delete.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={(imsi) => actions.delete.mutate({ imsi, confirm: true }, { onSuccess: () => setDeleteTarget(null) })}
      />
    </section>
  );
}
