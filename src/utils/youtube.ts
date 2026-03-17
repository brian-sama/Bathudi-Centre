/**
 * Robustly converts any YouTube URL format to an embeddable URL.
 * Handles formats like:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export const getYoutubeEmbedUrl = (url: string): string => {
  if (!url) return '';
  
  // Regex to extract the 11-character YouTube video ID
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  
  // Return original if no ID found (might already be an embed URL or invalid)
  return url;
};
