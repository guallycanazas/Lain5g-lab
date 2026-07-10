import { useState } from 'react';
import { ContainerStatusTable } from '../components/ContainerStatusTable';
import { ActionButton } from '../components/ActionButton';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ErrorAlert } from '../components/ErrorAlert';
import { LoadingState } from '../components/LoadingState';
import { StatusBadge } from '../components/StatusBadge';
import { useDeploymentActions, useDeploymentStatus, useHealth } from '../hooks/useDeployment';
import { formatDate } from '../utils/dates';

export function DashboardPage() {
  const health = useHealth();
  const status = useDeploymentStatus();
  const actions = useDeploymentActions();
  const [confirm, setConfirm] = useState<'stop' | 'restart' | null>(null);
  const busy = actions.start.isPending || actions.stop.isPending || actions.restart.isPending || actions.validate.isPending;
  const actionError = actions.start.error || actions.stop.error || actions.restart.error || actions.validate.error;

  const runConfirmed = () => {
    if (confirm === 'stop') actions.stop.mutate();
    if (confirm === 'restart') actions.restart.mutate();
    setConfirm(null);
  };

  return (
    <div className="page-grid">
      <section className="panel hero-panel">
        <div>
          <span className="eyebrow">Escenario activo</span>
          <h2>5G SA</h2>
          <p>Administración visual del laboratorio validado mediante FastAPI y scripts operativos.</p>
        </div>
        {status.data ? <StatusBadge status={status.data.status} /> : <StatusBadge status="unknown" />}
      </section>

      <section className="panel">
        <h2>Backend</h2>
        {health.isLoading ? <LoadingState /> : null}
        {health.error ? <ErrorAlert error={health.error} onRetry={() => health.refetch()} /> : null}
        {health.data ? (
          <dl className="facts">
            <dt>Servicio</dt><dd>{health.data.service}</dd>
            <dt>Estado</dt><dd>{health.data.status}</dd>
            <dt>Modo</dt><dd>{health.data.dry_run ? 'dry-run' : 'real'}</dd>
          </dl>
        ) : null}
      </section>

      <section className="panel wide">
        <div className="panel-heading">
          <h2>Estado del despliegue</h2>
          <ActionButton variant="secondary" onClick={() => status.refetch()} loading={status.isFetching}>Actualizar estado</ActionButton>
        </div>
        {status.isLoading ? <LoadingState /> : null}
        {status.error ? <ErrorAlert error={status.error} onRetry={() => status.refetch()} /> : null}
        {status.data ? (
          <>
            <dl className="facts compact">
              <dt>Estado general</dt><dd><StatusBadge status={status.data.status} /></dd>
              <dt>Consulta</dt><dd>{formatDate(status.data.checked_at)}</dd>
              <dt>Exit code</dt><dd>{String(status.data.command.exit_code)}</dd>
              <dt>Dry-run</dt><dd>{status.data.command.dry_run ? 'sí' : 'no'}</dd>
            </dl>
            <ContainerStatusTable containers={status.data.containers} />
            <details className="technical-output"><summary>Salida resumida</summary><pre>{status.data.output || status.data.command.stdout}</pre></details>
          </>
        ) : null}
      </section>

      <section className="panel wide" aria-live="polite">
        <h2>Controles</h2>
        {actionError ? <ErrorAlert error={actionError} /> : null}
        <div className="actions-row">
          <ActionButton loading={actions.start.isPending} disabled={busy} onClick={() => actions.start.mutate()}>Iniciar</ActionButton>
          <ActionButton variant="danger" disabled={busy} onClick={() => setConfirm('stop')}>Detener</ActionButton>
          <ActionButton variant="secondary" disabled={busy} onClick={() => setConfirm('restart')}>Reiniciar</ActionButton>
          <ActionButton variant="secondary" loading={actions.validate.isPending} disabled={busy} onClick={() => actions.validate.mutate()}>Validar</ActionButton>
        </div>
        {actions.validate.data ? <p className="result-line">Validación: <StatusBadge status={actions.validate.data.status} kind="validation" /> Run: {actions.validate.data.run_id || 'sin run'}</p> : null}
      </section>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm === 'stop' ? 'Detener 5G SA' : 'Reiniciar 5G SA'}
        message="Esta operación se ejecutará mediante la API FastAPI y los scripts validados."
        confirmLabel={confirm === 'stop' ? 'Detener' : 'Reiniciar'}
        onConfirm={runConfirmed}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
