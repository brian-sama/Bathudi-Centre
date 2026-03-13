import React, { useEffect, useState } from 'react';

// FIXED: Use environment variable for API base URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

type Tab = 'news' | 'gallery' | 'video';

const AdminCMS: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('news');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({
    text: '',
    type: '',
  });
  const [serverConnected, setServerConnected] = useState<boolean>(true);

  // ---------------- STATE ----------------
  const [newsPosts, setNewsPosts] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [directorMessage, setDirectorMessage] = useState<any>(null);

  const [newPost, setNewPost] = useState({
    title: '',
    preview_text: '',
    content: '',
  });
  const [selectedNewsImage, setSelectedNewsImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [quote, setQuote] = useState('');
  const [useYouTube, setUseYouTube] = useState(true);

  // ---------------- FETCH DATA ----------------
  const fetchData = async () => {
    try {
      console.log('Fetching from:', API_BASE);
      
      const [news, gallery, director] = await Promise.all([
        fetch(`${API_BASE}/news-posts/`),
        fetch(`${API_BASE}/gallery/`),
        fetch(`${API_BASE}/director-message/active/`),
      ]);

      console.log('News response status:', news.status);
      console.log('Gallery response status:', gallery.status);
      console.log('Director response status:', director.status);

      // Set server connection status
      setServerConnected(news.ok || gallery.ok || director.ok);

      // Check if response is JSON
      if (news.ok) {
        const newsData = await news.json();
        setNewsPosts(newsData);
      } else {
        const text = await news.text();
        console.error('News response not OK:', news.status, text.substring(0, 200));
      }
      
      if (gallery.ok) {
        const galleryData = await gallery.json();
        setGalleryImages(galleryData);
      }

      if (director.ok) {
        const data = await director.json();
        if (data && Object.keys(data).length > 0) {
          setDirectorMessage(data);
          setQuote(data?.quote || '');
          setVideoUrl(data?.video_url || '');
          setUseYouTube(!data?.video_file);
        } else {
          setQuote('');
          setVideoUrl('');
          setDirectorMessage(null);
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setServerConnected(false);
      showStatus('Failed to fetch data. Check if server is running.', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage({ text: '', type: '' }), 4000);
  };

  // ---------------- NEWS IMAGE HANDLING ----------------
  const handleNewsImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedNewsImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearNewsImage = () => {
    setSelectedNewsImage(null);
    setImagePreview('');
  };

  // ---------------- NEWS ----------------
  const handleSaveNewsPost = async () => {
    if (!newPost.title || !newPost.content) {
      showStatus('Please fill in all required fields', 'error');
      return;
    }

    setIsUpdating(true);
    try {
      const formData = new FormData();
      
      // Add text fields
      formData.append('title', newPost.title);
      formData.append('preview_text', newPost.preview_text);
      formData.append('content', newPost.content);
      formData.append('is_published', 'true');
      
      // Add image if selected
      if (selectedNewsImage) {
        formData.append('image', selectedNewsImage);
      }

      console.log('Posting to:', `${API_BASE}/news-posts/`);
      
      const res = await fetch(`${API_BASE}/news-posts/`, {
        method: 'POST',
        body: formData,
      });

      console.log('News post response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Server error response:', errorText.substring(0, 500));
        throw new Error(`Server error: ${res.status}`);
      }

      const result = await res.json();
      console.log('News POST success:', result);
      
      // Reset form
      setNewPost({ title: '', preview_text: '', content: '' });
      setSelectedNewsImage(null);
      setImagePreview('');
      
      showStatus('News published successfully!', 'success');
      fetchData();
    } catch (error: any) {
      console.error('News POST failed:', error);
      showStatus('Server error: ' + error.message, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteNewsPost = async (id: number) => {
    if (!confirm('Are you sure you want to delete this news post?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/news-posts/${id}/`, { 
        method: 'DELETE' 
      });
      
      if (!res.ok) {
        const text = await res.text();
        console.error('Delete error:', text);
        throw new Error('Delete failed');
      }
      
      showStatus('News post deleted', 'success');
      fetchData();
    } catch (error) {
      showStatus('Failed to delete news post', 'error');
    }
  };

  // ---------------- GALLERY ----------------
  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const uploadGalleryImages = async () => {
    if (!selectedFiles.length) {
      showStatus('Please select images to upload', 'error');
      return;
    }

    setIsUpdating(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const file of selectedFiles) {
        const fd = new FormData();
        fd.append('image', file);
        fd.append('title', file.name.replace(/\.[^/.]+$/, ""));
        fd.append('description', `Uploaded on ${new Date().toLocaleDateString()}`);
        fd.append('is_active', 'true');
        
        console.log('Uploading gallery image:', file.name);
        
        const res = await fetch(`${API_BASE}/gallery/`, {
          method: 'POST',
          body: fd,
        });
        
        if (res.ok) {
          successCount++;
        } else {
          errorCount++;
          const errorText = await res.text();
          console.error('Gallery upload error for', file.name, ':', errorText);
        }
      }

      if (successCount > 0) {
        showStatus(`Uploaded ${successCount} images successfully!${errorCount > 0 ? ` (${errorCount} failed)` : ''}`, 'success');
      } else {
        showStatus('Failed to upload images', 'error');
      }
      
      setSelectedFiles([]);
      fetchData();
    } catch (error) {
      console.error('Gallery upload error:', error);
      showStatus('Failed to upload images', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteGallery = async (id: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/gallery/${id}/`, { 
        method: 'DELETE' 
      });
      
      if (!res.ok) throw new Error('Delete failed');
      
      showStatus('Image deleted', 'success');
      fetchData();
    } catch (error) {
      showStatus('Failed to delete image', 'error');
    }
  };

  // ---------------- DIRECTOR MESSAGE ----------------
  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedVideoFile(e.target.files[0]);
      setVideoUrl(''); // Clear YouTube URL when file is selected
      setUseYouTube(false);
    }
  };

  // Handle delete current video
  const handleDeleteVideo = async () => {
    if (!directorMessage?.id) return;
    
    if (!confirm('Are you sure you want to delete the current video? This action cannot be undone.')) return;
    
    setIsUpdating(true);
    try {
      // Update director message to remove video
      const formData = new FormData();
      formData.append('quote', quote);
      formData.append('is_active', 'true');
      formData.append('video_url', ''); // Clear video URL
      // No video_file means video is removed

      const res = await fetch(`${API_BASE}/director-message/${directorMessage.id}/`, {
        method: 'PATCH',
        body: formData,
      });

      if (res.ok) {
        showStatus('Video deleted successfully!', 'success');
        setVideoUrl('');
        setSelectedVideoFile(null);
        fetchData();
      } else {
        throw new Error('Failed to delete video');
      }
    } catch (error) {
      showStatus('Failed to delete video', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateDirectorMessage = async () => {
    if (!quote) {
      showStatus('Please add a quote', 'error');
      return;
    }

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append('quote', quote);
      formData.append('is_active', 'true');

      if (!useYouTube && selectedVideoFile) {
        formData.append('video_file', selectedVideoFile);
      } else if (useYouTube && videoUrl) {
        formData.append('video_url', videoUrl);
      }

      let method = 'POST';
      let url = `${API_BASE}/director-message/`;

      // If we have an existing message, update it
      if (directorMessage?.id) {
        method = 'PATCH';
        url = `${API_BASE}/director-message/${directorMessage.id}/`;
      }

      console.log('Sending director message to:', url);
      
      // Add timeout for large files (5 minutes)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes

      const res = await fetch(url, {
        method: method,
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('Director message response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Server error response:', errorText.substring(0, 500));
        throw new Error(`Server error: ${res.status}`);
      }

      const result = await res.json();
      console.log('Director message success:', result);

      // Clear video file selection after successful upload
      if (selectedVideoFile) {
        setSelectedVideoFile(null);
      }

      showStatus("Director's message updated successfully!", 'success');
      fetchData();
    } catch (error: any) {
      console.error('Director message error:', error);
      if (error.name === 'AbortError') {
        showStatus('Upload timeout: Video file may be too large (max 100MB recommended)', 'error');
      } else {
        showStatus('Server error: ' + error.message, 'error');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Website Content Management</h1>
            <p className="text-gray-400">Admin Panel - Manage News, Gallery, and Director's Video</p>
          </div>
          
          {/* SIMPLIFIED Server Status - Just green/red light with Connected/Disconnected */}
          <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg border border-white/5">
            <span className={`h-3 w-3 rounded-full ${serverConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-sm text-gray-300">{serverConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage.text && (
          <div className={`mb-6 p-4 rounded-lg ${statusMessage.type === 'success' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'}`}>
            {statusMessage.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 border-b border-gray-700">
          {(['news', 'gallery', 'video'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium rounded-t-lg transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tab === 'video' ? 'DIRECTOR VIDEO' : tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isUpdating && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-400">Processing...</p>
          </div>
        )}

        {/* NEWS TAB */}
        {activeTab === 'news' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create New Post */}
            <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6 text-white">Create New Post</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Title *</label>
                  <input
                    type="text"
                    placeholder="Enter post title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Preview Text</label>
                  <textarea
                    placeholder="Brief preview text (optional)"
                    value={newPost.preview_text}
                    onChange={(e) => setNewPost({ ...newPost, preview_text: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 min-h-[100px]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Content *</label>
                  <textarea
                    placeholder="Write your content here..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 min-h-[200px]"
                  />
                </div>
                
                {/* Image Upload Section - FIXED: Added .jpeg support */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">News Image (Optional)</label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleNewsImageSelect}
                      className="hidden"
                      id="news-image-upload"
                    />
                    <label htmlFor="news-image-upload" className="cursor-pointer block">
                      {imagePreview ? (
                        <div className="relative">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="mx-auto max-h-48 rounded-lg mb-4"
                          />
                          <button
                            type="button"
                            onClick={clearNewsImage}
                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
                          >
                            ✕
                          </button>
                          <p className="text-sm text-gray-400">Click to change image</p>
                        </div>
                      ) : (
                        <>
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-300 mb-2">Click to upload an image for this news</p>
                          <p className="text-sm text-gray-400">Supports JPG, JPEG, PNG, WebP</p>
                          <button
                            type="button"
                            onClick={() => document.getElementById('news-image-upload')?.click()}
                            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                          >
                            Choose Image
                          </button>
                        </>
                      )}
                    </label>
                  </div>
                </div>
                
                <button
                  onClick={handleSaveNewsPost}
                  disabled={isUpdating}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>
            </div>

            {/* Existing Posts */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6 text-white">Existing Posts ({newsPosts.length})</h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {newsPosts.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No posts yet</p>
                ) : (
                  newsPosts.map((post) => (
                    <div key={post.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      {post.image_url && (
                        <div className="mb-3">
                          <img 
                            src={post.image_url} 
                            alt={post.title}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <h3 className="font-semibold text-white mb-2 truncate">{post.title}</h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{post.preview_text || post.content.substring(0, 100)}...</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleDeleteNewsPost(post.id)}
                          className="text-red-400 hover:text-red-300 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* GALLERY TAB - FIXED: Added .jpeg support */}
        {activeTab === 'gallery' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Images */}
            <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6 text-white">Upload Images</h2>
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleGallerySelect}
                    className="hidden"
                    id="gallery-upload"
                  />
                  <label
                    htmlFor="gallery-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-300 mb-2">Click to select images</p>
                    <p className="text-sm text-gray-400">Supports JPG, JPEG, PNG, WebP, GIF</p>
                  </label>
                  {selectedFiles.length > 0 && (
                    <div className="mt-6">
                      <p className="text-gray-300 mb-2">
                        Selected {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
                      </p>
                      <ul className="text-sm text-gray-400 space-y-1">
                        {selectedFiles.slice(0, 3).map((file, idx) => (
                          <li key={idx} className="truncate">{file.name}</li>
                        ))}
                        {selectedFiles.length > 3 && (
                          <li>...and {selectedFiles.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
                <button
                  onClick={uploadGalleryImages}
                  disabled={isUpdating || selectedFiles.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Uploading...' : `Upload ${selectedFiles.length} Image${selectedFiles.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6 text-white">
                Gallery Images ({galleryImages.length})
              </h2>
              <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                {galleryImages.length === 0 ? (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-gray-400">No images uploaded yet</p>
                  </div>
                ) : (
                  galleryImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.image_url}
                        alt="Gallery"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-opacity rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => handleDeleteGallery(img.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIDEO TAB */}
        {activeTab === 'video' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-8 text-white">Director's Message</h2>
              
              {/* Current Video Display */}
              {directorMessage && (directorMessage.video_url || directorMessage.video_file) && (
                <div className="mb-8 p-6 bg-gray-900 rounded-xl border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Current Video
                  </h3>
                  
                  <div className="aspect-video rounded-lg overflow-hidden mb-4">
                    {directorMessage.video_file ? (
                      <video controls className="w-full h-full">
                        <source src={directorMessage.video_file} type="video/mp4" />
                      </video>
                    ) : directorMessage.video_url ? (
                      <iframe 
                        src={directorMessage.video_url.replace('watch?v=', 'embed/')} 
                        className="w-full h-full"
                        allowFullScreen
                        title="Current Director Video"
                      ></iframe>
                    ) : null}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleDeleteVideo}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-bold border border-red-500/20 transition-all flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Current Video
                    </button>
                  </div>
                </div>
              )}
              
              <div className="space-y-8">
                {/* Quote Section */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-300">Quote *</label>
                  <textarea
                    placeholder="Enter director's quote or message..."
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 min-h-[150px]"
                    required
                  />
                </div>

                {/* Video Section */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-300">Add New Video (Optional)</label>
                    <div className="flex space-x-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="video-url"
                          checked={useYouTube}
                          onChange={() => {
                            setUseYouTube(true);
                            setSelectedVideoFile(null);
                          }}
                          className="text-blue-600"
                        />
                        <label htmlFor="video-url" className="text-gray-300">YouTube URL</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="video-file"
                          checked={!useYouTube}
                          onChange={() => setUseYouTube(false)}
                          className="text-blue-600"
                        />
                        <label htmlFor="video-file" className="text-gray-300">Upload New Video</label>
                      </div>
                    </div>

                    {!useYouTube ? (
                      <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoFileSelect}
                          className="hidden"
                          id="video-upload"
                        />
                        <label htmlFor="video-upload" className="cursor-pointer block">
                          {selectedVideoFile ? (
                            <>
                              <div className="flex items-center justify-center mb-2">
                                <svg className="w-8 h-8 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <p className="text-gray-300 mb-1">{selectedVideoFile.name}</p>
                              <p className="text-sm text-gray-400">Size: {(selectedVideoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                              <p className="text-sm text-red-400 mt-2">Max recommended: 100MB. Larger files may time out.</p>
                              <p className="text-sm text-blue-400 mt-2">Click to change video</p>
                            </>
                          ) : (
                            <>
                              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              <p className="text-gray-300 mb-2">Click to select a video file</p>
                              <p className="text-sm text-gray-400">Supports MP4, WebM, MOV (Max 100MB)</p>
                              <button
                                type="button"
                                onClick={() => document.getElementById('video-upload')?.click()}
                                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                              >
                                Choose Video File
                              </button>
                            </>
                          )}
                        </label>
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Enter YouTube video URL (e.g., https://youtube.com/watch?v=...)"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                      />
                    )}
                  </div>

                  <button
                    onClick={handleUpdateDirectorMessage}
                    disabled={isUpdating || !quote}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Saving...' : 'Save Director Message'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCMS;