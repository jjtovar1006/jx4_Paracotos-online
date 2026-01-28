
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
  getProducts: async () => {
    const { data, error } = await supabase.from('products').select('*').order('nombre');
    if (error) {
      console.warn("Error en tabla 'products':", error.message);
      throw error;
    }
    return data || [];
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
  getDepartments: async () => {
    const { data, error } = await supabase.from('departments').select('*').order('nombre');
    if (error) {
      console.warn("Error en tabla 'departments':", error.message);
      throw error;
    }
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
  getConfig: async () => {
    try {
      const { data, error } = await supabase.from('site_config').select('*').single();
      if (error) {
        if (error.code === 'PGRST205') console.error("La tabla 'site_config' NO existe en tu Supabase.");
        if (error.code !== 'PGRST116') throw error;
      }
      return data;
    } catch (e) {
      return null;
    }
  },
  updateConfig: async (config: any) => {
    const { data, error } = await supabase.from('site_config').upsert({ id: 1, ...config }).select();
    if (error) throw error;
    return data;
  },
  saveOrder: async (order: any) => {
    const { data, error } = await supabase.from('orders').insert(order).select();
    if (error) {
      if (error.code === 'PGRST205') alert("Error Crítico: La tabla 'orders' no existe en Supabase. Ejecuta el SQL de creación.");
      throw error;
    }
    return data;
  },
  getOrders: async () => {
    const { data, error } = await supabase.from('orders').select('*').order('fecha_pedido', { ascending: false });
    if (error) throw error;
    return data || [];
  }
};
