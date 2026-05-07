import { Hand, BoxSelect, Pencil, Image, Trash2 } from 'lucide-react';
import { memo } from 'react';

const FloatingSidebar = ({ activeTool, setActiveTool, activeColor, setActiveColor, onClearDrawings }) => {
  return (
    <div className="floating-sidebar-wrapper" style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '12px', alignItems: 'center' }}>
      {activeTool === 'draw' && (
        <div className="color-picker-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(24, 26, 38, 0.92)', padding: '8px', borderRadius: '8px', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button 
            className={`color-btn ${activeColor === 'red' ? 'active' : ''}`}
            onClick={() => setActiveColor('red')}
            style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#ef4444', border: activeColor === 'red' ? '2px solid white' : '2px solid transparent', cursor: 'pointer' }}
            title="Red"
          />
          <button 
            className={`color-btn ${activeColor === 'green' ? 'active' : ''}`}
            onClick={() => setActiveColor('green')}
            style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#22c55e', border: activeColor === 'green' ? '2px solid white' : '2px solid transparent', cursor: 'pointer' }}
            title="Green"
          />
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
          <button 
            className="sidebar-btn" 
            onClick={onClearDrawings}
            style={{ width: '24px', height: '24px', padding: 0, color: '#ff4444' }}
            title="Clear all drawings"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
      <div className="floating-sidebar" style={{ position: 'relative', right: 0, top: 0, transform: 'none' }}>
        <div className="sidebar-group">
          <button 
            className={`sidebar-btn ${activeTool === 'select' ? 'active' : ''}`} 
            onClick={() => setActiveTool('select')}
            title="Panning"
          >
            <Hand size={18} />
          </button>
          <button 
            className={`sidebar-btn ${activeTool === 'draw' ? 'active' : ''}`} 
            onClick={() => setActiveTool('draw')}
            title="Dotted Rectangle"
          >
            <BoxSelect size={18} />
          </button>
          <button className="sidebar-btn" title="Draw">
            <Pencil size={18} />
          </button>
          <button className="sidebar-btn" title="Images">
            <Image size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(FloatingSidebar);
