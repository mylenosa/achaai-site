// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';

import { LandingPage } from './components/LandingPage';
import { Login } from './pages/Login';
import { ResetPassword } from './pages/ResetPassword';

import { PortalLayout } from './pages/PortalLayout';
import { Dashboard } from './pages/Dashboard';
import { EstoquePage } from './pages/EstoquePage';
import { PerfilPage } from './pages/PerfilPage';

import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RequireLoja } from './components/auth/RequireLoja';

function App() {
  return (
    <Routes>
      {/* Público */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/acesso" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {/* Alias antigo */}
      <Route path="/login" element={<Navigate to="/acesso" replace />} />

      {/* Portal (área autenticada) */}
      <Route
        path="/portal"
        element={
          <ProtectedRoute>
            <PortalLayout />
          </ProtectedRoute>
        }
      >
        {/* /portal → /portal/dashboard */}
        <Route index element={<Navigate to="/portal/dashboard" replace />} />

        {/* Dashboard e Estoque exigem loja criada */}
        <Route
          path="dashboard"
          element={
            <RequireLoja>
              <Dashboard />
            </RequireLoja>
          }
        />
        <Route
          path="estoque"
          element={
            <RequireLoja>
              <EstoquePage />
            </RequireLoja>
          }
        />

        {/* Perfil sempre acessível dentro do portal */}
        <Route path="perfil" element={<PerfilPage />} />
      </Route>

      {/* Compat: antigo /dashboard → novo /portal/dashboard */}
      <Route path="/dashboard" element={<Navigate to="/portal/dashboard" replace />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
