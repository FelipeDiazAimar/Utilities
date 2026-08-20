'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import GlobalControls from '@/components/GlobalControls';
import DataEntryPanel from '@/components/DataEntryPanel';
import SolverConfigPanel from '@/components/SolverConfigPanel';
import SolverPanel from '@/components/SolverPanel';

const GraphCanvas = dynamic(() => import('@/components/GraphCanvas'), { ssr: false });

export default function Home() {
  const [solving, setSolving] = useState(false);

  return (
    <main className="mx-auto max-w-[1300px] space-y-5 p-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Modelos de Redes</h1>
      </div>

      <GlobalControls />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex-1 space-y-4">
          {solving ? (
            <SolverPanel onBackToEdit={() => setSolving(false)} />
          ) : (
            <>
              <DataEntryPanel />
              <SolverConfigPanel />
              <button
                className="w-full rounded-xl bg-success px-4 py-3 text-lg font-medium text-success-foreground shadow-soft transition active:scale-95"
                onClick={() => setSolving(true)}
              >
                ¡Resolver Problema!
              </button>
            </>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <h2 className="text-xl font-semibold">Visualización del Grafo</h2>
          <GraphCanvas />
        </div>
      </div>
    </main>
  );
}
