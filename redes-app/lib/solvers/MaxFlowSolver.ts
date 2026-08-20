export interface MaxFlowEdge {
  from: string;
  to: string;
  value: number;
}

export interface MaxFlowStep {
  iteration: number;
  path: string[];
  flow: number;
  totalFlow: number;
  residues: Record<string, Record<string, number>>;
  description: string;
  nodeTags?: Record<string, string>;
  finalFlows?: { from: string; to: string; flow: number }[];
}

interface PathResult {
  nodes: string[];
  flow: number;
}

export class MaxFlowSolver {
  nodes: string[];
  edges: MaxFlowEdge[];
  source: string;
  sink: string;
  steps: MaxFlowStep[] = [];

  constructor(nodes: string[], edges: MaxFlowEdge[], source: string, sink: string) {
    this.nodes = nodes;
    this.edges = edges;
    this.source = source;
    this.sink = sink;
  }

  solve(): MaxFlowStep[] {
    if (!this.source || !this.sink || this.source === this.sink) return [];
    this.steps = [];

    const res: Record<string, Record<string, number>> = {};
    for (const n of this.nodes) {
      res[n] = {};
      for (const m of this.nodes) res[n][m] = 0;
    }
    for (const e of this.edges) res[e.from][e.to] = e.value;

    let flowTotal = 0;
    let iter = 1;

    while (true) {
      const pathResult = this.findPath(res);
      if (!pathResult) break;

      const N_p = pathResult.nodes;
      const f_p = pathResult.flow;

      let descIter = `**ITERACIÓN ${iter}:**\n`;
      descIter += `**Paso 1:** a<sub>${this.source}</sub>=∞, etiquetamos nodo ${this.source} con [∞, -]. i=${this.source}.\n`;

      let currentDesc = '';
      for (let idx = 0; idx < N_p.length - 1; idx++) {
        const u = N_p[idx];
        const v = N_p[idx + 1];
        const S_u = this.getS(u, res, N_p.slice(0, idx + 1));
        currentDesc += `**Paso 2:** S<sub>${u}</sub>={${S_u.join(',')}} (no vacío).\n`;
        currentDesc += `**Paso 3:** k=${v} y a<sub>${v}</sub>=c<sub>${u}${v}</sub>=${res[u][v]}. Clasificamos el nodo ${v} con [${res[u][v]},${u}]. Tomamos i=${v}`;
        currentDesc += v === this.sink ? ` y logramos la ruta de avance, vamos al paso 5.\n` : ` y repetimos el paso 2.\n`;
      }

      descIter += currentDesc;
      descIter += `**Paso 5:** N<sub>p</sub>={${N_p.join(',')}}, f<sub>p</sub> = ${f_p}.\n\n`;

      const oldRes = JSON.parse(JSON.stringify(res));
      let resDesc = '**Residuos actualizados:**\n';
      for (let idx = 0; idx < N_p.length - 1; idx++) {
        const u = N_p[idx];
        const v = N_p[idx + 1];
        res[u][v] -= f_p;
        res[v][u] += f_p;
        resDesc += `(c<sub>${u}${v}</sub>, c<sub>${v}${u}</sub>) = (${oldRes[u][v]} - ${f_p}, ${oldRes[v][u]} + ${f_p}) = (${res[u][v]}, ${res[v][u]})\n`;
      }
      descIter += resDesc;

      flowTotal += f_p;

      const stepNodeTags: Record<string, string> = { [this.source]: `[∞, -]` };
      for (let idx = 0; idx < N_p.length - 1; idx++) {
        const u = N_p[idx];
        const v = N_p[idx + 1];
        stepNodeTags[v] = `[${res[u][v]}, ${u}]`;
      }

      this.steps.push({
        iteration: iter,
        path: N_p,
        flow: f_p,
        totalFlow: flowTotal,
        residues: JSON.parse(JSON.stringify(res)),
        description: descIter,
        nodeTags: stepNodeTags,
      });

      iter++;
    }

    const finalDesc = `**Paso final:** Hemos determinado ${iter - 1} rutas de avance.\nEl flujo máximo total será: F = **${flowTotal}**.\n`;

    this.steps.push({
      iteration: iter,
      path: [],
      flow: 0,
      totalFlow: flowTotal,
      residues: res,
      description: finalDesc,
      finalFlows: [],
    });

    return this.steps;
  }

  findPath(res: Record<string, Record<string, number>>): PathResult | null {
    const visited = new Set<string>();
    const stack: { node: string; path: string[]; minCap: number }[] = [
      { node: this.source, path: [this.source], minCap: Infinity },
    ];

    while (stack.length > 0) {
      const current = stack.pop()!;
      const u = current.node;
      visited.add(u);

      if (u === this.sink) {
        return { nodes: current.path, flow: current.minCap };
      }

      const S_u = this.getS(u, res, Array.from(visited));
      S_u.sort((a, b) => res[u][a] - res[u][b]);

      for (const v of S_u) {
        if (!visited.has(v) && !current.path.includes(v)) {
          stack.push({
            node: v,
            path: [...current.path, v],
            minCap: Math.min(current.minCap, res[u][v]),
          });
        }
      }
    }
    return null;
  }

  getS(u: string, res: Record<string, Record<string, number>>, visitedArray: string[]): string[] {
    const visitedSet = new Set(visitedArray);
    const S: string[] = [];
    for (const v of this.nodes) {
      if (res[u][v] > 0 && !visitedSet.has(v)) S.push(v);
    }
    return S;
  }
}
