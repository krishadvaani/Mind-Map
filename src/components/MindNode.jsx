import { memo, useState, useRef, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { ChevronRight, Plus, Zap, Bot, GitMerge, Settings2, Lightbulb } from 'lucide-react';

function MindNode({ id, data, selected }) {
  const { label, shape, tier, collapsed, hasChildren, color, onAddChild, onToggleCollapse, onUpdateLabel } = data;
  const [editing, setEditing] = useState(false);
  const labelRef = useRef(null);

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation();
    setEditing(true);
    setTimeout(() => {
      if (labelRef.current) {
        labelRef.current.focus();
        const sel = window.getSelection();
        sel.selectAllChildren(labelRef.current);
      }
    }, 10);
  }, []);

  const handleBlur = useCallback(() => {
    setEditing(false);
    if (labelRef.current && onUpdateLabel) {
      const text = labelRef.current.textContent.trim();
      if (text && text !== label) {
        onUpdateLabel(id, text);
      } else if (!text) {
        labelRef.current.textContent = label;
      }
    }
  }, [id, label, onUpdateLabel]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      labelRef.current?.blur();
    }
    if (e.key === 'Escape') {
      labelRef.current.textContent = label;
      setEditing(false);
    }
    e.stopPropagation();
  }, [label]);

  const shapeClass = `shape-${shape || 'rounded'}`;
  const tierClass = `tier-${tier}`;
  const isLabelOutside = shape !== 'rounded';

  // Determine icon based on shape
  let Icon = Settings2;
  if (tier === 'root') Icon = Lightbulb;
  else if (shape === 'custom-rounded') Icon = Zap;
  else if (shape === 'rounded') Icon = Bot;
  else if (shape === 'square') Icon = GitMerge;

  const nodeColor = color || 'var(--text-primary)';
  const borderStyle = selected ? { borderColor: '#fff', boxShadow: '0 0 0 1px #fff' } : {};

  return (
    <div className={`node-wrapper ${selected ? 'selected-wrapper' : ''}`}>
      <div
        className={`mind-node ${shapeClass} ${tierClass}`}
        style={borderStyle}
      >
        <Handle type="target" position={Position.Left} />

        <div className="node-inner" style={{ color: nodeColor }}>
          {tier === 'root' && (
            <div className="icon-container" style={{ marginRight: shape === 'rounded' ? 12 : 0, color: 'white' }}>
              <Icon size={shape === 'rounded' ? 20 : 28} strokeWidth={1.5} />
            </div>
          )}

          {shape === 'rounded' && (
            <div className="node-content">
              <div className="node-title">
                {tier === 'root' ? 'Main Idea' : (shape.charAt(0).toUpperCase() + shape.slice(1).replace('-', ' '))}
              </div>
            </div>
          )}
        </div>

        {hasChildren && (
          <button
            className={`collapse-btn ${collapsed ? 'collapsed' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleCollapse?.(id); }}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <ChevronRight size={11} />
          </button>
        )}

        <button
          className="add-child-btn"
          onClick={(e) => { e.stopPropagation(); onAddChild?.(id); }}
          title="Add child node"
        >
          <Plus size={12} />
        </button>

        <Handle type="source" position={Position.Right} />
      </div>

      <div className="node-external-label" onDoubleClick={handleDoubleClick}>
        <span
          ref={labelRef}
          className="node-label"
          contentEditable={editing}
          suppressContentEditableWarning
          onBlur={handleBlur}
          onKeyDown={editing ? handleKeyDown : undefined}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

export default memo(MindNode);
