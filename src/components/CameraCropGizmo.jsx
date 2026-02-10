import React, { useState, useRef, useEffect } from 'react';

export const CameraCropGizmo = ({ imageUrl, onCameraChange, cameraValues }) => {
    const containerRef = useRef(null);
    const stageRef = useRef(null);
    const imageRef = useRef(null);

    const [isDragging, setIsDragging] = useState(false);
    const [dragType, setDragType] = useState(null); // 'h-ring', 'v-arc'
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    const hAngle = cameraValues.horizontal_angle ?? 180;
    const vAngle = cameraValues.vertical_angle ?? 0;
    const zoom = cameraValues.zoom ?? 5;

    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (imageUrl instanceof File) {
            const url = URL.createObjectURL(imageUrl);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(imageUrl);
        }
    }, [imageUrl]);

    // INITIAL SYNC: Push defaults to parent on mount/image load
    const isInitialized = useRef(false);
    const pushInitialValues = () => {
        if (!isInitialized.current && imageRef.current) {
            const { naturalWidth, naturalHeight } = imageRef.current;
            if (naturalWidth > 0) {
                onCameraChange({ horizontal_angle: hAngle, vertical_angle: vAngle, zoom: zoom });
                isInitialized.current = true;
            }
        }
    };

    useEffect(() => {
        if (imageRef.current?.complete) pushInitialValues();
        if (!imageRef.current?.complete) isInitialized.current = false;
    }, [previewUrl]);

    const handleInteractionStart = (e, type) => {
        e.preventDefault();
        const clientX = e.clientX || e.touches?.[0]?.clientX;
        const clientY = e.clientY || e.touches?.[0]?.clientY;

        setIsDragging(true);
        setDragType(type);
        setStartPos({ x: clientX, y: clientY });
    };

    useEffect(() => {
        const handleMove = (e) => {
            if (!isDragging) return;
            const clientX = e.clientX || e.touches?.[0]?.clientX;
            const clientY = e.clientY || e.touches?.[0]?.clientY;

            const dx = (clientX - startPos.x);
            const dy = (clientY - startPos.y);

            if (dragType === 'h-ring') {
                const newH = (hAngle + (dx / 200) * 360) % 360;
                onCameraChange({ horizontal_angle: Math.round(newH < 0 ? newH + 360 : newH) });
            } else if (dragType === 'v-arc') {
                const newV = Math.max(-90, Math.min(90, vAngle - (dy / 200) * 180));
                onCameraChange({ vertical_angle: Math.round(newV) });
            }

            setStartPos({ x: clientX, y: clientY });
        };

        const handleEnd = () => {
            if (isDragging) setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchmove', handleMove, { passive: false });
            window.addEventListener('touchend', handleEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging, dragType, startPos, hAngle, vAngle, onCameraChange]);

    const displayRotateY = hAngle;
    const displayRotateX = -vAngle;

    return (
        <div className="camera-crop-gizmo v2" ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--bg-card)', padding: '20px', borderRadius: '24px', border: '1px solid var(--border)' }}>

            {/* TOP HEADER: ZOOM & STATUS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ background: 'rgba(0,0,0,0.5)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--primary)' }}>ZOOM</div>
                    <input
                        type="range" min="1" max="15" step="0.1" value={zoom}
                        onChange={(e) => onCameraChange({ zoom: parseFloat(e.target.value) })}
                        style={{ width: '100px', accentColor: 'var(--primary)' }}
                    />
                    <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#fff', width: '35px' }}>{zoom.toFixed(1)}x</div>
                </div>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>3D STUDIO VIEW</div>
            </div>

            {/* MAIN INTERACTION AREA */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>

                {/* 3D STAGE */}
                <div
                    ref={stageRef}
                    style={{
                        flex: 1,
                        aspectRatio: '1',
                        minHeight: '300px',
                        position: 'relative',
                        perspective: '1200px',
                        background: '#0a0a0a',
                        borderRadius: '16px',
                        border: '2px solid rgba(255,255,255,0.05)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8)'
                    }}
                >
                    {/* Grid Background */}
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />

                    {/* Transformable Container */}
                    <div style={{
                        width: '80%',
                        height: 'auto',
                        transform: `rotateX(${displayRotateX}deg) rotateY(${displayRotateY}deg) scale(${1 + (zoom - 1) * 0.1})`,
                        transformStyle: 'preserve-3d',
                        transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.2, 0, 0.4, 1)',
                        position: 'relative'
                    }}>
                        {/* Shadow plane */}
                        <div style={{ position: 'absolute', bottom: -10, left: '5%', right: '5%', height: '20px', background: 'rgba(0,0,0,0.5)', filter: 'blur(10px)', transform: 'rotateX(90deg)', transformOrigin: 'bottom' }} />

                        {/* Image Layer */}
                        <img
                            ref={imageRef}
                            src={previewUrl}
                            onLoad={pushInitialValues}
                            style={{
                                width: '100%',
                                height: 'auto',
                                display: 'block',
                                borderRadius: '4px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                backfaceVisibility: 'visible',
                                backgroundColor: '#111'
                            }}
                            alt="3D Preview"
                        />
                    </div>

                    {/* Center Crosshair */}
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '20px', height: '20px', pointerEvents: 'none', opacity: 0.3 }}>
                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#fff' }} />
                        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: '#fff' }} />
                    </div>
                </div>

                {/* V-ARC (VERTICAL CONTROL) OUTSIDE */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div className="gizmo-v-control"
                        onMouseDown={(e) => handleInteractionStart(e, 'v-arc')}
                        onTouchStart={(e) => handleInteractionStart(e, 'v-arc')}
                        style={{
                            width: '40px',
                            height: '240px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border)',
                            borderRadius: '20px',
                            position: 'relative',
                            cursor: 'ns-resize',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Scale marks */}
                        {[-90, -45, 0, 45, 90].map(m => (
                            <div key={m} style={{ position: 'absolute', top: `${(1 - (m + 90) / 180) * 100}%`, height: '1px', width: '10px', right: 0, background: 'rgba(255,255,255,0.2)' }} />
                        ))}
                        <div style={{
                            position: 'absolute',
                            top: `${(1 - (vAngle + 90) / 180) * 100}%`,
                            height: '4px', width: '100%',
                            background: 'cyan',
                            boxShadow: '0 0 10px cyan',
                            transition: isDragging ? 'none' : 'top 0.3s'
                        }} />
                    </div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'cyan', textAlign: 'center' }}>V: {vAngle}°</div>
                </div>
            </div>

            {/* H-RING (HORIZONTAL CONTROL) OUTSIDE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="gizmo-h-control"
                    onMouseDown={(e) => handleInteractionStart(e, 'h-ring')}
                    onTouchStart={(e) => handleInteractionStart(e, 'h-ring')}
                    style={{
                        height: '40px',
                        width: '100%',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border)',
                        borderRadius: '20px',
                        position: 'relative',
                        cursor: 'ew-resize',
                        overflow: 'hidden'
                    }}
                >
                    {/* Tick marks */}
                    {[0, 90, 180, 270, 360].map(m => (
                        <div key={m} style={{ position: 'absolute', left: `${(m / 360) * 100}%`, width: '1px', height: '10px', bottom: 0, background: 'rgba(255,255,255,0.2)' }} />
                    ))}
                    <div style={{
                        position: 'absolute',
                        left: `${(hAngle / 360) * 100}%`,
                        width: '4px', height: '100%',
                        background: 'var(--primary)',
                        boxShadow: '0 0 10px var(--primary)',
                        transition: isDragging ? 'none' : 'left 0.3s'
                    }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.6rem', fontWeight: 900, color: 'var(--primary)' }}>
                    <span>HORIZONTAL AXIS</span>
                    <span>H: {hAngle}°</span>
                </div>
            </div>

            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontStyle: 'italic' }}>
                DRAG CONTROLS TO ADJUST 3D CAMERA ORIENTATION
            </div>
        </div>
    );
};
