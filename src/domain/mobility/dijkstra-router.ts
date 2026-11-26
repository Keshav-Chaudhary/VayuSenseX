import { TransitEdge, CorridorType } from './types';
import { TransportMode } from '../sustainability/types';
import { TRANSPORT_EMISSION_FACTORS } from '../sustainability/emission-factors';
import {
  normalizeTransportMode,
  CORRIDOR_PM25_MULTIPLIER,
  MODE_CABIN_PENETRATION,
  MODE_BREATHING_RATE_M3_MIN,
} from './corridor-constants';

export { normalizeTransportMode, CORRIDOR_PM25_MULTIPLIER, MODE_CABIN_PENETRATION, MODE_BREATHING_RATE_M3_MIN };

/**
 * Calculates physical inhaled particulate dose (ug) for a trip segment:
 * Inhaled Dose = Concentration (ug/m3) * Cabin Penetration * Breathing Rate (m3/min) * Duration (min)
 */
export function calculateCorridorDose(
  durationMinutes: number,
  ambientRegionalPm25: number,
  corridorType: CorridorType,
  modeInput: TransportMode | string
): number {
  const mode = normalizeTransportMode(modeInput);
  const corridorMultiplier = CORRIDOR_PM25_MULTIPLIER[corridorType] ?? 1.0;
  const corridorConcentration = ambientRegionalPm25 * corridorMultiplier;
  const penetration = MODE_CABIN_PENETRATION[mode] ?? 1.0;
  const breathingRate = MODE_BREATHING_RATE_M3_MIN[mode] ?? 0.0075;

  return Math.round(corridorConcentration * penetration * breathingRate * durationMinutes * 100) / 100;
}

import { URBAN_NODES, URBAN_EDGES, DEFAULT_URBAN_NETWORK } from './urban-network';
export { URBAN_NODES, URBAN_EDGES, DEFAULT_URBAN_NETWORK };

export interface DijkstraRouteResult {
  pathNodeIds: string[];
  totalDistanceKm: number;
  totalDurationMinutes: number;
  totalInhaledDoseUg: number;
  totalCarbonGrams: number;
  mode: TransportMode;
}

/**
 * Graph-based Dijkstra pathfinding to minimize inhaled dose, travel duration, or physical distance.
 * Enforces non-negative edge costs and deterministic tie-breaking for reproducible route selection.
 */
