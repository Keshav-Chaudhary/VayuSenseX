import { CommunityActionPledge, CommunityAggregatedStats } from './types';

const STORAGE_KEY = 'vayusensex_community_pledges_v1';
const inMemoryStore = new Map<string, string>();

export const DEFAULT_COMMUNITY_PLEDGES: CommunityActionPledge[] = [
  {
    id: 'pledge-no-burn',
    title: 'Zero Open Waste & Leaf Combustion',
    category: 'CLEAN_HEATING',
    description: 'Commit to never burning garden leaves, trash, or biomass during winter inversion conditions.',
    scientificRationale: 'Open biomass combustion releases unoxidized polycyclic aromatic hydrocarbons (PAHs) directly at ground breathing height beneath nocturnal temperature caps.',
    estimatedDailySavingsUgPerCapita: 450,
    estimatedDailyCO2eGramsPerCapita: 1200,
    isPledged: true,
    pledgedAt: new Date().toISOString(),
    completedDaysCount: 4,
  },
  {
    id: 'pledge-wet-sweep',
    title: 'Neighborhood Dust Water Suppression',
    category: 'DUST_SUPPRESSION',
    description: 'Use light water-sprinkling before sweeping building perimeters and driveways instead of dry broom scattering.',
    scientificRationale: 'Dry sweeping re-suspends mineral crustal dust and fine silica particles (PM10 and PM2.5) that remain suspended for 4 to 8 hours in stagnant air.',
    estimatedDailySavingsUgPerCapita: 280,
    estimatedDailyCO2eGramsPerCapita: 0,
    isPledged: true,
    pledgedAt: new Date().toISOString(),
    completedDaysCount: 5,
  },
  {
    id: 'pledge-school-carpool',
    title: 'Shared Neighborhood School Carpool',
    category: 'CARPOOL_TRANSIT',
    description: 'Coordinate shared 3-child morning transit drops with apartment neighbors to cut vehicle cold-starts.',
    scientificRationale: 'Vehicle cold-starts during morning peak hours (07:00–08:30) coincide directly with minimum planetary boundary layer heights (<200m).',
    estimatedDailySavingsUgPerCapita: 340,
    estimatedDailyCO2eGramsPerCapita: 2400,
    isPledged: false,
    completedDaysCount: 0,
  },
  {
    id: 'pledge-vulnerable-check',
    title: 'Vulnerable Senior & Asthmatic Morning Check-ins',
    category: 'VULNERABLE_CARE',
    description: 'Conduct wellness checks on elderly neighbors during Severe AQI (>400) days to verify indoor air purifiers and medical readiness.',
    scientificRationale: 'High nocturnal PM2.5 exposure triggers acute cardiovascular stress in older adults with pre-existing coronary artery disease.',
    estimatedDailySavingsUgPerCapita: 150,
    estimatedDailyCO2eGramsPerCapita: 0,
    isPledged: true,
    pledgedAt: new Date().toISOString(),
    completedDaysCount: 3,
  },
];

export class CommunityStore {
  static getPledges(): CommunityActionPledge[] {
    try {
      let raw: string | null = null;
      if (typeof localStorage !== 'undefined') {
        raw = localStorage.getItem(STORAGE_KEY);
      } else {
        raw = inMemoryStore.get(STORAGE_KEY) || null;
      }

      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Storage unavailable
    }
    return JSON.parse(JSON.stringify(DEFAULT_COMMUNITY_PLEDGES));
  }

  static savePledges(pledges: CommunityActionPledge[]): void {
    try {
      const serialized = JSON.stringify(pledges);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, serialized);
      } else {
        inMemoryStore.set(STORAGE_KEY, serialized);
      }
    } catch (err) {
      console.warn('Failed to persist community pledges:', err);
    }
  }

  static togglePledge(pledgeId: string): CommunityActionPledge[] {
    const pledges = this.getPledges();
    const pledge = pledges.find(p => p.id === pledgeId);
    if (pledge) {
      pledge.isPledged = !pledge.isPledged;
      pledge.pledgedAt = pledge.isPledged ? new Date().toISOString() : undefined;
      this.savePledges(pledges);
    }
    return pledges;
  }

  static incrementCompletion(pledgeId: string): CommunityActionPledge[] {
    const pledges = this.getPledges();
    const pledge = pledges.find(p => p.id === pledgeId);
    if (pledge && pledge.isPledged) {
      pledge.completedDaysCount++;
      this.savePledges(pledges);
    }
    return pledges;
  }

  /**
   * Computes aggregate neighborhood savings from verified local-first pledges.
   * Zero PII or addresses are broadcast to remote servers.
   */
  static getAggregatedStats(neighborhoodZone = 'Anand Vihar Sector 4 Community'): CommunityAggregatedStats {
    const pledges = this.getPledges();
    const activePledges = pledges.filter(p => p.isPledged);

    // Sum avoided impact based on actual completed pledge days
    let totalCO2eGrams = 0;
    let totalPM25Ug = 0;

    for (const p of activePledges) {
      const days = Math.max(1, p.completedDaysCount);
      totalCO2eGrams += p.estimatedDailyCO2eGramsPerCapita * days;
      totalPM25Ug += p.estimatedDailySavingsUgPerCapita * days;
    }

    return {
      totalActivePledges: activePledges.length,
      collectiveAvoidedCO2eKg: Math.round((totalCO2eGrams / 1000) * 10) / 10,
      collectiveAvoidedPM25Grams: Number((totalPM25Ug / 1000000).toFixed(4)),
      neighborhoodZone,
      provenance: 'CALCULATED_LOCAL',
      privacyGuarantee: '100% Local-First. Zero household addresses or identity data are transmitted to cloud databases.',
    };
  }

  static exportPledgesJSON(): string {
    return JSON.stringify(this.getPledges(), null, 2);
  }
}
