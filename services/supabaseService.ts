
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string, fallback: string): string => {
  try {
    const val = (window as any).process?.env?.[key] || (typeof process !== 'undefined' ? process.env?.[key] : null);
    return (val || fallback).trim();
  } catch (e) {
    return fallback.trim();
  }
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://lgdixakavpqlxgltzuei.supabase.co');
const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnZGl4YWthdnBxbHhnbHR6dWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2Mjc4MjIsImV4cCI6MjA4NTIwMzgyMn0.8hPd1HihRFs8ri0CuBaw-sC8ayLSHeB5JFaR-nVWGhQ');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});

const isUuidString = (v: any) => {
  if (typeof v !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
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
    try {
      const functionUrl = `${supabaseUrl}/functions/v1/login-by-username`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({ username, password })
      }).catch(err => {
        console.error("Fetch Error:", err);
        throw new Error("ERROR DE CONEXIÓN: La función de Supabase no permite peticiones desde este dominio (CORS) o está caída.");
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) throw new Error("La función de login no existe en Supabase.");
        throw new Error(errorData.error || errorData.message || `Error ${response.status}: Credenciales inválidas.`);
      }

      const data = await response.json();

      // Manejo de la respuesta de sesión de Supabase
      const token = data.access_token || data.session?.access_token;
      const refresh = data.refresh_token || data.session?.refresh_token;

      if (!token) {
        throw new Error("La función no devolvió un token de acceso. Revisa la configuración de la Edge Function.");
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: refresh || ''
      });

      if (sessionError) throw new Error("Sesión fallida: " + sessionError.message);

      return await db.getAdminProfile(username);

    } catch (e: any) {
      console.error("Login Error:", e);
      throw e;
    }
  },

  getAdminProfile: async (username: string) => {
    const { data: profile, error: profileError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (profileError) throw new Error(`Error de perfil: ${profileError.message}`);
    if (!profile) {
      await supabase.auth.signOut();
      throw new Error("Usuario no encontrado en la tabla 'admin_users'.");
    }
    return profile;
  },

  getAdmins: async () => {
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
