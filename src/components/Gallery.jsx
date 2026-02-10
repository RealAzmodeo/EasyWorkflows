import React from 'react';

export const Gallery = ({ images, onDragStart, onDelete, onDownload, onShare, onImageClick }) => {
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
                        cursor: 'pointer'
                    }}
                    draggable
                    onDragStart={(e) => onDragStart(e, img)}
                    onClick={() => onImageClick({ ...img, type: 'output' })}
                >
                    <div className="gallery-item-image-mask" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-sidebar)',
                    }}>
                        <img
                            src={img.url}
                            alt={`Generated ${index}`}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    </div>

                    {/* Management Overlays */}
                    <div className="action-btn-group">
                        <button
                            className="icon-btn-circle"
                            onClick={(e) => { e.stopPropagation(); onShare && onShare(img.url, img.filename); }}
                            title="Share"
                        >
                            <svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z" /></svg>
                        </button>
                        <button
                            className="icon-btn-circle"
                            onClick={(e) => { e.stopPropagation(); onDownload(img.url, img.filename); }}
                            title="Download"
                        >
                            <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /></svg>
                        </button>
                        <button
                            className="icon-btn-circle"
                            onClick={(e) => { e.stopPropagation(); onDelete(img.filename); }}
                            title="Delete"
                            style={{ color: '#ff4444' }}
                        >
                            <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
