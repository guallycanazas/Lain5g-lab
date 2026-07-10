import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { ScenarioDetailPage } from '../src/pages/ScenarioDetailPage';
import { ScenariosPage } from '../src/pages/ScenariosPage';
import { deploymentStatus, jsonResponse, renderRoute, renderWithClient } from './testUtils';

const scenarios = [
  { id: '5g-sa', name: '5G SA', description: '5G standalone', path: 'deployments/5g-sa', status: 'stopped', mode: 'simulation', supported_actions: ['start', 'stop', 'restart', 'status', 'logs', 'validate'], validation_checks: ['ng_setup'], rf_capable: false, components: ['mongo', 'nrf', 'amf', 'gnb', 'ue'] },
  { id: '4g-volte-sim', name: '4G LTE + VoLTE Signaling', description: '4G signaling', path: 'deployments/4g-volte/sim', status: 'stopped', mode: 'simulation', supported_actions: ['start', 'stop', 'restart', 'status', 'logs', 'validate'], validation_checks: ['s1_setup', 'sip_register'], rf_capable: false, components: ['mme', 'enb', 'ue', 'pcscf'] },
  { id: '5g-vonr-sim', name: '5G SA + VoNR Signaling', description: '5G IMS PDU signaling', path: 'deployments/5g-vonr', status: 'stopped', mode: 'simulation', supported_actions: ['start', 'stop', 'restart', 'status', 'logs', 'validate'], validation_checks: ['pdu_internet', 'pdu_ims', 'sip_register'], rf_capable: false, components: ['nrf', 'amf', 'ue', 'pcscf'] },
  { id: '4g-lte-x310', name: 'LTE RF + USRP X310', description: 'RF CONTROLADO', path: 'deployments/4g-volte/x310', status: 'stopped', mode: 'rf-controlled', supported_actions: ['stop', 'status', 'logs', 'validate', 'hardware-check', 'preflight', 'start-epc', 'emergency-stop'], validation_checks: ['hardware_detected'], rf_capable: true, components: ['mme', 'enb-x310'] },
];

const runDetail = {
  run_id: 'run-vonr',
  metadata: { run_id: 'run-vonr', scenario: '5g-vonr-sim', status: 'PASS', finished_at: '2026-07-10T13:36:33Z', git_commit: 'abc1234', validated_claims: ['SIP REGISTER succeeded'] },
  validation: { status: 'PASS', checks: [{ id: 'sip_register', status: 'PASS', detail: 'REGISTER, 401, authenticated REGISTER, and final 200 OK observed' }] },
  metrics: { metrics: [{ id: 'ue_ims_ip', value: '10.61.0.2' }] },
  logs: ['sip-register-run.log'],
  loaded_at: '2026-07-10T13:36:34Z',
};

function stubScenarioFetch(extra?: (url: string, init?: RequestInit) => Promise<Response> | undefined) {
  vi.stubGlobal('fetch', vi.fn((url: string, init?: RequestInit) => {
    const overridden = extra?.(url, init);
    if (overridden) return overridden;
    if (url === '/api/deployments') return jsonResponse(scenarios);
    const scenario = scenarios.find((item) => url.includes(`/api/deployments/${item.id}`));
    if (scenario && !url.includes('/status') && !url.includes('/logs') && init?.method !== 'POST') return jsonResponse(scenario);
    if (url.includes('/status')) return jsonResponse({ ...deploymentStatus, id: scenario?.id || '5g-sa' });
    if (url.includes('/api/runs?')) return jsonResponse([{ run_id: 'run-vonr', scenario: scenario?.id || '5g-vonr-sim', status: 'PASS' }]);
    if (url.includes('/api/runs/run-vonr')) return jsonResponse(runDetail);
    if (url.includes('/logs')) return jsonResponse({ id: scenario?.id || '5g-sa', container: null, tail: 200, command: { ...deploymentStatus.command, stdout: 'log output' } });
    if (init?.method === 'POST') return jsonResponse({ id: scenario?.id || '5g-sa', action: 'ok', status: 'stopped', message: 'ok', command: deploymentStatus.command });
    return jsonResponse({});
  }));
}

describe('Scenarios pages', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('lists all registered scenarios', async () => {
    stubScenarioFetch();
    renderWithClient(<ScenariosPage />);
    expect(await screen.findByText('5G SA')).toBeInTheDocument();
    expect(screen.getByText('4G LTE + VoLTE Signaling')).toBeInTheDocument();
    expect(screen.getByText('5G SA + VoNR Signaling')).toBeInTheDocument();
    expect(screen.getByText('LTE RF + USRP X310')).toBeInTheDocument();
    expect(screen.getAllByText('RF CONTROLADO').length).toBeGreaterThan(0);
  });

  it('shows 5G SA detail checks', async () => {
    stubScenarioFetch();
    renderRoute('/scenarios/:scenarioId', <ScenarioDetailPage />, '/scenarios/5g-sa');
    expect(await screen.findByText('NG Setup')).toBeInTheDocument();
    expect(screen.getByText('PDU Session')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Iniciar' })).toBeInTheDocument();
  });

  it('shows 4G VoLTE detail checks', async () => {
    stubScenarioFetch();
    renderRoute('/scenarios/:scenarioId', <ScenarioDetailPage />, '/scenarios/4g-volte-sim');
    expect(await screen.findByText('S1 Setup')).toBeInTheDocument();
    expect(screen.getByText('SIP REGISTER')).toBeInTheDocument();
  });

  it('shows 5G VoNR detail checks and last SIP evidence', async () => {
    stubScenarioFetch();
    renderRoute('/scenarios/:scenarioId', <ScenarioDetailPage />, '/scenarios/5g-vonr-sim');
    expect(await screen.findByText('Internet PDU')).toBeInTheDocument();
    expect(screen.getByText('IMS PDU')).toBeInTheDocument();
    expect(await screen.findByText('REGISTER, 401, authenticated REGISTER, and final 200 OK observed')).toBeInTheDocument();
  });

  it('shows safe X310 controls without normal RF start', async () => {
    stubScenarioFetch();
    renderRoute('/scenarios/:scenarioId', <ScenarioDetailPage />, '/scenarios/4g-lte-x310');
    await waitFor(() => expect(screen.getAllByText('RF CONTROLADO').length).toBeGreaterThan(0));
    expect(screen.queryByRole('button', { name: 'Iniciar' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hardware check' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar EPC sin RF' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Emergency stop' })).toBeInTheDocument();
  });

  it('shows conflict errors from start actions', async () => {
    stubScenarioFetch((url, init) => {
      if (url.includes('/start') && init?.method === 'POST') return jsonResponse({ detail: { code: 'DEPLOYMENT_CONFLICT', message: 'Another laboratory scenario is currently running.', active_scenario: '5g-sa' } }, 409);
      return undefined;
    });
    renderRoute('/scenarios/:scenarioId', <ScenarioDetailPage />, '/scenarios/5g-vonr-sim');
    await userEvent.click(await screen.findByRole('button', { name: 'Iniciar' }));
    await waitFor(() => expect(screen.getByText('Conflicto de estado')).toBeInTheDocument());
  });

  it('queries logs for selected scenario', async () => {
    stubScenarioFetch();
    renderRoute('/scenarios/:scenarioId', <ScenarioDetailPage />, '/scenarios/5g-vonr-sim');
    await userEvent.click(await screen.findByRole('button', { name: 'Consultar logs' }));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/deployments/5g-vonr-sim/logs'), expect.anything()));
  });
});
