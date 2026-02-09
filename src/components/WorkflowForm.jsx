import React from 'react';
import { Button, Input } from './ui/components';

export const WorkflowForm = ({
    workflow,
    values,
    onChange,
    onFileChange,
    onSubmit,
    isProcessing,
    dragActive,
    onDrag,
    onDrop,
    onImageClick,
    preview
}) => {
    if (!workflow) return null;

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
            {/* 1. Top Section: Result Preview (Moved to Top) */}
            {preview}

            {/* 2. Workflow Description (Explicación) */}
            <div style={{ margin: '1rem 0', opacity: 0.9, fontSize: '0.95rem', fontStyle: 'italic', borderLeft: '4px solid var(--primary)', paddingLeft: '1rem', color: 'var(--text)' }}>
                {workflow.description}
            </div>

            {/* 3. Image Inputs (Horizontal) */}
            {imageInputs.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>INPUTS</h3>
                        {hasMultipleImages && (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleSwapImages}
                                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderRadius: '6px' }}
                            >
                                ⇅ SWAP
                            </Button>
                        )}
                    </div>
                    <div className="horizontal-inputs" style={{
                        display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.8rem', scrollbarWidth: 'none'
                    }}>
                        {imageInputs.map(input => (
                            <div key={input.id} style={{ minWidth: '140px', flex: '0 0 140px' }}>
                                <label style={{ display: 'block', fontSize: '0.6rem', marginBottom: '0.3rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                                    {input.label}
                                </label>
                                <div
                                    onDragEnter={(e) => onDrag(e, input.id)}
                                    onDragLeave={(e) => onDrag(e, null)}
                                    onClick={(e) => {
                                        if (values[input.id]) {
                                            e.stopPropagation();
                                            onImageClick(values[input.id] instanceof File ? URL.createObjectURL(values[input.id]) : values[input.id]);
                                        } else {
                                            document.getElementById(`file-${input.id}`).click();
                                        }
                                    }}
                                    style={{
                                        position: 'relative',
                                        aspectRatio: '1/1',
                                        border: `1px dashed ${dragActive === input.id ? 'var(--primary)' : 'var(--border)'}`,
                                        borderRadius: '8px',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        background: dragActive === input.id ? 'var(--bg-hover)' : 'var(--input-bg)',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {values[input.id] ? (
                                        <img
                                            src={values[input.id] instanceof File ? URL.createObjectURL(values[input.id]) : values[input.id]}
                                            alt="Preview"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                            <span style={{ fontSize: '1.5rem' }}>+</span>
                                        </div>
                                    )}
                                    <input id={`file-${input.id}`} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onFileChange(input.id, e.target.files[0])} style={{ display: 'none' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. Bottom Section: Params & Generate */}
            <div style={{ marginTop: '0.5rem' }}>
                {otherInputs.filter(i => i.id !== 'seed').map(input => (
                    <div key={input.id} style={{ position: 'relative', marginBottom: '1.2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <label style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                                {input.label}
                            </label>
                            {input.id === 'prompt' && (
                                <button
                                    className="icon-btn-reset"
                                    type="button"
                                    onClick={() => onChange(input.id, input.defaultValue)}
                                    title="Reset Prompt"
                                    style={{ fontSize: '1rem' }}
                                >
                                    🔄
                                </button>
                            )}
                        </div>
                        <Input
                            placeholder={input.placeholder}
                            value={values[input.id] || ''}
                            onChange={(e) => onChange(input.id, e.target.value)}
                            type={input.id === 'prompt' ? 'textarea' : 'text'}
                            rows={input.id === 'prompt' ? 3 : 1}
                        />
                    </div>
                ))}

                <Button
                    onClick={() => onSubmit(values)}
                    variant="primary"
                    style={{
                        width: '100%',
                        padding: '1.2rem',
                        fontSize: '1.1rem',
                        marginTop: '0.5rem',
                        fontWeight: 'bold',
                        letterSpacing: '0.05em',
                        borderRadius: '12px',
                        boxShadow: '0 8px 25px rgba(35, 131, 226, 0.3)'
                    }}
                    disabled={isProcessing}
                >
                    {isProcessing ? '⚡ GENERATING...' : '✨ RUN WORKFLOW'}
                </Button>
            </div>
        </div>
    );
};
