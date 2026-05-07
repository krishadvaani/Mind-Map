import dagre from 'dagre';

const NODE_DEFAULTS = {
  'root': { width: 220, height: 80 },
  'branch': { width: 200, height: 70 },
  'leaf': { width: 180, height: 60 },
};

function getTier(depth) {
  if (depth === 0) return 'root';
  if (depth <= 1) return 'branch'; // Make 1st level branches larger too
  return 'leaf';
}

function getNodeDimensions(shape, tier) {
  const base = NODE_DEFAULTS[tier] || NODE_DEFAULTS.leaf;
  if (shape === 'circle') {
    const size = tier === 'root' ? 140 : tier === 'branch' ? 120 : 100;
    return { width: size, height: size };
  }
  if (shape === 'diamond') {
    const size = tier === 'root' ? 130 : tier === 'branch' ? 110 : 90;
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
export function computeLayout(tree) {
  const { nodes, edges } = flattenTree(tree);

  // dagre layout
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: 'LR',
    nodesep: 80,
    ranksep: 120,
    marginx: 40,
    marginy: 40,
  });

  const labelAllowance = 35;
  nodes.forEach((node) => {
    g.setNode(node.id, { 
      width: node.width || 140, 
      height: (node.height || 42) + labelAllowance 
    });
  });
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - (node.width || 140) / 2,
        y: pos.y - (node.height || 42) / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
