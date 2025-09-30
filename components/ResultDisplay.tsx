import React, { useState } from 'react';
import { DownloadIcon, SparklesIcon, ZoomInIcon } from './icons';
import ImageModal from './ImageModal';

interface ResultDisplayProps {
  images: string[];
  isLoading: boolean;
  onDownloadAll: () => void;
}

const ImageSkeleton: React.FC = () => (
  <div className="aspect-square bg-gray-700 rounded-lg animate-pulse"></div>
);

const ResultDisplay: React.FC<ResultDisplayProps> = ({ images, isLoading, onDownloadAll }) => {
  const hasImages = images.length > 0;
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  return (
    <div className="p-6 flex flex-col h-full">
      <div className="flex-grow grid grid-cols-2 grid-rows-2 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => <ImageSkeleton key={index} />)
        ) : hasImages ? (
          images.map((imgSrc, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={`data:image/png;base64,${imgSrc}`}
                alt={`Generated result ${index + 1}`}
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 flex items-center justify-center gap-4 rounded-lg">
                <button
                  onClick={() => setZoomedImage(imgSrc)}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transform group-hover:scale-100 scale-90 transition-all duration-300"
                  aria-label="Zoom image"
                >
                  <ZoomInIcon className="w-6 h-6" />
                </button>
                <a
                  href={`data:image/png;base64,${imgSrc}`}
                  download={`tao-anh-pro-${index + 1}.png`}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transform group-hover:scale-100 scale-90 transition-all duration-300"
                  aria-label="Download image"
                >
                  <DownloadIcon className="w-6 h-6" />
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 row-span-2 flex flex-col items-center justify-center text-center text-gray-500 border-2 border-dashed border-gray-700 rounded-lg">
            <SparklesIcon className="w-16 h-16 mb-4" />
            <h2 className="text-xl font-semibold text-gray-400">Kết quả của bạn sẽ xuất hiện ở đây</h2>
            <p className="max-w-xs mt-2">Điền thông tin và nhấn "Tạo ảnh" để bắt đầu quá trình sáng tạo.</p>
          </div>
        )}
      </div>
      <div className="mt-6 flex-shrink-0">
        <button
          onClick={onDownloadAll}
          disabled={!hasImages || isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 text-base font-semibold text-white rounded-lg bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
        >
          <DownloadIcon className="w-5 h-5" />
          Tải xuống tất cả
        </button>
      </div>

      {zoomedImage && (
        <ImageModal 
          imageSrc={zoomedImage} 
          onClose={() => setZoomedImage(null)} 
        />
      )}
    </div>
  );
};

export default ResultDisplay;