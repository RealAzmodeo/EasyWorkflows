import React from 'react';

export const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
    const variantClass = variant === 'secondary' ? 'notion-btn-secondary' : 'notion-btn';
    return (
        <button
            className={`${variantClass} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export const Input = ({ label, value, onChange, type = 'text', placeholder, ...props }) => {
    return (
        <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
            {label && (
                <label style={{
                    display: 'block',
                    marginBottom: '0.4rem',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    color: 'var(--text-secondary)'
                }}>
                    {label}
                </label>
            )}
            {type === 'textarea' ? (
                <textarea
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    rows={4}
                    style={{ resize: 'vertical' }}
                    {...props}
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    {...props}
                />
            )}
        </div>
    );
};

export const Card = ({ children, title, className = '', style = {} }) => {
    return (
        <div className={className} style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            ...style
        }}>
            {title && (
                <h3 style={{
                    marginTop: 0,
                    marginBottom: '1rem',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)'
                }}>
                    {title}
                </h3>
            )}
            {children}
        </div>
    );
};