export function findPathDijkstra(
  nodes: { id: string }[],
  edges: TransitEdge[],
  originId: string,
  destinationId: string,
  ambientPm25: number,
  modeInput: TransportMode | string,
  metric: 'EXPOSURE' | 'TIME' | 'DISTANCE'
): DijkstraRouteResult | null {
  const mode = normalizeTransportMode(modeInput);

  // Boundary condition: zero-distance trip when origin equals destination
  if (originId === destinationId) {
    return {
      pathNodeIds: [originId],
      totalDistanceKm: 0,
      totalDurationMinutes: 0,
      totalInhaledDoseUg: 0,
      totalCarbonGrams: 0,
      mode,
    };
  }

  const validEdges = edges.filter(e => e.supportedModes.includes(mode));

  // Build adjacency
  const adj = new Map<string, { to: string; edge: TransitEdge; cost: number; duration: number; dose: number; carbon: number }[]>();
  for (const n of nodes) adj.set(n.id, []);

  for (const edge of validEdges) {
    const duration = mode === 'WALKING' 
      ? edge.baseMinutesWalking 
      : mode === 'CYCLING' 
      ? edge.baseMinutesBicycle 
      : edge.baseMinutesMotorized;

    if (duration <= 0) continue;

    const dose = calculateCorridorDose(duration, ambientPm25, edge.corridorType, mode);
    const factor = TRANSPORT_EMISSION_FACTORS[mode] ?? { lifecycleGramsCO2ePerKm: 150 };
    const carbon = Math.round(edge.distanceKm * factor.lifecycleGramsCO2ePerKm);

    const rawCost = metric === 'EXPOSURE' ? dose : metric === 'TIME' ? duration : edge.distanceKm;
    // Strictly guarantee non-negative edge costs for Dijkstra convergence
    const cost = Math.max(0.001, rawCost);

    adj.get(edge.fromNodeId)?.push({
      to: edge.toNodeId,
      edge,
      cost,
      duration,
      dose,
      carbon,
    });
  }

  // Priority queue / Dijkstra state
  const distances = new Map<string, number>();
  const previous = new Map<string, { from: string; duration: number; dose: number; distance: number; carbon: number }>();
  for (const n of nodes) distances.set(n.id, Infinity);

  distances.set(originId, 0);
  const unvisited = new Set<string>(nodes.map(n => n.id));

  while (unvisited.size > 0) {
    let closestNode: string | null = null;
    let minDistance = Infinity;

    for (const node of unvisited) {
      const d = distances.get(node) ?? Infinity;
      if (d < minDistance) {
        minDistance = d;
        closestNode = node;
      }
    }

    if (!closestNode || minDistance === Infinity) break;
    if (closestNode === destinationId) break;

    unvisited.delete(closestNode);

    const neighbors = adj.get(closestNode) || [];
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.to)) continue;

      const alt = minDistance + neighbor.cost;
      const currentBest = distances.get(neighbor.to) ?? Infinity;

      const isBetter = alt < currentBest - 1e-6;
      const isTied = Math.abs(alt - currentBest) <= 1e-6;

      // Deterministic tie-breaking on equal cost: prefer lower travel duration, then lexicographical node order
      if (isBetter || (isTied && neighbor.duration < (previous.get(neighbor.to)?.duration ?? Infinity))) {
        distances.set(neighbor.to, alt);
        previous.set(neighbor.to, {
          from: closestNode,
          duration: neighbor.duration,
          dose: neighbor.dose,
          distance: neighbor.edge.distanceKm,
          carbon: neighbor.carbon,
        });
      }
    }
  }

  // Backtrack path
  if (!previous.has(destinationId) && originId !== destinationId) {
    return null; // Unreachable
  }

  const pathNodeIds: string[] = [destinationId];
  let curr = destinationId;
  let totalMinutes = 0;
  let totalDose = 0;
  let totalDistance = 0;
  let totalCarbon = 0;

  while (curr !== originId) {
    const step = previous.get(curr);
    if (!step) break;
    totalMinutes += step.duration;
    totalDose += step.dose;
    totalDistance += step.distance;
    totalCarbon += step.carbon;
    curr = step.from;
    pathNodeIds.unshift(curr);
  }

  return {
    pathNodeIds,
    totalDistanceKm: Math.round(totalDistance * 10) / 10,
    totalDurationMinutes: totalMinutes,
    totalInhaledDoseUg: Math.round(totalDose * 100) / 100,
    totalCarbonGrams: totalCarbon,
    mode,
  };
}

export function findLowestExposureRoute(
  nodes: { id: string }[],
  edges: TransitEdge[],
  originId: string,
  destinationId: string,
  ambientPm25: number,
  modeInput: TransportMode | string
): DijkstraRouteResult | null {
  return findPathDijkstra(nodes, edges, originId, destinationId, ambientPm25, modeInput, 'EXPOSURE');
}

export function findFastestRoute(
  nodes: { id: string }[],
  edges: TransitEdge[],
  originId: string,
  destinationId: string,
  ambientPm25: number,
  modeInput: TransportMode | string
): DijkstraRouteResult | null {
  return findPathDijkstra(nodes, edges, originId, destinationId, ambientPm25, modeInput, 'TIME');
}

export function findShortestDistanceRoute(
  nodes: { id: string }[],
  edges: TransitEdge[],
  originId: string,
  destinationId: string,
  ambientPm25: number,
  modeInput: TransportMode | string
): DijkstraRouteResult | null {
  return findPathDijkstra(nodes, edges, originId, destinationId, ambientPm25, modeInput, 'DISTANCE');
}

export function compareRoutes(
  nodes: { id: string }[],
  edges: TransitEdge[],
  originId: string,
  destinationId: string,
  ambientPm25: number
) {
  // Lowest exposure across clean modes (METRO_RAIL or CYCLING along greenways)
  const cleanRoute = findLowestExposureRoute(nodes, edges, originId, destinationId, ambientPm25, 'METRO_RAIL') 
    || findLowestExposureRoute(nodes, edges, originId, destinationId, ambientPm25, 'CYCLING');
  
  // Fastest motorized route (Highway PETROL_CAR)
  const fastestRoute = findFastestRoute(nodes, edges, originId, destinationId, ambientPm25, 'PETROL_CAR');

  if (!cleanRoute || !fastestRoute) return null;

  const doseReductionPercent = fastestRoute.totalInhaledDoseUg > 0
    ? Math.round(((fastestRoute.totalInhaledDoseUg - cleanRoute.totalInhaledDoseUg) / fastestRoute.totalInhaledDoseUg) * 100)
    : 0;

  return {
    cleanRoute,
    fastestRoute,
    doseReductionPercent: Math.max(0, doseReductionPercent),
  };
}

export { evaluateCleanCorridorRoutes } from './corridor-evaluator';
