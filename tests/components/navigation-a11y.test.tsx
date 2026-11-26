// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkspaceNavigation } from '../../src/components/layout/WorkspaceNavigation';
import { GlobalHeader } from '../../src/components/layout/GlobalHeader';
import { MethodologyPage } from '../../src/features/methodology/MethodologyPage';
import { SimulatorWorkbench } from '../../src/features/simulator/SimulatorWorkbench';
import { MobilityWorkbench } from '../../src/features/mobility/MobilityWorkbench';
import { HouseholdWorkbench } from '../../src/features/household/HouseholdWorkbench';
import { HouseholdStore } from '../../src/domain/household/household-store';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Navigation, Methodology, Simulator & Accessibility DOM Verification', () => {
  it('WorkspaceNavigation sets aria-current="page" and aria-pressed accurately', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const onStandardChange = vi.fn();
    render(
      <WorkspaceNavigation
        currentView="planner"
        onNavigate={onNavigate}
        standard="CPCB"
        onStandardChange={onStandardChange}
        isSampleData={true}
        selectedCity="Delhi NCR"
      />
    );

    const activeBtn = screen.getByRole('button', { name: /Daily Plan/i });
    expect(activeBtn.getAttribute('aria-current')).toBe('page');

    const cpcbBtn = screen.getByRole('button', { name: /^CPCB$/i });
    const usepaBtn = screen.getByRole('button', { name: /^US EPA$/i });
    expect(cpcbBtn.getAttribute('aria-pressed')).toBe('true');
    expect(usepaBtn.getAttribute('aria-pressed')).toBe('false');

    await user.click(usepaBtn);
    expect(onStandardChange).toHaveBeenCalledWith('USEPA');
  });

  it('GlobalHeader renders navigation links and switches AQI standards', async () => {
    const user = userEvent.setup();
    const onEnterDashboard = vi.fn();
    const onStandardChange = vi.fn();
    const onNavigateMethodology = vi.fn();

    render(
      <GlobalHeader
        onEnterDashboard={onEnterDashboard}
        standard="USEPA"
        onStandardChange={onStandardChange}
        onNavigateMethodology={onNavigateMethodology}
      />
    );

    await user.click(screen.getByRole('button', { name: /^CPCB$/i }));
    expect(onStandardChange).toHaveBeenCalledWith('CPCB');

    await user.click(screen.getByRole('button', { name: /How It Works/i }));
    expect(onNavigateMethodology).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /Check Your Air|Start/i }));
    expect(onEnterDashboard).toHaveBeenCalled();
  });

  it('MethodologyPage renders transparent science and equation sections', () => {
    render(<MethodologyPage />);
    expect(screen.getAllByRole('heading').length).toBeGreaterThan(0);
  });

  it('SimulatorWorkbench adjusts Baseline vs Optimized exercise timing and commute modes', async () => {
    const user = userEvent.setup();
    render(<SimulatorWorkbench currentOutdoorPm25={260} />);

    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(4);
    await user.selectOptions(selects[0]!, 'INDOOR_FILTERED');
    await user.selectOptions(selects[1]!, 'METRO_RAIL');
    expect(screen.getByText(/Modelled Daily Exposure & Emission Impact/i)).toBeTruthy();
  });

  it('MobilityWorkbench changes commute parameters in lifecycle emissions tab', async () => {
    const user = userEvent.setup();
    render(<MobilityWorkbench currentOutdoorPm25={210} currentCity="Mumbai" />);

    await user.click(screen.getByRole('button', { name: /Well-to-Wheel Lifecycle Offsets/i }));
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0]!, 'DIESEL_CAR');
    await user.selectOptions(selects[1]!, 'CYCLING');
    expect(screen.getByText(/Calculated Emission Savings/i)).toBeTruthy();
  });

  it('HouseholdWorkbench shows accessible inline alert when trying to remove last remaining member', async () => {
    const user = userEvent.setup();
    const single = HouseholdStore.getProfile();
    HouseholdStore.saveProfile({ ...single, members: [single.members[0]!] });

    render(<HouseholdWorkbench />);
    const removeBtn = screen.getByTitle('Remove member');
    await user.click(removeBtn);

    const alertBox = screen.getByRole('alert');
    expect(alertBox.textContent).toContain('at least one member');
    await user.click(screen.getByRole('button', { name: /Dismiss/i }));
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
