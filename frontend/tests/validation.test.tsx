import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ValidationPage } from '../src/pages/ValidationPage';
import { jsonResponse, renderWithClient, validationReport } from './testUtils';

describe('ValidationPage', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('shows PASS, FAIL, WARNING and NOT_TESTED states', async () => {
    vi.stubGlobal('fetch', vi.fn(() => jsonResponse(validationReport)));

    renderWithClient(<ValidationPage />);

    expect(await screen.findByText('MongoDB disponible')).toBeInTheDocument();
    expect(screen.getAllByText('PASS').length).toBeGreaterThan(0);
    expect(screen.getByText('FAIL')).toBeInTheDocument();
    expect(screen.getByText('WARNING')).toBeInTheDocument();
    expect(screen.getAllByText('NOT TESTED').length).toBeGreaterThan(0);
  });

  it('executes a new validation without converting errors to success', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string, init?: RequestInit) => {
      if (init?.method === 'POST') return jsonResponse({ detail: { code: 'DEPLOYMENT_VALIDATE_FAILED', message: 'Validation failed' } }, 500);
      return jsonResponse(validationReport);
    }));

    renderWithClient(<ValidationPage />);
    await userEvent.click(await screen.findByRole('button', { name: 'Ejecutar validación' }));

    expect(await screen.findByText('Error del backend')).toBeInTheDocument();
  });
});
