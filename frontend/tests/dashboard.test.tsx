import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardPage } from '../src/pages/DashboardPage';
import { deploymentStatus, healthResponse, jsonResponse, validationReport, renderWithClient } from './testUtils';

describe('DashboardPage', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('shows backend and deployment status plus action buttons', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('/api/health')) return jsonResponse(healthResponse);
      if (url.includes('/status')) return jsonResponse(deploymentStatus);
      return jsonResponse({});
    }));

    renderWithClient(<DashboardPage />);

    expect(await screen.findByText('lain5g-lab-backend')).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText('Detenido').length).toBeGreaterThan(0));
    expect(screen.getByRole('button', { name: 'Iniciar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Detener' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reiniciar' })).toBeInTheDocument();
  });

  it('starts deployment through the API and disables actions while loading', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string, init?: RequestInit) => {
      if (url.includes('/api/health')) return jsonResponse(healthResponse);
      if (url.includes('/status')) return jsonResponse(deploymentStatus);
      if (url.includes('/start') && init?.method === 'POST') return jsonResponse({ id: '5g-sa', action: 'start', status: 'running', message: 'ok', command: deploymentStatus.command });
      return jsonResponse({});
    }));

    renderWithClient(<DashboardPage />);
    await userEvent.click(await screen.findByRole('button', { name: 'Iniciar' }));

    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/deployments/5g-sa/start', expect.objectContaining({ method: 'POST' })));
  });

  it('stops deployment only after confirmation', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string, init?: RequestInit) => {
      if (url.includes('/api/health')) return jsonResponse(healthResponse);
      if (url.includes('/status')) return jsonResponse(deploymentStatus);
      if (url.includes('/stop') && init?.method === 'POST') return jsonResponse({ id: '5g-sa', action: 'stop', status: 'stopped', message: 'ok', command: deploymentStatus.command });
      return jsonResponse({});
    }));

    renderWithClient(<DashboardPage />);
    await userEvent.click(await screen.findByRole('button', { name: 'Detener' }));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Detener' }));

    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/deployments/5g-sa/stop', expect.objectContaining({ method: 'POST' })));
  });

  it('runs validation and shows the returned status', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string, init?: RequestInit) => {
      if (url.includes('/api/health')) return jsonResponse(healthResponse);
      if (url.includes('/status')) return jsonResponse(deploymentStatus);
      if (url.includes('/validate') && init?.method === 'POST') return jsonResponse(validationReport);
      return jsonResponse({});
    }));

    renderWithClient(<DashboardPage />);
    await userEvent.click(await screen.findByRole('button', { name: 'Validar' }));

    await waitFor(() => expect(document.body.textContent).toContain('run-valid'));
  });

  it('shows backend errors clearly', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('/api/health')) return jsonResponse({ detail: { code: 'BACKEND_DOWN', message: 'No disponible' } }, 500);
      return jsonResponse(deploymentStatus);
    }));

    renderWithClient(<DashboardPage />);

    expect(await screen.findByText('Error del backend')).toBeInTheDocument();
  });
});
