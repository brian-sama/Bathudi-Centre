import React, { useState, useEffect } from 'react';

const Gallery: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

  const generateLocalImages = () => {
    const localImages = [];
    
    for (let i = 1; i <= 11; i++) {
      localImages.push({
        id: i,
        jpgPath: `/images/${i}.jpg`,
        jpegPath: `/images/${i}.jpeg`,
        currentPath: `/images/${i}.jpg`,
        label: `Gallery Image ${i}`,
        extension: 'jpg',
        isBackendImage: false
      });
    }
    
    for (let i = 12; i <= 44; i++) {
      localImages.push({
        id: i,
        jpgPath: `/images/${i}.jpg`,
        jpegPath: `/images/${i}.jpeg`,
        currentPath: `/images/${i}.jpeg`,
        label: `Gallery Image ${i}`,
        extension: 'jpeg',
        isBackendImage: false
      });
    }
    
    return localImages;
  };

  const localImages = generateLocalImages();

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/gallery/`);
        if (res.ok) {
          const backendImages = await res.json();
          if (backendImages.length > 0) {
            console.log(`Found ${backendImages.length} admin-uploaded images`);
            
            const formattedBackendImages = backendImages.map((img: any, index: number) => ({
              id: `backend-${img.id || index}`,
              image: img.image_url || img.image,
              label: img.title || `Admin Upload ${index + 1}`,
              isBackendImage: true
            }));
            
            setImages([...formattedBackendImages, ...localImages]);
          } else {
            setImages(localImages);
          }
        } else {
          console.warn('Backend gallery fetch failed, using local images only');
          setImages(localImages);
        }
      } catch (e) {
        console.warn('Backend offline, using local gallery images only.');
        setImages(localImages);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGallery();
  }, []);

  const handleImageError = (img: any, e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    const currentSrc = target.src;
    
    if (img.isBackendImage) {
      console.log(`Backend image failed: ${img.id}`);
      target.src = `https://via.placeholder.com/400x300/1e293b/64748b?text=Admin+Image`;
      target.onerror = null;
      return;
    }
    
    const imageId = img.id;
    const failedJpg = failedImages.has(`${imageId}-jpg`);
    const failedJpeg = failedImages.has(`${imageId}-jpeg`);
    
    if (currentSrc.includes('.jpg') && !failedJpeg) {
      console.log(`Image ${imageId}: .jpg failed, trying .jpeg`);
      target.src = `/images/${imageId}.jpeg`;
      setFailedImages(prev => new Set(prev).add(`${imageId}-jpg`));
    }
    else if (currentSrc.includes('.jpeg') && !failedJpg) {
      console.log(`Image ${imageId}: .jpeg failed, trying .jpg`);
      target.src = `/images/${imageId}.jpg`;
      setFailedImages(prev => new Set(prev).add(`${imageId}-jpeg`));
    }
    else {
      console.log(`Image ${imageId}: both extensions failed, using placeholder`);
      target.src = `https://via.placeholder.com/400x300/1e293b/64748b?text=Image+${imageId}`;
      target.onerror = null;
    }
  };

  const openLightbox = (imgSrc: string, label: string) => {
    setSelectedImage({ src: imgSrc, label });
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  };

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-blue-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs mb-3 sm:mb-4">Visual Journey</h2>
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-orbitron font-bold text-white mb-4 sm:mb-6">Our Center in Action</h3>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto px-4">
            Explore our state-of-the-art facilities and active training sessions.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {images.map((img) => {
              let imageSrc: string;
              if (img.isBackendImage) {
                imageSrc = img.image;
              } else {
                imageSrc = img.currentPath || (img.id <= 11 ? `/images/${img.id}.jpg` : `/images/${img.id}.jpeg`);
              }
              
              const label = img.label || `Gallery Image ${img.id}`;
              
              return (
                <div 
                  key={img.id} 
                  onClick={() => openLightbox(imageSrc, label)}
                  className="relative rounded-xl overflow-hidden glass border border-white/10 group shadow-lg hover:shadow-blue-500/20 transition-all duration-300 aspect-square cursor-pointer"
                >
                  <div className="relative w-full h-full overflow-hidden">
                    <img 
                      src={imageSrc}
                      alt={label}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                      onError={(e) => handleImageError(img, e)}
                    />
                    <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/20 transition-colors duration-500 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <span className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Lightbox Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-sm animate-fadeIn"
            onClick={closeLightbox}
          >
            <button 
              className="absolute top-4 right-4 z-[110] p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              onClick={closeLightbox}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div 
              className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center animate-zoomIn"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage.src} 
                alt={selectedImage.label}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl shadow-blue-500/10"
              />
              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-white text-lg sm:text-xl font-orbitron font-bold">{selectedImage.label}</p>
                <div className="w-12 h-1 bg-blue-500 mx-auto mt-2 rounded-full"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;