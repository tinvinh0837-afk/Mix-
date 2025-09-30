import React from 'react';
import type { Resolution, Style } from '../types';
import ImageUploader from './ImageUploader';
import MultiImageUploader from './MultiImageUploader';
import ToggleSwitch from './ToggleSwitch';
import { SparklesIcon } from './icons';

interface ControlPanelProps {
  imageFile: File | null;
  imagePreview: string | null;
  onImageChange: (file: File | null) => void;
  accessoryPreviews: string[];
  onAddAccessoryFiles: (files: FileList | null) => void;
  onRemoveAccessoryFile: (index: number) => void;
  fashionPreview: string | null;
  onFashionChange: (file: File | null) => void;
  removeBackground: boolean;
  setRemoveBackground: (value: boolean) => void;
  faceReference: number;
  setFaceReference: (value: number) => void;
  characterDescription: string;
  setCharacterDescription: (value: string) => void;
  backgroundDescription: string;
  setBackgroundDescription: (value: string) => void;
  negativePrompt: string;
  setNegativePrompt: (value: string) => void;
  selectedStyle: Style;
  setSelectedStyle: (value: Style) => void;
  resolution: Resolution;
  setResolution: (value: Resolution) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const styles: Style[] = ['Mặc định', 'Hoạt hình 3D', 'Tranh sơn dầu', 'Cyberpunk', 'Chân thực'];

const ControlPanel: React.FC<ControlPanelProps> = (props) => {
  const {
    imageFile,
    imagePreview,
    onImageChange,
    accessoryPreviews,
    onAddAccessoryFiles,
    onRemoveAccessoryFile,
    fashionPreview,
    onFashionChange,
    removeBackground,
    setRemoveBackground,
    faceReference,
    setFaceReference,
    characterDescription,
    setCharacterDescription,
    backgroundDescription,
    setBackgroundDescription,
    negativePrompt,
    setNegativePrompt,
    selectedStyle,
    setSelectedStyle,
    resolution,
    setResolution,
    onGenerate,
    isLoading
  } = props;

  return (
    <div className="p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl flex flex-col gap-5 h-full overflow-y-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          TẠO ẢNH PRO
        </h1>
        <p className="text-gray-400 mt-1">Tạo nhân vật AI với Gemini</p>
      </div>
      
      <div className="space-y-4">
        <ImageUploader 
          label="Tải ảnh nhân vật"
          imagePreview={imagePreview} 
          onImageChange={onImageChange} 
          heightClassName="h-56"
        />
        <div className="space-y-4">
          <MultiImageUploader
            label="Tải ảnh phụ kiện (có thể chọn nhiều ảnh)"
            previews={accessoryPreviews}
            onAddFiles={onAddAccessoryFiles}
            onRemoveFile={onRemoveAccessoryFile}
          />
          <ImageUploader 
            label="Tải ảnh thời trang"
            imagePreview={fashionPreview} 
            onImageChange={onFashionChange} 
            heightClassName="h-40"
          />
        </div>
      </div>


      <div className="space-y-4">
        <ToggleSwitch label="Xóa nền cho ảnh" enabled={removeBackground} onChange={setRemoveBackground} />
        <div>
          <label htmlFor="face-ref" className="flex justify-between text-sm font-medium text-gray-300 mb-1">
            <span>Tham chiếu khuôn mặt</span>
            <span>{faceReference}%</span>
          </label>
          <input
            id="face-ref"
            type="range"
            min="0"
            max="100"
            value={faceReference}
            onChange={(e) => setFaceReference(Number(e.target.value))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-lg accent-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="char-desc" className="block text-sm font-medium text-gray-300 mb-1">Mô tả nhân vật</label>
          <textarea
            id="char-desc"
            rows={2}
            value={characterDescription}
            onChange={(e) => setCharacterDescription(e.target.value)}
            placeholder="VD: một chiến binh dũng mãnh..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg text-white p-2 text-sm focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
        <div>
          <label htmlFor="bg-desc" className="block text-sm font-medium text-gray-300 mb-1">Bối cảnh, không gian</label>
          <textarea
            id="bg-desc"
            rows={2}
            value={backgroundDescription}
            onChange={(e) => setBackgroundDescription(e.target.value)}
            placeholder="VD: đứng trên đỉnh núi tuyết..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg text-white p-2 text-sm focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
        <div>
          <label htmlFor="neg-prompt" className="block text-sm font-medium text-gray-300 mb-1">Prompt tiêu cực</label>
          <textarea
            id="neg-prompt"
            rows={2}
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="VD: xấu xí, thừa ngón tay, mờ ảo..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg text-white p-2 text-sm focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Phong cách nghệ thuật</label>
        <div className="grid grid-cols-3 gap-2">
          {styles.map(style => (
            <button
              key={style}
              onClick={() => setSelectedStyle(style)}
              className={`px-3 py-2 text-xs md:text-sm font-medium rounded-md transition-all duration-200 ${
                selectedStyle === style 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Chất lượng ảnh đầu ra</label>
        <div className="grid grid-cols-3 gap-2">
          {(['Chuẩn', '2K', '4K'] as Resolution[]).map(res => (
            <button
              key={res}
              onClick={() => setResolution(res)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                resolution === res 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {res}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={isLoading || !imageFile}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 text-base font-semibold text-white rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 mt-auto"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang xử lý...
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5" />
            Tạo ảnh
          </>
        )}
      </button>
    </div>
  );
};

export default ControlPanel;