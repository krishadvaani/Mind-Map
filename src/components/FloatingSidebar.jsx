import { MousePointer2, Square, Pencil, Image } from 'lucide-react';
import { memo } from 'react';

const FloatingSidebar = () => {
  return (
    <div className="floating-sidebar">
      <div className="sidebar-group">
        <button className="sidebar-btn active" title="Select">
          <MousePointer2 size={18} />
        </button>
        <button className="sidebar-btn" title="Selection">
          <Square size={18} />
        </button>
        <button className="sidebar-btn" title="Draw">
          <Pencil size={18} />
        </button>
        <button className="sidebar-btn" title="Images">
          <Image size={18} />
        </button>
      </div>
    </div>
  );
};

export default memo(FloatingSidebar);
