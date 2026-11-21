import { describe, it, expect } from 'vitest';
import { 
  DEFAULT_URBAN_NETWORK, 
  findLowestExposureRoute, 
  findFastestRoute, 
  compareRoutes,
  calculateCorridorDose
} from '../../src/domain/mobility';

describe('Exposure-Aware Mobility Engine & Dijkstra Clean Corridor Router', () => {
  const { nodes, edges } = DEFAULT_URBAN_NETWORK;

  it('loads valid urban archetype transit network with diverse corridors', () => {
    expect(nodes.length).toBeGreaterThanOrEqual(6);
    expect(edges.length).toBeGreaterThanOrEqual(8);

    const highwayEdge = edges.find(e => e.corridorType === 'ARTERIAL_HIGHWAY');
    const greenwayEdge = edges.find(e => e.corridorType === 'CANOPY_GREENWAY');
    const metroEdge = edges.find(e => e.corridorType === 'UNDERGROUND_METRO');

    expect(highwayEdge).toBeDefined();
    expect(greenwayEdge).toBeDefined();
    expect(metroEdge).toBeDefined();
  });

  it('calculates physical particulate dose based on corridor concentration and vehicle cabin penetration', () => {
    const ambientPm25 = 250; // Severe smog day (250 µg/m³)

    // Metro: 15 km, 25 min, cab penetration 0.15 (MERV-14 HVAC), seated vent 7.5 L/min
    const metroDose = calculateCorridorDose(25, ambientPm25, 'UNDERGROUND_METRO', 'METRO');

    // Unshielded Bicycle on Arterial Highway: 15 km, 45 min, cab penetration 1.0, cycling vent 27 L/min
    const bikeHighwayDose = calculateCorridorDose(45, ambientPm25, 'ARTERIAL_HIGHWAY', 'BICYCLE');

    // Commuter dose should be drastically lower in filtered metro than unshielded cycling along highway
    expect(metroDose).toBeLessThan(bikeHighwayDose * 0.1);
  });

  it('finds lowest exposure route using graph pathfinder (Delhi Anand Vihar -> Connaught Place)', () => {
    const route = findLowestExposureRoute(nodes, edges, 'node-anand-vihar', 'node-connaught-place', 220, 'METRO');

    expect(route).not.toBeNull();
    expect(route!.pathNodeIds[0]).toBe('node-anand-vihar');
    expect(route!.pathNodeIds[route!.pathNodeIds.length - 1]).toBe('node-connaught-place');
    expect(route!.totalInhaledDoseUg).toBeGreaterThan(0);
    expect(route!.totalCarbonGrams).toBeGreaterThanOrEqual(0);
  });

  it('demonstrates clean corridor choice reduces inhaled particulate dose compared to fastest highway route', () => {
    const comparison = compareRoutes(nodes, edges, 'node-anand-vihar', 'node-connaught-place', 280);

    expect(comparison).not.toBeNull();
    const { cleanRoute, fastestRoute, doseReductionPercent } = comparison!;

    // Clean route should produce equal or lower inhaled particulate dose
    expect(cleanRoute.totalInhaledDoseUg).toBeLessThanOrEqual(fastestRoute.totalInhaledDoseUg);
    expect(doseReductionPercent).toBeGreaterThanOrEqual(0);
  });

  it('evaluates emission differences across transit modes', () => {
    const metroRoute = findLowestExposureRoute(nodes, edges, 'node-anand-vihar', 'node-connaught-place', 200, 'METRO');
    const carRoute = findLowestExposureRoute(nodes, edges, 'node-anand-vihar', 'node-connaught-place', 200, 'PETROL_CAR');

    expect(metroRoute).not.toBeNull();
    expect(carRoute).not.toBeNull();

    // Metro carbon emissions should be significantly lower than solo petrol car
    expect(metroRoute!.totalCarbonGrams).toBeLessThan(carRoute!.totalCarbonGrams);
  });

  it('gracefully handles unreachable destinations', () => {
    const disconnectedNode = { id: 'node-isolated', name: 'Far Outpost', latitude: 28.9, longitude: 77.9 };
    const testNodes = [...nodes, disconnectedNode];

    const route = findLowestExposureRoute(testNodes, edges, 'node-anand-vihar', 'node-isolated', 150, 'METRO');
    expect(route).toBeNull();
  });
});
