
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const db = {
  // CONFIGURACIÓN GLOBAL
  getConfig: async () => {
    const { data, error } = await supabase.from('site_config').select('*').eq('id', 1).maybeSingle();
    if (error) console.error("Error config:", error);
    return data;
  },
  updateConfig: async (config: any) => {
    const { data, error } = await supabase.from('site_config').update(config).eq('id', 1).select();
    if (error) throw error;
    return data[0];
  },

  // PRODUCTOS
  getProducts: async () => {
    const { data, error } = await supabase.from('products').select('*').order('nombre');
    if (error) throw error;
    return data || [];
  },
  upsertProduct: async (product: any) => {
    const { data, error } = await supabase.from('products').upsert(product).select();
    if (error) throw error;
    return data[0];
  },
  deleteProduct: async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  // SUCURSALES (DEPARTAMENTOS)
  getDepartments: async () => {
    const { data, error } = await supabase.from('departments').select('*').order('nombre');
    if (error) throw error;
    return data || [];
  },
  upsertDepartment: async (dept: any) => {
    const { data, error } = await supabase.from('departments').upsert(dept).select();
    if (error) throw error;
    return data[0];
  },

  // PEDIDOS
  getOrders: async () => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  createOrder: async (order: any) => {
    const { data, error } = await supabase.from('orders').insert(order).select();
    if (error) throw error;
    return data[0];
  },

  // BOLSA DE TRABAJO (EMPLEOS)
  getJobs: async () => {
    const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  upsertJob: async (job: any) => {
    const { data, error } = await supabase.from('jobs').upsert(job).select();
    if (error) throw error;
    return data[0];
  },
  deleteJob: async (id: string) => {
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if (error) throw error;
  },

  // AUTENTICACIÓN
  login: async (username: string, password: string) => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .maybeSingle();

    if (error || !data) throw new Error("Credenciales inválidas");
    return data;
  }
};
