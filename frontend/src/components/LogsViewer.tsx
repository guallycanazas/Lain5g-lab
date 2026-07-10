import type { LogsResponse } from '../types/deployment';

export function LogsViewer({ response }: { response?: LogsResponse }) {
  const text = response?.command.stdout || 'Sin logs disponibles.';
  const copy = async () => navigator.clipboard?.writeText(text);
  return (
    <section className="panel logs-panel">
      <div className="panel-heading">
        <h2>Salida de logs</h2>
        <button onClick={copy}>Copiar</button>
      </div>
      <pre className="logs-viewer">{text}</pre>
      {response?.command.stderr ? <pre className="stderr">{response.command.stderr}</pre> : null}
    </section>
  );
}
