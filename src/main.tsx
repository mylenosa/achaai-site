// src/main.tsx
import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './lib/supabase'; // força executar e povoar window.supabase
import { router } from './router';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4" />
      <div className="text-gray-600">Carregando...</div>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
    <AuthProvider>
      <Suspense fallback={<LoadingFallback />}>
        <RouterProvider router={router} />
      </Suspense>
    </AuthProvider>
  </HelmetProvider>
);
