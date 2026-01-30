
import { useState, useEffect, useMemo, useRef } from 'react';
import { HashRouter } from 'react-router-dom';
import { 
  ShoppingBag, Plus, Minus, Trash2, ArrowRight, CheckCircle2, 
  Search, Package, Settings, Upload, LogIn, LogOut,
  Save, X, Edit3, Loader2, RefreshCcw, 
  ShieldAlert, Users, Lock, UserPlus, Home, MessageCircle, Sparkles, 
  AlertCircle, Scale, ShieldCheck, FileText, Info, Wand2, Truck, Car, User
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
            <p><strong>Naturaleza del Servicio:</strong> JX4 Paracotos Online es estrictamente un Catálogo Digital Informativo. La plataforma facilita el encuentro entre comerciantes y potenciales clientes.</p>
            <div className="bg-amber-50 border-l-4 border-accent p-4 rounded-r-xl italic text-accent-dark font-medium">
              Importante: No somos una plataforma de venta, ni procesamos pagos, ni gestionamos envíos.
            </div>
            <p><strong>Deslinde de Responsabilidad:</strong> Cualquier transacción comercial, acuerdo de pago o entrega se realiza fuera de la aplicación y directamente entre el usuario y el anunciante. No garantizamos la calidad, seguridad o existencia de los productos anunciados.</p>
          </div>
        </section>

        <section className="glassmorphism p-8 rounded-[2.5rem] border border-white shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <ShieldCheck className="text-accent" size={24} />
            <h3 className="text-xl font-black">2. Seguridad y Privacidad</h3>
          </div>
          <p>Basado en el Art. 60 de la CRBV, respetamos la privacidad de tus datos:</p>
          <ul className="list-disc ml-6 mt-4 space-y-2">
            <li><strong>Recolección:</strong> Solo solicitamos datos necesarios para el contacto (Nombre, Teléfono, Dirección).</li>
            <li><strong>Uso:</strong> Los datos se usan exclusivamente para la gestión de pedidos vía WhatsApp. No vendemos bases de datos a terceros.</li>
            <li><strong>Seguridad:</strong> Aplicamos medidas técnicas según la Ley Especial contra los Delitos Informáticos.</li>
          </ul>
        </section>

        <section className="glassmorphism p-8 rounded-[2.5rem] border border-white shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <FileText className="text-accent" size={24} />
            <h3 className="text-xl font-black">3. Base Legal (Venezuela)</h3>
          </div>
          <p>Estas políticas se fundamentan en el ordenamiento jurídico vigente:</p>
          <ul className="list-disc ml-6 mt-4 space-y-2 font-medium opacity-70">
            <li>Constitución de la República Bolivariana de Venezuela (CRBV).</li>
            <li>Ley sobre Mensajes de Datos y Firmas Electrónicas.</li>
            <li>Ley Especial contra los Delitos Informáticos.</li>
            <li>Ley Orgánica de Precios Justos.</li>
            <li>Código Civil de Venezuela.</li>
          </ul>
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
    } catch (e: any) { alert("Error al cargar pedidos: " + e.message); }
  };

  const fetchAdmins = async () => {
    if (!isSuper) return;
    try {
      const data = await db.getAdmins();
      setAdmins(data);
    } catch (e: any) { alert("Error al cargar usuarios: " + e.message); }
  };

  useEffect(() => {
    if (activeTab === 'ventas') fetchOrders();
    if (activeTab === 'users') fetchAdmins();
  }, [activeTab]);

  const handleGenerateDescription = async () => {
    if (!editingProduct?.nombre) return alert("Ingresa el nombre del producto primero.");
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
    } catch (e: any) { alert("Error: " + e.message); }
    finally { setSaving(false); }
  };

  const handleSaveAdmin = async () => {
    if (!editingAdmin?.username) return alert("El nombre de usuario es obligatorio");
    setSaving(true);
    try {
      await db.upsertAdmin(editingAdmin);
      setEditingAdmin(null);
      fetchAdmins();
    } catch (e: any) { alert("Error al guardar administrador: " + e.message); }
    finally { setSaving(false); }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await db.updateConfig(localConfig);
      onRefresh();
      alert("Configuración actualizada correctamente.");
    } catch (e: any) { alert("Error: " + e.message); }
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
            <h2 className="text-3xl font-black text-primary">Panel Administrativo</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={isSuper ? "warning" : "info"}>{isSuper ? "Super Usuario" : "Admin de Deptos"}</Badge>
              {!isSuper && myDeptSlugs.map(slug => (
                <span key={slug} className="text-[9px] font-black text-accent uppercase bg-accent/10 px-2 py-0.5 rounded-md">{slug}</span>
              ))}
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
            <button onClick={() => setActiveTab('config')} className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'config' ? 'bg-primary text-white shadow-lg' : 'bg-white border border-primary/5 text-primary/40'}`}>Configuración</button>
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
              <p className="text-xs text-primary/50 mb-4">{o.departamento.toUpperCase()}</p>
              
              <button 
                onClick={() => {
                  const phone = o.telefono_cliente.replace(/\D/g, '');
                  const text = encodeURIComponent(`Hola ${o.nombre_cliente}, te contacto de JX4 Paracotos sobre tu pedido #${o.order_id}.`);
                  window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
                }}
                className="w-full mb-4 py-3 bg-green-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-green-600 transition-colors shadow-lg shadow-green-200 active:scale-95"
              >
                <MessageCircle size={16} /> Contactar WhatsApp
              </button>

              <div className="mt-auto flex justify-between items-center text-[10px] font-black uppercase text-primary/30 border-t pt-3">
                <span>{new Date(o.fecha_pedido).toLocaleDateString()}</span>
                <span className="text-accent">{o.metodo_entrega}</span>
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-primary/20 font-black py-10">No hay ventas registradas.</p>}
        </div>
      )}

      {activeTab === 'productos' && (
        <div className="space-y-6">
          <button onClick={() => setEditingProduct({ nombre: '', descripcion: '', precio: 0, stock: 0, departamento: isSuper ? 'carnes' : myDeptSlugs[0], unidad: 'kg', disponible: true })} className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-primary-dark transition-all active:scale-95"><Plus size={18} /> Nuevo Producto</button>
          <div className="glassmorphism rounded-[2.5rem] overflow-hidden shadow-sm border border-white overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-primary/5 text-[10px] uppercase font-black text-primary/30"><tr className="p-4"><th></th><th className="p-4">Producto</th><th>Depto</th><th>Precio</th><th className="p-4 text-center">Acciones</th></tr></thead>
              <tbody className="divide-y divide-primary/5">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="text-sm font-medium hover:bg-white/40">
                    <td className="p-4"><img src={p.imagen_url} className="w-10 h-10 rounded-lg object-cover bg-white" /></td>
                    <td className="font-black">{p.nombre}</td>
                    <td><Badge>{p.departamento}</Badge></td>
                    <td className="font-bold">${Number(p.precio).toFixed(2)}</td>
                    <td className="p-4 flex justify-center gap-2">
                      <button onClick={() => setEditingProduct(p)} className="p-2 text-accent bg-white rounded-lg shadow-sm hover:text-accent-dark"><Edit3 size={16} /></button>
                      <button onClick={async () => { if(confirm("¿Eliminar?")){ await db.deleteProduct(p.id!); onRefresh(); } }} className="p-2 text-red-400 bg-white rounded-lg shadow-sm hover:text-red-600"><Trash2 size={16} /></button>
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
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-3xl font-black text-primary">Editor de Producto</h3>
               <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-offwhite rounded-full transition-colors"><X /></button>
             </div>
             <div className="space-y-6">
               <ImageUploader label="Imagen del Producto" currentUrl={editingProduct.imagen_url || ''} onUpload={(url) => setEditingProduct({...editingProduct, imagen_url: url})} />
               
               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase text-primary/30 ml-2">Nombre / Transportista</label>
                 <input placeholder="Ej: Picanha Premium o Eco-Carga" className="w-full bg-offwhite p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-accent transition-all" value={editingProduct.nombre} onChange={e => setEditingProduct({...editingProduct, nombre: e.target.value})} />
               </div>

               <div className="space-y-1 relative">
                 <div className="flex justify-between items-center pr-2">
                   <label className="text-[10px] font-black uppercase text-primary/30 ml-2">Descripción / Vehículo</label>
                   <button 
                    disabled={generatingAI}
                    onClick={handleGenerateDescription}
                    className="flex items-center gap-1 text-[10px] font-black text-accent hover:text-accent-dark transition-colors bg-accent/5 px-2 py-1 rounded-full uppercase"
                   >
                     {generatingAI ? <Loader2 className="animate-spin" size={12} /> : <Wand2 size={12} />} IA Mágica
                   </button>
                 </div>
                 <textarea placeholder="Describe el producto o vehículo..." className="w-full bg-offwhite p-4 rounded-2xl font-bold h-24 outline-none resize-none border-2 border-transparent focus:border-accent transition-all" value={editingProduct.descripcion} onChange={e => setEditingProduct({...editingProduct, descripcion: e.target.value})} />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-primary/30 ml-2">Tarifa / Precio ($)</label>
                   <input placeholder="Precio" type="number" step="0.01" className="w-full bg-offwhite p-4 rounded-xl font-bold outline-none" value={editingProduct.precio} onChange={e => setEditingProduct({...editingProduct, precio: parseFloat(e.target.value)})} />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-primary/30 ml-2">Departamento</label>
                   <select 
                      className="w-full bg-offwhite p-4 rounded-xl font-bold outline-none" 
                      value={editingProduct.departamento} 
                      onChange={e => setEditingProduct({...editingProduct, departamento: e.target.value as any})}
                   >
                     {departments
                       .filter(d => isSuper || myDeptSlugs.includes(d.slug))
                       .map(d => <option key={d.id} value={d.slug}>{d.nombre}</option>)
                     }
                   </select>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-primary/30 ml-2">Categoría / Subtipo</label>
                   <input placeholder="Ej: Carga, Pasajeros, Premium" className="w-full bg-offwhite p-4 rounded-xl font-bold outline-none" value={editingProduct.categoria || ''} onChange={e => setEditingProduct({...editingProduct, categoria: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-primary/30 ml-2">Unidad de Medida</label>
                   <select className="w-full bg-offwhite p-4 rounded-xl font-bold outline-none" value={editingProduct.unidad} onChange={e => setEditingProduct({...editingProduct, unidad: e.target.value as any})}>
                     {UNIDADES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                   </select>
                 </div>
               </div>

               <button onClick={handleSaveProduct} disabled={saving} className="w-full bg-primary text-white py-5 rounded-2xl font-black shadow-xl transition-all active:scale-95 flex items-center justify-center">
                 {saving ? <Loader2 className="animate-spin" /> : "Guardar Registro"}
               </button>
             </div>
          </div>
        </div>
      )}

      {isSuper && activeTab === 'depts' && (
        <div className="space-y-6">
           <button onClick={() => setEditingDept({ nombre: '', slug: '', telefono_whatsapp: '', color_hex: '#3d4a3e' })} className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg"><Plus size={18} /> Nuevo Depto</button>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {departments.map(d => (
               <div key={d.id} className="glassmorphism p-6 rounded-[2rem] border-t-8 border-white shadow-sm" style={{ borderTopColor: d.color_hex }}>
                 <div className="flex justify-between items-start mb-4">
                   <h3 className="font-black text-lg">{d.nombre}</h3>
                   <div className="flex gap-2">
                     <button onClick={() => setEditingDept(d)} className="p-2 bg-white rounded-lg shadow-sm hover:bg-primary/5 transition-colors"><Edit3 size={14} /></button>
                     <button onClick={async () => { if(confirm("¿Eliminar departamento?")){ await db.deleteDepartment(d.id!); onRefresh(); } }} className="p-2 bg-white text-red-400 rounded-lg shadow-sm hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                   </div>
                 </div>
                 <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest">+{d.telefono_whatsapp}</p>
               </div>
             ))}
           </div>
        </div>
      )}

      {editingDept && (
        <div className="fixed inset-0 z-[100] bg-primary/40 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-md rounded-[3rem] p-10 shadow-2xl animate-in slide-in-from-bottom-10 my-auto">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-black text-primary">Gestionar Departamento</h3>
               <button onClick={() => setEditingDept(null)}><X /></button>
             </div>
             <div className="space-y-4">
               <input placeholder="Nombre" className="w-full bg-offwhite p-4 rounded-xl font-bold outline-none" value={editingDept.nombre} onChange={e => setEditingDept({...editingDept, nombre: e.target.value})} />
               <input placeholder="Slug" className="w-full bg-offwhite p-4 rounded-xl font-bold outline-none" value={editingDept.slug} onChange={e => setEditingDept({...editingDept, slug: e.target.value?.toLowerCase().replace(/\s+/g, '-') as any})} />
               <input placeholder="WhatsApp (Ej: 584241112233)" className="w-full bg-offwhite p-4 rounded-xl font-bold outline-none" value={editingDept.telefono_whatsapp} onChange={e => setEditingDept({...editingDept, telefono_whatsapp: e.target.value})} />
               <div className="flex items-center gap-4 bg-offwhite p-4 rounded-xl">
                 <span className="text-xs font-bold text-primary/50 uppercase">Color de Marca:</span>
                 <input type="color" className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-none" value={editingDept.color_hex} onChange={e => setEditingDept({...editingDept, color_hex: e.target.value})} />
               </div>
               <button onClick={async () => { await db.upsertDepartment(editingDept); setEditingDept(null); onRefresh(); }} className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-lg transition-all active:scale-95">Guardar Cambios</button>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && isSuper && (
        <div className="space-y-6">
           <button onClick={() => setEditingAdmin({ username: '', password: '', role: 'dept_admin', dept_slugs: [] })} className="bg-accent text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg"><UserPlus size={18} /> Crear Administrador</button>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {admins.map(admin => (
               <div key={admin.id} className="glassmorphism p-6 rounded-[2rem] flex items-center justify-between border border-white shadow-sm">
                 <div className="flex items-center gap-4">
                   <div className={`p-3 rounded-xl ${admin.role === 'super' ? 'bg-accent' : 'bg-primary/10 text-primary'}`}><Users size={20} /></div>
                   <div>
                     <p className="font-black text-primary">@{admin.username}</p>
                     <div className="flex flex-wrap gap-1 mt-1">
                       <span className="text-[10px] font-black uppercase text-primary/40 mr-2">{admin.role === 'super' ? 'Súper' : 'Admin'}</span>
                       {admin.dept_slugs?.map(s => <span key={s} className="bg-primary/5 text-[8px] font-black px-1 rounded">{s}</span>)}
                     </div>
                   </div>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => setEditingAdmin(admin)} className="p-2 text-accent bg-white rounded-lg shadow-sm"><Edit3 size={16} /></button>
                    {admin.role !== 'super' && (
                      <button onClick={async () => { if(confirm("¿Eliminar administrador?")){ await db.deleteAdmin(admin.id!); fetchAdmins(); } }} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                    )}
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}

      {editingAdmin && (
        <div className="fixed inset-0 z-[100] bg-primary/40 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 my-auto">
             <h3 className="text-2xl font-black text-primary mb-6">Gestionar Administrador</h3>
             <div className="space-y-4">
               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase text-primary/30 ml-2">Usuario</label>
                 <input placeholder="Nombre de usuario" className="w-full bg-offwhite p-4 rounded-xl font-bold outline-none" value={editingAdmin.username} onChange={e => setEditingAdmin({...editingAdmin, username: e.target.value})} />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase text-primary/30 ml-2">Contraseña {editingAdmin.id && "(dejar vacío para no cambiar)"}</label>
                 <input placeholder="Contraseña" type="text" className="w-full bg-offwhite p-4 rounded-xl font-bold outline-none" value={editingAdmin.password || ''} onChange={e => setEditingAdmin({...editingAdmin, password: e.target.value})} />
               </div>
               
               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase text-primary/30 ml-2">Rol</label>
                 <select className="w-full bg-offwhite p-4 rounded-xl font-bold outline-none" value={editingAdmin.role} onChange={e => setEditingAdmin({...editingAdmin, role: e.target.value as any})}>
                   <option value="dept_admin">Administrador de Depto</option>
                   <option value="super">Super Usuario</option>
                 </select>
               </div>

               {editingAdmin.role !== 'super' && (
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-primary/30 ml-2">Departamentos a cargo</label>
                   <div className="grid grid-cols-2 gap-2 bg-offwhite p-4 rounded-xl">
                     {departments.map(d => (
                       <label key={d.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded transition-colors">
                         <input 
                           type="checkbox" 
                           checked={editingAdmin.dept_slugs?.includes(d.slug)} 
                           onChange={(e) => {
                             const currentSlugs = editingAdmin.dept_slugs || [];
                             const newSlugs = e.target.checked 
                               ? [...currentSlugs, d.slug]
                               : currentSlugs.filter(s => s !== d.slug);
                             setEditingAdmin({...editingAdmin, dept_slugs: newSlugs});
                           }}
                           className="accent-primary"
                         />
                         <span className="text-xs font-bold text-primary">{d.nombre}</span>
                       </label>
                     ))}
                   </div>
                 </div>
               )}

               <div className="flex gap-3 pt-4">
                 <button onClick={() => setEditingAdmin(null)} className="flex-1 py-4 font-black text-primary/40 hover:text-primary transition-colors">Cancelar</button>
                 <button onClick={handleSaveAdmin} disabled={saving} className="flex-1 bg-primary text-white rounded-2xl font-black shadow-lg flex items-center justify-center">
                   {saving ? <Loader2 className="animate-spin" size={20} /> : (editingAdmin.id ? "Actualizar" : "Crear")}
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}

      {isSuper && activeTab === 'config' && (
        <div className="glassmorphism p-8 rounded-[2.5rem] space-y-6 shadow-sm border border-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <ImageUploader label="Logo de la Aplicación" currentUrl={localConfig.logo_url} onUpload={(url) => setLocalConfig({...localConfig, logo_url: url})} />
              <input className="w-full bg-white p-4 rounded-xl border border-primary/5 font-bold outline-none" value={localConfig.slogan} onChange={e => setLocalConfig({...localConfig, slogan: e.target.value})} placeholder="Slogan" />
            </div>
            <div className="space-y-4">
              <input className="w-full bg-white p-4 rounded-xl border border-primary/5 font-bold outline-none" value={localConfig.cintillo_promocional} onChange={e => setLocalConfig({...localConfig, cintillo_promocional: e.target.value})} placeholder="Cintillo Informativo" />
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-primary/30 ml-2">Tasa del Día (Bs/$)</label>
                <input type="number" step="0.01" className="w-full bg-white p-4 rounded-xl border border-primary/5 font-black text-accent outline-none" value={localConfig.tasa_cambio} onChange={e => setLocalConfig({...localConfig, tasa_cambio: parseFloat(e.target.value)})} placeholder="Tasa BCV" />
              </div>
            </div>
          </div>
          <button onClick={handleSaveConfig} disabled={saving} className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
            {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Guardar Configuración
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
    if (tip) return setTip(null); // Toggle
    setLoadingTip(true);
    try {
      const result = await getCookingTip(product.nombre);
      setTip(result);
    } catch (e) { setTip("Mantener fresco."); }
    finally { setLoadingTip(false); }
  };

  const safePrecio = Number(product.precio);
  const safeTasa = Number(tasa);

  // Si es un transportista, mostramos un diseño ligeramente diferente
  const isTransport = product.departamento === 'transporte';

  return (
    <div className={`glassmorphism rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-sm border border-white flex flex-col h-full ${isTransport ? 'ring-2 ring-accent/20' : ''}`}>
      <div className="aspect-square relative overflow-hidden bg-white shrink-0">
        <img src={product.imagen_url} className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
          <Badge variant={isTransport ? "warning" : "primary"}>{product.unidad}</Badge>
          {isTransport && <Badge variant="info">{product.categoria}</Badge>}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1 gap-2">
          <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
            {isTransport && <Truck size={16} className="text-accent" />}
            {product.nombre}
          </h3>
          {!isTransport && (
            <button 
              onClick={fetchTip}
              className="p-1.5 rounded-full bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all shrink-0"
            >
              {loadingTip ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
            </button>
          )}
        </div>
        
        {tip && (
          <div className="mb-3 p-3 bg-accent/5 rounded-xl border border-accent/10 animate-in slide-in-from-top-2">
            <p className="text-[10px] font-black text-accent uppercase mb-1">Tip de JX4:</p>
            <p className="text-[11px] font-medium text-primary/70 italic leading-snug">"{tip}"</p>
          </div>
        )}

        <p className="text-xs text-primary/50 mb-4 line-clamp-2 min-h-[2.5rem] flex-grow">{product.descripcion || 'Sin descripción disponible.'}</p>
        
        <div className="flex justify-between items-center mt-auto">
          <div>
            <div className="text-xl font-black text-primary">${safePrecio.toFixed(2)}</div>
            <div className="text-[10px] font-bold text-primary/30">Bs. {(safePrecio * safeTasa).toFixed(2)}</div>
          </div>
          <button onClick={() => onAdd(product)} className="bg-primary text-white p-3 rounded-2xl hover:bg-accent transition-all shadow-lg active:scale-95">
            <Plus size={20} />
          </button>
        </div>
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
          <ProductCard key={p.id} product={p} tasa={config.tasa_cambio} onAdd={onAddToCart} />
        )) : (
          <div className="col-span-full py-20 text-center">
            <Package className="mx-auto text-primary/10 mb-4" size={64} />
            <p className="font-bold text-primary/30">No se encontraron registros.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CheckoutView: React.FC<{
  carriers: Product[];
  onFinalize: (data: any) => void;
}> = ({ carriers, onFinalize }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    entrega: 'retiro',
    notas: '',
    transportistaId: ''
  });
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState(false);

  const handlePhoneChange = async (val: string) => {
    setFormData(prev => ({ ...prev, telefono: val }));
    if (val.replace(/\D/g, '').length >= 10) {
      setSearching(true);
      try {
        const lastOrder = await db.getLatestOrderByPhone(val);
        if (lastOrder) {
          setFormData(prev => ({
            ...prev,
            nombre: lastOrder.nombre_cliente,
            direccion: lastOrder.direccion
          }));
          setFound(true);
          setTimeout(() => setFound(false), 3000);
        }
      } catch (e) { console.error(e); } finally { setSearching(false); }
    }
  };

  const selectedCarrier = carriers.find(c => c.id === formData.transportistaId);

  return (
    <div className="px-6 py-20 max-w-xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-black mb-8 text-primary text-center tracking-tighter">Finalizar Pedido</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        onFinalize({
          ...formData,
          transportista: selectedCarrier
        });
      }} className="space-y-6">
        <div className="glassmorphism p-6 rounded-[2rem] space-y-4 border border-white relative">
          <div className="relative">
            <input required type="tel" placeholder="WhatsApp (Ej: 04123868364)" className="w-full bg-offwhite p-4 rounded-xl font-bold outline-none border-2 border-transparent focus:border-accent transition-all" value={formData.telefono} onChange={e => handlePhoneChange(e.target.value)} />
            {searching && <Loader2 className="absolute right-4 top-4 animate-spin text-accent" size={20} />}
            {found && <div className="absolute -top-3 left-4 bg-accent text-white text-[9px] font-black px-2 py-1 rounded-full flex items-center gap-1 animate-bounce"><Sparkles size={10} /> ¡CLIENTE FRECUENTE!</div>}
          </div>
          <input required placeholder="Nombre Completo" className="w-full bg-offwhite p-4 rounded-xl font-bold outline-none border-2 border-transparent focus:border-accent transition-all" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
          <textarea required placeholder="Dirección exacta para la entrega" className="w-full bg-offwhite p-4 rounded-xl font-bold h-24 outline-none resize-none border-2 border-transparent focus:border-accent transition-all" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
        </div>
        
        <div className="glassmorphism p-6 rounded-[2rem] border border-white">
          <h3 className="text-xs font-black uppercase text-primary/30 mb-4 tracking-widest text-center">Tipo de Entrega</h3>
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => setFormData({...formData, entrega: 'retiro', transportistaId: ''})} className={`p-4 rounded-xl font-bold transition-all border-2 flex flex-col items-center gap-2 ${formData.entrega === 'retiro' ? 'bg-white border-accent text-primary' : 'bg-offwhite border-transparent text-primary/30'}`}>
              <User size={20} /> Retiro Personal
            </button>
            <button type="button" onClick={() => setFormData({...formData, entrega: 'delivery'})} className={`p-4 rounded-xl font-bold transition-all border-2 flex flex-col items-center gap-2 ${formData.entrega === 'delivery' ? 'bg-white border-accent text-primary' : 'bg-offwhite border-transparent text-primary/30'}`}>
              <Truck size={20} /> Delivery JX4
            </button>
          </div>
        </div>

        {formData.entrega === 'delivery' && (
          <div className="glassmorphism p-6 rounded-[2rem] border border-white animate-in slide-in-from-top-4">
            <h3 className="text-xs font-black uppercase text-accent mb-4 tracking-widest text-center">Selecciona tu Transportista</h3>
            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {carriers.length > 0 ? carriers.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => setFormData({...formData, transportistaId: c.id || ''})}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${formData.transportistaId === c.id ? 'bg-white border-accent shadow-lg shadow-accent/10' : 'bg-offwhite border-transparent'}`}
                >
                  <img src={c.imagen_url} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-primary leading-none mb-1">{c.nombre}</p>
                    <p className="text-[10px] font-black text-accent uppercase">{c.categoria} • ${Number(c.precio).toFixed(2)}</p>
                  </div>
                  {formData.transportistaId === c.id && <CheckCircle2 size={20} className="text-accent" />}
                </div>
              )) : (
                <p className="text-center text-[10px] font-black text-primary/30 py-4 uppercase">Cargando transportistas disponibles...</p>
              )}
            </div>
            {selectedCarrier && (
              <div className="mt-4 p-4 bg-accent/5 rounded-xl border border-accent/10">
                <p className="text-[10px] font-medium text-primary/60 italic">"{selectedCarrier.descripcion}"</p>
              </div>
            )}
          </div>
        )}

        <div className="glassmorphism p-6 rounded-[2rem] border border-white">
           <textarea placeholder="¿Alguna nota o requerimiento especial?" className="w-full bg-offwhite p-4 rounded-xl font-bold h-20 outline-none resize-none border-2 border-transparent focus:border-accent transition-all" value={formData.notas} onChange={e => setFormData({...formData, notas: e.target.value})} />
        </div>

        <button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-accent transition-all active:scale-95 flex items-center justify-center gap-2">
          Finalizar y Enviar a WhatsApp <ArrowRight size={20} />
        </button>
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
  const [view, setView] = useState<'home' | 'cart' | 'checkout' | 'success' | 'admin' | 'login' | 'policies'>('home');
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [pResult, dResult, cResult] = await Promise.all([db.getProducts(), db.getDepartments(), db.getConfig()]);
      setProducts(pResult);
      setDepartments(dResult);
      if (cResult) setConfig(cResult);
    } catch (e: any) { console.error("Refresh Error:", e.message); } finally { setLoading(false); }
  };

  useEffect(() => { refreshData(); }, []);

  const addToCart = (p: Product) => {
    // Los transportistas no se añaden al carrito, se eligen en checkout
    if (p.departamento === 'transporte') {
      alert("ℹ️ Los transportistas se eligen al finalizar el pedido si seleccionas 'Delivery'.");
      return;
    }
    if (cart.length > 0 && cart[0].departamento !== p.departamento) {
      alert("⚠️ Finaliza tu compra en este departamento antes de cambiar.");
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
    const transportPrice = orderData.transportista ? Number(orderData.transportista.precio) : 0;
    const totalUSD = cart.reduce((acc, i) => acc + (Number(i.precio) * Number(i.quantity)), 0) + transportPrice;
    
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
      const carrierInfo = orderData.transportista ? `\n\n🚚 *TRANSPORTISTA:* ${orderData.transportista.nombre} ($${transportPrice.toFixed(2)})\n📑 *Tipo:* ${orderData.transportista.categoria}` : '';
      
      const text = `🛒 *NUEVO PEDIDO JX4*\n--------------------\n👤 *Cliente:* ${order.nombre_cliente.toUpperCase()}\n📞 *WhatsApp:* ${order.telefono_cliente}\n📦 *Método:* ${order.metodo_entrega.toUpperCase()}${carrierInfo}\n\n📦 *PRODUCTOS:*\n${order.productos.map(p => `- ${p.nombre} x${p.quantity} ($${(Number(p.precio) * Number(p.quantity)).toFixed(2)})`).join('\n')}\n\n💵 *SUBTOTAL:* $${(totalUSD - transportPrice).toFixed(2)}\n💰 *TOTAL FINAL:* $${totalUSD.toFixed(2)}\n🇻🇪 *TOTAL BS:* Bs. ${order.total_bs.toLocaleString('es-VE')}\n\n📍 *Dirección:* ${order.direccion}\n📝 *Notas:* ${order.notas || 'Sin notas.'}`;
      
      window.open(`https://wa.me/${dept?.telefono_whatsapp || config.whatsapp_general}?text=${encodeURIComponent(text)}`, '_blank');
    } catch (e: any) { alert("Error al guardar: " + e.message); }
  };

  const totalCartItems = cart.reduce((acc, i) => acc + i.quantity, 0);
  const carriers = products.filter(p => p.departamento === 'transporte' && p.disponible);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-offwhite"><Loader2 className="animate-spin text-primary" size={64} /></div>;

  return (
    <HashRouter>
      <div className="min-h-screen bg-offwhite pb-32 flex flex-col">
        <main className="max-w-7xl mx-auto w-full flex-grow">
          {view === 'home' && <HomeView products={products} departments={departments} onAddToCart={addToCart} config={config} />}
          {view === 'policies' && <PoliciesView onBack={() => setView('home')} />}
          {view === 'admin' && currentUser && <AdminPanel currentUser={currentUser} products={products} departments={departments} config={config} onRefresh={refreshData} onLogout={() => { setCurrentUser(null); setView('home'); }} />}
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
                   <div className="text-center">
                      <div className="bg-primary w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white mb-6"><LogIn size={32} /></div>
                      <h2 className="text-3xl font-black text-primary tracking-tighter">Acceso Gestión</h2>
                   </div>
                   {loginError && <div className="bg-red-50 p-4 rounded-2xl flex items-start gap-3 text-red-600 font-bold text-xs"><AlertCircle size={20} />{loginError}</div>}
                   <div className="space-y-4">
                      <input name="u" required placeholder="Usuario" className="w-full bg-white p-5 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-accent transition-all" />
                      <input name="p" type="password" required placeholder="Clave" className="w-full bg-white p-5 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-accent transition-all" />
                   </div>
                   <div className="text-[10px] text-primary/40 text-center font-bold">Al acceder, aceptas nuestros <button type="button" onClick={() => setView('policies')} className="text-accent underline">Términos y Condiciones</button>.</div>
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
               <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center mb-10 border border-green-100"><CheckCircle2 size={80} className="text-green-500" /></div>
               <h2 className="text-5xl font-black mb-6 tracking-tighter text-primary">¡Pedido Exitoso!</h2>
               <p className="text-primary/50 mb-12 max-w-sm text-lg">Tu orden <strong>{currentOrder.order_id}</strong> ha sido procesada. En segundos abrirá WhatsApp para coordinar.</p>
               <button onClick={() => setView('home')} className="bg-primary text-white px-16 py-5 rounded-2xl font-black text-xl shadow-2xl transition-all active:scale-95">Volver al Inicio</button>
            </div>
          )}
        </main>

        <footer className="w-full py-6 px-6 text-center border-t border-primary/5 mb-32 glassmorphism">
          <p className="text-[9px] font-bold text-primary/40 uppercase tracking-widest leading-relaxed max-w-md mx-auto">
            Aviso Legal: JX4 Paracotos Online funciona exclusivamente como un catálogo digital informativo. No somos una plataforma de venta ni procesamos pagos.
          </p>
          <button onClick={() => setView('policies')} className="mt-2 text-[9px] font-black text-accent uppercase hover:underline">Ver Políticas Completas</button>
        </footer>

        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md glassmorphism rounded-full px-10 py-5 flex items-center justify-between shadow-2xl z-50 border border-white/40">
          <button onClick={() => setView('home')} className={`p-2 transition-all hover:scale-110 active:scale-90 ${view === 'home' ? 'text-accent scale-125' : 'text-primary/30'}`}><Home size={28} /></button>
          <button onClick={() => setView('cart')} className={`p-2 relative transition-all hover:scale-110 active:scale-90 ${view === 'cart' ? 'text-accent scale-125' : 'text-primary/30'}`}>
            <ShoppingBag size={28} />
            {totalCartItems > 0 && <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-lg">{totalCartItems}</span>}
          </button>
          <button onClick={() => currentUser ? setView('admin') : setView('login')} className={`p-2 transition-all hover:scale-110 active:scale-90 ${view === 'admin' || view === 'login' ? 'text-accent scale-125' : 'text-primary/30'}`}><Settings size={28} /></button>
        </nav>
      </div>
    </HashRouter>
  );
};

export default App;
