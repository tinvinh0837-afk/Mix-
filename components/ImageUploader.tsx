import React, { useRef } from 'react';
import { UploadIcon, TrashIcon } from './icons';

interface ImageUploaderProps {
  imagePreview: string | null;
  onImageChange: (file: File | null) => void;
  label: string;
  heightClassName?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  imagePreview, 
  onImageChange, 
  label, 
  heightClassName = 'h-64' 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onImageChange(file);
  };

  const handleRemoveImage = () => {
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div 
        className={`relative flex justify-center items-center w-full ${heightClassName} border-2 border-dashed border-gray-600 rounded-lg bg-gray-800 hover:border-blue-500 transition-colors duration-300 cursor-pointer`}
        onClick={() => fileInputRef.current?.click()}
      >
        {imagePreview ? (
          <>
            <img src={imagePreview} alt="Preview" className="object-contain h-full w-full rounded-lg" />
            <button
              onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
              className="absolute top-2 right-2 p-2 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
              aria-label="Remove image"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="text-center p-2">
            <UploadIcon className="mx-auto h-10 w-10 text-gray-500" />
            <p className="mt-2 text-xs text-gray-400">Nhấn để tải ảnh lên</p>
            <p className="text-xs text-gray-500">PNG, JPG</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default ImageUploader;