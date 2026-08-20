import { describe, it, expect } from 'vitest';
import { MaxFlowSolver } from './MaxFlowSolver';

describe('MaxFlowSolver', () => {
  it('matches the verified example from solver.html (total flow 60, 6 steps)', () => {
    const nodes = ['1', '2', '3', '4', '5'];
    const edgesCurrent = [
      { from: '1', to: '2', valueProp: 20, valueRev: 0 },
      { from: '1', to: '3', valueProp: 30, valueRev: 0 },
      { from: '1', to: '4', valueProp: 10, valueRev: 0 },
      { from: '2', to: '3', valueProp: 40, valueRev: 0 },
      { from: '2', to: '5', valueProp: 30, valueRev: 0 },
      { from: '3', to: '4', valueProp: 10, valueRev: 5 },
      { from: '3', to: '5', valueProp: 20, valueRev: 0 },
      { from: '4', to: '5', valueProp: 20, valueRev: 0 },
    ];

    const directedEdges: { from: string; to: string; value: number }[] = [];
    edgesCurrent.forEach((e) => {
      if (e.valueProp > 0) directedEdges.push({ from: e.from, to: e.to, value: e.valueProp });
      if (e.valueRev > 0) directedEdges.push({ from: e.to, to: e.from, value: e.valueRev });
    });

    const steps = new MaxFlowSolver(nodes, directedEdges, '1', '5').solve();
    const final = steps[steps.length - 1];

    expect(steps).toHaveLength(6);
    expect(final.totalFlow).toBe(60);
  });

  it('returns an empty step list when source equals sink', () => {
    expect(new MaxFlowSolver(['1'], [], '1', '1').solve()).toEqual([]);
  });
});
