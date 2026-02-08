import React, { useState, useEffect } from 'react';
import { Button, Input, Card } from './ui/components';

export const WorkflowForm = ({ workflow, onSubmit, isProcessing, urlToFile }) => {
    const [values, setValues] = useState({});
    const [dragActive, setDragActive] = useState(null);

    // Initialize defaults
    useEffect(() => {
        if (workflow) {
            const defaults = {};
            workflow.inputs.forEach(input => {
                defaults[input.id] = input.defaultValue || '';
            });
            setValues(prev => ({ ...defaults, ...prev }));
        }
    }, [workflow]);

    const handleChange = (id, value) => {
        setValues(prev => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (id, file) => {
        setValues(prev => ({ ...prev, [id]: file }));
    };

    const handleDragOver = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if (dragActive !== id) setDragActive(id);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(null);
    };

    const handleDrop = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(null);

        // Check for Gallery Drop (JSON)
        const jsonData = e.dataTransfer.getData('application/json');
        if (jsonData) {
            try {
                const imgData = JSON.parse(jsonData);
                if (imgData.url && urlToFile) {
                    const file = await urlToFile(imgData.url, imgData.filename || 'generated.png');
                    handleFileChange(id, file);
                }
            } catch (err) {
                console.error("Failed to parse dropped gallery item", err);
            }
            return;
        }

        // Check for File Drop
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(id, e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(values);
    };

    if (!workflow) return null;

    return (
        <Card title={workflow.name} className="workflow-form">
            <form onSubmit={handleSubmit}>
                {workflow.inputs.map(input => (
                    <div key={input.id} style={{ marginBottom: '1.5rem' }}>
                        {input.type === 'text' && (
                            <div style={{ position: 'relative' }}>
                                <Input
                                    label={input.label}
                                    value={values[input.id] || ''}
                                    onChange={(e) => handleChange(input.id, e.target.value)}
                                    placeholder={input.placeholder}
                                />
                                {input.id === 'prompt' && (
                                    <button
                                        type="button"
                                        onClick={() => handleChange(input.id, input.defaultValue)}
                                        style={{
                                            position: 'absolute',
                                            right: 0,
                                            top: 0,
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--primary)',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            padding: '0.2rem 0.5rem',
                                        }}
                                        title="Reset to default prompt"
                                    >
                                        ↺ Reset
                                    </button>
                                )}
                            </div>
                        )}

                        {input.type === 'number' && input.id !== 'seed' && (
                            <Input
                                label={input.label}
                                type="number"
                                value={values[input.id] || ''}
                                onChange={(e) => handleChange(input.id, Number(e.target.value))}
                            />
                        )}

                        {input.type === 'image' && (
                            <div style={{ textAlign: 'left' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{input.label}</label>
                                <div
                                    className="glass-panel"
                                    style={{
                                        padding: '1rem',
                                        borderStyle: 'dashed',
                                        borderColor: dragActive === input.id ? 'var(--primary)' : 'rgba(255,255,255,0.2)',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        background: dragActive === input.id ? 'rgba(74, 222, 128, 0.1)' : 'transparent'
                                    }}
                                    onClick={() => document.getElementById(`file-${input.id}`).click()}
                                    onDragOver={(e) => handleDragOver(e, input.id)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, input.id)}
                                >
                                    {values[input.id] ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <img
                                                src={typeof values[input.id] === 'string' ? values[input.id] : URL.createObjectURL(values[input.id])}
                                                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                                            />
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Image selected</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{values[input.id].name}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>
                                            <div style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>🖼️</div>
                                            Click to upload or Drag from Gallery
                                        </div>
                                    )}
                                    <input
                                        id={`file-${input.id}`}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                handleFileChange(input.id, e.target.files[0]);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                    <Button type="submit" disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : 'Generate'}
                    </Button>
                </div>
            </form>
        </Card>
    );
};
