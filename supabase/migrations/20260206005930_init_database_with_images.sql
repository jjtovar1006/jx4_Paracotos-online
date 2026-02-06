/*
  # Inicialización Completa de JX4 Paracotos

  1. New Tables
    - `products` - Catálogo de productos con URLs de imagen
    - `orders` - Pedidos realizados
    - `site_config` - Configuración global
    - `departments` - Departamentos/sucursales
    - `jobs` - Bolsa de trabajo
    - `admin_users` - Usuarios administrador

  2. Security
    - RLS deshabilitado para desarrollo inicial
    - Tablas públicas para lectura

  3. Sample Data
    - Productos con imágenes válidas de Pexels
    - Configuración inicial
    - Departamentos de ejemplo
*/

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  departamento TEXT NOT NULL,
  imagen_url TEXT,
  disponible BOOLEAN DEFAULT true,
  destacado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  nombre_cliente TEXT NOT NULL,
  telefono_cliente TEXT NOT NULL,
  productos JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  total_bs DECIMAL(15, 2),
  tasa_aplicada DECIMAL(10, 4),
  metodo TEXT DEFAULT 'retiro',
  departamento TEXT,
  estado TEXT DEFAULT 'pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Site Config Table
CREATE TABLE IF NOT EXISTS site_config (
  id BIGINT PRIMARY KEY DEFAULT 1,
  tasa_cambio DECIMAL(10, 4) DEFAULT 37.5,
  whatsapp_general TEXT DEFAULT '584121234567',
  cintillo_promocional TEXT DEFAULT '🎉 Bienvenido a JX4 Paracotos',
  logo_url TEXT,
  slogan TEXT DEFAULT 'Tu mercado de confianza',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  telefono_whatsapp TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  requisitos TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Disable RLS for development
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Insert initial config
INSERT INTO site_config (tasa_cambio, whatsapp_general, cintillo_promocional, slogan)
VALUES (37.5, '584121234567', '🎉 Bienvenido a JX4 Paracotos - Tu mercado de confianza', 'Carnes Premium • Frutas • Verduras • Servicios')
ON CONFLICT (id) DO UPDATE SET updated_at = now();

-- Insert departments
INSERT INTO departments (nombre, slug, telefono_whatsapp)
VALUES
  ('Carnes', 'carnes', '584121234567'),
  ('Frutas', 'frutas', '584121234567'),
  ('Verduras', 'verduras', '584121234567'),
  ('Transporte', 'transporte', '584121234567')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products with valid Pexels image URLs
INSERT INTO products (nombre, descripcion, precio, departamento, imagen_url, disponible, destacado)
VALUES
  ('Carne Molida Premium', 'Carne molida 100% pura, fresca y de alta calidad', 8.99, 'carnes', 'https://images.pexels.com/photos/5737393/pexels-photo-5737393.jpeg?auto=compress&cs=tinysrgb&w=600', true, true),
  ('Filete de Res', 'Filete premium cortado a mano, ideal para asados', 12.99, 'carnes', 'https://images.pexels.com/photos/5632646/pexels-photo-5632646.jpeg?auto=compress&cs=tinysrgb&w=600', true, true),
  ('Pechuga de Pollo', 'Pollo fresco sin piel, ideal para dietas', 6.99, 'carnes', 'https://images.pexels.com/photos/5632621/pexels-photo-5632621.jpeg?auto=compress&cs=tinysrgb&w=600', true, false),
  ('Manzanas Rojas', 'Manzanas frescas importadas, crujientes y dulces', 4.99, 'frutas', 'https://images.pexels.com/photos/87651/red-apples-fresh-fruit-farmers-market-87651.jpeg?auto=compress&cs=tinysrgb&w=600', true, false),
  ('Plátanos Premium', 'Plátanos maduros seleccionados, nutritivos', 3.50, 'frutas', 'https://images.pexels.com/photos/5605540/pexels-photo-5605540.jpeg?auto=compress&cs=tinysrgb&w=600', true, false),
  ('Naranjas Frescas', 'Naranjas recién cosechadas, jugosas', 5.99, 'frutas', 'https://images.pexels.com/photos/2639255/pexels-photo-2639255.jpeg?auto=compress&cs=tinysrgb&w=600', true, true),
  ('Lechuga Fresca', 'Lechuga verde de hoja tierna y fresca', 2.99, 'verduras', 'https://images.pexels.com/photos/5625704/pexels-photo-5625704.jpeg?auto=compress&cs=tinysrgb&w=600', true, false),
  ('Tomates Rojos', 'Tomates maduros, perfectos para salsas', 4.50, 'verduras', 'https://images.pexels.com/photos/2655771/pexels-photo-2655771.jpeg?auto=compress&cs=tinysrgb&w=600', true, false),
  ('Zanahorias', 'Zanahorias frescas y crocantes, ricas en vitamina A', 3.99, 'verduras', 'https://images.pexels.com/photos/5625706/pexels-photo-5625706.jpeg?auto=compress&cs=tinysrgb&w=600', true, false),
  ('Cebolla Amarilla', 'Cebolla de calidad, gran sabor y dulzura', 2.50, 'verduras', 'https://images.pexels.com/photos/5625707/pexels-photo-5625707.jpeg?auto=compress&cs=tinysrgb&w=600', true, false)
ON CONFLICT DO NOTHING;

-- Insert admin user (username: admin, password: admin123)
INSERT INTO admin_users (username, password)
VALUES ('admin', 'admin123')
ON CONFLICT (username) DO NOTHING;

-- Insert sample jobs
INSERT INTO jobs (titulo, descripcion, requisitos, activo)
VALUES
  ('Vendedor Mostrador', 'Buscamos vendedor con experiencia en atención al cliente y ventas de productos frescos', 'Experiencia mínima 1 año, disponibilidad completa, amable', true),
  ('Repartidor', 'Conductor responsable para entregas a domicilio en la zona', 'Licencia de conducir vigente, vehículo propio, disponibilidad', true)
ON CONFLICT DO NOTHING;

NOTIFY pgrst, 'reload schema';
