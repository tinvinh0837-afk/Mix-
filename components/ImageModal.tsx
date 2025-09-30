import React from 'react';

interface ImageModalProps {
  imageSrc: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageSrc, onClose }) => {
  // Ngăn việc nhấp vào hình ảnh làm đóng modal
  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <div 
        className="relative max-w-4xl max-h-[90vh] transition-transform duration-300 transform scale-95 animate-scale-in"
        style={{ animation: 'scaleIn 0.2s ease-out' }}
      >
        <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.9); }
          to { transform: scale(1); }
        }
      `}</style>
        <img
          src={`data:image/png;base64,${imageSrc}`}
          alt="Zoomed result"
          className="object-contain w-full h-full rounded-lg shadow-2xl"
          onClick={handleImageClick}
        />
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-9 h-9 bg-gray-900/80 backdrop-blur-sm border border-gray-600 rounded-full text-white flex items-center justify-center hover:bg-gray-800 transition-colors text-2xl font-light"
          aria-label="Close"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default ImageModal;