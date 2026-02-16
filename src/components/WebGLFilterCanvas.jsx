import React, { useRef, useEffect, useState } from 'react';

const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D u_image;
    uniform float u_time;
    uniform vec2 u_resolution;

    // Adjustments
    uniform float u_brightness;
    uniform float u_contrast;
    uniform float u_saturation;

    // VFX
    uniform float u_crt_intensity;
    uniform float u_vhs_intensity;
    uniform float u_scanline_intensity;
    uniform float u_grain_intensity;
    uniform float u_aberration_intensity;
    uniform float u_pixelate_size;

    // --- Utils ---
    vec3 rgb2hsv(vec3 c) {
        vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
        vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
        vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
        float d = q.x - min(q.w, q.y);
        float e = 1.0e-10;
        return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
    }

    vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    vec2 crtWarp(vec2 uv, float intensity) {
        vec2 dc = uv - 0.5;
        float dist = dot(dc, dc);
        return uv + dc * dist * intensity;
    }

    // --- Kaleidoscope ---
    uniform float u_kaleidoscope_segments;
    vec2 kaleidoscope(vec2 uv, float segments) {
        vec2 dc = uv - 0.5;
        float angle = atan(dc.y, dc.x);
        float radius = length(dc);
        float segment_angle = 6.28318 / segments;
        angle = mod(angle, segment_angle);
        angle = abs(angle - segment_angle * 0.5);
        return 0.5 + vec2(cos(angle), sin(angle)) * radius;
    }

    // --- Wave Distortion ---
    uniform float u_wave_amplitude;
    uniform float u_wave_frequency;
    vec2 waveDistortion(vec2 uv, float amp, float freq) {
        return uv + vec2(sin(uv.y * freq) * amp, cos(uv.x * freq) * amp);
    }

    // --- Color Filters ---
    uniform int u_color_filter_mode; // 0=None, 1=B&W, 2=Sepia, 3=Invert
    vec3 applyColorFilter(vec3 color, int mode) {
        if (mode == 1) { // B&W
            float gray = dot(color, vec3(0.299, 0.587, 0.114));
            return vec3(gray);
        } else if (mode == 2) { // Sepia
            vec3 sepia = vec3(
                dot(color, vec3(0.393, 0.769, 0.189)),
                dot(color, vec3(0.349, 0.686, 0.168)),
                dot(color, vec3(0.272, 0.534, 0.131))
            );
            return sepia;
        } else if (mode == 3) { // Invert
            return 1.0 - color;
        }
        return color;
    }

    // --- Edge Highlight (Sobel) ---
    uniform float u_edge_intensity;
    float edgeDetect(vec2 uv, vec2 resolution) {
        vec2 ts = 1.0 / resolution;
        vec3 c = texture2D(u_image, uv).rgb;
        float gray = dot(c, vec3(0.299, 0.587, 0.114));
        
        // Simple cross edge detection
        float g_up = dot(texture2D(u_image, uv + vec2(0.0, -ts.y)).rgb, vec3(0.299));
        float g_down = dot(texture2D(u_image, uv + vec2(0.0, ts.y)).rgb, vec3(0.299));
        float g_left = dot(texture2D(u_image, uv + vec2(-ts.x, 0.0)).rgb, vec3(0.299));
        float g_right = dot(texture2D(u_image, uv + vec2(ts.x, 0.0)).rgb, vec3(0.299));
        
        float dy = abs(g_up - g_down);
        float dx = abs(g_left - g_right);
        
        return (dx + dy) * 2.0; // Boost edge signal
    }

    // --- Bloom ---
    uniform float u_bloom_intensity; // Brightness
    uniform float u_bloom_radius;    // Softness
    uniform float u_bloom_threshold; // Threshold
    // Simple 9-tap blur approximation for bloom
    vec3 bloomEffect(vec2 uv, vec3 color) {
        float step_w = u_bloom_radius / u_resolution.x;
        float step_h = u_bloom_radius / u_resolution.y;
        vec3 sum = vec3(0.0);
        // Grid sample - very simple blur
        for(int x = -1; x <= 1; x++) {
            for(int y = -1; y <= 1; y++) {
                vec2 offset = vec2(float(x) * step_w, float(y) * step_h);
                vec3 s = texture2D(u_image, uv + offset).rgb;
                // Threshold
                float b = dot(s, vec3(0.299, 0.587, 0.114));
                if (b > u_bloom_threshold) {
                    sum += s;
                }
            }
        }
        return color + (sum / 9.0) * u_bloom_intensity;
    }

    // --- Glitch (Block) ---
    uniform float u_glitch_intensity;
    uniform float u_glitch_size;
    vec2 glitchEffect(vec2 uv) {
        float time = u_time * 10.0; // Fast jitter
        vec2 block = floor(uv * (u_resolution / u_glitch_size));
        float rand = random(block + time);
        
        if (rand < u_glitch_intensity * 0.1) { // 10% chance per block modulated by intensity
             float shift = (random(block + time + 1.0) - 0.5) * 0.1; // Max 5% shift
             uv.x += shift;
        }
        return uv;
    }

    // --- Vignette (Standalone) ---
    uniform float u_vignette_intensity;
    vec3 applyVignette(vec3 color, vec2 uv) {
        vec2 dc = uv - 0.5;
        float dist = length(dc);
        float radius = 0.5;
        float softness = 0.4;
        float vig = smoothstep(radius, radius - softness, dist * (1.0 + u_vignette_intensity));
        return color * mix(1.0, vig, u_vignette_intensity);
    }
    
    // --- Scanlines ---
    uniform float u_scanline_thickness; // 0.0 to 1.0

    void main() {
        vec2 uv = v_texCoord;

        // --- 0. Pre-Warp Effects (Geometric) ---
        if (u_kaleidoscope_segments > 1.0) {
            uv = kaleidoscope(uv, u_kaleidoscope_segments);
        }
        
        if (u_wave_amplitude > 0.0) {
            uv = waveDistortion(uv, u_wave_amplitude, u_wave_frequency);
        }
        
        if (u_glitch_intensity > 0.0) {
            uv = glitchEffect(uv);
        }

        // --- 1. CRT Warp ---
        if (u_crt_intensity > 0.0) {
            uv = crtWarp(uv, u_crt_intensity * 0.5);
        }

        bool outOfBounds = (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0);
        if (outOfBounds) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            return;
        }

        // --- 2. VHS Jitter (Horizontal) ---
        if (u_vhs_intensity > 0.0) {
            float jitter = random(vec2(u_time, uv.y)) * 2.0 - 1.0;
            if (random(vec2(u_time * 0.5, uv.y * 5.0)) > 0.98) {
               uv.x += jitter * u_vhs_intensity * 0.01; // Reduced from 0.05 to 0.01 to match backend 1-2%
            }
        }
        
        // --- 3. Pixelate ---
        if (u_pixelate_size > 1.0) {
             vec2 sizes = u_resolution / u_pixelate_size;
             uv = floor(uv * sizes) / sizes;
        }

        // --- 4. Sampling & Chromatic Aberration ---
        // Backend: Max shift 5% of width at intensity 50.
        // intensity 1 -> 0.1% width. (1/50 * 0.05 = 0.001)
        float aber = u_aberration_intensity * 0.001; 
        if (u_crt_intensity > 0.0) {
            vec2 dc = uv - 0.5;
            aber += dot(dc, dc) * u_crt_intensity * 0.02; // Reduced CRT aberration influence slightly
        }

        vec4 color;
        color.r = texture2D(u_image, uv + vec2(aber, 0.0)).r;
        color.g = texture2D(u_image, uv).g;
        color.b = texture2D(u_image, uv - vec2(aber, 0.0)).b;
        color.a = 1.0;

        // --- 5. Color Adjustments ---
        color.rgb *= (u_brightness / 100.0);
        color.rgb = (color.rgb - 0.5) * (u_contrast / 100.0) + 0.5;
        
        vec3 hsv = rgb2hsv(color.rgb);
        hsv.y *= (u_saturation / 100.0);
        color.rgb = hsv2rgb(hsv);
        
        // Filter Modes (Sepia, B&W, Invert)
        color.rgb = applyColorFilter(color.rgb, u_color_filter_mode);
        
        // Bloom
        if (u_bloom_intensity > 0.0) {
            color.rgb = bloomEffect(uv, color.rgb);
        }

        // --- 6. Post-Processing Overlays ---
        // Edge Highlight
        if (u_edge_intensity > 0.0) {
            float edge = edgeDetect(uv, u_resolution);
            color.rgb += edge * u_edge_intensity;
        }

        // Scanlines
        if (u_scanline_intensity > 0.0 || u_crt_intensity > 0.0) {
            float count = u_resolution.y * 0.5; 
            if (u_crt_intensity > 0.0) count = u_resolution.y * 0.25; 
            
            // Thickness control
            float thick = clamp(1.0 - u_scanline_thickness, 0.01, 0.99); // Inverse logic: higher thickness = wider dark lines? No, wider bright lines.
            // Standard sin wave is -1 to 1.
            // We want to control the "duty cycle".
            // Use line distance
            float l = fract(uv.y * count);
            // Thick lines (1.0) -> thin black gaps. Thin lines (0.0) -> thick black gaps.
            // Let's use simple sine but power it
            
            float scanline = sin(uv.y * count * 3.14159 * 2.0);
            scanline = (scanline + 1.0) * 0.5; // 0 to 1
            
            // Apply thickness pwr
            // thickness 0.5 -> pow 1.0
            // thickness 0.1 -> pow 10.0 (very thin bright lines)
            // thickness 0.9 -> pow 0.1 (very fat bright lines)
            // User requested "modificar el grosor". 
            // Lets map existing param 'thickness' (if added) or just default logic
            
            // For now, assume thickness is mapped to 'u_scanline_thickness' if > 0, else 0.5
            float p = 1.0;
            if (u_scanline_thickness > 0.0) p = (1.0 - u_scanline_thickness) * 10.0 + 0.1;
            
            scanline = pow(scanline, p);
            
            float intensity = u_scanline_intensity;
            if (u_crt_intensity > 0.0) intensity = max(intensity * 0.5, 0.15);
            
            color.rgb *= mix(1.0, scanline, intensity);
        }
        
        // VHS/Grain Noise
        if (u_grain_intensity > 0.0 || u_vhs_intensity > 0.0) {
             float noise = random(uv + vec2(u_time, u_time));
             float total_grain = u_grain_intensity + u_vhs_intensity * 0.5;
             color.rgb += (noise - 0.5) * total_grain * 0.3;
        }
        
        // CRT Vignette
        if (u_crt_intensity > 0.0) {
            vec2 dc = uv - 0.5;
            float dist = dot(dc, dc);
            float vig = 1.0 - dist * 3.0;
            vig = clamp(vig, 0.0, 1.0);
            vig = pow(vig, 0.5);
            color.rgb *= vig;
        }
        
        // General Vignette (Standalone)
        if (u_vignette_intensity > 0.0) {
            color.rgb = applyVignette(color.rgb, uv);
        }

        gl_FragColor = color;
    }
