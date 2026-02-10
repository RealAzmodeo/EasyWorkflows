import React, { useState, useRef } from 'react';
import { Button, Input } from './ui/components';
import { FilePreview } from './FilePreview';
import { ImageComparisonSlider } from './ImageComparisonSlider';

export const WorkflowForm = ({
    workflow,
    description,
    values = {},
    onChange,
    onFileChange,
    onSubmit,
    isProcessing,
    progress,
    dragActive,
    onDrag,
    onDrop,
    onImageClick,
    preview,
    history = [],
    originalInputImage,
    currentImage,
    setCurrentImage
}) => {
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
    const [activeInputId, setActiveInputId] = useState(null);
    const [showAppGallery, setShowAppGallery] = useState(false);
    const fileInputRefs = useRef({});
    const cameraInputRefs = useRef({});

    if (!workflow) return null;

    const openSelector = (id) => {
        setActiveInputId(id);
        setIsSelectorOpen(true);
        setShowAppGallery(false);
    };

    const handleSourceSelect = (source) => {
        if (source === 'gallery') {
            fileInputRefs.current[activeInputId]?.click();
            setIsSelectorOpen(false);
        } else if (source === 'camera') {
            cameraInputRefs.current[activeInputId]?.click();
            setIsSelectorOpen(false);
        } else if (source === 'app') {
            setShowAppGallery(true);
        }
    };

    const selectFromAppGallery = async (img) => {
        // Helper: Convert URL to File object for re-upload
        const urlToFile = async (url, filename) => {
            const response = await fetch(url);
            const blob = await response.blob();
            return new File([blob], filename, { type: blob.type });
        };

        const file = await urlToFile(img.url, img.filename || 'picked.png');
        onFileChange(activeInputId, file);
        setIsSelectorOpen(false);
        setShowAppGallery(false);
    };

    const handleSwapImages = () => {
        const imageInputs = workflow.inputs.filter(i => i.type === 'image');
        if (imageInputs.length >= 2) {
            const id1 = imageInputs[0].id;
            const id2 = imageInputs[1].id;
            onChange(id1, values[id2]);
            onChange(id2, values[id1]);
        }
    };

    const imageInputs = workflow.inputs.filter(i => i.type === 'image');
    const otherInputs = workflow.inputs.filter(i => i.type !== 'image');
    const hasMultipleImages = imageInputs.length >= 2;

    return (
        <div className="one-page-layout">
            {/* a. Header bar is handled in App.jsx */}


            <div className="main-creation-grid">
                {/* c. Output Section (Frame) */}
                <div className="output-column">
                    <div className="output-frame">
                        {currentImage ? (
                            <div className="output-media-container">
                                {originalInputImage && workflow.id !== 'extractproduct' ? (
                                    <ImageComparisonSlider
                                        beforeImage={originalInputImage}
                                        afterImage={currentImage}
                                        className="one-page-preview"
                                    />
                                ) : (
                                    <img
                                        src={currentImage}
                                        alt="Generated"
                                        className="one-page-preview clickable"
                                        onClick={() => onImageClick({ url: currentImage, type: 'output' })}
                                    />
                                )}
                                <div className="output-frame-actions">
                                    <button
                                        className="frame-action-btn"
                                        onClick={() => onImageClick({ url: currentImage, type: 'output' })}
                                        title="Open Large View"
                                    >
                                        <svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="output-placeholder">
                                {isProcessing ? (
                                    <div className="loading-state">
                                        <div className="premium-spinner"></div>
                                        <div className="loading-bar-container">
                                            <div className="loading-bar-fill" style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <span className="loading-text">CREATING... {progress}%</span>
                                    </div>
                                ) : (
                                    <div className="output-info-content">
                                        <span className="placeholder-text">READY TO CREATE</span>
                                        {description && (
                                            <div className="output-workflow-desc">
                                                {description}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>


                </div>

                {/* History Navigator Removed from here - Access via Header/Menu */}

                {/* d. Input Section */}
                <div className="input-column">
                    <div className="input-card">
                        <h3 className="section-subtitle">SOURCE IMAGES</h3>
                        <div className="image-inputs-container has-swap">
                            <div className="image-inputs-grid">
                                {imageInputs[0] && (
                                    <div className="image-input-slot slot-left">
                                        <div
                                            className={`slot-target ${dragActive === imageInputs[0].id ? 'dragging' : ''} ${values[imageInputs[0].id] ? 'has-image' : ''}`}
                                            onDragEnter={(e) => onDrag(e, imageInputs[0].id)}
                                            onDragLeave={(e) => onDrag(e, null)}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => onDrop(e, imageInputs[0].id)}
                                            onClick={() => {
                                                if (values[imageInputs[0].id]) {
                                                    const blobUrl = URL.createObjectURL(values[imageInputs[0].id]);
                                                    onImageClick({ url: blobUrl, type: 'input', inputId: imageInputs[0].id });
                                                } else {
                                                    openSelector(imageInputs[0].id);
                                                }
                                            }}
                                        >
                                            {values[imageInputs[0].id] ? (
                                                <>
                                                    <FilePreview file={values[imageInputs[0].id]} />
                                                    <div className="slot-overlay">
                                                        <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
                                                    </div>
                                                    <button
                                                        className="input-remove-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onChange(imageInputs[0].id, null);
                                                        }}
                                                        title="Remove Image"
                                                    >
                                                        ✕
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="slot-empty">
                                                    <span className="plus">+</span>
                                                    <span className="label">{imageInputs[0].label}</span>
                                                </div>
                                            )}
                                            <input
                                                ref={el => fileInputRefs.current[imageInputs[0].id] = el}
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => e.target.files?.[0] && onFileChange(imageInputs[0].id, e.target.files[0])}
                                                style={{ display: 'none' }}
                                            />
                                            <input
                                                ref={el => cameraInputRefs.current[imageInputs[0].id] = el}
                                                type="file"
                                                accept="image/*"
                                                capture="environment"
                                                onChange={(e) => e.target.files?.[0] && onFileChange(imageInputs[0].id, e.target.files[0])}
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {hasMultipleImages && (
                                    <div className="swap-mid-col">
                                        <button className="swap-button" onClick={handleSwapImages} title="Swap Images">
                                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                                <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
                                            </svg>
                                        </button>
                                    </div>
                                )}

                                {imageInputs[1] && (
                                    <div className="image-input-slot slot-right">
                                        <div
                                            className={`slot-target ${dragActive === imageInputs[1].id ? 'dragging' : ''} ${values[imageInputs[1].id] ? 'has-image' : ''}`}
                                            onDragEnter={(e) => onDrag(e, imageInputs[1].id)}
                                            onDragLeave={(e) => onDrag(e, null)}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => onDrop(e, imageInputs[1].id)}
                                            onClick={() => {
                                                if (values[imageInputs[1].id]) {
                                                    const blobUrl = URL.createObjectURL(values[imageInputs[1].id]);
                                                    onImageClick({ url: blobUrl, type: 'input', inputId: imageInputs[1].id });
                                                } else {
                                                    openSelector(imageInputs[1].id);
                                                }
                                            }}
                                        >
                                            {values[imageInputs[1].id] ? (
                                                <>
                                                    <FilePreview file={values[imageInputs[1].id]} />
                                                    <div className="slot-overlay">
                                                        <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
                                                    </div>
                                                    <button
                                                        className="input-remove-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onChange(imageInputs[1].id, null);
                                                        }}
                                                        title="Remove Image"
                                                    >
                                                        ✕
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="slot-empty">
                                                    <span className="plus">+</span>
                                                    <span className="label">{imageInputs[1].label}</span>
                                                </div>
                                            )}
                                            <input
                                                ref={el => fileInputRefs.current[imageInputs[1].id] = el}
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => e.target.files?.[0] && onFileChange(imageInputs[1].id, e.target.files[0])}
                                                style={{ display: 'none' }}
                                            />
                                            <input
                                                ref={el => cameraInputRefs.current[imageInputs[1].id] = el}
                                                type="file"
                                                accept="image/*"
                                                capture="environment"
                                                onChange={(e) => e.target.files?.[0] && onFileChange(imageInputs[1].id, e.target.files[0])}
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Fallback for remaining images if any (rare in these workflows) */}
                                {imageInputs.slice(2).map(input => (
                                    <div key={input.id} className="image-input-slot">
                                        {/* Reuse your existing logic here if needed, but primary focus is the main two */}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* e. Prompt Section */}
                        <div className="prompt-section">
                            <h3 className="section-subtitle">CREATIVE PROMPT</h3>
                            {otherInputs.filter(i => i.id === 'prompt').map(input => (
                                <div key={input.id} className="prompt-container" onClick={() => setIsPromptModalOpen(true)}>
                                    <div className="prompt-display">
                                        {values[input.id] || "Enter your instructions here..."}
                                    </div>
                                    <button className="prompt-edit-icon">
                                        <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>
                                    </button>
                                </div>
                            ))}


                            {/* Pro Tips / Trigger Words moved to Modal */}
                        </div>

                        {/* f. Generation Button */}
                        <button
                            className={`main-generate-btn ${isProcessing ? 'loading' : ''}`}
                            onClick={onSubmit}
                            disabled={isProcessing}
                        >
                            <span className="btn-bg" style={{ width: `${progress}%` }}></span>
                            <span className="btn-label">
                                {isProcessing ? `GENERATING... ${progress}%` : 'GENERATE IMAGE'}
                            </span>
                        </button>
                        {/* Prompt Edit Modal */}
                        {isPromptModalOpen && (
                            <div className="modal-overlay" onClick={() => setIsPromptModalOpen(false)}>
                                <div className="prompt-modal" onClick={e => e.stopPropagation()}>
                                    <div className="modal-header">
                                        <h3>Edit Prompt</h3>
                                        <button onClick={() => setIsPromptModalOpen(false)} className="modal-close-btn">✕</button>
                                    </div>
                                    <div className="modal-body">
                                        <Input
                                            placeholder="Enter your prompt here..."
                                            value={values['prompt'] || ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                onChange('prompt', val);
                                            }}
                                            onBlur={(e) => {
                                                if (!e.target.value.trim()) {
                                                    const defaultVal = workflow.inputs.find(i => i.id === 'prompt')?.defaultValue || '';
                                                    onChange('prompt', defaultVal);
                                                }
                                            }}
                                            type="textarea"
                                            rows={8}
                                            autoFocus
                                        />

                                        {/* Suggestions inside Modal */}
                                        {workflow.triggerWords && (
                                            <div style={{ marginTop: '1rem' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>SUGGESTED WORDS</div>
                                                <div className="quick-tags">
                                                    {workflow.triggerWords.map((word, i) => (
                                                        <span
                                                            key={i}
                                                            className="tip-tag"
                                                            onClick={() => {
                                                                const current = values['prompt'] || '';
                                                                // Append if not already there
                                                                if (!current.includes(word)) {
                                                                    const newVal = current ? `${current}, ${word}` : word;
                                                                    onChange('prompt', newVal);
                                                                }
                                                            }}
                                                        >
                                                            {word}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="modal-footer modal-footer-flex">
                                        <Button
                                            variant="secondary"
                                            className="btn-ghost"
                                            onClick={() => {
                                                const defaultVal = workflow.inputs.find(i => i.id === 'prompt')?.defaultValue || '';
                                                onChange('prompt', defaultVal);
                                            }}
                                        >
                                            RESTORE DEFAULT
                                        </Button>
                                        <Button onClick={() => setIsPromptModalOpen(false)} style={{ flex: 1 }}>
                                            DONE
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )
                        }

                        {/* Image Source Selector Modal */}
                        {
                            isSelectorOpen && (
                                <div className="modal-overlay" onClick={() => setIsSelectorOpen(false)}>
                                    <div className="source-modal" onClick={e => e.stopPropagation()}>
                                        <div className="modal-header">
                                            <h3>{showAppGallery ? 'Select from App History' : 'Add Image'}</h3>
                                            <button onClick={() => setIsSelectorOpen(false)} className="modal-close-btn">✕</button>
                                        </div>

                                        {!showAppGallery ? (
                                            <div className="source-options">
                                                <button className="source-opt-btn" onClick={() => handleSourceSelect('app')}>
                                                    <svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" /></svg>
                                                    <div>
                                                        <div style={{ fontWeight: 600 }}>App Gallery</div>
                                                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Re-use from this session</div>
                                                    </div>
                                                </button>
                                                <button className="source-opt-btn" onClick={() => handleSourceSelect('gallery')}>
                                                    <svg viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" /></svg>
                                                    <div>
                                                        <div style={{ fontWeight: 600 }}>Phone Gallery</div>
                                                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Pick a file from your device</div>
                                                    </div>
                                                </button>
                                                <button className="source-opt-btn" onClick={() => handleSourceSelect('camera')}>
                                                    <svg viewBox="0 0 24 24"><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" /></svg>
                                                    <div>
                                                        <div style={{ fontWeight: 600 }}>Camera</div>
                                                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Take a photo now</div>
                                                    </div>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="app-gallery-picker">
                                                {history.length > 0 ? history.map((img, i) => (
                                                    <img
                                                        key={i}
                                                        src={img.url}
                                                        className="picker-img"
                                                        onClick={() => selectFromAppGallery(img)}
                                                        onDoubleClick={() => onImageClick({ url: img.url, type: 'output' })}
                                                    />
                                                )) : (
                                                    <div style={{ gridColumn: 'span 3', padding: '2rem', textAlign: 'center', opacity: 0.5 }}>
                                                        No images in history yet.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};
