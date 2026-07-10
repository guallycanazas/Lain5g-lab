import { useState } from 'react';
import type { SubscriberSummary } from '../../types/subscriber';

interface Props {
  subscriber: SubscriberSummary | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (imsi: string) => void;
}

export function SubscriberDeleteDialog({ subscriber, loading, onCancel, onConfirm }: Props) {
  const [confirmation, setConfirmation] = useState('');
  if (!subscriber) return null;
  const allowed = confirmation === subscriber.imsi;
  return (
    <div className="dialog-backdrop" role="presentation">
      <div className="dialog" role="dialog" aria-modal="true">
        <h2>Eliminar suscriptor</h2>
        <p>Escribe el IMSI <strong>{subscriber.imsi}</strong> para confirmar. Esto no detiene el laboratorio ni borra ejecuciones.</p>
        <label>Confirmar IMSI<input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>
        <div className="dialog-actions">
          <button onClick={onCancel}>Cancelar</button>
          <button className="danger" disabled={!allowed || loading} onClick={() => onConfirm(subscriber.imsi)}>{loading ? 'Eliminando...' : 'Eliminar'}</button>
        </div>
      </div>
    </div>
  );
}
