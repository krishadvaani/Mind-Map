import dagre from 'dagre';

const NODE_DEFAULTS = {
  'root': { width: 160, height: 50 },
  'branch': { width: 140, height: 42 },
  'leaf': { width: 120, height: 36 },
};

function getTier(depth) {
  if (depth === 0) return 'root';
  if (depth <= 2) return 'branch';
  return 'leaf';
}

function getNodeDimensions(shape, tier) {
  const base = NODE_DEFAULTS[tier] || NODE_DEFAULTS.leaf;
  if (shape === 'circle') {
    const size = tier === 'root' ? 110 : tier === 'branch' ? 90 : 72;
    return { width: size, height: size };
  }
  if (shape === 'diamond') {
    const size = tier === 'root' ? 100 : tier === 'branch' ? 80 : 64;
    return { width: size, height: size };
  }
  return base;
}

export function flattenTree(tree) {
  const nodes = [];
  const edges = [];

  function traverse(node, depth, parentId) {
    const tier = getTier(depth);
    const dims = getNodeDimensions(node.shape || 'rounded', tier);

    nodes.push({
      id: node.id,
      type: 'mindNode',
      data: {
        label: node.label,
        shape: node.shape || 'rounded',
        tier,
        depth,
        color: node.color,
        collapsed: node.collapsed,
        hasChildren: node.children && node.children.length > 0,
        savedPosition: node.position,
      },
      position: node.position || { x: 0, y: 0 },
      ...dims,
    });

    if (parentId) {
      edges.push({
        id: `e-${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: 'mindEdge',
      });
    }

    if (!node.collapsed && node.children) {
      node.children.forEach((child) => traverse(child, depth + 1, node.id));
    }
  }

  traverse(tree, 0, null);
  return { nodes, edges };
}

/**
 * Flatten tree into React Flow nodes & edges, then apply dagre layout
 */
export function computeLayout(tree, force = false) {
  const { nodes, edges } = flattenTree(tree);

  // dagre layout
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: 'LR',
    nodesep: 60,
    ranksep: 150,
    marginx: 40,
    marginy: 40,
  });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: node.width || 140, height: node.height || 42 });
  });
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: (!force && node.data.savedPosition) ? node.data.savedPosition : {
        x: pos.x - (node.width || 140) / 2,
        y: pos.y - (node.height || 42) / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