`;

const WebGLFilterCanvas = React.forwardRef(({ image, adjustments, vfxStack, width, height, rotation }, ref) => {
    const canvasRef = useRef(null);
    const [gl, setGl] = useState(null);
    const [program, setProgram] = useState(null);
    const [texture, setTexture] = useState(null);
    const [imageObj, setImageObj] = useState(null);

    // Animation refs
    const requestRef = useRef();
    const startTimeRef = useRef(Date.now());

    React.useImperativeHandle(ref, () => ({
        getCanvasDataURL: () => {
            const canvas = canvasRef.current;
            if (!canvas) return null;
            return canvas.toDataURL('image/png');
        },
        getPixel: (x, y) => {
            // Read pixel at x, y
            // Note: WebGL coordinates are (0,0) at bottom-left, DOM is top-left.
            // We need to flip Y.
            if (!gl) return null;

            const pixels = new Uint8Array(4);
            // Verify bounds? readPixels handles it (returns 0)
            // y is from top, so glY = height - y.
            // readPixels origin is bottom-left. Top-left pixel (0,0) is at (0, height-1).
            const glY = gl.drawingBufferHeight - y - 1;
            if (glY < 0 || glY >= gl.drawingBufferHeight || x < 0 || x >= gl.drawingBufferWidth) return null;

            gl.readPixels(x, glY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

            // Convert to hex
            const hex = "#" + ((1 << 24) + (pixels[0] << 16) + (pixels[1] << 8) + pixels[2]).toString(16).slice(1);
            return hex;
        }
    }));

    // Load Image
    useEffect(() => {
        if (!image) return;
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = image;
        img.onload = () => {
            setImageObj(img);
        };
    }, [image]);

    // Init WebGL
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('webgl', { preserveDrawingBuffer: true });
        if (!context) {
            console.error("WebGL not supported");
            return;
        }
        setGl(context);

        // Compile Shaders
        const vert = createShader(context, context.VERTEX_SHADER, vertexShaderSource);
        const frag = createShader(context, context.FRAGMENT_SHADER, fragmentShaderSource);
        const prog = createProgram(context, vert, frag);
        setProgram(prog);

        context.useProgram(prog);

        // Position Buffer (Full Quad)
        const positionBuffer = context.createBuffer();
        context.bindBuffer(context.ARRAY_BUFFER, positionBuffer);
        context.bufferData(context.ARRAY_BUFFER, new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            -1, 1,
            1, -1,
            1, 1,
        ]), context.STATIC_DRAW);

        const positionLocation = context.getAttribLocation(prog, "a_position");
        context.enableVertexAttribArray(positionLocation);
        context.vertexAttribPointer(positionLocation, 2, context.FLOAT, false, 0, 0);

        // TexCoord Buffer
        const texCoordBuffer = context.createBuffer();
        context.bindBuffer(context.ARRAY_BUFFER, texCoordBuffer);
        context.bufferData(context.ARRAY_BUFFER, new Float32Array([
            0, 1,
            1, 1,
            0, 0,
            0, 0,
            1, 1,
            1, 0,
        ]), context.STATIC_DRAW);

        const texCoordLocation = context.getAttribLocation(prog, "a_texCoord");
        context.enableVertexAttribArray(texCoordLocation);
        context.vertexAttribPointer(texCoordLocation, 2, context.FLOAT, false, 0, 0);

    }, [canvasRef]);

    // Create Texture when image loads
    useEffect(() => {
        if (!gl || !imageObj) return;
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageObj);
        setTexture(tex);
    }, [gl, imageObj]);

    // Render Loop
    const render = () => {
        if (!gl || !program || !texture || !imageObj) return;

        // Resize canvas to display size
        const canvas = canvasRef.current;
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;

        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
        }

        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);

        // Uniforms
        const time = (Date.now() - startTimeRef.current) / 1000.0;
        gl.uniform1f(gl.getUniformLocation(program, "u_time"), time);
        gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), gl.drawingBufferWidth, gl.drawingBufferHeight);

        // Adjustments
        gl.uniform1f(gl.getUniformLocation(program, "u_brightness"), adjustments?.brightness ?? 100);
        gl.uniform1f(gl.getUniformLocation(program, "u_contrast"), adjustments?.contrast ?? 100);
        gl.uniform1f(gl.getUniformLocation(program, "u_saturation"), adjustments?.saturation ?? 100);

        // Params helper
        const getParam = (type, param, def = 0) => {
            const effect = vfxStack?.find(v => v.type === type && v.enabled !== false);
            return effect ? (effect.params[param] ?? def) : 0;
        };

        const hasEffect = (type) => vfxStack?.some(v => v.type === type && v.enabled !== false);

        gl.uniform1f(gl.getUniformLocation(program, "u_crt_intensity"), getParam("CRT Warp", "intensity", 0));
        gl.uniform1f(gl.getUniformLocation(program, "u_vhs_intensity"), getParam("VHS", "intensity", 0));

        // Scanlines with thickness
        gl.uniform1f(gl.getUniformLocation(program, "u_scanline_intensity"), getParam("Scanlines", "intensity", 0));
        gl.uniform1f(gl.getUniformLocation(program, "u_scanline_thickness"), getParam("Scanlines", "thickness", 0.5)); // Default 0.5

        gl.uniform1f(gl.getUniformLocation(program, "u_grain_intensity"), getParam("Film Grain", "intensity", 0));
        gl.uniform1f(gl.getUniformLocation(program, "u_aberration_intensity"), getParam("Chromatic Aberration", "intensity", 0));
        gl.uniform1f(gl.getUniformLocation(program, "u_pixelate_size"), getParam("Pixelate", "size", 1));

        // Bloom
        gl.uniform1f(gl.getUniformLocation(program, "u_bloom_intensity"), getParam("Bloom", "intensity", 0));
        gl.uniform1f(gl.getUniformLocation(program, "u_bloom_radius"), getParam("Bloom", "radius", 10));
        gl.uniform1f(gl.getUniformLocation(program, "u_bloom_threshold"), getParam("Bloom", "threshold", 0.8));

        // Glitch
        gl.uniform1f(gl.getUniformLocation(program, "u_glitch_intensity"), getParam("Glitch", "intensity", 0));
        gl.uniform1f(gl.getUniformLocation(program, "u_glitch_size"), getParam("Glitch", "block_size", 16));

        // Vignette
        gl.uniform1f(gl.getUniformLocation(program, "u_vignette_intensity"), getParam("Vignette", "intensity", 0));

        // New effects
        gl.uniform1f(gl.getUniformLocation(program, "u_kaleidoscope_segments"), getParam("Kaleidoscope", "segments", 0));
        gl.uniform1f(gl.getUniformLocation(program, "u_wave_amplitude"), getParam("Wave Distortion", "amplitude", 0));
        gl.uniform1f(gl.getUniformLocation(program, "u_wave_frequency"), getParam("Wave Distortion", "frequency", 10));
        gl.uniform1f(gl.getUniformLocation(program, "u_edge_intensity"), getParam("Edge Highlight", "intensity", 0));

        // Color Filter Mode Mapped to Int
        let colorMode = 0;
        const colorEffect = vfxStack?.find(v => v.type === 'Color Filter' && v.enabled !== false);
        if (colorEffect) {
            if (colorEffect.params.mode === 'B&W') colorMode = 1;
            if (colorEffect.params.mode === 'Sepia') colorMode = 2;
            if (colorEffect.params.mode === 'Invert') colorMode = 3;
        }
        gl.uniform1i(gl.getUniformLocation(program, "u_color_filter_mode"), colorMode);


        gl.drawArrays(gl.TRIANGLES, 0, 6);

        requestRef.current = requestAnimationFrame(render);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(requestRef.current);
    }, [gl, program, texture, vfxStack, adjustments, rotation]); // Re-start loop if dependencies change? Actually loop handles refs.

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: `rotate(${rotation}deg)`,
                pointerEvents: 'none' // Let clicks pass through if needed
            }}
        />
    );
}); // END forwardRef

// Utils
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader Compile Error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program Link Error:", gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

export default WebGLFilterCanvas;
