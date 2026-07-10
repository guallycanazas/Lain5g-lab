import { FormEvent, useState } from 'react';
import type { SubscriberDetail, SubscriberFormPayload } from '../../types/subscriber';
import { ActionButton } from '../ActionButton';
import { SubscriberSecurityFields } from './SubscriberSecurityFields';

const hex32 = /^[0-9a-fA-F]{32}$/;
const imsiRe = /^\d{5,15}$/;
const msisdnRe = /^\d{5,20}$/;
const amfRe = /^[0-9a-fA-F]{4}$/;
const sqnRe = /^[0-9a-fA-F]{12}$/;
const sdRe = /^[0-9a-fA-F]{6}$/;
const dnnRe = /^[A-Za-z0-9][A-Za-z0-9.-]{0,62}$/;

interface SubscriberFormProps {
  mode: 'create' | 'edit';
  initial?: SubscriberDetail;
  loading?: boolean;
  onSubmit: (payload: SubscriberFormPayload) => void;
}

export function SubscriberForm({ mode, initial, loading, onSubmit }: SubscriberFormProps) {
  const editing = mode === 'edit';
  const [showSecrets, setShowSecrets] = useState(false);
  const [values, setValues] = useState({
    imsi: initial?.imsi || '',
    msisdn: initial?.msisdn || '',
    k: '',
    op: '',
    opc: '',
    amf: initial?.security.amf || '8000',
    sqn: editing ? '' : '000000000001',
    sst: String(initial?.sst ?? 1),
    sd: initial?.sd || '000001',
    dnn: initial?.dnn || 'internet',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = (name: string, value: string) => setValues((current) => ({ ...current, [name]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(values, editing);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit(toPayload(values, editing));
  };

  return (
    <form className="subscriber-form" onSubmit={submit}>
      <fieldset className="form-section">
        <legend>Identidad</legend>
        <label>IMSI *<input value={values.imsi} disabled={editing} onChange={(event) => setField('imsi', event.target.value)} /></label>
        {errors.imsi ? <p className="field-error">{errors.imsi}</p> : null}
        <label>MSISDN<input value={values.msisdn} onChange={(event) => setField('msisdn', event.target.value)} /></label>
        {errors.msisdn ? <p className="field-error">{errors.msisdn}</p> : null}
      </fieldset>
      <SubscriberSecurityFields showSecrets={showSecrets} editing={editing} values={values} errors={errors} onChange={setField} onToggle={() => setShowSecrets((value) => !value)} />
      <fieldset className="form-section">
        <legend>Slice y DNN</legend>
        <label>SST *<input type="number" value={values.sst} onChange={(event) => setField('sst', event.target.value)} /></label>
        {errors.sst ? <p className="field-error">{errors.sst}</p> : null}
        <label>SD<input value={values.sd} onChange={(event) => setField('sd', event.target.value)} /></label>
        {errors.sd ? <p className="field-error">{errors.sd}</p> : null}
        <label>DNN *<input value={values.dnn} onChange={(event) => setField('dnn', event.target.value)} /></label>
        {errors.dnn ? <p className="field-error">{errors.dnn}</p> : null}
      </fieldset>
      <p className="muted-text">Modificar autenticación puede requerir reiniciar el UE o forzar un nuevo registro.</p>
      <ActionButton loading={loading}>{editing ? 'Guardar cambios' : 'Crear suscriptor'}</ActionButton>
    </form>
  );
}

function validate(values: Record<string, string>, editing: boolean) {
  const errors: Record<string, string> = {};
  if (!editing && !imsiRe.test(values.imsi)) errors.imsi = 'IMSI debe contener 5 a 15 dígitos.';
  if (values.msisdn && !msisdnRe.test(values.msisdn)) errors.msisdn = 'MSISDN debe contener 5 a 20 dígitos.';
  if (!editing && !hex32.test(values.k)) errors.k = 'K debe tener 32 caracteres hexadecimales.';
  if (values.k && !hex32.test(values.k)) errors.k = 'K debe tener 32 caracteres hexadecimales.';
  if (values.op && !hex32.test(values.op)) errors.op = 'OP debe tener 32 caracteres hexadecimales.';
  if (values.opc && !hex32.test(values.opc)) errors.opc = 'OPc debe tener 32 caracteres hexadecimales.';
  if (values.op && values.opc) errors.opc = 'Usa OP u OPc, no ambos.';
  if (!editing && !values.op && !values.opc) errors.opc = 'OP u OPc es obligatorio.';
  if (values.amf && !amfRe.test(values.amf)) errors.amf = 'AMF debe tener 4 caracteres hexadecimales.';
  if (values.sqn && !sqnRe.test(values.sqn)) errors.sqn = 'SQN debe tener 12 caracteres hexadecimales.';
  const sst = Number(values.sst);
  if (!Number.isInteger(sst) || sst < 1 || sst > 255) errors.sst = 'SST debe estar entre 1 y 255.';
  if (values.sd && !sdRe.test(values.sd)) errors.sd = 'SD debe tener 6 caracteres hexadecimales.';
  if (!values.dnn || values.dnn.includes(' ') || !dnnRe.test(values.dnn)) errors.dnn = 'DNN debe ser un nombre seguro sin espacios.';
  return errors;
}

function toPayload(values: Record<string, string>, editing: boolean): SubscriberFormPayload {
  const security: NonNullable<SubscriberFormPayload['security']> = {};
  for (const key of ['k', 'op', 'opc', 'amf', 'sqn'] as const) {
    const value = values[key].trim();
    if (value || !editing && ['amf', 'sqn'].includes(key)) security[key] = value || null;
  }
  return {
    ...(!editing ? { imsi: values.imsi.trim() } : {}),
    msisdn: values.msisdn.trim() || null,
    security,
    slice: { sst: Number(values.sst), sd: values.sd.trim() || null },
    dnn: values.dnn.trim(),
  };
}
