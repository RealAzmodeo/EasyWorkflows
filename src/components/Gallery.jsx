import React, { useState } from 'react';

export const Gallery = ({ images, onDragStart }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);

    if (!images || images.length === 0) return null;

    const openModal = (index) => {
        setSelectedImageIndex(index);
    };

    const closeModal = () => {
        setSelectedImageIndex(null);
    };

    const navigate = (direction) => {
        if (selectedImageIndex === null) return;
        const newIndex = selectedImageIndex + direction;
        if (newIndex >= 0 && newIndex < images.length) {
            setSelectedImageIndex(newIndex);
        }
    };

    const selectedImage = selectedImageIndex !== null ? images[selectedImageIndex] : null;

    return (
        <div className="gallery-container" style={{ marginTop: '2rem' }}>
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Session Gallery</h3>

            {/* Grid View */}
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
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            position: 'relative'
                        }}
                        draggable
                        onDragStart={(e) => onDragStart(e, img)}
                        onClick={() => openModal(index)}
                    >
                        <img
                            src={img.url}
                            alt={`Generated ${index}`}
                            style={{
                                width: '100%',
                                height: '120px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                pointerEvents: 'none'
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="modal-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        backdropFilter: 'blur(5px)'
                    }}
                    onClick={closeModal}
                >
                    <div
                        className="modal-content"
                        style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}
                        onClick={(e) => e.stopPropagation()} // Prevent close when clicking content
                    >
                        <img
                            src={selectedImage.url}
                            alt="Full view"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '90vh',
                                borderRadius: '8px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                            }}
                        />

                        <button
                            onClick={closeModal}
                            style={{
                                position: 'absolute',
                                top: '-40px',
                                right: '-40px',
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                fontSize: '2rem',
                                cursor: 'pointer'
                            }}
                        >
                            ×
                        </button>

                        {/* Navigation Buttons */}
                        {selectedImageIndex > 0 && (
                            <button
                                onClick={() => navigate(-1)}
                                style={{
                                    position: 'absolute',
                                    left: '-60px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    color: 'white',
                                    padding: '1rem',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    fontSize: '1.5rem'
                                }}
                            >
                                ‹
                            </button>
                        )}

                        {selectedImageIndex < images.length - 1 && (
                            <button
                                onClick={() => navigate(1)}
                                style={{
                                    position: 'absolute',
                                    right: '-60px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    color: 'white',
                                    padding: '1rem',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    fontSize: '1.5rem'
                                }}
                            >
                                ›
                            </button>
                        )}

                        <div style={{ textAlign: 'center', color: '#ccc', marginTop: '1rem' }}>
                            {selectedImageIndex + 1} / {images.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
