import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './lib/LanguageContext.tsx';
import { ToastProvider } from './components/ToastProvider.tsx';

// Global Fetch Interceptor for Capacitor/Mobile Compatibility
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  if (typeof input === 'string' && input.startsWith('/api')) {
    const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
    // Remove double slashes if any
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanInput = input.startsWith('/') ? input : `/${input}`;
    return originalFetch(`${cleanBaseUrl}${cleanInput}`, init);
  }
  return originalFetch(input, init);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </LanguageProvider>
  </StrictMode>,
);
