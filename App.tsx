import React, { useState, useEffect, useCallback } from 'react';
import type { Resolution } from './types';
import ControlPanel from './components/ControlPanel';
import ResultDisplay from './components/ResultDisplay';
import { generateImage, fileToBase64 } from './services/geminiService';

const App: React.FC = () => {
  // State for controls
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [accessoryFiles, setAccessoryFiles] = useState<File[]>([]);
  const [accessoryPreviews, setAccessoryPreviews] = useState<string[]>([]);
  const [fashionFile, setFashionFile] = useState<File | null>(null);
  const [fashionPreview, setFashionPreview] = useState<string | null>(null);
  const [removeBackground, setRemoveBackground] = useState<boolean>(false);
  const [faceReference, setFaceReference] = useState<number>(100);
  const [characterDescription, setCharacterDescription] = useState<string>('');
  const [backgroundDescription, setBackgroundDescription] = useState<string>('');
  const [resolution, setResolution] = useState<Resolution>('Chuẩn');

  // State for results and app status
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      
      // 1. Add main character image
      const base64Image = await fileToBase64(imageFile);
      parts.push({ inlineData: { data: base64Image, mimeType: imageFile.type } });

      // 2. Add accessory images if they exist
      if (accessoryFiles.length > 0) {
        for (const file of accessoryFiles) {
          const base64Accessory = await fileToBase64(file);
          parts.push({ inlineData: { data: base64Accessory, mimeType: file.type } });
        }
      }

      // 3. Add fashion image if it exists
      if (fashionFile) {
        const base64Fashion = await fileToBase64(fashionFile);
        parts.push({ inlineData: { data: base64Fashion, mimeType: fashionFile.type } });
      }

      // 4. Construct the final prompt
      const prompt = `Dựa trên hình ảnh đầu tiên (nhân vật chính), hãy tạo một hình ảnh mới.
${accessoryFiles.length > 0 ? `Sử dụng ${accessoryFiles.length} hình ảnh tiếp theo làm nguồn tham khảo cho các phụ kiện.` : ''}
${fashionFile ? `Sử dụng hình ảnh cuối cùng làm nguồn tham khảo cho trang phục.` : ''}
${removeBackground ? 'Đầu tiên, hãy xóa nền khỏi chủ thể trong ảnh nhân vật chính.' : ''}
Hãy giữ lại ${faceReference}% các đặc điểm trên khuôn mặt của nhân vật gốc.
Mô tả nhân vật: "${characterDescription || 'như trong ảnh gốc'}".
Bối cảnh và không gian: "${backgroundDescription || 'một không gian đơn giản, tập trung vào nhân vật'}".
Chất lượng hình ảnh yêu cầu: ${resolution}.
Chỉ trả về hình ảnh đã được chỉnh sửa mà không có bất kỳ văn bản, logo hoặc chú thích nào.`;
      parts.push({ text: prompt });
      
      // The API generates one image per call, so we call it 4 times in parallel.
      const imagePromises = Array.from({ length: 4 }).map(() => 
        generateImage(parts)
      );

      const results = await Promise.all(imagePromises);
      setGeneratedImages(results);

    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi không mong muốn.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, accessoryFiles, fashionFile, removeBackground, faceReference, characterDescription, backgroundDescription, resolution]);

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