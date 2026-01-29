
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

const ImageUploader: React.FC<{ 
  currentUrl: string; 
  onUpload: (url: string) => void;
  label: string;
}> = ({ currentUrl, onUpload, label }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onUpload(url);
    } catch (error) {
      console.error(error);
      alert("Error al subir imagen.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-primary/30 uppercase ml-2">{label}</label>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="relative aspect-video w-full rounded-2xl border-2 border-dashed border-primary/10 bg-white/50 hover:border-accent/30 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden shadow-inner"
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-accent" size={32} />
            <span className="text-[10px] font-black uppercase text-accent animate-pulse">Subiendo...</span>
          </div>
        ) : currentUrl ? (
          <>
            <img src={currentUrl} className="w-full h-full object-cover" alt="Vista previa" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <span className="bg-white text-primary text-[10px] font-black px-4 py-2 rounded-full shadow-lg">Cambiar</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-primary/20">
            <Upload size={32} />
            <span className="text-[10px] font-black uppercase tracking-widest mt-2">Seleccionar Archivo</span>
          </div>
        )}
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      </div>
    </div>
  );
};

const HomeView: React.FC<{ 
  products: Product[];
  departments: Department[];
  onAddToCart: (p: Product) => void;
  config: Config;
}> = ({ products, departments, onAddToCart, config }) => {
  const [selectedDept, setSelectedDept] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return products.filter(p => (selectedDept === 'all' || p.departamento === selectedDept) && p.nombre.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [products, selectedDept, searchQuery]);

  return (
    <div className="pb-32 animate-fade-in">
      <div className="bg-primary text-white py-2 px-4 text-center">
        <p className="text-xs font-bold animate-pulse">{config.cintillo_promocional}</p>
      </div>

      <header className="px-6 pt-10 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={config.logo_url} alt="Logo" className="w-14 h-14 object-contain rounded-xl shadow-sm bg-white" />
          <div>
            <h1 className="text-3xl font-black text-primary tracking-tight">JX4 Paracotos</h1>
            <p className="text-primary/60 text-sm font-medium">{config.slogan}</p>
          </div>
        </div>
      </header>

      <div className="px-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30" size={18} />
          <input 
            type="text" placeholder="¿Qué necesitas hoy?" 
            className="w-full bg-white border-2 border-primary/5 rounded-2xl py-4 pl-12 pr-4 focus:border-accent outline-none shadow-sm transition-all"
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="px-6 mb-8 overflow-x-auto hide-scrollbar flex gap-3">
        <button onClick={() => setSelectedDept('all')} className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${selectedDept === 'all' ? 'bg-primary text-white shadow-lg' : 'bg-white text-primary/40 border border-primary/5'}`}>Todos</button>
        {departments.map(d => (
          <button key={d.id} onClick={() => setSelectedDept(d.slug)} className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${selectedDept === d.slug ? 'bg-primary text-white shadow-lg' : 'bg-white text-primary/40 border border-primary/5'}`}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color_hex }}></span>
            {d.nombre}
          </button>
        ))}
      </div>

      <div className="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.length > 0 ? filtered.map(p => (
          <div key={p.id} className="glassmorphism rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-sm border border-white">
            <div className="aspect-square relative overflow-hidden bg-white">
              <img src={p.imagen_url} className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
              <div className="absolute top-3 right-3"><Badge variant="primary">{p.unidad.toUpperCase()}</Badge></div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg mb-1">{p.nombre}</h3>
              <p className="text-xs text-primary/50 mb-4 line-clamp-1">{p.descripcion}</p>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xl font-black text-primary">${p.precio.toFixed(2)}</div>
                  <div className="text-[10px] font-bold text-primary/30">Bs. {(p.precio * config.tasa_cambio).toFixed(2)}</div>
                </div>
                <button onClick={() => onAddToCart(p)} className="bg-primary text-white p-3 rounded-2xl hover:bg-accent transition-all shadow-lg active:scale-95">
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center">
            <Package className="mx-auto text-primary/10 mb-4" size={64} />
            <p className="font-bold text-primary/30">No se encontraron productos.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminPanel: React.FC<{
  products: Product[];
  departments: Department[];
  config: Config;
  onRefresh: () => void;
  onLogout: () => void;
}> = ({ products, departments, config, onRefresh, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'ventas' | 'productos' | 'depts' | 'config'>('ventas');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingDept, setEditingDept] = useState<Partial<Department> | null>(null);
  const [localConfig, setLocalConfig] = useState<Config>(config);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'ventas') {
      db.getOrders().then(setOrders).catch(console.error);
    }
  }, [activeTab]);

  const handleSaveProduct = async () => {
    setSaving(true);
    try {
      await db.upsertProduct(editingProduct);
      setEditingProduct(null);
      onRefresh();
    } catch (e) { alert("Error al guardar producto."); }
    finally { setSaving(false); }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await db.updateConfig(localConfig);
      onRefresh();
      alert("Configuración actualizada.");
    } catch (e) { alert("Error al guardar config."); }
    finally { setSaving(false); }
  };

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto pb-32 animate-fade-in">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black">Super Administrador</h2>
          <Badge variant="success">CLOUD SYNC</Badge>
        </div>
        <div className="flex gap-2">
           <button onClick={onRefresh} className="p-3 bg-white border border-primary/5 text-primary rounded-xl hover:bg-accent hover:text-white transition-all"><RefreshCcw size={20} /></button>
           <button onClick={onLogout} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><LogOut size={20} /></button>
        </div>
      </header>

      <div className="flex gap-4 mb-8 overflow-x-auto hide-scrollbar">
        {['ventas', 'productos', 'depts', 'config'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-3 rounded-2xl font-bold text-sm capitalize transition-all ${activeTab === tab ? 'bg-primary text-white shadow-lg' : 'bg-white border border-primary/5 text-primary/40'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'ventas' && (
        <div className="space-y-4">
          <h3 className="text-xl font-black mb-4">Registro de Ventas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map(o => (
              <div key={o.id} className="glassmorphism p-5 rounded-[2rem] shadow-sm border border-white">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-black text-primary/20 uppercase">#{o.order_id}</span>
                  <Badge variant="success">${o.total.toFixed(2)}</Badge>
                </div>
                <h4 className="font-bold text-lg">{o.nombre_cliente}</h4>
                <p className="text-xs text-primary/50 line-clamp-2 mb-3">{o.direccion}</p>
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-primary/30">
                  <span>{new Date(o.fecha_pedido).toLocaleDateString()}</span>
                  <span className="text-accent">{o.metodo_entrega}</span>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-primary/20 font-black py-10">No hay ventas registradas.</p>}
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="glassmorphism p-8 rounded-[2.5rem] space-y-6 shadow-sm border border-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <ImageUploader label="Logo" currentUrl={localConfig.logo_url} onUpload={(url) => setLocalConfig({...localConfig, logo_url: url})} />
              <input className="w-full bg-white p-4 rounded-xl border border-primary/5 font-bold" value={localConfig.slogan} onChange={e => setLocalConfig({...localConfig, slogan: e.target.value})} placeholder="Slogan" />
            </div>
            <div className="space-y-4">
              <input className="w-full bg-white p-4 rounded-xl border border-primary/5 font-bold" value={localConfig.cintillo_promocional} onChange={e => setLocalConfig({...localConfig, cintillo_promocional: e.target.value})} placeholder="Cintillo" />
              <input type="number" className="w-full bg-white p-4 rounded-xl border border-primary/5 font-black text-accent" value={localConfig.tasa_cambio} onChange={e => setLocalConfig({...localConfig, tasa_cambio: parseFloat(e.target.value)})} placeholder="Tasa" />
            </div>
          </div>
          <button onClick={handleSaveConfig} disabled={saving} className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20">
            {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Guardar Configuración
          </button>
        </div>
      )}

      {activeTab === 'productos' && (
        <div className="space-y-6">
          <button onClick={() => setEditingProduct({ nombre: '', precio: 0, stock: 0, departamento: 'carnes' as any, unidad: 'kg', disponible: true })} className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg"><Plus size={18} /> Nuevo Producto</button>
          <div className="glassmorphism rounded-[2.5rem] overflow-hidden shadow-sm border border-white">
            <table className="w-full text-left">
              <thead className="bg-primary/5 text-[10px] uppercase font-black text-primary/30"><tr className="p-4"><th></th><th className="p-4">Producto</th><th>Depto</th><th>Precio</th><th className="p-4 text-center">Acciones</th></tr></thead>
              <tbody className="divide-y divide-primary/5">
                {products.map(p => (
                  <tr key={p.id} className="text-sm font-medium hover:bg-white/40">
                    <td className="p-4"><img src={p.imagen_url} className="w-10 h-10 rounded-lg object-cover bg-white" /></td>
                    <td className="font-black">{p.nombre}</td>
                    <td><Badge>{p.departamento.toUpperCase()}</Badge></td>
                    <td className="font-bold">${p.precio}</td>
                    <td className="p-4 flex justify-center gap-2">
                      <button onClick={() => setEditingProduct(p)} className="p-2 text-accent bg-white rounded-lg shadow-sm"><Edit3 size={16} /></button>
                      <button onClick={async () => { if(confirm("¿Eliminar?")){ await db.deleteProduct(p.id); onRefresh(); } }} className="p-2 text-red-400 bg-white rounded-lg shadow-sm"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'depts' && (
        <div className="space-y-6">
           <button onClick={() => setEditingDept({ nombre: '', slug: 'carnes' as any, telefono_whatsapp: '', color_hex: '#3d4a3e' })} className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg"><Plus size={18} /> Nuevo Depto</button>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {departments.map(d => (
               <div key={d.id} className="glassmorphism p-6 rounded-[2rem] border-t-8 border-white shadow-sm" style={{ borderTopColor: d.color_hex }}>
                 <div className="flex justify-between items-start mb-4">
                   <h3 className="font-black text-lg">{d.nombre}</h3>
                   <div className="flex gap-2">
                     <button onClick={() => setEditingDept(d)} className="p-2 bg-white rounded-lg shadow-sm"><Edit3 size={14} /></button>
                     <button onClick={async () => { if(confirm("¿Eliminar?")){ await db.deleteDepartment(d.id); onRefresh(); } }} className="p-2 bg-white text-red-400 rounded-lg shadow-sm"><Trash2 size={14} /></button>
                   </div>
                 </div>
                 <p className="text-[10px] font-black text-primary/30 uppercase">+{d.telefono_whatsapp}</p>
               </div>
             ))}
           </div>
        </div>
      )}
      
      {editingProduct && (
        <div className="fixed inset-0 z-[100] bg-primary/40 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-3xl font-black">Editor de Producto</h3>
               <button onClick={() => setEditingProduct(null)}><X /></button>
             </div>
             <div className="space-y-6">
               <ImageUploader label="Imagen" currentUrl={editingProduct.imagen_url || ''} onUpload={(url) => setEditingProduct({...editingProduct, imagen_url: url})} />
               <input placeholder="Nombre" className="w-full bg-offwhite p-4 rounded-2xl border border-primary/5 font-bold" value={editingProduct.nombre} onChange={e => setEditingProduct({...editingProduct, nombre: e.target.value})} />
               <div className="grid grid-cols-2 gap-4">
                 <input placeholder="Precio" type="number" className="bg-offwhite p-4 rounded-2xl border border-primary/5 font-bold" value={editingProduct.precio} onChange={e => setEditingProduct({...editingProduct, precio: parseFloat(e.target.value)})} />
                 <input placeholder="Stock" type="number" className="bg-offwhite p-4 rounded-2xl border border-primary/5 font-bold" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})} />
               </div>
               <select className="w-full bg-offwhite p-4 rounded-2xl border border-primary/5 font-bold" value={editingProduct.departamento} onChange={e => setEditingProduct({...editingProduct, departamento: e.target.value as any})}>
                 {departments.map(d => <option key={d.id} value={d.slug}>{d.nombre}</option>)}
               </select>
               <button onClick={handleSaveProduct} disabled={saving} className="w-full bg-primary text-white py-5 rounded-2xl font-black shadow-xl">
                 {saving ? <Loader2 className="animate-spin mx-auto" /> : "Guardar Producto"}
               </button>
             </div>
          </div>
        </div>
      )}

      {editingDept && (
        <div className="fixed inset-0 z-[100] bg-primary/40 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in slide-in-from-bottom-10">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-black">Departamento</h3>
               <button onClick={() => setEditingDept(null)}><X /></button>
             </div>
             <div className="space-y-4">
               <input placeholder="Nombre" className="w-full bg-offwhite p-4 rounded-2xl font-bold" value={editingDept.nombre} onChange={e => setEditingDept({...editingDept, nombre: e.target.value})} />
               <input placeholder="Slug" className="w-full bg-offwhite p-4 rounded-2xl font-bold" value={editingDept.slug} onChange={e => setEditingDept({...editingDept, slug: e.target.value?.toLowerCase().replace(/\s+/g, '-') as any})} />
               <input placeholder="WhatsApp" className="w-full bg-offwhite p-4 rounded-2xl font-bold" value={editingDept.telefono_whatsapp} onChange={e => setEditingDept({...editingDept, telefono_whatsapp: e.target.value})} />
               <input type="color" className="w-full h-12 rounded-lg cursor-pointer bg-transparent border-none" value={editingDept.color_hex} onChange={e => setEditingDept({...editingDept, color_hex: e.target.value})} />
               <button onClick={async () => { await db.upsertDepartment(editingDept); setEditingDept(null); onRefresh(); }} className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-lg">Guardar</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
      const pResult = await db.getProducts().catch(e => {
        console.warn("Tabla 'products' no disponible.");
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
    } catch (e: any) { 
      console.error("Init Error:", e);
      setError(e.message || "Error al conectar con la base de datos.");
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { refreshData(); }, []);

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

  const finalizeOrder = async (orderData: Partial<Order>) => {
    if (cart.length === 0) return;
    const totalUSD = cart.reduce((acc, i) => acc + (i.precio * i.quantity), 0);
    const order: any = {
      order_id: `JX4-${Date.now()}`,
      nombre_cliente: orderData.nombre_cliente,
      telefono_cliente: orderData.telefono_cliente,
      direccion: orderData.direccion,
      productos: cart,
      total: totalUSD,
      total_bs: totalUSD * config.tasa_cambio,
      metodo_pago: orderData.metodo_pago || 'pago_movil',
      metodo_entrega: orderData.metodo_entrega || 'retiro',
      estado: 'pendiente',
      departamento: cart[0].departamento,
      fecha_pedido: new Date().toISOString()
    };
    try {
      await db.saveOrder(order);
      setCurrentOrder(order);
      setCart([]);
      setView('success');
      const deptInfo = departments.find(d => d.slug === order.departamento);
      const text = `*PEDIDO JX4 PARACOTOS*\nID: ${order.order_id}\nCliente: ${order.nombre_cliente}\nTotal: $${order.total.toFixed(2)}`;
      window.open(`https://wa.me/${deptInfo?.telefono_whatsapp || config.whatsapp_general}?text=${encodeURIComponent(text)}`, '_blank');
    } catch (e) { alert("Error al guardar pedido."); }
  };

  const totalCart = cart.reduce((acc, i) => acc + i.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-offwhite">
        <Loader2 className="animate-spin text-primary" size={64} />
        <h2 className="text-2xl font-black text-primary animate-pulse">Cargando JX4...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-red-50 p-6 text-center">
        <WifiOff className="text-red-400" size={80} />
        <h2 className="text-3xl font-black text-red-600">Error de Conexión</h2>
        <p className="max-w-md text-red-500">{error}</p>
        <button onClick={refreshData} className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2">
          <RefreshCcw size={20} /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-offwhite selection:bg-accent selection:text-white pb-32">
        <main className="max-w-7xl mx-auto">
          {view === 'home' && <HomeView products={products} departments={departments} onAddToCart={addToCart} config={config} />}
          
          {view === 'admin' && isAuth && (
            <AdminPanel 
              products={products} 
              departments={departments} 
              config={config} 
              onRefresh={refreshData} 
              onLogout={() => { setIsAuth(false); setView('home'); }} 
            />
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

          {view === 'cart' && (
             <div className="px-6 py-20 max-w-2xl mx-auto animate-fade-in">
                <h2 className="text-4xl font-black mb-10 text-primary">Tu Carrito</h2>
                {cart.length === 0 ? (
                  <div className="text-center py-20"><ShoppingBag className="mx-auto text-primary/5 mb-4" size={80} /><p className="text-primary/20 font-black">Tu bolsa está vacía.</p></div>
                ) : (
                  <div className="space-y-4">
                     {cart.map(i => (
                       <div key={i.id} className="glassmorphism p-4 rounded-[2rem] flex items-center gap-4 shadow-sm border border-white">
                         <img src={i.imagen_url} className="w-20 h-20 rounded-2xl object-cover bg-white" />
                         <div className="flex-1">
                           <h4 className="font-bold text-primary leading-tight">{i.nombre}</h4>
                           <p className="text-xs text-primary/40 font-bold">${i.precio.toFixed(2)}</p>
                         </div>
                         <div className="flex flex-col items-center gap-1 bg-offwhite p-1 rounded-xl">
                           <button onClick={() => setCart(cart.map(x => x.id === i.id ? {...x, quantity: x.quantity + 1} : x))}><Plus size={14} /></button>
                           <span className="font-black text-sm">{i.quantity}</span>
                           <button onClick={() => setCart(cart.map(x => x.id === i.id ? {...x, quantity: Math.max(1, x.quantity - 1)} : x))}><Minus size={14} /></button>
                         </div>
                         <button onClick={() => setCart(cart.filter(x => x.id !== i.id))} className="text-red-300 hover:text-red-500 p-2"><Trash2 size={20} /></button>
                       </div>
                     ))}
                     <div className="p-10 glassmorphism rounded-[2.5rem] mt-10 shadow-xl border border-white">
                        <div className="flex justify-between items-center font-black text-4xl mb-6 text-primary tracking-tighter"><span>Total:</span> <span>${cart.reduce((a,b) => a+(b.precio*b.quantity), 0).toFixed(2)}</span></div>
                        <button onClick={() => setView('checkout')} className="w-full bg-primary text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-4 shadow-2xl hover:bg-accent transition-all">Continuar <ArrowRight size={24} /></button>
                     </div>
                  </div>
                )}
             </div>
          )}

          {view === 'checkout' && (
            <div className="px-6 py-20 max-w-xl mx-auto animate-fade-in">
              <h2 className="text-3xl font-black mb-8 text-primary">Datos de Envío</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                finalizeOrder({
                  nombre_cliente: fd.get('n') as string,
                  telefono_cliente: fd.get('t') as string,
                  direccion: fd.get('d') as string,
                  metodo_entrega: fd.get('e') as any
                });
              }} className="space-y-6">
                <div className="glassmorphism p-6 rounded-[2rem] space-y-4 border border-white">
                  <input name="n" required placeholder="Nombre Completo" className="w-full bg-offwhite p-4 rounded-xl font-bold" />
                  <input name="t" required type="tel" placeholder="WhatsApp (58424...)" className="w-full bg-offwhite p-4 rounded-xl font-bold" />
                  <textarea name="d" required placeholder="Dirección exacta" className="w-full bg-offwhite p-4 rounded-xl font-bold h-24" />
                </div>
                <div className="glassmorphism p-6 rounded-[2rem] border border-white">
                  <h3 className="text-xs font-black uppercase text-primary/30 mb-4 tracking-widest">Entrega</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 p-4 bg-offwhite rounded-xl cursor-pointer"><input type="radio" name="e" value="retiro" defaultChecked /><span className="font-bold">Retiro</span></label>
                    <label className="flex items-center gap-2 p-4 bg-offwhite rounded-xl cursor-pointer"><input type="radio" name="e" value="delivery" /><span className="font-bold">Delivery</span></label>
                  </div>
                </div>
                <button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl">Finalizar Pedido</button>
              </form>
            </div>
          )}

          {view === 'success' && currentOrder && (
            <div className="flex flex-col items-center justify-center py-32 px-6 text-center animate-fade-in">
               <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center mb-10 border border-green-100"><CheckCircle2 size={80} className="text-green-500" /></div>
               <h2 className="text-5xl font-black mb-6 tracking-tighter text-primary">¡Listo!</h2>
               <p className="text-primary/50 mb-12 max-w-sm text-lg">Tu orden <strong>{currentOrder.order_id}</strong> se ha procesado exitosamente.</p>
               <button onClick={() => setView('home')} className="bg-primary text-white px-16 py-5 rounded-2xl font-black text-xl shadow-2xl">Volver al Inicio</button>
            </div>
          )}
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
