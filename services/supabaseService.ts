
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string, fallback: string): string => {
  try {
    const val = (window as any).process?.env?.[key] || (typeof process !== 'undefined' ? process.env[key] : null);
    return (val || fallback).trim(); // Trim para evitar espacios invisibles
  } catch (e) {
    return fallback.trim();
  }
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://lgdixakavpqlxgltzuei.supabase.co');
const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnZGl4YWthdnBxbHhnbHR6dWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2Mjc4MjIsImV4cCI6MjA4NTIwMzgyMn0.8hPd1HihRFs8ri0CuBaw-sC8ayLSHeB5JFaR-nVWGhQ');

let supabase: any = null;
try {
  // Configuración explícita del cliente
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
} catch (e) {
  console.error("Critical: Failed to init Supabase client", e);
}

const isUuidString = (v: any) => {
  if (typeof v !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
};

const cleanPayload = (payload: any): any => {
  if (!payload || typeof payload !== 'object') return payload;
  if (Array.isArray(payload)) return payload.map(cleanPayload);
  const out: any = {};
  for (const key of Object.keys(payload)) {
    const val = payload[key];
    if (typeof val === 'string' && val.trim() === '') {
      if (key === 'id' || key.endsWith('_id')) continue;
      out[key] = null;
      continue;
    }
    if ((key === 'id' || key.endsWith('_id')) && val != null) {
      if (typeof val === 'string' && !isUuidString(val)) continue;
    }
    out[key] = val;
  }
  return out;
};

export async function uploadImage(file: File, bucket: string = 'public-assets'): Promise<string> {
  if (!supabase) throw new Error("Base de datos no conectada");
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;
  const { error } = await supabase.storage.from(bucket).upload(filePath, file);
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return publicUrl;
}

export const db = {
  login: async (username: string, password: string) => {
    if (!supabase) throw new Error("Error de conexión con el servidor.");

    try {
      // Invocamos la función usando el método estándar del SDK
      // body debe ser un objeto JSON plano
      const { data, error: invokeError } = await supabase.functions.invoke('login-by-username', {
        body: { username, password }
      });

      if (invokeError) {
        // El SDK a veces lanza "Failed to fetch" dentro de invokeError
        console.error("Invoke error details:", invokeError);
        if (invokeError.message?.includes('Failed to fetch')) {
          throw new Error("No se pudo conectar con la Edge Function. Verifica que esté desplegada y acepte CORS.");
        }
        throw new Error(invokeError.message || "Error al invocar la función de autenticación.");
      }

      if (data?.error) {
        throw new Error(data.error === 'Invalid credentials' ? "Usuario o clave incorrectos." : data.error);
      }

      // Establecemos la sesión para que el cliente Supabase esté autenticado
      if (data?.access_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token
        });
        if (sessionError) console.error("Session set error:", sessionError);
      }

      // Recuperamos el perfil extendido de la tabla admin_users
      const { data: profile, error: profileError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (profileError) {
        throw new Error(`Sesión válida, pero error al cargar perfil: ${profileError.message}`);
      }

      if (!profile) {
        await supabase.auth.signOut();
        throw new Error("Este usuario no tiene permisos de administrador.");
      }

      return profile;

    } catch (e: any) {
      console.error("Login attempt failed:", e);
      // Captura de errores de red puros
      if (e.message?.includes('Failed to fetch') || e.name === 'TypeError') {
        throw new Error("Error de red: No se pudo contactar con Supabase. Revisa tu conexión o el estado de las Edge Functions.");
      }
      throw e;
    }
  },
  getAdmins: async () => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('admin_users').select('*').order('username');
    if (error) throw error;
    return data || [];
  },
  upsertAdmin: async (user: any) => {
    const payload = cleanPayload(user);
    const { data, error } = await supabase.from('admin_users').upsert(payload).select();
    if (error) throw error;
    return data;
  },
  deleteAdmin: async (id: string) => {
    const { error } = await supabase.from('admin_users').delete().eq('id', id);
    if (error) throw error;
  },
  getProducts: async (deptSlug?: string) => {
    if (!supabase) return [];
    let query = supabase.from('products').select('*').order('nombre');
    if (deptSlug) query = query.eq('departamento', deptSlug);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },
  upsertProduct: async (product: any) => {
    const payload = cleanPayload(product);
    const { data, error } = await supabase.from('products').upsert(payload).select();
    if (error) throw error;
    return data;
  },
  deleteProduct: async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },
  getDepartments: async () => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('departments').select('*').order('nombre');
    if (error) throw error;
    return data || [];
  },
  upsertDepartment: async (dept: any) => {
    const payload = cleanPayload(dept);
    const { data, error } = await supabase.from('departments').upsert(payload).select();
    if (error) throw error;
    return data;
  },
  deleteDepartment: async (id: string) => {
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) throw error;
  },
  getConfig: async () => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('site_config').select('*').single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
  updateConfig: async (config: any) => {
    const { data, error } = await supabase.from('site_config').upsert({ id: 1, ...config }).select();
    if (error) throw error;
    return data;
  },
  saveOrder: async (order: any) => {
    const payload = cleanPayload(order);
    const { data, error } = await supabase.from('orders').insert(payload).select();
    if (error) throw new Error(error.message);
    return data;
  },
  getOrders: async (deptSlugs?: string | string[]) => {
    if (!supabase) return [];
    let query = supabase.from('orders').select('*').order('fecha_pedido', { ascending: false });
    if (deptSlugs) {
      if (Array.isArray(deptSlugs)) {
        if (deptSlugs.length > 0) query = query.in('departamento', deptSlugs);
      } else {
        query = query.eq('departamento', deptSlugs);
      }
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },
  getLatestOrderByPhone: async (phone: string) => {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('orders')
      .select('nombre_cliente, direccion')
      .eq('telefono_cliente', phone)
      .order('fecha_pedido', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return null;
    return data;
  }
};

export { supabase };
