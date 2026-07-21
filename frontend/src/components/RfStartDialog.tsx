import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AlertTriangle, RadioTower, ShieldCheck, Timer, X } from 'lucide-react';
import type { RfStartPayload } from '../types/deployment';
import { profilesApi } from '../services/profilesApi';

const acknowledgementLabels = {
  legal_authorization_valid: 'La autorización legal y local sigue vigente.',
  isolation_and_attenuation_verified: 'Blindaje, cableado y atenuación fueron verificados físicamente.',
  channel_and_gain_reviewed: 'Canal, ancho de banda y ganancias coinciden con el plan aprobado.',
  emergency_stop_accessible: 'La parada de emergencia está accesible durante toda la sesión.',
};

export function RfStartDialog({ scenarioId, open, loading, onCancel, onConfirm }: { scenarioId: string; open: boolean; loading: boolean; onCancel: () => void; onConfirm: (payload: RfStartPayload) => void }) {
  const [duration, setDuration] = useState(60);
  const [note, setNote] = useState('Sesión RF controlada desde Lain5G-Lab');
  const [phrase, setPhrase] = useState('');
  const [acknowledgements, setAcknowledgements] = useState<Record<keyof RfStartPayload['acknowledgements'], boolean>>({ legal_authorization_valid: false, isolation_and_attenuation_verified: false, channel_and_gain_reviewed: false, emergency_stop_accessible: false });
  const profile = useQuery({ queryKey: ['profile', scenarioId], queryFn: () => profilesApi.detail(scenarioId), enabled: open });
  const diff = useQuery({ queryKey: ['profile-diff', scenarioId], queryFn: () => profilesApi.diff(scenarioId), enabled: open });
  const expectedPhrase = `START ${scenarioId.toUpperCase()} RF`;
  const is5g = scenarioId === '5g-sa-x310';
  const config = profile.data;
  const radio = config?.radio || {};
  const safety = config?.safety || {};
  const maximumDuration = Number(safety.maximum_duration_seconds) || 60;
  const pendingChanges = Boolean(diff.data?.files?.some((file) => file.changed));
  const configurationReady = Boolean(config && diff.data && !pendingChanges);
  const valid = configurationReady && duration >= 1 && duration <= maximumDuration && phrase === expectedPhrase && note.trim().length >= 3 && Object.values(acknowledgements).every(Boolean);

  useEffect(() => {
    if (!open) return;
    setPhrase('');
    setAcknowledgements({ legal_authorization_valid: false, isolation_and_attenuation_verified: false, channel_and_gain_reviewed: false, emergency_stop_accessible: false });
  }, [open, scenarioId]);

  useEffect(() => {
    if (!open || !profile.data) return;
    const limit = Number(profile.data.safety?.maximum_duration_seconds) || 60;
    setDuration(Math.min(60, limit));
    setNote(profile.data.safety?.operator_note || 'Sesión RF controlada desde Lain5G-Lab');
  }, [open, profile.data, scenarioId]);

  if (!open) return null;
  return <div className="dialog-backdrop rf-dialog-backdrop" role="presentation">
    <section className="rf-start-dialog" role="dialog" aria-modal="true" aria-labelledby="rf-start-title">
      <header><div className="rf-dialog-title"><span><RadioTower size={21} /></span><div><small>GUARDED RF SESSION</small><h2 id="rf-start-title">Start {is5g ? '5G gNB' : 'LTE eNB'} + X310</h2></div></div><button className="dialog-close" type="button" onClick={onCancel} aria-label="Cerrar"><X size={18} /></button></header>
      <div className="rf-danger-banner"><AlertTriangle size={18} /><div><strong>Esta acción transmite energía RF.</strong><span>El core se inicia primero y el contenedor SDR se detiene automáticamente.</span></div></div>
      {profile.isLoading || diff.isLoading ? <div className="rf-config-state">Cargando configuración RF efectiva…</div> : null}
      {profile.error || diff.error ? <div className="rf-config-state error">No se pudo verificar la configuración RF. El inicio permanece bloqueado.</div> : null}
      {pendingChanges ? <div className="rf-config-state warning"><strong>Hay cambios pendientes de aplicar.</strong><span>Abre <Link to="/deployments" onClick={onCancel}>Deployments</Link>, valida y aplica el perfil antes de iniciar RF.</span></div> : null}
      <div className="rf-session-summary">
        <div><span>Radio</span><strong>{is5g ? `n${radio.band ?? '—'} · ARFCN ${radio.dl_arfcn ?? '—'}` : `Banda ${radio.lte_band ?? '—'} · EARFCN ${radio.earfcn ?? '—'}`}</strong></div>
        <div><span>Ancho de banda</span><strong>{radio.bandwidth_mhz ?? '—'} MHz</strong></div>
        <div><span>Ganancias TX / RX</span><strong>{radio.tx_gain ?? '—'} / {radio.rx_gain ?? '—'} dB</strong></div>
        <div><span>USRP</span><strong>{radio.usrp_addr || '—'} · {radio.device || '—'}</strong></div>
        <div><span>Entorno</span><strong>{safety.environment || '—'} · {safety.attenuation_db ?? '—'} dB</strong></div>
        <div><span>Límite auto-stop</span><strong>{maximumDuration} segundos</strong></div>
      </div>
      <div className="rf-profile-link">Valores tomados del perfil aplicado <code>{scenarioId}</code>. <Link to="/deployments" onClick={onCancel}>Editar configuración</Link></div>
      <div className="rf-form-grid"><label><Timer size={14} />Duración solicitada (segundos)<input type="number" min={1} max={maximumDuration} value={duration} onChange={(event) => setDuration(Number(event.target.value))} /></label><label>Propósito del operador<input value={note} maxLength={240} onChange={(event) => setNote(event.target.value)} /></label></div>
      <fieldset className="rf-acknowledgements"><legend><ShieldCheck size={15} />Required checks</legend>{Object.entries(acknowledgementLabels).map(([key, label]) => <label key={key}><input type="checkbox" checked={acknowledgements[key as keyof typeof acknowledgements]} onChange={(event) => setAcknowledgements((current) => ({ ...current, [key]: event.target.checked }))} /><span>{label}</span></label>)}</fieldset>
      <label className="rf-confirmation">Type <code>{expectedPhrase}</code> to authorize this session<input autoComplete="off" value={phrase} onChange={(event) => setPhrase(event.target.value)} /></label>
      <footer><button className="secondary" type="button" onClick={onCancel}>Cancel</button><button className="danger rf-launch-button" type="button" disabled={!valid || loading} onClick={() => onConfirm({ execute: true, confirmation_phrase: phrase, operator_note: note.trim(), requested_duration_seconds: duration, acknowledgements })}>{loading ? 'Starting guarded session…' : 'Start core + RF'}</button></footer>
    </section>
  </div>;
}
