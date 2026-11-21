import { 
  TransitNode, 
  TransitEdge, 
  CorridorType, 
  RoutingPreferences, 
  RouteEvaluation, 
  RouteSegmentDetail 
} from './types';
import { TransportMode } from '../sustainability/types';
import { TRANSPORT_EMISSION_FACTORS } from '../sustainability/emission-factors';

// Normalizer to accept both domain constants and shorthand labels
export function normalizeTransportMode(mode: string): TransportMode {
  if (mode === 'METRO') return 'METRO_RAIL';
  if (mode === 'BICYCLE') return 'CYCLING';
  if (mode === 'TWO_WHEELER_PETROL') return 'MOTORCYCLE';
  return mode as TransportMode;
}

// --- Peer-Reviewed Microclimate Corridor Multipliers ---
// Based on urban street canyon and vegetative barrier dispersion research:
export const CORRIDOR_PM25_MULTIPLIER: Record<CorridorType, number> = {
  ARTERIAL_HIGHWAY: 1.45,      // Trapped heavy diesel emissions in street canyon
  MIXED_COMMERCIAL: 1.20,      // Stop-and-go traffic and idling
  RESIDENTIAL_COLLECTOR: 1.00, // Background regional ambient
  CANOPY_GREENWAY: 0.65,       // Vegetative dry deposition & vehicle exclusion
  UNDERGROUND_METRO: 0.25,     // Tunnel air filtration & sub-surface isolation
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

// Pre-defined Archetype Urban Transit Network
export const URBAN_NODES: Record<string, TransitNode> = {
  'NODE_CBD': {
    id: 'NODE_CBD',
    name: 'Central Business Hub',
    latitude: 28.6328,
    longitude: 77.2197,
    description: 'High-density commercial core with metro terminal',
  },
  'NODE_JUNCTION': {
    id: 'NODE_JUNCTION',
    name: 'Grand Ring Junction',
    latitude: 28.6480,
    longitude: 77.2400,
    description: 'Heavy arterial ring road flyover with highway interchange',
  },
  'NODE_GREENWAY': {
    id: 'NODE_GREENWAY',
    name: 'Riverside Canopy Greenway',
    latitude: 28.6410,
    longitude: 77.2600,
    description: 'Continuous tree-shaded pedestrian & bicycle corridor',
  },
  'NODE_METRO_STATION': {
    id: 'NODE_METRO_STATION',
    name: 'Sub-surface Metro Station',
    latitude: 28.6450,
    longitude: 77.2550,
    description: 'Underground transit platform with air-conditioned cars',
  },
  'NODE_RESIDENTIAL': {
    id: 'NODE_RESIDENTIAL',
    name: 'Greenwood Residential Sector',
    latitude: 28.6650,
    longitude: 77.2850,
    description: 'Low-speed residential neighborhood and school district',
  },
};

export const URBAN_EDGES: TransitEdge[] = [
  // 1. Heavy Highway Arterial Route (Direct but polluted)
  {
    fromNodeId: 'NODE_CBD',
    toNodeId: 'NODE_JUNCTION',
    distanceKm: 4.2,
    corridorType: 'ARTERIAL_HIGHWAY',
    baseMinutesMotorized: 12,
    baseMinutesBicycle: 20,
    baseMinutesWalking: 52,
    supportedModes: ['PETROL_CAR', 'EV_CAR', 'BUS', 'MOTORCYCLE', 'DIESEL_CAR'],
  },
  {
    fromNodeId: 'NODE_JUNCTION',
    toNodeId: 'NODE_RESIDENTIAL',
    distanceKm: 5.5,
    corridorType: 'ARTERIAL_HIGHWAY',
    baseMinutesMotorized: 16,
    baseMinutesBicycle: 26,
    baseMinutesWalking: 68,
    supportedModes: ['PETROL_CAR', 'EV_CAR', 'BUS', 'MOTORCYCLE', 'DIESEL_CAR'],
  },

  // 2. Underground Metro Corridor (Fast, ultra-clean sub-surface)
  {
    fromNodeId: 'NODE_CBD',
    toNodeId: 'NODE_METRO_STATION',
    distanceKm: 5.0,
    corridorType: 'UNDERGROUND_METRO',
    baseMinutesMotorized: 10,
    baseMinutesBicycle: 0,
    baseMinutesWalking: 0,
    supportedModes: ['METRO_RAIL'],
  },
  {
    fromNodeId: 'NODE_METRO_STATION',
    toNodeId: 'NODE_RESIDENTIAL',
    distanceKm: 4.8,
    corridorType: 'UNDERGROUND_METRO',
    baseMinutesMotorized: 9,
    baseMinutesBicycle: 0,
    baseMinutesWalking: 0,
    supportedModes: ['METRO_RAIL'],
  },

  // 3. Canopy Greenway Non-Motorized Corridor (Slightly longer, but 65% cleaner air)
  {
    fromNodeId: 'NODE_CBD',
    toNodeId: 'NODE_GREENWAY',
    distanceKm: 4.6,
    corridorType: 'CANOPY_GREENWAY',
    baseMinutesMotorized: 0,
    baseMinutesBicycle: 16,
    baseMinutesWalking: 48,
    supportedModes: ['CYCLING', 'WALKING'],
  },
  {
    fromNodeId: 'NODE_GREENWAY',
    toNodeId: 'NODE_RESIDENTIAL',
    distanceKm: 5.8,
    corridorType: 'CANOPY_GREENWAY',
    baseMinutesMotorized: 0,
    baseMinutesBicycle: 20,
    baseMinutesWalking: 60,
    supportedModes: ['CYCLING', 'WALKING'],
  },

  // 4. Mixed Commercial Feeders (Cross-connections)
  {
    fromNodeId: 'NODE_JUNCTION',
    toNodeId: 'NODE_GREENWAY',
    distanceKm: 2.1,
    corridorType: 'MIXED_COMMERCIAL',
    baseMinutesMotorized: 7,
    baseMinutesBicycle: 10,
    baseMinutesWalking: 25,
    supportedModes: ['PETROL_CAR', 'EV_CAR', 'BUS', 'MOTORCYCLE', 'CYCLING', 'WALKING'],
  },
];

// Benchmark graph representing Anand Vihar to Connaught Place corridors
export const DEFAULT_URBAN_NETWORK = {
  nodes: [
    { id: 'node-anand-vihar', name: 'Anand Vihar ISBT', latitude: 28.6508, longitude: 77.3153, description: 'Eastern transport hub' },
    { id: 'node-ring-road', name: 'Ring Road Expressway', latitude: 28.6400, longitude: 77.2800, description: 'Heavy diesel transit corridor' },
    { id: 'node-yamuna-greenway', name: 'Yamuna Biodiversity Canopy', latitude: 28.6350, longitude: 77.2600, description: 'Vegetated non-motorized pathway' },
    { id: 'node-metro-blue', name: 'Blue Line Transit Tunnel', latitude: 28.6340, longitude: 77.2500, description: 'Underground filtered rail route' },
    { id: 'node-mandi-house', name: 'Mandi House Cultural Junction', latitude: 28.6250, longitude: 77.2340, description: 'Interchange square' },
    { id: 'node-connaught-place', name: 'Connaught Place Central Hub', latitude: 28.6328, longitude: 77.2197, description: 'City center terminal' },
  ],
  edges: [
    {
      fromNodeId: 'node-anand-vihar',
      toNodeId: 'node-ring-road',
      distanceKm: 4.5,
      corridorType: 'ARTERIAL_HIGHWAY' as CorridorType,
      baseMinutesMotorized: 14,
      baseMinutesBicycle: 22,
      baseMinutesWalking: 55,
      supportedModes: ['PETROL_CAR', 'EV_CAR', 'BUS', 'MOTORCYCLE', 'DIESEL_CAR', 'CYCLING'] as TransportMode[],
    },
    {
      fromNodeId: 'node-ring-road',
      toNodeId: 'node-connaught-place',
      distanceKm: 8.5,
      corridorType: 'ARTERIAL_HIGHWAY' as CorridorType,
      baseMinutesMotorized: 24,
      baseMinutesBicycle: 38,
      baseMinutesWalking: 105,
      supportedModes: ['PETROL_CAR', 'EV_CAR', 'BUS', 'MOTORCYCLE', 'DIESEL_CAR', 'CYCLING'] as TransportMode[],
    },
    {
      fromNodeId: 'node-anand-vihar',
      toNodeId: 'node-yamuna-greenway',
      distanceKm: 4.8,
      corridorType: 'CANOPY_GREENWAY' as CorridorType,
      baseMinutesMotorized: 0,
      baseMinutesBicycle: 16,
      baseMinutesWalking: 48,
      supportedModes: ['CYCLING', 'WALKING'] as TransportMode[],
    },
    {
      fromNodeId: 'node-yamuna-greenway',
      toNodeId: 'node-connaught-place',
      distanceKm: 7.2,
      corridorType: 'CANOPY_GREENWAY' as CorridorType,
      baseMinutesMotorized: 0,
      baseMinutesBicycle: 24,
      baseMinutesWalking: 75,
      supportedModes: ['CYCLING', 'WALKING'] as TransportMode[],
    },
    {
      fromNodeId: 'node-anand-vihar',
      toNodeId: 'node-metro-blue',
      distanceKm: 6.0,
      corridorType: 'UNDERGROUND_METRO' as CorridorType,
      baseMinutesMotorized: 11,
      baseMinutesBicycle: 0,
      baseMinutesWalking: 0,
      supportedModes: ['METRO_RAIL'] as TransportMode[],
    },
    {
      fromNodeId: 'node-metro-blue',
      toNodeId: 'node-connaught-place',
      distanceKm: 6.5,
      corridorType: 'UNDERGROUND_METRO' as CorridorType,
      baseMinutesMotorized: 12,
      baseMinutesBicycle: 0,
      baseMinutesWalking: 0,
      supportedModes: ['METRO_RAIL'] as TransportMode[],
    },
    {
      fromNodeId: 'node-ring-road',
      toNodeId: 'node-mandi-house',
      distanceKm: 5.0,
      corridorType: 'MIXED_COMMERCIAL' as CorridorType,
      baseMinutesMotorized: 15,
      baseMinutesBicycle: 22,
      baseMinutesWalking: 60,
      supportedModes: ['PETROL_CAR', 'EV_CAR', 'BUS', 'MOTORCYCLE', 'CYCLING', 'WALKING'] as TransportMode[],
    },
    {
      fromNodeId: 'node-mandi-house',
      toNodeId: 'node-connaught-place',
      distanceKm: 2.2,
      corridorType: 'CANOPY_GREENWAY' as CorridorType,
      baseMinutesMotorized: 0,
      baseMinutesBicycle: 8,
      baseMinutesWalking: 24,
      supportedModes: ['CYCLING', 'WALKING'] as TransportMode[],
    },
  ],
};

export interface DijkstraRouteResult {
  pathNodeIds: string[];
  totalDistanceKm: number;
  totalDurationMinutes: number;
  totalInhaledDoseUg: number;
  totalCarbonGrams: number;
  mode: TransportMode;
}

/**
 * Graph-based Dijkstra pathfinding to minimize either inhaled dose or duration
 */
export function findPathDijkstra(
  nodes: { id: string }[],
  edges: TransitEdge[],
  originId: string,
  destinationId: string,
  ambientPm25: number,
  modeInput: TransportMode | string,
  metric: 'EXPOSURE' | 'TIME'
): DijkstraRouteResult | null {
  const mode = normalizeTransportMode(modeInput);
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

    const cost = metric === 'EXPOSURE' ? dose : duration;

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
      if (alt < (distances.get(neighbor.to) ?? Infinity)) {
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

  return evaluations.sort((a, b) => {
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
