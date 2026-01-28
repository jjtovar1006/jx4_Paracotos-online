
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HashRouter, Link } from 'react-router-dom';
import { 
  ShoppingBag, Plus, Minus, Trash2, ArrowRight, CheckCircle2, 
  LayoutDashboard, Search, ChevronRight, TrendingUp, Package, 
  ClipboardList, Settings, Upload, User, Info, LogIn, LogOut,
  Truck, Store, Bike, Car, HardHat, Save, X, Edit3, AlertCircle,
  Image as ImageIcon, Loader2
} from 'lucide-react';

import { Product, CartItem, DepartmentSlug, Order, Config, Department } from './types';
import { DEPARTMENTS as INITIAL_DEPTS, APP_CONFIG_DEFAULT } from './constants';
import { generateProductDescription, getCookingTip } from './services/geminiService';
import { uploadImage } from './services/supabaseService';

// --- Estado Inicial ---
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', nombre: 'Punta Trasera Premium', descripcion: 'Corte de res de primera calidad.', precio: 12.5, stock: 20, imagen_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', categoria: 'Premium', departamento: 'carnes' as any, unidad: 'kg', peso_referencial: true, disponible: true, destacado: true },
  { id: '2', nombre: 'Pechuga de Pollo', descripcion: 'Frescamente deshuesada.', precio: 6.8, stock: 45, imagen_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400', categoria: 'Aves', departamento: 'aves' as any, unidad: 'kg', peso_referencial: true, disponible: true, destacado: false },
];

const INITIAL_DEPARTMENTS: Department[] = INITIAL_DEPTS.map(d => ({
  id: d.slug,
  nombre: d.name,
  slug: d.slug,
  telefono_whatsapp: '584241112233',
  activo: true,
  color_hex: d.color
}));

const CONFIG_STUB: Config = {
  ...APP_CONFIG_DEFAULT,
  slogan: 'Calidad Gourmet directo a tu hogar',
  logo_url: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
  whatsapp_general: '584241112233'
};

// --- Componentes Reutilizables ---

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
      alert("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-primary/30 uppercase ml-2">{label}</label>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="relative aspect-video w-full rounded-2xl border-2 border-dashed border-primary/10 bg-offwhite hover:border-accent/30 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden"
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-accent" size={32} />
            <span className="text-[10px] font-black uppercase text-accent animate-pulse">Subiendo...</span>
          </div>
        ) : currentUrl ? (
          <>
            <img src={currentUrl} className="w-full h-full object-cover" alt="Vista previa" />
            <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="bg-white text-primary text-[10px] font-black px-4 py-2 rounded-full shadow-lg">Cambiar Imagen</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-primary/20">
            <Upload size={32} />
            <span className="text-[10px] font-black uppercase tracking-widest mt-2">Seleccionar Archivo</span>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
      </div>
    </div>
  );
};

