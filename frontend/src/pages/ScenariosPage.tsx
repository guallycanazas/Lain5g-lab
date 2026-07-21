import { Link } from 'react-router-dom';
import { ErrorAlert } from '../components/ErrorAlert';
import { LoadingState } from '../components/LoadingState';
import { StatusBadge } from '../components/StatusBadge';
import { useDeployments } from '../hooks/useDeployment';
import { useRuns } from '../hooks/useRuns';
import { formatDate } from '../utils/dates';
import { getScenarioGuidance } from '../utils/scenarioGuidance';

export function ScenariosPage() {
  const deployments = useDeployments();
  const runs = useRuns();
  const deploymentList = Array.isArray(deployments.data) ? deployments.data : [];
  const runList = Array.isArray(runs.data) ? runs.data : [];
  return <section className="page-panel">
    <div className="page-heading"><div><span className="eyebrow">Operation</span><h1>Scenarios</h1><p className="page-subtitle">Select a laboratory workspace. Each scenario retains its own deployment, evidence and safety constraints.</p></div></div>
    {deployments.isLoading ? <LoadingState /> : null}
    {deployments.error ? <ErrorAlert error={deployments.error} onRetry={() => deployments.refetch()} /> : null}
    {(['4G', '5G'] as const).map((generation) => <section className="scenario-family" key={generation}>
      <div className="scenario-family-heading"><span>{generation}</span><div><h2>{generation} laboratory profiles</h2><p>{generation === '4G' ? 'LTE simulation or guarded VoLTE RF preparation.' : 'SA simulation or guarded VoNR RF preparation.'}</p></div></div>
      <div className="scenario-grid">
        {deploymentList.filter((deployment) => getScenarioGuidance(deployment.id)?.generation === generation).map((deployment) => {
          const lastRun = runList.find((run) => run.scenario === deployment.id);
          const guidance = getScenarioGuidance(deployment.id);
          return <article className="panel scenario-card card-interactive" key={deployment.id}>
            <div className="scenario-meta"><span className="eyebrow">{guidance?.variant || deployment.mode}</span><StatusBadge status={deployment.status} /></div>
            <div><h3>{deployment.name}</h3><p className="scenario-purpose">{guidance?.purpose || deployment.description}</p></div>
            {guidance ? <div className="scenario-definition"><div><span>Incluye</span><ul>{guidance.includes.map((item) => <li key={item}>{item}</li>)}</ul></div><div><span>No incluye todavía</span><ul>{guidance.excludes.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="scenario-hardware"><span>Hardware</span><p>{guidance.hardware}</p></div></div> : null}
            <dl className="facts scenario-facts"><dt>ID técnico</dt><dd><code>{deployment.id}</code></dd><dt>Validación</dt><dd>{deployment.validation_checks.length} comprobaciones</dd><dt>Última ejecución</dt><dd>{lastRun ? formatDate(lastRun.finished_at || lastRun.started_at) : 'Sin ejecución registrada'}</dd></dl>
            {deployment.rf_capable ? <div className="warning-box">Preparación RF controlada: no afirma una llamada VoLTE/VoNR hasta contar con evidencia de UE, SIP y RTP.</div> : null}
            <div className="scenario-card-footer"><span className="muted-text">{deployment.rf_capable ? 'Hardware real' : '100% software'}</span><Link className="action-link" to={`/scenarios/${deployment.id}`}>Abrir escenario</Link></div>
          </article>;
        })}
      </div>
    </section>)}
  </section>;
}
