'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGraphStore } from '@/lib/graphStore';
import { MSTSolver, type MSTStep } from '@/lib/solvers/MSTSolver';
import { MaxFlowSolver, type MaxFlowStep } from '@/lib/solvers/MaxFlowSolver';
import { ShortestRouteSolver, type ShortestRouteStep } from '@/lib/solvers/ShortestRouteSolver';

type AnyStep = MSTStep | MaxFlowStep | ShortestRouteStep;

function renderDescription(description: string, tableHTML?: string): { __html: string } {
  let html = description;
  if (tableHTML) html += '<br>' + tableHTML;
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  return { __html: html };
}

export default function SolverPanel({ onBackToEdit }: { onBackToEdit: () => void }) {
  const mode = useGraphStore((s) => s.mode);
  const objective = useGraphStore((s) => s.objective);
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const sourceNode = useGraphStore((s) => s.sourceNode);
  const sinkNode = useGraphStore((s) => s.sinkNode);
  const originNode = useGraphStore((s) => s.originNode);
  const destNode = useGraphStore((s) => s.destNode);

  const [stepIndex, setStepIndex] = useState(0);
  const [fullLog, setFullLog] = useState(false);

  const steps: AnyStep[] = useMemo(() => {
    const nodeIds = nodes.map((n) => n.id);
    if (mode === 'mst') {
      return new MSTSolver(
        nodeIds,
        edges.map((e) => ({ from: e.from, to: e.to, value: e.valueProp }))
      ).solve();
    }
    if (mode === 'maxflow') {
      if (!sourceNode || !sinkNode) return [];
      const directed: { from: string; to: string; value: number }[] = [];
      edges.forEach((e) => {
        if (e.valueProp > 0) directed.push({ from: e.from, to: e.to, value: e.valueProp });
        if (e.valueRev > 0) directed.push({ from: e.to, to: e.from, value: e.valueRev });
      });
      return new MaxFlowSolver(nodeIds, directed, sourceNode, sinkNode).solve();
    }
    if (!originNode) return [];
    return new ShortestRouteSolver(
      nodeIds,
      edges.map((e) => ({ from: e.from, to: e.to, value: e.valueProp })),
      originNode,
      destNode,
      objective
    ).solve();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // solve once when this panel mounts (i.e. once the user clicks "Resolver")

  if (steps.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft glass">
        <p>No se encontraron pasos de resolución. Verifique su grafo y la configuración.</p>
        <button className="mt-4 rounded-xl border border-border px-4 py-2 transition active:scale-95" onClick={onBackToEdit}>
          ← Volver a Editar
        </button>
      </div>
    );
  }

  const current = steps[stepIndex];
  const currentTableHTML = 'tableHTML' in current ? current.tableHTML : undefined;

  return (
    <div className="space-y-4 rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-soft glass">
      <button className="rounded-xl border border-border px-3 py-2 transition active:scale-95" onClick={onBackToEdit}>
        ← Volver a Editar
      </button>
      <h3 className="text-center text-lg font-semibold">Paso a Paso</h3>

      {!fullLog && (
        <div className="flex items-center justify-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft glass">
          <button
            className="rounded-xl border border-border px-3 py-2 transition active:scale-95 disabled:opacity-50"
            disabled={stepIndex === 0}
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          >
            Anterior
          </button>
          <strong>
            Paso {stepIndex + 1} de {steps.length}
          </strong>
          <button
            className="rounded-xl border border-border px-3 py-2 transition active:scale-95 disabled:opacity-50"
            disabled={stepIndex === steps.length - 1}
            onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
          >
            Siguiente
          </button>
        </div>
      )}

      <button
        className="w-full rounded-xl bg-success px-4 py-2 font-medium text-success-foreground transition active:scale-95"
        onClick={() => setFullLog((v) => !v)}
      >
        {fullLog ? 'Volver al Paso a Paso 🔄' : 'Ver Toda la Solución Juntas 📄'}
      </button>

      {fullLog ? (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft glass">
          {steps.map((s, idx) => (
            <div key={idx}>
              <h4 className="mb-2 font-semibold text-primary">Paso {idx + 1}</h4>
              <div dangerouslySetInnerHTML={renderDescription(s.description, 'tableHTML' in s ? s.tableHTML : undefined)} />
              <hr className="mt-4 border-border" />
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="min-h-[100px] rounded-2xl border border-border bg-card p-5 leading-relaxed shadow-soft glass"
            dangerouslySetInnerHTML={renderDescription(current.description, currentTableHTML)}
          />
        </AnimatePresence>
      )}
    </div>
  );
}
