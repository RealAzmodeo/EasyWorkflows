import React from 'react';
import { Button, Input } from './ui/components';

export const WorkflowForm = ({
    workflow,
    description,
    values,
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
    history = []
}) => {
    const [isSelectorOpen, setIsSelectorOpen] = React.useState(false);
    const [isPromptModalOpen, setIsPromptModalOpen] = React.useState(false);
    const [activeInputId, setActiveInputId] = React.useState(null);
    const [showAppGallery, setShowAppGallery] = React.useState(false);
    const fileInputRefs = React.useRef({});
    const cameraInputRefs = React.useRef({});

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
        <div className="workflow-layout-container">
            {/* 1. Main Scrollable Area: Node Description + Output Preview */}
            <div className="workflow-scroll-area">
                {description && (
                    <div className="workflow-legend">
                        {description}
                    </div>
                )}
                {preview}
            </div>

            {/* 2. Fixed Bottom Control Panel */}
            <div className="fixed-controls-panel">
                {/* Image Vertical Stack (Compact) */}
                {imageInputs.length > 0 && (
                    <div className="compact-image-inputs">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <h3 style={{ margin: 0, fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>IMAGES</h3>
                            {hasMultipleImages && (
                                <button
                                    type="button"
                                    className="text-btn-tiny"
                                    onClick={handleSwapImages}
                                >
                                    ⇅ SWAP
                                </button>
                            )}
                        </div>
                        <div className="horizontal-inputs-scroll">
                            {imageInputs.map(input => (
                                <div key={input.id} className="image-slot-mini">
                                    <div
                                        className={`mini-slot-box ${dragActive === input.id ? 'active' : ''}`}
                                        onDragEnter={(e) => onDrag(e, input.id)}
                                        onDragLeave={(e) => onDrag(e, null)}
                                        onClick={(e) => {
                                            if (values[input.id]) {
                                                e.stopPropagation();
                                                onImageClick(values[input.id] instanceof File ? URL.createObjectURL(values[input.id]) : values[input.id]);
                                            } else {
                                                openSelector(input.id);
                                            }
                                        }}
                                    >
                                        {values[input.id] ? (
                                            <>
                                                <img
                                                    src={values[input.id] instanceof File ? URL.createObjectURL(values[input.id]) : values[input.id]}
                                                    alt="Preview"
                                                />
                                                <button
                                                    className="remove-image-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onFileChange(input.id, null);
                                                    }}
                                                    title="Remove Image"
                                                >
                                                    ✕
                                                </button>
                                            </>
                                        ) : (
                                            <span style={{ fontSize: '1.8rem', opacity: 0.8, color: 'var(--primary)' }}>+</span>
                                        )}
                                        <input
                                            ref={el => fileInputRefs.current[input.id] = el}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => e.target.files?.[0] && onFileChange(input.id, e.target.files[0])}
                                            style={{ display: 'none' }}
                                        />
                                        <input
                                            ref={el => cameraInputRefs.current[input.id] = el}
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={(e) => e.target.files?.[0] && onFileChange(input.id, e.target.files[0])}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                    <span className="slot-label">{input.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Prompt & Main CTA */}
                <div className="prompt-controls-area">
                    {otherInputs.filter(i => i.id !== 'seed').map(input => (
                        <div key={input.id} className="prompt-summary-box">
                            <div className="prompt-content" onClick={() => input.id === 'prompt' && setIsPromptModalOpen(true)}>
                                <span className="prompt-label">{input.label.toUpperCase()}:</span>
                                <span className="prompt-text-preview">
                                    {values[input.id] || `Click to enter ${input.label.toLowerCase()}...`}
                                </span>
                            </div>
                            {input.id === 'prompt' && (
                                <button
                                    className="edit-prompt-btn"
                                    onClick={() => setIsPromptModalOpen(true)}
                                >
                                    EDIT
                                </button>
                            )}
                        </div>
                    ))}
                    <Button
                        onClick={onSubmit}
                        disabled={isProcessing}
                        fullWidth
                        className={`btn-generate ${isProcessing ? 'processing' : ''}`}
                    >
                        {isProcessing && (
                            <div
                                className="progress-fill"
                                style={{ width: `${progress}%` }}
                            />
                        )}
                        <span className="btn-text">
                            {isProcessing ? `GENERATING... ${progress}%` : 'GENERATE IMAGE'}
                        </span>
                    </Button>
                </div>
            </div>

            {/* Prompt Edit Modal */}
            {isPromptModalOpen && (
                <div className="modal-overlay" onClick={() => setIsPromptModalOpen(false)}>
                    <div className="prompt-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ margin: 0 }}>Edit Prompt</h3>
                            <button onClick={() => setIsPromptModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text)' }}>✕</button>
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
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', gap: '1rem' }}>
                            <Button
                                variant="outline"
                                style={{ flex: 1 }}
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
            )}

            {/* Image Source Selector Modal */}
            {isSelectorOpen && (
                <div className="modal-overlay" onClick={() => setIsSelectorOpen(false)}>
                    <div className="source-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ margin: 0 }}>{showAppGallery ? 'Select from App History' : 'Add Image'}</h3>
                            <button onClick={() => setIsSelectorOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text)' }}>✕</button>
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
            )}
        </div>
    );
};
