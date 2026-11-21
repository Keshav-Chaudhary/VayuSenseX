/**
 * Exposure-Aware Urban Mobility & Transit Routing Types
 */

import { TransportMode } from '../sustainability/types';

export type CorridorType = 
  | 'ARTERIAL_HIGHWAY'      // High heavy-duty diesel traffic canyon
  | 'MIXED_COMMERCIAL'     // Dense stop-and-go traffic with commercial fronts
  | 'RESIDENTIAL_COLLECTOR' // Low-speed residential feeder road
  | 'CANOPY_GREENWAY'      // Tree-covered buffer park / non-motorized lane
  | 'UNDERGROUND_METRO';   // Sub-surface rail corridor with tunnel air filtration

export interface TransitNode {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
}

export interface TransitEdge {
  fromNodeId: string;
  toNodeId: string;
  distanceKm: number;
  corridorType: CorridorType;
  baseMinutesMotorized: number;
  baseMinutesBicycle: number;
  baseMinutesWalking: number;
  supportedModes: TransportMode[];
}

export interface RoutingPreferences {
  originNodeId: string;
  destinationNodeId: string;
  mode: TransportMode;
  optimizationGoal: 'LOWEST_EXPOSURE' | 'SHORTEST_TIME' | 'BALANCED';
  ambientRegionalPm25: number;
}

export interface RouteSegmentDetail {
  fromNodeName: string;
  toNodeName: string;
  corridorType: CorridorType;
  distanceKm: number;
  durationMinutes: number;
  ambientPm25UgM3: number;
  inhaledDoseUg: number;
  lifecycleCO2eGrams: number;
}

export interface RouteEvaluation {
  id: string;
  title: string;
  mode: TransportMode;
  isLowestExposure: boolean;
  isFastest: boolean;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  totalInhaledDoseUg: number; // Inhaled PM2.5 particulate mass (micrograms)
  totalLifecycleCO2eGrams: number; // Life-cycle Well-to-Wheel greenhouse gases
  segments: RouteSegmentDetail[];
  doseSavingsPercentVsArterial: number;
  scientificNotes: string;
}
