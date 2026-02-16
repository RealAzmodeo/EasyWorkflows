import React, { useState, useEffect, useRef } from 'react';

const ColorPicker = ({ color, onChange }) => {
    // HSV Conversion Helpers
    const hexToHsv = (hex) => {
        let r = parseInt(hex.slice(1, 3), 16) / 255;
        let g = parseInt(hex.slice(3, 5), 16) / 255;
        let b = parseInt(hex.slice(5, 7), 16) / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, v = max;
        const d = max - min;
        s = max === 0 ? 0 : d / max;

        if (max === min) {
            h = 0;
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s * 100, v: v * 100 };
    };

    const hsvToHex = (h, s, v) => {
        s /= 100;
        v /= 100;
        const i = Math.floor(h / 60);
        const f = h / 60 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        let r, g, b;
        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }
        const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    const [hsv, setHsv] = useState(hexToHsv(color));
    const [dragging, setDragging] = useState(null); // 'sv' or 'h'
    const svRef = useRef(null);
    const hRef = useRef(null);

    // Sync external color changes only if not dragging to prevent loop
    useEffect(() => {
        if (!dragging) {
            setHsv(hexToHsv(color));
        }
    }, [color, dragging]); // Added dragging to dependency array to re-evaluate when dragging stops

    const handlePointerMove = (e) => {
        if (!dragging) return;
        e.preventDefault(); // Prevent text selection etc.

        if (dragging === 'sv') {
            const rect = svRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

            // x = Saturation, y = Value (inverse, top is 100)
            const newS = x * 100;
            const newV = (1 - y) * 100;

            const newHsv = { ...hsv, s: newS, v: newV };
            setHsv(newHsv);
            onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
        } else if (dragging === 'h') {
            const rect = hRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const newH = x * 360;
            const newHsv = { ...hsv, h: newH };
            setHsv(newHsv);
            onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
        }
    };

    const handlePointerUp = () => {
        setDragging(null);
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
    };

    const startDrag = (mode, e) => {
        setDragging(mode);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        // Initial click update
        if (mode === 'sv') {
            const rect = svRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
            const newS = x * 100;
            const newV = (1 - y) * 100;
            const newHsv = { ...hsv, s: newS, v: newV };
            setHsv(newHsv);
            onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
        } else if (mode === 'h') {
            const rect = hRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const newH = x * 360;
            const newHsv = { ...hsv, h: newH };
            setHsv(newHsv);
            onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
        }
    };

    return (
        <div className="color-picker-container" style={{ padding: 10, background: '#222', borderRadius: 8, width: 200 }} onPointerDown={e => e.stopPropagation()}>
            {/* Saturation/Value Box */}
            <div
                ref={svRef}
                style={{
                    width: '100%',
                    height: 150,
                    backgroundColor: `hsl(${hsv.h}, 100%, 50%)`, // Hue base
                    backgroundImage: 'linear-gradient(to bottom, transparent, #000), linear-gradient(to right, #fff, transparent)',
                    position: 'relative',
                    cursor: 'crosshair',
                    marginBottom: 10,
                    borderRadius: 4
                }}
                onPointerDown={(e) => startDrag('sv', e)}
            >
                <div style={{
                    position: 'absolute',
                    left: `${hsv.s}%`,
                    top: `${100 - hsv.v}%`,
                    width: 12,
                    height: 12,
                    border: '2px solid white',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 2px black',
                    pointerEvents: 'none'
                }} />
            </div>

            {/* Hue Slider */}
            <div
                ref={hRef}
                style={{
                    width: '100%',
                    height: 20,
                    background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
                    position: 'relative',
                    cursor: 'pointer',
                    borderRadius: 4,
                    marginBottom: 10
                }}
                onPointerDown={(e) => startDrag('h', e)}
            >
                <div style={{
                    position: 'absolute',
                    left: `${(hsv.h / 360) * 100}%`,
                    top: 0,
                    bottom: 0,
                    width: 6,
                    background: 'white',
                    border: '1px solid black',
                    transform: 'translateX(-3px)',
                    borderRadius: 2,
                    pointerEvents: 'none'
                }} />
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 30, height: 30, background: color, border: '1px solid #444', borderRadius: 4 }}></div>
                <input
                    type="text"
                    value={color}
                    onChange={e => onChange(e.target.value)}
                    style={{
                        background: '#222',
                        border: '1px solid #444',
                        color: '#eee',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontFamily: 'monospace',
                        width: 80
                    }}
                />
            </div>
        </div>
    );
};

export default ColorPicker;
