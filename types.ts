
export type DepartmentSlug = 'carnes' | 'aves' | 'embutidos' | 'pescados' | string;

export type UnidadMedida = 'und' | 'kg' | 'gr' | 'caja' | 'paquete' | 'bulto' | 'saco' | 'metro' | 'litro' | 'docena';

export type UserRole = 'super' | 'dept_admin';

export interface AdminUser {
  id?: string;
  username: string;
  password?: string;
  role: UserRole;
  dept_slugs?: DepartmentSlug[]; // Cambiado de dept_slug a dept_slugs (arreglo)
}

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

export interface Order {
  id?: string;
  order_id: string;
  telefono_cliente: string;
  nombre_cliente: string;
  productos: CartItem[];
  total: number;
  total_bs: number;
  metodo_pago: string;
  metodo_entrega: 'delivery' | 'retiro';
  tipo_transporte?: 'moto' | 'carro' | 'camion';
  estado: 'pendiente' | 'confirmado' | 'entregado' | 'cancelado';
  departamento: DepartmentSlug;
  fecha_pedido: string;
  direccion: string;
  notas?: string;
}

export interface Config {
  tasa_cambio: number;
  cintillo_promocional: string;
  slogan: string;
  logo_url: string;
  whatsapp_general: string;
}
