import React, { useRef } from 'react';
import { UploadIcon, TrashIcon } from './icons';

interface MultiImageUploaderProps {
  previews: string[];
  onAddFiles: (files: FileList | null) => void;
  onRemoveFile: (index: number) => void;
  label: string;
}

const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  previews,
  onAddFiles,
  onRemoveFile,
  label,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onAddFiles(event.target.files);
    // Clear the input value to allow re-selecting the same file(s)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div className="w-full p-2 border-2 border-dashed border-gray-600 rounded-lg bg-gray-800 min-h-[120px]">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {previews.map((src, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={src}
                alt={`Preview ${index}`}
                className="w-full h-full object-cover rounded-md"
              />
              <button
                onClick={() => onRemoveFile(index)}
                className="absolute top-1 right-1 p-1.5 bg-red-600/80 rounded-full text-white hover:bg-red-700 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Remove image"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div
            className="flex flex-col justify-center items-center w-full aspect-square border-2 border-dashed border-gray-700 rounded-md bg-gray-800/50 hover:border-blue-500 hover:bg-gray-700/50 transition-colors duration-300 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon className="h-6 w-6 text-gray-500" />
            <p className="mt-1 text-xs text-gray-400 text-center">Thêm ảnh</p>
          </div>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default MultiImageUploader;