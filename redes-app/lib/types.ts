export type ProblemMode = 'mst' | 'maxflow' | 'shortestroute';
export type RouteObjective = 'min' | 'max' | 'prob';

export interface GraphNodeData {
  id: string;
  x: number;
  y: number;
}

export interface GraphEdgeData {
  id: string;
  from: string;
  to: string;
  valueProp: number;
  valueRev: number;
}
