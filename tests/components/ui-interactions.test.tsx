// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HouseholdWorkbench } from '../../src/features/household/HouseholdWorkbench';
import { PlannerWorkbench } from '../../src/features/planner/PlannerWorkbench';
import { ImpactWorkbench } from '../../src/features/impact/ImpactWorkbench';
import { IndoorWorkbench } from '../../src/features/indoor/IndoorWorkbench';
import { LandingPage } from '../../src/features/landing/LandingPage';
import { HouseholdStore } from '../../src/domain/household/household-store';
import { ImpactLedgerStore } from '../../src/domain/impact/impact-ledger';
import { SAMPLE_DELHI_SMOG } from '../../src/domain/sample-data';

beforeEach(() => {
  localStorage.clear();
  HouseholdStore.resetToDefault();
  ImpactLedgerStore.clearLedger();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Full Workbench & UI Interaction Coverage', () => {
  it('HouseholdWorkbench adds a member, switches to Home Settings and Routine Schedule, and adds an activity', async () => {
    const user = userEvent.setup();
    const onProfileChange = vi.fn();
    render(<HouseholdWorkbench onProfileChange={onProfileChange} />);

    // Add member
    await user.type(screen.getByPlaceholderText(/e\.g\. Priya Sharma/i), 'Kavya Sharma');
    await user.click(screen.getByRole('button', { name: /Add Member to Roster/i }));
    expect(screen.getByText('Kavya Sharma')).toBeTruthy();
    expect(onProfileChange).toHaveBeenCalled();

    // Switch to Home Settings
    await user.click(screen.getByRole('button', { name: /Home & Filtration/i }));
    expect(screen.getByText(/Dwelling Architecture & Dimensions/i)).toBeTruthy();

    // Switch to Routine Schedule & add activity
    await user.click(screen.getByRole('button', { name: /Daily Routine/i }));
    await user.type(screen.getByPlaceholderText(/e\.g\. Morning Jog in Park/i), 'Evening Walk');
    await user.click(screen.getByRole('button', { name: /Add Activity to Routine/i }));
    expect(screen.getByText('Evening Walk')).toBeTruthy();
  });

  it('PlannerWorkbench filters recommendations, expands Scientific Rationale, and marks Done', async () => {
    const user = userEvent.setup();
    const profile = HouseholdStore.getProfile();
    render(<PlannerWorkbench profile={profile} hourlyForecast={[]} currentOutdoorPm25={260} />);

    const scienceButtons = screen.getAllByRole('button', { name: /Scientific Rationale/i });
    expect(scienceButtons.length).toBeGreaterThan(0);
    await user.click(scienceButtons[0]!);
    expect(screen.getByText(/Atmospheric & Physiological Rationale:/i)).toBeTruthy();

    const doneButtons = screen.getAllByRole('button', { name: /^Done$/i });
    await user.click(doneButtons[0]!);
    expect(screen.getByText(/1 of \d+ Actions Done/i)).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /^Timing$/i }));
    await user.click(screen.getByRole('button', { name: /^All$/i }));
  });

  it('ImpactWorkbench renders seeded ledger entries and transitions SUGGESTED -> PLANNED -> COMPLETED', async () => {
    const user = userEvent.setup();
    ImpactLedgerStore.recordAction({
      actionId: 'act-jog-shift',
      date: '2026-11-26',
      actionTitle: 'Switch morning jog to afternoon',
      category: 'OUTDOOR_TIMING',
      status: 'SUGGESTED',
      avoidedDoseUg: 42.5,
      avoidedCO2eGrams: 0,
      calculationMethod: 'Diurnal PBL shift',
      sourceReference: 'EPA Exposure Handbook',
    });

    render(<ImpactWorkbench />);
    expect(screen.getByText('Switch morning jog to afternoon')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /^Plan$/i }));
    await user.click(screen.getByRole('button', { name: /^Mark Done$/i }));
    expect(screen.getByText(/✓ Logged/i)).toBeTruthy();
  });

  it('IndoorWorkbench toggles 3.0 ACH target, ventilation dropdown, and indoor sources', async () => {
    const user = userEvent.setup();
    render(<IndoorWorkbench currentOutdoorPm25={240} />);

    await user.click(screen.getByRole('button', { name: /3\.0 ACH \(Baseline\)/i }));
    await user.click(screen.getByRole('button', { name: /5\.0 ACH \(Winter Smog Target\)/i }));

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, '3');
    expect(screen.getByText(/Steady-State Indoor PM2\.5/i)).toBeTruthy();
  });

  it('LandingPage renders pillars and triggers dashboard entry callback', async () => {
    const user = userEvent.setup();
    const onEnterDashboard = vi.fn();
    const onStandardChange = vi.fn();
    render(
      <LandingPage
        onEnterDashboard={onEnterDashboard}
        snapshot={SAMPLE_DELHI_SMOG}
        standard="CPCB"
        onStandardChange={onStandardChange}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    await user.click(buttons[0]!);
    expect(onEnterDashboard.mock.calls.length + onStandardChange.mock.calls.length).toBeGreaterThan(0);
  });
});
