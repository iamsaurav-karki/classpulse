/**
 * Convert relative upload path to full URL
 * Returns relative path that frontend can use with backend API URL
 */
export function getImageUrl(imagePath: string): string {
  if (!imagePath) return '';
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Return relative path - frontend will prepend backend URL
  // Ensure it starts with /
  return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
}
