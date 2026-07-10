import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LogsPage } from '../src/pages/LogsPage';
import { deploymentStatus, jsonResponse, renderWithClient } from './testUtils';

describe('LogsPage', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('selects container and tail and shows logs', async () => {
    vi.stubGlobal('fetch', vi.fn(() => jsonResponse({ id: '5g-sa', container: 'amf', tail: 500, command: { ...deploymentStatus.command, stdout: 'amf log line' } })));
    renderWithClient(<LogsPage />);

    await userEvent.selectOptions(screen.getByLabelText('Contenedor'), 'amf');
    await userEvent.selectOptions(screen.getByLabelText('Líneas'), '500');
    await userEvent.click(screen.getByRole('button', { name: 'Actualizar' }));

    expect(await screen.findByText('amf log line')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith('/api/deployments/5g-sa/logs?tail=500&container=amf', expect.any(Object));
  });

  it('handles log API errors', async () => {
    vi.stubGlobal('fetch', vi.fn(() => jsonResponse({ detail: { code: 'DEPLOYMENT_LOGS_FAILED', message: 'Logs failed' } }, 500)));
    renderWithClient(<LogsPage />);

    await userEvent.click(screen.getByRole('button', { name: 'Actualizar' }));

    expect(await screen.findByText('Error del backend')).toBeInTheDocument();
  });
});
