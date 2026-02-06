
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
  return (window as any).process?.env?.[key] || '';
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const db = {
  // CONFIGURACIÓN GLOBAL
  getConfig: async () => {
    // Nombre de tabla según captura: "configuración del sitio"
    const { data, error } = await supabase.from('configuración del sitio').select('*').eq('id', 1).maybeSingle();
    if (error) console.error("Error config:", error);
    return data;
  },
  updateConfig: async (config: any) => {
    const { data, error } = await supabase.from('configuración del sitio').update(config).eq('id', 1).select();
    if (error) throw error;
    return data[0];
  },

  // PRODUCTOS
  getProducts: async () => {
    // Nombre de tabla según captura: "productos"
    const { data, error } = await supabase.from('productos').select('*').order('nombre');
    if (error) throw error;
    return data || [];
  },
  upsertProduct: async (product: any) => {
    const { data, error } = await supabase.from('productos').upsert(product).select();
    if (error) throw error;
    return data[0];
  },
  deleteProduct: async (id: string) => {
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) throw error;
  },

  // SUCURSALES (DEPARTAMENTOS)
  getDepartments: async () => {
    // Nombre de tabla según captura: "departamentos"
    const { data, error } = await supabase.from('departamentos').select('*').order('nombre');
    if (error) throw error;
    return data || [];
  },
  upsertDepartment: async (dept: any) => {
    const { data, error } = await supabase.from('departamentos').upsert(dept).select();
    if (error) throw error;
    return data[0];
  },

  // PEDIDOS
  getOrders: async () => {
    // Nombre de tabla según captura: "órdenes"
    const { data, error } = await supabase.from('órdenes').select('*').order('fecha_pedido', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  createOrder: async (order: any) => {
    const { data, error } = await supabase.from('órdenes').insert(order).select();
    if (error) throw error;
    return data[0];
  },

  // BOLSA DE TRABAJO (EMPLEOS)
  getJobs: async () => {
    // Nombre de tabla según captura: "trabajos"
    const { data, error } = await supabase.from('trabajos').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  upsertJob: async (job: any) => {
    const { data, error } = await supabase.from('trabajos').upsert(job).select();
    if (error) throw error;
    return data[0];
  },
  deleteJob: async (id: string) => {
    const { error } = await supabase.from('trabajos').delete().eq('id', id);
    if (error) throw error;
  },

  // AUTENTICACIÓN
  login: async (username: string, password: string) => {
    // Usamos los nombres de columna con espacios exactos de tu captura: "nombre de usuario" y "contraseña"
    const { data, error } = await supabase
      .from('usuarios_administradores')
      .select('*')
      .eq('nombre de usuario', username)
      .eq('contraseña', password)
      .maybeSingle();
      
    if (error || !data) throw new Error("Credenciales inválidas");
    return data;
  }
};
