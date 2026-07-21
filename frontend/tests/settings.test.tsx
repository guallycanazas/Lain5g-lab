import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsPage } from '../src/pages/SettingsPage';
import { healthResponse, jsonResponse, renderWithClient } from './testUtils';


describe('Frontend preferences', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-text-size');
    document.documentElement.removeAttribute('data-font-style');
    vi.stubGlobal('fetch', vi.fn(() => jsonResponse(healthResponse)));
  });
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-text-size');
    document.documentElement.removeAttribute('data-font-style');
  });

  it('changes language, theme and text size and persists them locally', async () => {
    renderWithClient(<SettingsPage />);
    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));
    await userEvent.click(screen.getByRole('button', { name: 'Spanish' }));
    expect(screen.getByRole('heading', { name: 'Preferencias' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Oscuro' }));
    await userEvent.click(screen.getByRole('button', { name: 'Grande' }));
    await userEvent.click(screen.getByRole('button', { name: 'Técnica' }));

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute('lang', 'es');
      expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
      expect(document.documentElement).toHaveAttribute('data-text-size', 'large');
      expect(document.documentElement).toHaveAttribute('data-font-style', 'technical');
    });
    expect(localStorage.getItem('lain5g.preferences.v1')).toContain('"language":"es"');
    expect(localStorage.getItem('lain5g.preferences.v1')).toContain('"theme":"dark"');
  });
});
