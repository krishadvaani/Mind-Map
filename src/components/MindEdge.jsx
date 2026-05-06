import { memo } from 'react';
import { getBezierPath } from '@xyflow/react';

function MindEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {} }) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.35,
  });

  return (
    <g className="react-flow__edge">
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Wider invisible path for easier hover/click */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        style={{ cursor: 'pointer' }}
      />
    </g>
  );
}

export default memo(MindEdge);
