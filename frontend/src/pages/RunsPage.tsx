import { EmptyState } from '../components/EmptyState';
import { ErrorAlert } from '../components/ErrorAlert';
import { LoadingState } from '../components/LoadingState';
import { RunTable } from '../components/RunTable';
import { useRuns } from '../hooks/useRuns';

export function RunsPage() {
  const runs = useRuns();
  return (
    <section className="panel page-panel">
      <div className="panel-heading"><h2>Ejecuciones</h2></div>
      {runs.isLoading ? <LoadingState /> : null}
      {runs.error ? <ErrorAlert error={runs.error} onRetry={() => runs.refetch()} /> : null}
      {runs.data && runs.data.length > 0 ? <RunTable runs={runs.data} /> : null}
      {runs.data && runs.data.length === 0 ? <EmptyState title="Sin ejecuciones" message="Aún no hay resultados en runs/." /> : null}
    </section>
  );
}
