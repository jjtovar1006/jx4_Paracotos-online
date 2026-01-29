
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string, fallback: string): string => {
  try {
    const win = window as any;
    return win.process?.env?.[key] || fallback;
  } catch (e) {
    return fallback;
  }
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://lgdixakavpqlxgltzuei.supabase.co');
const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnZGl4YWthdnBxbHhnbHR6dWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2Mjc4MjIsImV4cCI6MjA4NTIwMzgyMn0.8hPd1HihRFs8ri0CuBaw-sC8ayLSHeB5JFaR-nVWGhQ');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const isUuidString = (v: any) => {
  if (typeof v !== 'string') return false;
  // UUID v4/v1 general pattern (8-4-4-4-12 hex)
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
};

const cleanPayload = (payload: any): any => {
  if (payload === null || payload === undefined) return payload;

  // Primitivos
  if (typeof payload !== 'object') {
    if (typeof payload === 'string' && payload.trim() === '') return null; // convert empty string to null
    return payload;
  }

  // Arrays
  if (Array.isArray(payload)) {
    return payload
      .map(cleanPayload)
      .filter((item) => item !== undefined); // remove undefined entries
  }

  // Objetos
  const out: any = {};
  for (const key of Object.keys(payload)) {
    const val = payload[key];

    // Recurse primero para objetos/arrays
    if (val && typeof val === 'object') {
      const cleaned = cleanPayload(val);
      // Si el objeto/array resultante es un objeto vacío o array vacío, mantenerlo (puedes ajustar)
      out[key] = cleaned;
      continue;
    }

    // Manejo para strings vacíos
    if (typeof val === 'string' && val.trim() === '') {
      // Si la key es 'id' o termina en '_id' -> eliminar para permitir que la DB genere el UUID
      if (key === 'id' || key.endsWith('_id')) {
        // omitimos la propiedad (no la añadimos a out)
        continue;
      }
      // Para otros campos, convertir "" -> null (más seguro que enviar "")
      out[key] = null;
      continue;
    }

    // Manejo: si la key parece un uuid y el valor no es uuid válido, eliminarla
    if ((key === 'id' || key.endsWith('_id') || key.endsWith('Id')) && val != null) {
      // si es string no válido como uuid, eliminar para evitar error de cast
      if (typeof val === 'string' && !isUuidString(val)) {
        continue;
      }
    }

    out[key] = val;
  }

  return out;
};

export async function uploadImage(file: File, bucket: string = 'public-assets'): Promise<string> {
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
    // Verificar si hay usuarios en la tabla para guiar al desarrollador
    const { count, error: countError } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      if (countError.message.includes('column "dept_slugs" does not exist')) {
        throw new Error("Falta la columna 'dept_slugs'. Ejecuta el SQL de migración en el SQL Editor de Supabase.");
      }
      throw new Error(`Error de conexión con la base de datos: ${countError.message}`);
    }

    if (count === 0) {
      throw new Error("No hay administradores registrados. Debes crear el primero en el SQL Editor de Supabase ejecutando el script de INSERT.");
    }

    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Usuario o clave incorrectos.");
    
    return data;
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
