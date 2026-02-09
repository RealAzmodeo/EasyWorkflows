import React from 'react';

export const Gallery = ({ images, onDragStart, onDelete, onDownload, onImageClick }) => {
    if (!images || images.length === 0) return null;

    return (
        <div className="gallery-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '1rem',
        }}>
            {images.map((img, index) => (
                <div
                    key={index}
                    className="gallery-item-wrapper"
                    style={{
                        position: 'relative',
                        aspectRatio: '1/1',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-sidebar)',
                        cursor: 'pointer'
                    }}
                    draggable
                    onDragStart={(e) => onDragStart(e, img)}
                    onClick={() => onImageClick(img.url)}
                >
                    <img
                        src={img.url}
                        alt={`Generated ${index}`}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />

                    {/* Management Overlays */}
                    <div className="gallery-item-actions">
                        <button
                            className="action-btn delete"
                            onClick={(e) => { e.stopPropagation(); onDelete(img.filename); }}
                            title="Delete"
                        >
                            🗑️
                        </button>
                        <button
                            className="action-btn download"
                            onClick={(e) => { e.stopPropagation(); onDownload(img.url, img.filename); }}
                            title="Download"
                        >
                            ⬇️
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
