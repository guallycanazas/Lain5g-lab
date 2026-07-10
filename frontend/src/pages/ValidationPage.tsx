import { ActionButton } from '../components/ActionButton';
import { ErrorAlert } from '../components/ErrorAlert';
import { LoadingState } from '../components/LoadingState';
import { StatusBadge } from '../components/StatusBadge';
import { ValidationTable } from '../components/ValidationTable';
import { useLatestValidation, useRunValidation } from '../hooks/useValidation';
import { formatDate } from '../utils/dates';

export function ValidationPage() {
  const latest = useLatestValidation();
  const runValidation = useRunValidation();
  const report = runValidation.data || latest.data;

  return (
    <section className="panel page-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Validación 5G SA</span>
          <h2>Controles técnicos</h2>
        </div>
        <ActionButton onClick={() => runValidation.mutate()} loading={runValidation.isPending}>Ejecutar validación</ActionButton>
      </div>
      {latest.isLoading ? <LoadingState /> : null}
      {latest.error && !report ? <ErrorAlert error={latest.error} onRetry={() => latest.refetch()} /> : null}
      {runValidation.error ? <ErrorAlert error={runValidation.error} /> : null}
      {report ? (
        <>
          <dl className="facts compact">
            <dt>Estado general</dt><dd><StatusBadge status={report.status} kind="validation" /></dd>
            <dt>Run</dt><dd>{report.run_id || 'Sin run'}</dd>
            <dt>Fecha</dt><dd>{formatDate(report.checked_at)}</dd>
          </dl>
          <ValidationTable checks={report.checks} checkedAt={formatDate(report.checked_at)} />
        </>
      ) : null}
    </section>
  );
}
