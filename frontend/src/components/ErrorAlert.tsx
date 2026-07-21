import { errorMessage, errorTitle, technicalDetails } from '../utils/errors';
import { Link } from 'react-router-dom';
import { AlertTriangle, ExternalLink, RotateCcw, ScrollText } from 'lucide-react';

interface ErrorAlertProps {
  error: unknown;
  onRetry?: () => void;
}

export function ErrorAlert({ error, onRetry }: ErrorAlertProps) {
  return (
    <div className="error-alert" role="alert">
      <div className="error-alert-icon"><AlertTriangle size={19} /></div>
      <div className="error-alert-body"><strong>{errorTitle(error)}</strong>
      <p>{errorMessage(error)}</p>
      <details>
        <summary>Detalles técnicos</summary>
        <pre>{technicalDetails(error)}</pre>
      </details>
      <div className="error-actions">
        {onRetry ? <button className="secondary" onClick={onRetry}><RotateCcw size={14} />Reintentar</button> : null}
        <Link className="action-button secondary" to="/deployments"><ExternalLink size={14} />Open configuration</Link>
        <Link className="action-button secondary" to="/logs"><ScrollText size={14} />Inspect logs</Link>
      </div></div>
    </div>
  );
}
