import {
  TransitEdge,
  RoutingPreferences,
  RouteEvaluation,
  RouteSegmentDetail,
} from './types';
import { TransportMode } from '../sustainability/types';
import { TRANSPORT_EMISSION_FACTORS } from '../sustainability/emission-factors';
import { URBAN_NODES, URBAN_EDGES } from './urban-network';
import {
  normalizeTransportMode,
  CORRIDOR_PM25_MULTIPLIER,
  MODE_CABIN_PENETRATION,
  MODE_BREATHING_RATE_M3_MIN,
} from './corridor-constants';

/**
 * UI Evaluator function for MobilityWorkbench
 */
export function evaluateCleanCorridorRoutes(prefs: RoutingPreferences): RouteEvaluation[] {
  const normPreferred = normalizeTransportMode(prefs.mode);
  const modesToTest: TransportMode[] = Array.from(
    new Set<TransportMode>([normPreferred, 'METRO_RAIL', 'EV_CAR', 'CYCLING', 'PETROL_CAR'])
  );

  const evaluations: RouteEvaluation[] = [];

  for (const mode of modesToTest) {
    const pathEdges = findSimplePathForMode(prefs.originNodeId, prefs.destinationNodeId, mode);
    if (pathEdges.length === 0) continue;

    let totalDistKm = 0;
    let totalMinutes = 0;
    let totalDoseUg = 0;
    const segments: RouteSegmentDetail[] = [];

    const cabinPenetration = MODE_CABIN_PENETRATION[mode];
    const breathingRate = MODE_BREATHING_RATE_M3_MIN[mode];
    const emissionFactor = TRANSPORT_EMISSION_FACTORS[mode] ?? { lifecycleGramsCO2ePerKm: 150 };

    for (const edge of pathEdges) {
      const fromNode = URBAN_NODES[edge.fromNodeId]?.name || edge.fromNodeId;
      const toNode = URBAN_NODES[edge.toNodeId]?.name || edge.toNodeId;

      const duration = mode === 'WALKING'
        ? edge.baseMinutesWalking
        : mode === 'CYCLING'
        ? edge.baseMinutesBicycle
        : edge.baseMinutesMotorized;

      const corridorAmbient = Math.round(prefs.ambientRegionalPm25 * CORRIDOR_PM25_MULTIPLIER[edge.corridorType]);
      const segmentDose = Math.round(corridorAmbient * cabinPenetration * breathingRate * duration * 10) / 10;
      const segmentCarbon = Math.round(edge.distanceKm * emissionFactor.lifecycleGramsCO2ePerKm);

      totalDistKm += edge.distanceKm;
      totalMinutes += duration;
      totalDoseUg += segmentDose;

      segments.push({
        fromNodeName: fromNode,
        toNodeName: toNode,
        corridorType: edge.corridorType,
        distanceKm: edge.distanceKm,
        durationMinutes: duration,
        ambientPm25UgM3: corridorAmbient,
        inhaledDoseUg: segmentDose,
        lifecycleCO2eGrams: segmentCarbon,
      });
    }

    const totalCarbon = Math.round(totalDistKm * emissionFactor.lifecycleGramsCO2ePerKm);

    evaluations.push({
      id: `eval-${mode.toLowerCase()}`,
      title: `${formatModeTitle(mode)} Corridor Journey`,
      mode,
      isLowestExposure: false,
      isFastest: false,
      totalDistanceKm: Math.round(totalDistKm * 10) / 10,
      totalDurationMinutes: totalMinutes,
      totalInhaledDoseUg: Math.round(totalDoseUg * 10) / 10,
      totalLifecycleCO2eGrams: totalCarbon,
      segments,
      doseSavingsPercentVsArterial: 0,
      scientificNotes: getModeScientificNote(mode),
    });
  }

  if (evaluations.length === 0) return [];

  const lowestDoseVal = Math.min(...evaluations.map(e => e.totalInhaledDoseUg));
  const fastestTimeVal = Math.min(...evaluations.map(e => e.totalDurationMinutes));
  const worstDoseVal = Math.max(...evaluations.map(e => e.totalInhaledDoseUg));

  for (const ev of evaluations) {
    if (ev.totalInhaledDoseUg === lowestDoseVal) ev.isLowestExposure = true;
    if (ev.totalDurationMinutes === fastestTimeVal) ev.isFastest = true;
    if (worstDoseVal > 0) {
      ev.doseSavingsPercentVsArterial = Math.round(((worstDoseVal - ev.totalInhaledDoseUg) / worstDoseVal) * 100);
    }
  }

  return evaluations.toSorted((a, b) => {
    if (prefs.optimizationGoal === 'LOWEST_EXPOSURE') {
      return a.totalInhaledDoseUg - b.totalInhaledDoseUg;
    }
    if (prefs.optimizationGoal === 'SHORTEST_TIME') {
      return a.totalDurationMinutes - b.totalDurationMinutes;
    }
    return (a.totalDurationMinutes * 2 + a.totalInhaledDoseUg) - (b.totalDurationMinutes * 2 + b.totalInhaledDoseUg);
  });
}

function findSimplePathForMode(fromId: string, toId: string, mode: TransportMode): TransitEdge[] {
  const validEdges = URBAN_EDGES.filter(e => e.supportedModes.includes(mode));
  const hop1 = validEdges.find(e => e.fromNodeId === fromId);
  if (!hop1) return [];
  if (hop1.toNodeId === toId) return [hop1];

  const hop2 = validEdges.find(e => e.fromNodeId === hop1.toNodeId && e.toNodeId === toId);
  if (hop2) return [hop1, hop2];

  return [];
}

function formatModeTitle(mode: TransportMode): string {
  switch (mode) {
    case 'METRO_RAIL': return 'Rapid Metro Rail';
    case 'EV_CAR': return 'Electric Vehicle (Sealed HEPA)';
    case 'PETROL_CAR': return 'Petrol Car (Solo Commute)';
    case 'BUS': return 'Public Electric Bus';
    case 'CYCLING': return 'Canopy Greenway Cycling';
    case 'WALKING': return 'Pedestrian Greenway Walk';
    default: return mode.replace(/_/g, ' ');
  }
}

function getModeScientificNote(mode: TransportMode): string {
  switch (mode) {
    case 'METRO_RAIL':
      return 'Sub-surface tunnels decouple commuters from surface inversion layers. 85% aerosol attenuation achieved via high-efficiency platform and cabin HVAC filtration.';
    case 'EV_CAR':
      return 'Sealed automotive cabin filters remove up to 65% of particulates; zero tailpipe emissions prevent local ground-level pollution.';
    case 'CYCLING':
      return 'Vigorous ventilation (27 L/min) increases alveolar particulate deposition 4x compared to resting. Canopy greenways reduce exposure by 35% compared to highways.';
    case 'PETROL_CAR':
      return 'High lifecycle footprint (172 g CO2e/km). In-cabin filters provide partial protection, but solo driving worsens regional urban smog.';
    default:
      return 'Corridor exposure balances vehicle cabin filtration against travel time and ambient concentration.';
  }
}
