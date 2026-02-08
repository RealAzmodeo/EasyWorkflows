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
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  const api = useRef(new ComfyApi());

  // Apply theme to body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

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

        // Add to history (deduplicate)
        setHistory(prev => {
          // Check if the latest image is the same
          if (prev.length > 0 && prev[0].filename === img.filename) return prev;
          return [{ url, filename: img.filename, type: img.type, subfolder: img.subfolder }, ...prev];
        });
      }
    };

    comfy.on('status', handleStatus);
    comfy.on('progress', handleProgress);
    comfy.on('executed', handleExecuted);

    // Also log execution errors
    comfy.on('execution_error', (data) => {
      console.error('WS Execution Error:', data);
      setLogs(prev => [...prev, `Error: ${data.exception_type} - ${data.exception_message}`]);
      setIsProcessing(false);
    });

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

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '0 1rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1rem', margin: 0 }}>Comfy Studio</h2>
          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: 'var(--text-secondary)'
            }}
            title="Toggle Light/Dark Mode"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        <WorkflowSelector
          workflows={workflows}
          selectedId={selectedWorkflowId}
          onSelect={setSelectedWorkflowId}
        />

        <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className={`status-indicator status-${status}`}></span>
            <span style={{ color: 'var(--text-secondary)' }}>{status}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {!selectedWorkflowId ? (
          <div className="fade-in" style={{ textAlign: 'center', marginTop: '10vh' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Welcome to Comfy Studio</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Select a workflow from the sidebar to get started.</p>
          </div>
        ) : (
          <div className="fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ margin: 0 }}>{activeWorkflow.name}</h1>
                <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0' }}>{activeWorkflow.description}</p>
              </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
              {/* Form Section */}
              <section>
                <WorkflowForm
                  workflow={activeWorkflow}
                  onSubmit={handleWorkflowSubmit}
                  isProcessing={isProcessing}
                  urlToFile={urlToFile}
                />

                {/* Session Gallery integrated below the form or at bottom */}
                <Gallery images={history} onDragStart={handleGalleryDragStart} />
              </section>

              {/* Preview Section */}
              <section>
                <Card title="Output Preview" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-sidebar)',
                    borderRadius: 'var(--radius)',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {currentImage ? (
                      <img src={currentImage} alt="Generated" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {isProcessing ? "Processing generation..." : "Result will appear here"}
                      </div>
                    )}
                  </div>

                  {logs.length > 0 && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      background: 'var(--bg-sidebar)',
                      borderRadius: 'var(--radius)',
                      fontSize: '0.8rem',
                      fontFamily: 'monospace',
                      color: 'var(--text-secondary)',
                      maxHeight: '100px',
                      overflowY: 'auto'
                    }}>
                      {logs.map((log, i) => <div key={i}>{log}</div>)}
                    </div>
                  )}
                </Card>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
