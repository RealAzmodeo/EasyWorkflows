import React, { useState } from 'react';

export const Gallery = ({ images, onDragStart }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);

    if (!images || images.length === 0) return null;

    const openModal = (index) => setSelectedImageIndex(index);
    const closeModal = () => setSelectedImageIndex(null);

    const navigate = (direction) => {
        if (selectedImageIndex === null) return;
        const newIndex = selectedImageIndex + direction;
        if (newIndex >= 0 && newIndex < images.length) {
            setSelectedImageIndex(newIndex);
        }
    };

    const selectedImage = selectedImageIndex !== null ? images[selectedImageIndex] : null;

    return (
        <div className="gallery-container" style={{ marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1rem', letterSpacing: '0.05em' }}>
                Session History
            </h3>

            {/* Grid View */}
            <div
                className="gallery-grid"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                    gap: '0.75rem',
                }}
            >
                {images.map((img, index) => (
                    <div
                        key={index}
                        style={{
                            aspectRatio: '1/1',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-sidebar)',
                            transition: 'opacity 0.2s'
                        }}
                        draggable
                        onDragStart={(e) => onDragStart(e, img)}
                        onClick={() => openModal(index)}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                        <img
                            src={img.url}
                            alt={`Generated ${index}`}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                pointerEvents: 'none'
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Modal */}
            {selectedImage && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                    }}
                    onClick={closeModal}
                >
                    <div
                        style={{ position: 'relative', maxWidth: '95%', maxHeight: '95%' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={selectedImage.url}
                            alt="Full view"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '90vh',
                                display: 'block',
                                borderRadius: '2px'
                            }}
                        />

                        <button
                            onClick={closeModal}
                            style={{
                                position: 'absolute',
                                top: '-40px',
                                right: 0,
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                padding: '10px'
                            }}
                        >
                            Close
                        </button>

                        {/* Navigation */}
                        <div style={{
                            position: 'absolute',
                            bottom: '-50px',
                            left: 0,
                            right: 0,
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '2rem',
                            color: 'white'
                        }}>
                            <button
                                onClick={() => navigate(-1)}
                                disabled={selectedImageIndex === 0}
                                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.4rem 1rem', cursor: 'pointer', opacity: selectedImageIndex === 0 ? 0.3 : 1 }}
                            >
                                Previous
                            </button>
                            <span style={{ alignSelf: 'center', fontSize: '0.9rem' }}>{selectedImageIndex + 1} / {images.length}</span>
                            <button
                                onClick={() => navigate(1)}
                                disabled={selectedImageIndex === images.length - 1}
                                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.4rem 1rem', cursor: 'pointer', opacity: selectedImageIndex === images.length - 1 ? 0.3 : 1 }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
