/**
 * VayuSenseX Household Intelligence Domain Types
 */

import { ExertionLevel } from '../exposure/types';
import { TransportMode } from '../sustainability/types';

export type AgeGroup = 'ADULT' | 'CHILD' | 'OLDER_ADULT' | 'CUSTOM';

export type EnvironmentalSensitivity = 'STANDARD' | 'MODERATE' | 'HIGH';

export interface FamilyMember {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  sensitivity: EnvironmentalSensitivity;
  dailyOutdoorMinutes: number;
  commuteMode: TransportMode;
  notes?: string;
}

export type HomeType = 'APARTMENT' | 'INDEPENDENT_HOUSE';
export type CookingFuel = 'LPG' | 'INDUCTION' | 'PIPED_GAS' | 'BIOMASS';

export interface HomeConfiguration {
  homeType: HomeType;
  primaryRoomVolumeM3: number; // e.g. Master Bedroom or Living area
  hasPurifier: boolean;
  purifierCADRM3H: number;
  filterType: 'HEPA' | 'MERV13_BOX_FAN' | 'BASIC_CARBON' | 'NONE';
  cookingFuel: CookingFuel;
  hasKitchenExhaust: boolean;
  usesIncenseOrCoils: boolean;
  windowSealingQuality: 'TIGHT_WEATHERSTRIPPED' | 'STANDARD' | 'DRAFTY';
}

export type ActivityType = 
  | 'SLEEP'
  | 'WORK'
  | 'SCHOOL'
  | 'COMMUTE_OUTDOOR'
  | 'COMMUTE_TRANSIT'
  | 'EXERCISE_OUTDOOR'
  | 'EXERCISE_INDOOR'
  | 'HOUSEHOLD_CHORE'
  | 'OUTDOOR_ERRAND';

export type ActivityFlexibility = 
  | 'FIXED'                   // e.g. School bell, fixed office shifts
  | 'FLEXIBLE_TIME'           // e.g. Can shift workout 2 hours earlier/later
  | 'CAN_SUBSTITUTE_INDOORS'; // e.g. Can do yoga indoors instead of jogging outside

export interface HouseholdActivity {
  id: string;
  memberId?: string; // Optional linkage to specific family member
  label: string;
  activityType: ActivityType;
  environment: 'INDOOR' | 'OUTDOOR' | 'TRANSIT';
  exertionLevel: ExertionLevel;
  startHour: number; // 0 to 23
  startMinute: number; // 0 to 59
  durationMinutes: number;
  flexibility: ActivityFlexibility;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface HouseholdProfile {
  id: string;
  version: number;
  name: string;
  city: string;
  area: string;
  latitude: number;
  longitude: number;
  preferredLanguage: 'English' | 'Hindi' | 'Hinglish';
  members: FamilyMember[];
  home: HomeConfiguration;
  routine: HouseholdActivity[];
  createdAt: string;
  updatedAt: string;
}
