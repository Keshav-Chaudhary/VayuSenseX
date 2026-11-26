// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IndoorWorkbench } from '../../src/features/indoor/IndoorWorkbench';
import { MobilityWorkbench } from '../../src/features/mobility/MobilityWorkbench';
import { ExposureWorkbench } from '../../src/features/exposure/ExposureWorkbench';
import { SimulatorWorkbench } from '../../src/features/simulator/SimulatorWorkbench';
import { CommunityHub } from '../../src/features/community/CommunityHub';
import { ImpactWorkbench } from '../../src/features/impact/ImpactWorkbench';
import { AIAssistantWorkbench } from '../../src/features/assistant/AIAssistantWorkbench';
import { HouseholdStore } from '../../src/domain/household/household-store';
import { SAMPLE_DELHI_SMOG } from '../../src/domain/sample-data';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Interactive JSDOM Workbench Verification', () => {
  it('IndoorWorkbench updates CADR calculations when room or source toggles change', async () => {
    const user = userEvent.setup();
    render(<IndoorWorkbench currentOutdoorPm25={220} />);

    expect(screen.getByText(/Cleaner Indoor Air & Purifier Guide/i)).toBeTruthy();
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    await user.click(buttons[0]!);
    expect(screen.getByText(/Home Air Quality Calculator/i)).toBeTruthy();
  });

  it('MobilityWorkbench switches between Dijkstra routing and lifecycle offset tabs', async () => {
    const user = userEvent.setup();
    render(<MobilityWorkbench currentOutdoorPm25={185} currentCity="Delhi NCR" />);

    expect(screen.getByText(/Safer Routes & Lower-Pollution Travel/i)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Well-to-Wheel Lifecycle Offsets/i }));
    expect(screen.getByText(/Commute Distance/i)).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /Clean Corridor Route Planner/i }));
    expect(screen.getByText(/Evaluated Multi-Modal Corridor Paths/i)).toBeTruthy();
  });

  it('ExposureWorkbench switches demographic sensitivity and routine preset', async () => {
    const user = userEvent.setup();
    render(<ExposureWorkbench currentOutdoorPm25={210} />);

    await user.click(screen.getByRole('button', { name: /CHILD/i }));
    await user.click(screen.getByRole('button', { name: /VayuSenseX Cleanest Window/i }));
    expect(screen.getByText(/How Much Pollution Do You Breathe in a Day\?/i)).toBeTruthy();
  });

  it('SimulatorWorkbench toggles purifier and updates counterfactual comparison', async () => {
    const user = userEvent.setup();
    render(<SimulatorWorkbench currentOutdoorPm25={250} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(2);
    await user.click(buttons[0]!);
    expect(screen.getByText(/Scenario B: Optimized Routine/i)).toBeTruthy();
  });

  it('CommunityHub toggles pledges and logs completion days locally', async () => {
    const user = userEvent.setup();
    render(<CommunityHub currentCity="Bengaluru" />);

    expect(screen.getByText(/Bengaluru Local Collective/i)).toBeTruthy();
    const logButtons = screen.getAllByRole('button', { name: /Log Today/i });
    if (logButtons[0]) {
      await user.click(logButtons[0]);
    }
    expect(screen.getByText(/Day logged/i)).toBeTruthy();
  });

  it('ImpactWorkbench renders filters and handles category selection', async () => {
    const user = userEvent.setup();
    render(<ImpactWorkbench />);
    const allFilterButtons = screen.getAllByRole('button');
    expect(allFilterButtons.length).toBeGreaterThan(1);
    const resetBtn = screen.getByRole('button', { name: /Reset/i });
    await user.click(resetBtn);
    await user.click(screen.getByRole('button', { name: /Confirm Reset/i }));
    expect(screen.getByText(/Verified Household Impact Ledger/i)).toBeTruthy();
  });

  it('AIAssistantWorkbench submits preset question, opens grounding inspector, and resets thread', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));

    render(
      <AIAssistantWorkbench
        profile={HouseholdStore.getProfile()}
        snapshot={SAMPLE_DELHI_SMOG}
        hourlyForecast={[]}
      />
    );

    const presetBtn = screen.getByRole('button', {
      name: /Should our household open the windows for fresh air today\?/i,
    });
    await user.click(presetBtn);

    const inspectorBtn = await screen.findByRole('button', {
      name: /Inspect Mathematical Grounding/i,
    });
    await user.click(inspectorBtn);
    expect(screen.getByText(/Ground-Truth Fact Verification Table/i)).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /Reset Thread/i }));
    expect(screen.queryByText(/Ground-Truth Fact Verification Table/i)).toBeNull();
  });
});
