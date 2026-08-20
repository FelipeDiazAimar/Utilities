'use client';

import { useRef } from 'react';
import { useGraphStore } from '@/lib/graphStore';
import { loadExample, loadShortestRouteProbabilityExample } from '@/lib/examples';
import type { ProblemMode } from '@/lib/types';

export default function GlobalControls() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDarkTheme = useGraphStore((s) => s.isDarkTheme);
  const toggleTheme = useGraphStore((s) => s.toggleTheme);

  const mode = useGraphStore((s) => s.mode);
  const setMode = useGraphStore((s) => s.setMode);
  const clearAll = useGraphStore((s) => s.clearAll);
  const loadSnapshot = useGraphStore((s) => s.loadSnapshot);
  const setSourceSink = useGraphStore((s) => s.setSourceSink);
  const setOriginDest = useGraphStore((s) => s.setOriginDest);
  const setObjective = useGraphStore((s) => s.setObjective);

  function handleExample(type: ProblemMode) {
    clearAll();
    const { nodes, edges } = loadExample(type);
    setMode(type);
    loadSnapshot({ nodes, edges });
    if (type === 'maxflow') setSourceSink('1', '5');
    if (type === 'shortestroute') {
      setObjective('min');
      setOriginDest('1', '2');
    }
  }

  function handleProbabilityExample() {
    clearAll();
    const { nodes, edges } = loadShortestRouteProbabilityExample();
    setMode('shortestroute');
    loadSnapshot({ nodes, edges });
    setObjective('prob');
    setOriginDest('1', '5');
  }

  function handleSave() {
    const state = useGraphStore.getState();
    const blob = new Blob(
      [
        JSON.stringify(
          {
            mode: state.mode,
            objective: state.objective,
            nodes: state.nodes,
            edges: state.edges,
            sourceNode: state.sourceNode,
            sinkNode: state.sinkNode,
            originNode: state.originNode,
            destNode: state.destNode,
          },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grafo_${state.mode}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleLoad(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(String(e.target?.result));
        loadSnapshot(data);
      } catch {
        alert('Error al cargar el archivo JSON.');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  }

  const btn = 'rounded-xl px-3 py-2 font-medium transition active:scale-95';

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft glass">
      <div className="flex items-center gap-3">
        <label className="font-semibold">Tipo de Problema:</label>
        <select
          className="rounded-xl border border-border bg-card p-2"
          value={mode}
          onChange={(e) => setMode(e.target.value as ProblemMode)}
        >
          <option value="mst">Árbol de Mínima Expansión (MST)</option>
          <option value="maxflow">Flujo Máximo</option>
          <option value="shortestroute">Ruta Más Corta (Dijkstra)</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className={`${btn} bg-primary text-primary-foreground`} onClick={() => handleExample('mst')}>Cargar Ejemplo MST</button>
        <button className={`${btn} bg-primary text-primary-foreground`} onClick={() => handleExample('maxflow')}>Cargar Ejemplo Flujo Max</button>
        <button className={`${btn} bg-primary text-primary-foreground`} onClick={() => handleExample('shortestroute')}>Cargar Ejemplo Ruta Más Corta</button>
        <button className={`${btn} bg-primary text-primary-foreground`} onClick={handleProbabilityExample}>Cargar Ejemplo Ruta Más Corta (Probabilidad)</button>
        <button className={`${btn} bg-purple-600 text-white`} onClick={handleSave}>Guardar</button>
        <button className={`${btn} bg-purple-600 text-white`} onClick={() => fileInputRef.current?.click()}>Cargar</button>
        <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleLoad} />
        <button className={`${btn} bg-destructive text-destructive-foreground`} onClick={clearAll}>Limpiar Todo</button>
        <button className={`${btn} border border-border`} onClick={toggleTheme}>
          {isDarkTheme ? '☀︎' : '⏾'}
        </button>
      </div>
    </div>
  );
}
