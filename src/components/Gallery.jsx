import React from 'react';
import { Card } from './ui/components';

export const Gallery = ({ images, onDragStart }) => {
    if (!images || images.length === 0) return null;

    return (
        <div className="gallery-container" style={{ marginTop: '2rem' }}>
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Session Gallery</h3>
            <div
                className="gallery-grid"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '1rem',
                    padding: '1rem',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: 'var(--radius-md)'
                }}
            >
                {images.map((img, index) => (
                    <div
                        key={index}
                        className="gallery-item glass-panel"
                        style={{
                            padding: '0.5rem',
                            cursor: 'grab',
                            transition: 'transform 0.2s',
                            position: 'relative'
                        }}
                        draggable
                        onDragStart={(e) => onDragStart(e, img)}
                    >
                        <img
                            src={img.url}
                            alt={`Generated ${index}`}
                            style={{
                                width: '100%',
                                height: '120px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                pointerEvents: 'none' // Prevent default image drag to allow custom drag handling if needed, but for native drag we might want this. Actually standard HTML5 drag needs the element to be draggable.
                            }}
                        />
                        {/* Overlay or controls could go here */}
                    </div>
                ))}
            </div>
        </div>
    );
};
