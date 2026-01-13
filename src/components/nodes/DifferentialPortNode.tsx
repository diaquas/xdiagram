import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { DifferentialPort } from '../../types/diagram';
import { useDiagramStore } from '../../store/diagramStore';

interface DifferentialPortNodeData {
  differentialPort: DifferentialPort;
}

export const DifferentialPortNode = memo(({ data }: NodeProps<DifferentialPortNodeData>) => {
  const { differentialPort } = data;
  const { receivers } = useDiagramStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(differentialPort.name);

  // Calculate aggregate budgets from all connected receivers
  const aggregatedBudgets = differentialPort.sharedPorts.map((sharedPort, portIdx) => {
    let totalPixels = 0;

    // Sum pixels from all receivers on this differential port for this port index
    differentialPort.connectedReceivers.forEach(receiverId => {
      const receiver = receivers.find(r => r.id === receiverId);
      if (receiver && receiver.ports[portIdx]) {
        totalPixels += receiver.ports[portIdx].currentPixels;
      }
    });

    return {
      portName: sharedPort.name,
      currentPixels: totalPixels,
      maxPixels: sharedPort.maxPixels,
      utilization: ((totalPixels / sharedPort.maxPixels) * 100).toFixed(1),
      isOverCapacity: totalPixels > sharedPort.maxPixels,
    };
  });

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  // Calculate total utilization across all 4 ports
  const totalCurrentPixels = aggregatedBudgets.reduce((sum, b) => sum + b.currentPixels, 0);
  const totalMaxPixels = aggregatedBudgets.reduce((sum, b) => sum + b.maxPixels, 0);
  const totalUtilization = ((totalCurrentPixels / totalMaxPixels) * 100).toFixed(1);
  const isOverCapacity = aggregatedBudgets.some(b => b.isOverCapacity);

  return (
    <div
      style={{
        padding: '8px',
        border: '2px solid #805AD5',
        borderRadius: '8px',
        background: '#E9D8FD',
        width: '200px',
        height: '100px',
        position: 'relative',
        overflow: 'visible',
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
        <Handle type="target" position={Position.Top} id="diff-port-input" style={{ opacity: 0 }} />
      </div>

      {/* Output connections to receivers (bottom center) */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '-12px',
          transform: 'translateX(-50%)',
          width: '20px',
          height: '20px',
          border: '2px solid #805AD5',
          background: 'white',
          borderRadius: '2px',
        }}
      >
        <Handle type="source" position={Position.Bottom} id="diff-port-output" style={{ opacity: 0 }} />
      </div>

      {/* Differential port number in top-left */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#553C9A',
        }}
      >
        Diff {differentialPort.portNumber}
      </div>

      {/* Receiver count in top-right */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          fontSize: '12px',
          color: '#553C9A',
        }}
      >
        {differentialPort.connectedReceivers.length} Rx
      </div>

      {/* Differential port name - centered, bold */}
      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            fontWeight: 'bold',
            color: '#553C9A',
            border: '2px solid #805AD5',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '18px',
            textAlign: 'center',
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontWeight: 'bold',
            color: '#553C9A',
            cursor: 'pointer',
            fontSize: '18px',
            textAlign: 'center',
            width: '80%',
          }}
          onDoubleClick={handleDoubleClick}
          title="Double-click to rename"
        >
          Port {differentialPort.portNumber}
        </div>
      )}

      {/* Total utilization at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '10px',
          color: isOverCapacity ? '#C53030' : '#553C9A',
          fontWeight: isOverCapacity ? 'bold' : 'normal',
          background: isOverCapacity ? '#FED7D7' : 'white',
          padding: '2px 6px',
          borderRadius: '3px',
          border: `1px solid ${isOverCapacity ? '#FC8181' : '#D6BCFA'}`,
        }}
      >
        {totalCurrentPixels}/{totalMaxPixels}px ({totalUtilization}%)
      </div>
    </div>
  );
});

DifferentialPortNode.displayName = 'DifferentialPortNode';
