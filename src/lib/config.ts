/**
 * Global configuration for the application.
 * In a mobile (Capacitor) environment, relative URLs like "/api" will fail 
 * because the app is served from localhost internally.
 * We must use an absolute URL for production.
 */

// If you are using Vite, you can set VITE_API_URL in your .env file
// For example: VITE_API_URL=https://your-production-url.com
export const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

// Helper to format API URLs
export const getApiUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // If we are on web and not in a Capacitor environment, relative paths are fine
  // But for safety and consistency, we can always use the absolute URL if defined
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}${cleanPath}`;
  }
  
  return cleanPath;
};
