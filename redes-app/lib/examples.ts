import type { GraphNodeData, GraphEdgeData, ProblemMode } from './types';

const COORDS: Record<string, { x: number; y: number }> = {
  '1': { x: -200, y: 0 },
  '2': { x: 0, y: -100 },
  '3': { x: 0, y: 100 },
  '4': { x: 200, y: -100 },
  '5': { x: 200, y: 100 },
};

const BASE_NODES: GraphNodeData[] = Object.entries(COORDS).map(([id, pos]) => ({ id, ...pos }));

export function loadExample(type: ProblemMode): { nodes: GraphNodeData[]; edges: GraphEdgeData[] } {
  if (type === 'mst') {
    const raw = [
      { from: '1', to: '2', val: 1 },
      { from: '1', to: '4', val: 5 },
      { from: '2', to: '4', val: 5 },
      { from: '2', to: '3', val: 7 },
      { from: '2', to: '5', val: 2 },
      { from: '3', to: '5', val: 2 },
      { from: '4', to: '5', val: 4 },
    ];
    return {
      nodes: BASE_NODES,
      edges: raw.map((e) => ({ id: `${e.from}-${e.to}`, from: e.from, to: e.to, valueProp: e.val, valueRev: e.val })),
    };
  }

  if (type === 'maxflow') {
    const raw = [
      { from: '1', to: '2', ida: 20, vuelta: 0 },
      { from: '1', to: '3', ida: 30, vuelta: 0 },
      { from: '1', to: '4', ida: 10, vuelta: 0 },
      { from: '2', to: '3', ida: 40, vuelta: 0 },
      { from: '2', to: '5', ida: 30, vuelta: 0 },
      { from: '3', to: '4', ida: 10, vuelta: 5 },
      { from: '3', to: '5', ida: 20, vuelta: 0 },
      { from: '4', to: '5', ida: 20, vuelta: 0 },
    ];
    return {
      nodes: BASE_NODES,
      edges: raw.map((e) => ({ id: `${e.from}-${e.to}`, from: e.from, to: e.to, valueProp: e.ida, valueRev: e.vuelta })),
    };
  }

  // shortestroute — el ejemplo del apunte del profesor (verificado: 1→3→4→2 = 55)
  const raw = [
    { from: '1', to: '2', val: 100 },
    { from: '1', to: '3', val: 30 },
    { from: '2', to: '3', val: 20 },
    { from: '3', to: '4', val: 10 },
    { from: '4', to: '2', val: 15 },
    { from: '3', to: '5', val: 60 },
    { from: '4', to: '5', val: 50 },
  ];
  return {
    nodes: BASE_NODES,
    edges: raw.map((e) => ({ id: `${e.from}-${e.to}`, from: e.from, to: e.to, valueProp: e.val, valueRev: 0 })),
  };
}

// Ejemplo de Ruta Más Corta con objetivo "Maximizar Probabilidad" (red de
// confiabilidad: cada arco es la probabilidad de éxito del tramo, se
// maximiza el producto). Mejor ruta verificada de 1 a 5: 1-2-5 = 0.9*0.85 = 0.765.
export function loadShortestRouteProbabilityExample(): { nodes: GraphNodeData[]; edges: GraphEdgeData[] } {
  const raw = [
    { from: '1', to: '2', val: 0.9 },
    { from: '1', to: '3', val: 0.8 },
    { from: '2', to: '4', val: 0.7 },
    { from: '2', to: '5', val: 0.85 },
    { from: '3', to: '4', val: 0.95 },
    { from: '3', to: '5', val: 0.6 },
    { from: '4', to: '5', val: 0.9 },
  ];
  return {
    nodes: BASE_NODES,
    edges: raw.map((e) => ({ id: `${e.from}-${e.to}`, from: e.from, to: e.to, valueProp: e.val, valueRev: 0 })),
  };
}
