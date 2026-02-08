import React, { useState, useEffect } from 'react';
import { Button, Input, Card } from './ui/components';

export const WorkflowForm = ({ workflow, onSubmit, isProcessing }) => {
    const [values, setValues] = useState({});

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
                            <Input
                                label={input.label}
                                value={values[input.id] || ''}
                                onChange={(e) => handleChange(input.id, e.target.value)}
                                placeholder={input.placeholder}
                            />
                        )}

                        {input.type === 'number' && (
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
                                        textAlign: 'center',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => document.getElementById(`file-${input.id}`).click()}
                                >
                                    {values[input.id] ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <img
                                                src={typeof values[input.id] === 'string' ? values[input.id] : URL.createObjectURL(values[input.id])}
                                                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                                            />
                                            <span>{values[input.id].name || 'Image selected'}</span>
                                        </div>
                                    ) : (
                                        <span style={{ color: 'var(--text-secondary)' }}>Click to upload image</span>
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
