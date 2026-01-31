
import { neon } from '@neondatabase/serverless';

// URL de conexión a Neon
const databaseUrl = (window as any).process?.env?.DATABASE_URL || 'postgresql://neondb_owner:npg_ApK0uye7xODV@ep-calm-cake-ahbbwe7i-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(databaseUrl);

// Claves para el almacenamiento local
const CACHE_KEYS = {
  PRODUCTS: 'jx4_cache_products',
  DEPTS: 'jx4_cache_depts',
  CONFIG: 'jx4_cache_config',
  TIMESTAMP: 'jx4_cache_ts'
};

/**
 * Convierte el archivo seleccionado a un Data URL (base64)
 */
export async function uploadImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validación básica de tamaño para evitar lentitud extrema (Max 1MB sugerido)
    if (file.size > 1024 * 1024) {
      console.warn("Imagen pesada detectada. Esto podría ralentizar la app.");
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(new Error("No se pudo procesar la imagen."));
    reader.readAsDataURL(file);
  });
}

export const db = {
  login: async (username: string, password: string) => {
    try {
      const users = await sql`
        SELECT id, username, role, dept_slugs 
        FROM admin_users 
        WHERE username = ${username} AND password = ${password}
        LIMIT 1
      `;
      if (!users || users.length === 0) throw new Error("Usuario o clave incorrectos.");
      return users[0];
    } catch (e: any) {
      console.error("Database Login Error:", e);
      throw new Error(e.message || "Error al conectar con Neon.");
    }
  },

  getAdmins: async () => {
    return await sql`SELECT id, username, role, dept_slugs FROM admin_users ORDER BY username ASC`;
  },

  upsertAdmin: async (user: any) => {
    if (user.id) {
      const result = await sql`
        UPDATE admin_users 
        SET username = ${user.username}, 
            role = ${user.role}, 
            dept_slugs = ${user.dept_slugs || []},
            password = CASE 
              WHEN ${user.password} IS NOT NULL AND ${user.password} != '' THEN ${user.password} 
              ELSE password 
            END
        WHERE id = ${user.id}
        RETURNING id, username, role, dept_slugs
      `;
      return result[0];
    } else {
      const result = await sql`
        INSERT INTO admin_users (username, password, role, dept_slugs)
        VALUES (${user.username}, ${user.password}, ${user.role}, ${user.dept_slugs || []})
        RETURNING id, username, role, dept_slugs
      `;
      return result[0];
    }
  },

  deleteAdmin: async (id: string) => {
    await sql`DELETE FROM admin_users WHERE id = ${id}`;
  },

  // Obtener productos con soporte de caché
  getProducts: async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = localStorage.getItem(CACHE_KEYS.PRODUCTS);
      if (cached) return JSON.parse(cached);
    }
    try {
      const data = await sql`SELECT * FROM products ORDER BY nombre ASC`;
      localStorage.setItem(CACHE_KEYS.PRODUCTS, JSON.stringify(data));
      return data;
    } catch (error) {
      const cached = localStorage.getItem(CACHE_KEYS.PRODUCTS);
      return cached ? JSON.parse(cached) : [];
    }
  },

  upsertProduct: async (p: any) => {
    const result = p.id 
      ? await sql`UPDATE products SET nombre=${p.nombre}, descripcion=${p.descripcion}, precio=${p.precio}, stock=${p.stock}, imagen_url=${p.imagen_url}, categoria=${p.categoria}, departamento=${p.departamento}, unidad=${p.unidad}, peso_referencial=${p.peso_referencial}, disponible=${p.disponible}, destacado=${p.destacado} WHERE id=${p.id} RETURNING *`
      : await sql`INSERT INTO products (nombre, descripcion, precio, stock, imagen_url, categoria, departamento, unidad, peso_referencial, disponible, destacado) VALUES (${p.nombre}, ${p.descripcion}, ${p.precio}, ${p.stock}, ${p.imagen_url}, ${p.categoria}, ${p.departamento}, ${p.unidad}, ${p.peso_referencial}, ${p.disponible}, ${p.destacado}) RETURNING *`;
    
    // Invalidar caché tras cambios
    localStorage.removeItem(CACHE_KEYS.PRODUCTS);
    return result[0];
  },

  deleteProduct: async (id: string) => {
    await sql`DELETE FROM products WHERE id = ${id}`;
    localStorage.removeItem(CACHE_KEYS.PRODUCTS);
  },

  getDepartments: async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = localStorage.getItem(CACHE_KEYS.DEPTS);
      if (cached) return JSON.parse(cached);
    }
    try {
      const data = await sql`SELECT * FROM departments ORDER BY nombre ASC`;
      localStorage.setItem(CACHE_KEYS.DEPTS, JSON.stringify(data));
      return data;
    } catch (e) {
      const cached = localStorage.getItem(CACHE_KEYS.DEPTS);
      return cached ? JSON.parse(cached) : [];
    }
  },

  upsertDepartment: async (d: any) => {
    const result = d.id
      ? await sql`UPDATE departments SET nombre=${d.nombre}, slug=${d.slug}, telefono_whatsapp=${d.telefono_whatsapp}, color_hex=${d.color_hex}, activo=${d.activo} WHERE id=${d.id} RETURNING *`
      : await sql`INSERT INTO departments (nombre, slug, telefono_whatsapp, color_hex, activo) VALUES (${d.nombre}, ${d.slug}, ${d.telefono_whatsapp}, ${d.color_hex}, ${d.activo || true}) RETURNING *`;
    
    localStorage.removeItem(CACHE_KEYS.DEPTS);
    return result[0];
  },

  deleteDepartment: async (id: string) => {
    await sql`DELETE FROM departments WHERE id = ${id}`;
    localStorage.removeItem(CACHE_KEYS.DEPTS);
  },

  getConfig: async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = localStorage.getItem(CACHE_KEYS.CONFIG);
      if (cached) return JSON.parse(cached);
    }
    try {
      const rows = await sql`SELECT * FROM site_config LIMIT 1`;
      if (rows[0]) localStorage.setItem(CACHE_KEYS.CONFIG, JSON.stringify(rows[0]));
      return rows[0] || null;
    } catch (e) {
      const cached = localStorage.getItem(CACHE_KEYS.CONFIG);
      return cached ? JSON.parse(cached) : null;
    }
  },

  updateConfig: async (c: any) => {
    const result = await sql`
      INSERT INTO site_config (id, tasa_cambio, cintillo_promocional, slogan, logo_url, whatsapp_general)
      VALUES (1, ${c.tasa_cambio}, ${c.cintillo_promocional}, ${c.slogan}, ${c.logo_url}, ${c.whatsapp_general})
      ON CONFLICT (id) DO UPDATE SET
        tasa_cambio = EXCLUDED.tasa_cambio,
        cintillo_promocional = EXCLUDED.cintillo_promocional,
        slogan = EXCLUDED.slogan,
        logo_url = EXCLUDED.logo_url,
        whatsapp_general = EXCLUDED.whatsapp_general
      RETURNING *
    `;
    localStorage.removeItem(CACHE_KEYS.CONFIG);
    return result[0];
  },

  saveOrder: async (o: any) => {
    return await sql`
      INSERT INTO orders (order_id, telefono_cliente, nombre_cliente, productos, total, total_bs, metodo_pago, metodo_entrega, estado, departamento, direccion, notas)
      VALUES (${o.order_id}, ${o.telefono_cliente}, ${o.nombre_cliente}, ${JSON.stringify(o.productos)}, ${o.total}, ${o.total_bs}, ${o.metodo_pago}, ${o.metodo_entrega}, ${o.estado}, ${o.departamento}, ${o.direccion}, ${o.notas})
      RETURNING *
    `;
  },

  getOrders: async (deptSlugs?: string | string[]) => {
    const slugs = deptSlugs ? (Array.isArray(deptSlugs) ? deptSlugs : [deptSlugs]) : null;
    return slugs 
      ? await sql`SELECT * FROM orders WHERE departamento = ANY(${slugs}) ORDER BY fecha_pedido DESC`
      : await sql`SELECT * FROM orders ORDER BY fecha_pedido DESC`;
  },

  getLatestOrderByPhone: async (phone: string) => {
    const rows = await sql`SELECT nombre_cliente, direccion FROM orders WHERE telefono_cliente = ${phone} ORDER BY fecha_pedido DESC LIMIT 1`;
    return rows[0] || null;
  }
};
