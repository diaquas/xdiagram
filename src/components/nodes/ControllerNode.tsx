import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Controller } from '../../types/diagram';

interface ControllerNodeData {
  controller: Controller;
}

export const ControllerNode = memo(({ data }: NodeProps<ControllerNodeData>) => {
  const { controller } = data;
  const [expanded, setExpanded] = useState(false);

  // For controllers with many ports, show compact summary
  const shouldShowCompact = controller.ports.length > 8;
  const portsToShow = expanded || !shouldShowCompact ? controller.ports : controller.ports.slice(0, 4);

  // Calculate total pixels capacity
  const totalMaxPixels = controller.ports.reduce((sum, port) => sum + port.maxPixels, 0);
  const totalCurrentPixels = controller.ports.reduce((sum, port) => sum + port.currentPixels, 0);

  return (
    <div
      style={{
        padding: '10px',
        border: '2px solid #4A90E2',
        borderRadius: '8px',
        background: '#E8F4FD',
        minWidth: '200px',
        maxWidth: '280px',
      }}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />

      <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#2C5282' }}>
        {controller.name}
      </div>
      <div style={{ fontSize: '11px', color: '#4A5568', marginBottom: '8px' }}>
        {controller.type}
      </div>

      {controller.ports.length > 0 && (
        <div style={{ fontSize: '11px' }}>
          {/* Summary header for controllers with many ports */}
          {shouldShowCompact && (
            <div
              style={{
                padding: '6px',
                marginBottom: '4px',
                background: '#2C5282',
                color: 'white',
                borderRadius: '4px',
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              {controller.ports.length} Ports • {totalCurrentPixels}/{totalMaxPixels} px
            </div>
          )}

          {/* Port list */}
          {portsToShow.map((port) => (
            <div
              key={port.id}
              style={{
                padding: '4px',
                margin: '2px 0',
                background: 'white',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '10px',
              }}
            >
              <span>{port.name}:</span>
              <span style={{ fontWeight: 'bold' }}>
                {port.currentPixels}/{port.maxPixels}px
              </span>
            </div>
          ))}

          {/* Show more/less button */}
          {shouldShowCompact && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              style={{
                width: '100%',
                padding: '4px',
                marginTop: '4px',
                background: '#4A90E2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '10px',
                cursor: 'pointer',
              }}
            >
              {expanded ? `▲ Show Less` : `▼ Show All ${controller.ports.length} Ports`}
            </button>
          )}
        </div>
      )}
    </div>
  );
});

ControllerNode.displayName = 'ControllerNode';
