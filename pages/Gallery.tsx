import React, { useState, useEffect } from 'react';

const Gallery: React.FC = () => {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {images.map((img) => {
              let imageSrc;
              if (img.isBackendImage) {
                imageSrc = img.image;
              } else {
                imageSrc = img.currentPath || (img.id <= 11 ? `/images/${img.id}.jpg` : `/images/${img.id}.jpeg`);
              }
              
              return (
                <div 
                  key={img.id} 
                  className="relative rounded-xl overflow-hidden glass border border-white/10 group shadow-lg hover:shadow-blue-500/20 transition-shadow duration-300 aspect-square"
                >
                  <div className="relative w-full h-full overflow-hidden">
                    <img 
                      src={imageSrc}
                      alt={img.label || `Gallery Image ${img.id}`}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                      onError={(e) => handleImageError(img, e)}
                    />
                    <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/20 transition-colors duration-500" />
                  </div>
                  {img.isBackendImage && (
                    <div className="absolute top-2 right-2 bg-blue-600/80 text-white text-[8px] px-1.5 py-0.5 rounded z-10">
                      Admin
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;