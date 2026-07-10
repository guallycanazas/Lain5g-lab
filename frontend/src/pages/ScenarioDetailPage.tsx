import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ActionButton } from '../components/ActionButton';
import { ContainerStatusTable } from '../components/ContainerStatusTable';
import { ErrorAlert } from '../components/ErrorAlert';
import { LoadingState } from '../components/LoadingState';
import { LogsViewer } from '../components/LogsViewer';
import { StatusBadge } from '../components/StatusBadge';
import { deploymentsApi } from '../services/deploymentsApi';
import { runsApi } from '../services/runsApi';
import { useScenario, useScenarioActions, useScenarioStatus } from '../hooks/useDeployment';
import type { ValidationCheck } from '../types/validation';
import { formatDate } from '../utils/dates';

const scenarioLabels: Record<string, string[]> = {
  '5g-sa': ['NG Setup', 'UE Registration', 'PDU Session', 'UE IP', 'TUN', 'Ping'],
  '4g-volte-sim': ['S1 Setup', 'UE Attach', 'Default Bearer', 'UE IP', 'Ping', 'IMS', 'DNS', 'SIP REGISTER'],
  '5g-vonr-sim': ['NG Setup', 'UE Registration', 'Internet PDU', 'IMS PDU', 'Internet IP', 'IMS IP', 'TUN Internet', 'TUN IMS', 'Ping', 'IMS', 'DNS', 'SIP REGISTER'],
  '4g-lte-x310': ['Hardware', 'Ethernet', 'UHD', 'FPGA', 'EPC', 'MME', 'Preflight', 'srsENB', 'S1 Setup', 'Auto-stop', 'Logs'],
};

function checksFromRun(run: unknown): ValidationCheck[] {
  const validation = (run as { validation?: { checks?: ValidationCheck[] } } | undefined)?.validation;
  return Array.isArray(validation?.checks) ? validation.checks : [];
}

