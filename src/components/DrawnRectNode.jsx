import { memo } from 'react';
import { X } from 'lucide-react';
import { NodeResizer } from '@xyflow/react';

function DrawnRectNode({ data, id, selected, width, height }) {
  const { color, title, description, onUpdateData, onDeleteDrawing, onResizeEnd } = data;
  
  // Calculate dynamic sizes based on rectangle dimensions
  const minDim = Math.min(width || 200, height || 200);
  const btnSize = Math.max(24, Math.min(80, minDim * 0.15));
  const iconSize = btnSize * 0.6;
  
  return (
    <div
      className="drawn-rect-node"
      style={{
        width: '100%',
        height: '100%',
        border: `2px dashed ${color === 'red' ? '#ef4444' : '#22c55e'}`,
        backgroundColor: color === 'red' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        color: 'white',
        boxSizing: 'border-box',
        overflow: 'hidden',
        pointerEvents: 'auto',
        position: 'relative',
      }}
    >
      <NodeResizer 
        color={color === 'red' ? '#ef4444' : '#22c55e'} 
        isVisible={selected} 
        minWidth={100} 
        minHeight={100} 
        onResizeEnd={() => onResizeEnd(id)}
      />
      
      <button
        className="delete-rect-btn nodrag"
        onClick={() => onDeleteDrawing(id)}
        style={{
          position: 'absolute',
          top: `${btnSize * 0.3}px`,
          right: `${btnSize * 0.3}px`,
          background: 'rgba(0,0,0,0.6)',
          border: 'none',
          borderRadius: '50%',
          width: `${btnSize}px`,
          height: `${btnSize}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'white',
          opacity: 0,
          transition: 'all 0.2s',
          zIndex: 10,
        }}
      >
        <X size={iconSize} />
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        .drawn-rect-node:hover .delete-rect-btn {
          opacity: 1 !important;
        }
        .delete-rect-btn:hover {
          background: rgba(255,0,0,0.6) !important;
        }
      `}} />

      <div
        className="nodrag"
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onUpdateData({ title: e.target.innerText })}
        style={{
          fontWeight: '900',
          fontSize: '32px',
          outline: 'none',
          opacity: 0.95,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          letterSpacing: '-0.02em',
          cursor: 'text',
          marginRight: '20px', // Space for delete button
        }}
      >
        {title || 'Region Title'}
      </div>
      <div
        className="nodrag"
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onUpdateData({ description: e.target.innerText })}
        style={{
          fontSize: '20px',
          outline: 'none',
          opacity: 0.8,
          lineHeight: '1.4',
          fontWeight: '500',
          cursor: 'text',
        }}
      >
        {description || 'Add a description here...'}
      </div>
    </div>
  );
}

export default memo(DrawnRectNode);
