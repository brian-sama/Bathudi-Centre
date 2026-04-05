/**
 * Utility to handle various video URL types, including YouTube and Google Drive.
 */

/**
 * Extracts Google Drive File ID from various Drive URL formats.
 */
export const getGoogleDriveId = (url: string): string | null => {
  if (!url) return null;
  
  // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch) return fileDMatch[1];
  
  // Format: https://drive.google.com/open?id=FILE_ID
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];
  
  // Format: https://drive.google.com/uc?id=FILE_ID
  const ucMatch = url.match(/\/uc\?id=([a-zA-Z0-9_-]+)/);
  if (ucMatch) return ucMatch[1];

  return null;
};

/**
 * Returns a link suitable for an iframe (preview mode).
 */
export const getGoogleDriveEmbedUrl = (url: string): string | null => {
  const fileId = getGoogleDriveId(url);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  return null;
};

/**
 * Returns a link suitable for a <video> tag (direct download).
 * Note: Google Drive direct links sometimes have quota limits or require auth, 
 * so embed (iframe) is often more reliable for public files.
 */
export const getGoogleDriveDirectUrl = (url: string): string | null => {
  const fileId = getGoogleDriveId(url);
  if (fileId) {
    // Note: use uc?export=view (less restrictive than download for some browsers)
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  return null;
};

/**
 * Comprehensive helper to get an embeddable URL for any supported source.
 */
export const getEmbedUrl = (url: string): string => {
  if (!url) return '';

  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    // We already have a youtube util, but let's keep logic central if needed
    // For now, assuming youTube logic is outside or we can import it.
    return url; 
  }

  // Google Drive
  const driveEmbed = getGoogleDriveEmbedUrl(url);
  if (driveEmbed) return driveEmbed;

  return url;
};

export const isGoogleDriveUrl = (url: string): boolean => {
  return !!getGoogleDriveId(url);
};
