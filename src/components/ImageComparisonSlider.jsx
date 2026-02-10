import React, { useState, useRef, useEffect } from 'react';

export const ImageComparisonSlider = ({ beforeImage, afterImage, className = "" }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleMove = (e) => {
        if (!isDragging && e.type !== 'touchmove') return;

        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const x = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const relativeX = x - rect.left;
        const position = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));

        setSliderPosition(position);
    };

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchend', handleMouseUp);
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`comparison-container ${className}`}
            onMouseMove={handleMove}
            onTouchMove={handleMove}
            onMouseDown={handleMouseDown}
            onDragStart={(e) => e.preventDefault()}
            style={{
                position: 'relative',
                overflow: 'hidden',
                cursor: isDragging ? 'col-resize' : 'default',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'none'
            }}
        >
            {/* After Image (Full background) - Acts as the size reference */}
            <img
                src={afterImage}
                alt="After"
                className="comparison-img after-img"
                draggable="false"
                style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
            />

            {/* Before Image (Clipped) */}
            <div
                className="before-wrapper"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                    pointerEvents: 'none',
                    userSelect: 'none'
                }}
            >
                <img
                    src={beforeImage}
                    alt="Before"
                    className="comparison-img before-img"
                    draggable="false"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block'
                    }}
                />
            </div>

            {/* Slider Handle */}
            <div
                className="slider-divider"
                style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${sliderPosition}%`,
                    width: '2px',
                    background: 'white',
                    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                    cursor: 'col-resize',
                    // zIndex removed to prevent overlay issues
                    userSelect: 'none'
                }}
            >
                <div className="slider-handle">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
                        <path d="M8.59,16.59L13.17,12L8.59,7.41L10,6l6,6l-6,6L8.59,16.59z M15.41,16.59L10.83,12l4.58-4.59L14,6l-6,6l6,6L15.41,16.59z" />
                    </svg>
                </div>
            </div>

            {/* Labels */}
            <div className="comparison-label before" style={{ left: '10px' }}>ORIGINAL</div>
            <div className="comparison-label after" style={{ right: '10px' }}>RESULT</div>
        </div>
    );
};
