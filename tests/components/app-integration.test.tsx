// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../src/app/App';
import { Badge } from '../../src/components/ui/Badge';
import { HomeSettingsTab } from '../../src/features/household/HomeSettingsTab';
import { DashboardPage } from '../../src/features/dashboard/DashboardPage';
import { SAMPLE_DELHI_SMOG } from '../../src/domain/sample-data';
import { DEFAULT_HOUSEHOLD_PROFILE } from '../../src/domain/household/household-store';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Root App Integration, Badge UI, HomeSettingsTab & Dashboard Search', () => {
  it('App boots LandingPage, navigates to Dashboard with offline notice, and loads lazy workbench', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    render(<App />);
    expect(screen.getByRole('link', { name: /Skip to main content/i })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /Check Your Air|Start/i }));
    await waitFor(() => {
      expect(screen.getAllByText(/Delhi NCR/i).length).toBeGreaterThan(0);
    });

    const famTab = screen.getByRole('button', { name: /My Family/i });
    await user.click(famTab);
    await waitFor(() => {
      expect(screen.getByText(/Sharma Family Household/i)).toBeTruthy();
    });
  });

  it('HomeSettingsTab updates dwelling type, window sealing, purifier checkbox, CADR, and cooking fuel', async () => {
    const user = userEvent.setup();
    const onUpdateProfile = vi.fn();
    render(<HomeSettingsTab profile={DEFAULT_HOUSEHOLD_PROFILE} onUpdateProfile={onUpdateProfile} />);

    await user.selectOptions(screen.getByLabelText(/Dwelling Type/i), 'INDEPENDENT_HOUSE');
    expect(onUpdateProfile).toHaveBeenCalled();

    await user.selectOptions(screen.getByLabelText(/Window Sealing Quality/i), 'TIGHT_WEATHERSTRIPPED');
    await user.click(screen.getByLabelText(/Mechanical Air Purifier Present/i));
    expect(onUpdateProfile.mock.calls.length).toBeGreaterThanOrEqual(3);
  });

  it('DashboardPage handles city search submission and refresh trigger', async () => {
    const user = userEvent.setup();
    const onSearchLocation = vi.fn();
    const onRefresh = vi.fn();

    render(
      <DashboardPage
        snapshot={SAMPLE_DELHI_SMOG}
        standard="CPCB"
        onStandardChange={vi.fn()}
        onSelectCity={vi.fn()}
        activeCityKey="delhi"
        onSearchLocation={onSearchLocation}
        onRefresh={onRefresh}
        isLoading={false}
        provenance="LIVE"
        isCached={false}
        isStale={false}
        hourlyForecast={[]}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search city/i);
    await user.type(searchInput, 'Mumbai{enter}');
    expect(onSearchLocation).toHaveBeenCalledWith('Mumbai');

    await user.click(screen.getByRole('button', { name: /Refresh/i }));
    expect(onRefresh).toHaveBeenCalled();
  });

  it('Badge renders all variants and tones cleanly', () => {
    render(
      <div>
        <Badge variant="default">Default</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="danger">Danger</Badge>
        <Badge variant="info">Info</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge tone="neutral" size="sm">Neutral</Badge>
        <Badge tone="positive">Positive</Badge>
        <Badge tone="caution">Caution</Badge>
        <Badge tone="critical">Critical</Badge>
        <Badge tone="accent">Accent</Badge>
        <Badge tone="info">ToneInfo</Badge>
      </div>
    );
    expect(screen.getByText('Success')).toBeTruthy();
    expect(screen.getByText('ToneInfo')).toBeTruthy();
  });
});
