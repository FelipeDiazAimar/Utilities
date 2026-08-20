import { describe, it, expect, beforeEach } from 'vitest';
import { useGraphStore } from './graphStore';

beforeEach(() => {
  useGraphStore.getState().clearAll();
  useGraphStore.setState({ mode: 'mst', objective: 'min' });
});

describe('useGraphStore', () => {
  it('adds and removes nodes', () => {
    useGraphStore.getState().addNode({ id: '1', x: 0, y: 0 });
    expect(useGraphStore.getState().nodes).toHaveLength(1);
    useGraphStore.getState().removeNode('1');
    expect(useGraphStore.getState().nodes).toHaveLength(0);
  });

  it('adds, updates and removes edges', () => {
    useGraphStore.getState().addEdge({ id: '1-2', from: '1', to: '2', valueProp: 10, valueRev: 0 });
    expect(useGraphStore.getState().edges).toHaveLength(1);

    useGraphStore.getState().updateEdge('1-2', { valueProp: 20 });
    expect(useGraphStore.getState().edges[0].valueProp).toBe(20);

    useGraphStore.getState().removeEdge('1-2');
    expect(useGraphStore.getState().edges).toHaveLength(0);
  });

  it('clearAll resets nodes, edges and selections', () => {
    useGraphStore.getState().addNode({ id: '1', x: 0, y: 0 });
    useGraphStore.getState().setSourceSink('1', '2');
    useGraphStore.getState().clearAll();
    const s = useGraphStore.getState();
    expect(s.nodes).toHaveLength(0);
    expect(s.sourceNode).toBeNull();
    expect(s.sinkNode).toBeNull();
  });

  it('loadSnapshot replaces state wholesale', () => {
    useGraphStore.getState().loadSnapshot({
      mode: 'maxflow',
      nodes: [{ id: 'A', x: 1, y: 1 }],
      edges: [],
    });
    const s = useGraphStore.getState();
    expect(s.mode).toBe('maxflow');
    expect(s.nodes).toEqual([{ id: 'A', x: 1, y: 1 }]);
  });
});
