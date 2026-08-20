export interface RouteEdge {
  from: string;
  to: string;
  value: number;
}

export interface RouteLabel {
  dist: number;
  pred: string | null;
}

export interface ShortestRouteStep {
  iteration: number;
  labels: Record<string, RouteLabel>;
  permanentNodes: string[];
  newlyPermanent: string | null;
  newEdge: { from: string; to: string } | null;
  finalPathEdges?: { from: string; to: string }[];
  highlightPath?: string[];
  description: string;
  tableHTML: string;
}

export type RouteObjective = 'min' | 'max' | 'prob';

export class ShortestRouteSolver {
  nodes: string[];
  edges: RouteEdge[];
  origin: string;
  destination: string | null;
  objective: RouteObjective;
  isProb: boolean;
  isMax: boolean;
  steps: ShortestRouteStep[] = [];

  constructor(
    nodes: string[],
    edges: RouteEdge[],
    origin: string,
    destination: string | null,
    objective: RouteObjective = 'min'
  ) {
    this.nodes = nodes;
    this.edges = edges;
    this.origin = origin;
    this.destination = destination || null;
    this.objective = objective;
    this.isProb = objective === 'prob';
    this.isMax = objective === 'max' || this.isProb;
  }

  combine(a: number, dij: number): number {
    const v = this.isProb ? a * dij : a + dij;
    return this.isProb ? parseFloat(v.toFixed(6)) : v;
  }

  isBetter(newVal: number, oldVal: number): boolean {
    return this.isMax ? newVal > oldVal : newVal < oldVal;
  }

  solve(): ShortestRouteStep[] {
    if (!this.origin || !this.nodes.includes(this.origin)) return [];
    this.steps = [];

    const labels: Record<string, RouteLabel> = {};
    const permanent = new Set<string>();

    const initVal = this.isProb ? 1 : 0;
    labels[this.origin] = { dist: initVal, pred: null };
    permanent.add(this.origin);

    let iter = 0;
    const desc0 = `**Iteración 0:** Etiquetamos el nodo origen ${this.origin} con la etiqueta permanente [${initVal}, -]. i = ${this.origin}.`;
    this.steps.push({
      iteration: iter,
      labels: this.cloneLabels(labels),
      permanentNodes: Array.from(permanent),
      newlyPermanent: this.origin,
      newEdge: null,
      description: desc0,
      tableHTML: this.generateLabelTable(labels, permanent),
    });

    let i = this.origin;

    while (permanent.size < this.nodes.length) {
      iter++;
      let changesText = '';
      let anyChange = false;
      const opSymbol = this.isProb ? '×' : '+';

      for (const e of this.edges) {
        if (e.from !== i) continue;
        const j = e.to;
        const dij = e.value;
        if (dij <= 0 || permanent.has(j)) continue;

        const newDist = this.combine(labels[i].dist, dij);
        if (!labels[j] || this.isBetter(newDist, labels[j].dist)) {
          const oldLabelText = labels[j]
            ? ` (reemplaza la etiqueta anterior [${labels[j].dist}, ${labels[j].pred}])`
            : '';
          labels[j] = { dist: newDist, pred: i };
          changesText += `- Nodo ${j}: [${labels[i].dist} ${opSymbol} ${dij}, ${i}] = [${newDist}, ${i}]${oldLabelText}\n`;
          anyChange = true;
        }
      }

      let r: string | null = null;
      let bestDist = 0;
      for (const node of this.nodes) {
        if (permanent.has(node) || !labels[node]) continue;
        if (r === null || this.isBetter(labels[node].dist, bestDist)) {
          bestDist = labels[node].dist;
          r = node;
        }
      }

      if (r === null) {
        const discDesc =
          `**Iteración ${iter}:** No quedan más nodos alcanzables desde los ya etiquetados.\n` +
          `**ADVERTENCIA:** El grafo está desconectado. Los siguientes nodos no se pudieron alcanzar: ${this.nodes
            .filter((n) => !permanent.has(n))
            .join(', ')}`;
        this.steps.push({
          iteration: iter,
          labels: this.cloneLabels(labels),
          permanentNodes: Array.from(permanent),
          newlyPermanent: null,
          newEdge: null,
          description: discDesc,
          tableHTML: '',
        });
        break;
      }

      const objTerm = this.isProb ? 'probabilidad máxima' : this.isMax ? 'distancia máxima' : 'distancia mínima';
      let desc = `**Iteración ${iter}:** Desde el nodo ${i} (último etiquetado permanente) calculamos las etiquetas temporales de sus vecinos no permanentes:\n`;
      desc += anyChange ? changesText : `- No hay vecinos nuevos para etiquetar desde ${i}.\n`;
      desc += `\nLa etiqueta con la ${objTerm} entre todas las temporales es [${bestDist}, ${labels[r].pred}] en el nodo ${r}. Pasa a **permanente** (u${r} = ${bestDist}). i = ${r}.`;

      permanent.add(r);

      this.steps.push({
        iteration: iter,
        labels: this.cloneLabels(labels),
        permanentNodes: Array.from(permanent),
        newlyPermanent: r,
        newEdge: { from: labels[r].pred as string, to: r },
        description: desc,
        tableHTML: this.generateLabelTable(labels, permanent),
      });

      i = r;
    }

    this.steps.push(this.buildConclusionStep(labels, permanent, iter));
    return this.steps;
  }

