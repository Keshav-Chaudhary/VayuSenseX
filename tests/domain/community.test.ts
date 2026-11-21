import { describe, it, expect, beforeEach } from 'vitest';
import { CommunityStore, DEFAULT_COMMUNITY_PLEDGES } from '../../src/domain/community';

describe('Privacy-Preserving Community Resilience Hub', () => {
  beforeEach(() => {
    CommunityStore.savePledges(DEFAULT_COMMUNITY_PLEDGES);
  });

  it('loads evidence-grounded default community pledges', () => {
    const pledges = CommunityStore.getPledges();
    expect(pledges.length).toBe(4);

    const wasteBurning = pledges.find(p => p.id === 'pledge-no-burn');
    const dustSuppression = pledges.find(p => p.id === 'pledge-wet-sweep');
    const carpool = pledges.find(p => p.id === 'pledge-school-carpool');
    const seniorCheckin = pledges.find(p => p.id === 'pledge-vulnerable-check');

    expect(wasteBurning).toBeDefined();
    expect(dustSuppression).toBeDefined();
    expect(carpool).toBeDefined();
    expect(seniorCheckin).toBeDefined();
  });

  it('allows household to toggle community pledge status', () => {
    const initialPledge = CommunityStore.getPledges().find(p => p.id === 'pledge-school-carpool')!;
    expect(initialPledge.isPledged).toBe(false);

    // Join pledge
    const updated = CommunityStore.togglePledge(initialPledge.id);
    const joined = updated.find(p => p.id === initialPledge.id);
    expect(joined?.isPledged).toBe(true);
    expect(joined?.pledgedAt).toBeDefined();

    // Leave pledge
    const updatedAgain = CommunityStore.togglePledge(initialPledge.id);
    const left = updatedAgain.find(p => p.id === initialPledge.id);
    expect(left?.isPledged).toBe(false);
  });

  it('logs daily completion of pledged actions and increments days', () => {
    const pledgeId = 'pledge-no-burn';
    const pledgeBefore = CommunityStore.getPledges().find(p => p.id === pledgeId)!;
    const daysBefore = pledgeBefore.completedDaysCount;

    CommunityStore.incrementCompletion(pledgeId);

    const pledgeAfter = CommunityStore.getPledges().find(p => p.id === pledgeId)!;
    expect(pledgeAfter.completedDaysCount).toBe(daysBefore + 1);
  });

  it('guarantees privacy by computing anonymous aggregated community statistics', () => {
    const stats = CommunityStore.getAggregatedStats('Anand Vihar Sector 4 Community');
    expect(stats.totalActivePledges).toBeGreaterThan(0);
    expect(stats.collectiveAvoidedCO2eKg).toBeGreaterThan(0);
    expect(stats.collectiveAvoidedPM25Grams).toBeGreaterThan(0);
    expect(stats.privacyGuarantee).toContain('Zero household addresses or identity data');

    // Verify stats object contains strictly numeric aggregates with zero PII
    const keys = Object.keys(stats);
    expect(keys).not.toContain('name');
    expect(keys).not.toContain('email');
    expect(keys).not.toContain('address');
    expect(keys).not.toContain('ip');
  });

  it('exports valid JSON format without leaking client secrets', () => {
    const json = CommunityStore.exportPledgesJSON();
    expect(json).toContain('scientificRationale');
    expect(json).not.toContain('password');
    expect(json).not.toContain('apiKey');
  });
});
