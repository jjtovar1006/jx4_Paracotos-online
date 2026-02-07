/*
  # Add Comprehensive Sample Data with Images
  
  1. Updates
    - Clear existing sample data
    - Add proper departments (Carnes, Aves, Embutidos, Pescados, Transporte)
    - Add 20+ products with high-quality Pexels images
    - Add sample jobs
    - Update site configuration
  
  2. Sample Data Categories
    - Carnes: Premium beef products
    - Aves: Chicken products  
    - Embutidos: Deli meats and sausages
    - Pescados: Fresh seafood
    - Transporte: Freight services
*/

-- Clear existing data
TRUNCATE products, departments, jobs RESTART IDENTITY CASCADE;

-- Add proper departments
INSERT INTO departments (nombre, slug, telefono_whatsapp) VALUES
  ('Carnes', 'carnes', '584121234567'),
  ('Aves', 'aves', '584121234568'),
  ('Embutidos', 'embutidos', '584121234569'),
  ('Pescados', 'pescados', '584121234570'),
  ('Transporte', 'transporte', '584121234571');

-- Add products with proper images

-- CARNES (Beef)
INSERT INTO products (nombre, descripcion, precio, departamento, imagen_url, disponible, destacado) VALUES
  ('Carne Molida Premium', 'Carne molida 100% pura de res, fresca y de calidad superior para hamburguesas y guisos', 8.99, 'carnes', 'https://images.pexels.com/photos/5737393/pexels-photo-5737393.jpeg?auto=compress&cs=tinysrgb&w=800', true, true),
  ('Filete de Res', 'Corte premium seleccionado, ideal para parrillas y asados especiales', 15.99, 'carnes', 'https://images.pexels.com/photos/65175/pexels-photo-65175.jpeg?auto=compress&cs=tinysrgb&w=800', true, true),
  ('Costillas de Res', 'Costillas jugosas perfectas para BBQ, marinadas o al horno', 12.50, 'carnes', 'https://images.pexels.com/photos/323682/pexels-photo-323682.jpeg?auto=compress&cs=tinysrgb&w=800', true, false),
  ('Bistec de Lomo', 'Corte tierno y jugoso, excelente para frituras o parrilla', 11.99, 'carnes', 'https://images.pexels.com/photos/1268559/pexels-photo-1268559.jpeg?auto=compress&cs=tinysrgb&w=800', true, true),
  ('Solomo Premium', 'Corte magro y sabroso, ideal para milanesas y escalopes', 10.50, 'carnes', 'https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?auto=compress&cs=tinysrgb&w=800', true, false);

