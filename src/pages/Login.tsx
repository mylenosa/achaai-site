@@ .. @@
 import { useState } from 'react';
 import { Navigate } from 'react-router-dom';
 import { motion } from 'framer-motion';
-import { Mail, Lock, LogIn, Search } from 'lucide-react';
+import { Mail, Lock, LogIn, Search, AlertTriangle } from 'lucide-react';
 import { useAuthContext } from '../hooks/useAuth';
+import { getSupabaseErrorMessage } from '../lib/supabase';
 import { config } from '../lib/config';
 
 export const Login: React.FC = () => {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState('');
   
-  const { user, signIn } = useAuthContext();
+  const { user, signIn, isConfigured } = useAuthContext();
 
   // Redirecionar se já estiver logado
   if (user) {
@@ .. @@
     return <Navigate to="/dashboard" replace />;
   }
 
+  // Mostrar erro se Supabase não estiver configurado
+  if (!isConfigured) {
+    return (
+      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center px-4">
+        <div className="max-w-md mx-auto">
+          <motion.div
+            initial={{ opacity: 0, y: 20 }}
+            animate={{ opacity: 1, y: 0 }}
+            transition={{ duration: 0.6 }}
+            className="bg-white rounded-2xl shadow-lg p-8 text-center"
+          >
+            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
+              <AlertTriangle className="w-8 h-8 text-red-600" />
+            </div>
+            
+            <h1 className="text-2xl font-bold text-gray-800 mb-4">
+              Configuração Necessária
+            </h1>
+            
+            <p className="text-gray-600 mb-6">
+              {getSupabaseErrorMessage()}
+            </p>
+            
+            <div className="bg-gray-50 rounded-lg p-4 text-left">
+              <p className="text-sm text-gray-700 mb-2">
+                <strong>Para desenvolvedores:</strong>
+              </p>
+              <p className="text-xs text-gray-600">
+                Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env
+              </p>
+            </div>
+            
+            <a
+              href="/"
+              className="inline-flex items-center justify-center mt-6 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-full transition-colors"
+            >
+              Voltar ao Site
+            </a>
+          </motion.div>
+        </div>
+      </div>
+    );
+  }
+
   const handleSubmit = async (e: React.FormEvent) => {