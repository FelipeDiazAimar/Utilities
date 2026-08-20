'use client';

import { useEffect, useRef } from 'react';
import { useGraphStore } from '@/lib/graphStore';
import { getArrowsForEdge, getNodeColorConfig, getEdgeColorConfig } from '@/lib/graphHelpers';
import type { GraphNodeData, GraphEdgeData, ProblemMode } from '@/lib/types';

interface GhostEdgeLike {
  from: string;
  to: string;
  valueProp: number;
  valueRev: number;
}

// Etiquetas flotantes con el valor de cada arco (nodos de texto especiales, prefijo "lbl_").
// MST y Ruta Más Corta muestran una sola etiqueta centrada; Flujo Máximo muestra dos
// (ida cerca del origen, vuelta cerca del destino) — igual que en solver.html.
function addGhostLabelsForEdge(nodesData: any, mode: ProblemMode, e: GhostEdgeLike, isDark: boolean) {
  const nFrom = nodesData.get(e.from);
  const nTo = nodesData.get(e.to);
  if (!nFrom || !nTo) return;

  const fx = nFrom.x || 0;
  const fy = nFrom.y || 0;
  const tx = nTo.x || 0;
  const ty = nTo.y || 0;
  const dx = tx - fx;
  const dy = ty - fy;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = dx / len;
  const ny = dy / len;
  const offset = 40;
  const px = -ny * 20;
  const py = nx * 20;
  const fontConfig = { size: 16, bold: true, color: isDark ? '#e0e0e0' : '#333', strokeWidth: 0 };

  if (mode === 'mst' || mode === 'shortestroute') {
    nodesData.update({
      id: `lbl_${e.from}_${e.to}_mst`,
      label: e.valueProp.toString(),
      shape: 'text',
      font: fontConfig,
      x: (fx + tx) / 2 + px,
      y: (fy + ty) / 2 + py,
      isGhostLabel: true,
      originalText: e.valueProp.toString(),
    });
  } else {
    nodesData.update({
      id: `lbl_${e.from}_${e.to}_from`,
      label: e.valueProp.toString(),
      shape: 'text',
      font: fontConfig,
      x: fx + nx * offset + px,
      y: fy + ny * offset + py,
      isGhostLabel: true,
      originalText: e.valueProp.toString(),
    });
    nodesData.update({
      id: `lbl_${e.from}_${e.to}_to`,
      label: e.valueRev.toString(),
      shape: 'text',
      font: fontConfig,
      x: tx - nx * offset + px,
      y: ty - ny * offset + py,
      isGhostLabel: true,
      originalText: e.valueRev.toString(),
    });
  }
}

function removeGhostLabelsForEdge(nodesData: any, from: string, to: string) {
  [`lbl_${from}_${to}_mst`, `lbl_${from}_${to}_from`, `lbl_${from}_${to}_to`].forEach((id) => {
    if (nodesData.get(id)) nodesData.remove(id);
  });
}

function repositionGhostLabels(
  nodesData: any,
  edgesData: any,
  mode: ProblemMode,
  draggedNodeIds: string[] | null,
  getPos: (id: string) => { x: number; y: number } | undefined
) {
  const updates: any[] = [];
  const edgesToUpdate = edgesData
    .get()
    .filter((e: any) => (draggedNodeIds ? draggedNodeIds.includes(e.from) || draggedNodeIds.includes(e.to) : true));

  edgesToUpdate.forEach((e: any) => {
    const pFrom = getPos(e.from);
    const pTo = getPos(e.to);
    if (!pFrom || !pTo) return;

    const fx = pFrom.x;
    const fy = pFrom.y;
    const tx = pTo.x;
    const ty = pTo.y;
    const dx = tx - fx;
    const dy = ty - fy;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = dx / len;
    const ny = dy / len;
    const offset = 40;
    const px = -ny * 20;
    const py = nx * 20;

    const updateLabel = (id: string, defX: number, defY: number) => {
      const lbl = nodesData.get(id);
      if (lbl) {
        const cx = lbl.customDeltaX || 0;
        const cy = lbl.customDeltaY || 0;
        updates.push({ id, x: defX + cx, y: defY + cy });
      }
    };

    if (mode === 'mst' || mode === 'shortestroute') {
      updateLabel(`lbl_${e.from}_${e.to}_mst`, (fx + tx) / 2 + px, (fy + ty) / 2 + py);
    } else {
      updateLabel(`lbl_${e.from}_${e.to}_from`, fx + nx * offset + px, fy + ny * offset + py);
      updateLabel(`lbl_${e.from}_${e.to}_to`, tx - nx * offset + px, ty - ny * offset + py);
    }
  });

  if (updates.length > 0) nodesData.update(updates);
}

