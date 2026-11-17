import { describe, it, expect, beforeEach } from 'vitest';
import { HouseholdStore, DEFAULT_HOUSEHOLD_PROFILE } from '../../src/domain/household';

describe('Household Profile Store & Persistence', () => {
  beforeEach(() => {
    HouseholdStore.resetToDefault();
  });

  it('retrieves pre-calibrated default household profile when no local storage exists', () => {
    const profile = HouseholdStore.getProfile();
    expect(profile.id).toBe('hh-sharma-delhi');
    expect(profile.name).toBe('Sharma Family Household');
    expect(profile.members.length).toBe(3);
    expect(profile.routine.length).toBeGreaterThanOrEqual(5);
  });

  it('saves and updates profile in local-first storage', () => {
    const profile = HouseholdStore.getProfile();
    profile.name = 'Updated Verma Residence';
    profile.home.primaryRoomVolumeM3 = 60;

    HouseholdStore.saveProfile(profile);

    const reloaded = HouseholdStore.getProfile();
    expect(reloaded.name).toBe('Updated Verma Residence');
    expect(reloaded.home.primaryRoomVolumeM3).toBe(60);
  });

  it('exports and imports valid profile JSON', () => {
    HouseholdStore.resetToDefault();
    const exported = HouseholdStore.exportProfileJSON();
    expect(exported).toContain('Sharma Family Household');

    const imported = HouseholdStore.importProfileJSON(exported);
    expect(imported.name).toBe('Sharma Family Household');
  });
});
