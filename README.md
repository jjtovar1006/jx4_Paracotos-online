# JX4 Paracotos - Plataforma de Comercio Electrónico Premium

Plataforma de e-commerce profesional multi-departamento con integración Supabase, optimizada para comercios locales.

## Características Premium Implementadas

### Funcionalidades Principales
- Sistema de búsqueda en tiempo real con filtrado inteligente
- Sistema de favoritos con persistencia local
- Modal de producto expandido con vista detallada
- Notificaciones toast elegantes para feedback del usuario
- Skeleton loaders durante la carga de contenido
- Animaciones suaves y transiciones profesionales
- Dashboard administrativo con estadísticas en tiempo real
- Sistema de pedidos con integración WhatsApp
- Bolsa de trabajo integrada
- Multi-departamento con gestión independiente

### Mejoras de Diseño
- Cards de producto con efectos hover premium
- Vista expandida de productos con galería
- Sistema de favoritos visual con corazones animados
- Búsqueda con limpiar campo integrado
- Filtros de categoría con indicadores visuales
- Loading states con skeleton screens
- Notificaciones toast con 4 tipos (success, error, warning, info)

### Panel de Administración
- Dashboard con estadísticas clave:
  - Ingresos totales
  - Pedidos realizados
  - Valor promedio de pedidos
  - Productos activos
- Vista de pedidos recientes
- Productos destacados
- Gestión completa de inventario
- Gestión de vacantes laborales
- Configuración global del sitio

### Integración Supabase
- Base de datos PostgreSQL en la nube
- Autenticación de administradores
- Persistencia de productos, pedidos y configuración
- Consultas optimizadas con caché

## Estructura del Proyecto

```
project/
├── App.tsx                    # Componente principal
├── index.tsx                  # Entry point
├── index.html                 # HTML base
├── types.ts                   # Definiciones TypeScript
├── constants.tsx              # Constantes de la app
├── services/
│   ├── supabaseService.ts    # Cliente Supabase
│   └── geminiService.ts      # API Gemini para IA
├── hooks/
│   ├── useToast.ts           # Hook sistema notificaciones
│   └── useFavorites.ts       # Hook gestión favoritos
├── components/
│   ├── Toast.tsx             # Componente notificaciones
│   ├── SkeletonLoader.tsx    # Loading placeholders
│   ├── SearchBar.tsx         # Barra de búsqueda
│   ├── ProductModal.tsx      # Modal producto expandido
│   └── Statistics.tsx        # Dashboard estadísticas
└── package.json
```

## Variables de Entorno

Las credenciales de Supabase están configuradas en `index.html`:

- `SUPABASE_URL`: URL del proyecto Supabase
- `SUPABASE_ANON_KEY`: Clave pública de Supabase
- `API_KEY`: API Key de Google Gemini (opcional)

## Instalación y Desarrollo

```bash
# Instalar dependencias
npm install

# Construir el proyecto
npm run build

# El proyecto usa módulos ES6 nativos, simplemente abre index.html
```

## Características Técnicas

- React 19 con Hooks avanzados
- TypeScript para type safety
- Supabase como backend
- Tailwind CSS para estilos
- Lucide React para iconos
- Google Gemini AI para recomendaciones
- Arquitectura modular con custom hooks
- Lazy loading de imágenes
- Responsive design mobile-first

## Seguridad

- Row Level Security (RLS) en Supabase
- Validación de datos en frontend y backend
- Sanitización de inputs del usuario
- Autenticación segura de administradores
- Persistencia segura de datos sensibles

## Deploy en Vercel

El proyecto está configurado con `vercel.json` para deploy automático:

```bash
vercel --prod
```

## Licencia

Proyecto privado - JX4 Paracotos © 2026
