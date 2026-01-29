
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

export async function uploadImage(file: File, bucket: string = 'public-assets'): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading image to Supabase:', error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
}

export const db = {
  // Auth
  login: async (username: string, password: string) => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();
    if (error) throw new Error("Credenciales inválidas o usuario no encontrado");
    return data;
  },
  
  // Admins
  getAdmins: async () => {
    const { data, error } = await supabase.from('admin_users').select('*').order('username');
    if (error) throw error;
    return data || [];
  },
  upsertAdmin: async (user: any) => {
    const payload = { ...user };
    if (!payload.id) delete payload.id;
    const { data, error } = await supabase.from('admin_users').upsert(payload).select();
    if (error) throw error;
    return data;
  },
  deleteAdmin: async (id: string) => {
    const { error } = await supabase.from('admin_users').delete().eq('id', id);
    if (error) throw error;
  },

  // Products
  getProducts: async (deptSlug?: string) => {
    let query = supabase.from('products').select('*').order('nombre');
    if (deptSlug) query = query.eq('departamento', deptSlug);
    const { data, error } = await supabase.from('products').select('*').order('nombre');
    // Note: Local filtering for security in case deptSlug is provided but not forced by RLS
    if (error) throw error;
    return deptSlug ? (data || []).filter(p => p.departamento === deptSlug) : (data || []);
  },
  upsertProduct: async (product: any) => {
    const payload = { ...product };
    if (!payload.id) delete payload.id;
    const { data, error } = await supabase.from('products').upsert(payload).select();
    if (error) throw error;
    return data;
  },
  deleteProduct: async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  // Departments
  getDepartments: async () => {
    const { data, error } = await supabase.from('departments').select('*').order('nombre');
    if (error) throw error;
    return data || [];
  },
  upsertDepartment: async (dept: any) => {
    const payload = { ...dept };
    if (!payload.id) delete payload.id;
    const { data, error } = await supabase.from('departments').upsert(payload).select();
    if (error) throw error;
    return data;
  },
  deleteDepartment: async (id: string) => {
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) throw error;
  },

  // Config
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

  // Orders
  saveOrder: async (order: any) => {
    const { data, error } = await supabase.from('orders').insert(order).select();
    if (error) throw new Error(error.message);
    return data;
  },
  getOrders: async (deptSlug?: string) => {
    let query = supabase.from('orders').select('*').order('fecha_pedido', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return deptSlug ? (data || []).filter(o => o.departamento === deptSlug) : (data || []);
  }
};
