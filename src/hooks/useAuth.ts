@@ .. @@
 import { useState, useEffect, createContext, useContext } from 'react';
 import { User } from '@supabase/supabase-js';
-import { supabase } from '../lib/supabase';
+import { supabase, isSupabaseConfigured } from '../lib/supabase';
 
 interface AuthContextType {
   user: User | null;
   loading: boolean;
+  isConfigured: boolean;
   signIn: (email: string, password: string) => Promise<{ error: any }>;
   signUp: (email: string, password: string) => Promise<{ error: any }>;
   signOut: () => Promise<void>;
 }
 
 const AuthContext = createContext<AuthContextType | undefined>(undefined);
 
 export const useAuth = (): AuthContextType => {
   const [user, setUser] = useState<User | null>(null);
   const [loading, setLoading] = useState(true);
+  const isConfigured = isSupabaseConfigured();
 
   useEffect(() => {
+    // Se o Supabase não estiver configurado, não tentar autenticar
+    if (!isConfigured || !supabase) {
+      setLoading(false);
+      return;
+    }
+
     // Verificar sessão atual
     supabase.auth.getSession().then(({ data: { session } }) => {
       setUser(session?.user ?? null);
@@ .. @@
     });
 
     return () => {
-      subscription.unsubscribe();
+      if (subscription) {
+        subscription.unsubscribe();
+      }
     };
-  }, []);
+  }, [isConfigured]);
 
   const signIn = async (email: string, password: string) => {
+    if (!supabase) {
+      return { error: { message: 'Supabase não configurado' } };
+    }
+    
     const { error } = await supabase.auth.signInWithPassword({
       email,
       password,
@@ .. @@
   };
 
   const signUp = async (email: string, password: string) => {
+    if (!supabase) {
+      return { error: { message: 'Supabase não configurado' } };
+    }
+    
     const { error } = await supabase.auth.signUp({
       email,
       password,
@@ .. @@
   };
 
   const signOut = async () => {
+    if (!supabase) {
+      return;
+    }
+    
     await supabase.auth.signOut();
   };
 
   return {
     user,
     loading,
+    isConfigured,
     signIn,
     signUp,
     signOut,
@@ .. @@
 
 export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
   const auth = useAuth();
   
   return (
     <AuthContext.Provider value={auth}>
       {children}
     </AuthContext.Provider>
   );
 };
 
 export const useAuthContext = () => {
   const context = useContext(AuthContext);
   if (context === undefined) {
     throw new Error('useAuthContext must be used within an AuthProvider');
   }
   return context;
 };