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
                    <span style={{ marginRight: '8px' }}>📑</span>
                    {wf.name}
                </div>
            ))}
        </div>
    );
};