// --- Vistas ---

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
    <div className="pb-32">
      <div className="bg-primary text-white py-2 px-4 text-center overflow-hidden whitespace-nowrap">
        <p className="text-xs font-bold animate-pulse">{config.cintillo_promocional}</p>
      </div>

      <header className="px-6 pt-10 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={config.logo_url} alt="Logo" className="w-14 h-14 object-contain rounded-xl" />
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
            type="text" placeholder="¿Qué buscas hoy?" 
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
          <div key={p.id} className="glassmorphism rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="aspect-square relative overflow-hidden">
              <img src={p.imagen_url} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              <div className="absolute top-3 right-3"><Badge variant="primary">{p.unidad}</Badge></div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg mb-1">{p.nombre}</h3>
              <p className="text-xs text-primary/50 mb-4 line-clamp-1">{p.descripcion}</p>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xl font-black text-primary">${p.precio.toFixed(2)}</div>
                  <div className="text-[10px] font-bold text-primary/30">Bs. {(p.precio * config.tasa_cambio).toFixed(2)}</div>
                </div>
                <button onClick={() => onAddToCart(p)} className="bg-primary text-white p-3 rounded-2xl hover:bg-accent transition-all shadow-lg shadow-primary/10 active:scale-95">
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-primary/30 font-bold">No se encontraron productos.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CheckoutView: React.FC<{
  cart: CartItem[];
  config: Config;
  departments: Department[];
  onComplete: (order: Order) => void;
}> = ({ cart, config, departments, onComplete }) => {
  const [formData, setFormData] = useState({
    nombre: '', telefono: '', direccion: '', 
    metodo: 'retiro' as 'delivery' | 'retiro', 
    transporte: 'moto' as 'moto' | 'carro' | 'camion',
    pago: 'pago_movil'
  });

  const totalUSD = cart.reduce((acc, i) => acc + (i.precio * i.quantity), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const order: Order = {
      id: crypto.randomUUID(),
      order_id: `JX4-${Date.now()}`,
      nombre_cliente: formData.nombre,
      telefono_cliente: formData.telefono,
      direccion: formData.direccion,
      productos: cart,
      total: totalUSD,
      total_bs: totalUSD * config.tasa_cambio,
      metodo_pago: formData.pago,
      metodo_entrega: formData.metodo,
      tipo_transporte: formData.metodo === 'delivery' ? formData.transporte : undefined,
      estado: 'pendiente',
      departamento: cart[0].departamento,
      fecha_pedido: new Date().toISOString()
    };
    onComplete(order);
  };

  return (
    <div className="px-6 py-10 max-w-xl mx-auto pb-32">
      <h2 className="text-3xl font-black mb-6 text-center">Finalizar Pedido</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="glassmorphism p-6 rounded-[2rem] space-y-4 shadow-sm">
          <input required placeholder="Nombre Completo" className="w-full bg-offwhite p-4 rounded-xl outline-none focus:ring-2 ring-accent/20" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
          <input required type="tel" placeholder="Teléfono" className="w-full bg-offwhite p-4 rounded-xl outline-none focus:ring-2 ring-accent/20" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
          <textarea required placeholder="Dirección exacta de entrega" className="w-full bg-offwhite p-4 rounded-xl outline-none focus:ring-2 ring-accent/20" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
        </div>

        <div className="glassmorphism p-6 rounded-[2rem] shadow-sm">
          <h3 className="text-xs uppercase font-black text-primary/30 tracking-widest mb-4">Logística de Entrega</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button type="button" onClick={() => setFormData({...formData, metodo: 'retiro'})} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.metodo === 'retiro' ? 'border-primary bg-primary text-white shadow-lg' : 'border-primary/5 text-primary/40'}`}>
              <Store size={24} /> <span className="text-xs font-bold">Retiro en Local</span>
            </button>
            <button type="button" onClick={() => setFormData({...formData, metodo: 'delivery'})} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.metodo === 'delivery' ? 'border-primary bg-primary text-white shadow-lg' : 'border-primary/5 text-primary/40'}`}>
              <Truck size={24} /> <span className="text-xs font-bold">Solicitar Delivery</span>
            </button>
          </div>

          {formData.metodo === 'delivery' && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <h4 className="text-[10px] uppercase font-black text-primary/20 mb-3 text-center">Agenda de Carga (Tipo de Vehículo)</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'moto', icon: <Bike size={18} />, label: 'Moto' },
                  { id: 'carro', icon: <Car size={18} />, label: 'Carro' },
                  { id: 'camion', icon: <HardHat size={18} />, label: 'Camión' }
                ].map(v => (
                  <button key={v.id} type="button" onClick={() => setFormData({...formData, transporte: v.id as any})} className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${formData.transporte === v.id ? 'bg-accent/10 border-accent text-accent shadow-sm' : 'border-primary/5 text-primary/30 hover:border-accent/20'}`}>
                    {v.icon} <span className="text-[10px] font-bold">{v.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
          Confirmar y Enviar Pedido <ArrowRight size={20} />
        </button>
      </form>
    </div>
  );
};

const AdminPanel: React.FC<{
  products: Product[];
  departments: Department[];
  config: Config;
  onUpdateConfig: (c: Config) => void;
  onUpdateProducts: (p: Product[]) => void;
  onUpdateDepts: (d: Department[]) => void;
  onLogout: () => void;
}> = ({ products, departments, config, onUpdateConfig, onUpdateProducts, onUpdateDepts, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'ventas' | 'productos' | 'depts' | 'config'>('ventas');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const handleDeleteDept = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este departamento? Se eliminarán también los productos asociados.")) {
      const deptToDelete = departments.find(d => d.id === id);
      onUpdateDepts(departments.filter(d => d.id !== id));
      if (deptToDelete) {
        onUpdateProducts(products.filter(p => p.departamento !== deptToDelete.slug));
      }
    }
  };

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto pb-32">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black">Super Administrador</h2>
          <Badge variant="warning">JJTOVAR1006</Badge>
        </div>
        <button onClick={onLogout} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><LogOut size={20} /></button>
      </header>

      <div className="flex gap-4 mb-8 overflow-x-auto hide-scrollbar">
        {[
          { id: 'ventas', label: 'Ventas', icon: <TrendingUp size={16} /> },
          { id: 'productos', label: 'Productos', icon: <Package size={16} /> },
          { id: 'depts', label: 'Departamentos', icon: <Settings size={16} /> },
          { id: 'config', label: 'Configuración', icon: <Edit3 size={16} /> }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'bg-white border border-primary/5 text-primary/40'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'config' && (
        <div className="glassmorphism p-8 rounded-[2.5rem] space-y-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <ImageUploader 
                label="Identidad de Marca (Logo)"
                currentUrl={config.logo_url}
                onUpload={(url) => onUpdateConfig({...config, logo_url: url})}
              />
              
              <div className="space-y-2">
                <label className="text-xs font-black text-primary/30 uppercase">Slogan de la Marca</label>
                <input className="w-full bg-offwhite p-4 rounded-xl border border-primary/5 outline-none focus:ring-2 ring-accent/10" value={config.slogan} onChange={e => onUpdateConfig({...config, slogan: e.target.value})} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-primary/30 uppercase">Cintillo Promocional</label>
                <input className="w-full bg-offwhite p-4 rounded-xl border border-primary/5 outline-none focus:ring-2 ring-accent/10" value={config.cintillo_promocional} onChange={e => onUpdateConfig({...config, cintillo_promocional: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-primary/30 uppercase">Tasa de Cambio (BS)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary/20">Bs.</span>
                  <input type="number" className="w-full bg-offwhite p-4 pl-12 rounded-xl border border-primary/5 outline-none focus:ring-2 ring-accent/10" value={config.tasa_cambio} onChange={e => onUpdateConfig({...config, tasa_cambio: parseFloat(e.target.value)})} />
                </div>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-green-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-100"><Save size={18} /> Guardar Configuración</button>
        </div>
      )}

      {activeTab === 'productos' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black">Catálogo de Productos</h3>
            <button onClick={() => setEditingProduct({ id: Date.now().toString(), nombre: '', descripcion: '', precio: 0, stock: 0, imagen_url: '', categoria: '', departamento: (departments[0]?.slug || 'carnes') as any, unidad: 'kg', peso_referencial: false, disponible: true, destacado: false })} className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-md"><Plus size={18} /> Nuevo Producto</button>
          </div>
          <div className="glassmorphism rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-primary/5"><tr className="text-[10px] uppercase font-black text-primary/30 tracking-widest"><th className="p-4">Producto</th><th>Depto.</th><th>Precio</th><th>Stock</th><th className="p-4 text-center">Acciones</th></tr></thead>
                <tbody className="divide-y divide-primary/5">
                  {products.map(p => (
                    <tr key={p.id} className="text-sm font-medium hover:bg-white/50 transition-colors">
                      <td className="p-4 flex items-center gap-3"><img src={p.imagen_url} className="w-10 h-10 rounded-xl object-cover shadow-sm" /> {p.nombre}</td>
                      <td><Badge>{p.departamento.toUpperCase()}</Badge></td>
                      <td className="font-bold">${p.precio.toFixed(2)}</td>
                      <td>{p.stock}</td>
                      <td className="p-4 flex justify-center gap-2">
                        <button onClick={() => setEditingProduct(p)} className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-all"><Edit3 size={16} /></button>
                        <button onClick={() => onUpdateProducts(products.filter(x => x.id !== p.id))} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'depts' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black">Departamentos y WhatsApp</h3>
            <button onClick={() => setEditingDept({ id: Date.now().toString(), nombre: '', slug: '' as any, telefono_whatsapp: '', activo: true, color_hex: '#3d4a3e' })} className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-md"><Plus size={18} /> Nuevo Departamento</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map(d => (
              <div key={d.id} className="glassmorphism p-6 rounded-[2rem] border-t-8 shadow-sm relative group" style={{ borderTopColor: d.color_hex }}>
                <div className="flex justify-between items-start mb-4">
                   <h3 className="font-bold text-lg">{d.nombre}</h3>
                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => setEditingDept(d)} className="p-2 text-accent bg-white rounded-lg shadow-sm border border-primary/5 hover:bg-accent hover:text-white"><Edit3 size={14} /></button>
                     <button onClick={() => handleDeleteDept(d.id)} className="p-2 text-red-400 bg-white rounded-lg shadow-sm border border-primary/5 hover:bg-red-500 hover:text-white"><Trash2 size={14} /></button>
                   </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-primary/30 font-black uppercase">SLUG ÚNICO:</span>
                    <span className="font-bold bg-primary/5 px-2 py-0.5 rounded text-primary/60">{d.slug}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-primary/30 font-black uppercase text-[10px]">WhatsApp:</span>
                    <span className="font-bold text-green-600">+{d.telefono_whatsapp}</span>
                  </div>
                  <div className="h-px bg-primary/5 my-2"></div>
                  <div className="text-[10px] font-bold text-primary/20 text-center uppercase tracking-widest">
                    {products.filter(p => p.departamento === d.slug).length} productos vinculados
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Editor Producto */}
      {editingProduct && (
        <div className="fixed inset-0 z-[100] bg-primary/40 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-3xl font-black">Editor de Producto</h3>
               <button onClick={() => setEditingProduct(null)} className="p-3 hover:bg-red-50 text-red-400 rounded-full transition-all"><X size={24} /></button>
             </div>
             <div className="grid grid-cols-2 gap-6 mb-8">
               <div className="col-span-2">
                 <ImageUploader 
                  label="Imagen del Producto"
                  currentUrl={editingProduct.imagen_url}
                  onUpload={(url) => setEditingProduct({...editingProduct, imagen_url: url})}
                 />
               </div>
               <div className="col-span-2 space-y-1">
                 <label className="text-[10px] font-black text-primary/30 uppercase ml-2">Nombre Comercial</label>
                 <input placeholder="Ej: Punta Trasera Importada" className="w-full bg-offwhite p-4 rounded-2xl outline-none border border-primary/5 focus:ring-2 ring-accent/10" value={editingProduct.nombre} onChange={e => setEditingProduct({...editingProduct, nombre: e.target.value})} />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-primary/30 uppercase ml-2">Precio de Venta ($)</label>
                 <input placeholder="0.00" type="number" className="w-full bg-offwhite p-4 rounded-2xl outline-none border border-primary/5 focus:ring-2 ring-accent/10" value={editingProduct.precio} onChange={e => setEditingProduct({...editingProduct, precio: parseFloat(e.target.value)})} />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-primary/30 uppercase ml-2">Stock Disponible</label>
                 <input placeholder="Cantidad" type="number" className="w-full bg-offwhite p-4 rounded-2xl outline-none border border-primary/5 focus:ring-2 ring-accent/10" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})} />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-primary/30 uppercase ml-2">Departamento Destino</label>
                 <select className="w-full bg-offwhite p-4 rounded-2xl outline-none border border-primary/5 focus:ring-2 ring-accent/10" value={editingProduct.departamento} onChange={e => setEditingProduct({...editingProduct, departamento: e.target.value as any})}>
                    {departments.map(d => <option key={d.id} value={d.slug}>{d.nombre}</option>)}
                 </select>
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-primary/30 uppercase ml-2">Unidad de Medida</label>
                 <select className="w-full bg-offwhite p-4 rounded-2xl outline-none border border-primary/5 focus:ring-2 ring-accent/10" value={editingProduct.unidad} onChange={e => setEditingProduct({...editingProduct, unidad: e.target.value as any})}>
                    <option value="kg">Por Kilogramo (KG)</option>
                    <option value="und">Por Unidad (UND)</option>
                 </select>
               </div>
               <div className="col-span-2 space-y-1">
                 <label className="text-[10px] font-black text-primary/30 uppercase ml-2">Descripción Corta</label>
                 <textarea placeholder="Detalles del producto..." className="w-full bg-offwhite p-4 rounded-2xl outline-none border border-primary/5 focus:ring-2 ring-accent/10 h-24 resize-none" value={editingProduct.descripcion} onChange={e => setEditingProduct({...editingProduct, descripcion: e.target.value})} />
               </div>
             </div>
             <button onClick={() => {
                if (!editingProduct.nombre) return alert("Ingresa un nombre");
                const exists = products.find(x => x.id === editingProduct.id);
                if (exists) onUpdateProducts(products.map(x => x.id === editingProduct.id ? editingProduct : x));
                else onUpdateProducts([...products, editingProduct]);
                setEditingProduct(null);
             }} className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-primary/20 hover:bg-accent transition-all">Sincronizar Inventario</button>
          </div>
        </div>
      )}

      {/* Modal Editor Departamento */}
      {editingDept && (
        <div className="fixed inset-0 z-[100] bg-primary/40 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in slide-in-from-bottom-5">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black">Gestionar Departamento</h3>
               <button onClick={() => setEditingDept(null)} className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-all"><X size={20} /></button>
             </div>
             <div className="space-y-5 mb-8">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-primary/30 uppercase ml-2">Nombre del Departamento</label>
                  <input placeholder="Ej: Pescadería" className="w-full bg-offwhite p-4 rounded-2xl outline-none border border-primary/5 focus:ring-2 ring-accent/10" value={editingDept.nombre} onChange={e => setEditingDept({...editingDept, nombre: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-primary/30 uppercase ml-2">Slug Único (Sin espacios ni acentos)</label>
                  <input placeholder="pescaderia" className="w-full bg-offwhite p-4 rounded-2xl outline-none border border-primary/5 focus:ring-2 ring-accent/10" value={editingDept.slug} onChange={e => setEditingDept({...editingDept, slug: e.target.value.toLowerCase().trim().replace(/\s+/g, '-') as any})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-primary/30 uppercase ml-2">WhatsApp (Código + Número)</label>
                  <input placeholder="584241234567" className="w-full bg-offwhite p-4 rounded-2xl outline-none border border-primary/5 focus:ring-2 ring-accent/10" value={editingDept.telefono_whatsapp} onChange={e => setEditingDept({...editingDept, telefono_whatsapp: e.target.value.replace(/\D/g, '')})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary/30 uppercase ml-2">Color de Identidad</label>
                  <div className="flex items-center gap-6 bg-offwhite p-3 rounded-2xl border border-primary/5">
                    <input type="color" className="w-14 h-14 rounded-xl border-none cursor-pointer bg-transparent" value={editingDept.color_hex} onChange={e => setEditingDept({...editingDept, color_hex: e.target.value})} />
                    <span className="font-black text-primary/40 text-sm uppercase">{editingDept.color_hex}</span>
                  </div>
                </div>
             </div>
             <button onClick={() => {
                if (!editingDept.nombre || !editingDept.slug) return alert("Completa nombre y slug");
                const exists = departments.find(x => x.id === editingDept.id);
                if (exists) onUpdateDepts(departments.map(x => x.id === editingDept.id ? editingDept : x));
                else onUpdateDepts([...departments, editingDept]);
                setEditingDept(null);
             }} className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-primary/10 hover:bg-accent transition-all">Confirmar Departamento</button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- App Principal ---

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [config, setConfig] = useState<Config>(CONFIG_STUB);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [view, setView] = useState<'home' | 'cart' | 'checkout' | 'success' | 'admin' | 'login'>('home');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });

  // Lógica de Departamento Único
  const addToCart = (p: Product) => {
    if (cart.length > 0 && cart[0].departamento !== p.departamento) {
      alert("⚠️ Carrito ocupado. Termina esta compra para ir a otro departamento. JX4 Paracotos gestiona entregas separadas para garantizar frescura.");
      return;
    }
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? {...i, quantity: i.quantity + 1} : i);
      return [...prev, {...p, quantity: 1}];
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.user === 'jjtovar1006' && loginForm.pass === 'Apamate.25') {
      setIsAuth(true);
      setView('admin');
    } else {
      alert("⚠️ Acceso denegado. Credenciales incorrectas.");
    }
  };

  const finalizeOrder = (order: Order) => {
    setCurrentOrder(order);
    setCart([]);
    setView('success');
    
    const deptInfo = departments.find(d => d.slug === order.departamento);
    const text = `*PEDIDO JX4 PARACOTOS*\n` +
                 `ID: ${order.order_id}\n` +
                 `Cliente: ${order.nombre_cliente}\n` +
                 `Logística: ${order.metodo_entrega.toUpperCase()}${order.tipo_transporte ? ` (${order.tipo_transporte.toUpperCase()})` : ''}\n` +
                 `Pago: ${order.metodo_pago.toUpperCase()}\n` +
                 `----------------\n` +
                 order.productos.map(p => `• ${p.nombre} x${p.quantity} (${p.unidad})`).join('\n') +
                 `\n----------------\n` +
                 `TOTAL: $${order.total.toFixed(2)} / Bs. ${order.total_bs.toFixed(2)}\n\n` +
                 `DIRECCIÓN: ${order.direccion}`;

    const waUrl = `https://wa.me/${deptInfo?.telefono_whatsapp || config.whatsapp_general}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const totalCart = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <HashRouter>
      <div className="min-h-screen bg-offwhite">
        
        <main className="max-w-7xl mx-auto">
          {view === 'home' && <HomeView products={products} departments={departments} onAddToCart={addToCart} config={config} />}
          
          {view === 'cart' && (
            <div className="px-6 py-10 max-w-xl mx-auto pb-32">
              <h2 className="text-4xl font-black mb-8 text-primary">Resumen de Compra</h2>
              {cart.length === 0 ? (
                <div className="text-center py-20 bg-white/50 rounded-[3rem] border border-primary/5">
                  <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary/10"><ShoppingBag size={48} /></div>
                  <h3 className="text-xl font-black mb-2">Tu bolsa está vacía</h3>
                  <button onClick={() => setView('home')} className="mt-4 bg-primary text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-primary/10 hover:bg-accent transition-all">Explorar Tienda</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6 bg-accent/5 p-4 rounded-3xl border border-accent/10">
                    <AlertCircle className="text-accent" size={20} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-accent/80">Estás comprando exclusivamente en: {cart[0].departamento}</p>
                  </div>
                  {cart.map(i => (
                    <div key={i.id} className="glassmorphism p-5 rounded-[2rem] flex items-center gap-5 shadow-sm border border-white">
                      <img src={i.imagen_url} className="w-20 h-20 rounded-2xl object-cover shadow-sm" />
                      <div className="flex-1">
                        <h4 className="font-bold text-primary leading-tight">{i.nombre}</h4>
                        <p className="text-xs text-primary/30 font-bold mt-1">${i.precio.toFixed(2)} / {i.unidad}</p>
                      </div>
                      <div className="flex flex-col items-center gap-1 bg-offwhite p-1 rounded-2xl border border-primary/5">
                        <button onClick={() => setCart(cart.map(x => x.id === i.id ? {...x, quantity: x.quantity + 1} : x))} className="p-1 hover:text-accent transition-colors"><Plus size={16} /></button>
                        <span className="font-black text-sm w-6 text-center">{i.quantity}</span>
                        <button onClick={() => setCart(cart.map(x => x.id === i.id ? {...x, quantity: Math.max(1, x.quantity - 1)} : x))} className="p-1 hover:text-accent transition-colors"><Minus size={16} /></button>
                      </div>
                      <button onClick={() => setCart(cart.filter(x => x.id !== i.id))} className="text-red-300 hover:text-red-500 transition-colors p-3"><Trash2 size={22} /></button>
                    </div>
                  ))}
                  <div className="p-10 glassmorphism rounded-[3rem] mt-10 shadow-2xl border border-white">
                    <div className="space-y-4 mb-10">
                      <div className="flex justify-between items-center text-primary/40 font-bold uppercase text-[10px] tracking-widest"><span>Subtotal Estimado</span> <span>${cart.reduce((a,b) => a+(b.precio*b.quantity), 0).toFixed(2)}</span></div>
                      <div className="flex justify-between items-center font-black text-4xl text-primary tracking-tighter"><span>Total</span> <span>${cart.reduce((a,b) => a+(b.precio*b.quantity), 0).toFixed(2)}</span></div>
                      <div className="text-right text-sm font-bold text-accent">~ BS {(cart.reduce((a,b) => a+(b.precio*b.quantity), 0) * config.tasa_cambio).toFixed(2)}</div>
                    </div>
                    <button onClick={() => setView('checkout')} className="w-full bg-primary text-white py-6 rounded-[1.5rem] font-black text-xl shadow-2xl shadow-primary/20 hover:bg-accent transition-all flex items-center justify-center gap-4 active:scale-95">
                      Confirmar Compra <ArrowRight size={28} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {view === 'checkout' && <CheckoutView cart={cart} config={config} departments={departments} onComplete={finalizeOrder} />}
          
          {view === 'success' && currentOrder && (
            <div className="flex flex-col items-center justify-center py-32 px-6 text-center animate-in zoom-in-95">
               <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center mb-10 shadow-inner border border-green-100"><CheckCircle2 size={80} className="text-green-500" /></div>
               <h2 className="text-5xl font-black mb-6 tracking-tighter text-primary">¡Pedido Exitoso!</h2>
               <p className="text-primary/50 mb-12 max-w-sm text-lg font-medium leading-relaxed">Tu orden <strong>{currentOrder.order_id}</strong> se ha generado correctamente. Envía el comprobante vía WhatsApp ahora.</p>
               <button onClick={() => setView('home')} className="bg-primary text-white px-16 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-primary/10 hover:scale-105 transition-all">Volver a Inicio</button>
            </div>
          )}

          {view === 'login' && !isAuth && (
            <div className="min-h-[85vh] flex items-center justify-center p-6">
              <form onSubmit={handleLogin} className="glassmorphism p-12 rounded-[3.5rem] w-full max-w-md space-y-8 shadow-2xl border border-white animate-in slide-in-from-bottom-12">
                <div className="text-center">
                  <div className="bg-primary w-16 h-16 rounded-[1.5rem] mx-auto flex items-center justify-center text-white mb-6 shadow-xl shadow-primary/20"><LogIn size={32} /></div>
                  <h2 className="text-3xl font-black text-primary">Super Admin</h2>
                  <p className="text-[10px] font-black text-primary/20 uppercase tracking-[0.2em] mt-2">Autenticación de Seguridad</p>
                </div>
                <div className="space-y-4">
                  <input required placeholder="Usuario Administrador" className="w-full bg-offwhite p-5 rounded-2xl outline-none border border-primary/5 focus:ring-4 ring-accent/5 font-bold text-primary" value={loginForm.user} onChange={e => setLoginForm({...loginForm, user: e.target.value})} />
                  <input required type="password" placeholder="Contraseña Maestra" className="w-full bg-offwhite p-5 rounded-2xl outline-none border border-primary/5 focus:ring-4 ring-accent/5 font-bold text-primary" value={loginForm.pass} onChange={e => setLoginForm({...loginForm, pass: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-black text-lg shadow-2xl shadow-primary/20 hover:bg-accent transition-all active:scale-95">Desbloquear Panel</button>
              </form>
            </div>
          )}

          {view === 'admin' && isAuth && (
            <AdminPanel 
              products={products} departments={departments} config={config} 
              onUpdateConfig={setConfig} onUpdateProducts={setProducts} onUpdateDepts={setDepartments}
              onLogout={() => { setIsAuth(false); setView('home'); }}
            />
          )}
        </main>

        <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[85%] max-w-md glassmorphism rounded-[2.5rem] px-10 py-6 flex items-center justify-between shadow-[0_25px_50px_-12px_rgba(0,0,0,0.2)] z-50 border border-white/40">
          <button onClick={() => setView('home')} className={`p-2 transition-all duration-500 ${view === 'home' ? 'text-accent scale-150 rotate-0' : 'text-primary/30 hover:text-primary scale-100'}`}><TrendingUp size={24} /></button>
          <button onClick={() => setView('cart')} className={`p-2 relative transition-all duration-500 ${view === 'cart' ? 'text-accent scale-150' : 'text-primary/30 hover:text-primary scale-100'}`}>
            <ShoppingBag size={24} />
            {totalCart > 0 && <span className="absolute -top-2 -right-2 bg-accent text-white text-[9px] font-black w-6 h-6 flex items-center justify-center rounded-full border-[3px] border-white shadow-lg animate-bounce">{totalCart}</span>}
          </button>
          <button onClick={() => isAuth ? setView('admin') : setView('login')} className={`p-2 transition-all duration-500 ${view === 'admin' || view === 'login' ? 'text-accent scale-150' : 'text-primary/30 hover:text-primary scale-100'}`}><LayoutDashboard size={24} /></button>
        </nav>
      </div>
    </HashRouter>
  );
};

export default App;
