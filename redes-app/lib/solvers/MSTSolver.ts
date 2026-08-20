export interface MSTEdge {
  from: string;
  to: string;
  value: number;
}

export interface MSTStep {
  iteration: number;
  selectedNodes: string[];
  edgesInTree: MSTEdge[];
  currentEdge: MSTEdge | null;
  totalCost: number;
  description: string;
  tableHTML: string;
}

export class MSTSolver {
  nodes: string[];
  edges: MSTEdge[];
  steps: MSTStep[] = [];

  constructor(nodes: string[], edges: MSTEdge[]) {
    this.nodes = nodes;
    this.edges = edges;
  }

  solve(): MSTStep[] {
    if (this.nodes.length === 0) return [];
    this.steps = [];

    const C = new Set<string>();
    const C_prime = new Set<string>(this.nodes);
    const treeEdges: MSTEdge[] = [];
    let totalCost = 0;

    const i = this.nodes[0];
    C.add(i);
    C_prime.delete(i);

    let iter = 1;
    let stepText = `**Paso 1:** Comenzamos en el nodo ${i}. C={${Array.from(C).join(',')}}, C'={${Array.from(C_prime).join(',')}}\n`;

    const minEdge = this.getMinEdge(C, C_prime);
    if (minEdge) {
      const j = minEdge.from === i ? minEdge.to : minEdge.from;
      C.add(j);
      C_prime.delete(j);
      treeEdges.push(minEdge);
      totalCost += minEdge.value;

      stepText += `Unimos ${i} con el nodo más cercano ${j}. El arco (${minEdge.from},${minEdge.to}) estará en el MST.\n`;
      stepText += `C={${Array.from(C).join(',')}}, C'={${Array.from(C_prime).join(',')}}`;

      const step: MSTStep = {
        iteration: iter,
        selectedNodes: Array.from(C),
        edgesInTree: [...treeEdges],
        currentEdge: minEdge,
        totalCost,
        description: stepText,
        tableHTML: '',
      };
      this.steps.push(step);
      step.tableHTML = this.generateTableHTML(this.steps);
    } else {
      return this.steps; // Grafo disconexo
    }

    while (C_prime.size > 0) {
      iter++;
      const nextEdge = this.getMinEdge(C, C_prime);
      if (!nextEdge) break;

      const n = C.has(nextEdge.from) ? nextEdge.to : nextEdge.from;
      const m = C.has(nextEdge.from) ? nextEdge.from : nextEdge.to;

      C.add(n);
      C_prime.delete(n);
      treeEdges.push(nextEdge);
      totalCost += nextEdge.value;

      let desc = `**Paso 2 (${iter - 1}):** De C' elijo el ${n} (n). El nodo en C más cercano es ${m} (m).\n`;
      desc += `(m,n)=(${nextEdge.from},${nextEdge.to}), C={${Array.from(C).join(',')}} C'={${Array.from(C_prime).join(',')}}\n`;
      desc += `**Paso 3:** Repetir.`;

      const step: MSTStep = {
        iteration: iter,
        selectedNodes: Array.from(C),
        edgesInTree: [...treeEdges],
        currentEdge: nextEdge,
        totalCost,
        description: desc,
        tableHTML: '',
      };
      this.steps.push(step);
      step.tableHTML = this.generateTableHTML(this.steps);
    }

    let finalDesc =
      `**Conclusión:** el árbol de expansión mínima consta de los arcos: ` +
      treeEdges.map((e) => `(${e.from},${e.to})`).join(', ') +
      `.\n`;
    finalDesc +=
      `La longitud del árbol de expansión mínima es de: ` +
      treeEdges.map((e) => e.value).join(' + ') +
      ` = **${totalCost}**.\n`;
    if (C_prime.size > 0) {
      finalDesc += `\n**ADVERTENCIA:** El grafo está desconectado. Los siguientes nodos no se pudieron alcanzar: ${Array.from(C_prime).join(',')}`;
    }

    this.steps.push({
      iteration: iter + 1,
      selectedNodes: Array.from(C),
      edgesInTree: [...treeEdges],
      currentEdge: null,
      totalCost,
      description: finalDesc,
      tableHTML: '',
    });

    return this.steps;
  }

  getMinEdge(C: Set<string>, C_prime: Set<string>): MSTEdge | null {
    let minVal = Infinity;
    let minEdge: MSTEdge | null = null;
    for (const e of this.edges) {
      const hasFrom = C.has(e.from);
      const hasTo = C.has(e.to);
      const primeHasFrom = C_prime.has(e.from);
      const primeHasTo = C_prime.has(e.to);

      if ((hasFrom && primeHasTo) || (hasTo && primeHasFrom)) {
        if (e.value < minVal) {
          minVal = e.value;
          minEdge = e;
        }
      }
    }
    return minEdge;
  }

  generateTableHTML(stepsSoFar: MSTStep[]): string {
    let iterRow = `<tr><th>Iteración</th>`;
    let nodeRow = `<tr><td><b>Nodo seleccionado</b></td>`;

    const firstNode = stepsSoFar[0].selectedNodes[0];
    iterRow += `<th>Inicio</th>`;
    nodeRow += `<td>${firstNode}</td>`;

    for (let i = 0; i < stepsSoFar.length; i++) {
      iterRow += `<th>${i + 1}</th>`;
      const nodes = stepsSoFar[i].selectedNodes;
      nodeRow += `<td>${nodes[nodes.length - 1]}</td>`;
    }
    iterRow += `</tr>`;
    nodeRow += `</tr>`;

    const topTable = `<table>${iterRow}${nodeRow}</table>`;

    let bottomTable = `<table>
      <tr><th>Arco elegido</th><th>Valor acumulado</th><th>Arcos del árbol</th></tr>
      <tr><td>-</td><td>-</td><td>-</td></tr>`;

    for (let i = 0; i < stepsSoFar.length; i++) {
      const edge = stepsSoFar[i].currentEdge!;
      const cost = stepsSoFar[i].totalCost;
      const count = i + 1;
      bottomTable += `<tr><td>(${edge.from},${edge.to})</td><td>${cost}</td><td>${count}</td></tr>`;
    }
    bottomTable += `</table>`;

    return topTable + `<br>` + bottomTable;
  }
}
