@@ .. @@
 import { useState, useEffect } from 'react';
 import { motion } from 'framer-motion';
 import { Save, Store, Phone, Clock, MapPin } from 'lucide-react';
-import { storeService, StoreProfile } from '../../services/StoreService';
+import { storeService, StoreProfile } from '../../services/StoreService';
+import { isSupabaseConfigured } from '../../lib/supabase';
 import { useAuthContext } from '../../hooks/useAuth';
 
 export const StoreProfileForm: React.FC = () => {
@@ .. @@
   const [isLoading, setIsLoading] = useState(false);
   const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
   
-  const { user } = useAuthContext();
+  const { user, isConfigured } = useAuthContext();
 
   useEffect(() => {
-    if (user) {
+    if (user && isConfigured && isSupabaseConfigured()) {
       loadProfile();
     }
-  }, [user]);
+  }, [user, isConfigured]);
 
   const loadProfile = async () => {
     if (!user) return;
@@ .. @@
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     
-    if (!user) return;
+    if (!user || !isConfigured || !isSupabaseConfigured()) {
+      setMessage({ type: 'error', text: 'Supabase não configurado' });
+      return;
+    }
     
     setIsLoading(true);
     setMessage(null);