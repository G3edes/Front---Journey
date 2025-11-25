import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import './BackButton.css';

const BackButton = ({ onClick, children = 'Voltar', className = '', ...props }) => {
  const navigate = useNavigate();
  
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else {
      navigate(-1);
    }
  };

  return (
    <button 
      className={`back-button ${className}`} 
      onClick={handleClick}
      aria-label="Voltar"
      {...props}
    >
      <FiArrowLeft className="back-button__icon" />
      <span className="back-button__text">{children}</span>
    </button>
  );
};

export default BackButton;
