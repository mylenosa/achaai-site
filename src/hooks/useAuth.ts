// Single Responsibility: Hook para acessar contexto de autenticação
// Interface Segregation: Re-exporta apenas o que é necessário
export { useAuth as useAuthContext } from '../contexts/AuthContext';