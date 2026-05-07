import { useCallback, useState } from 'react';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import Header from './components/Header';
import MindmapCanvas from './components/MindmapCanvas';
import { useTheme } from './hooks/useTheme';
import { useNodeTree } from './hooks/useNodeTree';

function AppInner() {
  const { theme, toggleTheme } = useTheme();
  const {
    tree, drawings, addChild, addSibling, updateLabel, deleteNode,
    toggleCollapse, updateShape, updateColor, updatePosition, 
    addDrawing, updateDrawings, deleteDrawing, clearDrawings, resetTree,
    undo, redo, exportJSON,
  } = useNodeTree();
  const { fitView } = useReactFlow();

  const handleNewMap = useCallback(() => {
    if (window.confirm('Start a new mind map? Current work will be lost.')) {
      resetTree();
    }
  }, [resetTree]);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.15, duration: 400 });
  }, [fitView]);

  return (
    <div className="app-container">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onNewMap={handleNewMap}
        onExport={exportJSON}
        onUndo={undo}
        onRedo={redo}
        onFitView={handleFitView}
      />
      <MindmapCanvas
        tree={tree}
        drawings={drawings}
        addChild={addChild}
        addSibling={addSibling}
        updateLabel={updateLabel}
        deleteNode={deleteNode}
        toggleCollapse={toggleCollapse}
        updateShape={updateShape}
        updateColor={updateColor}
        updatePosition={updatePosition}
        addDrawing={addDrawing}
        updateDrawings={updateDrawings}
        deleteDrawing={deleteDrawing}
        clearDrawings={clearDrawings}
        undo={undo}
        redo={redo}
      />
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <AppInner />
    </ReactFlowProvider>
  );
}
