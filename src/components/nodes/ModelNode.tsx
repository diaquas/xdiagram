import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export interface ModelNodeData {
  name: string;
  pixels: number;
  portId: string;
}

export const ModelNode = memo(({ data }: NodeProps<ModelNodeData>) => {
  const { name, pixels } = data;

  return (
    <div
      style={{
        padding: '4px 8px',
        border: '1px solid #2D3748',
        borderRadius: '4px',
        background: '#EDF2F7',
        minWidth: '100px',
        fontSize: '9px',
        position: 'relative',
      }}
    >
      {/* Connection handle from port above */}
      <Handle
        type="target"
        position={Position.Top}
        id="model-input"
        style={{
          background: '#2D3748',
          width: '4px',
          height: '4px',
          top: '-2px',
        }}
      />

      {/* Connection handle to next model below */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="model-output"
        style={{
          background: '#2D3748',
          width: '4px',
          height: '4px',
          bottom: '-2px',
        }}
      />

      {/* Model name and pixel count */}
      <div
        style={{
          fontWeight: 'bold',
          color: '#2D3748',
          marginBottom: '2px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontSize: '8px',
          color: '#4A5568',
        }}
      >
        {pixels}px
      </div>
    </div>
  );
});

ModelNode.displayName = 'ModelNode';
