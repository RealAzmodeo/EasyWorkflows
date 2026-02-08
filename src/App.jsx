import React, { useState, useEffect, useRef } from 'react';
import { ComfyApi } from './lib/comfyApi';
import { workflows } from './config/workflows';
import { WorkflowSelector } from './components/WorkflowSelector';
import { WorkflowForm } from './components/WorkflowForm';
import { Button } from './components/ui/components';
import './index.css';
import { Gallery } from './components/Gallery';

// ... (previous imports)

function App() {
  const [status, setStatus] = useState('disconnected');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [history, setHistory] = useState([]); // Store all generated images

  const api = useRef(new ComfyApi());

  // Helper: Convert URL to File object for re-upload
  const urlToFile = async (url, filename) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  };

  useEffect(() => {
    const comfy = api.current;

    const handleStatus = (data) => {
      if (data.status) setStatus(data.status);
    };

    const handleProgress = (data) => {
      setLogs(prev => [...prev.slice(-4), `Step ${data.value}/${data.max}`]);
    };

    const handleExecuted = (data) => {
      setIsProcessing(false);
      // Retrieve image
      const images = data.output.images;
      if (images && images.length > 0) {
        const img = images[0];
        const url = `/view?filename=${img.filename}&subfolder=${img.subfolder}&type=${img.type}`;

        setCurrentImage(url);
        setLogs(prev => [...prev, 'Generation Complete']);

        // Add to history
        setHistory(prev => [{ url, filename: img.filename, type: img.type, subfolder: img.subfolder }, ...prev]);
      }
    };

    comfy.on('status', handleStatus);
    comfy.on('progress', handleProgress);
    comfy.on('executed', handleExecuted);

    comfy.connect();

    return () => {
      comfy.disconnect();
    };
  }, []);

  const handleWorkflowSubmit = async (values) => {
    setIsProcessing(true);
    setLogs(['Starting...']);
    setCurrentImage(null);

    try {
      // 1. Upload Images
      const inputs = { ...values };
      const workflowConfig = workflows.find(w => w.id === selectedWorkflowId);

      for (const inputConfig of workflowConfig.inputs) {
        if (inputConfig.type === 'image' && values[inputConfig.id] instanceof File) {
          const file = values[inputConfig.id];
          setLogs(prev => [...prev, `Uploading ${file.name}...`]);
          const res = await api.current.uploadImage(file);
          // Store the upload result (filename) for the prompt
          inputs[inputConfig.id] = res.name;
        }

        // Handle Seed: If empty or 0, generate random
        if (inputConfig.id === 'seed') {
          const val = inputs[inputConfig.id];
          if (!val || val === 0 || val === '') {
            inputs[inputConfig.id] = Math.floor(Math.random() * 100000000000000);
          }
        }
      }

      // 2. Prepare Prompt JSON
      setLogs(prev => [...prev, 'Queueing workflow...']);

      // Clone the template
      const finalWorkflow = JSON.parse(JSON.stringify(workflowConfig.apiTemplate));

      // Inject values
      workflowConfig.inputs.forEach(inputConfig => {
        const { nodeId, field } = inputConfig.target;
        if (finalWorkflow[nodeId] && finalWorkflow[nodeId].inputs) {
          finalWorkflow[nodeId].inputs[field] = inputs[inputConfig.id];
        }
      });

      console.log('Sending workflow:', finalWorkflow);

      // Execute
      await api.current.queuePrompt(finalWorkflow);

      setLogs(prev => [...prev, 'Workflow queued successfully!']);
      setIsProcessing(true);

    } catch (err) {
      console.error(err);
      setLogs(prev => [...prev, `Error: ${err.message}`]);
      setIsProcessing(false);
    }
  };

  const activeWorkflow = workflows.find(w => w.id === selectedWorkflowId);

  const handleGalleryDragStart = (e, img) => {
    e.dataTransfer.setData('application/json', JSON.stringify(img));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>ComfyUI <span style={{ color: 'var(--primary)' }}>Studio</span></h1>
          <p style={{ color: 'var(--text-secondary)' }}>Premium Workflow Interface</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={`status-indicator status-${status}`}></span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {status}
          </span>
        </div>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: selectedWorkflowId ? '1fr 1fr' : '1fr', gap: '2rem' }}>

        {/* Left Column: Selection & Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {!selectedWorkflowId ? (
            <div className="animate-fade-in">
              <h2 style={{ marginBottom: '1.5rem' }}>Select Workflow</h2>
              <WorkflowSelector
                workflows={workflows}
                selectedId={selectedWorkflowId}
                onSelect={setSelectedWorkflowId}
              />
            </div>
          ) : (
            <div className="animate-slide-in">
              <Button
                onClick={() => setSelectedWorkflowId(null)}
                variant="secondary"
                style={{ marginBottom: '1rem', background: 'transparent', paddingLeft: 0 }}
              >
                ← Back to Workflows
              </Button>
              <WorkflowForm
                workflow={activeWorkflow}
                onSubmit={handleWorkflowSubmit}
                isProcessing={isProcessing}
                urlToFile={urlToFile} // Pass helper to form
              />
            </div>
          )}
        </div>

        {/* Right Column: Preview */}
        {selectedWorkflowId && (
          <div className="glass-panel" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
            <h3 style={{ marginTop: 0 }}>Preview</h3>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative' }}>
              {currentImage ? (
                <img src={currentImage} alt="Generated" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  {isProcessing ? (
                    <div className="loader">Processing...</div>
                  ) : (
                    <p>Generated image will appear here</p>
                  )}
                </div>
              )}
            </div>

            <div style={{ marginTop: '1rem', height: '100px', overflowY: 'auto', fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
              {logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Session Gallery */}
      <Gallery images={history} onDragStart={handleGalleryDragStart} />
    </div>
  );
}

export default App;
