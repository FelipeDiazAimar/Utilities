import { describe, it, expect } from 'vitest';
import { MSTSolver } from './MSTSolver';

describe('MSTSolver', () => {
  it('matches the verified example from solver.html (total cost 9, 5 steps)', () => {
    const nodes = ['1', '2', '3', '4', '5'];
    const edges = [
      { from: '1', to: '2', value: 1 },
      { from: '1', to: '4', value: 5 },
      { from: '2', to: '4', value: 5 },
      { from: '2', to: '3', value: 7 },
      { from: '2', to: '5', value: 2 },
      { from: '3', to: '5', value: 2 },
      { from: '4', to: '5', value: 4 },
    ];

    const steps = new MSTSolver(nodes, edges).solve();
    const final = steps[steps.length - 1];

    expect(steps).toHaveLength(5);
    expect(final.totalCost).toBe(9);
    expect(final.edgesInTree).toEqual([
      { from: '1', to: '2', value: 1 },
      { from: '2', to: '5', value: 2 },
      { from: '3', to: '5', value: 2 },
      { from: '4', to: '5', value: 4 },
    ]);
  });

  it('returns an empty step list for an empty node set', () => {
    expect(new MSTSolver([], []).solve()).toEqual([]);
  });
});
