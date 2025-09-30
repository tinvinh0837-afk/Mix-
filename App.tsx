import React, { useState, useEffect, useCallback } from 'react';
import type { Resolution, Style } from './types';
import ControlPanel from './components/ControlPanel';
import ResultDisplay from './components/ResultDisplay';
import { generateImage, fileToBase64 } from './services/geminiService';

const APP_STATE_KEY = 'taoAnhProAppState';

const App: React.FC = () => {
  // State for controls
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [accessoryFiles, setAccessoryFiles] = useState<File[]>([]);
  const [accessoryPreviews, setAccessoryPreviews] = useState<string[]>([]);
  const [fashionFile, setFashionFile] = useState<File | null>(null);
  const [fashionPreview, setFashionPreview] = useState<string | null>(null);
  
  // States that will be persisted
  const [removeBackground, setRemoveBackground] = useState<boolean>(false);
  const [faceReference, setFaceReference] = useState<number>(100);
  const [characterDescription, setCharacterDescription] = useState<string>('');
  const [backgroundDescription, setBackgroundDescription] = useState<string>('');
  const [resolution, setResolution] = useState<Resolution>('Chuẩn');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<Style>('Mặc định');

  // State for results and app status
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to load state from localStorage on initial render
  useEffect(() => {
    try {
      const savedStateJSON = localStorage.getItem(APP_STATE_KEY);
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        setRemoveBackground(savedState.removeBackground ?? false);
        setFaceReference(savedState.faceReference ?? 100);
        setCharacterDescription(savedState.characterDescription ?? '');
        setBackgroundDescription(savedState.backgroundDescription ?? '');
        setResolution(savedState.resolution ?? 'Chuẩn');
        setNegativePrompt(savedState.negativePrompt ?? '');
        setSelectedStyle(savedState.selectedStyle ?? 'Mặc định');
      }
    } catch (e) {
      console.error("Failed to load state from localStorage", e);
    }
  }, []);

  // Effect to save state to localStorage whenever a setting changes
  useEffect(() => {
    const stateToSave = {
      removeBackground,
      faceReference,
      characterDescription,
      backgroundDescription,
      resolution,
      negativePrompt,
      selectedStyle,
    };
    localStorage.setItem(APP_STATE_KEY, JSON.stringify(stateToSave));
  }, [removeBackground, faceReference, characterDescription, backgroundDescription, resolution, negativePrompt, selectedStyle]);


  const createImageChangeHandler = (
    setFile: (file: File | null) => void,
    setPreview: (preview: string | null) => void
  ) => (file: File | null) => {
    setFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };
  
  const handleImageChange = createImageChangeHandler(setImageFile, setImagePreview);
  const handleFashionChange = createImageChangeHandler(setFashionFile, setFashionPreview);

  const handleAddAccessoryFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const filesArray = Array.from(newFiles);
    setAccessoryFiles(prev => [...prev, ...filesArray]);

    filesArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAccessoryPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAccessoryFile = (indexToRemove: number) => {
    setAccessoryFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setAccessoryPreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };


  const handleGenerate = useCallback(async () => {
    if (!imageFile) {
      setError('Vui lòng tải lên một hình ảnh nhân vật để bắt đầu.');
      return;
    }

    setIsLoading(true);
    setGeneratedImages([]);
    setError(null);

    try {
      const parts: ({ inlineData: { data: string; mimeType: string; } } | { text: string })[] = [];
      
      const base64Image = await fileToBase64(imageFile);
      parts.push({ inlineData: { data: base64Image, mimeType: imageFile.type } });

      for (const file of accessoryFiles) {
        const base64Accessory = await fileToBase64(file);
        parts.push({ inlineData: { data: base64Accessory, mimeType: file.type } });
      }

      if (fashionFile) {
        const base64Fashion = await fileToBase64(fashionFile);
        parts.push({ inlineData: { data: base64Fashion, mimeType: fashionFile.type } });
      }

      const prompt = `Tạo một hình ảnh mới dựa trên các hình ảnh được cung cấp.
- Hình ảnh đầu tiên là nhân vật chính.
${accessoryFiles.length > 0 ? `- ${accessoryFiles.length} hình ảnh tiếp theo là các phụ kiện tham khảo.` : ''}
${fashionFile ? `- Hình ảnh cuối cùng là trang phục tham khảo.` : ''}
- Yêu cầu xử lý:
  ${removeBackground ? '1. Xóa nền khỏi nhân vật chính trước khi sáng tạo.' : ''}
  2. Giữ lại ${faceReference}% đặc điểm khuôn mặt của nhân vật gốc.
  3. Phong cách nghệ thuật: ${selectedStyle === 'Mặc định' ? 'theo mô tả' : selectedStyle}.
- Mô tả chi tiết:
  - Nhân vật: "${characterDescription || 'như trong ảnh gốc'}".
  - Bối cảnh và không gian: "${backgroundDescription || 'một không gian đơn giản, tập trung vào nhân vật'}".
${negativePrompt ? `- Các yếu tố cần tránh (negative prompt): "${negativePrompt}".` : ''}
- Chất lượng hình ảnh yêu cầu: ${resolution}.
- QUAN TRỌNG: Chỉ trả về hình ảnh đã được tạo ra, không kèm theo bất kỳ văn bản, logo hay chú thích nào.`;
      parts.push({ text: prompt });
      
      const imagePromises = Array.from({ length: 4 }).map(() => generateImage(parts));

      const results = await Promise.allSettled(imagePromises);
      
      const successfulResults = results
        .filter(res => res.status === 'fulfilled')
        .map(res => (res as PromiseFulfilledResult<string>).value);

      if (successfulResults.length === 0) {
        const firstError = results.find(res => res.status === 'rejected') as PromiseRejectedResult | undefined;
        throw new Error(firstError?.reason?.message || 'Không thể tạo bất kỳ hình ảnh nào.');
      }

      if (successfulResults.length < 4) {
        setError(`Tạo thành công ${successfulResults.length}/4 ảnh. Một số yêu cầu đã gặp lỗi.`);
      }

      setGeneratedImages(successfulResults);

    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi không mong muốn.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, accessoryFiles, fashionFile, removeBackground, faceReference, characterDescription, backgroundDescription, resolution, negativePrompt, selectedStyle]);

  const handleDownloadAll = () => {
    generatedImages.forEach((base64, index) => {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${base64}`;
      link.download = `tao-anh-pro-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto h-full">
        <ControlPanel
          imageFile={imageFile}
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
          accessoryPreviews={accessoryPreviews}
          onAddAccessoryFiles={handleAddAccessoryFiles}
          onRemoveAccessoryFile={handleRemoveAccessoryFile}
          fashionPreview={fashionPreview}
          onFashionChange={handleFashionChange}
          removeBackground={removeBackground}
          setRemoveBackground={setRemoveBackground}
          faceReference={faceReference}
          setFaceReference={setFaceReference}
          characterDescription={characterDescription}
          setCharacterDescription={setCharacterDescription}
          backgroundDescription={backgroundDescription}
          setBackgroundDescription={setBackgroundDescription}
          negativePrompt={negativePrompt}
          setNegativePrompt={setNegativePrompt}
          selectedStyle={selectedStyle}
          setSelectedStyle={setSelectedStyle}
          resolution={resolution}
          setResolution={setResolution}
          onGenerate={handleGenerate}
          isLoading={isLoading}
        />
        <div className="lg:max-h-[90vh]">
          {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          <ResultDisplay 
            images={generatedImages}
            isLoading={isLoading}
            onDownloadAll={handleDownloadAll}
          />
        </div>
      </main>
    </div>
  );
};

export default App;