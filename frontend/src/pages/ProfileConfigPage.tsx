import { useEffect, useState } from 'react';
import { ErrorAlert } from '../components/ErrorAlert';
import { LoadingState } from '../components/LoadingState';
import { useProfile, useProfileActions, useProfiles } from '../hooks/useProfiles';
import type { ProfileConfig } from '../types/profile';

const SECTIONS: Record<string, Array<[string, string, string]>> = {
  Red: [
    ['network.mcc', 'MCC', 'text'], ['network.mnc', 'MNC', 'text'], ['network.tac', 'TAC', 'number'], ['network.dnn', 'DNN', 'text'],
    ['network.dnn_internet', 'DNN internet', 'text'], ['network.dnn_ims', 'DNN IMS', 'text'], ['network.apn_internet', 'APN internet', 'text'], ['network.apn_ims', 'APN IMS', 'text'],
    ['network.slice.sst', 'SST', 'number'], ['network.slice.sd', 'SD', 'text'],
  ],
  Núcleo: [['core.amf_addr', 'AMF address', 'text'], ['core.gnb_addr', 'gNB address', 'text'], ['core.mme_addr', 'MME address', 'text'], ['core.gnb_bind_addr', 'gNB bind address', 'text'], ['core.n3_bind_addr', 'N3 bind address', 'text']],
  Abonado: [['subscriber.imsi', 'IMSI', 'text'], ['subscriber.msisdn', 'MSISDN', 'text']],
  IMS: [['ims.domain', 'Dominio IMS', 'text']],
  Radio: [['ran.enb_bind_addr', 'eNB bind address', 'text'], ['ran.dl_earfcn', 'DL EARFCN', 'number'], ['ran.tx_gain', 'TX gain', 'number'], ['ran.rx_gain', 'RX gain', 'number'], ['radio.usrp_addr', 'USRP address', 'text'], ['radio.lte_band', 'LTE band', 'number'], ['radio.earfcn', 'EARFCN', 'number'], ['radio.band', 'NR band', 'number'], ['radio.dl_arfcn', 'DL ARFCN', 'number'], ['radio.tx_gain', 'TX gain', 'number'], ['radio.rx_gain', 'RX gain', 'number']],
  'Seguridad RF': [['safety.maximum_duration_seconds', 'Duración máxima', 'number'], ['safety.environment', 'Entorno', 'text']],
};

export function ProfileConfigPage() {
  const profiles = useProfiles();
  const [selected, setSelected] = useState<string | null>(null);
  const profile = useProfile(selected);
  const actions = useProfileActions(selected);
  const [draft, setDraft] = useState<ProfileConfig | null>(null);

  useEffect(() => { if (!selected && profiles.data?.length) setSelected(profiles.data[0].profile); }, [profiles.data, selected]);
  useEffect(() => { if (profile.data) setDraft(structuredClone(profile.data)); }, [profile.data]);

  const save = async () => {
    if (!draft) return;
    await actions.update.mutateAsync(draft);
    const result = await actions.validate.mutateAsync();
    if (!result.valid) return;
    const diff = await actions.diff.mutateAsync();
    const changed = diff.files.filter((file) => file.changed).length;
    if (window.confirm(`Configuration valid.\n${changed} files will be modified.\nApply changes?`)) await actions.apply.mutateAsync();
  };

  return (
    <section className="page-panel">
      <div className="panel-heading"><h2>Configuración</h2></div>
      {profiles.isLoading ? <LoadingState /> : null}
      {profiles.error ? <ErrorAlert error={profiles.error} /> : null}
      <div className="scenario-grid">
        {profiles.data?.map((item) => (
          <button key={item.profile} className={`panel scenario-card ${selected === item.profile ? 'selected' : ''}`} onClick={() => setSelected(item.profile)}>
            <span className="eyebrow">{item.rf_capable ? 'RF controlado' : 'Simulación'}</span>
            <strong>{item.profile}</strong>
            <span>RF allowed: {String(item.rf_allowed)}</span>
          </button>
        ))}
      </div>
      {profile.isLoading ? <LoadingState /> : null}
      {profile.error ? <ErrorAlert error={profile.error} /> : null}
      {actions.update.error ? <ErrorAlert error={actions.update.error} /> : null}
      {actions.validate.error ? <ErrorAlert error={actions.validate.error} /> : null}
      {actions.diff.error ? <ErrorAlert error={actions.diff.error} /> : null}
      {actions.apply.error ? <ErrorAlert error={actions.apply.error} /> : null}
      {actions.restore.error ? <ErrorAlert error={actions.restore.error} /> : null}
      {draft ? <ProfileForm draft={draft} setDraft={setDraft} /> : null}
      <div className="action-row">
        <button onClick={() => actions.validate.mutate()} disabled={!selected}>Validar</button>
        <button onClick={() => actions.diff.mutate()} disabled={!selected}>Ver cambios</button>
        <button onClick={save} disabled={!selected || actions.update.isPending || actions.apply.isPending}>Guardar y aplicar</button>
        <button onClick={() => actions.restore.mutate()} disabled={!selected}>Restaurar última copia</button>
      </div>
      {actions.validate.data ? <pre className="log-output">{JSON.stringify(actions.validate.data, null, 2)}</pre> : null}
      {actions.diff.data ? <pre className="log-output">{actions.diff.data.files.map((file) => file.diff).join('\n')}</pre> : null}
      {actions.apply.data ? <pre className="log-output">{JSON.stringify(actions.apply.data, null, 2)}</pre> : null}
      {actions.restore.data ? <pre className="log-output">{JSON.stringify(actions.restore.data, null, 2)}</pre> : null}
    </section>
  );
}

function ProfileForm({ draft, setDraft }: { draft: ProfileConfig; setDraft: (value: ProfileConfig) => void }) {
  return (
    <div className="profile-form">
      {Object.entries(SECTIONS).map(([section, fields]) => {
        const visible = fields.filter(([path]) => hasPath(draft, path));
        if (!visible.length) return null;
        return (
          <fieldset key={section} className="panel form-section">
            <legend>{section}</legend>
            {visible.map(([path, label, type]) => (
              <label key={path}>
                <span>{label}</span>
                <input type={type} value={valueToInput(getPath(draft, path))} onChange={(event) => setDraft(setPath(draft, path, inputToValue(event.target.value, getPath(draft, path))))} />
              </label>
            ))}
          </fieldset>
        );
      })}
    </div>
  );
}

function hasPath(data: any, path: string) { return path.split('.').every((part) => { if (!data || !(part in data)) return false; data = data[part]; return true; }); }
function getPath(data: any, path: string) { return path.split('.').reduce((value, part) => value?.[part], data); }
function setPath(data: any, path: string, value: any) { const copy = structuredClone(data); const parts = path.split('.'); let target = copy; for (const part of parts.slice(0, -1)) target = target[part]; target[parts.at(-1)!] = value; return copy; }
function valueToInput(value: any) { return value === null || value === undefined ? '' : String(value); }
function inputToValue(value: string, previous: any) { if (value === '') return null; return typeof previous === 'number' ? Number(value) : value; }