export default function GraphCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<any>(null);
  const nodesDataRef = useRef<any>(null);
  const edgesDataRef = useRef<any>(null);
  const prevModeRef = useRef<ProblemMode | null>(null);

  const mode = useGraphStore((s) => s.mode);
  const isDarkTheme = useGraphStore((s) => s.isDarkTheme);
  const storeNodes = useGraphStore((s) => s.nodes);
  const storeEdges = useGraphStore((s) => s.edges);
  const setNodesInStore = useGraphStore((s) => s.setNodes);
  const setEdgesInStore = useGraphStore((s) => s.setEdges);

  // Mount vis-network once; sync FROM the store on mount, sync TO the store on every mutation.
  useEffect(() => {
    let cancelled = false;

    import('vis-network/standalone/esm/vis-network.min.js').then((vis) => {
      if (cancelled || !containerRef.current) return;

      const initialMode = useGraphStore.getState().mode;
      const initialIsDark = useGraphStore.getState().isDarkTheme;

      const initialNodes = useGraphStore.getState().nodes.map((n: GraphNodeData) => ({
        id: n.id,
        label: n.id,
        x: n.x,
        y: n.y,
      }));
      const initialEdges = useGraphStore.getState().edges.map((e: GraphEdgeData) => ({
        id: e.id,
        from: e.from,
        to: e.to,
        valueProp: e.valueProp,
        valueRev: e.valueRev,
        label: '',
        arrows: getArrowsForEdge(initialMode, e),
      }));

      const nodesData = new (vis as any).DataSet(initialNodes);
      const edgesData = new (vis as any).DataSet(initialEdges);
      nodesDataRef.current = nodesData;
      edgesDataRef.current = edgesData;

      initialEdges.forEach((e: GraphEdgeData) => addGhostLabelsForEdge(nodesData, initialMode, e, initialIsDark));

      // vis-network no escribe la posición arrastrada de vuelta al DataSet automáticamente
      // (eso requiere network.storePositions()) — hay que leerla del motor de renderizado
      // vía getPositions(), o se pierde el arrastre al re-sincronizar con el store.
      const syncNodesToStore = () => {
        const positions = network.getPositions();
        const raw = nodesData.get().filter((n: any) => !n.isGhostLabel);
        setNodesInStore(
          raw.map((n: any) => ({
            id: n.id,
            x: positions[n.id]?.x ?? n.x ?? 0,
            y: positions[n.id]?.y ?? n.y ?? 0,
          }))
        );
      };
      const syncEdgesToStore = () => {
        setEdgesInStore(
          edgesData.get().map((e: any) => ({
            id: e.id,
            from: e.from,
            to: e.to,
            valueProp: e.valueProp,
            valueRev: e.valueRev,
          }))
        );
      };

      const network = new (vis as any).Network(
        containerRef.current,
        { nodes: nodesData, edges: edgesData },
        {
          nodes: {
            shape: 'circle',
            color: getNodeColorConfig(isDarkTheme),
            font: { color: isDarkTheme ? '#e0e0e0' : '#333', strokeWidth: 0 },
            borderWidth: 2,
          },
          edges: {
            color: getEdgeColorConfig(isDarkTheme),
            font: { align: 'top', color: isDarkTheme ? '#e0e0e0' : '#333', strokeWidth: 0, vadjust: -5 },
            width: 2,
            smooth: { enabled: false },
            arrows: { to: { enabled: false } },
          },
          physics: { enabled: false },
          interaction: { hover: true },
          manipulation: {
            enabled: true,
            addNode: (nodeData: any, callback: (d: any) => void) => {
              const id = prompt('Ingrese el nombre/ID del nodo:');
              if (!id) return callback(null);
              if (nodesData.get(id)) {
                alert('Ese nodo ya existe.');
                return callback(null);
              }
              nodeData.id = id;
              nodeData.label = id;
              callback(nodeData);
              syncNodesToStore();
            },
            addEdge: (edgeData: any, callback: (d: any) => void) => {
              if (edgeData.from === edgeData.to) {
                alert('No se permiten bucles.');
                return callback(null);
              }
              const existing = edgesData
                .get()
                .find(
                  (e: any) =>
                    (e.from === edgeData.from && e.to === edgeData.to) ||
                    (e.from === edgeData.to && e.to === edgeData.from)
                );
              if (existing) {
                alert('Ya existe un arco entre estos dos nodos. Elimínelo para editarlo.');
                return callback(null);
              }

              const currentMode = useGraphStore.getState().mode;
              const promptText =
                currentMode === 'maxflow'
                  ? `Ingrese la capacidad de IDA (${edgeData.from} -> ${edgeData.to}):`
                  : currentMode === 'shortestroute'
                    ? `Ingrese la distancia/costo del arco dirigido (${edgeData.from} -> ${edgeData.to}):`
                    : 'Ingrese el valor o costo del arco:';
              const val = prompt(promptText);
              const parsedVal = parseFloat(String(val).replace(',', '.'));
              if (isNaN(parsedVal) || parsedVal < 0) {
                alert('Valor inválido.');
                return callback(null);
              }

              let parsedValRev = 0;
              if (currentMode === 'maxflow') {
                if (confirm('¿El arco es BIDIRECCIONAL? (Aceptar = Sí, Cancelar = No, será Unidireccional)')) {
                  const valRev = prompt(`Ingrese la capacidad de VUELTA (${edgeData.to} -> ${edgeData.from}):`);
                  parsedValRev = parseFloat(String(valRev).replace(',', '.'));
                  if (isNaN(parsedValRev) || parsedValRev < 0) parsedValRev = 0;
                }
              } else if (currentMode === 'mst') {
                parsedValRev = parsedVal;
              }

              edgeData.id = `${edgeData.from}-${edgeData.to}`;
              edgeData.valueProp = parsedVal;
              edgeData.valueRev = parsedValRev;
              edgeData.label = '';
              edgeData.arrows = getArrowsForEdge(currentMode, edgeData);
              callback(edgeData);
              addGhostLabelsForEdge(nodesData, currentMode, edgeData, useGraphStore.getState().isDarkTheme);
              syncEdgesToStore();
            },
            deleteNode: (data: any, callback: (d: any) => void) => {
              const nodeIds: string[] = data.nodes || [];
              const connectedEdges = edgesData
                .get()
                .filter((e: any) => nodeIds.includes(e.from) || nodeIds.includes(e.to));
              callback(data);
              connectedEdges.forEach((e: any) => removeGhostLabelsForEdge(nodesData, e.from, e.to));
              syncNodesToStore();
              syncEdgesToStore();
            },
            deleteEdge: (data: any, callback: (d: any) => void) => {
              const edgeIds: string[] = data.edges || [];
              const removedEdges = edgeIds.map((id) => edgesData.get(id)).filter(Boolean);
              callback(data);
              removedEdges.forEach((e: any) => removeGhostLabelsForEdge(nodesData, e.from, e.to));
              syncEdgesToStore();
            },
            editEdge: false,
          },
        }
      );

      networkRef.current = network;
      network.once('afterDrawing', () => network.fit());

      const getLivePos = (id: string) => network.getPositions([id])[id];

      network.on('dragging', (params: any) => {
        if (params.nodes.length > 0) {
          const draggedNodes = params.nodes.filter((n: string) => !n.startsWith('lbl_'));
          if (draggedNodes.length > 0) {
            repositionGhostLabels(nodesData, edgesData, useGraphStore.getState().mode, draggedNodes, getLivePos);
          }
        }
      });

      network.on('dragEnd', (params: any) => {
        if (params.nodes.length === 0) return;
        const nodeId = params.nodes[0];

        if (typeof nodeId === 'string' && nodeId.startsWith('lbl_')) {
          // El usuario arrastró una etiqueta manualmente: recordar el offset personalizado.
          const parts = nodeId.split('_');
          const from = parts[1];
          const to = parts[2];
          const type = parts[3];
          const pFrom = getLivePos(from);
          const pTo = getLivePos(to);
          if (!pFrom || !pTo) return;

          const fx = pFrom.x;
          const fy = pFrom.y;
          const tx = pTo.x;
          const ty = pTo.y;
          const dx = tx - fx;
          const dy = ty - fy;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const nx = dx / len;
          const ny = dy / len;
          const offset = 40;
          const px = -ny * 20;
          const py = nx * 20;

          let defaultX = 0;
          let defaultY = 0;
          if (type === 'mst') {
            defaultX = (fx + tx) / 2 + px;
            defaultY = (fy + ty) / 2 + py;
          } else if (type === 'from') {
            defaultX = fx + nx * offset + px;
            defaultY = fy + ny * offset + py;
          } else if (type === 'to') {
            defaultX = tx - nx * offset + px;
            defaultY = ty - ny * offset + py;
          }

          const lblPos = network.getPositions([nodeId])[nodeId];
          nodesData.update({
            id: nodeId,
            customDeltaX: lblPos.x - defaultX,
            customDeltaY: lblPos.y - defaultY,
            x: lblPos.x,
            y: lblPos.y,
          });
        } else {
          const draggedNodes = params.nodes.filter((n: string) => !n.startsWith('lbl_'));
          repositionGhostLabels(nodesData, edgesData, useGraphStore.getState().mode, draggedNodes, getLivePos);
          syncNodesToStore();
        }
      });
    });

    return () => {
      cancelled = true;
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount once; store reads inside callbacks use getState() for freshness

  // Reconcile the vis-network DataSets with the store whenever it changes externally
  // (mode switch, "Limpiar Todo", loading an example, or restoring a saved .json —
  // none of those go through vis-network's own manipulation callbacks).
  useEffect(() => {
    const nodesData = nodesDataRef.current;
    const edgesData = edgesDataRef.current;
    if (!nodesData || !edgesData) return;

    // Cambiar de modo cambia el formato de las etiquetas fantasma (una centrada vs.
    // dos por arco): borrar todas y regenerarlas evita dejar etiquetas del modo anterior.
    if (prevModeRef.current !== null && prevModeRef.current !== mode) {
      const allGhostIds = nodesData.get().filter((n: any) => n.isGhostLabel).map((n: any) => n.id);
      if (allGhostIds.length > 0) nodesData.remove(allGhostIds);
    }
    prevModeRef.current = mode;

    const storeNodeIds = new Set(storeNodes.map((n) => n.id));
    const staleNodeIds = nodesData
      .get()
      .filter((n: any) => !n.isGhostLabel && !storeNodeIds.has(n.id))
      .map((n: any) => n.id);
    if (staleNodeIds.length > 0) nodesData.remove(staleNodeIds);
    const nodeFont = { color: isDarkTheme ? '#e0e0e0' : '#333', strokeWidth: 0 };
    nodesData.update(
      storeNodes.map((n) => ({
        id: n.id,
        label: n.id,
        x: n.x,
        y: n.y,
        color: getNodeColorConfig(isDarkTheme),
        font: nodeFont,
      }))
    );

    const storeEdgeIds = new Set(storeEdges.map((e) => e.id));
    const staleEdges = edgesData.get().filter((e: any) => !storeEdgeIds.has(e.id));
    if (staleEdges.length > 0) {
      edgesData.remove(staleEdges.map((e: any) => e.id));
      staleEdges.forEach((e: any) => removeGhostLabelsForEdge(nodesData, e.from, e.to));
    }
    edgesData.update(
      storeEdges.map((e) => ({
        id: e.id,
        from: e.from,
        to: e.to,
        valueProp: e.valueProp,
        valueRev: e.valueRev,
        arrows: getArrowsForEdge(mode, e),
        color: getEdgeColorConfig(isDarkTheme),
      }))
    );
    storeEdges.forEach((e) => addGhostLabelsForEdge(nodesData, mode, e, isDarkTheme));
  }, [mode, isDarkTheme, storeEdges, storeNodes]);

  return <div ref={containerRef} className="h-[600px] w-full rounded-2xl border border-border bg-muted shadow-soft" />;
}
