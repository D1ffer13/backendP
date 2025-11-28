import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  type = 'button',
  onClick, 
  disabled = false,
  icon,
  className = ''
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;