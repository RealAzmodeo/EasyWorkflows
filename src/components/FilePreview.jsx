import React, { useState, useEffect } from 'react';

/**
 * FilePreview Component
 * Safely handles URL.createObjectURL and URL.revokeObjectURL
 * to prevent memory leaks in the browser.
 */
export const FilePreview = ({ file, alt = "Preview", className = "", style = {} }) => {
    const [objectUrl, setObjectUrl] = useState(null);

    useEffect(() => {
        if (!file) {
            setObjectUrl(null);
            return;
        }

        // If it's already a string URL, just use it
        if (typeof file === 'string') {
            setObjectUrl(file);
            return;
        }

        // If it's a File or Blob, create a unique URL
        const url = URL.createObjectURL(file);
        setObjectUrl(url);

        // Cleanup function: Revoke the URL when component unmounts
        // or when the file changes. This is critical for memory management.
        return () => {
            if (url) {
                URL.revokeObjectURL(url);
            }
        };
    }, [file]);

    if (!objectUrl) return null;

    // Detect if the file is a video based on extension or mime type
    const isVideo = (typeof file === 'string' && (file.toLowerCase().includes('.mp4') || file.toLowerCase().includes('.webm') || file.includes('format=video'))) ||
        (file instanceof File && file.type.startsWith('video/')) ||
        (file?.filename?.toLowerCase().includes('.mp4') || file?.filename?.toLowerCase().includes('.webm'));

    if (isVideo) {
        return (
            <video
                src={objectUrl}
                className={className}
                style={{ ...style, maxWidth: '100%', height: 'auto' }}
                autoPlay
                muted
                loop
                playsInline
                controls
            />
        );
    }

    return (
        <img
            src={objectUrl}
            alt={alt}
            className={className}
            style={style}
        />
    );
};
