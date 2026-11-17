import { ActivityInterval } from './types';

/**
 * Standard baseline winter daily routine (e.g. Unmitigated morning walk during severe smog).
 */
export const BASELINE_UNMITIGATED_ROUTINE: ActivityInterval[] = [
  {
    id: 'act-1',
    label: 'Sleep in Bedroom (No Purifier)',
    durationMinutes: 480, // 8 hours
    exertionLevel: 'SLEEP',
    environment: 'INDOOR',
    targetPm25UgM3: 140, // typical unsealed room during 280 µg/m³ smog
  },
  {
    id: 'act-2',
    label: 'Morning Jog / Outdoor Exercise (7:00 AM)',
    durationMinutes: 45,
    exertionLevel: 'HEAVY_EXERCISE',
    environment: 'OUTDOOR',
    targetPm25UgM3: 285, // morning inversion peak
  },
  {
    id: 'act-3',
    label: 'Work / School Commute (Two-Wheeler / Walking)',
    durationMinutes: 45,
    exertionLevel: 'MODERATE_EXERCISE',
    environment: 'TRANSIT',
    targetPm25UgM3: 310, // roadside traffic corridor peak
  },
  {
    id: 'act-4',
    label: 'Office / School Hours',
    durationMinutes: 480,
    exertionLevel: 'SEDENTARY',
    environment: 'INDOOR',
    targetPm25UgM3: 85,
  },
  {
    id: 'act-5',
    label: 'Evening Commute Home',
    durationMinutes: 45,
    exertionLevel: 'MODERATE_EXERCISE',
    environment: 'TRANSIT',
    targetPm25UgM3: 260,
  },
  {
    id: 'act-6',
    label: 'Evening Home Time (Incense burning)',
    durationMinutes: 345,
    exertionLevel: 'SEDENTARY',
    environment: 'INDOOR',
    targetPm25UgM3: 160,
  },
];

/**
 * VayuSenseX Optimized winter daily routine:
 * - Purifier active in bedroom (target PM2.5 ~ 25 µg/m³)
 * - Morning jog shifted to midday indoor workout or cleanest outdoor window
 * - Metro commute with N95 mask
 * - No combustion incense indoors
 */
export const OPTIMIZED_VAYUSENSEX_ROUTINE: ActivityInterval[] = [
  {
    id: 'opt-1',
    label: 'Sleep in Bedroom (HEPA Filtered)',
    durationMinutes: 480,
    exertionLevel: 'SLEEP',
    environment: 'INDOOR',
    targetPm25UgM3: 22, // HEPA scrubbed
  },
  {
    id: 'opt-2',
    label: 'Indoor Calisthenics / Yoga (HEPA Room)',
    durationMinutes: 45,
    exertionLevel: 'MODERATE_EXERCISE',
    environment: 'INDOOR',
    targetPm25UgM3: 25,
  },
  {
    id: 'opt-3',
    label: 'Commute via Metro (N95 Masked)',
    durationMinutes: 45,
    exertionLevel: 'LIGHT_ACTIVITY',
    environment: 'TRANSIT',
    targetPm25UgM3: 40, // Metro cabin + mask protection
  },
  {
    id: 'opt-4',
    label: 'Office / School Hours',
    durationMinutes: 480,
    exertionLevel: 'SEDENTARY',
    environment: 'INDOOR',
    targetPm25UgM3: 60,
  },
  {
    id: 'opt-5',
    label: 'Evening Return via Metro',
    durationMinutes: 45,
    exertionLevel: 'LIGHT_ACTIVITY',
    environment: 'TRANSIT',
    targetPm25UgM3: 40,
  },
  {
    id: 'opt-6',
    label: 'Evening Home (Purifier Active + Flameless Aromatics)',
    durationMinutes: 345,
    exertionLevel: 'SEDENTARY',
    environment: 'INDOOR',
    targetPm25UgM3: 25,
  },
];