-- AVES (Poultry)
INSERT INTO products (nombre, descripcion, precio, departamento, imagen_url, disponible, destacado) VALUES
  ('Pechuga de Pollo', 'Pechuga fresca sin piel ni hueso, perfecta para dietas saludables', 7.99, 'aves', 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=800', true, true),
  ('Muslos de Pollo', 'Muslos jugosos con hueso, ideales para guisos y sopas tradicionales', 5.99, 'aves', 'https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg?auto=compress&cs=tinysrgb&w=800', true, false),
  ('Pollo Entero Fresco', 'Pollo completo fresco del dia, listo para hornear o guisar', 9.50, 'aves', 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=800', true, true),
  ('Alitas de Pollo', 'Alitas frescas premium, perfectas para salsas BBQ y frituras', 6.50, 'aves', 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=800', true, false);

-- EMBUTIDOS (Deli/Charcuterie)
INSERT INTO products (nombre, descripcion, precio, departamento, imagen_url, disponible, destacado) VALUES
  ('Jamon Ahumado Premium', 'Jamon ahumado artesanal, perfecto para sandwiches gourmet', 8.99, 'embutidos', 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=800', true, true),
  ('Salchichon Italiano', 'Salchichon curado con especias tradicionales italianas', 7.50, 'embutidos', 'https://images.pexels.com/photos/1927383/pexels-photo-1927383.jpeg?auto=compress&cs=tinysrgb&w=800', true, false),
  ('Chorizo Parrillero', 'Chorizo fresco artesanal ideal para parrillas y arepas', 6.99, 'embutidos', 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', true, true),
  ('Mortadela Premium', 'Mortadela de primera calidad, suave y sabrosa', 5.50, 'embutidos', 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=800', true, false),
  ('Salami Tipo Milano', 'Salami curado estilo Milano, sabor intenso y autentico', 9.50, 'embutidos', 'https://images.pexels.com/photos/1395319/pexels-photo-1395319.jpeg?auto=compress&cs=tinysrgb&w=800', true, true);

-- PESCADOS (Seafood)
INSERT INTO products (nombre, descripcion, precio, departamento, imagen_url, disponible, destacado) VALUES
  ('Filete de Salmon', 'Salmon fresco del Atlantico, rico en Omega-3 y proteinas', 16.99, 'pescados', 'https://images.pexels.com/photos/3296434/pexels-photo-3296434.jpeg?auto=compress&cs=tinysrgb&w=800', true, true),
  ('Camarones Jumbo', 'Camarones grandes frescos, ideales para paella y ceviches', 18.50, 'pescados', 'https://images.pexels.com/photos/725997/pexels-photo-725997.jpeg?auto=compress&cs=tinysrgb&w=800', true, true),
  ('Filete de Pargo', 'Pargo rojo fresco, textura firme y sabor delicado', 13.99, 'pescados', 'https://images.pexels.com/photos/5409015/pexels-photo-5409015.jpeg?auto=compress&cs=tinysrgb&w=800', true, false),
  ('Atun Fresco', 'Atun de primera calidad, perfecto para sushi y tatakis', 14.99, 'pescados', 'https://images.pexels.com/photos/8951310/pexels-photo-8951310.jpeg?auto=compress&cs=tinysrgb&w=800', true, true);

-- TRANSPORTE (Freight Services)
INSERT INTO products (nombre, descripcion, precio, departamento, imagen_url, disponible, destacado) VALUES
  ('Flete Local Paracotos', 'Servicio de carga local dentro de Paracotos y zonas cercanas', 25.00, 'transporte', 'https://images.pexels.com/photos/1118448/pexels-photo-1118448.jpeg?auto=compress&cs=tinysrgb&w=800', true, true),
  ('Flete Regional', 'Transporte de carga a nivel regional, municipios aledaños', 45.00, 'transporte', 'https://images.pexels.com/photos/4391470/pexels-photo-4391470.jpeg?auto=compress&cs=tinysrgb&w=800', true, false),
  ('Mudanza Residencial', 'Servicio completo de mudanzas con personal capacitado', 120.00, 'transporte', 'https://images.pexels.com/photos/7464230/pexels-photo-7464230.jpeg?auto=compress&cs=tinysrgb&w=800', true, true),
  ('Flete Express', 'Entrega express en el dia, servicio prioritario garantizado', 35.00, 'transporte', 'https://images.pexels.com/photos/4391470/pexels-photo-4391470.jpeg?auto=compress&cs=tinysrgb&w=800', true, false);

-- Add sample jobs
INSERT INTO jobs (titulo, descripcion, requisitos, activo) VALUES
  ('Vendedor de Carniceria', 'Buscamos vendedor con experiencia en atencion al cliente para nuestro departamento de carnes. Horario flexible y buen ambiente laboral.', 'Experiencia minima 1 año en ventas, conocimiento de cortes de carne, disponibilidad inmediata', true),
  ('Repartidor con Moto', 'Necesitamos repartidor responsable con moto propia para delivery de pedidos en Paracotos y alrededores.', 'Moto propia, licencia vigente, conocimiento de la zona, disponibilidad de lunes a sabado', true),
  ('Ayudante de Carniceria', 'Vacante para ayudante general en carniceria. Se ofrece capacitacion y oportunidad de crecimiento.', 'Responsable, puntual, ganas de aprender, disponibilidad inmediata', true);

-- Update site config
UPDATE site_config SET 
  tasa_cambio = 37.50,
  cintillo_promocional = 'Envios gratis en compras mayores a $50 - Calidad garantizada',
  slogan = 'Frescura y calidad en cada producto',
  whatsapp_general = '584121234567'
WHERE id = 1;