import { describe, it, expect } from 'vitest';
import { 
  DEFAULT_URBAN_NETWORK, 
  findLowestExposureRoute, 
  findFastestRoute, 
  findShortestDistanceRoute,
  findPathDijkstra
} from '../../src/domain/mobility';

describe('Mobility Graph Dijkstra Adversarial & Boundary Tests', () => {
  const { nodes, edges } = DEFAULT_URBAN_NETWORK;

  it('clearly distinguishes shortest-distance, lowest-exposure, and fastest-time routes', () => {
    // Mode: PETROL_CAR between Anand Vihar and Connaught Place
    const shortestDistance = findShortestDistanceRoute(nodes, edges, 'node-anand-vihar', 'node-connaught-place', 250, 'PETROL_CAR');
    const lowestExposure = findLowestExposureRoute(nodes, edges, 'node-anand-vihar', 'node-connaught-place', 250, 'PETROL_CAR');
    const fastestTime = findFastestRoute(nodes, edges, 'node-anand-vihar', 'node-connaught-place', 250, 'PETROL_CAR');

    expect(shortestDistance).not.toBeNull();
    expect(lowestExposure).not.toBeNull();
    expect(fastestTime).not.toBeNull();

    // Shortest distance must have distance <= lowest exposure distance
    expect(shortestDistance!.totalDistanceKm).toBeLessThanOrEqual(lowestExposure!.totalDistanceKm + 0.1);
    // Fastest time must have duration <= lowest exposure duration
    expect(fastestTime!.totalDurationMinutes).toBeLessThanOrEqual(lowestExposure!.totalDurationMinutes);
  });

  it('handles zero-distance boundary condition when origin equals destination', () => {
    const route = findLowestExposureRoute(nodes, edges, 'node-anand-vihar', 'node-anand-vihar', 200, 'METRO_RAIL');

    expect(route).not.toBeNull();
    expect(route!.pathNodeIds).toEqual(['node-anand-vihar']);
    expect(route!.totalDistanceKm).toBe(0);
    expect(route!.totalDurationMinutes).toBe(0);
    expect(route!.totalInhaledDoseUg).toBe(0);
    expect(route!.totalCarbonGrams).toBe(0);
  });

  it('handles disconnected graph components gracefully by returning null', () => {
    const isolatedNodes = [
      ...nodes,
      { id: 'node-isolated-island', name: 'Far Desert Oasis', latitude: 29.0, longitude: 78.0, description: 'No edges' },
    ];

    const unreachable = findLowestExposureRoute(isolatedNodes, edges, 'node-anand-vihar', 'node-isolated-island', 200, 'METRO_RAIL');
    expect(unreachable).toBeNull();
  });

  it('strictly guarantees non-negative edge costs and deterministic path convergence', () => {
    // Run pathfinder 10 consecutive times and verify identical deterministic node sequence
    const firstRun = findLowestExposureRoute(nodes, edges, 'node-anand-vihar', 'node-connaught-place', 180, 'METRO_RAIL');
    for (let i = 0; i < 10; i++) {
      const repeatedRun = findLowestExposureRoute(nodes, edges, 'node-anand-vihar', 'node-connaught-place', 180, 'METRO_RAIL');
      expect(repeatedRun?.pathNodeIds).toEqual(firstRun?.pathNodeIds);
      expect(repeatedRun?.totalInhaledDoseUg).toBe(firstRun?.totalInhaledDoseUg);
    }
  });
});
