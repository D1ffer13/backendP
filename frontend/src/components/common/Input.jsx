import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder,
  required = false,
  disabled = false,
  name
}) => {
  return (
    <div className="form-group">
      {label && (
        <label>
          {label}
          {required && <span style={{ color: 'red' }}> *</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
    </div>
  );
};

export default Input;