import React, { useState, useEffect, useRef } from 'react';
import './ImageEditor.css';
import WebGLFilterCanvas from './WebGLFilterCanvas';
import DrawingCanvas from './DrawingCanvas';
import ColorPicker from './ColorPicker';

const VFX_OPTIONS = [
    {
        type: 'VHS',
        label: 'Retro VHS',
        params: { intensity: 0.5 },
        paramDefs: [
            { id: 'intensity', label: 'Noise Intensity', min: 0, max: 1, step: 0.05 }
        ]
    },
    {
        type: 'Glitch',
        label: 'Hard Glitch',
        params: { intensity: 0.2, block_size: 16 },
        paramDefs: [
            { id: 'intensity', label: 'Glitch Intensity', min: 0, max: 1, step: 0.05 },
            { id: 'block_size', label: 'Block Size', min: 2, max: 128, step: 2 }
        ]
    },
    {
        type: 'Bloom',
        label: 'Dreamy Bloom',
        params: { intensity: 0.5, radius: 10, threshold: 0.8 },
        paramDefs: [
            { id: 'intensity', label: 'Bloom Brightness', min: 0, max: 2, step: 0.1 },
            { id: 'radius', label: 'Softness', min: 1, max: 50, step: 1 },
            { id: 'threshold', label: 'Glow Threshold', min: 0, max: 1, step: 0.05 }
        ]
    },
    {
        type: 'Chromatic Aberration',
        label: 'Color Fringing',
        params: { intensity: 5.0 },
        paramDefs: [
            { id: 'intensity', label: 'Shift Amount', min: 0, max: 50, step: 1 }
        ]
    },
    {
        type: 'Scanlines',
        label: 'Retro CRT',
        params: { intensity: 0.3, thickness: 0.5 },
        paramDefs: [
            { id: 'intensity', label: 'Line Darkness', min: 0, max: 1, step: 0.05 },
            { id: 'thickness', label: 'Line Thickness', min: 0, max: 1, step: 0.05 }
        ]
    },
    {
        type: 'CRT Warp',
        label: 'Tube Distortion',
        params: { intensity: 0.2 },
        paramDefs: [
            { id: 'intensity', label: 'Curvature', min: 0, max: 0.5, step: 0.01 }
        ]
    },
    {
        type: 'Film Grain',
        label: 'Cinema Grain',
        params: { intensity: 0.1 },
        paramDefs: [
            { id: 'intensity', label: 'Grain Amount', min: 0, max: 0.5, step: 0.01 }
        ]
    },
    {
        type: 'Pixelate',
        label: 'Pixel Art',
        params: { size: 8 },
        paramDefs: [
            { id: 'size', label: 'Pixel Size', min: 1, max: 128, step: 1 }
        ]
    },
    {
        type: 'Vignette',
        label: 'Vignette',
        params: { intensity: 0.5 },
        paramDefs: [
            { id: 'intensity', label: 'Shadow Strength', min: 0, max: 1, step: 0.05 }
        ]
    },
    {
        type: 'Color Filter',
        label: 'Grayscale',
        params: { mode: 'B&W' },
        paramDefs: []
    },
    {
        type: 'Color Filter',
        label: 'Sepia',
        params: { mode: 'Sepia' },
        paramDefs: []
    },
    {
        type: 'Color Filter',
        label: 'Invert',
        params: { mode: 'Invert' },
        paramDefs: []
    },
    {
        type: 'Kaleidoscope',
        label: 'Kaleidoscope',
        params: { segments: 6 },
        paramDefs: [
            { id: 'segments', label: 'Reflections', min: 2, max: 24, step: 1 }
        ]
    },
];

const COLORS = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#00ffff', '#ff00ff', '#ff8000', '#800080',
    '#a52a2a', '#808080'
];

