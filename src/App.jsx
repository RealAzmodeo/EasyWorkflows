import React, { useState, useEffect, useRef } from 'react';
import { ComfyApi } from './lib/comfyApi';
import { workflows } from './config/workflows';
import { WorkflowSelector } from './components/WorkflowSelector';
import { WorkflowForm } from './components/WorkflowForm';
import { Button, Card } from './components/ui/components';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [dragActive, setDragActive] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const api = useRef(new ComfyApi());

  // Apply theme to body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Close sidebar on workflow selection (mobile) and reset form
  useEffect(() => {
    setSidebarOpen(false);

    if (selectedWorkflowId) {
      const workflow = workflows.find(w => w.id === selectedWorkflowId);
      if (workflow) {
        setFormValues(prev => {
          const next = {};
          workflow.inputs.forEach(input => {
            if (input.type === 'image' && prev[input.id]) {
              next[input.id] = prev[input.id];
            } else {
              next[input.id] = input.defaultValue || '';
            }
          });
          return next;
        });
      }
    }
  }, [selectedWorkflowId]);

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

  const handleDrag = (e, id) => {
    e.preventDefault();
    setDragActive(id);
  };

  const handleDrop = async (e, id) => {
    e.preventDefault();
    setDragActive(null);
    let file;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      file = e.dataTransfer.files[0];
    } else {
      const jsonData = e.dataTransfer.getData('application/json');
      if (jsonData) {
        try {
          const img = JSON.parse(jsonData);
          file = await urlToFile(img.url, img.filename || 'dropped.png');
        } catch (err) { console.error(err); }
      }
    }
    if (file) setFormValues(prev => ({ ...prev, [id]: file }));
  };

  const handleValueChange = (id, value) => {
    setFormValues(prev => ({ ...prev, [id]: value }));
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleDownloadImage = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'generated-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteImage = (filename) => {
    setHistory(prev => prev.filter(img => img.filename !== filename));
  };

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button
          onClick={() => setSidebarOpen(true)}
          style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text)', padding: '0.5rem' }}
        >
          ☰
        </button>
        <span style={{ fontWeight: '600', fontSize: '0.9rem', flex: 1, textAlign: 'center', marginRight: '2.5rem' }}>
          {activeWorkflow ? activeWorkflow.name : 'Comfy Studio'}
        </span>
      </div>

      {/* Overlay for mobile sidebar */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '0 1rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1rem', margin: 0 }}>Comfy Studio</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={toggleTheme}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem',
                color: 'var(--text-secondary)',
                padding: '8px'
              }}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            {/* Close button for mobile modal */}
            <button
              className="mobile-close-btn"
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'var(--bg-hover)',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: 'var(--radius)',
                marginLeft: '8px'
              }}
            >
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text)' }}>CLOSE</span>
            </button>
          </div>
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
            <header className="mobile-hide" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ margin: 0 }}>{activeWorkflow.name}</h1>
                <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0', display: 'none' }}>{activeWorkflow.description}</p>
              </div>
            </header>

            <div className="mobile-vertical-stack">
              <WorkflowForm
                workflow={activeWorkflow}
                values={formValues}
                onChange={handleValueChange}
                onFileChange={handleValueChange}
                onSubmit={handleWorkflowSubmit}
                isProcessing={isProcessing}
                dragActive={dragActive}
                onDrag={handleDrag}
                onDrop={handleDrop}
                onImageClick={(url) => setLightboxImage(url)}
                preview={
                  <div className="main-preview-container">
                    <Card title="Output Preview" style={{ minHeight: '300px', margin: '0' }}>
                      <div className="preview-box">
                        {currentImage ? (
                          <img
                            src={currentImage}
                            alt="Generated"
                            className="preview-img clickable"
                            onClick={() => setLightboxImage(currentImage)}
                          />
                        ) : (
                          <div className="preview-placeholder">
                            {isProcessing ? (
                              <div className="loader-container">
                                <div className="loader"></div>
                                <span>Generating...</span>
                              </div>
                            ) : "Result will appear here"}
                          </div>
                        )}
                      </div>

                      {logs.length > 0 && (
                        <div className="log-container">
                          {logs.map((log, i) => <div key={i}>{log}</div>)}
                        </div>
                      )}
                    </Card>
                  </div>
                }
              />
            </div>

            {/* Floating Gallery Button */}
            <button
              className="fab-gallery"
              onClick={() => setIsGalleryOpen(true)}
              title="Open History"
            >
              🖼️
            </button>

            {/* Gallery Drawer Overlay */}
            <div
              className={`drawer-overlay ${isGalleryOpen ? 'open' : ''}`}
              onClick={() => setIsGalleryOpen(false)}
            ></div>

            {/* Gallery Drawer */}
            <aside className={`gallery-drawer ${isGalleryOpen ? 'open' : ''}`}>
              <div className="drawer-header">
                <h3 style={{ margin: 0 }}>History</h3>
                <button
                  onClick={() => setIsGalleryOpen(false)}
                  style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text)' }}
                >
                  ✕
                </button>
              </div>
              <div className="drawer-content">
                <Gallery
                  images={history}
                  onDragStart={handleGalleryDragStart}
                  onDelete={handleDeleteImage}
                  onDownload={handleDownloadImage}
                  onImageClick={(url) => setLightboxImage(url)}
                />
              </div>
            </aside>

            {/* Global Lightbox Component */}
            {lightboxImage && (
              <div
                className="lightbox-overlay"
                onClick={() => setLightboxImage(null)}
              >
                <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                  <img src={lightboxImage} alt="Large view" />
                  <button className="lightbox-close" onClick={() => setLightboxImage(null)}>✕</button>
                  <button
                    className="lightbox-download"
                    onClick={() => handleDownloadImage(lightboxImage)}
                  >
                    ⬇️ Download
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
