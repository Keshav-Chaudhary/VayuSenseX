// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardPage } from '../../src/features/dashboard/DashboardPage';
import { SAMPLE_DELHI_SMOG } from '../../src/domain/sample-data';
import { HourlyForecastPoint } from '../../src/services/environment/types';

afterEach(() => {
  cleanup();
});

const mockForecast: HourlyForecastPoint[] = [
  {
    timestamp: '2026-11-21T07:00:00Z',
    hourLabel: '07:00',
    pm25: 245,
    pm10: 360,
    no2: 68,
    o3: 24,
    co: 2.1,
    temperature: 14,
    relativeHumidity: 76,
    windSpeed: 3.1,
    boundaryLayerHeight: 160,
    cpcbAqi: 396,
    usepaAqi: 295,
    isCleanestWindow: false,
  },
  {
    timestamp: '2026-11-21T14:00:00Z',
    hourLabel: '14:00',
    pm25: 92,
    pm10: 140,
    no2: 34,
    o3: 55,
    co: 1.0,
    temperature: 23,
    relativeHumidity: 42,
    windSpeed: 9.4,
    boundaryLayerHeight: 920,
    cpcbAqi: 206,
    usepaAqi: 170,
    isCleanestWindow: true,
  },
];

describe('DashboardPage Interactive DOM & Accessibility Verification', () => {
  it('triggers city preset and AQI standard callbacks on user click', async () => {
    const user = userEvent.setup();
    const onStandardChange = vi.fn();
    const onSelectCity = vi.fn();
    const onSearchLocation = vi.fn();
    const onRefresh = vi.fn();

    render(
      <DashboardPage
        snapshot={SAMPLE_DELHI_SMOG}
        standard="CPCB"
        onStandardChange={onStandardChange}
        onSelectCity={onSelectCity}
        activeCityKey="delhi"
        onSearchLocation={onSearchLocation}
        onRefresh={onRefresh}
        isLoading={false}
        provenance="LIVE"
        isCached={false}
        isStale={false}
        hourlyForecast={mockForecast}
      />
    );

    await user.click(screen.getByRole('button', { name: /Bengaluru \(Baseline\)/i }));
    expect(onSelectCity).toHaveBeenCalledWith('bengaluru');

    await user.click(screen.getByRole('button', { name: /US EPA/i }));
    expect(onStandardChange).toHaveBeenCalledWith('USEPA');

    await user.click(screen.getByRole('button', { name: /Refresh/i }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('renders live aria-live alert banner and .sr-only 24-hour forecast twin', () => {
    const { container } = render(
      <DashboardPage
        snapshot={SAMPLE_DELHI_SMOG}
        standard="CPCB"
        onStandardChange={vi.fn()}
        onSelectCity={vi.fn()}
        activeCityKey="delhi"
        onSearchLocation={vi.fn()}
        onRefresh={vi.fn()}
        isLoading={false}
        provenance="LIVE"
        isCached={false}
        isStale={false}
        hourlyForecast={mockForecast}
      />
    );

    const alertRegion = screen.getByRole('alert');
    expect(alertRegion.getAttribute('aria-live')).toBe('polite');
    expect(alertRegion.textContent).toContain('Dispersal Condition');

    const srSummary = container.querySelector('.sr-only');
    expect(srSummary).not.toBeNull();
    expect(srSummary?.textContent).toContain('14:00: PM2.5 92 µg/m³');
    expect(srSummary?.textContent).toContain('(Cleanest Activity Window)');
  });
});
