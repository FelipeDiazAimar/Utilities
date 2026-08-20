import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GraphNodeData, GraphEdgeData, ProblemMode, RouteObjective } from './types';

interface GraphState {
  version: number;
  mode: ProblemMode;
  objective: RouteObjective;
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
  sourceNode: string | null;
  sinkNode: string | null;
  originNode: string | null;
  destNode: string | null;
  isDarkTheme: boolean;

  setMode: (mode: ProblemMode) => void;
  setObjective: (objective: RouteObjective) => void;
  setNodes: (nodes: GraphNodeData[]) => void;
  setEdges: (edges: GraphEdgeData[]) => void;
  addNode: (node: GraphNodeData) => void;
  addEdge: (edge: GraphEdgeData) => void;
  removeNode: (id: string) => void;
  removeEdge: (id: string) => void;
  updateEdge: (id: string, patch: Partial<GraphEdgeData>) => void;
  setSourceSink: (source: string | null, sink: string | null) => void;
  setOriginDest: (origin: string | null, dest: string | null) => void;
  clearAll: () => void;
  loadSnapshot: (snapshot: Partial<GraphState>) => void;
  toggleTheme: () => void;
}

export const useGraphStore = create<GraphState>()(
  persist(
    (set) => ({
      version: 1,
      mode: 'mst',
      objective: 'min',
      nodes: [],
      edges: [],
      sourceNode: null,
      sinkNode: null,
      originNode: null,
      destNode: null,
      isDarkTheme: false,

      setMode: (mode) => set({ mode }),
      setObjective: (objective) => set({ objective }),
      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
      addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),
      addEdge: (edge) => set((s) => ({ edges: [...s.edges, edge] })),
      removeNode: (id) =>
        set((s) => ({
          nodes: s.nodes.filter((n) => n.id !== id),
          edges: s.edges.filter((e) => e.from !== id && e.to !== id),
        })),
      removeEdge: (id) => set((s) => ({ edges: s.edges.filter((e) => e.id !== id) })),
      updateEdge: (id, patch) =>
        set((s) => ({
          edges: s.edges.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
      setSourceSink: (sourceNode, sinkNode) => set({ sourceNode, sinkNode }),
      setOriginDest: (originNode, destNode) => set({ originNode, destNode }),
      clearAll: () =>
        set({
          nodes: [],
          edges: [],
          sourceNode: null,
          sinkNode: null,
          originNode: null,
          destNode: null,
        }),
      loadSnapshot: (snapshot) => set(snapshot),
      toggleTheme: () => set((s) => ({ isDarkTheme: !s.isDarkTheme })),
    }),
    { name: 'redes-app-store' }
  )
);
