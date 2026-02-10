import React, { useState, useRef, useEffect } from 'react';

export const CropSelector = ({ imageUrl, onChange, initialCrop }) => {
    const containerRef = useRef(null);
    const imageRef = useRef(null);
    const [crop, setCrop] = useState(initialCrop || { top: 10, left: 10, width: 80, height: 80 }); // Percentages
    const [isDragging, setIsDragging] = useState(false);
    const [dragType, setDragType] = useState(null); // 'move' or handle position
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e, type) => {
        e.preventDefault();
        setIsDragging(true);
        setDragType(type);
        setStartPos({ x: e.clientX, y: e.clientY });
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;

            const dx = (e.clientX - startPos.x) / containerRef.current.clientWidth * 100;
            const dy = (e.clientY - startPos.y) / containerRef.current.clientHeight * 100;

            setCrop(prev => {
                let next = { ...prev };
                if (dragType === 'move') {
                    next.left = Math.max(0, Math.min(100 - prev.width, prev.left + dx));
                    next.top = Math.max(0, Math.min(100 - prev.height, prev.top + dy));
                } else {
                    // Resize logic (simplified)
                    if (dragType.includes('right')) next.width = Math.max(10, Math.min(100 - prev.left, prev.width + dx));
                    if (dragType.includes('bottom')) next.height = Math.max(10, Math.min(100 - prev.top, prev.height + dy));
                }
                return next;
            });
            setStartPos({ x: e.clientX, y: e.clientY });
        };

        const handleTouchMove = (e) => {
            if (!isDragging) return;
            const touch = e.touches[0];
            const dx = (touch.clientX - startPos.x) / containerRef.current.clientWidth * 100;
            const dy = (touch.clientY - startPos.y) / containerRef.current.clientHeight * 100;

            setCrop(prev => {
                let next = { ...prev };
                if (dragType === 'move') {
                    next.left = Math.max(0, Math.min(100 - prev.width, prev.left + dx));
                    next.top = Math.max(0, Math.min(100 - prev.height, prev.top + dy));
                } else {
                    if (dragType.includes('right')) next.width = Math.max(10, Math.min(100 - prev.left, prev.width + dx));
                    if (dragType.includes('bottom')) next.height = Math.max(10, Math.min(100 - prev.top, prev.height + dy));
                }
                return next;
            });
            setStartPos({ x: touch.clientX, y: touch.clientY });
        };

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                if (imageRef.current) {
                    const { naturalWidth, naturalHeight } = imageRef.current;
                    const pixelCrop = {
                        crop_left: Math.round((crop.left / 100) * naturalWidth),
                        crop_top: Math.round((crop.top / 100) * naturalHeight),
                        crop_width: Math.round((crop.width / 100) * naturalWidth),
                        crop_height: Math.round((crop.height / 100) * naturalHeight),
                        crop_right: Math.max(0, naturalWidth - Math.round(((crop.left + crop.width) / 100) * naturalWidth)),
                        crop_bottom: Math.max(0, naturalHeight - Math.round(((crop.top + crop.height) / 100) * naturalHeight))
                    };
                    onChange(pixelCrop);
                }
            }
        };

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
    }, [isDragging, dragType, startPos, crop, onChange]);

    return (
        <div className="crop-selector-container" ref={containerRef} style={{ position: 'relative', overflow: 'hidden', cursor: isDragging ? 'grabbing' : 'default', touchAction: 'none' }}>
            <img
                ref={imageRef}
                src={imageUrl}
                alt="Crop Source"
                style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none', userSelect: 'none' }}
            />
            <div
                className="crop-overlay"
                style={{
                    position: 'absolute',
                    top: `${crop.top}%`,
                    left: `${crop.left}%`,
                    width: `${crop.width}%`,
                    height: `${crop.height}%`,
                    border: '2px solid var(--primary)',
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                    cursor: 'move'
                }}
                onMouseDown={(e) => handleMouseDown(e, 'move')}
                onTouchStart={(e) => {
                    const touch = e.touches[0];
                    handleMouseDown({ ...e, clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => e.preventDefault() }, 'move');
                }}
            >
                {/* Resize handles */}
                <div
                    style={{ position: 'absolute', right: -5, bottom: -5, width: 15, height: 15, background: 'var(--primary)', cursor: 'nwse-resize', borderRadius: '50%' }}
                    onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'bottom-right'); }}
                    onTouchStart={(e) => {
                        e.stopPropagation();
                        const touch = e.touches[0];
                        handleMouseDown({ ...e, clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => e.preventDefault() }, 'bottom-right');
                    }}
                />
            </div>
            <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', color: 'white', pointerEvents: 'none' }}>
                DRAG TO CROP
            </div>
        </div>
    );
};
