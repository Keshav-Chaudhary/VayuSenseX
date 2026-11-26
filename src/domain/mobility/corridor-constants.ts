import { CorridorType } from './types';
import { TransportMode } from '../sustainability/types';

// Normalizer to accept both domain constants and shorthand labels
export function normalizeTransportMode(mode: string): TransportMode {
  if (mode === 'METRO') return 'METRO_RAIL';
  if (mode === 'BICYCLE') return 'CYCLING';
  if (mode === 'TWO_WHEELER_PETROL') return 'MOTORCYCLE';
  return mode as TransportMode;
}

// --- Empirical Microclimate Scenario Modeling Assumptions ---
// Parametric multipliers calibrated against urban street canyon dispersion (Kumar et al., 2015)
// and vegetative buffer deposition studies (Gallagher et al., 2015).
// NOTE: These represent relative microclimate spatial scenario assumptions for urban corridor evaluation,
// not invariant universal constants. Actual field microclimate levels depend on meteorological wind vectors.
export const CORRIDOR_PM25_MULTIPLIER: Record<CorridorType, number> = {
  ARTERIAL_HIGHWAY: 1.45,      // Trapped heavy diesel emissions in street canyon scenario
  MIXED_COMMERCIAL: 1.20,      // Stop-and-go traffic and localized idling scenario
  RESIDENTIAL_COLLECTOR: 1.00, // Background regional ambient baseline
  CANOPY_GREENWAY: 0.65,       // Vegetative dry deposition & vehicle buffer scenario
  UNDERGROUND_METRO: 0.25,     // Tunnel mechanical filtration & sub-surface isolation scenario
};

// In-cabin / respiratory penetration factors by mode:
export const MODE_CABIN_PENETRATION: Record<TransportMode, number> = {
  METRO_RAIL: 0.15,            // 85% mechanical HVAC aerosol attenuation (MERV-14+)
  EV_CAR: 0.35,                // 65% attenuation with sealed HEPA automotive cabin
  PETROL_CAR: 0.45,            // Automotive cabin recirc filter
  DIESEL_CAR: 0.45,
  CARPOOL: 0.45,
  BUS: 0.65,                   // 35% attenuation due to frequent stop door cycling
  MOTORCYCLE: 0.95,            // Open road exposure with mild helmet deflection
  CYCLING: 1.00,               // 0% attenuation (unshielded outdoor commuter)
  WALKING: 1.00,               // 0% attenuation (unshielded outdoor pedestrian)
};

// Respiration rates (m3/min) based on US EPA Exposure Factors Handbook:
export const MODE_BREATHING_RATE_M3_MIN: Record<TransportMode, number> = {
  METRO_RAIL: 0.0075,          // Seated resting
  EV_CAR: 0.0075,
  PETROL_CAR: 0.0075,
  DIESEL_CAR: 0.0075,
  CARPOOL: 0.0075,
  BUS: 0.0075,
  MOTORCYCLE: 0.010,
  WALKING: 0.013,              // Light-to-moderate walking
  CYCLING: 0.027,              // Moderate-to-vigorous athletic exertion (4x resting)
};
