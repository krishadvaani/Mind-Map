import { useMemo, useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  useNodesState,
  useEdgesState,
  applyNodeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import MindNode from './MindNode';
import MindEdge from './MindEdge';
import NodeContextPanel from './NodeContextPanel';
import FloatingSidebar from './FloatingSidebar';
import DrawnRectNode from './DrawnRectNode';
import { computeLayout, flattenTree } from '../utils/layoutEngine';

const nodeTypes = { mindNode: MindNode, drawnRect: DrawnRectNode };
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
  drawings,
  addDrawing,
  updateDrawings,
  deleteDrawing,
  clearDrawings,
  undo,
  redo,
}) {
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const { fitView, screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Drawing state
  const [activeTool, setActiveTool] = useState('select');
  const [activeColor, setActiveColor] = useState('red');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStartPos, setDrawStartPos] = useState(null);
  const [currentRect, setCurrentRect] = useState(null);

  // Sync tree and drawings to React Flow local state
  useEffect(() => {
    const { nodes: treeNodes, edges: treeEdges } = flattenTree(tree);
    
    const flatMindNodes = treeNodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        onAddChild: addChild,
        onToggleCollapse: toggleCollapse,
        onUpdateLabel: updateLabel,
      }
    }));

    const flatDrawNodes = drawings.map(d => ({
      ...d,
      data: {
        ...d.data,
        onUpdateData: (newData) => {
          updateDrawings(drawings.map(item => item.id === d.id ? { ...item, data: { ...item.data, ...newData } } : item));
        },
        onDeleteDrawing: (id) => deleteDrawing(id),
        onResizeEnd: (id) => {
          // Find the current dimensions from local state
          const resized = nodes.find(n => n.id === id);
          if (resized) {
            updateDrawings(drawings.map(item => item.id === id ? { 
              ...item, 
              position: resized.position, 
              width: resized.width, 
              height: resized.height 
            } : item));
          }
        }
      }
    }));

    setNodes([...flatDrawNodes, ...flatMindNodes]);
    setEdges(treeEdges);
  }, [tree, drawings, addChild, toggleCollapse, updateLabel, deleteDrawing, updateDrawings]);

  // Auto-fit view on tree changes (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      fitView({ padding: 0.1, duration: 300 });
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
    if (node.type === 'mindNode') {
      updatePosition(node.id, node.position);
    } else if (node.type === 'drawnRect') {
      updateDrawings(drawings.map(d => d.id === node.id ? { 
        ...d, 
        position: node.position,
        width: node.width,
        height: node.height
      } : d));
    }
  }, [updatePosition, updateDrawings, drawings]);

  // Handle pointer events for drawing mode
  const handlePointerDown = useCallback((e) => {
    if (activeTool !== 'draw') return;
    // Only start drawing if clicking on the canvas background
    if (!e.target.closest('.react-flow__pane')) return;
    
    e.preventDefault();
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    setIsDrawing(true);
    setDrawStartPos(pos);
    setCurrentRect({
      id: `rect-${Date.now()}`,
      type: 'drawnRect',
      position: pos,
      width: 0,
      height: 0,
      data: { 
        color: activeColor,
        title: activeColor === 'red' ? 'Critical Area' : 'Growth Region',
        description: 'Double-click to edit this description...'
      },
      zIndex: -1,
      selectable: true,
      draggable: true
    });
  }, [activeTool, activeColor, screenToFlowPosition]);

  const handlePointerMove = useCallback((e) => {
    if (!isDrawing || !currentRect || !drawStartPos) return;
    const currentPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    
    const width = Math.abs(currentPos.x - drawStartPos.x);
    const height = Math.abs(currentPos.y - drawStartPos.y);
    const x = Math.min(drawStartPos.x, currentPos.x);
    const y = Math.min(drawStartPos.y, currentPos.y);
    
    setCurrentRect(prev => ({
      ...prev,
      position: { x, y },
      width,
      height
    }));
  }, [isDrawing, currentRect, drawStartPos, screenToFlowPosition]);

  const handlePointerUp = useCallback(() => {
    if (isDrawing && currentRect) {
      if ((currentRect.width || 0) > 10 && (currentRect.height || 0) > 10) {
        addDrawing(currentRect);
        setActiveTool('select');
      }
    }
    setIsDrawing(false);
    setCurrentRect(null);
    setDrawStartPos(null);
  }, [isDrawing, currentRect, setActiveTool, addDrawing]);

  const allNodesCombined = useMemo(() => {
    return currentRect ? [...nodes, currentRect] : nodes;
  }, [nodes, currentRect]);

  // Live UI updates (no history push)
  const onNodesChangeCombined = useCallback((changes) => {
    onNodesChange(changes);
  }, [onNodesChange]);

  // Get selected node data for context panel
  const selectedNode = selectedNodeId ? findInTree(tree, selectedNodeId) : null;

  return (
    <div 
      className={`canvas-wrapper ${activeTool === 'draw' ? 'draw-mode' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <ReactFlow
        nodes={allNodesCombined}
        edges={edges}
        onNodesChange={onNodesChangeCombined}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.15}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={activeTool === 'select'}
        selectNodesOnDrag={false}
        panOnDrag={activeTool === 'select'}
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

      <FloatingSidebar 
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        activeColor={activeColor}
        setActiveColor={setActiveColor}
        onClearDrawings={clearDrawings}
      />
    </div>
  );
}
