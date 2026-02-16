/**
 * ComfyUI API Wrapper
 * Handles WebSocket connection and HTTP requests to ComfyUI backend.
 */
export class ComfyApi {
    constructor() {
        // Use relative path - proxy will handle it
        this.host = window.location.host;
        // Use reliable UUID generation even in non-secure (HTTP) contexts
        // Persist clientId so we can receive events after a refresh
        const savedId = localStorage.getItem('comfy_client_id');
        this.clientId = savedId || ((typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            }));

        if (!savedId) {
            localStorage.setItem('comfy_client_id', this.clientId);
        }
        this.socket = null;
        this.status = 'disconnected';
        this.queueRemaining = 0;
        this.eventListeners = {
            'status': [],
            'progress': [],
            'executed': [],
            'execution_start': [],
            'execution_error': [],
            'execution_cached': []
        };
    }

    /**
     * Connect to ComfyUI WebSocket
     */
    connect() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${this.host}/ws?clientId=${this.clientId}`;

        console.log(`Connecting to ComfyUI at ${wsUrl}...`);

        this.socket = new WebSocket(wsUrl);

        this.socket.addEventListener('open', () => {
            console.log('Connected to ComfyUI');
            this.status = 'connected';
            this._trigger('status', { status: 'connected' });
        });

        this.socket.addEventListener('message', (event) => {
            try {
                const msg = JSON.parse(event.data);
                this._handleMessage(msg);
            } catch (e) {
                console.error('Error parsing WebSocket message:', e);
            }
        });

        this.socket.addEventListener('close', () => {
            console.log('Disconnected from ComfyUI');
            this.status = 'disconnected';
            this._trigger('status', { status: 'disconnected' });
            // Attempt reconnect after 5s
            setTimeout(() => this.connect(), 5000);
        });

        this.socket.addEventListener('error', (err) => {
            console.error('WebSocket error:', err);
            this.status = 'error';
            this._trigger('status', { status: 'error', error: err });
        });
    }

    /**
     * Disconnect WebSocket
     */
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    /**
     * Send a prompt (workflow) to ComfyUI
     * @param {Object} prompt - The workflow API JSON (output of "Save (API Format)")
     * @returns {Promise<Object>} - The response containing prompt_id
     */
    async queuePrompt(prompt) {
        const res = await fetch(`/prompt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: this.clientId,
                prompt: prompt
            })
        });

        if (!res.ok) {
            throw new Error(`ComfyUI Error: ${res.status} ${res.statusText}`);
        }

        return await res.json();
    }

    /**
     * Upload an image to ComfyUI
     * @param {File} file - The file object to upload
     * @param {String} type - 'input', 'temp', or 'output' (default: input)
     * @returns {Promise<Object>} - The response containing name, subfolder, type
     */
    async uploadImage(file, type = 'input') {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('type', type);

        const res = await fetch(`/upload/image`, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) {
            throw new Error(`Upload Error: ${res.status} ${res.statusText}`);
        }

        return await res.json();
    }

    /**
     * Interrupt current generation
     */
    async interrupt() {
        try {
            await fetch(`/interrupt`, { method: 'POST' });
        } catch (e) {
            console.error('Error interrupting:', e);
        }
    }

    /**
     * Clear the queue
     */
    async clearQueue() {
        try {
            await fetch(`/queue`, { method: 'POST', body: JSON.stringify({ clear: true }) });
        } catch (e) {
            console.error('Error clearing queue:', e);
        }
    }

    /**
     * Get queue status
     */
    async getQueue() {
        const res = await fetch(`/queue`);
        if (!res.ok) throw new Error(`Queue Fetch Error: ${res.status}`);
        return await res.json();
    }

    /**
     * Get history of a prompt
     * @param {String} promptId 
     */
    async getHistory(promptId) {
        const res = await fetch(`/history/${promptId}`);
        if (!res.ok) throw new Error(`History Fetch Error: ${res.status}`);
        return await res.json();
    }

    /**
     * Get system stats
     */
    async getSystemStats() {
        const res = await fetch(`/system_stats`);
        if (!res.ok) throw new Error(`Stats Fetch Error: ${res.status}`);
        return await res.json();
    }

    /**
     * Get URL for a file
     * @param {String} filename 
     * @param {String} subfolder 
     * @param {String} type 
     */
    getFileUrl(filename, subfolder, type = 'output') {
        const query = new URLSearchParams({
            filename,
            subfolder: subfolder || '',
            type
        });
        return `/view?${query.toString()}`;
    }

    // --- Event Handling ---

    on(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].push(callback);
        }
    }

    off(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
        }
    }

    _trigger(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(cb => cb(data));
        }
    }

    _handleMessage(msg) {
        switch (msg.type) {
            case 'status':
                this.queueRemaining = msg.data.status.exec_info.queue_remaining;
                this._trigger('status', { queueRemaining: this.queueRemaining });
                break;
            case 'progress':
                this._trigger('progress', msg.data);
                break;
            case 'executing':
                this._trigger('execution_start', msg.data);
                break;
            case 'executed':
                this._trigger('executed', msg.data);
                break;
            case 'execution_error':
                this._trigger('execution_error', msg.data);
                break;
            default:
                // console.log('Unhandled message type:', msg.type, msg);
                break;
        }
    }

    /**
     * Trigger remote startup of ComfyUI engine
     */
    async wakeUp() {
        try {
            const res = await fetch('/api/start-comfy');
            return await res.json();
        } catch (e) {
            console.error('Wake up failed:', e);
            throw e;
        }
    }
}
