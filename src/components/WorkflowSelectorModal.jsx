import React from 'react';

export const WorkflowSelectorModal = ({ workflows, selectedId, onSelect, onClose, easyMode }) => {
    // Filter workflows for Easy Mode
    const displayWorkflows = easyMode ? workflows.filter(wf => wf.easyMode) : workflows;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="workflow-picker-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>CHOOSE YOUR STYLE</h3>
                    <button onClick={onClose} className="modal-close-btn">✕</button>
                </div>

                <div className="workflow-picker-grid">
                    {displayWorkflows.map(wf => (
                        <div
                            key={wf.id}
                            onClick={() => {
                                onSelect(wf.id);
                                onClose();
                            }}
                            className={`picker-item ${selectedId === wf.id ? 'active' : ''}`}
                        >
                            <div className="picker-icon">
                                {wf.icon || '✨'}
                            </div>
                            <div className="picker-info">
                                <div className="picker-name">
                                    {easyMode ? (wf.easyAction || wf.name) : wf.name}
                                </div>
                                {!easyMode && (
                                    <div className="picker-desc">{wf.description?.substring(0, 40)}...</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
