import { Link } from 'react-router-dom';
import { ErrorAlert } from '../components/ErrorAlert';
import { LoadingState } from '../components/LoadingState';
import { StatusBadge } from '../components/StatusBadge';
import { useDeployments } from '../hooks/useDeployment';

export function ScenariosPage() {
  const deployments = useDeployments();
  return (
    <section className="page-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Escenarios</span>
          <h2>Laboratorios disponibles</h2>
        </div>
      </div>
      {deployments.isLoading ? <LoadingState /> : null}
      {deployments.error ? <ErrorAlert error={deployments.error} onRetry={() => deployments.refetch()} /> : null}
      <div className="scenario-grid">
        {deployments.data?.map((deployment) => (
          <article className="panel scenario-card" key={deployment.id}>
            <div className="panel-heading">
              <div>
                <h3>{deployment.name}</h3>
                <span className="muted-text">{deployment.rf_capable ? 'RF CONTROLADO' : 'software'}</span>
              </div>
              <StatusBadge status={deployment.status} />
            </div>
            <p>{deployment.description}</p>
            <dl className="facts">
              <dt>Modo</dt><dd>{deployment.mode}</dd>
              <dt>Ruta</dt><dd><code>{deployment.path}</code></dd>
              <dt>Componentes</dt><dd>{deployment.components.slice(0, 6).join(', ')}{deployment.components.length > 6 ? '...' : ''}</dd>
            </dl>
            {deployment.rf_capable ? <p className="warning-box">RF CONTROLADO: el inicio RF normal está bloqueado desde la web.</p> : null}
            <Link className="action-link" to={`/scenarios/${deployment.id}`}>Abrir escenario</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
