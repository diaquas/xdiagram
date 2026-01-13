import { useEffect, useState } from 'react';
import { DiagramCanvas } from './components/DiagramCanvas';
import { Toolbar } from './components/Toolbar';
import { useDiagramStore } from './store/diagramStore';
import { WireColor } from './types/diagram';

function App() {
  const { loadDiagram } = useDiagramStore();
  const [selectedWireColor, setSelectedWireColor] = useState<WireColor>('black');
  const [autoSnapEnabled, setAutoSnapEnabled] = useState(true); // Auto-snap enabled by default

  useEffect(() => {
    // Load saved diagram on mount
    fetch('http://localhost:3001/api/diagram')
      .then((res) => res.json())
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          loadDiagram(data);
        }
      })
      .catch((err) => console.error('Error loading diagram:', err));

    // Connect to xLights update stream
    const eventSource = new EventSource('http://localhost:3001/api/xlights/stream');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'update') {
        console.log('xLights controllers updated:', data.controllers);
        // TODO: Update diagram with new controller info
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
    };

    return () => {
      eventSource.close();
    };
  }, [loadDiagram]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Toolbar
        selectedWireColor={selectedWireColor}
        onWireColorChange={setSelectedWireColor}
        autoSnapEnabled={autoSnapEnabled}
        onAutoSnapChange={setAutoSnapEnabled}
      />
      <DiagramCanvas
        selectedWireColor={selectedWireColor}
        autoSnapEnabled={autoSnapEnabled}
      />
    </div>
  );
}

export default App;
