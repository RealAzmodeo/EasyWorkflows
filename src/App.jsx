import React, { useState, useEffect, useRef } from 'react';
import { ComfyApi } from './lib/comfyApi';
import { workflows } from './config/workflows';
import { WorkflowSelectorModal } from './components/WorkflowSelectorModal';
import { WorkflowForm } from './components/WorkflowForm';
import { EasyModeToggle } from './components/EasyModeToggle';
import { Button, Card } from './components/ui/components';
import './index.css';
import { Gallery } from './components/Gallery';
import { ImageComparisonSlider } from './components/ImageComparisonSlider';
import { FilePreview } from './components/FilePreview';
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
        {activeImage.isVideo ? (
          <video
            src={displayUrl}
            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '12px' }}
            autoPlay
            muted
            loop
            controls
            playsInline
          />
        ) : (
          <img src={displayUrl} alt="Lightbox" />
        )}

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
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(() => localStorage.getItem('selectedWorkflowId') || 'tryon');
  const [currentImage, setCurrentImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMediaReady, setIsMediaReady] = useState(true);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [history, setHistory] = useState(() => loadHistoryFromLocalStorage('galleryHistory')); // Store all generated images
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [activePromptId, setActivePromptId] = useState(() => localStorage.getItem('activePromptId'));
  const [formValues, setFormValues] = useState(() => loadFormFromLocalStorage('formValues'));
  const [dragActive, setDragActive] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [originalInputImage, setOriginalInputImage] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [easyMode, setEasyMode] = useState(() => {
    const saved = localStorage.getItem('easyMode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [suggestion, setSuggestion] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

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

  useEffect(() => {
    localStorage.setItem('easyMode', JSON.stringify(easyMode));
  }, [easyMode]);

  // Reset form on workflow selection
  useEffect(() => {

    if (selectedWorkflowId) {
      localStorage.setItem('selectedWorkflowId', selectedWorkflowId);
    } else {
      localStorage.removeItem('selectedWorkflowId');
    }

    // Clear suggestion when switching workflows
    setSuggestion(null);

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

      // FALLBACK UNLOCK: If we are processing but the server says the queue is empty, 
      // something might have gone wrong or finished without us seeing the final node.
      if (processingRef.current && data.status && data.status.exec_info.queue_remaining === 0) {
        console.debug('[UnlockFallback] Queue is empty but UI was still processing. Unlocking.');
        handleJobFinished();
      }
    };

    const handleJobFinished = () => {
      setIsProcessing(false);
      processingRef.current = false;
      setProgress(100);
      setTimeout(() => setProgress(0), 1000);

      localStorage.removeItem('activePromptId');
      setActivePromptId(null);
      setLogs(prev => [...prev, 'Generation Complete']);

      // Check for Easy Flow suggestions
      if (activeWorkflow && activeWorkflow.easyFlows) {
        setSuggestion(activeWorkflow.easyFlows[0]);
      }
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

      // Retrieve image or video
      const images = data.output.images;
      const videos = data.output.gifs; // VHS nodes usually output here

      const resultItems = videos || images;

      // 1. ALWAYS update the preview if we got any result (could be intermediate)
      if (resultItems && resultItems.length > 0) {
        const item = resultItems[0];
        // Check both 'gifs' key and filename extension
        const isVideo = !!videos ||
          (item.filename && (
            item.filename.toLowerCase().endsWith('.mp4') ||
            item.filename.toLowerCase().endsWith('.webm') ||
            item.filename.toLowerCase().endsWith('.gif')
          ));

        const url = `/view?filename=${item.filename}&subfolder=${item.subfolder}&type=${item.type}`;

        setIsMediaReady(false); // Mark as not ready until loaded in browser
        setCurrentImage(url);
        setLogs(prev => [...prev.slice(-4), isVideo ? 'Video Received' : 'Image Received']);

        // Add to history (deduplicate)
        setHistory(prev => {
          if (prev.length > 0 && prev[0].filename === item.filename) return prev;
          return [{ url, filename: item.filename, type: item.type, subfolder: item.subfolder, isVideo }, ...prev];
        });
      }

      // 2. DECIDE when to unlock the UI (mark job as complete)
      let shouldUnlock = false;
      const expectedNode = activeWorkflow?.outputNodeId;

      if (expectedNode) {
        // Use String() to avoid type mismatch (ComfyUI sends numbers sometimes)
        if (data.node && String(data.node) === String(expectedNode)) {
          shouldUnlock = true;
        } else {
          console.debug(`[UnlockCheck] Waiting for node ${expectedNode}, current node ${data.node}`);
        }
      } else {
        // Default Strict Behavior: Only unlock if we got images or videos
        if ((images && images.length > 0) || (videos && videos.length > 0)) {
          shouldUnlock = true;
        }
      }

      if (shouldUnlock) {
        handleJobFinished();
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
    comfy.on('execution_success', (data) => {
      if (!activePromptId || data.prompt_id !== activePromptId) return;
      console.debug('[UnlockSuccess] execution_success event received. Unlocking.');
      handleJobFinished();
    });

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
          let val = inputs[inputConfig.id];

          // Handle Hidden Templates (Wrapping)
          if (inputConfig.hiddenTemplate && typeof val === 'string') {
            val = inputConfig.hiddenTemplate.replace('{{value}}', val);
          }

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

  const handleApplySuggestion = async (sugg) => {
    const targetWf = workflows.find(w => w.id === sugg.targetWorkflow);
    if (!targetWf) return;

    // Convert current output to File
    const file = await urlToFile(currentImage, 'product_for_tryon.png');

    // Pre-fill target workflow
    const newValues = {};
    targetWf.inputs.forEach(input => {
      newValues[input.id] = input.defaultValue || '';
    });

    // Map output to input
    if (sugg.mapOutputTo) {
      newValues[sugg.mapOutputTo] = file;
    }

    setFormValues(newValues);
    setSelectedWorkflowId(targetWf.id);
    setSuggestion(null);
    setCurrentImage(null);
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
      {/* Mobile Header */}
      {selectedWorkflowId && (
        <div className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`status-indicator status-${status}`}></span>
            <div
              className="header-workflow-trigger"
              onClick={() => setIsPickerOpen(true)}
              style={{ padding: '0.2rem 0.8rem' }}
            >
              <h1 style={{ fontSize: '0.9rem' }}>
                {activeWorkflow ? (easyMode ? (activeWorkflow.easyAction || activeWorkflow.name) : activeWorkflow.name) : 'ALLAI'}
              </h1>
              <span className="chevron">▼</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <EasyModeToggle isEasyMode={easyMode} onToggle={() => setEasyMode(!easyMode)} />
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

      {/* Sidebar removed for direct navigation flow */}

      {/* Main Content */}
      <main className="main-content">
        <div className="fade-in">
          <header className="mobile-hide" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                className="header-workflow-trigger"
                onClick={() => setIsPickerOpen(true)}
              >
                <h1>{easyMode ? (activeWorkflow.easyAction || activeWorkflow.name) : activeWorkflow.name}</h1>
                <span className="chevron">▼</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <EasyModeToggle isEasyMode={easyMode} onToggle={() => setEasyMode(!easyMode)} />
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
              easyMode={easyMode}
              suggestion={suggestion}
              onApplySuggestion={handleApplySuggestion}
              onChange={handleValueChange}
              onFileChange={handleValueChange}
              onSubmit={handleWorkflowSubmit}
              isProcessing={isProcessing}
              isMediaReady={isMediaReady}
              onMediaReady={() => setIsMediaReady(true)}
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
      </main>
      {/* Workflow Picker Modal */}
      {isPickerOpen && (
        <WorkflowSelectorModal
          workflows={workflows}
          selectedId={selectedWorkflowId}
          onSelect={setSelectedWorkflowId}
          onClose={() => setIsPickerOpen(false)}
          easyMode={easyMode}
        />
      )}
    </div>
  );
}

export default App;
