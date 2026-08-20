# Modelos de Redes — Optimización

App Next.js para resolver, paso a paso, los tres modelos de redes de
Investigación Operativa: Árbol de Mínima Expansión (MST), Flujo Máximo y
Ruta Más Corta (algoritmo de etiquetado, con objetivo Minimizar / Maximizar
/ Maximizar Probabilidad).

Migrado desde `../solver.html` (una calculadora de una sola página en HTML/JS
plano), que se mantiene en el repo como referencia.

## Desarrollo

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Tests

```bash
npm test
```

Corre los tests unitarios de los tres solvers (`lib/solvers/*.test.ts`),
verificados contra los mismos ejemplos numéricos de `solver.html` (MST:
costo total 9; Flujo Máximo: flujo total 60; Ruta Más Corta: 1→3→4→2 = 55).

## Build de producción

```bash
npm run build
npm run start
```

## Deploy en Vercel

1. Subí este directorio (`redes-app/`) a un repositorio de GitHub.
2. En [vercel.com/new](https://vercel.com/new), importá el repositorio.
3. Vercel detecta Next.js automáticamente — no requiere configuración
   adicional. Framework Preset: **Next.js**. Si el repo incluye también el
   resto de la carpeta de la materia, configurá Root Directory: `redes-app`.
4. Deploy.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 (config CSS-first vía `@theme` en `app/globals.css`)
- Zustand (`persist` → `localStorage`) para el estado del grafo
- vis-network para la visualización/edición interactiva del grafo
- Framer Motion para las transiciones del panel de resolución
- Vitest + Testing Library para los tests
