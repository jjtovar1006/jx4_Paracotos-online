export type DepartmentSlug = 'carnes' | 'aves' | 'embutidos' | 'pescados' | 'transporte' | string;

export type UnidadMedida = 'und' | 'kg' | 'gr' | 'caja' | 'paquete' | 'bulto' | 'saco' | 'metro' | 'litro' | 'docena';

export interface Product {
  id?: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagen_url?: string;
  departamento: DepartmentSlug;
  disponible: boolean;
  destacado: boolean;
  created_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Department {
  id?: string;
  nombre: string;
  slug: DepartmentSlug;
  telefono_whatsapp?: string;
  created_at?: string;
}

export interface Job {
  id?: string;
  titulo: string;
  descripcion: string;
  requisitos?: string;
  activo: boolean;
  created_at?: string;
}

export interface Order {
  id?: string;
  order_id: string;
  telefono_cliente: string;
  nombre_cliente: string;
  productos: CartItem[];
  total: number;
  total_bs?: number;
  tasa_aplicada?: number;
  metodo?: 'delivery' | 'retiro';
  estado?: 'pendiente' | 'confirmado' | 'entregado' | 'cancelado';
  departamento?: DepartmentSlug;
  created_at?: string;
}

export interface Config {
  tasa_cambio: number;
  cintillo_promocional: string;
  slogan: string;
  logo_url: string;
  whatsapp_general: string;
}