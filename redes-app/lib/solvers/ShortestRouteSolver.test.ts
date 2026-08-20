import { describe, it, expect } from 'vitest';
import { ShortestRouteSolver } from './ShortestRouteSolver';

const nodes = ['1', '2', '3', '4', '5'];
const edges = [
  { from: '1', to: '2', value: 100 },
  { from: '1', to: '3', value: 30 },
  { from: '2', to: '3', value: 20 },
  { from: '3', to: '4', value: 10 },
  { from: '4', to: '2', value: 15 },
  { from: '3', to: '5', value: 60 },
  { from: '4', to: '5', value: 50 },
];

describe('ShortestRouteSolver', () => {
  it("minimizes: matches the professor's worked example (1→3→4→2 = 55)", () => {
    const steps = new ShortestRouteSolver(nodes, edges, '1', '2', 'min').solve();
    const final = steps[steps.length - 1];
    expect(final.labels['2'].dist).toBe(55);
    expect(final.labels['3'].dist).toBe(30);
    expect(final.labels['4'].dist).toBe(40);
    expect(final.labels['5'].dist).toBe(90);
    expect(final.highlightPath).toEqual(['1', '3', '4', '2']);
  });

  it('maximizes: finds the longest acyclic route to node 5', () => {
    const steps = new ShortestRouteSolver(nodes, edges, '1', '5', 'max').solve();
    const final = steps[steps.length - 1];
    expect(final.labels['5'].dist).toBe(180);
  });

  it('maximizes probability: picks the highest-product path', () => {
    const probNodes = ['1', '2', '3', '4'];
    const probEdges = [
      { from: '1', to: '2', value: 0.9 },
      { from: '1', to: '3', value: 0.8 },
      { from: '2', to: '4', value: 0.7 },
      { from: '3', to: '4', value: 0.95 },
    ];
    const steps = new ShortestRouteSolver(probNodes, probEdges, '1', '4', 'prob').solve();
    const final = steps[steps.length - 1];
    expect(final.labels['4'].dist).toBeCloseTo(0.76, 6);
    expect(final.highlightPath).toEqual(['1', '3', '4']);
  });

  it('matches the "Cargar Ejemplo Ruta Más Corta (Probabilidad)" example (best path 1-2-5 = 0.765)', () => {
    const probEdges = [
      { from: '1', to: '2', value: 0.9 },
      { from: '1', to: '3', value: 0.8 },
      { from: '2', to: '4', value: 0.7 },
      { from: '2', to: '5', value: 0.85 },
      { from: '3', to: '4', value: 0.95 },
      { from: '3', to: '5', value: 0.6 },
      { from: '4', to: '5', value: 0.9 },
    ];
    const steps = new ShortestRouteSolver(nodes, probEdges, '1', '5', 'prob').solve();
    const final = steps[steps.length - 1];
    expect(final.labels['5'].dist).toBeCloseTo(0.765, 6);
    expect(final.highlightPath).toEqual(['1', '2', '5']);
  });
});
