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

function loadTree() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return deepClone(defaultData);
}

function saveTree(tree) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tree)); } catch {}
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
  const [tree, setTree] = useState(loadTree);
  const historyRef = useRef([JSON.stringify(loadTree())]);
  const historyIdxRef = useRef(0);

  const pushHistory = useCallback((newTree) => {
    const json = JSON.stringify(newTree);
    const idx = historyIdxRef.current;
    historyRef.current = historyRef.current.slice(0, idx + 1);
    historyRef.current.push(json);
    if (historyRef.current.length > 50) historyRef.current.shift();
    historyIdxRef.current = historyRef.current.length - 1;
  }, []);

  const update = useCallback((updater) => {
    setTree((prev) => {
      const clone = deepClone(prev);
      updater(clone);
      saveTree(clone);
      pushHistory(clone);
      return clone;
    });
  }, [pushHistory]);

  const addChild = useCallback((parentId, label = 'New Node') => {
    update((t) => {
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
  }, [update]);

  const addSibling = useCallback((nodeId, label = 'New Node') => {
    update((t) => {
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
  }, [update]);

  const updateLabel = useCallback((nodeId, newLabel) => {
    update((t) => {
      const result = findNode(t, nodeId);
      if (result) result.node.label = newLabel;
    });
  }, [update]);

  const deleteNode = useCallback((nodeId) => {
    update((t) => {
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
  }, [update]);

  const toggleCollapse = useCallback((nodeId) => {
    update((t) => {
      const result = findNode(t, nodeId);
      if (result) result.node.collapsed = !result.node.collapsed;
    });
  }, [update]);

  const updateShape = useCallback((nodeId, shape) => {
    update((t) => {
      const result = findNode(t, nodeId);
      if (result) result.node.shape = shape;
    });
  }, [update]);

  const updateColor = useCallback((nodeId, color) => {
    update((t) => {
      const result = findNode(t, nodeId);
      if (result) result.node.color = color;
    });
  }, [update]);

  const updatePosition = useCallback((nodeId, position) => {
    update((t) => {
      const result = findNode(t, nodeId);
      if (result) result.node.position = position;
    });
  }, [update]);

  const batchUpdatePositions = useCallback((updates) => {
    update((t) => {
      updates.forEach(({ id, position }) => {
        const result = findNode(t, id);
        if (result) result.node.position = position;
      });
    });
  }, [update]);

  const resetTree = useCallback(() => {
    const fresh = deepClone(defaultData);
    saveTree(fresh);
    pushHistory(fresh);
    setTree(fresh);
  }, [pushHistory]);

  const undo = useCallback(() => {
    if (historyIdxRef.current > 0) {
      historyIdxRef.current--;
      const prev = JSON.parse(historyRef.current[historyIdxRef.current]);
      saveTree(prev);
      setTree(prev);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIdxRef.current < historyRef.current.length - 1) {
      historyIdxRef.current++;
      const next = JSON.parse(historyRef.current[historyIdxRef.current]);
      saveTree(next);
      setTree(next);
    }
  }, []);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(tree, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindmap.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [tree]);

  return {
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
    resetTree,
    undo,
    redo,
    exportJSON,
  };
}
