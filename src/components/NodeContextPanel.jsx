import {
  Plus, GitBranchPlus, Trash2, Circle, Diamond, RectangleHorizontal, SquareRoundCorner,
} from 'lucide-react';

const NODE_COLORS = [
  null,
  '#ff4d4d', '#ff6e40', '#e11d73', '#8a2be2', '#6366f1',
  '#3182ce', '#38a169', '#d69e2e', '#e53e3e', '#1a202c',
];

const SHAPES = [
  { id: 'circle', label: 'Circle', cls: 'circle' },
  { id: 'custom-rounded', label: 'Trigger', cls: 'custom-rounded' },
  { id: 'rounded', label: 'Rectangle', cls: 'rounded' },
  { id: 'square', label: 'Square', cls: 'square' },
];

export default function NodeContextPanel({
  selectedNodeId,
  onAddChild,
  onAddSibling,
  onDelete,
  onShapeChange,
  onColorChange,
  currentShape,
  currentColor,
}) {
  if (!selectedNodeId) return null;

  return (
    <div className="context-panel">
      <button className="ctx-btn" onClick={() => onAddChild(selectedNodeId)} title="Add child (Tab)">
        <Plus size={14} />
        <span>Child</span>
      </button>
      <button className="ctx-btn" onClick={() => onAddSibling(selectedNodeId)} title="Add sibling (Enter)">
        <GitBranchPlus size={14} />
        <span>Sibling</span>
      </button>

      <div className="ctx-divider" />

      {SHAPES.map((s) => (
        <button
          key={s.id}
          className={`ctx-btn ${currentShape === s.id ? 'active' : ''}`}
          onClick={() => onShapeChange(selectedNodeId, s.id)}
          title={s.label}
          style={currentShape === s.id ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' } : {}}
        >
          <div className={`shape-preview ${s.cls}`} style={currentShape === s.id ? { borderColor: '#fff' } : {}} />
        </button>
      ))}

      <div className="ctx-divider" />

      {NODE_COLORS.map((c, i) => (
        <div
          key={i}
          className={`color-dot ${currentColor === c ? 'active' : ''}`}
          style={{ background: c || 'var(--node-branch-bg)', border: c === null ? '2px dashed var(--text-secondary)' : undefined }}
          onClick={() => onColorChange(selectedNodeId, c)}
          title={c ? c : 'Default'}
        />
      ))}

      <div className="ctx-divider" />

      <button className="ctx-btn danger" onClick={() => onDelete(selectedNodeId)} title="Delete (Del)">
        <Trash2 size={14} />
      </button>
    </div>
  );
}
