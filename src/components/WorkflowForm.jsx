import React, { useState, useEffect } from 'react';
import { Button, Input, Card } from './ui/components';

export const WorkflowForm = ({ workflow, onSubmit, isProcessing, urlToFile }) => {
    const [values, setValues] = useState({});
    const [dragActive, setDragActive] = useState(null);

    useEffect(() => {
        if (workflow) {
            setValues(prev => {
                const nextValues = {};
                workflow.inputs.forEach(input => {
                    // Only keep previous value if it's an image (for chaining) and it exists
                    if (input.type === 'image' && prev[input.id]) {
                        nextValues[input.id] = prev[input.id];
                    } else {
                        // For everything else (especially prompts), use the new workflow default
                        nextValues[input.id] = input.defaultValue || '';
                    }
                });
                return nextValues;
            });
        }
    }, [workflow]);

    const handleChange = (id, value) => setValues(prev => ({ ...prev, [id]: value }));
    const handleFileChange = (id, file) => setValues(prev => ({ ...prev, [id]: file }));

    const handleDragOver = (e, id) => {
        e.preventDefault();
        if (dragActive !== id) setDragActive(id);
    };

    const handleDragLeave = () => setDragActive(null);

    const handleDrop = async (e, id) => {
        e.preventDefault();
        setDragActive(null);

        const jsonData = e.dataTransfer.getData('application/json');
        if (jsonData) {
            try {
                const imgData = JSON.parse(jsonData);
                if (imgData.url && urlToFile) {
                    const file = await urlToFile(imgData.url, imgData.filename || 'generated.png');
                    handleFileChange(id, file);
                }
            } catch (err) {
                console.error("Gallery drop error:", err);
            }
            return;
        }

        if (e.dataTransfer.files?.[0]) {
            handleFileChange(id, e.dataTransfer.files[0]);
        }
    };

    const handleSwapImages = () => {
        const imageInputs = workflow.inputs.filter(i => i.type === 'image');
        if (imageInputs.length >= 2) {
            const id1 = imageInputs[0].id;
            const id2 = imageInputs[1].id;
            setValues(prev => ({
                ...prev,
                [id1]: prev[id2],
                [id2]: prev[id1]
            }));
        }
    };

    if (!workflow) return null;

    const hasMultipleImages = workflow.inputs.filter(i => i.type === 'image').length >= 2;

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(values); }}>
            <Card title="Input Parameters">
                {hasMultipleImages && (
                    <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleSwapImages}
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                        >
                            ⇅ Swap Images
                        </Button>
                    </div>
                )}
                {workflow.inputs.map(input => (
                    <div key={input.id}>
                        {input.type === 'text' && (
                            <div style={{ position: 'relative' }}>
                                <Input
                                    label={input.label}
                                    value={values[input.id] || ''}
                                    onChange={(e) => handleChange(input.id, e.target.value)}
                                    placeholder={input.placeholder}
                                    type={input.id === 'prompt' ? 'textarea' : 'text'}
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
                                            fontSize: '0.7rem',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        RESET
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
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-secondary)' }}>{input.label}</label>
                                <div
                                    style={{
                                        padding: '1.5rem',
                                        border: `1px dashed ${dragActive === input.id ? 'var(--primary)' : 'var(--border)'}`,
                                        borderRadius: 'var(--radius)',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        background: dragActive === input.id ? 'var(--bg-hover)' : 'var(--input-bg)',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => document.getElementById(`file-${input.id}`).click()}
                                    onDragOver={(e) => handleDragOver(e, input.id)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, input.id)}
                                >
                                    {values[input.id] ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}>
                                            <img
                                                src={typeof values[input.id] === 'string' ? values[input.id] : URL.createObjectURL(values[input.id])}
                                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '2px', border: '1px solid var(--border)' }}
                                            />
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {values[input.id].name || 'Image selected'}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                            Click or Drag to Upload
                                        </div>
                                    )}
                                    <input
                                        id={`file-${input.id}`}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={(e) => e.target.files?.[0] && handleFileChange(input.id, e.target.files[0])}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                <div style={{ marginTop: '1rem' }}>
                    <Button type="submit" disabled={isProcessing} style={{ width: '100%' }}>
                        {isProcessing ? 'Processing...' : 'Run Workflow'}
                    </Button>
                </div>
            </Card>
        </form>
    );
};
