import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ActionButton } from '../components/ActionButton';
import { ErrorAlert } from '../components/ErrorAlert';
import { LogsViewer } from '../components/LogsViewer';
import { deploymentsApi } from '../services/deploymentsApi';
import { formatDate } from '../utils/dates';

const containers = ['todos', 'mongo', 'nrf', 'amf', 'smf', 'upf', 'ausf', 'udm', 'udr', 'pcf', 'gnb', 'ue'];
const tailOptions = [100, 200, 500, 1000];

export function LogsPage() {
  const [container, setContainer] = useState('todos');
  const [tail, setTail] = useState(200);
  const logs = useQuery({
    queryKey: ['logs', container, tail],
    queryFn: () => deploymentsApi.logs(container === 'todos' ? null : container, tail),
    enabled: false,
  });

  return (
    <section className="page-panel">
      <div className="panel controls-panel">
        <h2>Logs</h2>
        <label>Contenedor
          <select value={container} onChange={(event) => setContainer(event.target.value)}>
            {containers.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>Líneas
          <select value={tail} onChange={(event) => setTail(Number(event.target.value))}>
            {tailOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <ActionButton onClick={() => logs.refetch()} loading={logs.isFetching}>Actualizar</ActionButton>
        <span className="muted-text">Última consulta: {logs.data ? formatDate(logs.data.command.finished_at) : 'sin consulta'}</span>
      </div>
      {logs.error ? <ErrorAlert error={logs.error} onRetry={() => logs.refetch()} /> : null}
      <LogsViewer response={logs.data} />
    </section>
  );
}
