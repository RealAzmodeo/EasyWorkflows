import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

const DrawingCanvas = forwardRef(({
    width,
    height,
    activeTool = 'brush',
    brushSettings = { size: 5, color: '#000000', opacity: 1.0, hardness: 1.0 },
    layers = [],
    activeLayerId,
    onLayerUpdate,
    onPickColor,
    onViewTransform // New prop
}, ref) => {
    const canvasRef = useRef(null);
    const tempCanvasRef = useRef(null); // For current stroke
    const [isDrawing, setIsDrawing] = useState(false);
    const lastPoint = useRef(null);

    const redrawLayers = React.useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        layers.forEach(layer => {
            if (layer.visible && layer.data) {
                ctx.globalAlpha = layer.opacity;
                ctx.drawImage(layer.data, 0, 0);
            }
        });
        ctx.globalAlpha = 1.0;
    }, [layers, width, height]);

    // Initialize canvases
    useEffect(() => {
        const canvas = canvasRef.current;
        const tempCanvas = tempCanvasRef.current;
        if (canvas && tempCanvas) {
            canvas.width = width;
            canvas.height = height;
            tempCanvas.width = width;
            tempCanvas.height = height;

            // Clear initially
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, width, height);
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.clearRect(0, 0, width, height);

            // Redraw existing layers if any (simplified for now)
            redrawLayers();
        }
    }, [width, height, layers, redrawLayers]);

    const getPointerPos = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        // Calculate position relative to the canvas element (which is already transformed in DOM)
        // Wait, if the canvas is transformed using CSS 'transform', getBoundingClientRect returns the *transformed* rect details (visual).
        // If we just use clientX - rect.left, we get coordinates relative to the visual top-left of the canvas.
        // BUT, the internal canvas coordinate system (0 to width) matches the element size (width/height).
        // Since we scale the parent div, the canvas element itself is scaled.
        // e.g. if scale is 2, the 800px canvas looks like 1600px.
        // rect.width will be 1600.
        // We need to map this back to 0-800.

        const scaleX = width / rect.width;
        const scaleY = height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
            pressure: e.pressure !== undefined ? e.pressure : 0.5,
            tiltX: e.tiltX || 0,
            tiltY: e.tiltY || 0
        };
    };

    const handleColorPick = (pos) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
        // Convert to hex
        const hex = "#" + ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1);

        if (onPickColor) {
            onPickColor(hex);
        }
    };

    // ... FloodFill stays below ...

    // Track active pointers for gesture detection
    const activePointers = useRef(new Map());
    const initialGesture = useRef(null);
    const lastGesture = useRef(null);

    // Helper to get distance and center from 2 pointers
    const getGestureState = (pointers) => {
        const [p1, p2] = Array.from(pointers.values());
        const dx = p2.clientX - p1.clientX;
        const dy = p2.clientY - p1.clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const center = {
            x: (p1.clientX + p2.clientX) / 2,
            y: (p1.clientY + p2.clientY) / 2
        };
        return { distance, center };
    };

    const handlePointerDown = (e) => {
        // Track pointer
        activePointers.current.set(e.pointerId, e);

        // If multi-touch detected (2+ fingers), cancel any drawing and ignore
        if (activePointers.current.size === 2) {
            // Start Gesture
            const gesture = getGestureState(activePointers.current);
            initialGesture.current = gesture;
            lastGesture.current = gesture;

            if (isDrawing) {
                setIsDrawing(false);
                // Clear temp canvas to remove the start of the stroke
                const tempCtx = tempCanvasRef.current.getContext('2d');
                tempCtx.clearRect(0, 0, width, height);
                // Release capture
                try { e.target.releasePointerCapture(e.pointerId); } catch (err) { }
            }
            return;
        } else if (activePointers.current.size > 2) {
            // Ignore 3+ fingers
            return;
        }

        if (!activeLayerId) return;

        const pos = getPointerPos(e);

        if (activeTool === 'bucket') {
            handleFloodFill(pos);
            return;
        }

        if (activeTool === 'picker') {
            handleColorPick(pos);
            return;
        }

        // Capture pointer for consistent tracking outside canvas
        e.target.setPointerCapture(e.pointerId);

        setIsDrawing(true);
        lastPoint.current = pos;

        // Start stroke logic here (e.g., initial dot)
        drawStroke(pos, pos, true);
    };

    const handlePointerMove = (e) => {
        // Update pointer position in map
        if (activePointers.current.has(e.pointerId)) {
            activePointers.current.set(e.pointerId, e);
        }

        // Gesture Handling
        if (activePointers.current.size === 2) {
            const newGesture = getGestureState(activePointers.current);

            if (lastGesture.current && onViewTransform) {
                const scale = newGesture.distance / lastGesture.current.distance;
                const panX = newGesture.center.x - lastGesture.current.center.x;
                const panY = newGesture.center.y - lastGesture.current.center.y;

                onViewTransform({ scale, x: panX, y: panY });
            }

            lastGesture.current = newGesture;
            return;
        }

        if (activePointers.current.size > 1) return;

        if (!isDrawing) return;

        // Get coalesced events for higher precision (120Hz/240Hz on iPad)
        const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];

        events.forEach(evt => {
            const pos = getPointerPos(evt);
            drawStroke(lastPoint.current, pos);
            lastPoint.current = pos;
        });
    };



    const handlePointerUp = (e) => {
        activePointers.current.delete(e.pointerId);

        if (!isDrawing) return;

        // Only finish stroke if this was the drawing pointer
        // And no other pointers are active (or just finish anyway)
        setIsDrawing(false);
        e.target.releasePointerCapture(e.pointerId);

        // Finalize stroke: Merge temp canvas into active layer
        finishStroke();
    };

    const handlePointerCancel = (e) => {
        activePointers.current.delete(e.pointerId);
        if (isDrawing) {
            setIsDrawing(false);
            const tempCtx = tempCanvasRef.current.getContext('2d');
            tempCtx.clearRect(0, 0, width, height);
        }
    };



    const handleFloodFill = async (pos) => {
        const layer = layers.find(l => l.id === activeLayerId);
        if (!layer) return;

        // 1. Get Layer Data
        const offscreen = new OffscreenCanvas(width, height);
        const ctx = offscreen.getContext('2d');

        if (layer.data) {
            ctx.drawImage(layer.data, 0, 0);
        }

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // 2. Prepare Check
        const startX = Math.floor(pos.x);
        const startY = Math.floor(pos.y);
        const startPos = (startY * width + startX) * 4;

        const startR = data[startPos];
        const startG = data[startPos + 1];
        const startB = data[startPos + 2];
        const startA = data[startPos + 3];

        // Parse Fill Color
        const fillHex = brushSettings.color;
        const r = parseInt(fillHex.slice(1, 3), 16);
        const g = parseInt(fillHex.slice(3, 5), 16);
        const b = parseInt(fillHex.slice(5, 7), 16);
        const a = 255; // opacity handled by layer opacity? Or fixed 255 for now.

        // Optimization: If color is same, return
        if (startR === r && startG === g && startB === b && startA === a) return;

        // 3. Flood Fill Algorithm (Stack-based Scanline)
        const stack = [[startX, startY]];

        const matchStartColor = (pixelPos) => {
            return data[pixelPos] === startR &&
                data[pixelPos + 1] === startG &&
                data[pixelPos + 2] === startB &&
                data[pixelPos + 3] === startA;
        };

        const colorPixel = (pixelPos) => {
            data[pixelPos] = r;
            data[pixelPos + 1] = g;
            data[pixelPos + 2] = b;
            data[pixelPos + 3] = a;
        };

        while (stack.length) {
            const [cx, cy] = stack.pop();
            let pixelPos = (cy * width + cx) * 4;

            let x1 = cx;
            while (x1 >= 0 && matchStartColor(pixelPos)) {
                x1--;
                pixelPos -= 4;
            }
            x1++;
            pixelPos += 4; // Back to valid

            let spanAbove = false;
            let spanBelow = false;

            while (x1 < width && matchStartColor(pixelPos)) {
                colorPixel(pixelPos);

                if (cy > 0) {
                    const abovePos = pixelPos - width * 4;
                    if (!spanAbove && matchStartColor(abovePos)) {
                        stack.push([x1, cy - 1]);
                        spanAbove = true;
                    } else if (spanAbove && !matchStartColor(abovePos)) {
                        spanAbove = false;
                    }
                }

                if (cy < height - 1) {
                    const belowPos = pixelPos + width * 4;
                    if (!spanBelow && matchStartColor(belowPos)) {
                        stack.push([x1, cy + 1]);
                        spanBelow = true;
                    } else if (spanBelow && !matchStartColor(belowPos)) {
                        spanBelow = false;
                    }
                }

                x1++;
                pixelPos += 4;
            }
        }

        // 4. Update Layer
        ctx.putImageData(imageData, 0, 0);
        const newBitmap = await createImageBitmap(offscreen);
        onLayerUpdate(activeLayerId, newBitmap, false);
    };

    const drawStroke = (start, end) => {
        const ctx = tempCanvasRef.current.getContext('2d');

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Dynamic size based on pressure
        // Base size * (0.5 + pressure) -> Pressure affects size by +/- 50% relative to base
        // Or simple: size * pressure
        let pressure = end.pressure !== undefined ? end.pressure : 0.5;
        // Advanced Pressure & Tilt Logic
        // Pressure: 0.0 to 1.0 (default 0.5)
        // Tilt: 0 (vertical) to 90 (flat) - usually given in degrees or radians.
        // PointerEvents gives tiltX/tiltY in degrees (-90 to 90).
        // Let's compute a simple "tilt factor" where 0 is vertical, 1 is flat.
        // We'll use the magnitude of tiltX/Y.

        // Simple easing for pressure (convex curve for better control)
        // p^2 gives more control at low pressure
        pressure = pressure * pressure;
        const baseSize = brushSettings.size;
        // const size = Math.max(1, baseSize * (0.5 + pressure));

        // Tilt calculation
        // Maximum tilt (flat) increases size by up to 100%
        const tiltMagnitude = Math.sqrt(Math.pow(end.tiltX || 0, 2) + Math.pow(end.tiltY || 0, 2));
        const tiltFactor = Math.min(1, tiltMagnitude / 45); // Max out at 45 degrees

        // Combined Size
        // Base * (Pressure Effect) * (Tilt Effect)
        // Base * (0.2 + 1.8 * pressure) -> Range 0.2x to 2.0x
        let currentSize = brushSettings.size * (0.2 + 1.8 * pressure);

        // Add tilt effect (only for brush, not eraser)
        if (activeTool === 'brush') {
            currentSize *= (1 + tiltFactor * 0.5); // Up to 50% larger when tilted
        }

        // Eraser ignores pressure dynamics for consistency, or maybe just lighter?
        if (activeTool === 'eraser') {
            currentSize = brushSettings.size;
        }

        ctx.lineWidth = currentSize;
        ctx.strokeStyle = activeTool === 'eraser' ? '#ffffff' : brushSettings.color;

        // Opacity
        // ctx.globalAlpha = brushSettings.opacity;

        if (activeTool === 'eraser') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = '#ffffff'; // White for eraser on temp canvas (merged as destination-out later)
            // Note: If we really want to see "underneath" while erasing, we'd need a different approach
            // (e.g. erasing from a temporary clone of the active layer).
            // For now, white strokes on top is the standard "prediction" for eraser.
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = brushSettings.opacity;
        }

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        // Use quadratic curve for smoother lines if we have history?
        // For now, straight lines between high-frequency events is fine.
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        ctx.globalAlpha = 1.0; // Reset global alpha
        ctx.globalCompositeOperation = 'source-over'; // Reset composite operation
    };


    const finishStroke = () => {
        const tempCanvas = tempCanvasRef.current;
        const tempCtx = tempCanvas.getContext('2d');
        // Find active layer object
        const layerIndex = layers.findIndex(l => l.id === activeLayerId);
        if (layerIndex === -1) return;

        // Create a temporary snapshot of the temp stroke
        createImageBitmap(tempCanvas).then(bitmap => {
            onLayerUpdate(activeLayerId, bitmap, activeTool === 'eraser'); // Pass bitmap and operation

            // Clear temp canvas
            tempCtx.clearRect(0, 0, width, height);
            // Clear 'lastPoint'
            lastPoint.current = null;
        });
    };

    // Expose methods
    useImperativeHandle(ref, () => ({
        getCanvas: () => canvasRef.current,
        clear: () => {
            // Logic to clear active layer? Or all? 
            // Parent handles layer clearing usually.
        }
    }));

    return (
        <div style={{ position: 'relative', width, height, touchAction: 'none' }}>
            {/* 1. Main Display Canvas (Composite of all layers) */}
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
            />

            {/* 2. Temp / Interaction Canvas (Topmost, captures input) */}
            <canvas
                ref={tempCanvasRef}
                width={width}
                height={height}
                style={{ position: 'absolute', top: 0, left: 0, cursor: activeTool === 'picker' ? 'alias' : 'crosshair', touchAction: 'none' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onPointerCancel={handlePointerCancel}
            />
        </div>
    );
});

export default DrawingCanvas;
