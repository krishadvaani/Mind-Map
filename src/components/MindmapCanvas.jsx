import { useMemo, useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import MindNode from './MindNode';
import MindEdge from './MindEdge';
import NodeContextPanel from './NodeContextPanel';
import FloatingSidebar from './FloatingSidebar';
import { computeLayout, flattenTree } from '../utils/layoutEngine';

const nodeTypes = { mindNode: MindNode };
const edgeTypes = { mindEdge: MindEdge };

// Find a node's data in the tree by id
function findInTree(tree, id) {
  if (tree.id === id) return tree;
  if (tree.children) {
    for (const child of tree.children) {
      const r = findInTree(child, id);
      if (r) return r;
    }
  }
  return null;
}

export default function MindmapCanvas({
  tree,
  addChild,
  addSibling,
  updateLabel,
  deleteNode,
  toggleCollapse,
  updateShape,
  updateColor,
  updatePosition,
  batchUpdatePositions,
  organizeTrigger,
  undo,
  redo,
}) {
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const { fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Handle organize action
  useEffect(() => {
    if (organizeTrigger > 0) {
      const layout = computeLayout(tree, true); // force=true
      setNodes((currentNodes) =>
        layout.nodes.map((n) => ({
          ...n,
          data: {
            ...n.data,
            onAddChild: addChild,
            onToggleCollapse: toggleCollapse,
            onUpdateLabel: updateLabel,
          },
        }))
      );
      // Ensure positions are updated in the central tree state too in one batch
      if (batchUpdatePositions) {
        const updates = layout.nodes.map((n) => ({ id: n.id, position: n.position }));
        batchUpdatePositions(updates);
      }
      setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 50);
    }
  }, [organizeTrigger]);

  // Sync tree layout to React Flow local state
  useEffect(() => {
    const { nodes: flatNodes, edges: flatEdges } = flattenTree(tree);

    setNodes((currentNodes) => {
      // If we have no nodes (initial load), compute layout
      if (currentNodes.length === 0) {
        const layout = computeLayout(tree);
        return layout.nodes.map((n) => ({
          ...n,
          data: {
            ...n.data,
            onAddChild: addChild,
            onToggleCollapse: toggleCollapse,
            onUpdateLabel: updateLabel,
          },
        }));
      }

      // On updates, maintain existing positions
      return flatNodes.map((fn) => {
        const existing = currentNodes.find((cn) => cn.id === fn.id);
        
        // Setup data with callbacks
        const newData = {
          ...fn.data,
          onAddChild: addChild,
          onToggleCollapse: toggleCollapse,
          onUpdateLabel: updateLabel,
        };

        if (existing) {
          return {
            ...fn,
            position: existing.position,
            data: newData,
          };
        } else {
          // New node: place relative to parent
          const edge = flatEdges.find((e) => e.target === fn.id);
          const parentId = edge ? edge.source : null;
          const parentNode = currentNodes.find((cn) => cn.id === parentId);

          let position = { x: 0, y: 0 };
          if (parentNode) {
            position = {
              x: parentNode.position.x + (parentNode.width || 140) + 60,
              y: parentNode.position.y + (Math.random() * 40 - 20),
            };
          }
          return {
            ...fn,
            position,
            data: newData,
          };
        }
      });
    });

    setEdges(flatEdges);
  }, [tree, addChild, toggleCollapse, updateLabel, setNodes, setEdges]);

  // Auto-fit view on tree changes (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      fitView({ padding: 0.15, duration: 300 });
    }, 50);
    return () => clearTimeout(timeout);
  }, [nodes.length, fitView]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      // Don't capture if editing text
      if (e.target.contentEditable === 'true' || e.target.tagName === 'INPUT') return;

      if (e.key === 'Delete' && selectedNodeId) {
        deleteNode(selectedNodeId);
        setSelectedNodeId(null);
      }
      if (e.key === 'Tab' && selectedNodeId) {
        e.preventDefault();
        addChild(selectedNodeId);
      }
      if (e.key === 'Enter' && selectedNodeId) {
        e.preventDefault();
        addSibling(selectedNodeId);
      }
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, deleteNode, addChild, addSibling, undo, redo]);

  const onNodeClick = useCallback((_, node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const onNodeDragStop = useCallback((event, node) => {
    if (updatePosition) {
      updatePosition(node.id, node.position);
    }
  }, [updatePosition]);

  // Get selected node data for context panel
  const selectedNode = selectedNodeId ? findInTree(tree, selectedNodeId) : null;

  return (
    <div className="canvas-wrapper">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.15}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        selectNodesOnDrag={false}
      >
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <defs>
            <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffb347" />
              <stop offset="100%" stopColor="#993300" />
            </linearGradient>
          </defs>
        </svg>
        <Background variant="dots" gap={20} size={4} color="var(--canvas-dots)" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => {
            if (n.data?.tier === 'root') return 'var(--accent)';
            if (n.data?.color) return n.data.color;
            return 'var(--minimap-node)';
          }}
          maskColor="rgba(0,0,0,0.15)"
          pannable
          zoomable
        />
      </ReactFlow>

      <NodeContextPanel
        selectedNodeId={selectedNodeId}
        onAddChild={addChild}
        onAddSibling={addSibling}
        onDelete={(id) => { deleteNode(id); setSelectedNodeId(null); }}
        onShapeChange={updateShape}
        onColorChange={updateColor}
        currentShape={selectedNode?.shape || 'rounded'}
        currentColor={selectedNode?.color}
      />

      <FloatingSidebar />
    </div>
  );
}
