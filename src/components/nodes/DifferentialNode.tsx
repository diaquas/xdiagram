import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Differential } from '../../types/diagram';
import { useDiagramStore } from '../../store/diagramStore';

interface DifferentialNodeData {
  differential: Differential;
}

export const DifferentialNode = memo(({ data }: NodeProps<DifferentialNodeData>) => {
  const { differential } = data;
  const { differentialPorts, receivers } = useDiagramStore();

  // Get the 4 DifferentialPort nodes for this board
  const boardPorts = differential.differentialPorts
    .map(id => differentialPorts.find(dp => dp.id === id))
    .filter(Boolean)
    .sort((a, b) => (a?.portNumber || 0) - (b?.portNumber || 0));

  return (
    <div
      style={{
        padding: '16px',
        paddingBottom: '40px', // Extra space for connection squares
        border: '2px solid #805AD5',
        borderRadius: '8px',
        background: '#E9D8FD',
        width: '240px',
        minHeight: '200px',
        position: 'relative',
      }}
    >
      {/* Input connection from controller (top center) */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '-12px',
          transform: 'translateX(-50%)',
          width: '20px',
          height: '20px',
          border: '2px solid #805AD5',
          background: '#3182CE',
          borderRadius: '2px',
        }}
      >
        <Handle type="target" position={Position.Top} id="diff-board-input" style={{ opacity: 0 }} />
      </div>

      {/* Board title */}
      <div style={{ fontWeight: 'bold', marginBottom: '16px', color: '#553C9A', fontSize: '16px', textAlign: 'center' }}>
        {differential.name}
      </div>

      {/* 4 Differential Ports with detailed info */}
      <div style={{ marginBottom: '12px' }}>
        {boardPorts.map((port) => {
          if (!port) return null;

          // Calculate total pixels across all receivers on this port
          let totalPixels = 0;
          port.connectedReceivers.forEach(receiverId => {
            const receiver = receivers.find(r => r.id === receiverId);
            if (receiver) {
              receiver.ports.forEach(p => {
                totalPixels += p.currentPixels;
              });
            }
          });

          const totalMaxPixels = port.sharedPorts.reduce((sum, p) => sum + p.maxPixels, 0);
          const utilization = totalMaxPixels > 0 ? ((totalPixels / totalMaxPixels) * 100).toFixed(0) : '0';
          const isOverCapacity = totalPixels > totalMaxPixels;

          return (
            <div
              key={port.id}
              style={{
                padding: '8px 12px',
                marginBottom: '8px',
                background: 'white',
                borderRadius: '6px',
                border: `2px solid ${isOverCapacity ? '#FC8181' : '#D6BCFA'}`,
              }}
            >
              {/* Port number */}
              <div style={{ fontWeight: 'bold', color: '#553C9A', fontSize: '13px', marginBottom: '4px' }}>
                Port {port.portNumber}
              </div>

              {/* Pixel count */}
              <div style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: isOverCapacity ? '#C53030' : '#38A169',
                marginBottom: '2px'
              }}>
                {totalPixels}/{totalMaxPixels}
              </div>

              {/* Receiver count and utilization */}
              <div style={{ fontSize: '11px', color: '#6B46C1' }}>
                {port.connectedReceivers.length} Rx • {utilization}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Output connection squares at bottom (representing 4 differential outputs) */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '12px',
      }}>
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            style={{
              width: '24px',
              height: '24px',
              border: '2px solid #805AD5',
              background: 'white',
              borderRadius: '3px',
            }}
          />
        ))}
        {/* Single centered output handle */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="diff-board-output"
          style={{
            opacity: 0,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
      </div>
    </div>
  );
});

DifferentialNode.displayName = 'DifferentialNode';
