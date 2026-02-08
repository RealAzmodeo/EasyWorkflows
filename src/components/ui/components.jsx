import React from 'react';

export const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
    const baseStyle = "btn-primary"; // Derived from index.css
    return (
        <button
            className={`${baseStyle} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export const Input = ({ label, value, onChange, type = 'text', placeholder, ...props }) => {
    return (
        <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            {label && <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{label}</label>}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                {...props}
            />
        </div>
    );
};

export const Card = ({ children, title, className = '' }) => {
    return (
        <div className={`glass-panel ${className}`} style={{ padding: '1.5rem' }}>
            {title && <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-accent)' }}>{title}</h3>}
            {children}
        </div>
    );
};
