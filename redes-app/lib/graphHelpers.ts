import type { ProblemMode } from './types';

export function getArrowsForEdge(mode: ProblemMode, edge: { valueRev: number }): string {
  if (mode === 'shortestroute') return 'to';
  if (mode === 'maxflow') return edge.valueRev > 0 ? '' : 'to';
  return ''; // MST: no dirigido
}

export function getNodeColorConfig(isDark: boolean) {
  return {
    background: isDark ? '#2d2d2d' : '#f8f9fa',
    border: isDark ? '#3b82f6' : '#3498db',
  };
}

export function getEdgeColorConfig(isDark: boolean) {
  return {
    color: isDark ? '#9ca3af' : '#7f8c8d',
  };
}
