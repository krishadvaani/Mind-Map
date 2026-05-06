import { useState } from 'react';
import { Network, FilePlus, Download, Undo2, Redo2, Maximize, LayoutList } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header({
  theme,
  onToggleTheme,
  onNewMap,
  onExport,
  onUndo,
  onRedo,
  onFitView,
  onOrganize,
}) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
          <Network size={20} />
          <span>MindMap</span>
        </div>

        <div className="header-divider" />

        <div className="header-actions">
          <button className="header-btn" onClick={onNewMap} title="New Mind Map">
            <FilePlus size={15} />
            <span className="btn-label">New</span>
          </button>
          <button className="header-btn" onClick={onUndo} title="Undo (Ctrl+Z)">
            <Undo2 size={15} />
          </button>
          <button className="header-btn" onClick={onRedo} title="Redo (Ctrl+Shift+Z)">
            <Redo2 size={15} />
          </button>
          <button className="header-btn" onClick={onFitView} title="Fit View">
            <Maximize size={15} />
          </button>
          <button className="header-btn" onClick={onOrganize} title="Auto Organize">
            <LayoutList size={15} />
            <span className="btn-label">Organize</span>
          </button>
        </div>
      </div>

      <div className="header-actions">
        <button className="header-btn" onClick={onExport} title="Export as JSON">
          <Download size={15} />
          <span className="btn-label">Export</span>
        </button>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}
