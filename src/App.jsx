import React, { useState, useEffect, useRef } from 'react';
import { ComfyApi } from './lib/comfyApi';
import { workflows } from './config/workflows';
import { WorkflowSelector } from './components/WorkflowSelector';
import { WorkflowForm } from './components/WorkflowForm';
import { Button, Card } from './components/ui/components';
import './index.css';
import { Gallery } from './components/Gallery';
import { HomeView } from './components/HomeView';
import { ImageComparisonSlider } from './components/ImageComparisonSlider';
import { urlToFile, saveFormToLocalStorage, loadFormFromLocalStorage, getFunStatus, saveHistoryToLocalStorage, loadHistoryFromLocalStorage } from './lib/utils';

// Helper Lightbox Component to manage ObjectURLs for Files
const Lightbox = ({ data, history, onClose, onDownload, onShare, onDelete, onChange, onRemove, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (!history) return -1;
    return history.findIndex(img => img.url === data.url);
  });

  const activeImage = currentIndex !== -1 ? history[currentIndex] : data;
  const [displayUrl, setDisplayUrl] = useState(null);

  useEffect(() => {
    let url = null;
    const targetUrl = activeImage.url;

    if (targetUrl instanceof File || targetUrl instanceof Blob) {
      url = URL.createObjectURL(targetUrl);
      setDisplayUrl(url);
    } else {
      setDisplayUrl(targetUrl);
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    }
  }, [activeImage.url]);

  if (!displayUrl) return null;

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>✕</button>
      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
        <img src={displayUrl} alt="Lightbox" />

        <div className="lightbox-actions-bar">
          {activeImage.type === 'output' || activeImage.filename ? (
            <>
              <button className="lightbox-action-btn" onClick={() => onDownload(activeImage.url, activeImage.filename || 'output.png')}>
                <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /></svg>
                SAVE
              </button>
              <button className="lightbox-action-btn" onClick={() => onShare(activeImage.url, activeImage.filename || 'share.png')}>
                <svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z" /></svg>
                SHARE
              </button>
              <button className="lightbox-action-btn delete" onClick={() => {
                const filename = activeImage.filename || activeImage.url.split('filename=')[1]?.split('&')[0];
                onDelete(filename);
                onClose();
              }}>
                <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
                DELETE
              </button>
            </>
          ) : (
            <>
              <button className="lightbox-action-btn" onClick={() => onChange(activeImage.inputId)}>
                <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" /></svg>
                CHANGE
              </button>
              <button className="lightbox-action-btn delete" onClick={() => onRemove(activeImage.inputId)}>
                <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                REMOVE
              </button>
            </>
          )}
        </div>

        {/* History Navigator inside Lightbox */}
        {history && history.length > 0 && (
          <div className="history-nav-bar lightbox-nav">
            {history.slice(0, 12).map((img, i) => (
              <div
                key={i}
                className={`nav-thumb-box ${currentIndex === i ? 'active' : ''}`}
                onClick={() => setCurrentIndex(i)}
              >
                <img src={img.url} alt={`History ${i}`} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  const [status, setStatus] = useState('disconnected');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(() => localStorage.getItem('selectedWorkflowId'));
  const [currentImage, setCurrentImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [history, setHistory] = useState(() => loadHistoryFromLocalStorage('galleryHistory')); // Store all generated images
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [activePromptId, setActivePromptId] = useState(() => localStorage.getItem('activePromptId'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formValues, setFormValues] = useState(() => loadFormFromLocalStorage('formValues'));
  const [dragActive, setDragActive] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [originalInputImage, setOriginalInputImage] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  const api = useRef(new ComfyApi());
  const processingRef = useRef(false);

  // Apply theme to body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Persist gallery history
  useEffect(() => {
    saveHistoryToLocalStorage('galleryHistory', history);
  }, [history]);

  // Close sidebar on workflow selection (mobile) and reset form
  useEffect(() => {
    setSidebarOpen(false);

    if (selectedWorkflowId) {
      localStorage.setItem('selectedWorkflowId', selectedWorkflowId);
    } else {
      localStorage.removeItem('selectedWorkflowId');
    }

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


  useEffect(() => {
    const comfy = api.current;

    const handleStatus = (data) => {
      // General status is fine, but we only update our UI status if it's relevant
      if (data.status) setStatus(data.status);
    };

    const handleProgress = (data) => {
      // CRITICAL: Only show progress if it belongs to our current active prompt
      if (!activePromptId || data.prompt_id !== activePromptId) return;

      const percent = Math.round((data.value / data.max) * 100);
      setProgress(percent);
      setLogs(prev => [...prev.slice(-4), `Step ${data.value}/${data.max}`]);
    };

    const handleExecuted = (data) => {
      // CRITICAL: If we are waiting for a specific prompt and this isn't it, ignore.
      if (!activePromptId || data.prompt_id !== activePromptId) return;

      // Retrieve image
      const images = data.output.images;

      // 1. ALWAYS update the image preview if we got one (could be intermediate)
      if (images && images.length > 0) {
        const img = images[0];
        const url = `/view?filename=${img.filename}&subfolder=${img.subfolder}&type=${img.type}`;

        setCurrentImage(url);
        setLogs(prev => [...prev.slice(-4), 'Image Received']);

        // Add to history (deduplicate)
        setHistory(prev => {
          if (prev.length > 0 && prev[0].filename === img.filename) return prev;
          return [{ url, filename: img.filename, type: img.type, subfolder: img.subfolder }, ...prev];
        });
      }

      // 2. DECIDE when to unlock the UI (mark job as complete)
      let shouldUnlock = false;

      // Special handling for Camera Workflow to avoid premature unlock on Node 93 (Camera)
      if (selectedWorkflowId === 'qwen-camera') {
        // Only unlock on the final PreviewImage node (ID '96')
        if (data.node === '96') {
          shouldUnlock = true;
        } else {
          console.log(`[CameraWorkflow] Ignored intermediate execution from node ${data.node}`);
        }
      } else {
        // Default Strict Behavior: Only unlock if we got images 
        // (assuming simpler workflows where any image = done)
        if (images && images.length > 0) {
          shouldUnlock = true;
        }
      }

      if (shouldUnlock) {
        setIsProcessing(false);
        processingRef.current = false;
        setProgress(100);
        setTimeout(() => setProgress(0), 1000);

        localStorage.removeItem('activePromptId');
        setActivePromptId(null);
        setLogs(prev => [...prev, 'Generation Complete']);
      }
    };

    const handleExecutionStart = (data) => {
      if (!activePromptId || data.prompt_id !== activePromptId) return;
      // If we see node: null after starting, it might mean it's finished or skipped
      if (data.node === null) {
        console.log('Execution stream finished for:', data.prompt_id);
      }
    };

    comfy.on('status', handleStatus);
    comfy.on('progress', handleProgress);
    comfy.on('executed', handleExecuted);
    comfy.on('execution_start', handleExecutionStart);

    // Also log execution errors
    comfy.on('execution_error', (data) => {
      if (!activePromptId || data.prompt_id !== activePromptId) return;

      console.error('WS Execution Error:', data);
      setLogs(prev => [...prev, `Error: ${data.exception_type} - ${data.exception_message}`]);
      setIsProcessing(false);
      processingRef.current = false;
      setProgress(0);
    });

    comfy.connect();

    return () => {
      comfy.disconnect();
    };
  }, [activePromptId]); // Re-bind if promptId changes

  // Function to manually check if a prompt is finished (Polling Fallback)
  const checkPromptResult = async (promptId) => {
    try {
      const historyRes = await api.current.getHistory(promptId);
      const result = historyRes[promptId];
      if (result && result.outputs) {
        // Format it like a regular 'executed' event data
        const payload = {
          prompt_id: promptId,
          output: result.outputs[Object.keys(result.outputs)[0]]
        };
        // Re-use logic
        const images = payload.output.images;
        if (images && images.length > 0) {
          const img = images[0];
          const url = `/view?filename=${img.filename}&subfolder=${img.subfolder}&type=${img.type}`;
          setCurrentImage(url);
          setHistory(prev => {
            if (prev.length > 0 && prev[0].filename === img.filename) return prev;
            return [{ url, filename: img.filename, type: img.type, subfolder: img.subfolder }, ...prev];
          });
          setIsProcessing(false);
          processingRef.current = false;
          setProgress(0);
          localStorage.removeItem('activePromptId');
          setActivePromptId(null);
          return true;
        }
      }
    } catch (e) {
      console.error('Polling error:', e);
    }
    return false;
  };

  // Auto-recovery and periodic safety check
  useEffect(() => {
    if (activePromptId) {
      setIsProcessing(true);
      checkPromptResult(activePromptId);
    }

    const interval = setInterval(() => {
      if (activePromptId) {
        checkPromptResult(activePromptId);
      }
    }, 10000); // Check every 10s if something is pending

    return () => clearInterval(interval);
  }, [activePromptId]);

  const handleWorkflowSubmit = async (e, retryCount = 0) => {
    // If it's a click event, prevent default
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    // Use both state and ref for a super-hardened lock
    if (isProcessing || processingRef.current) {
      console.warn('Submission already in progress, ignoring...');
      return;
    }

    setIsProcessing(true);
    processingRef.current = true;
    const values = formValues;
    setProgress(0);
    setLogs(['Starting...']);
    setCurrentImage(null);

    try {
      // 0. Connection Heartbeat Check
      try {
        await api.current.getSystemStats();
      } catch (connErr) {
        if (retryCount === 0) {
          setLogs(['Engine offline. Starting servers on PC... 🚀']);
          setProgress(5);
          await api.current.wakeUp();

          // Wait and retry
          for (let i = 1; i <= 15; i++) {
            await new Promise(r => setTimeout(r, 1000));
            const remaining = 15 - i;
            setProgress(5 + (i * 6));
            setLogs([`Starting servers... ${remaining}s remaining`]);
          }

          return handleWorkflowSubmit(1);
        } else {
          throw new Error("Could not connect to ComfyUI after wake-up attempt.");
        }
      }

      // 1. Upload Images
      const inputs = { ...values };
      const workflowConfig = workflows.find(w => w.id === selectedWorkflowId);

      let capturedOriginal = false;
      for (const inputConfig of workflowConfig.inputs) {
        if (inputConfig.type === 'image') {
          const file = values[inputConfig.id];
          if (file instanceof File) {
            // Capture the first image as the "Original" for comparison
            if (!capturedOriginal) {
              const reader = new FileReader();
              reader.onload = (e) => setOriginalInputImage(e.target.result);
              reader.readAsDataURL(file);
              capturedOriginal = true;
            }

            setLogs(prev => [...prev, `Uploading ${file.name}...`]);
            const res = await api.current.uploadImage(file);
            inputs[inputConfig.id] = res.name;
          }
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
      setLogs(prev => [...prev, 'Injecting parameters...']);
      const finalWorkflow = JSON.parse(JSON.stringify(workflowConfig.apiTemplate));

      // Inject values
      workflowConfig.inputs.forEach(inputConfig => {
        const { nodeId, field, fields } = inputConfig.target;
        if (finalWorkflow[nodeId] && finalWorkflow[nodeId].inputs) {
          const val = inputs[inputConfig.id];

          if (fields && typeof val === 'object' && val !== null) {
            // Multi-field injection
            fields.forEach(f => {
              if (val[f] !== undefined) {
                finalWorkflow[nodeId].inputs[f] = val[f];
              }
            });
          } else if (field && val !== undefined) {
            // Single-field injection
            finalWorkflow[nodeId].inputs[field] = val;
          }
        }
      });

      console.debug('Sending workflow to ComfyUI');

      // Execute
      const res = await api.current.queuePrompt(finalWorkflow);
      const promptId = res.prompt_id;
      setActivePromptId(promptId);
      localStorage.setItem('activePromptId', promptId);

      setLogs(prev => [...prev, 'Workflow queued successfully!']);
      setIsProcessing(true);

    } catch (err) {
      console.error(err);
      setLogs(prev => [...prev, `Error: ${err.message}`]);
      setIsProcessing(false);
      processingRef.current = false;
      setProgress(0);
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
    setFormValues(prev => {
      const next = { ...prev, [id]: value };
      saveFormToLocalStorage('formValues', next);
      return next;
    });
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

  const handleShareImage = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], filename || 'generated.png', { type: blob.type });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'Check out this generation!',
          text: 'Generated with Comfy Studio'
        });
      } else {
        alert('Sharing is not supported on this browser. Opening image in new tab.');
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Header - Only visible when in a workflow */}
      {selectedWorkflowId && (
        <div className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text)', padding: '0.5rem' }}
            >
              ☰
            </button>
            {/* Added status dot in mobile header */}
            <span className={`status-indicator status-${status}`} style={{ width: '10px', height: '10px', marginLeft: '-5px' }}></span>
          </div>
          <span
            style={{ fontWeight: '700', fontSize: '1rem', flex: 1, textAlign: 'center', fontFamily: 'Outfit, sans-serif' }}
          >
            {activeWorkflow ? activeWorkflow.name.split(' ').slice(-1)[0].toUpperCase() : 'ALLAI'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Gallery Button in Mobile Header */}
            <button
              onClick={() => setIsGalleryOpen(true)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center' }}
              title="History"
            >
              <svg viewBox="0 0 24 24" style={{ width: '22px', height: '22px', fill: 'var(--text)' }}>
                <path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4 2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Overlay for mobile sidebar */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar - Hidden on Landing Page unless open */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''} ${!selectedWorkflowId ? 'mobile-hide' : ''}`}>
        <div style={{ padding: '0.5rem 1rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 onClick={() => setSelectedWorkflowId(null)} className="brand-title">ALLAI</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={toggleTheme}
              className="icon-btn-reset"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Toggle Theme"
            >
              {theme === 'light' ? (
                <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', fill: 'var(--text-secondary)' }}><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L19.42 4.58zM5.99 19.42c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06z" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', fill: 'var(--text-secondary)' }}><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" /></svg>
              )}
            </button>
            <button
              className="mobile-close-btn"
              onClick={() => setSidebarOpen(false)}
              style={{ background: 'var(--bg-hover)', border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: 'var(--radius)', marginLeft: '8px' }}
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
          <HomeView
            workflows={workflows}
            onSelectWorkflow={setSelectedWorkflowId}
            status={status}
          />
        ) : (
          <div className="fade-in">
            <header className="mobile-hide" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => setSelectedWorkflowId(null)} className="icon-btn-circle" title="Back to Home">
                  <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
                </button>
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{activeWorkflow.name}</h1>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {/* Desktop History Button */}
                <button
                  onClick={() => setIsGalleryOpen(true)}
                  className="icon-btn-reset"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'var(--bg-hover)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text)',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    border: '1px solid var(--border)'
                  }}
                >
                  <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px', fill: 'currentColor' }}>
                    <path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4 2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z" />
                  </svg>
                  HISTORY
                </button>
              </div>
            </header>

            <div className="workflow-content-area">
              <WorkflowForm
                workflow={activeWorkflow}
                description={activeWorkflow.description}
                values={formValues}
                history={history}
                onChange={handleValueChange}
                onFileChange={handleValueChange}
                onSubmit={handleWorkflowSubmit}
                isProcessing={isProcessing}
                progress={progress}
                dragActive={dragActive}
                onDrag={handleDrag}
                onDrop={handleDrop}
                onImageClick={(data) => setLightboxImage(data)}
                originalInputImage={originalInputImage}
                currentImage={currentImage}
                setCurrentImage={setCurrentImage}
                preview={
                  <div className="main-preview-container">
                    <div className="preview-box">
                      {currentImage ? (
                        <>
                          {showComparison && originalInputImage && selectedWorkflowId !== 'extractproduct' ? (
                            <ImageComparisonSlider
                              beforeImage={originalInputImage}
                              afterImage={currentImage}
                              className="preview-img"
                            />
                          ) : (
                            <img
                              src={currentImage}
                              alt="Generated"
                              className="preview-img clickable"
                              onClick={() => setLightboxImage({ url: currentImage, type: 'output' })}
                            />
                          )}
                          <div className="action-btn-group">
                            {originalInputImage && selectedWorkflowId !== 'extractproduct' && (
                              <button
                                className={`icon-btn-circle ${showComparison ? 'active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); setShowComparison(!showComparison); }}
                                title="Compare with Original"
                              >
                                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z" /></svg>
                              </button>
                            )}
                            <button
                              className="icon-btn-circle"
                              onClick={(e) => { e.stopPropagation(); handleShareImage(currentImage, 'output.png'); }}
                              title="Share"
                            >
                              <svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z" /></svg>
                            </button>
                            <button
                              className="icon-btn-circle"
                              onClick={(e) => { e.stopPropagation(); handleDownloadImage(currentImage, 'output.png'); }}
                              title="Download"
                            >
                              <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /></svg>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="preview-placeholder">
                          {isProcessing ? (
                            <div className="loader-container">
                              <div className="premium-spinner"></div>
                              <span className="fun-status-text">
                                {logs[0]?.includes('Starting servers') ? logs[0] : getFunStatus(selectedWorkflowId)}
                              </span>
                            </div>
                          ) : "Result will appear here"}
                        </div>
                      )}
                    </div>

                    {/* Technical logs hidden from user */}
                  </div>
                }
              />
            </div>

            {/* Gallery Drawer Overlay */}
            {/* Gallery Drawer Overlay */}
            {isGalleryOpen && (
              <div
                className="drawer-overlay"
                onClick={() => setIsGalleryOpen(false)}
              >
                <aside className="drawer-right" onClick={e => e.stopPropagation()}>
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
                      onShare={handleShareImage}
                      onImageClick={(data) => {
                        setLightboxImage(data);
                        setIsGalleryOpen(false);
                      }}
                    />
                  </div>
                </aside>
              </div>
            )}

            {/* Global Lightbox Component */}
            {lightboxImage && (
              <Lightbox
                data={lightboxImage}
                history={history}
                onClose={() => setLightboxImage(null)}
                onDownload={handleDownloadImage}
                onShare={handleShareImage}
                onDelete={handleDeleteImage}
                onChange={(inputId) => {
                  const fileInput = document.querySelector(`input[data-inputid="${inputId}"]`);
                  fileInput?.click();
                  setLightboxImage(null);
                }}
                onRemove={(inputId) => {
                  handleValueChange(inputId, null);
                  setLightboxImage(null);
                }}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
