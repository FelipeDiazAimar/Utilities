import { describe, it, expect } from 'vitest';
import { getArrowsForEdge, getNodeColorConfig, getEdgeColorConfig } from './graphHelpers';

describe('getArrowsForEdge', () => {
  it('MST edges are never arrowed', () => {
    expect(getArrowsForEdge('mst', { valueRev: 0 })).toBe('');
    expect(getArrowsForEdge('mst', { valueRev: 10 })).toBe('');
  });

  it('shortestroute edges are always arrowed', () => {
    expect(getArrowsForEdge('shortestroute', { valueRev: 0 })).toBe('to');
  });

  it('maxflow edges are arrowed only when unidirectional', () => {
    expect(getArrowsForEdge('maxflow', { valueRev: 0 })).toBe('to');
    expect(getArrowsForEdge('maxflow', { valueRev: 5 })).toBe('');
  });
});

describe('color configs', () => {
  it('differ between light and dark theme', () => {
    expect(getNodeColorConfig(false)).not.toEqual(getNodeColorConfig(true));
    expect(getEdgeColorConfig(false)).not.toEqual(getEdgeColorConfig(true));
  });
});
