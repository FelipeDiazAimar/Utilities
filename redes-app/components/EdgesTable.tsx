'use client';

import { useGraphStore } from '@/lib/graphStore';

export default function EdgesTable() {
  const mode = useGraphStore((s) => s.mode);
  const edges = useGraphStore((s) => s.edges);
  const removeEdge = useGraphStore((s) => s.removeEdge);
  const updateEdge = useGraphStore((s) => s.updateEdge);

  function handleEdit(id: string, field: 'valueProp' | 'valueRev', raw: string) {
    const val = parseFloat(raw.replace(',', '.'));
    if (isNaN(val) || val < 0) return;
    const patch = { [field]: val } as Partial<{ valueProp: number; valueRev: number }>;
    if (mode === 'mst' && field === 'valueProp') patch.valueRev = val;
    updateEdge(id, patch);
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft glass">
      <table className="w-full text-center">
        <thead>
          <tr>
            <th className="p-3">De</th>
            <th className="p-3">A</th>
            <th className="p-3">{mode === 'maxflow' ? 'Capacidades (Ida | Vuelta)' : mode === 'shortestroute' ? 'Distancia' : 'Valor'}</th>
            <th className="p-3">Acción</th>
          </tr>
        </thead>
        <tbody>
          {edges.map((e) => (
            <tr key={e.id} className="border-t border-border">
              <td className="p-3">{e.from}</td>
              <td className="p-3">{e.to}</td>
              <td className="p-3">
                <input
                  key={`val-${e.id}-${e.valueProp}`}
                  className="w-16 rounded-lg border border-border bg-card p-1 text-center"
                  inputMode="decimal"
                  defaultValue={e.valueProp}
                  onBlur={(ev) => handleEdit(e.id, 'valueProp', ev.target.value)}
                />
                {mode === 'maxflow' && (
                  <input
                    key={`rev-${e.id}-${e.valueRev}`}
                    className="ml-2 w-16 rounded-lg border border-border bg-card p-1 text-center"
                    inputMode="decimal"
                    defaultValue={e.valueRev}
                    onBlur={(ev) => handleEdit(e.id, 'valueRev', ev.target.value)}
                  />
                )}
              </td>
              <td className="p-3">
                <button
                  className="rounded-lg bg-destructive px-2 py-1 text-xs text-destructive-foreground transition active:scale-95"
                  onClick={() => removeEdge(e.id)}
                >
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
