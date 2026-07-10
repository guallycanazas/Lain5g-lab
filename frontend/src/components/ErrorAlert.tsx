import { errorMessage, errorTitle, technicalDetails } from '../utils/errors';

interface ErrorAlertProps {
  error: unknown;
  onRetry?: () => void;
}

export function ErrorAlert({ error, onRetry }: ErrorAlertProps) {
  return (
    <div className="error-alert" role="alert">
      <strong>{errorTitle(error)}</strong>
      <p>{errorMessage(error)}</p>
      <details>
        <summary>Detalles técnicos</summary>
        <pre>{technicalDetails(error)}</pre>
      </details>
      {onRetry ? <button onClick={onRetry}>Reintentar</button> : null}
    </div>
  );
}
