import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RunDetailPage } from '../src/pages/RunDetailPage';
import { RunsPage } from '../src/pages/RunsPage';
import { jsonResponse, renderRoute, renderWithClient, runSummary, validationReport } from './testUtils';

describe('Runs pages', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('lists runs ordered by date', async () => {
    vi.stubGlobal('fetch', vi.fn(() => jsonResponse([
      { ...runSummary, run_id: 'run-old', started_at: '2026-07-09T00:00:00Z' },
      runSummary,
    ])));
    renderWithClient(<RunsPage />);

    const rows = await screen.findAllByRole('row');
    expect(rows[1]).toHaveTextContent('run-valid');
  });

  it('handles empty run lists', async () => {
    vi.stubGlobal('fetch', vi.fn(() => jsonResponse([])));
    renderWithClient(<RunsPage />);

    expect(await screen.findByText('Sin ejecuciones')).toBeInTheDocument();
  });

  it('opens run detail', async () => {
    vi.stubGlobal('fetch', vi.fn(() => jsonResponse({
      run_id: 'run-valid',
      metadata: { ...runSummary, status: 'stopped' },
      validation: validationReport,
      metrics: { metrics: [] },
      logs: ['docker-compose.log'],
      loaded_at: '2026-07-10T02:00:00Z',
    })));
    renderRoute('/runs/:runId', <RunDetailPage />, '/runs/run-valid');

    expect(await screen.findByText('run-valid')).toBeInTheDocument();
    expect(screen.getByText('docker-compose.log')).toBeInTheDocument();
  });

  it('shows run not found errors', async () => {
    vi.stubGlobal('fetch', vi.fn(() => jsonResponse({ detail: { code: 'RUN_NOT_FOUND', message: 'Run was not found.' } }, 404)));
    renderRoute('/runs/:runId', <RunDetailPage />, '/runs/missing');

    expect(await screen.findByText('Solicitud inválida')).toBeInTheDocument();
  });
});