const ImageEditor = ({ image, onClose, onSave, isProcessing }) => {
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [vfxStack, setVfxStack] = useState([]);
    const [activeTab, setActiveTab] = useState('adjust'); // adjust, vfx, paint
    const [expandedVFX, setExpandedVFX] = useState(null);

    // Drawing State
    const [activeTool, setActiveTool] = useState('brush'); // brush, eraser
    const [brushSettings, setBrushSettings] = useState({
        size: 5,
        color: '#000000',
        opacity: 1.0,
        hardness: 1.0
    });
    const [layers, setLayers] = useState([
        { id: 'layer-1', name: 'Sketch', visible: true, opacity: 1.0, data: null }
    ]);
    const [activeLayerId, setActiveLayerId] = useState('layer-1');

    // Undo/Redo History
    const [history, setHistory] = useState([]);
    const [redoStack, setRedoStack] = useState([]);

    const canvasRef = useRef(null); // WebGL Canvas
    const drawingCanvasRef = useRef(null); // Drawing Canvas
    const containerRef = useRef(null); // Container for sizing

    // Dimensions for canvases
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    // Zoom/Pan State
    const [imageDimensions, setImageDimensions] = useState(null);
    const [viewTransform, setViewTransform] = useState({ scale: 1, x: 0, y: 0 });
    const viewRef = useRef(null); // Ref for the pan/zoom container

    useEffect(() => {
        if (!image) return;
        const img = new Image();
        img.src = image;
        img.onload = () => {
            const naturalWidth = img.naturalWidth;
            const naturalHeight = img.naturalHeight;
            setImageDimensions({ width: naturalWidth, height: naturalHeight });

            // Calculate fit
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                const aspect = naturalWidth / naturalHeight;
                const containerAspect = clientWidth / clientHeight;

                let width, height;

                if (aspect > containerAspect) {
                    // Limited by width
                    width = clientWidth;
                    height = clientWidth / aspect;
                } else {
                    // Limited by height
                    height = clientHeight;
                    width = clientHeight * aspect;
                }
                setDimensions({ width, height });
                setViewTransform({ scale: 1, x: 0, y: 0 });
            }
        };
    }, [image, activeTab]);

    // Save current state to history
    const pushToHistory = () => {
        setHistory(prev => {
            const newHistory = [...prev, layers];
            // Limit history to 20 steps
            if (newHistory.length > 20) {
                // In a real app, we'd close() the bitmap of the shifted out layer if it's not used elsewhere.
                return newHistory.slice(newHistory.length - 20);
            }
            return newHistory;
        });
        setRedoStack([]); // Clear redo on new action
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const previousLayers = history[history.length - 1];
        setRedoStack(prev => [layers, ...prev]);
        setLayers(previousLayers);
        setHistory(prev => prev.slice(0, prev.length - 1));
    };

    const handleRedo = () => {
        if (redoStack.length === 0) return;
        const nextLayers = redoStack[0];
        setHistory(prev => [...prev, layers]);
        setLayers(nextLayers);
        setRedoStack(prev => prev.slice(1));
    };

    // Toggle VFX in stack
    const toggleVFX = (vfx) => {
        setVfxStack(prev => {
            const index = prev.findIndex(i => i.type === vfx.type && i.label === vfx.label);
            if (index >= 0) {
                return prev.filter((_, i) => i !== index);
            }
            return [...prev, { ...vfx, params: { ...vfx.params } }];
        });
    };

    const updateVFXParam = (vfxType, vfxLabel, paramId, value) => {
        setVfxStack(prev => {
            return prev.map(item => {
                if (item.type === vfxType && item.label === vfxLabel) {
                    const newParams = { ...item.params, [paramId]: parseFloat(value) };
                    return { ...item, params: newParams };
                }
                return item;
            });
        });
    };

    const handleLayerUpdate = (layerId, newBitmap, _isEraser) => {
        pushToHistory(); // Save state before update

        // Update the specific layer with new bitmap data
        setLayers(prev => prev.map(l => {
            if (l.id === layerId) {
                // If we had existing data, we need to merge? 
                // Or DrawingCanvas sends the *delta*? 
                // The current DrawingCanvas implementation sends the *stroke* bitmap.
                // We actually need to composite it onto the layer's existing data OFF-SCREEN 
                // and then store the result. 
                // BUT, to keep React state simple, let's assume DrawingCanvas 
                // manages the "blitting" to an offscreen canvas and returns the *full* layer content?
                // Refinment: DrawingCanvas.jsx provided `finishStroke` which sent a bitmap of the STROKE.
                // We need to composite this stroke onto the layer.

                // OPTION B: Let DrawingCanvas manage the "layer data" internally in its own offscreen canvases?
                // No, lifting state up is better for generic use.

                // Let's create an offscreen canvas to merge.
                const offscreen = new OffscreenCanvas(dimensions.width, dimensions.height);
                const ctx = offscreen.getContext('2d');

                if (l.data) {
                    ctx.drawImage(l.data, 0, 0);
                }

                if (_isEraser) {
                    ctx.globalCompositeOperation = 'destination-out';
                }
                ctx.drawImage(newBitmap, 0, 0);

                // Convert back to bitmap/image source
                // In a real app we'd manage this more carefully to avoid mem leaks.
                // For this prototype, we store the Transferable ImageBitmap.
                return { ...l, data: offscreen.transferToImageBitmap() };
            }
            return l;
        }));
    };

    const handlePickColor = (pos) => {
        // pos is {x, y} relative to canvas
        // We need to pick from the WebGL canvas (base image) OR the active layer?
        // Usually eyedropper picks what is visible. 
        // For now, let's prioritize the base image if layer is transparent, or composite?
        // Simple approach: Pick from WebGL canvas (Base Image).

        if (canvasRef.current) {
            const hex = canvasRef.current.getPixel(pos.x, pos.y);
            if (hex) {
                setBrushSettings(prev => ({ ...prev, color: hex }));
            }
        }

        if (activeTool === 'picker') {
            setActiveTool('brush'); // Switch back to brush after picking
        }
    };

    // Zoom & Pan Handlers
    const handleWheel = (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const zoomSensitivity = 0.001;
            const delta = -e.deltaY * zoomSensitivity;
            const newScale = Math.min(Math.max(0.1, viewTransform.scale + delta), 10);

            setViewTransform(prev => ({ ...prev, scale: newScale }));
        } else {
            // Pan
            if (activeTab === 'paint' && activeTool !== 'hand') {
                // If painting, maybe we want wheel to do something else? 
                // Or just always pan if not handling tool events? 
                // Providing pan on two-finger scroll is standard.
            }
            e.preventDefault();
            setViewTransform(prev => ({
                ...prev,
                x: prev.x - e.deltaX,
                y: prev.y - e.deltaY
            }));
        }
    };

    const handleSave = async () => {
        if (!onSave) return;

        try {
            // 1. Get Base Image from WebGL
            const baseDataUrl = canvasRef.current?.getCanvasDataURL();
            if (!baseDataUrl) throw new Error("Could not capture base WebGL canvas!");

            // 2. Composite Drawing Layers on top
            // We need to do this manually here since they are separate components
            const compositeCanvas = document.createElement('canvas');
            compositeCanvas.width = dimensions.width;
            compositeCanvas.height = dimensions.height;
            const ctx = compositeCanvas.getContext('2d');

            // Draw Base
            const baseImg = await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = baseDataUrl;
            });
            ctx.drawImage(baseImg, 0, 0, dimensions.width, dimensions.height);

            // Draw Layers
            layers.forEach(layer => {
                if (layer.visible && layer.data) {
                    ctx.globalAlpha = layer.opacity;
                    ctx.drawImage(layer.data, 0, 0);
                }
            });

            const finalDataUrl = compositeCanvas.toDataURL('image/png');

            onSave({
                adjustments: { brightness, contrast, saturation },
                rotation,
                vfxStack: vfxStack.map(v => ({ ...v, enabled: true })),
                bakedDataUrl: finalDataUrl
            });
        } catch (e) {
            console.error(e);
            alert("Save Error: " + e.message);
        }
    };


    return (
        <div className="image-editor-overlay" onClick={onClose}>
            <div className="image-editor-container" onClick={e => e.stopPropagation()}>
                <div className="editor-header">
                    <h3>Premium Image Editor</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className={`editor-main ${activeTab === 'paint' ? 'paint-mode' : ''}`}>
                    <div
                        className="preview-area"
                        ref={containerRef}
                        onWheel={handleWheel}
                        style={{ overflow: 'hidden', position: 'relative', touchAction: 'none' }}
                    >
                        {/* Transform Container */}
                        <div
                            ref={viewRef}
                            style={{
                                width: dimensions.width,
                                height: dimensions.height,
                                transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.scale})`,
                                transformOrigin: 'center',
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                marginTop: -dimensions.height / 2,
                                marginLeft: -dimensions.width / 2,
                                boxShadow: '0 0 20px rgba(0,0,0,0.5)' // Drop shadow for aesthetics
                            }}
                        >
                            <WebGLFilterCanvas
                                ref={canvasRef}
                                image={image}
                                adjustments={{ brightness, contrast, saturation }}
                                vfxStack={vfxStack}
                                rotation={rotation}
                                width={dimensions.width}
                                height={dimensions.height}
                            />

                            {/* Drawing Canvas (Overlay) */}
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: activeTab === 'paint' ? 'auto' : 'none' }}>
                                <DrawingCanvas
                                    ref={drawingCanvasRef}
                                    width={dimensions.width}
                                    height={dimensions.height}
                                    activeTool={activeTool}
                                    brushSettings={brushSettings}
                                    layers={layers}
                                    activeLayerId={activeLayerId}
                                    onLayerUpdate={handleLayerUpdate}
                                    onPickColor={handlePickColor}
                                    onViewTransform={(newTransform) => {
                                        // newTransform is { scale (delta), x (delta), y (delta) }
                                        setViewTransform(prev => ({
                                            scale: Math.min(Math.max(0.1, prev.scale * newTransform.scale), 10),
                                            x: prev.x + newTransform.x,
                                            y: prev.y + newTransform.y
                                        }));
                                    }}
                                    viewTransform={viewTransform} // Pass transform for coordinate mapping
                                />
                            </div>
                        </div>

                        {/* Move badge outside to keep it static relative to screen */}
                        {vfxStack.length > 0 && (
                            <div className="active-vfx-badge" style={{ position: 'absolute', top: 10, right: 10 }}>
                                {vfxStack.length} Effects Active
                            </div>
                        )}
                    </div>

                    <div className="controls-sidebar">
                        <div className="tabs">
                            <button className={activeTab === 'adjust' ? 'active' : ''} onClick={() => setActiveTab('adjust')}>Adjust</button>
                            <button className={activeTab === 'vfx' ? 'active' : ''} onClick={() => setActiveTab('vfx')}>VFX</button>
                            <button className={activeTab === 'paint' ? 'active' : ''} onClick={() => setActiveTab('paint')}>Paint</button>
                        </div>

                        <div className="tab-content">
                            {activeTab === 'adjust' && (
                                <div className="control-group">
                                    <div className="slider-item">
                                        <label>Brightness</label>
                                        <input type="range" min="0" max="200" value={brightness} onChange={e => setBrightness(e.target.value)} />
                                        <span>{brightness}%</span>
                                    </div>
                                    <div className="slider-item">
                                        <label>Contrast</label>
                                        <input type="range" min="0" max="200" value={contrast} onChange={e => setContrast(e.target.value)} />
                                        <span>{contrast}%</span>
                                    </div>
                                    <div className="slider-item">
                                        <label>Saturation</label>
                                        <input type="range" min="0" max="200" value={saturation} onChange={e => setSaturation(e.target.value)} />
                                        <span>{saturation}%</span>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'vfx' && (
                                <div className="vfx-list-container">
                                    {VFX_OPTIONS.map(vfx => {
                                        const stackItem = vfxStack.find(i => i.type === vfx.type && i.label === vfx.label);
                                        const isActive = !!stackItem;
                                        const isExpanded = expandedVFX === vfx.label;

                                        return (
                                            <div key={vfx.label} className={`vfx-list-item ${isActive ? 'active' : ''} ${isExpanded ? 'expanded' : ''}`}>
                                                <div
                                                    className="vfx-item-header"
                                                    onClick={() => setExpandedVFX(isExpanded ? null : vfx.label)}
                                                >
                                                    <div className="vfx-item-info">
                                                        <div className={`checkbox ${isActive ? 'checked' : ''}`} onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleVFX(vfx);
                                                        }}>
                                                            {isActive && '✓'}
                                                        </div>
                                                        <span className="vfx-name">{vfx.label.toUpperCase()}</span>
                                                    </div>
                                                    <span className="vfx-chevron">{isExpanded ? '▲' : '▼'}</span>
                                                </div>

                                                {isExpanded && vfx.paramDefs && vfx.paramDefs.length > 0 && (
                                                    <div className="vfx-item-params">
                                                        {vfx.paramDefs.map(def => {
                                                            const currentVal = stackItem ? stackItem.params[def.id] : vfx.params[def.id];
                                                            return (
                                                                <div key={def.id} className="slider-item mini">
                                                                    <div className="slider-label-row">
                                                                        <label>{def.label}</label>
                                                                        <span>{typeof currentVal === 'number' ? currentVal.toFixed(2) : currentVal}</span>
                                                                    </div>
                                                                    <input
                                                                        type="range"
                                                                        min={def.min}
                                                                        max={def.max}
                                                                        step={def.step}
                                                                        value={currentVal}
                                                                        onChange={e => {
                                                                            if (!isActive) toggleVFX(vfx);
                                                                            updateVFXParam(vfx.type, vfx.label, def.id, e.target.value);
                                                                        }}
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {activeTab === 'paint' && (
                                <div className="paint-tools">
                                    <div className="tool-row" style={{ marginBottom: '10px' }}>
                                        <button onClick={() => setRotation(r => (r - 90) % 360)}>↺ Rotate</button>
                                        <button onClick={() => setRotation(r => (r + 90) % 360)}>Rotate ↻</button>
                                    </div>

                                    <div className="tool-row" style={{ marginBottom: '10px' }}>
                                        <button onClick={handleUndo} disabled={history.length === 0} style={{ opacity: history.length === 0 ? 0.5 : 1 }}>↩ Undo</button>
                                        <button onClick={handleRedo} disabled={redoStack.length === 0} style={{ opacity: redoStack.length === 0 ? 0.5 : 1 }}>Redo ↪</button>
                                    </div>

                                    <div className="tool-row" style={{ marginBottom: '20px', gridTemplateColumns: '1fr 1fr' }}>
                                        <button
                                            className={activeTool === 'brush' ? 'active-tool' : ''}
                                            onClick={() => setActiveTool('brush')}
                                        >🖌 Brush</button>
                                        <button
                                            className={activeTool === 'eraser' ? 'active-tool' : ''}
                                            onClick={() => setActiveTool('eraser')}
                                        >⌫ Eraser</button>
                                        <button
                                            className={activeTool === 'bucket' ? 'active-tool' : ''}
                                            onClick={() => setActiveTool('bucket')}
                                        >🪣 Fill</button>
                                        <button
                                            className={activeTool === 'picker' ? 'active-tool' : ''}
                                            onClick={() => setActiveTool('picker')}
                                        >💉 Picker</button>
                                    </div>

                                    <div className="slider-item">
                                        <label>Size</label>
                                        <input
                                            type="range"
                                            min="1" max="100"
                                            value={brushSettings.size}
                                            onChange={e => setBrushSettings({ ...brushSettings, size: parseInt(e.target.value) })}
                                        />
                                        <span>{brushSettings.size}px</span>
                                    </div>

                                    <div className="slider-item">
                                        <label>Opacity</label>
                                        <input
                                            type="range"
                                            min="0" max="1" step="0.05"
                                            value={brushSettings.opacity}
                                            onChange={e => setBrushSettings({ ...brushSettings, opacity: parseFloat(e.target.value) })}
                                        />
                                        <span>{Math.round(brushSettings.opacity * 100)}%</span>
                                    </div>

                                    <div className="slider-item">
                                        <label>Color</label>
                                        <ColorPicker
                                            color={brushSettings.color}
                                            onChange={c => setBrushSettings({ ...brushSettings, color: c })}
                                        />
                                    </div>

                                    <div className="layers-list" style={{ marginTop: 'auto' }}>
                                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>LAYERS</label>
                                        {layers.map(layer => (
                                            <div
                                                key={layer.id}
                                                className={`layer-item ${activeLayerId === layer.id ? 'active-layer' : ''}`}
                                                onClick={() => setActiveLayerId(layer.id)}
                                                style={{
                                                    padding: '10px',
                                                    background: activeLayerId === layer.id ? 'var(--bg-hover)' : 'rgba(0,0,0,0.2)',
                                                    border: activeLayerId === layer.id ? '1px solid var(--primary)' : '1px solid transparent',
                                                    borderRadius: '6px',
                                                    marginBottom: '4px',
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <span>{layer.name}</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, visible: !l.visible } : l));
                                                    }}
                                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: layer.visible ? 1 : 0.4 }}
                                                >
                                                    👁️
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => {
                                                const newId = `layer-${Date.now()}`;
                                                setLayers(prev => [{ id: newId, name: `Layer ${prev.length + 1}`, visible: true, opacity: 1, data: null }, ...prev]);
                                                setActiveLayerId(newId);
                                            }}
                                            style={{
                                                width: '100%', marginTop: '10px', padding: '8px',
                                                background: 'transparent', border: '1px dashed var(--border)',
                                                color: 'var(--text-secondary)', borderRadius: '4px', cursor: 'pointer'
                                            }}
                                        >
                                            + New Layer
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                <div className="editor-footer">
                    <button className="cancel-btn" onClick={onClose} disabled={isProcessing}>Discard</button>
                    <button className="save-btn" onClick={handleSave} disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : 'Bake & Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;
