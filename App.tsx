
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HashRouter } from 'react-router-dom';
import { 
  ShoppingBag, Plus, Minus, Trash2, ArrowRight, CheckCircle2, 
  Search, Package, Settings, Upload, LogIn, LogOut,
  Save, X, Edit3, Loader2, RefreshCcw, 
  ShieldAlert, Users, Lock, UserPlus, Home, MessageCircle, Sparkles, 
  AlertCircle, Scale, ShieldCheck, FileText, Info, Wand2, Truck, User, Car, ChevronLeft
} from 'lucide-react';

import { Product, CartItem, DepartmentSlug, Order, Config, Department, UnidadMedida, AdminUser } from './types';
import { db, uploadImage } from './services/supabaseService';
import { generateProductDescription, getCookingTip } from './services/geminiService';

const CONFIG_STUB: Config = {
  tasa_cambio: 36.5,
  cintillo_promocional: '¡Bienvenidos a JX4 Paracotos!',
  slogan: 'Calidad y Frescura en tu Mesa',
  logo_url: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
  whatsapp_general: '584241112233'
};

const UNIDADES: { value: UnidadMedida; label: string }[] = [
  { value: 'und', label: 'Unidad' },
  { value: 'kg', label: 'Kilogramo (Kg)' },
  { value: 'gr', label: 'Gramos (gr)' },
  { value: 'caja', label: 'Caja' },
  { value: 'paquete', label: 'Paquete' },
  { value: 'bulto', label: 'Bulto' },
  { value: 'saco', label: 'Saco' },
  { value: 'metro', label: 'Metro' },
  { value: 'litro', label: 'Litro' },
  { value: 'docena', label: 'Docena' },
  { value: 'viaje' as any, label: 'Por Viaje' },
];

