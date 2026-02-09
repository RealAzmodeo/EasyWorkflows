import React from 'react';

export const WorkflowSelector = ({ workflows, selectedId, onSelect }) => {
    return (
        <div className="workflow-sidebar-list">
            <div className="sidebar-section-header">Workflows</div>
            {workflows.map(wf => (
                <div
                    key={wf.id}
                    onClick={() => onSelect(wf.id)}
                    className={`sidebar-item ${selectedId === wf.id ? 'active' : ''}`}
                >
                    <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', marginRight: '8px', fill: 'var(--text-secondary)', opacity: 0.7 }}>
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                    </svg>
                    {wf.name}
                </div>
            ))}
        </div>
    );
};
