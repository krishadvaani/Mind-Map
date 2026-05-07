import { useState, useCallback, useRef } from 'react';
import defaultData from '../data/defaultData';

const STORAGE_KEY = 'mindmap-data';

let idCounter = Date.now();
function genId() {
  return `node-${idCounter++}`;
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      // Migration: if saved data is just the tree, wrap it
      if (data.id && data.label) {
        return { tree: data, drawings: [] };
      }
      return data;
    }
  } catch {}
  return { tree: deepClone(defaultData), drawings: [] };
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

// Find node and its parent in tree
function findNode(tree, id, parent = null) {
  if (tree.id === id) return { node: tree, parent };
  if (tree.children) {
    for (const child of tree.children) {
      const result = findNode(child, id, tree);
      if (result) return result;
    }
  }
  return null;
}

export function useNodeTree() {
  const [data, setData] = useState(loadData);
  const historyRef = useRef([JSON.stringify(loadData())]);
  const historyIdxRef = useRef(0);

  const tree = data.tree;
  const drawings = data.drawings;

  const pushHistory = useCallback((newTree) => {
    const json = JSON.stringify(newTree);
    const idx = historyIdxRef.current;
    historyRef.current = historyRef.current.slice(0, idx + 1);
    historyRef.current.push(json);
    if (historyRef.current.length > 50) historyRef.current.shift();
    historyIdxRef.current = historyRef.current.length - 1;
  }, []);

  const dataRef = useRef(data);
  dataRef.current = data;

  const update = useCallback((updater) => {
    const next = deepClone(dataRef.current);
    updater(next);
    saveData(next);
    pushHistory(next);
    setData(next);
  }, [pushHistory]);

  const updateTree = useCallback((treeUpdater) => {
    update((d) => treeUpdater(d.tree));
  }, [update]);

  const addChild = useCallback((parentId, label = 'New Node') => {
    updateTree((t) => {
      const result = findNode(t, parentId);
      if (result) {
        if (!result.node.children) result.node.children = [];
        result.node.children.push({
          id: genId(),
          label,
          shape: 'rounded',
          color: null,
          collapsed: false,
          children: [],
        });
        result.node.collapsed = false;
      }
    });
  }, [updateTree]);

  const addSibling = useCallback((nodeId, label = 'New Node') => {
    updateTree((t) => {
      const result = findNode(t, nodeId);
      if (result && result.parent) {
        const idx = result.parent.children.findIndex((c) => c.id === nodeId);
        result.parent.children.splice(idx + 1, 0, {
          id: genId(),
          label,
          shape: result.node.shape || 'rounded',
          color: null,
          collapsed: false,
          children: [],
        });
      }
    });
  }, [updateTree]);

  const updateLabel = useCallback((nodeId, newLabel) => {
    updateTree((t) => {
      const result = findNode(t, nodeId);
      if (result) result.node.label = newLabel;
    });
  }, [updateTree]);

  const deleteNode = useCallback((nodeId) => {
    updateTree((t) => {
      if (t.id === nodeId) {
        t.label = 'Main Idea';
        t.children = [];
        return;
      }
      const result = findNode(t, nodeId);
      if (result && result.parent) {
        result.parent.children = result.parent.children.filter((c) => c.id !== nodeId);
      }
    });
  }, [updateTree]);

  const toggleCollapse = useCallback((nodeId) => {
    updateTree((t) => {
      const result = findNode(t, nodeId);
      if (result) result.node.collapsed = !result.node.collapsed;
    });
  }, [updateTree]);

  const updateShape = useCallback((nodeId, shape) => {
    updateTree((t) => {
      const result = findNode(t, nodeId);
      if (result) result.node.shape = shape;
    });
  }, [updateTree]);

  const updateColor = useCallback((nodeId, color) => {
    updateTree((t) => {
      const result = findNode(t, nodeId);
      if (result) result.node.color = color;
    });
  }, [updateTree]);

  const updatePosition = useCallback((nodeId, position) => {
    updateTree((t) => {
      const result = findNode(t, nodeId);
      if (result) result.node.position = position;
    });
  }, [updateTree]);

  // Drawing persistence methods
  const addDrawing = useCallback((drawing) => {
    update((d) => {
      d.drawings.push(drawing);
    });
  }, [update]);

  const updateDrawings = useCallback((newDrawings) => {
    update((d) => {
      d.drawings = newDrawings;
    });
  }, [update]);

  const clearDrawings = useCallback(() => {
    update((d) => {
      d.drawings = [];
    });
  }, [update]);

  const deleteDrawing = useCallback((id) => {
    update((d) => {
      d.drawings = d.drawings.filter((dw) => dw.id !== id);
    });
  }, [update]);

  const resetTree = useCallback(() => {
    const fresh = { tree: deepClone(defaultData), drawings: [] };
    saveData(fresh);
    pushHistory(fresh);
    setData(fresh);
  }, [pushHistory]);

  const undo = useCallback(() => {
    if (historyIdxRef.current > 0) {
      historyIdxRef.current--;
      const prev = JSON.parse(historyRef.current[historyIdxRef.current]);
      saveData(prev);
      setData(prev);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIdxRef.current < historyRef.current.length - 1) {
      historyIdxRef.current++;
      const next = JSON.parse(historyRef.current[historyIdxRef.current]);
      saveData(next);
      setData(next);
    }
  }, []);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindmap.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  return {
    tree,
    drawings,
    addChild,
    addSibling,
    updateLabel,
    deleteNode,
    toggleCollapse,
    updateShape,
    updateColor,
    updatePosition,
    addDrawing,
    updateDrawings,
    deleteDrawing,
    clearDrawings,
    resetTree,
    undo,
    redo,
    exportJSON,
  };
}
