import { HouseholdProfile } from './types';

export const CURRENT_PROFILE_SCHEMA_VERSION = 1;
const STORAGE_KEY = 'vayusensex_household_profile_v1';

/**
 * Pre-calibrated urban household archetype for immediate evaluator exploration.
 * Represents a multi-generational family in Delhi NCR during severe winter smog.
 */
export const DEFAULT_HOUSEHOLD_PROFILE: HouseholdProfile = {
  id: 'hh-sharma-delhi',
  version: CURRENT_PROFILE_SCHEMA_VERSION,
  name: 'Sharma Family Household',
  city: 'Delhi NCR',
  area: 'Anand Vihar Sector 4',
  latitude: 28.6508,
  longitude: 77.3153,
  preferredLanguage: 'English',
  members: [
    {
      id: 'mem-1',
      name: 'Rajesh (Parent)',
      ageGroup: 'ADULT',
      sensitivity: 'STANDARD',
      dailyOutdoorMinutes: 60,
      commuteMode: 'PETROL_CAR',
      notes: 'Daily office commute',
    },
    {
      id: 'mem-2',
      name: 'Ananya (Daughter, 8)',
      ageGroup: 'CHILD',
      sensitivity: 'HIGH',
      dailyOutdoorMinutes: 90,
      commuteMode: 'BUS',
      notes: 'Primary school student; vulnerable to respiratory triggers',
    },
    {
      id: 'mem-3',
      name: 'Om Prakash (Grandfather, 68)',
      ageGroup: 'OLDER_ADULT',
      sensitivity: 'HIGH',
      dailyOutdoorMinutes: 45,
      commuteMode: 'WALKING',
      notes: 'Enjoys early morning garden walks',
    },
  ],
  home: {
    homeType: 'APARTMENT',
    primaryRoomVolumeM3: 48, // ~ 4m x 4m x 3m
    hasPurifier: true,
    purifierCADRM3H: 260,
    filterType: 'HEPA',
    cookingFuel: 'LPG',
    hasKitchenExhaust: true,
    usesIncenseOrCoils: true, // Agarbatti burning in morning
    windowSealingQuality: 'STANDARD',
  },
  routine: [
    {
      id: 'act-sleep',
      label: 'Overnight Sleep in Master Bedroom',
      activityType: 'SLEEP',
      environment: 'INDOOR',
      exertionLevel: 'SLEEP',
      startHour: 22,
      startMinute: 0,
      durationMinutes: 480, // 8 hrs
      flexibility: 'FIXED',
      priority: 'HIGH',
    },
    {
      id: 'act-morning-walk',
      label: 'Grandfather Morning Park Walk',
      activityType: 'EXERCISE_OUTDOOR',
      environment: 'OUTDOOR',
      exertionLevel: 'MODERATE_EXERCISE',
      startHour: 6,
      startMinute: 30,
      durationMinutes: 45,
      flexibility: 'CAN_SUBSTITUTE_INDOORS',
      priority: 'MEDIUM',
    },
    {
      id: 'act-school-commute',
      label: 'Daughter School Bus Commute',
      activityType: 'COMMUTE_TRANSIT',
      environment: 'TRANSIT',
      exertionLevel: 'LIGHT_ACTIVITY',
      startHour: 7,
      startMinute: 30,
      durationMinutes: 30,
      flexibility: 'FIXED',
      priority: 'HIGH',
    },
    {
      id: 'act-office-commute',
      label: 'Work Commute via Car',
      activityType: 'COMMUTE_TRANSIT',
      environment: 'TRANSIT',
      exertionLevel: 'LIGHT_ACTIVITY',
      startHour: 8,
      startMinute: 30,
      durationMinutes: 45,
      flexibility: 'FLEXIBLE_TIME',
      priority: 'MEDIUM',
    },
    {
      id: 'act-school-hours',
      label: 'School Hours & Recess',
      activityType: 'SCHOOL',
      environment: 'INDOOR',
      exertionLevel: 'SEDENTARY',
      startHour: 8,
      startMinute: 0,
      durationMinutes: 360,
      flexibility: 'FIXED',
      priority: 'HIGH',
    },
    {
      id: 'act-evening-errands',
      label: 'Market & Neighborhood Groceries',
      activityType: 'OUTDOOR_ERRAND',
      environment: 'OUTDOOR',
      exertionLevel: 'LIGHT_ACTIVITY',
      startHour: 18,
      startMinute: 0,
      durationMinutes: 40,
      flexibility: 'FLEXIBLE_TIME',
      priority: 'LOW',
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// In-memory fallback for SSR / Node.js test environments
const inMemoryStore = new Map<string, string>();

/**
 * Local-first persistence manager for household configuration.
 */
export class HouseholdStore {
  static getProfile(): HouseholdProfile {
    try {
      let stored: string | null = null;
      if (typeof localStorage !== 'undefined') {
        stored = localStorage.getItem(STORAGE_KEY);
      } else {
        stored = inMemoryStore.get(STORAGE_KEY) || null;
      }

      if (stored) {
        const parsed: HouseholdProfile = JSON.parse(stored);
        if (parsed.version === CURRENT_PROFILE_SCHEMA_VERSION && parsed.id) {
          return parsed;
        }
      }
    } catch {
      // LocalStorage access restricted or invalid JSON
    }
    return JSON.parse(JSON.stringify(DEFAULT_HOUSEHOLD_PROFILE));
  }

  static saveProfile(profile: HouseholdProfile): void {
    try {
      const updated = {
        ...profile,
        updatedAt: new Date().toISOString(),
      };
      const serialized = JSON.stringify(updated);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, serialized);
      } else {
        inMemoryStore.set(STORAGE_KEY, serialized);
      }
    } catch (err) {
      console.warn('Failed to persist household profile', err);
    }
  }

  static resetToDefault(): HouseholdProfile {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        inMemoryStore.delete(STORAGE_KEY);
      }
    } catch {
      // Ignore
    }
    return DEFAULT_HOUSEHOLD_PROFILE;
  }

  static exportProfileJSON(): string {
    return JSON.stringify(this.getProfile(), null, 2);
  }

  static importProfileJSON(jsonString: string): HouseholdProfile {
    const parsed = JSON.parse(jsonString);
    if (!parsed.name || !parsed.home || !Array.isArray(parsed.members)) {
      throw new Error('Invalid household profile JSON schema');
    }
    const validated: HouseholdProfile = {
      ...parsed,
      version: CURRENT_PROFILE_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
    };
    this.saveProfile(validated);
    return validated;
  }
}
