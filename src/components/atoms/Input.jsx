import React from 'react';

const Input = ({ type = 'text', value, onChange, placeholder, className, onKeyPress, autoFocus, readOnly }) => {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={className}
            onKeyPress={onKeyPress}
            autoFocus={autoFocus}
            readOnly={readOnly}
        />
    );
};

export default Input;