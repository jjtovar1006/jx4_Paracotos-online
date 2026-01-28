
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HashRouter } from 'react-router-dom';
import { 
  ShoppingBag, Plus, Minus, Trash2, ArrowRight, CheckCircle2, 
  LayoutDashboard, Search, ChevronRight, TrendingUp, Package, 
  Settings, Upload, LogIn, LogOut,
  Truck, Store, Bike, Car, HardHat, Save, X, Edit3, AlertCircle,
  Image as ImageIcon, Loader2, RefreshCcw, Clipboard, ExternalLink,
  WifiOff, Database
} from 'lucide-react';

import { Product, CartItem, DepartmentSlug, Order, Config, Department } from './types';
import { db, uploadImage } from './services/supabaseService';

const CONFIG_STUB: Config = {
  tasa_cambio: 36.5,
  cintillo_promocional: '¡Bienvenidos a JX4 Paracotos!',
  slogan: 'Calidad y Frescura en tu Mesa',
  logo_url: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
  whatsapp_general: '584241112233'
};

const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'error' | 'info' | 'primary' }> = ({ children, variant = 'primary' }) => {
  const styles = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
  };
  return <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${styles[variant]}`}>{children}</span>;
};

// Componente App Principal
const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [config, setConfig] = useState<Config>(CONFIG_STUB);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [view, setView] = useState<'home' | 'cart' | 'checkout' | 'success' | 'admin' | 'login'>('home');
  const [isAuth, setIsAuth] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Intentar cargar datos pero capturar fallos de tablas individuales
      const pResult = await db.getProducts().catch(e => {
        console.warn("Tabla 'products' no disponible. ¿Ejecutaste el SQL?");
        return [];
      });
      
      const dResult = await db.getDepartments().catch(e => {
        console.warn("Tabla 'departments' no disponible.");
        return [];
      });

      const cResult = await db.getConfig().catch(e => null);

      setProducts(pResult);
      setDepartments(dResult);
      if (cResult) setConfig(cResult);
      
      // Solo mostramos error crítico si no hay productos ni departamentos y hubo un fallo real
      if (pResult.length === 0 && dResult.length === 0) {
        // Podría ser que las tablas estén vacías o no existan
        console.info("Aplicación iniciada con datos vacíos.");
      }
    } catch (e: any) { 
      console.error("Critical Init Error:", e);
      setError(e.message || "Error al conectar con la base de datos.");
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    refreshData(); 
  }, []);

  const addToCart = (p: Product) => {
    if (cart.length > 0 && cart[0].departamento !== p.departamento) {
      alert("⚠️ Estás comprando en un departamento diferente. Finaliza tu pedido actual primero.");
      return;
    }
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? {...i, quantity: i.quantity + 1} : i);
      return [...prev, {...p, quantity: 1}];
    });
  };

  const totalCart = cart.reduce((acc, i) => acc + i.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-offwhite">
        <Loader2 className="animate-spin text-primary" size={64} />
        <div className="text-center animate-pulse">
          <h2 className="text-2xl font-black text-primary">Conectando con Supabase...</h2>
          <p className="text-primary/40 font-bold">Verificando tablas y esquemas</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-red-50 p-6 text-center">
        <WifiOff className="text-red-400" size={80} />
        <h2 className="text-3xl font-black text-red-600">Fallo de Conexión</h2>
        <p className="max-w-md text-red-500 font-medium">{error}</p>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100 mb-4 text-left max-w-sm">
          <p className="text-[10px] font-black uppercase text-red-300 mb-2">Sugerencia:</p>
          <p className="text-xs text-red-400">Asegúrate de haber ejecutado las migraciones SQL en el panel de Supabase para crear las tablas 'products', 'departments', 'orders' y 'site_config'.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={refreshData} className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg">
            <RefreshCcw size={20} /> Reintentar
          </button>
          <button onClick={() => setView('login')} className="bg-white text-primary px-8 py-3 rounded-2xl font-black border border-primary/10">
            Login Admin
          </button>
        </div>
      </div>
    );
  }

  // Renderizado del contenido principal basado en el estado 'view'
  // (Asumiendo el resto de los componentes HomeView, AdminPanel, etc. ya definidos)
  return (
    <HashRouter>
      <div className="min-h-screen bg-offwhite selection:bg-accent selection:text-white pb-32">
        <main className="max-w-7xl mx-auto">
          {view === 'home' && (
             <div className="pb-32 animate-fade-in">
                <div className="bg-primary text-white py-2 px-4 text-center">
                  <p className="text-xs font-bold">{config.cintillo_promocional}</p>
                </div>
                <header className="px-6 pt-10 pb-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={config.logo_url} alt="Logo" className="w-14 h-14 object-contain rounded-xl bg-white shadow-sm" />
                    <div>
                      <h1 className="text-3xl font-black text-primary">JX4 Paracotos</h1>
                      <p className="text-primary/60 text-sm">{config.slogan}</p>
                    </div>
                  </div>
                </header>
                {/* Grid de productos o aviso de tablas vacías */}
                <div className="px-6 mt-10">
                  {products.length === 0 && (
                    <div className="glassmorphism p-12 rounded-[3rem] text-center border-2 border-dashed border-primary/10">
                      <Database className="mx-auto text-primary/10 mb-4" size={64} />
                      <h3 className="text-xl font-black text-primary/40">Sin productos aún</h3>
                      <p className="text-sm text-primary/20 max-w-xs mx-auto mt-2">Accede al panel de administración para añadir tus primeros productos y departamentos.</p>
                      <button onClick={() => setView('login')} className="mt-6 bg-primary text-white px-8 py-3 rounded-xl font-bold">Configurar Ahora</button>
                    </div>
                  )}
                  {/* Aquí iría el mapeo de productos real si existen */}
                </div>
             </div>
          )}
          
          {view === 'login' && (
            <div className="min-h-screen flex items-center justify-center p-6 animate-fade-in">
               <form onSubmit={(e) => {
                 e.preventDefault();
                 const fd = new FormData(e.currentTarget);
                 if (fd.get('u')==='jjtovar1006' && fd.get('p')==='Apamate.25'){ 
                   setIsAuth(true); 
                   setView('admin'); 
                 }
                 else { alert("Credenciales incorrectas."); }
               }} className="glassmorphism p-12 rounded-[3rem] w-full max-w-md space-y-8 shadow-2xl border border-white">
                 <div className="text-center">
                    <div className="bg-primary w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white mb-6"><LogIn size={32} /></div>
                    <h2 className="text-3xl font-black">Admin Access</h2>
                 </div>
                 <div className="space-y-4">
                    <input name="u" required placeholder="Usuario" className="w-full bg-white p-5 rounded-2xl font-bold border border-primary/5 outline-none" />
                    <input name="p" type="password" required placeholder="Clave" className="w-full bg-white p-5 rounded-2xl font-bold border border-primary/5 outline-none" />
                 </div>
                 <button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-accent transition-all">Acceder</button>
               </form>
            </div>
          )}
          
          {/* Implementación mínima de navegación para evitar blank screen */}
        </main>

        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md glassmorphism rounded-full px-10 py-5 flex items-center justify-between shadow-2xl z-50 border border-white/40">
          <button onClick={() => setView('home')} className={`p-2 transition-all ${view === 'home' ? 'text-accent scale-125' : 'text-primary/30'}`}><TrendingUp size={28} /></button>
          <button onClick={() => setView('cart')} className={`p-2 relative transition-all ${view === 'cart' ? 'text-accent scale-125' : 'text-primary/30'}`}>
            <ShoppingBag size={28} />
            {totalCart > 0 && <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-lg">{totalCart}</span>}
          </button>
          <button onClick={() => isAuth ? setView('admin') : setView('login')} className={`p-2 transition-all ${view === 'admin' || view === 'login' ? 'text-accent scale-125' : 'text-primary/30'}`}><LayoutDashboard size={28} /></button>
        </nav>
      </div>
    </HashRouter>
  );
};

export default App;
