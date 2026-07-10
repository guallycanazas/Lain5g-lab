import { useParams } from 'react-router-dom';
import { ErrorAlert } from '../components/ErrorAlert';
import { LoadingState } from '../components/LoadingState';
import { StatusBadge } from '../components/StatusBadge';
import { ValidationTable } from '../components/ValidationTable';
import { useRunDetail } from '../hooks/useRuns';
import type { ValidationCheck } from '../types/validation';
import { formatDate } from '../utils/dates';

export function RunDetailPage() {
  const { runId } = useParams();
  const run = useRunDetail(runId);
  const metadata = run.data?.metadata || {};
  const checks = ((run.data?.validation?.checks as ValidationCheck[] | undefined) || []);

  return (
    <section className="panel page-panel">
      {run.isLoading ? <LoadingState /> : null}
      {run.error ? <ErrorAlert error={run.error} /> : null}
      {run.data ? (
        <>
          <div className="panel-heading"><h2>{run.data.run_id}</h2><StatusBadge status={String(metadata.status || 'unknown')} /></div>
          <dl className="facts compact">
            <dt>Escenario</dt><dd>{String(metadata.scenario || 'No disponible')}</dd>
            <dt>Inicio</dt><dd>{formatDate(String(metadata.started_at || ''))}</dd>
            <dt>Fin</dt><dd>{formatDate(String(metadata.finished_at || ''))}</dd>
            <dt>Commit</dt><dd>{String(metadata.git_commit || 'No disponible')}</dd>
          </dl>
          <h3>Claims validados</h3>
          <ul className="claims-list">{(metadata.validated_claims as string[] | undefined || []).map((claim) => <li key={claim}>{claim}</li>)}</ul>
          <h3>Validación</h3>
          <ValidationTable checks={checks} checkedAt={String(run.data.validation?.checked_at || '')} />
          <h3>Logs disponibles</h3>
          <ul>{run.data.logs.map((log) => <li key={log}>{log}</li>)}</ul>
          <h3>Métricas</h3>
          <pre className="json-block">{JSON.stringify(run.data.metrics, null, 2)}</pre>
        </>
      ) : null}
    </section>
  );
}
