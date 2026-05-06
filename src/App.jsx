import { useCallback, useState } from 'react';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import Header from './components/Header';
import MindmapCanvas from './components/MindmapCanvas';
import { useTheme } from './hooks/useTheme';
import { useNodeTree } from './hooks/useNodeTree';

function AppInner() {
  const { theme, toggleTheme } = useTheme();
  const {
    tree, addChild, addSibling, updateLabel, deleteNode,
    toggleCollapse, updateShape, updateColor, updatePosition, batchUpdatePositions, resetTree,
    undo, redo, exportJSON,
  } = useNodeTree();
  const { fitView } = useReactFlow();
  
  const [organizeTrigger, setOrganizeTrigger] = useState(0);

  const handleNewMap = useCallback(() => {
    if (window.confirm('Start a new mind map? Current work will be lost.')) {
      resetTree();
    }
  }, [resetTree]);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.15, duration: 400 });
  }, [fitView]);

  const handleOrganize = useCallback(() => {
    setOrganizeTrigger(prev => prev + 1);
  }, []);

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
        onOrganize={handleOrganize}
      />
      <MindmapCanvas
        tree={tree}
        addChild={addChild}
        addSibling={addSibling}
        updateLabel={updateLabel}
        deleteNode={deleteNode}
        toggleCollapse={toggleCollapse}
        updateShape={updateShape}
        updateColor={updateColor}
        updatePosition={updatePosition}
        batchUpdatePositions={batchUpdatePositions}
        organizeTrigger={organizeTrigger}
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
