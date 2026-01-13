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

  return (
    <div
      style={{
        padding: '12px',
        border: '2px solid #805AD5',
        borderRadius: '8px',
        background: '#E9D8FD',
        width: '280px',
        minHeight: '180px',
        position: 'relative',
      }}
    >
      {/* Input connection from controller (left side) */}
      <div
        style={{
          position: 'absolute',
          left: '-12px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '20px',
          height: '20px',
          border: '2px solid #805AD5',
          background: '#3182CE',
          borderRadius: '2px',
        }}
      >
        <Handle type="target" position={Position.Left} id="diff-port-input" style={{ opacity: 0 }} />
      </div>

      {/* Output connections to receivers (right side) */}
      <div
        style={{
          position: 'absolute',
          right: '-12px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '20px',
          height: '20px',
          border: '2px solid #805AD5',
          background: 'white',
          borderRadius: '2px',
        }}
      >
        <Handle type="source" position={Position.Right} id="diff-port-output" style={{ opacity: 0 }} />
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

      {/* Differential port name - editable */}
      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            width: '100%',
            fontWeight: 'bold',
            color: '#553C9A',
            border: '2px solid #805AD5',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '16px',
            textAlign: 'center',
            marginTop: '24px',
            marginBottom: '12px',
          }}
        />
      ) : (
        <div
          style={{
            fontWeight: 'bold',
            color: '#553C9A',
            cursor: 'pointer',
            fontSize: '16px',
            textAlign: 'center',
            marginTop: '24px',
            marginBottom: '12px',
          }}
          onDoubleClick={handleDoubleClick}
          title="Double-click to rename"
        >
          {differentialPort.name}
        </div>
      )}

      {/* Shared budget display for 4 ports */}
      <div style={{ fontSize: '11px', color: '#553C9A' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px', textAlign: 'center' }}>
          Shared Budgets ({differentialPort.connectedReceivers.length} receiver{differentialPort.connectedReceivers.length !== 1 ? 's' : ''})
        </div>
        {aggregatedBudgets.map((budget, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '3px',
              padding: '2px 4px',
              background: budget.isOverCapacity ? '#FED7D7' : 'white',
              borderRadius: '3px',
              border: budget.isOverCapacity ? '1px solid #FC8181' : '1px solid #D6BCFA',
            }}
          >
            <span style={{ fontWeight: 'bold' }}>{budget.portName}:</span>
            <span style={{
              color: budget.isOverCapacity ? '#C53030' : '#553C9A',
              fontWeight: budget.isOverCapacity ? 'bold' : 'normal'
            }}>
              {budget.currentPixels}/{budget.maxPixels}px ({budget.utilization}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

DifferentialPortNode.displayName = 'DifferentialPortNode';
