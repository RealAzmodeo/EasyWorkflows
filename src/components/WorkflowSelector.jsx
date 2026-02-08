import React from 'react';
import { Card } from './ui/components';

export const WorkflowSelector = ({ workflows, selectedId, onSelect }) => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', padding: '1rem' }}>
            {workflows.map(wf => (
                <div
                    key={wf.id}
                    onClick={() => onSelect(wf.id)}
                    className="glass-panel"
                    style={{
                        padding: '1.5rem',
                        cursor: 'pointer',
                        border: selectedId === wf.id ? '2px solid var(--primary)' : '1px solid transparent',
                        textAlign: 'left',
                        transition: 'all 0.2s'
                    }}
                >
                    <h3 style={{ marginTop: 0, color: selectedId === wf.id ? 'var(--primary)' : 'var(--text-primary)' }}>{wf.name}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{wf.description}</p>
                </div>
            ))}
        </div>
    );
};
