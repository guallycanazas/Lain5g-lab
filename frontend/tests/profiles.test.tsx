import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileConfigPage } from '../src/pages/ProfileConfigPage';
import { jsonResponse, renderRoute } from './testUtils';

const profile = {
  profile: '5g-sa',
  network: { mcc: '001', mnc: '01', tac: 1, dnn: 'internet', slice: { sst: 1, sd: '000001' } },
  core: { amf_addr: '10.20.0.5', gnb_addr: '10.20.0.20' },
  subscriber: { imsi: '001011234567895' },
  safety: { rf_allowed: false },
};

const x310Profile = {
  profile: '5g-sa-x310',
  network: { mcc: '001', mnc: '01', tac: 1, dnn: 'internet', slice: { sst: 1, sd: '000001' } },
  core: { amf_addr: '', gnb_bind_addr: '', n3_bind_addr: '' },
  radio: { device: 'x310', usrp_addr: '192.168.10.2', band: null, dl_arfcn: null, bandwidth_mhz: 10, tx_gain: null, rx_gain: null, clock_source: 'internal', time_source: 'internal' },
  safety: { maximum_duration_seconds: 60, rf_allowed: false, environment: 'cabled' },
};

const summaries = [
  { profile: '4g-volte-sim', rf_capable: false, rf_allowed: false },
  { profile: '4g-lte-x310', rf_capable: true, rf_allowed: false },
  { profile: '5g-sa', rf_capable: false, rf_allowed: false },
  { profile: '5g-sa-x310', rf_capable: true, rf_allowed: false },
  { profile: '5g-vonr', rf_capable: false, rf_allowed: false },
];

describe('Profile configuration', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((url, init) => {
      const target = String(url);
      if (target === '/api/profiles') return jsonResponse(summaries);
      if (target === '/api/profiles/4g-volte-sim') return jsonResponse({ ...profile, profile: '4g-volte-sim' });
      if (target === '/api/profiles/5g-sa' && init?.method === 'PUT') return jsonResponse(profile);
      if (target === '/api/profiles/5g-sa') return jsonResponse(profile);
      if (target === '/api/profiles/5g-sa-x310' && init?.method === 'PUT') return jsonResponse(x310Profile);
      if (target === '/api/profiles/5g-sa-x310') return jsonResponse(x310Profile);
      if (target.endsWith('/validate')) return jsonResponse({ profile: '5g-sa', valid: true, errors: [] });
      if (target.endsWith('/diff')) return jsonResponse({ profile: '5g-sa', files: [{ path: 'deployments/5g-sa/.env', changed: true, diff: 'diff output' }] });
      if (target.endsWith('/apply')) return jsonResponse({ profile: '5g-sa', modified_files: ['deployments/5g-sa/.env'], backup: '.backups/config/5g-sa/run' });
      if (target.endsWith('/restore')) return jsonResponse({ profile: '5g-sa', restored_files: ['deployments/5g-sa/.env'], backup: '.backups/config/5g-sa/run' });
      return jsonResponse({ detail: { code: 'NOT_FOUND', message: 'not found' } }, 404);
    }));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => vi.restoreAllMocks());

  it('shows known profile fields and applies through API without YAML editor', async () => {
    renderRoute('/configuration', <ProfileConfigPage />);
    expect(await screen.findByText('5g-sa')).toBeInTheDocument();
    await userEvent.click(screen.getByText('5g-sa'));
    expect(await screen.findByLabelText('MCC')).toHaveValue('001');
    expect(screen.getByLabelText('DNN')).toHaveValue('internet');
    expect(screen.queryByText('editor YAML')).not.toBeInTheDocument();
    await userEvent.click(screen.getByText('Guardar y aplicar'));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/profiles/5g-sa/apply', expect.objectContaining({ method: 'POST' })));
  });

  it('lists all profiles and blocks incomplete RF apply from the form', async () => {
    vi.mocked(fetch).mockImplementation((url, init) => {
      const target = String(url);
      if (target === '/api/profiles') return jsonResponse(summaries);
      if (target === '/api/profiles/4g-volte-sim') return jsonResponse({ ...profile, profile: '4g-volte-sim' });
      if (target === '/api/profiles/5g-sa-x310' && init?.method === 'PUT') return jsonResponse(x310Profile);
      if (target === '/api/profiles/5g-sa-x310') return jsonResponse(x310Profile);
      if (target.endsWith('/validate')) return jsonResponse({ profile: '5g-sa-x310', valid: false, errors: ['radio.band is required for 5G RF profiles'] });
      if (target.endsWith('/diff')) return jsonResponse({ profile: '5g-sa-x310', files: [] });
      if (target.endsWith('/apply')) return jsonResponse({ profile: '5g-sa-x310', modified_files: [], backup: '.backups/config/5g-sa-x310/run' });
      return jsonResponse(profile);
    });
    renderRoute('/configuration', <ProfileConfigPage />);
    for (const item of summaries) expect(await screen.findByText(item.profile)).toBeInTheDocument();
    expect(screen.queryByText('SUBSCRIBER_KEY')).not.toBeInTheDocument();
    expect(screen.queryByText('IMS_AUTH_PASSWORD')).not.toBeInTheDocument();
    expect(document.querySelector('textarea')).toBeNull();
    await userEvent.click(screen.getByText('5g-sa-x310'));
    expect(await screen.findByLabelText('USRP address')).toHaveValue('192.168.10.2');
    await userEvent.click(screen.getByText('Validar'));
    expect(await screen.findByText(/radio.band is required/)).toBeInTheDocument();
    await userEvent.click(screen.getByText('Ver cambios'));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/profiles/5g-sa-x310/diff', expect.any(Object)));
    await userEvent.click(screen.getByText('Guardar y aplicar'));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/profiles/5g-sa-x310/validate', expect.objectContaining({ method: 'POST' })));
    expect(fetch).not.toHaveBeenCalledWith('/api/profiles/5g-sa-x310/apply', expect.any(Object));
    expect(fetch).not.toHaveBeenCalledWith('/api/profiles/5g-sa-x310/restore', expect.any(Object));
  });
});
