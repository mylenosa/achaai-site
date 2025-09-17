    // src/router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { LandingPage } from './components/LandingPage';
import { Login } from './pages/Login';
import { ResetPassword } from './pages/ResetPassword';
import { PortalLayout } from './pages/PortalLayout';
import { Dashboard } from './pages/Dashboard';
import { EstoquePage } from './pages/EstoquePage';
import { PerfilPage } from './pages/PerfilPage';
import { NotFound } from './components/NotFound';

import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RequireLoja } from './components/auth/RequireLoja';

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/acesso', element: <Login /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/login', element: <Navigate to="/acesso" replace /> },

  {
    path: '/portal',
    element: (
      <ProtectedRoute>
        <PortalLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/portal/dashboard" replace /> },

      {
        path: 'dashboard',
        element: (
          <RequireLoja>
            <Dashboard />
          </RequireLoja>
        ),
      },
      {
        path: 'estoque',
        element: (
          <RequireLoja>
            <EstoquePage />
          </RequireLoja>
        ),
      },
      { path: 'perfil', element: <PerfilPage /> },
    ],
  },

  { path: '/dashboard', element: <Navigate to="/portal/dashboard" replace /> },
  { path: '*', element: <NotFound /> },
]);
