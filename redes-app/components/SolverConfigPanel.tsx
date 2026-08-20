'use client';

import { useGraphStore } from '@/lib/graphStore';
import type { RouteObjective } from '@/lib/types';

export default function SolverConfigPanel() {
  const mode = useGraphStore((s) => s.mode);
  const nodes = useGraphStore((s) => s.nodes);
  const sourceNode = useGraphStore((s) => s.sourceNode);
  const sinkNode = useGraphStore((s) => s.sinkNode);
  const originNode = useGraphStore((s) => s.originNode);
  const destNode = useGraphStore((s) => s.destNode);
  const objective = useGraphStore((s) => s.objective);
  const setSourceSink = useGraphStore((s) => s.setSourceSink);
  const setOriginDest = useGraphStore((s) => s.setOriginDest);
  const setObjective = useGraphStore((s) => s.setObjective);

  if (mode === 'mst') return null;

  const nodeOptions = nodes.map((n) => (
    <option key={n.id} value={n.id}>
      {n.id}
    </option>
  ));

  if (mode === 'maxflow') {
    return (
      <div className="flex gap-3 rounded-2xl border border-amber-300/50 bg-amber-50/70 p-4 shadow-soft glass dark:border-amber-800/50 dark:bg-amber-950/40">
        <div className="flex-1">
          <label className="text-sm font-semibold">Fuente (Origen):</label>
          <select className="w-full rounded-xl border border-border bg-card p-2" value={sourceNode ?? ''} onChange={(e) => setSourceSink(e.target.value, sinkNode)}>
            {nodeOptions}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-semibold">Sumidero (Destino):</label>
          <select className="w-full rounded-xl border border-border bg-card p-2" value={sinkNode ?? ''} onChange={(e) => setSourceSink(sourceNode, e.target.value)}>
            {nodeOptions}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-semibold">Objetivo de Ruta:</label>
        <select
          className="w-full rounded-xl border border-border bg-card p-2"
          value={objective}
          onChange={(e) => setObjective(e.target.value as RouteObjective)}
        >
          <option value="min">Minimizar (Ruta Más Corta)</option>
          <option value="max">Maximizar (Ruta Más Larga)</option>
          <option value="prob">Maximizar Probabilidad (Producto)</option>
        </select>
      </div>
      <div className="flex gap-3 rounded-2xl border border-amber-300/50 bg-amber-50/70 p-4 shadow-soft glass dark:border-amber-800/50 dark:bg-amber-950/40">
        <div className="flex-1">
          <label className="text-sm font-semibold">Nodo Origen:</label>
          <select className="w-full rounded-xl border border-border bg-card p-2" value={originNode ?? ''} onChange={(e) => setOriginDest(e.target.value, destNode)}>
            {nodeOptions}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-semibold">Nodo Destino (opcional):</label>
          <select className="w-full rounded-xl border border-border bg-card p-2" value={destNode ?? ''} onChange={(e) => setOriginDest(originNode, e.target.value || null)}>
            <option value="">-- Ver ruta a todos los nodos --</option>
            {nodeOptions}
          </select>
        </div>
      </div>
    </div>
  );
}