export function ScenarioDetailPage() {
  const { scenarioId = '' } = useParams();
  const scenario = useScenario(scenarioId);
  const status = useScenarioStatus(scenarioId);
  const actions = useScenarioActions(scenarioId);
  const latestRuns = useQuery({ queryKey: ['runs', scenarioId, 'latest'], queryFn: () => runsApi.list({ scenario: scenarioId, limit: 1 }), enabled: Boolean(scenarioId) });
  const latestRunId = latestRuns.data?.[0]?.run_id;
  const latestRun = useQuery({ queryKey: ['run', latestRunId], queryFn: () => runsApi.detail(latestRunId || ''), enabled: Boolean(latestRunId) });
  const [container, setContainer] = useState<string>('todos');
  const logs = useQuery({ queryKey: ['logs', scenarioId, container], queryFn: () => deploymentsApi.logs(container === 'todos' ? null : container, 200, scenarioId), enabled: false });
  const busy = Object.values(actions).some((action) => action.isPending);
  const actionError = Object.values(actions).find((action) => action.error)?.error;
  const deployment = scenario.data;
  const validationChecks = checksFromRun(latestRun.data);
  const components = useMemo(() => deployment?.components || [], [deployment]);

  if (!scenarioId) return null;

  return (
    <div className="page-grid">
      <section className="panel hero-panel wide">
        <div>
          <Link to="/scenarios" className="muted-text">← Escenarios</Link>
          <span className="eyebrow">{deployment?.rf_capable ? 'RF CONTROLADO' : 'software'}</span>
          <h2>{deployment?.name || scenarioId}</h2>
          <p>{deployment?.description}</p>
        </div>
        {status.data ? <StatusBadge status={status.data.status} /> : <StatusBadge status="unknown" />}
      </section>

      {scenario.isLoading || status.isLoading ? <LoadingState /> : null}
      {scenario.error ? <ErrorAlert error={scenario.error} /> : null}
      {status.error ? <ErrorAlert error={status.error} onRetry={() => status.refetch()} /> : null}
      {actionError ? <ErrorAlert error={actionError} /> : null}

      {deployment?.rf_capable ? (
        <section className="panel wide warning-box">
          <h3>Advertencia RF y Docker socket</h3>
          <p>Este laboratorio usa acceso a Docker y puede controlar RF. El botón normal de inicio RF no está disponible. Use solo hardware check, preflight, EPC sin RF, logs, estado y emergency stop salvo autorización explícita del backend con <code>LAIN5G_ALLOW_RF_START=true</code> y manifiesto válido.</p>
          <p>No se muestra UE attach RF como validado.</p>
        </section>
      ) : null}

      <section className="panel wide">
        <div className="panel-heading"><h3>Acciones</h3><ActionButton variant="secondary" onClick={() => status.refetch()} loading={status.isFetching}>Actualizar estado</ActionButton></div>
        <div className="actions-row">
          {deployment?.supported_actions.includes('start') ? <ActionButton disabled={busy} loading={actions.start.isPending} onClick={() => actions.start.mutate()}>Iniciar</ActionButton> : null}
          {deployment?.supported_actions.includes('start-epc') ? <ActionButton disabled={busy} loading={actions.startEpc.isPending} onClick={() => actions.startEpc.mutate()}>Iniciar EPC sin RF</ActionButton> : null}
          {deployment?.supported_actions.includes('hardware-check') ? <ActionButton variant="secondary" disabled={busy} loading={actions.hardwareCheck.isPending} onClick={() => actions.hardwareCheck.mutate()}>Hardware check</ActionButton> : null}
          {deployment?.supported_actions.includes('preflight') ? <ActionButton variant="secondary" disabled={busy} loading={actions.preflight.isPending} onClick={() => actions.preflight.mutate()}>Preflight</ActionButton> : null}
          {deployment?.supported_actions.includes('stop') ? <ActionButton variant="danger" disabled={busy} loading={actions.stop.isPending} onClick={() => actions.stop.mutate()}>Detener</ActionButton> : null}
          {deployment?.supported_actions.includes('restart') ? <ActionButton variant="secondary" disabled={busy} loading={actions.restart.isPending} onClick={() => actions.restart.mutate()}>Reiniciar</ActionButton> : null}
          {deployment?.supported_actions.includes('validate') ? <ActionButton variant="secondary" disabled={busy} loading={actions.validate.isPending} onClick={() => actions.validate.mutate()}>Validar</ActionButton> : null}
          {deployment?.supported_actions.includes('emergency-stop') ? <ActionButton variant="danger" disabled={busy} loading={actions.emergencyStop.isPending} onClick={() => actions.emergencyStop.mutate()}>Emergency stop</ActionButton> : null}
        </div>
      </section>

      <section className="panel wide">
        <h3>Estado y servicios</h3>
        {status.data ? <ContainerStatusTable containers={status.data.containers} /> : null}
      </section>

      <section className="panel">
        <h3>Validaciones esperadas</h3>
        <ul className="claims-list">{(scenarioLabels[scenarioId] || deployment?.validation_checks || []).map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section className="panel">
        <h3>Última ejecución</h3>
        {latestRun.data ? (
          <dl className="facts">
            <dt>Run</dt><dd><Link to={`/runs/${latestRun.data.run_id}`}>{latestRun.data.run_id}</Link></dd>
            <dt>Estado</dt><dd><StatusBadge status={String(latestRun.data.validation?.status || latestRun.data.metadata.status || 'unknown')} kind="validation" /></dd>
            <dt>Fecha</dt><dd>{formatDate(String(latestRun.data.metadata.finished_at || latestRun.data.metadata.started_at || ''))}</dd>
            <dt>Commit</dt><dd>{String(latestRun.data.metadata.git_commit || 'sin dato')}</dd>
          </dl>
        ) : <p className="muted-text">Sin ejecuciones para este escenario.</p>}
      </section>

      <section className="panel wide">
        <h3>Resultados de validación</h3>
        <div className="table-wrap"><table><thead><tr><th>Check</th><th>Estado</th><th>Evidencia</th></tr></thead><tbody>{validationChecks.map((check) => <tr key={check.id}><td>{check.id}</td><td><StatusBadge status={check.status} kind="validation" /></td><td>{check.detail}</td></tr>)}</tbody></table></div>
      </section>

      <section className="panel">
        <h3>Claims validados</h3>
        <ul className="claims-list">{((latestRun.data?.metadata.validated_claims as string[] | undefined) || []).map((claim) => <li key={claim}>{claim}</li>)}</ul>
      </section>

      <section className="panel">
        <h3>Limitaciones</h3>
        <p>No se valida llamada completa, RTP, audio, IMS AKA, teléfono real ni RF 5G.</p>
      </section>

      <section className="panel wide">
        <div className="controls-panel">
          <h3>Logs</h3>
          <label>Servicio<select value={container} onChange={(event) => setContainer(event.target.value)}><option value="todos">todos</option>{components.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <ActionButton variant="secondary" onClick={() => logs.refetch()} loading={logs.isFetching}>Consultar logs</ActionButton>
        </div>
        <LogsViewer response={logs.data} />
      </section>
    </div>
  );
}
