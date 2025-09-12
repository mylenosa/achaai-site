// src/hooks/useAuth.ts
// Facade: reexporta o hook e o provider do AuthContext.
// Assim, quem importa de "hooks/useAuth" continua funcionando.

export { useAuth as useAuthContext, AuthProvider } from '../contexts/AuthContext';

// (Opcional) reexporta o próprio nome original também:
export { useAuth } from '../contexts/AuthContext';

// (Opcional) se você quiser reexportar tipos:
export type { User } from '@supabase/supabase-js';
