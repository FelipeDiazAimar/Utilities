'use client';

import { useState } from 'react';
import { useGraphStore } from '@/lib/graphStore';
import EdgesTable from './EdgesTable';

export default function DataEntryPanel() {
  const mode = useGraphStore((s) => s.mode);
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const addNode = useGraphStore((s) => s.addNode);
  const addEdge = useGraphStore((s) => s.addEdge);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [value, setValue] = useState('');
  const [valueRev, setValueRev] = useState('');
  const [direction, setDirection] = useState<'uni' | 'bi'>('uni');

  function parseNum(raw: string): number {
    return parseFloat(raw.trim().replace(',', '.'));
  }

  function handleAddEdge() {
    const parsedValue = parseNum(value);
    if (!from.trim() || !to.trim() || isNaN(parsedValue)) {
      alert('Complete todos los campos del arco correctamente.');
      return;
    }
    if (from.trim() === to.trim()) {
      alert('No se permiten bucles.');
      return;
    }
    const exists = edges.some(
      (e) => (e.from === from && e.to === to) || (e.from === to && e.to === from)
    );
    if (exists) {
      alert('Ese arco ya existe en el grafo.');
      return;
    }

    if (!nodes.some((n) => n.id === from)) addNode({ id: from, x: Math.random() * 200, y: Math.random() * 200 });
    if (!nodes.some((n) => n.id === to)) addNode({ id: to, x: Math.random() * 200, y: Math.random() * 200 });

    let parsedRev = 0;
    if (mode === 'maxflow' && direction === 'bi') {
      parsedRev = parseNum(valueRev);
      if (isNaN(parsedRev)) parsedRev = 0;
    } else if (mode === 'mst') {
      parsedRev = parsedValue;
    }

    addEdge({
      id: `${from}-${to}`,
      from,
      to,
      valueProp: parsedValue,
      valueRev: parsedRev,
    });

    setFrom('');
    setTo('');
    setValue('');
    setValueRev('');
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Ingreso de Datos</h2>
      <div className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-soft glass">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-sm font-semibold">Origen (De):</label>
            <input className="w-full rounded-xl border border-border bg-card p-2" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Ej: 1" />
          </div>
          <div className="flex-1">
            <label className="text-sm font-semibold">Destino (A):</label>
            <input className="w-full rounded-xl border border-border bg-card p-2" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Ej: 2" />
          </div>
        </div>

        {mode === 'maxflow' && (
          <div>
            <label className="text-sm font-semibold">Dirección del Arco:</label>
            <select className="w-full rounded-xl border border-border bg-card p-2" value={direction} onChange={(e) => setDirection(e.target.value as 'uni' | 'bi')}>
              <option value="uni">Unidireccional (De -&gt; A)</option>
              <option value="bi">Bidireccional (Ida y Vuelta)</option>
            </select>
          </div>
        )}

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-sm font-semibold">
              {mode === 'maxflow' ? 'Capacidad Ida (De -> A):' : mode === 'shortestroute' ? 'Distancia / Costo (De -> A):' : 'Valor / Costo:'}
            </label>
            <input className="w-full rounded-xl border border-border bg-card p-2" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Ej: 10 o 1,5" />
          </div>
          {mode === 'maxflow' && direction === 'bi' && (
            <div className="flex-1">
              <label className="text-sm font-semibold">Capacidad Vuelta (A -&gt; De):</label>
              <input className="w-full rounded-xl border border-border bg-card p-2" inputMode="decimal" value={valueRev} onChange={(e) => setValueRev(e.target.value)} placeholder="Ej: 10 o 0" />
            </div>
          )}
        </div>

        <div className="text-right">
          <button className="rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground transition active:scale-95" onClick={handleAddEdge}>
            Agregar Arco
          </button>
        </div>
      </div>

      <EdgesTable />
    </div>
  );
}
