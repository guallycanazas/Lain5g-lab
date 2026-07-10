import { FormEvent, useState } from 'react';
import type { SubscriberClonePayload, SubscriberSummary } from '../../types/subscriber';

interface Props {
  subscriber: SubscriberSummary | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (imsi: string, payload: SubscriberClonePayload) => void;
}

export function SubscriberCloneDialog({ subscriber, loading, onCancel, onConfirm }: Props) {
  const [newImsi, setNewImsi] = useState('');
  const [newMsisdn, setNewMsisdn] = useState('');
  const [error, setError] = useState('');
  if (!subscriber) return null;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!/^\d{5,15}$/.test(newImsi) || newImsi === subscriber.imsi) {
      setError('Nuevo IMSI inválido o igual al origen.');
      return;
    }
    if (newMsisdn && !/^\d{5,20}$/.test(newMsisdn)) {
      setError('Nuevo MSISDN inválido.');
      return;
    }
    setError('');
    onConfirm(subscriber.imsi, { new_imsi: newImsi, new_msisdn: newMsisdn || null });
  };
  return (
    <div className="dialog-backdrop" role="presentation">
      <form className="dialog" role="dialog" aria-modal="true" onSubmit={submit}>
        <h2>Clonar suscriptor</h2>
        <p>Origen: <strong>{subscriber.imsi}</strong>. Las credenciales se copian internamente, pero no se muestran.</p>
        <label>Nuevo IMSI<input value={newImsi} onChange={(event) => setNewImsi(event.target.value)} /></label>
        <label>Nuevo MSISDN opcional<input value={newMsisdn} onChange={(event) => setNewMsisdn(event.target.value)} /></label>
        {error ? <p className="field-error">{error}</p> : null}
        <div className="dialog-actions">
          <button type="button" onClick={onCancel}>Cancelar</button>
          <button disabled={loading}>{loading ? 'Clonando...' : 'Clonar'}</button>
        </div>
      </form>
    </div>
  );
}
