import { TransportEmissionFactor, TransportMode } from './types';

/**
 * Transport emission factors in grams CO₂e per passenger-kilometer (g CO₂e/p·km).
 * Sourced from India GHG Program, CEEW (Council on Energy, Environment and Water),
 * and CEA Grid Emission Database (Version 19, 2024).
 */
export const TRANSPORT_EMISSION_FACTORS: Record<TransportMode, TransportEmissionFactor> = {
  PETROL_CAR: {
    mode: 'PETROL_CAR',
    label: 'Single-Occupancy Petrol Car (ICE)',
    tailpipeGramsCO2ePerKm: 142,
    lifecycleGramsCO2ePerKm: 172,
    assumedOccupancy: 1.2,
    source: 'India GHG Program & ARAI Emission Baseline',
    notes: 'Based on average compact sedan in urban stop-and-go driving.',
  },
  DIESEL_CAR: {
    mode: 'DIESEL_CAR',
    label: 'Single-Occupancy Diesel Car (ICE)',
    tailpipeGramsCO2ePerKm: 155,
    lifecycleGramsCO2ePerKm: 188,
    assumedOccupancy: 1.2,
    source: 'ARAI / CEEW Transport Matrix',
    notes: 'Higher NOx and particulate emissions along with CO2.',
  },
  EV_CAR: {
    mode: 'EV_CAR',
    label: 'Electric Car (Grid Charged)',
    tailpipeGramsCO2ePerKm: 0,
    lifecycleGramsCO2ePerKm: 68,
    assumedOccupancy: 1.3,
    source: 'CEA Indian Grid Baseline (~0.71 kg CO2e/kWh, 15 kWh/100km)',
    notes: 'Zero tailpipe emissions; lifecycle emissions reflect current national grid mix.',
  },
  MOTORCYCLE: {
    mode: 'MOTORCYCLE',
    label: 'Two-Wheeler (Motorcycle / Scooter)',
    tailpipeGramsCO2ePerKm: 58,
    lifecycleGramsCO2ePerKm: 70,
    assumedOccupancy: 1.1,
    source: 'India GHG Program',
    notes: 'High exposure risk during winter smog despite lower emissions than cars.',
  },
  BUS: {
    mode: 'BUS',
    label: 'City Public Transit Bus (CNG/Diesel)',
    tailpipeGramsCO2ePerKm: 38,
    lifecycleGramsCO2ePerKm: 48,
    assumedOccupancy: 35,
    source: 'DTC / BMTC Fleet Emission Averages',
    notes: 'Per-passenger share based on typical peak urban occupancy.',
  },
  METRO_RAIL: {
    mode: 'METRO_RAIL',
    label: 'Electric Rapid Metro Transit',
    tailpipeGramsCO2ePerKm: 0,
    lifecycleGramsCO2ePerKm: 22,
    assumedOccupancy: 200,
    source: 'Delhi Metro Rail Corporation (DMRC) Sustainability Report',
    notes: 'Cleanest transit corridor with zero street-level particulate contribution.',
  },
  CARPOOL: {
    mode: 'CARPOOL',
    label: 'Carpooling (3+ Passengers)',
    tailpipeGramsCO2ePerKm: 48,
    lifecycleGramsCO2ePerKm: 58,
    assumedOccupancy: 3.0,
    source: 'Derived by dividing single-car emissions among 3 occupants',
    notes: 'Divides passenger emissions, preventing double counting.',
  },
  CYCLING: {
    mode: 'CYCLING',
    label: 'Bicycle / Non-Motorized Transit',
    tailpipeGramsCO2ePerKm: 0,
    lifecycleGramsCO2ePerKm: 5,
    assumedOccupancy: 1.0,
    source: 'ECF Life Cycle Analysis',
    notes: 'Boundary note: Zero tailpipe; lifecycle covers bicycle manufacturing allocation.',
  },
  WALKING: {
    mode: 'WALKING',
    label: 'Active Pedestrian Walking',
    tailpipeGramsCO2ePerKm: 0,
    lifecycleGramsCO2ePerKm: 0,
    assumedOccupancy: 1.0,
    source: 'Standard GHG Protocol Scope 1/2 boundary',
    notes: 'Zero direct greenhouse gas emissions.',
  },
};

/**
 * Grid electricity emission intensity factor (kg CO₂e per kWh).
 * Central Electricity Authority of India (CEA) CO2 Baseline Database v19 (2024).
 */
export const ELECTRICITY_GRID_FACTOR_KG_PER_KWH = 0.716;

/**
 * Liquefied Petroleum Gas (LPG) emission factor (kg CO₂e per kg of LPG fuel).
 * IPCC Guidelines for National Greenhouse Gas Inventories.
 */
export const LPG_EMISSION_FACTOR_KG_PER_KG = 2.98;
