
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string, fallback: string): string => {
  try {
    // Intento de acceso seguro a process.env
    const val = (typeof process !== 'undefined' && process.env) ? process.env[key] : null;
    return val || fallback;
  } catch (e) {
    return fallback;
  }
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://lgdixakavpqlxgltzuei.supabase.co');
const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnZGl4YWthdnBxbHhnbHR6dWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2Mjc4MjIsImV4cCI6MjA4NTIwMzgyMn0.8hPd1HihRFs8ri0CuBaw-sC8ayLSHeB5JFaR-nVWGhQ');

let supabase: any = null;
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (e) {
  console.error("Error al inicializar cliente Supabase:", e);
}

const isUuidString = (v: any) => {
  if (typeof v !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
};

const cleanPayload = (payload: any): any => {
  if (payload === null || payload === undefined) return payload;
  if (typeof payload !== 'object') {
    if (typeof payload === 'string' && payload.trim() === '') return null;
    return payload;
  }
  if (Array.isArray(payload)) {
    return payload.map(cleanPayload).filter((item) => item !== undefined);
  }
  const out: any = {};
  for (const key of Object.keys(payload)) {
    const val = payload[key];
    if (val && typeof val === 'object') {
      out[key] = cleanPayload(val);
      continue;
    }
    if (typeof val === 'string' && val.trim() === '') {
      if (key === 'id' || key.endsWith('_id')) continue;
      out[key] = null;
      continue;
    }
    if ((key === 'id' || key.endsWith('_id') || key.endsWith('Id')) && val != null) {
      if (typeof val === 'string' && !isUuidString(val)) continue;
    }
    out[key] = val;
  }
  return out;
};

export async function uploadImage(file: File, bucket: string = 'public-assets'): Promise<string> {
  if (!supabase) throw new Error("Servidor no disponible momentáneamente.");
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return publicUrl;
}

export const db = {
  login: async (username: string, password: string) => {
    if (!supabase) throw new Error("Error de conexión con el servidor.");

    const { data: functionData, error: functionError } = await supabase.functions.invoke('login-by-username', {
      body: { username, password }
    });

    if (functionError) {
      if (functionError.message?.includes('401')) throw new Error("Credenciales inválidas.");
      throw new Error(`Error de autenticación: ${functionError.message}`);
    }

    if (!functionData || functionData.error) {
       throw new Error(functionData?.error || "Error al iniciar sesión.");
    }

    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (adminError) throw new Error(`Error al recuperar perfil: ${adminError.message}`);
    if (!adminData) throw new Error("Perfil de administrador no encontrado.");

    if (functionData.access_token) {
      await supabase.auth.setSession({
        access_token: functionData.access_token,
        refresh_token: functionData.refresh_token,
      });
    }

    return adminData;
  },
  getAdmins: async () => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('admin_users').select('*').order('username');
    if (error) throw error;
    return data || [];
  },
  upsertAdmin: async (user: any) => {
    if (!supabase) return null;
    const payload = cleanPayload(user);
    const { data, error } = await supabase.from('admin_users').upsert(payload).select();
    if (error) throw error;
    return data;
  },
  deleteAdmin: async (id: string) => {
    if (!supabase) return;
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
    if (!supabase) return null;
    const payload = cleanPayload(product);
    const { data, error } = await supabase.from('products').upsert(payload).select();
    if (error) throw error;
    return data;
  },
  deleteProduct: async (id: string) => {
    if (!supabase) return;
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
    if (!supabase) return null;
    const payload = cleanPayload(dept);
    const { data, error } = await supabase.from('departments').upsert(payload).select();
    if (error) throw error;
    return data;
  },
  deleteDepartment: async (id: string) => {
    if (!supabase) return;
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
    if (!supabase) return null;
    const { data, error } = await supabase.from('site_config').upsert({ id: 1, ...config }).select();
    if (error) throw error;
    return data;
  },
  saveOrder: async (order: any) => {
    if (!supabase) throw new Error("Servicio de pedidos no disponible.");
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
