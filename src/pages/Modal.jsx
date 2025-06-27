import React, { useEffect } from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'lg', // sm, md, lg, xl
  showCloseButton = true 
}) => {
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27 && isOpen) onClose();
    };
    
    window.addEventListener('keydown', handleEsc);
    
    // Prevent body scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // Stop click propagation on modal content
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  // Calculate modal width based on size prop
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-full mx-4',
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl overflow-hidden w-full ${sizeClasses[size] || sizeClasses.lg} animate-modal-in`}
        onClick={handleContentClick}
      >
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          {showCloseButton && (
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;