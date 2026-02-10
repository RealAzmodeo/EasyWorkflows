import React, { useState, useRef, useEffect } from 'react';

export const CameraAngleSelector = ({ onChange, values, imageUrl }) => {
    const padRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    // Default or current values
    const hAngle = values.horizontal_angle ?? 180;
    const vAngle = values.vertical_angle ?? 0;
    const zoom = values.zoom ?? 5;

    const handlePadInteraction = (clientX, clientY) => {
        const rect = padRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

        onChange({
            horizontal_angle: Math.round(x * 360),
            vertical_angle: Math.round((1 - y) * 180 - 90)
        });
    };

    const onMouseDown = (e) => {
        setIsDragging(true);
        handlePadInteraction(e.clientX, e.clientY);
    };

    const onTouchStart = (e) => {
        setIsDragging(true);
        const touch = e.touches[0];
        handlePadInteraction(touch.clientX, touch.clientY);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging) handlePadInteraction(e.clientX, e.clientY);
        };
        const handleTouchMove = (e) => {
            if (isDragging) {
                const touch = e.touches[0];
                handlePadInteraction(touch.clientX, touch.clientY);
                if (e.cancelable) e.preventDefault();
            }
        };
        const handleMouseUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div className="camera-selector">
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', display: 'block' }}>
                CAMERA ORIENTATION
            </label>

            <div
                ref={padRef}
                className="angle-pad"
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
                style={{
                    width: '100%',
                    aspectRatio: '16/9',
                    background: 'var(--bg-sidebar)',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    position: 'relative',
                    cursor: 'crosshair',
                    marginBottom: '15px',
                    overflow: 'hidden',
                    touchAction: 'none'
                }}
            >
                {/* Visual Background Preview */}
                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt="Preview"
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: 0.15,
                            filter: 'grayscale(100%)',
                            pointerEvents: 'none'
                        }}
                    />
                )}
                {/* Grid Lines */}
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--border)', opacity: 0.5 }} />
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'var(--border)', opacity: 0.5 }} />

                {/* Visual Camera Indicator */}
                <div
                    style={{
                        position: 'absolute',
                        left: `${(hAngle / 360) * 100}%`,
                        top: `${(1 - (vAngle + 90) / 180) * 100}%`,
                        width: '24px',
                        height: '24px',
                        background: 'var(--primary)',
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)',
                        boxShadow: '0 0 15px var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: isDragging ? 'none' : 'all 0.2s'
                    }}
                >
                    <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px', fill: 'white' }}>
                        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
                    </svg>
                </div>
                <div style={{ position: 'absolute', bottom: 8, right: 8, fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
                    H: {hAngle}° V: {vAngle}°
                </div>
            </div>

            <div className="zoom-control">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600 }}>ZOOM</label>
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>{zoom.toFixed(1)}x</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="15"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => onChange({ zoom: parseFloat(e.target.value) })}
                    style={{ height: '4px' }}
                />
            </div>
        </div>
    );
};
