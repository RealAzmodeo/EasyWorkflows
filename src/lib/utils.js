/**
 * Common utility functions for the frontend application.
 */

import { workflows } from "../config/workflows";

/**
 * Convert a URL to a File object.
 * Useful for re-uploading images from history or drag-and-drop.
 * @param {string} url - The URL of the image.
 * @param {string} filename - The filename to assign.
 * @returns {Promise<File>}
 */
export const urlToFile = async (url, filename) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new File([blob], filename, { type: blob.type });
    } catch (error) {
        console.error("Error converting URL to File:", error);
        return null;
    }
};

/**
 * Save form values to localStorage, excluding File objects.
 * @param {string} key - localStorage key.
 * @param {object} values - Form values object.
 */
export const saveFormToLocalStorage = (key, values) => {
    try {
        // Filter out File objects as they cannot be serialized
        const serializable = Object.fromEntries(
            Object.entries(values).filter(([_, v]) => !(v instanceof File))
        );
        localStorage.setItem(key, JSON.stringify(serializable));
    } catch (error) {
        console.error("Error saving form values:", error);
    }
};

/**
 * Load form values from localStorage.
 * @param {string} key - localStorage key.
 * @returns {object} - The parsed object or an empty object.
 */
export const loadFormFromLocalStorage = (key) => {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : {};
    } catch (error) {
        console.error("Error loading form values:", error);
        return {};
    }
};

/**
 * Get a random "fun" loading status message based on the workflow category.
 * @param {string} workflowId - The ID of the currently selected workflow.
 * @returns {string} - A random status message.
 */
export const getFunStatus = (workflowId) => {
    if (!workflowId) return "Preparing...";

    const workflow = workflows.find(w => w.id === workflowId);
    const category = workflow?.category || 'Utility';

    const messages = {
        'Stylization': [
            'Transforming your look...',
            'Adding a touch of magic...',
            'Refining the aesthetic...',
            'Styling in progress...'
        ],
        'Characters': [
            'Bringing them to life...',
            'Defining character traits...',
            'Crafting the personality...',
            'Finalizing the features...'
        ],
        'Face': [
            'Enhancing the expression...',
            'Focusing on the details...',
            'Polishing the portrait...',
            'Perfecting the face...'
        ],
        'Utility': [
            'Processing your request...',
            'Generating results...',
            'Almost there...',
            'Crunching pixels...'
        ]
    };

    const categoryMessages = messages[category] || messages['Utility'];
    return categoryMessages[Math.floor(Date.now() / 2000) % categoryMessages.length];
};

/**
 * Save history to localStorage.
 * @param {string} key - localStorage key.
 * @param {Array} history - Array of image objects.
 */
export const saveHistoryToLocalStorage = (key, history) => {
    try {
        // Keep only the last 50 items to stay within storage limits
        const truncated = history.slice(0, 50);
        localStorage.setItem(key, JSON.stringify(truncated));
    } catch (error) {
        console.error("Error saving history:", error);
    }
};

/**
 * Load history from localStorage.
 * @param {string} key - localStorage key.
 * @returns {Array} - The parsed history array or an empty array.
 */
export const loadHistoryFromLocalStorage = (key) => {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error("Error loading history:", error);
        return [];
    }
};