const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'error' | 'info' | 'primary' }> = ({ children, variant = 'primary' }) => {
  const styles = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-amber-100 text-amber-700 border-green-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
  };
  return <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase ${styles[variant]}`}>{children}</span>;
};

const PoliciesView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="px-6 py-10 max-w-3xl mx-auto animate-fade-in pb-40">
      <button onClick={onBack} className="flex items-center gap-2 text-primary/40 font-bold mb-8 hover:text-primary transition-colors">
        <ArrowRight className="rotate-180" size={18} /> Volver
      </button>
      
      <div className="text-center mb-12">
        <Scale className="mx-auto text-accent mb-4" size={48} />
        <h2 className="text-4xl font-black text-primary tracking-tighter">Políticas y Condiciones</h2>
        <p className="text-primary/50 font-medium">JX4 Paracotos Online • Marco Legal Venezuela</p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-primary/80">
        <section className="glassmorphism p-8 rounded-[2.5rem] border border-white shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <Info className="text-accent" size={24} />
            <h3 className="text-xl font-black">1. Términos de Uso</h3>
          </div>
          <div className="space-y-4">
            <p><strong>Naturaleza del Servicio:</strong> JX4 Paracotos Online es estrictamente un Catálogo Digital Informativo.</p>
            <div className="bg-amber-50 border-l-4 border-accent p-4 rounded-r-xl italic text-accent-dark font-medium">
              Importante: No somos una plataforma de venta, ni procesamos pagos, ni gestionamos envíos.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
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
            <span className="text-[10px] font-black uppercase text-accent">Subiendo...</span>
          </div>
        ) : currentUrl ? (
          <img src={currentUrl} className="w-full h-full object-cover" alt="Preview" />
        ) : (
          <div className="flex flex-col items-center text-primary/20">
            <Upload size={32} />
            <span className="text-[10px] font-black uppercase mt-2">Seleccionar</span>
          </div>
        )}
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      </div>
    </div>
  );
};

const AdminPanel: React.FC<{
  currentUser: AdminUser;
  products: Product[];
  departments: Department[];
  config: Config;
  onRefresh: () => void;
  onLogout: () => void;
}> = ({ currentUser, products, departments, config, onRefresh, onLogout }) => {
  const isSuper = currentUser.role === 'super';
  const myDeptSlugs = currentUser.dept_slugs || [];

  const [activeTab, setActiveTab] = useState<'ventas' | 'productos' | 'depts' | 'config' | 'users'>('ventas');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingDept, setEditingDept] = useState<Partial<Department> | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<Partial<AdminUser> | null>(null);
  const [localConfig, setLocalConfig] = useState<Config>(config);
  const [saving, setSaving] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);

  const fetchOrders = async () => {
    try {
      const data = await db.getOrders(isSuper ? undefined : myDeptSlugs);
      setOrders(data);
    } catch (e: any) { alert("Error al cargar pedidos."); }
  };

  const fetchAdmins = async () => {
    if (!isSuper) return;
    try {
      const data = await db.getAdmins();
      setAdmins(data);
    } catch (e: any) { alert("Error al cargar usuarios."); }
  };

  useEffect(() => {
    if (activeTab === 'ventas') fetchOrders();
    if (activeTab === 'users') fetchAdmins();
  }, [activeTab]);

  const handleGenerateDescription = async () => {
    if (!editingProduct?.nombre) return alert("Nombre obligatorio.");
    setGeneratingAI(true);
    try {
      const desc = await generateProductDescription(editingProduct.nombre, editingProduct.departamento || 'general');
      setEditingProduct({ ...editingProduct, descripcion: desc });
    } catch (e) { console.error(e); }
    finally { setGeneratingAI(false); }
  };

  const handleSaveProduct = async () => {
    setSaving(true);
    try {
      const payload = { ...editingProduct };
      if (!isSuper && (!payload.departamento || !myDeptSlugs.includes(payload.departamento))) {
        payload.departamento = myDeptSlugs[0];
      }
      await db.upsertProduct(payload);
      setEditingProduct(null);
      onRefresh();
    } catch (e: any) { alert("Error al guardar."); }
    finally { setSaving(false); }
  };

  const handleSaveAdmin = async () => {
    setSaving(true);
    try {
      await db.upsertAdmin(editingAdmin);
      setEditingAdmin(null);
      fetchAdmins();
    } catch (e: any) { alert("Error al guardar admin."); }
    finally { setSaving(false); }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await db.updateConfig(localConfig);
      onRefresh();
      alert("Configuración actualizada.");
    } catch (e: any) { alert("Error al guardar config."); }
    finally { setSaving(false); }
  };

  const filteredProducts = isSuper ? products : products.filter(p => myDeptSlugs.includes(p.departamento));

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto pb-32 animate-fade-in">
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
           <div className={`p-4 rounded-2xl ${isSuper ? 'bg-accent' : 'bg-primary'} text-white shadow-xl`}>
             {isSuper ? <ShieldAlert size={32} /> : <Lock size={32} />}
           </div>
           <div>
            <h2 className="text-3xl font-black text-primary">Gestión Admin</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={isSuper ? "warning" : "info"}>{isSuper ? "Súper" : "Admin"}</Badge>
              <span className="text-[10px] font-black text-primary/30 uppercase">@{currentUser.username}</span>
            </div>
           </div>
        </div>
        <div className="flex gap-2">
           <button onClick={onRefresh} className="p-3 bg-white border border-primary/5 text-primary rounded-xl hover:bg-accent hover:text-white transition-all"><RefreshCcw size={20} /></button>
           <button onClick={onLogout} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><LogOut size={20} /></button>
        </div>
      </header>

      <div className="flex gap-4 mb-8 overflow-x-auto hide-scrollbar">
        <button onClick={() => setActiveTab('ventas')} className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'ventas' ? 'bg-primary text-white shadow-lg' : 'bg-white border border-primary/5 text-primary/40'}`}>Ventas</button>
        <button onClick={() => setActiveTab('productos')} className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'productos' ? 'bg-primary text-white shadow-lg' : 'bg-white border border-primary/5 text-primary/40'}`}>Productos</button>
        {isSuper && (
          <>
            <button onClick={() => setActiveTab('depts')} className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'depts' ? 'bg-primary text-white shadow-lg' : 'bg-white border border-primary/5 text-primary/40'}`}>Deptos</button>
            <button onClick={() => setActiveTab('config')} className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'config' ? 'bg-primary text-white shadow-lg' : 'bg-white border border-primary/5 text-primary/40'}`}>Config</button>
            <button onClick={() => setActiveTab('users')} className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-primary text-white shadow-lg' : 'bg-white border border-primary/5 text-primary/40'}`}>Usuarios</button>
          </>
        )}
      </div>

      {activeTab === 'ventas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map(o => (
            <div key={o.id} className="glassmorphism p-5 rounded-[2rem] shadow-sm border border-white flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black text-primary/20 uppercase">#{o.order_id}</span>
                <Badge variant="success">${Number(o.total).toFixed(2)}</Badge>
              </div>
              <h4 className="font-bold text-lg">{o.nombre_cliente}</h4>
              <button 
                onClick={() => {
                  const phone = o.telefono_cliente.replace(/\D/g, '');
                  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(`Hola ${o.nombre_cliente}, te contacto de JX4 Paracotos.`)}`, '_blank');
                }}
                className="w-full mt-4 py-3 bg-green-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} /> WhatsApp
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'productos' && (
        <div className="space-y-6">
          <button onClick={() => setEditingProduct({ nombre: '', descripcion: '', precio: 0, stock: 0, departamento: isSuper ? 'carnes' : myDeptSlugs[0], unidad: 'kg', disponible: true })} className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg"><Plus size={18} /> Nuevo Registro</button>
          <div className="glassmorphism rounded-[2.5rem] overflow-hidden shadow-sm border border-white overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-primary/5 text-[10px] uppercase font-black text-primary/30"><tr className="p-4"><th></th><th className="p-4">Nombre</th><th>Depto</th><th>Precio</th><th className="p-4 text-center">Acciones</th></tr></thead>
              <tbody className="divide-y divide-primary/5">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="text-sm font-medium">
                    <td className="p-4"><img src={p.imagen_url} className="w-10 h-10 rounded-lg object-cover bg-white" /></td>
                    <td className="font-black">{p.nombre}</td>
                    <td><Badge>{p.departamento}</Badge></td>
                    <td className="font-bold">${Number(p.precio).toFixed(2)}</td>
                    <td className="p-4 flex justify-center gap-2">
                      <button onClick={() => setEditingProduct(p)} className="p-2 text-accent bg-white rounded-lg shadow-sm"><Edit3 size={16} /></button>
                      <button onClick={async () => { if(confirm("¿Eliminar?")){ await db.deleteProduct(p.id!); onRefresh(); } }} className="p-2 text-red-400 bg-white rounded-lg shadow-sm"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 z-[100] bg-primary/40 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-3xl font-black text-primary">Editor</h3>
               <button onClick={() => setEditingProduct(null)}><X /></button>
             </div>
             <div className="space-y-6">
               <ImageUploader label="Imagen" currentUrl={editingProduct.imagen_url || ''} onUpload={(url) => setEditingProduct({...editingProduct, imagen_url: url})} />
               <input placeholder="Nombre" className="w-full bg-offwhite p-4 rounded-2xl font-bold outline-none" value={editingProduct.nombre} onChange={e => setEditingProduct({...editingProduct, nombre: e.target.value})} />
               <textarea placeholder="Descripción" className="w-full bg-offwhite p-4 rounded-2xl font-bold h-24 outline-none" value={editingProduct.descripcion} onChange={e => setEditingProduct({...editingProduct, descripcion: e.target.value})} />
               <div className="grid grid-cols-2 gap-4">
                 <input type="number" step="0.01" className="w-full bg-offwhite p-4 rounded-xl font-bold outline-none" value={editingProduct.precio} onChange={e => setEditingProduct({...editingProduct, precio: parseFloat(e.target.value)})} />
                 <select className="w-full bg-offwhite p-4 rounded-xl font-bold outline-none" value={editingProduct.departamento} onChange={e => setEditingProduct({...editingProduct, departamento: e.target.value as any})}>
                   {departments.filter(d => isSuper || myDeptSlugs.includes(d.slug)).map(d => <option key={d.id} value={d.slug}>{d.nombre}</option>)}
                 </select>
               </div>
               <button onClick={handleSaveProduct} disabled={saving} className="w-full bg-primary text-white py-5 rounded-2xl font-black shadow-xl">
                 {saving ? <Loader2 className="animate-spin mx-auto" /> : "Guardar Registro"}
               </button>
             </div>
          </div>
        </div>
      )}

      {isSuper && activeTab === 'config' && (
        <div className="glassmorphism p-8 rounded-[2.5rem] space-y-6 shadow-sm border border-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <input className="w-full bg-white p-4 rounded-xl border border-primary/5 font-bold outline-none" value={localConfig.slogan} onChange={e => setLocalConfig({...localConfig, slogan: e.target.value})} placeholder="Slogan" />
            <input type="number" step="0.01" className="w-full bg-white p-4 rounded-xl border border-primary/5 font-black text-accent outline-none" value={localConfig.tasa_cambio} onChange={e => setLocalConfig({...localConfig, tasa_cambio: parseFloat(e.target.value)})} placeholder="Tasa BCV" />
          </div>
          <button onClick={handleSaveConfig} disabled={saving} className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg">
            {saving ? <Loader2 className="animate-spin mx-auto" /> : "Guardar Configuración"}
          </button>
        </div>
      )}
    </div>
  );
};

const ProductCard: React.FC<{ product: Product; tasa: number; onAdd: (p: Product) => void }> = ({ product, tasa, onAdd }) => {
  const [tip, setTip] = useState<string | null>(null);
  const [loadingTip, setLoadingTip] = useState(false);

  const fetchTip = async () => {
    if (tip) return setTip(null);
    setLoadingTip(true);
    try {
      const result = await getCookingTip(product.nombre);
      setTip(result);
    } catch (e) { setTip("Mantener fresco."); }
    finally { setLoadingTip(false); }
  };

  const isTransport = product.departamento === 'transporte';

  return (
    <div className={`glassmorphism rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-sm border border-white flex flex-col h-full ${isTransport ? 'border-accent/40' : ''}`}>
      <div className="aspect-square relative overflow-hidden bg-white shrink-0">
        <img src={product.imagen_url} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
            <Badge variant={isTransport ? "warning" : "primary"}>{product.unidad}</Badge>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1 gap-2">
          <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
            {isTransport && <Truck size={16} className="text-accent" />}
            {product.nombre}
          </h3>
          {!isTransport && (
            <button onClick={fetchTip} className="p-1.5 rounded-full bg-accent/10 text-accent">
              {loadingTip ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
            </button>
          )}
        </div>
        
        {tip && <div className="mb-3 p-3 bg-accent/5 rounded-xl text-[11px] font-medium text-primary/70 italic leading-snug">"{tip}"</div>}
        <p className="text-xs text-primary/50 mb-4 line-clamp-2 min-h-[2.5rem] flex-grow">{product.descripcion}</p>
        
        <div className="flex justify-between items-center mt-auto">
          <div>
            <div className="text-xl font-black text-primary">${Number(product.precio).toFixed(2)}</div>
            <div className="text-[10px] font-bold text-primary/30">Bs. {(Number(product.precio) * tasa).toFixed(2)}</div>
          </div>
          {!isTransport && (
            <button onClick={() => onAdd(product)} className="bg-primary text-white p-3 rounded-2xl shadow-lg active:scale-95">
                <Plus size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const TransportView: React.FC<{ products: Product[]; config: Config; onBack: () => void }> = ({ products, config, onBack }) => {
  const [category, setCategory] = useState<'all' | string>('all');
  const transportItems = products.filter(p => p.departamento === 'transporte' && p.disponible);
  const categories = Array.from(new Set(transportItems.map(p => p.categoria).filter(Boolean)));
  const filtered = transportItems.filter(p => category === 'all' || p.categoria === category);

  return (
    <div className="px-6 py-10 animate-fade-in pb-40 max-w-7xl mx-auto">
       <button onClick={onBack} className="flex items-center gap-2 text-primary/40 font-bold mb-8 hover:text-primary transition-colors"><ChevronLeft size={20} /> Volver</button>
       <div className="text-center mb-10">
         <div className="bg-accent/10 w-20 h-20 rounded-[2rem] mx-auto flex items-center justify-center text-accent mb-4"><Truck size={40} /></div>
         <h2 className="text-4xl font-black text-primary tracking-tighter">Transporte</h2>
       </div>
       <div className="flex gap-3 mb-8 overflow-x-auto hide-scrollbar justify-center">
         <button onClick={() => setCategory('all')} className={`px-6 py-3 rounded-2xl font-bold text-xs transition-all uppercase ${category === 'all' ? 'bg-accent text-white shadow-lg' : 'bg-white text-primary/40 border'}`}>Todos</button>
         {categories.map(cat => (
           <button key={cat} onClick={() => setCategory(cat)} className={`px-6 py-3 rounded-2xl font-bold text-xs transition-all uppercase ${category === cat ? 'bg-accent text-white shadow-lg' : 'bg-white text-primary/40 border'}`}>{cat}</button>
         ))}
       </div>
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map(p => <ProductCard key={p.id} product={p} tasa={config.tasa_cambio} onAdd={() => {}} />)}
      </div>
    </div>
  );
};

const HomeView: React.FC<{ products: Product[]; departments: Department[]; onAddToCart: (p: Product) => void; config: Config }> = ({ products, departments, onAddToCart, config }) => {
  const [selectedDept, setSelectedDept] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const visibleDepartments = departments.filter(d => d.slug !== 'transporte');
  const filtered = useMemo(() => {
    return products.filter(p => p.departamento !== 'transporte' && (selectedDept === 'all' || p.departamento === selectedDept) && p.nombre.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [products, selectedDept, searchQuery]);

  return (
    <div className="pb-32 animate-fade-in">
      <div className="bg-primary text-white py-2 px-4 text-center">
        <p className="text-xs font-bold animate-pulse">{config.cintillo_promocional}</p>
      </div>
      <header className="px-6 pt-10 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={config.logo_url} alt="Logo" className="w-14 h-14 object-contain rounded-xl shadow-sm bg-white" />
          <div><h1 className="text-3xl font-black text-primary tracking-tight">JX4 Paracotos</h1><p className="text-primary/60 text-sm font-medium">{config.slogan}</p></div>
        </div>
      </header>
      <div className="px-6 mb-6 relative">
        <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-primary/30" size={18} />
        <input type="text" placeholder="¿Qué necesitas hoy?" className="w-full bg-white border rounded-2xl py-4 pl-12 pr-4 focus:border-accent outline-none transition-all shadow-sm" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      </div>
      <div className="px-6 mb-8 overflow-x-auto hide-scrollbar flex gap-3">
        <button onClick={() => setSelectedDept('all')} className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${selectedDept === 'all' ? 'bg-primary text-white' : 'bg-white border text-primary/40'}`}>Todos</button>
        {visibleDepartments.map(d => (
          <button key={d.id} onClick={() => setSelectedDept(d.slug)} className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${selectedDept === d.slug ? 'bg-primary text-white shadow-lg' : 'bg-white border text-primary/40'}`}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color_hex }}></span>{d.nombre}
          </button>
        ))}
      </div>
      <div className="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map(p => <ProductCard key={p.id} product={p} tasa={config.tasa_cambio} onAdd={onAddToCart} />)}
      </div>
    </div>
  );
};

const CheckoutView: React.FC<{ carriers: Product[]; onFinalize: (data: any) => void }> = ({ carriers, onFinalize }) => {
  const [formData, setFormData] = useState({ nombre: '', telefono: '', direccion: '', entrega: 'retiro', notas: '', transportistaId: '' });
  const [searching, setSearching] = useState(false);
  const selectedCarrier = carriers.find(c => c.id === formData.transportistaId);

  const handlePhoneChange = async (val: string) => {
    setFormData(prev => ({ ...prev, telefono: val }));
    if (val.replace(/\D/g, '').length >= 10) {
      setSearching(true);
      try {
        const lastOrder = await db.getLatestOrderByPhone(val);
        if (lastOrder) setFormData(prev => ({ ...prev, nombre: lastOrder.nombre_cliente, direccion: lastOrder.direccion }));
      } catch (e) { console.error(e); } finally { setSearching(false); }
    }
  };

  return (
    <div className="px-6 py-20 max-w-xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-black mb-8 text-primary text-center">Finalizar Pedido</h2>
      <form onSubmit={(e) => { e.preventDefault(); onFinalize({ ...formData, transportista: selectedCarrier }); }} className="space-y-6">
        <div className="glassmorphism p-6 rounded-[2rem] space-y-4 border border-white">
          <div className="relative">
            <input required type="tel" placeholder="WhatsApp" className="w-full bg-offwhite p-4 rounded-xl font-bold outline-none" value={formData.telefono} onChange={e => handlePhoneChange(e.target.value)} />
            {searching && <Loader2 className="absolute right-4 top-4 animate-spin text-accent" size={20} />}
          </div>
          <input required placeholder="Nombre" className="w-full bg-offwhite p-4 rounded-xl font-bold outline-none" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
          <textarea required placeholder="Dirección" className="w-full bg-offwhite p-4 rounded-xl font-bold h-24 outline-none resize-none" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
        </div>
        <div className="glassmorphism p-6 rounded-[2rem] border border-white">
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => setFormData({...formData, entrega: 'retiro', transportistaId: ''})} className={`p-4 rounded-xl font-bold border-2 ${formData.entrega === 'retiro' ? 'bg-white border-accent' : 'bg-offwhite border-transparent'}`}>Retiro</button>
            <button type="button" onClick={() => setFormData({...formData, entrega: 'delivery'})} className={`p-4 rounded-xl font-bold border-2 ${formData.entrega === 'delivery' ? 'bg-white border-accent' : 'bg-offwhite border-transparent'}`}>Delivery</button>
          </div>
        </div>
        {formData.entrega === 'delivery' && (
          <div className="glassmorphism p-6 rounded-[2rem] border border-white animate-in slide-in-from-top-4">
            <h3 className="text-xs font-black uppercase text-accent mb-4 tracking-widest text-center">Transportista</h3>
            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto custom-scrollbar">
              {carriers.map(c => (
                <div key={c.id} onClick={() => setFormData({...formData, transportistaId: c.id || ''})} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${formData.transportistaId === c.id ? 'bg-white border-accent shadow-lg' : 'bg-offwhite border-transparent'}`}>
                  <img src={c.imagen_url} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1"><p className="font-bold text-sm text-primary">{c.nombre}</p><p className="text-[10px] font-black text-accent uppercase">{c.categoria} • ${Number(c.precio).toFixed(2)}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}
        <button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-accent transition-all">Enviar a WhatsApp</button>
      </form>
    </div>
  );
};

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [config, setConfig] = useState<Config>(CONFIG_STUB);
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [view, setView] = useState<'home' | 'cart' | 'checkout' | 'success' | 'admin' | 'login' | 'policies' | 'transport'>('home');
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  // Sistema de carga acelerada con Stale-While-Revalidate
  const initializeApp = async () => {
    // 1. Cargar desde caché inmediatamente para rapidez visual
    const [pCached, dCached, cCached] = await Promise.all([
      db.getProducts(false),
      db.getDepartments(false),
      db.getConfig(false)
    ]);
    
    if (pCached.length) setProducts(pCached);
    if (dCached.length) setDepartments(dCached);
    if (cCached) setConfig(cCached);
    
    // Dejar de mostrar el spinner si ya hay algo que ver
    if (pCached.length) setLoading(false);

    // 2. Refrescar desde la nube en segundo plano para estar al día
    try {
      const [pLive, dLive, cLive] = await Promise.all([
        db.getProducts(true),
        db.getDepartments(true),
        db.getConfig(true)
      ]);
      setProducts(pLive);
      setDepartments(dLive);
      if (cLive) setConfig(cLive);
    } catch (e) { console.error("Update background failed."); }
    finally { setLoading(false); }
  };

  useEffect(() => { initializeApp(); }, []);

  const addToCart = (p: Product) => {
    if (p.departamento === 'transporte') {
        alert("Selecciona transporte al finalizar tu pedido.");
        return;
    }
    if (cart.length > 0 && cart[0].departamento !== p.departamento) {
      alert("Finaliza tu compra en este departamento primero.");
      return;
    }
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? {...i, quantity: i.quantity + 1} : i);
      return [...prev, {...p, quantity: 1}];
    });
  };

  const finalizeOrder = async (orderData: any) => {
    if (cart.length === 0) return;
    const safeTasa = Number(config.tasa_cambio);
    const carrierTarifa = orderData.transportista ? Number(orderData.transportista.precio) : 0;
    const subtotalUSD = cart.reduce((acc, i) => acc + (Number(i.precio) * Number(i.quantity)), 0);
    const totalUSD = subtotalUSD + carrierTarifa;

    const order: Order = {
      order_id: `JX4-${Date.now()}`,
      nombre_cliente: orderData.nombre || '',
      telefono_cliente: orderData.telefono || '',
      direccion: orderData.direccion || '',
      productos: cart,
      total: totalUSD,
      total_bs: totalUSD * safeTasa,
      metodo_pago: 'pago_movil',
      metodo_entrega: orderData.entrega || 'retiro',
      estado: 'pendiente',
      departamento: cart[0].departamento,
      fecha_pedido: new Date().toISOString(),
      notas: orderData.notas
    };

    try {
      await db.saveOrder(order);
      setCurrentOrder(order);
      setCart([]);
      setView('success');

      const dept = departments.find(d => d.slug === order.departamento);
      const text = `🛒 *NUEVO PEDIDO JX4*\n--------------------\n👤 *Cliente:* ${order.nombre_cliente.toUpperCase()}\n📞 *WhatsApp:* ${order.telefono_cliente}\n\n📦 *PRODUCTOS:*\n${order.productos.map(p => `- ${p.nombre} x${p.quantity}`).join('\n')}\n\n💰 *TOTAL FINAL:* $${totalUSD.toFixed(2)}\n🇻🇪 *TOTAL BS:* Bs. ${order.total_bs.toLocaleString('es-VE')}\n\n📍 *Dirección:* ${order.direccion}`;
      
      window.open(`https://wa.me/${dept?.telefono_whatsapp || config.whatsapp_general}?text=${encodeURIComponent(text)}`, '_blank');
    } catch (e: any) { alert("Error al guardar."); }
  };

  const totalCartItems = cart.reduce((acc, i) => acc + i.quantity, 0);
  const carriers = products.filter(p => p.departamento === 'transporte' && p.disponible);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-offwhite"><Loader2 className="animate-spin text-primary" size={64} /></div>;

  return (
    <HashRouter>
      <div className="min-h-screen bg-offwhite pb-32 flex flex-col">
        <main className="max-w-7xl mx-auto w-full flex-grow">
          {view === 'home' && <HomeView products={products} departments={departments} onAddToCart={addToCart} config={config} />}
          {view === 'transport' && <TransportView products={products} config={config} onBack={() => setView('home')} />}
          {view === 'policies' && <PoliciesView onBack={() => setView('home')} />}
          {view === 'admin' && currentUser && <AdminPanel currentUser={currentUser} products={products} departments={departments} config={config} onRefresh={initializeApp} onLogout={() => { setCurrentUser(null); setView('home'); }} />}
          {view === 'login' && (
             <div className="min-h-screen flex items-center justify-center p-6 animate-fade-in">
               <div className="w-full max-w-md">
                 <form onSubmit={async (e) => {
                   e.preventDefault();
                   setLoggingIn(true);
                   const fd = new FormData(e.currentTarget);
                   try {
                     const user = await db.login(fd.get('u') as string, fd.get('p') as string);
                     setCurrentUser(user);
                     setView('admin');
                   } catch (e: any) { setLoginError(e.message); }
                   finally { setLoggingIn(false); }
                 }} className="glassmorphism p-10 rounded-[3rem] space-y-8 shadow-2xl border border-white">
                   <div className="text-center"><h2 className="text-3xl font-black text-primary tracking-tighter">Acceso Gestión</h2></div>
                   {loginError && <div className="bg-red-50 p-4 rounded-2xl text-red-600 font-bold text-xs">{loginError}</div>}
                   <div className="space-y-4">
                      <input name="u" required placeholder="Usuario" className="w-full bg-white p-5 rounded-2xl font-bold outline-none border focus:border-accent transition-all" />
                      <input name="p" type="password" required placeholder="Clave" className="w-full bg-white p-5 rounded-2xl font-bold outline-none border focus:border-accent transition-all" />
                   </div>
                   <button disabled={loggingIn} type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-accent transition-all flex items-center justify-center">{loggingIn ? <Loader2 className="animate-spin" /> : "Acceder"}</button>
                 </form>
               </div>
             </div>
          )}
          {view === 'cart' && (
             <div className="px-6 py-20 max-w-2xl mx-auto animate-fade-in">
                <h2 className="text-4xl font-black mb-10 text-primary tracking-tighter">Tu Carrito</h2>
                {cart.length === 0 ? (
                  <div className="text-center py-20"><ShoppingBag className="mx-auto text-primary/5 mb-4" size={80} /><p className="text-primary/20 font-black uppercase text-xs">El carrito está vacío</p></div>
                ) : (
                  <div className="space-y-4">
                     {cart.map(i => (
                       <div key={i.id} className="glassmorphism p-4 rounded-[2rem] flex items-center gap-4 border border-white">
                         <img src={i.imagen_url} className="w-20 h-20 rounded-2xl object-cover bg-white" />
                         <div className="flex-1">
                           <h4 className="font-bold text-primary leading-tight">{i.nombre}</h4>
                           <p className="text-xs text-primary/40 font-bold">${Number(i.precio).toFixed(2)}</p>
                         </div>
                         <div className="flex flex-col items-center gap-1 bg-offwhite p-1 rounded-xl">
                           <button onClick={() => setCart(cart.map(x => x.id === i.id ? {...x, quantity: x.quantity + 1} : x))}><Plus size={14} /></button>
                           <span className="font-black text-sm">{i.quantity}</span>
                           <button onClick={() => setCart(cart.map(x => x.id === i.id ? {...x, quantity: Math.max(1, x.quantity - 1)} : x))}><Minus size={14} /></button>
                         </div>
                         <button onClick={() => setCart(cart.filter(x => x.id !== i.id))} className="text-red-300 p-2"><Trash2 size={20} /></button>
                       </div>
                     ))}
                     <div className="p-10 glassmorphism rounded-[2.5rem] mt-10 text-center">
                        <div className="flex justify-between items-center font-black text-4xl mb-6 text-primary tracking-tighter"><span>Total:</span> <span>${cart.reduce((a,b) => a+(Number(b.precio)*Number(b.quantity)), 0).toFixed(2)}</span></div>
                        <button onClick={() => setView('checkout')} className="w-full bg-primary text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-4 shadow-2xl hover:bg-accent transition-all active:scale-95">Ir al Checkout <ArrowRight size={24} /></button>
                     </div>
                  </div>
                )}
             </div>
          )}
          {view === 'checkout' && <CheckoutView carriers={carriers} onFinalize={finalizeOrder} />}
          {view === 'success' && currentOrder && (
            <div className="flex flex-col items-center justify-center py-32 px-6 text-center animate-fade-in">
               <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center mb-10"><CheckCircle2 size={80} className="text-green-500" /></div>
               <h2 className="text-5xl font-black mb-6 tracking-tighter text-primary">¡Pedido Exitoso!</h2>
               <button onClick={() => setView('home')} className="bg-primary text-white px-16 py-5 rounded-2xl font-black text-xl shadow-2xl transition-all active:scale-95">Volver al Inicio</button>
            </div>
          )}
        </main>

        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-md glassmorphism rounded-full px-8 py-5 flex items-center justify-between shadow-2xl z-50 border border-white/40">
          <button onClick={() => setView('home')} className={`p-2 transition-all flex flex-col items-center gap-1 ${view === 'home' ? 'text-accent scale-110' : 'text-primary/30'}`}>
            <Home size={24} /><span className="text-[8px] font-black uppercase">Inicio</span>
          </button>
          <button onClick={() => setView('cart')} className={`p-2 relative transition-all flex flex-col items-center gap-1 ${view === 'cart' ? 'text-accent scale-110' : 'text-primary/30'}`}>
            <ShoppingBag size={24} />
            {totalCartItems > 0 && <span className="absolute -top-1 -right-1 bg-accent text-white text-[8px] font-black w-5 h-5 flex items-center justify-center rounded-full border border-white">{totalCartItems}</span>}
            <span className="text-[8px] font-black uppercase">Carrito</span>
          </button>
          <button onClick={() => setView('transport')} className={`p-2 transition-all flex flex-col items-center gap-1 ${view === 'transport' ? 'text-accent scale-110' : 'text-primary/30'}`}>
            <Truck size={24} /><span className="text-[8px] font-black uppercase">Transporte</span>
          </button>
          <button onClick={() => currentUser ? setView('admin') : setView('login')} className={`p-2 transition-all flex flex-col items-center gap-1 ${view === 'admin' || view === 'login' ? 'text-accent scale-110' : 'text-primary/30'}`}>
            <Settings size={24} /><span className="text-[8px] font-black uppercase">Gestión</span>
          </button>
        </nav>
      </div>
    </HashRouter>
  );
};

export default App;