  cloneLabels(labels: Record<string, RouteLabel>): Record<string, RouteLabel> {
    const copy: Record<string, RouteLabel> = {};
    for (const k in labels) copy[k] = { dist: labels[k].dist, pred: labels[k].pred };
    return copy;
  }

  backtrackPath(node: string, labels: Record<string, RouteLabel>): string[] {
    const path: string[] = [];
    let current: string | null = node;
    while (current !== null && current !== undefined) {
      path.unshift(current);
      current = labels[current] ? labels[current].pred : null;
    }
    return path;
  }

  generateLabelTable(labels: Record<string, RouteLabel>, permanent: Set<string>): string {
    let table = `<table><tr><th>Nodo</th><th>Etiqueta</th><th>Estado</th></tr>`;
    for (const n of this.nodes) {
      const lbl = labels[n] ? `[${labels[n].dist}, ${labels[n].pred === null ? '-' : labels[n].pred}]` : '-';
      const estado = permanent.has(n) ? '<strong>Permanente</strong>' : labels[n] ? 'Temporal' : '-';
      table += `<tr><td>${n}</td><td>${lbl}</td><td>${estado}</td></tr>`;
    }
    return table + `</table>`;
  }

  buildConclusionStep(
    labels: Record<string, RouteLabel>,
    permanent: Set<string>,
    iter: number
  ): ShortestRouteStep {
    const routeWord = this.isProb ? 'ruta más probable' : this.isMax ? 'ruta más larga' : 'ruta más corta';
    const term = this.isProb ? 'probabilidad' : 'distancia';
    let desc = `**Conclusión:** La ${routeWord} se determina partiendo del nodo destino y retrocediendo hasta el origen usando las etiquetas permanentes.\n\n`;
    const finalPathEdges: { from: string; to: string }[] = [];
    let highlightPath: string[] = [];

    if (this.destination) {
      if (labels[this.destination]) {
        const path = this.backtrackPath(this.destination, labels);
        highlightPath = path;
        desc += `La ${routeWord} de ${this.origin} a ${this.destination} es: ${path.join(' → ')}, con una ${term} total de **${labels[this.destination].dist}**.`;
      } else {
        desc += `El nodo ${this.destination} no es alcanzable desde el origen ${this.origin}.`;
      }
    } else {
      for (const n of this.nodes) {
        if (n === this.origin) continue;
        if (!labels[n]) {
          desc += `Del nodo ${this.origin} al ${n}: no alcanzable.\n`;
          continue;
        }
        const path = this.backtrackPath(n, labels);
        desc += `Del nodo ${this.origin} al ${n}: ${path.join('-')}, ${term} ${labels[n].dist}.\n`;
      }
    }

    for (const n in labels) {
      if (labels[n].pred !== null) {
        finalPathEdges.push({ from: labels[n].pred as string, to: n });
      }
    }

    return {
      iteration: iter + 1,
      labels: this.cloneLabels(labels),
      permanentNodes: Array.from(permanent),
      newlyPermanent: null,
      newEdge: null,
      finalPathEdges,
      highlightPath,
      description: desc,
      tableHTML: '',
    };
  }
}
