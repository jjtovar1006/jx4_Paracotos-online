export type DepartmentSlug = 'carnes' | 'aves' | 'embutidos' | 'pescados' | 'transporte' | string;

export type UnidadMedida = 'und' | 'kg' | 'gr' | 'caja' | 'paquete' | 'bulto' | 'saco' | 'metro' | 'litro' | 'docena';

export interface Product {
  id?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen_url: string;
  categoria: string;
  departamento: DepartmentSlug;
  unidad: UnidadMedida;
  peso_referencial: boolean;
  disponible: boolean;
  destacado: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Department {
  id?: string;
  nombre: string;
  slug: DepartmentSlug;
  telefono_whatsapp: string;
  activo: boolean;
  color_hex: string;
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
  total_bs: number;
  tasa_aplicada: number;
  metodo: 'delivery' | 'retiro';
  transportista_nombre?: string;
  estado: 'pendiente' | 'confirmado' | 'entregado' | 'cancelado';
  departamento: DepartmentSlug;
  fecha_pedido: string;
}

export interface Config {
  tasa_cambio: number;
  cintillo_promocional: string;
  slogan: string;
  logo_url: string;
  whatsapp_general: string;
}