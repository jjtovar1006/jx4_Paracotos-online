import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShoppingBag, Plus, Minus, Trash2, Settings, LogOut,
  Edit3, Loader2, RefreshCcw, Home, Truck,
  Boxes, ClipboardList, Store,
  X, ChevronRight, Beef, Heart,
  Star, Briefcase, Eye
} from 'lucide-react';

import { Product, CartItem, Order, Config, Department, Job } from './types';
import { db } from './services/supabaseService';
import { useToast } from './hooks/useToast';
import { useFavorites } from './hooks/useFavorites';
import { ToastContainer } from './components/Toast';
import { SkeletonGrid } from './components/SkeletonLoader';
import { SearchBar } from './components/SearchBar';
import { ProductModal } from './components/ProductModal';
import { Statistics } from './components/Statistics';

const ProductCard: React.FC<{
  product: Product;
  onAdd: (p: Product) => void;
  onView: (p: Product) => void;
  tasa: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}> = ({ product, onAdd, onView, tasa, isFavorite, onToggleFavorite }) => {
  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-300 group flex flex-col h-full relative">
      <button
        onClick={onToggleFavorite}
        className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"
      >
        <Heart
          size={18}
          fill={isFavorite ? '#d4af37' : 'none'}
          className={isFavorite ? 'text-[#d4af37]' : 'text-gray-300'}
        />
      </button>

      <div className="h-52 bg-[#f4f7f4] relative overflow-hidden p-4 cursor-pointer" onClick={() => onView(product)}>
        <img
          src={product.imagen_url || 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=800'}
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
          alt={product.nombre}
          loading="lazy"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.destacado && (
            <span className="bg-[#d4af37] text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-tighter">
              <Star size={10} fill="white"/> Top
            </span>
          )}
          <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black text-[#1a2f1c] shadow-sm uppercase">
            {product.departamento}
          </span>
        </div>

        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-white px-4 py-2 rounded-full text-xs font-black flex items-center gap-2">
            <Eye size={16} /> Ver Detalles
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-black text-[#1a2f1c] text-sm uppercase mb-2 line-clamp-1">{product.nombre}</h3>
        <p className="text-gray-400 text-[11px] font-medium leading-relaxed mb-4 line-clamp-2 flex-grow">
          {product.descripcion || 'Selección especial de JX4 Paracotos.'}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
          <div>
            <div className="text-xl font-black text-[#1a2f1c]">${product.precio.toFixed(2)}</div>
            <div className="text-[10px] font-bold text-gray-400">Bs. {(product.precio * tasa).toLocaleString()}</div>
          </div>
          <button
            onClick={() => onAdd(product)}
            className="w-12 h-12 bg-[#1a2f1c] text-white rounded-2xl flex items-center justify-center hover:bg-[#d4af37] transition-all shadow-lg active:scale-90"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminPanel: React.FC<{
  products: Product[];
  config: Config;
  departments: Department[];
  orders: Order[];
  jobs: Job[];
  onRefresh: () => void;
  onLogout: () => void;
}> = ({ products, config, departments, orders, jobs, onRefresh, onLogout }) => {
  const [tab, setTab] = useState<'dashboard' | 'orders' | 'inventory' | 'config' | 'branches' | 'jobs'>('dashboard');
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [editingJob, setEditingJob] = useState<Partial<Job> | null>(null);
  const [localConfig, setLocalConfig] = useState<Config>(config);
  const [saving, setSaving] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  const saveConfig = async () => {
    setSaving(true);
    try {
      await db.updateConfig(localConfig);
      onRefresh();
      showToast('Configuración guardada exitosamente', 'success');
    } catch (e) {
      showToast('Error al guardar configuración', 'error');
    }
    finally { setSaving(false); }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await db.upsertProduct(editing);
      setEditing(null);
      onRefresh();
      showToast('Producto guardado exitosamente', 'success');
    } catch (e) {
      showToast('Error al guardar producto', 'error');
    }
    finally { setSaving(false); }
  };

  const saveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await db.upsertJob(editingJob);
      setEditingJob(null);
      onRefresh();
      showToast('Vacante guardada exitosamente', 'success');
    } catch (e) {
      showToast('Error al guardar vacante', 'error');
    }
    finally { setSaving(false); }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await db.deleteProduct(id);
      onRefresh();
      showToast('Producto eliminado', 'success');
    } catch (e) {
      showToast('Error al eliminar producto', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f4] animate-fade-in pb-20">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <nav className="bg-white border-b px-6 h-20 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-[#1a2f1c] p-2 rounded-xl text-white"><Settings size={20}/></div>
          <h2 className="font-black text-lg tracking-tighter uppercase">Panel JX4</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={onRefresh} className="p-3 hover:bg-gray-100 rounded-xl transition-colors"><RefreshCcw size={20}/></button>
          <button onClick={onLogout} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"><LogOut size={20}/></button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar pb-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <Star size={18}/> },
            { id: 'orders', label: 'Pedidos', icon: <ClipboardList size={18}/> },
            { id: 'inventory', label: 'Productos', icon: <Boxes size={18}/> },
            { id: 'jobs', label: 'Empleos', icon: <Briefcase size={18}/> },
            { id: 'branches', label: 'Sucursales', icon: <Store size={18}/> },
            { id: 'config', label: 'Ajustes', icon: <Settings size={18}/> }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase transition-all flex-shrink-0 ${tab === t.id ? 'bg-[#1a2f1c] text-white shadow-xl scale-105' : 'bg-white text-gray-400'}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'dashboard' && (
          <div className="animate-fade-in">
            <Statistics orders={orders} products={products} />

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm">
                <h3 className="font-black text-xl mb-6 uppercase tracking-tighter">Pedidos Recientes</h3>
                <div className="space-y-4">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex justify-between items-center pb-4 border-b last:border-0">
                      <div>
                        <p className="font-black text-sm">#{order.order_id}</p>
                        <p className="text-xs text-gray-400">{order.nombre_cliente}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-[#d4af37]">${order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm">
                <h3 className="font-black text-xl mb-6 uppercase tracking-tighter">Productos Top</h3>
                <div className="space-y-4">
                  {products.filter(p => p.destacado).slice(0, 5).map(product => (
                    <div key={product.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
                      <img src={product.imagen_url} className="w-12 h-12 rounded-xl object-cover" />
                      <div className="flex-1">
                        <p className="font-black text-sm">{product.nombre}</p>
                        <p className="text-xs text-gray-400">{product.departamento}</p>
                      </div>
                      <p className="font-black text-[#1a2f1c]">${product.precio}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'jobs' && (
          <div className="space-y-6 animate-fade-in">
            <button onClick={() => setEditingJob({ titulo: '', descripcion: '', requisitos: '', activo: true })} className="w-full py-10 bg-white border-2 border-dashed border-gray-200 rounded-[3rem] text-gray-400 font-black uppercase text-xs hover:border-[#d4af37] hover:text-[#d4af37] transition-all flex items-center justify-center gap-3">
              <Plus size={24}/> Publicar Nueva Vacante
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.length === 0 ? <p className="col-span-full text-center py-20 opacity-20 font-black uppercase">No hay vacantes creadas</p> : jobs.map(j => (
                <div key={j.id} className="bg-white p-6 rounded-[2.5rem] flex items-center gap-4 border border-gray-50 shadow-sm hover:shadow-xl transition-all">
                  <div className="bg-[#f4f7f4] p-4 rounded-2xl text-[#1a2f1c]"><Briefcase size={24}/></div>
                  <div className="flex-1">
                    <h4 className="font-black text-[#1a2f1c] text-sm uppercase">{j.titulo}</h4>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${j.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {j.activo ? 'Activa' : 'Pausada'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingJob(j)} className="p-2 text-gray-300 hover:text-[#1a2f1c] transition-colors"><Edit3 size={18}/></button>
                    <button onClick={() => { if(confirm("¿Eliminar vacante?")) db.deleteJob(j.id!).then(onRefresh) }} className="p-2 text-red-100 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="grid gap-4 animate-fade-in">
            {orders.length === 0 ? <p className="text-center py-20 text-gray-300 font-black uppercase text-xs">Sin pedidos registrados</p> : orders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row justify-between items-center gap-4 border border-gray-50">
                <div>
                  <span className="text-[10px] font-black text-gray-300 uppercase block mb-1">#{order.order_id}</span>
                  <h4 className="font-black text-[#1a2f1c]">{order.nombre_cliente}</h4>
                  <p className="text-[10px] font-bold text-gray-400">{order.telefono_cliente} • {order.departamento} • <span className="uppercase">{order.metodo}</span></p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-[#d4af37]">${order.total.toFixed(2)}</div>
                  <div className="text-[9px] font-black text-gray-300 uppercase">Bs. {order.total_bs?.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'inventory' && (
          <div className="space-y-6 animate-fade-in">
            <button onClick={() => setEditing({ nombre: '', precio: 0, imagen_url: '', departamento: 'carnes', disponible: true, destacado: false })} className="w-full py-8 bg-white border-2 border-dashed border-gray-200 rounded-[2.5rem] text-gray-300 font-black uppercase text-[10px] hover:border-[#d4af37] transition-all flex items-center justify-center gap-2">
              <Plus size={18}/> Nuevo Producto
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-[2rem] flex items-center gap-4 border border-gray-50 shadow-sm hover:shadow-xl transition-all">
                  <img src={p.imagen_url} className="w-16 h-16 rounded-xl object-cover bg-gray-50" alt={p.nombre} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-[#1a2f1c] text-xs uppercase truncate">{p.nombre}</h4>
                    <p className="text-[9px] font-black text-[#d4af37] uppercase">${p.precio} • {p.departamento}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(p)} className="p-2 text-gray-300 hover:text-[#1a2f1c] transition-colors"><Edit3 size={18}/></button>
                    <button onClick={() => deleteProduct(p.id!)} className="p-2 text-red-100 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'config' && (
          <div className="bg-white p-10 rounded-[3rem] shadow-xl space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Tasa Dólar (Bs.)</label>
                <input type="number" step="0.1" value={localConfig.tasa_cambio} onChange={e => setLocalConfig({...localConfig, tasa_cambio: parseFloat(e.target.value)})} className="w-full p-5 bg-[#f4f7f4] rounded-2xl font-black outline-none focus:ring-2 ring-[#d4af37] transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-4">WhatsApp General</label>
                <input value={localConfig.whatsapp_general} onChange={e => setLocalConfig({...localConfig, whatsapp_general: e.target.value})} className="w-full p-5 bg-[#f4f7f4] rounded-2xl font-black outline-none focus:ring-2 ring-[#d4af37] transition-all" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Cintillo Promocional</label>
                <input value={localConfig.cintillo_promocional} onChange={e => setLocalConfig({...localConfig, cintillo_promocional: e.target.value})} className="w-full p-5 bg-[#f4f7f4] rounded-2xl font-black outline-none focus:ring-2 ring-[#d4af37] transition-all" />
              </div>
            </div>
            <button onClick={saveConfig} disabled={saving} className="w-full bg-[#1a2f1c] text-white py-6 rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-[#d4af37] active:scale-95 transition-all">
              {saving ? <Loader2 className="animate-spin mx-auto"/> : 'Guardar Ajustes'}
            </button>
          </div>
        )}
      </div>

      {editingJob && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
          <form onSubmit={saveJob} className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl animate-scale-in overflow-hidden">
            <div className="p-8 bg-[#f4f7f4] flex justify-between items-center border-b">
              <h3 className="font-black text-lg uppercase tracking-tighter">Gestionar Vacante</h3>
              <button type="button" onClick={() => setEditingJob(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X/></button>
            </div>
            <div className="p-10 space-y-4 max-h-[60vh] overflow-y-auto">
              <input placeholder="Título del Puesto" value={editingJob.titulo} onChange={e => setEditingJob({...editingJob, titulo: e.target.value})} className="w-full p-4 bg-[#f4f7f4] rounded-xl font-black outline-none focus:ring-2 ring-[#d4af37]" required />
              <textarea placeholder="Descripción del empleo" value={editingJob.descripcion} onChange={e => setEditingJob({...editingJob, descripcion: e.target.value})} className="w-full p-4 bg-[#f4f7f4] rounded-xl font-black outline-none h-32 focus:ring-2 ring-[#d4af37]" required />
              <textarea placeholder="Requisitos" value={editingJob.requisitos} onChange={e => setEditingJob({...editingJob, requisitos: e.target.value})} className="w-full p-4 bg-[#f4f7f4] rounded-xl font-black outline-none h-24 focus:ring-2 ring-[#d4af37]" />
              <label className="flex items-center gap-3 p-4 bg-[#f4f7f4] rounded-xl cursor-pointer">
                <input type="checkbox" checked={editingJob.activo} onChange={e => setEditingJob({...editingJob, activo: e.target.checked})} className="w-6 h-6 rounded-md accent-[#1a2f1c]" />
                <span className="font-black uppercase text-[10px]">Vacante Activa</span>
              </label>
            </div>
            <div className="p-8 border-t">
              <button type="submit" disabled={saving} className="w-full bg-[#1a2f1c] text-white py-4 rounded-xl font-black uppercase text-xs hover:bg-[#d4af37] transition-all">
                {saving ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Publicar en JX4'}
              </button>
            </div>
          </form>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
          <form onSubmit={saveProduct} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl animate-scale-in overflow-hidden">
            <div className="p-8 bg-[#f4f7f4] flex justify-between items-center border-b">
              <h3 className="font-black text-lg uppercase tracking-tighter">Editar Producto</h3>
              <button type="button" onClick={() => setEditing(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X/></button>
            </div>
            <div className="p-10 space-y-4 max-h-[60vh] overflow-y-auto">
              <input placeholder="Nombre" value={editing.nombre} onChange={e => setEditing({...editing, nombre: e.target.value})} className="w-full p-4 bg-[#f4f7f4] rounded-xl font-black outline-none focus:ring-2 ring-[#d4af37]" required />
              <input type="number" step="0.01" placeholder="Precio $" value={editing.precio} onChange={e => setEditing({...editing, precio: parseFloat(e.target.value)})} className="w-full p-4 bg-[#f4f7f4] rounded-xl font-black outline-none focus:ring-2 ring-[#d4af37]" required />
              <select value={editing.departamento} onChange={e => setEditing({...editing, departamento: e.target.value})} className="w-full p-4 bg-[#f4f7f4] rounded-xl font-black outline-none focus:ring-2 ring-[#d4af37]">
                {departments.map(d => <option key={d.slug} value={d.slug}>{d.nombre}</option>)}
              </select>
              <input placeholder="URL Imagen" value={editing.imagen_url} onChange={e => setEditing({...editing, imagen_url: e.target.value})} className="w-full p-4 bg-[#f4f7f4] rounded-xl font-black outline-none focus:ring-2 ring-[#d4af37]" />
              <textarea placeholder="Descripción" value={editing.descripcion} onChange={e => setEditing({...editing, descripcion: e.target.value})} className="w-full p-4 bg-[#f4f7f4] rounded-xl font-black outline-none h-24 focus:ring-2 ring-[#d4af37]" />
              <label className="flex items-center gap-3 p-4 bg-[#f4f7f4] rounded-xl cursor-pointer">
                <input type="checkbox" checked={editing.destacado} onChange={e => setEditing({...editing, destacado: e.target.checked})} className="w-6 h-6 rounded-md accent-[#1a2f1c]" />
                <span className="font-black uppercase text-[10px]">Producto Destacado</span>
              </label>
            </div>
            <div className="p-8 border-t">
              <button type="submit" disabled={saving} className="w-full bg-[#1a2f1c] text-white py-4 rounded-xl font-black uppercase text-xs hover:bg-[#d4af37] transition-all">
                {saving ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const CheckoutModal: React.FC<{
  cart: CartItem[];
  config: Config;
  departments: Department[];
  onClose: () => void;
  onClear: () => void;
  showToast: (msg: string, type: any) => void;
}> = ({ cart, config, departments, onClose, onClear, showToast }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: localStorage.getItem('jx4_name') || '',
    phone: localStorage.getItem('jx4_phone') || '',
    metodo: 'retiro'
  });

  const handleConfirm = async () => {
    if (!formData.nombre || !formData.phone) {
      showToast('Completa tus datos para continuar', 'warning');
      return;
    }

    setLoading(true);
    localStorage.setItem('jx4_name', formData.nombre);
    localStorage.setItem('jx4_phone', formData.phone);

    const total = cart.reduce((a, b) => a + (b.precio * b.quantity), 0);
    const totalBs = total * config.tasa_cambio;
    const deptSlug = cart[0].departamento;
    const dept = departments.find(d => d.slug === deptSlug);
    const targetPhone = dept?.telefono_whatsapp || config.whatsapp_general;
    const orderId = Math.random().toString(36).substr(2, 6).toUpperCase();

    const orderPayload = {
      order_id: orderId,
      nombre_cliente: formData.nombre,
      telefono_cliente: formData.phone,
      productos: cart,
      total,
      total_bs: totalBs,
      tasa_aplicada: config.tasa_cambio,
      metodo: formData.metodo,
      departamento: deptSlug,
      estado: 'pendiente'
    };

    let msg = `🛒 *JX4 PARACOTOS - PEDIDO #${orderId}*%0A%0A`;
    msg += `👤 *CLIENTE:* ${formData.nombre}%0A`;
    msg += `📞 *TEL:* ${formData.phone}%0A%0A`;
    msg += `📦 *PRODUCTOS:*%0A`;
    cart.forEach(it => msg += `- ${it.nombre} (x${it.quantity})%0A`);
    msg += `%0A💵 *TOTAL:* USD ${total.toFixed(2)}%0A`;
    msg += `💰 *MONTO BS:* ${totalBs.toLocaleString('es-VE')}%0A`;
    msg += `📍 *MÉTODO:* ${formData.metodo.toUpperCase()}%0A`;

    try {
      await db.createOrder(orderPayload);
      showToast('Pedido creado exitosamente', 'success');
      window.open(`https://wa.me/${targetPhone}?text=${msg}`, '_blank');
      onClear();
      onClose();
    } catch (e) {
      showToast('Pedido enviado a WhatsApp', 'info');
      window.open(`https://wa.me/${targetPhone}?text=${msg}`, '_blank');
      onClear();
      onClose();
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[1000] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl animate-scale-in overflow-hidden">
        <div className="p-8 bg-[#f4f7f4] text-center border-b">
          <h3 className="text-xl font-black text-[#1a2f1c] uppercase tracking-tighter">Finalizar Pedido</h3>
          <p className="text-[10px] text-gray-400 font-black uppercase mt-1">Sucursal: {cart[0].departamento}</p>
        </div>
        <div className="p-10 space-y-4">
          <input value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full p-4 bg-[#f4f7f4] rounded-2xl font-black outline-none border-2 border-transparent focus:border-[#d4af37] transition-all" placeholder="Tu Nombre Completo" />
          <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 bg-[#f4f7f4] rounded-2xl font-black outline-none border-2 border-transparent focus:border-[#d4af37] transition-all" placeholder="Tu WhatsApp" />
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setFormData({...formData, metodo: 'retiro'})} className={`p-4 rounded-xl font-black text-[10px] uppercase border-2 transition-all ${formData.metodo === 'retiro' ? 'bg-[#1a2f1c] text-white border-[#1a2f1c]' : 'bg-[#f4f7f4] text-gray-400 border-transparent'}`}>🏠 Retiro</button>
            <button type="button" onClick={() => setFormData({...formData, metodo: 'delivery'})} className={`p-4 rounded-xl font-black text-[10px] uppercase border-2 transition-all ${formData.metodo === 'delivery' ? 'bg-[#1a2f1c] text-white border-[#1a2f1c]' : 'bg-[#f4f7f4] text-gray-400 border-transparent'}`}>🚚 Delivery</button>
          </div>
          <button onClick={handleConfirm} disabled={loading} className="w-full bg-[#d4af37] text-white py-6 rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-[#c49d31] active:scale-95 transition-all">
            {loading ? <Loader2 className="animate-spin mx-auto"/> : 'Confirmar Pedido'}
          </button>
          <button type="button" onClick={onClose} className="w-full py-2 text-gray-300 font-black uppercase text-[9px] tracking-widest hover:text-gray-500 transition-colors">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [data, setData] = useState<{ products: Product[], config: Config | null, departments: Department[], orders: Order[], jobs: Job[] }>({
    products: [], config: null, departments: [], orders: [], jobs: []
  });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'home' | 'cart' | 'login' | 'admin' | 'jobs'>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toasts, showToast, removeToast } = useToast();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [c, p, d, o, j] = await Promise.all([db.getConfig(), db.getProducts(), db.getDepartments(), db.getOrders(), db.getJobs()]);
      setData({ config: c, products: p, departments: d, orders: o, jobs: j });
    } catch (e) {
      console.error(e);
      showToast('Error al cargar datos', 'error');
    }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { refreshData(); }, [refreshData]);

  const addToCart = (p: Product, qty: number = 1) => {
    if (cart.length > 0 && cart[0].departamento !== p.departamento) {
      if (!confirm("Mezclar sucursales enviará el pedido a un solo lugar. ¿Vaciar carrito actual?")) return;
      setCart([{...p, quantity: qty}]);
      showToast('Carrito actualizado', 'info');
      return;
    }
    const existing = cart.find(i => i.id === p.id);
    if (existing) {
      setCart(cart.map(i => i.id === p.id ? {...i, quantity: i.quantity + qty} : i));
    } else {
      setCart([...cart, {...p, quantity: qty}]);
    }
    showToast(`${p.nombre} agregado al carrito`, 'success');
  };

  const filtered = useMemo(() => {
    let result = data.products;

    if (selectedDept) {
      result = result.filter(p => p.departamento === selectedDept);
    }

    if (searchQuery) {
      result = result.filter(p =>
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.departamento.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [data.products, selectedDept, searchQuery]);

  if (loading || !data.config) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f7f4]">
        <Loader2 className="animate-spin text-[#1a2f1c] mb-4" size={48}/>
        <p className="font-black text-sm uppercase text-[#1a2f1c] tracking-wider">Cargando JX4 Paracotos...</p>
      </div>
    );
  }

  if (view === 'admin') return <AdminPanel {...data} config={data.config} onRefresh={refreshData} onLogout={() => setView('home')} />;

  return (
    <div className="min-h-screen bg-[#f4f7f4] pb-32 flex flex-col font-sans text-[#1a2f1c]">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="bg-[#1a2f1c] text-white py-3 px-6 text-[9px] font-black uppercase tracking-widest text-center">{data.config.cintillo_promocional}</div>

      <header className="px-6 py-8 flex items-center justify-between container mx-auto">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => {setView('home'); setSelectedDept(null); setSearchQuery('');}}>
          <div className="w-20 h-20 bg-white rounded-3xl shadow-2xl p-2 flex items-center justify-center border border-gray-100 overflow-hidden">
            {data.config.logo_url ? <img src={data.config.logo_url} className="w-full h-full object-contain" alt="Logo" /> : <Beef className="text-[#1a2f1c]" size={36}/>}
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter leading-none mb-1">JX4 PARACOTOS</h1>
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{data.config.slogan}</p>
          </div>
        </div>
        <button onClick={() => setView('login')} className="p-4 bg-white rounded-2xl text-gray-300 shadow-sm border border-gray-50 hover:text-[#1a2f1c] hover:shadow-lg transition-all"><Settings size={22}/></button>
      </header>

      <main className="px-6 flex-grow container mx-auto">
        {view === 'login' ? (
          <div className="max-w-md mx-auto py-12 animate-fade-in">
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              try {
                await db.login(fd.get('u') as string, fd.get('p') as string);
                setView('admin');
                showToast('Sesión iniciada', 'success');
              } catch (e) {
                showToast('Credenciales incorrectas', 'error');
              }
            }} className="bg-white p-12 rounded-[3rem] shadow-2xl space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black uppercase tracking-tighter">Panel Admin</h2>
                <p className="text-xs text-gray-400 font-bold mt-2">Ingresa tus credenciales</p>
              </div>
              <input name="u" placeholder="Usuario" className="w-full p-5 bg-[#f4f7f4] rounded-2xl font-black outline-none focus:ring-2 ring-[#d4af37] transition-all" required />
              <input name="p" type="password" placeholder="Contraseña" className="w-full p-5 bg-[#f4f7f4] rounded-2xl font-black outline-none focus:ring-2 ring-[#d4af37] transition-all" required />
              <button type="submit" className="w-full bg-[#1a2f1c] text-white py-5 rounded-2xl font-black uppercase text-xs hover:bg-[#d4af37] transition-all shadow-xl">Acceder</button>
              <button type="button" onClick={() => setView('home')} className="w-full text-gray-300 font-black uppercase text-[10px] py-2 hover:text-gray-500 transition-colors">Volver</button>
            </form>
          </div>
        ) : view === 'jobs' ? (
          <div className="max-w-3xl mx-auto py-6 animate-fade-in">
            <h2 className="text-3xl font-black text-[#1a2f1c] mb-10 tracking-tighter uppercase">Bolsa de Trabajo</h2>
            {data.jobs.filter(j => j.activo).length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                <Briefcase className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-gray-300 font-black uppercase text-xs">No hay vacantes abiertas por ahora</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {data.jobs.filter(j => j.activo).map(job => (
                  <div key={job.id} className="bg-white p-10 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all border border-gray-50">
                    <h3 className="text-xl font-black text-[#1a2f1c] uppercase mb-4">{job.titulo}</h3>
                    <p className="text-gray-500 font-medium leading-relaxed mb-6">{job.descripcion}</p>
                    {job.requisitos && (
                      <div className="bg-[#f4f7f4] p-4 rounded-xl mb-6">
                        <p className="text-xs font-bold text-gray-600">{job.requisitos}</p>
                      </div>
                    )}
                    <button
                      onClick={() => window.open(`https://wa.me/${data.config?.whatsapp_general}?text=Hola, estoy interesado en la vacante de "${job.titulo}".`, '_blank')}
                      className="bg-[#1a2f1c] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 hover:bg-[#d4af37] transition-all"
                    >
                      Postularme <ChevronRight size={14}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : view === 'cart' ? (
          <div className="max-w-2xl mx-auto py-6 animate-fade-in">
            <h2 className="text-3xl font-black text-[#1a2f1c] mb-10 tracking-tighter uppercase">Carrito</h2>
            {cart.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-[3rem]">
                <ShoppingBag className="mx-auto text-gray-200 mb-4" size={64} />
                <p className="text-gray-300 font-black uppercase text-sm">Tu carrito está vacío</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-[3rem] shadow-sm p-8 space-y-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
                      <img src={item.imagen_url} className="w-16 h-16 rounded-2xl object-cover" alt={item.nombre} />
                      <div className="flex-1">
                        <h4 className="font-black text-[#1a2f1c] text-sm uppercase">{item.nombre}</h4>
                        <p className="text-xs font-black text-[#d4af37]">${(item.precio * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-[#f4f7f4] px-4 py-2 rounded-xl">
                        <button onClick={() => setCart(cart.map(i => i.id === item.id ? {...i, quantity: Math.max(1, i.quantity - 1)} : i))} className="hover:text-[#d4af37] transition-colors"><Minus size={14}/></button>
                        <span className="font-black text-sm w-8 text-center">{item.quantity}</span>
                        <button onClick={() => setCart(cart.map(i => i.id === item.id ? {...i, quantity: i.quantity + 1} : i))} className="hover:text-[#d4af37] transition-colors"><Plus size={14}/></button>
                      </div>
                      <button onClick={() => {setCart(cart.filter(i => i.id !== item.id)); showToast('Producto eliminado', 'info');}} className="text-red-300 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                    </div>
                  ))}
                </div>
                <div className="bg-[#1a2f1c] p-10 rounded-[3rem] text-white shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                  <div>
                    <div className="text-4xl font-black">$ {cart.reduce((a, b) => a + (b.precio * b.quantity), 0).toFixed(2)}</div>
                    <div className="text-[#d4af37] font-black text-sm uppercase mt-1">Bs. {(cart.reduce((a, b) => a + (b.precio * b.quantity), 0) * data.config.tasa_cambio).toLocaleString()}</div>
                  </div>
                  <button onClick={() => setShowCheckout(true)} className="w-full md:w-auto bg-[#d4af37] text-[#1a2f1c] px-10 py-6 rounded-2xl font-black uppercase text-xs hover:bg-[#c49d31] active:scale-95 transition-all shadow-xl">Continuar</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mb-8 animate-fade-in">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>

            <div className="flex gap-2 mb-10 overflow-x-auto hide-scrollbar py-2">
              <button onClick={() => setSelectedDept(null)} className={`px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase transition-all flex-shrink-0 ${!selectedDept ? 'bg-[#1a2f1c] text-white shadow-xl scale-105' : 'bg-white text-gray-400 border hover:shadow-md'}`}>
                🏠 Todo
              </button>
              {data.departments.map(d => (
                <button key={d.id} onClick={() => setSelectedDept(d.slug)} className={`px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase transition-all flex-shrink-0 ${selectedDept === d.slug ? 'bg-[#1a2f1c] text-white shadow-xl scale-105' : 'bg-white text-gray-400 border hover:shadow-md'}`}>
                  {d.nombre}
                </button>
              ))}
            </div>

            {loading ? (
              <SkeletonGrid count={8} />
            ) : filtered.length === 0 ? (
              <div className="text-center py-32">
                <p className="text-gray-300 font-black uppercase text-sm">No se encontraron productos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
                {filtered.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAdd={addToCart}
                    onView={setSelectedProduct}
                    tasa={data.config!.tasa_cambio}
                    isFavorite={isFavorite(p.id!)}
                    onToggleFavorite={() => toggleFavorite(p.id!)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-md glassmorphism rounded-[2.5rem] px-4 py-3 flex items-center justify-around shadow-2xl z-50 border border-white/60">
        <button
          onClick={() => {setView('home'); setSelectedDept(null); setSearchQuery('');}}
          className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${view === 'home' && !selectedDept ? 'bg-[#1a2f1c] text-white shadow-lg scale-110' : 'text-gray-400 hover:text-[#1a2f1c]'}`}
        >
          <Home size={22}/>
          <span className="text-[7px] font-black uppercase">Inicio</span>
        </button>

        <button
          onClick={() => setView('cart')}
          className={`flex flex-col items-center gap-1 p-3 relative rounded-2xl transition-all ${view === 'cart' ? 'bg-[#1a2f1c] text-white shadow-lg scale-110' : 'text-gray-400 hover:text-[#1a2f1c]'}`}
        >
          <ShoppingBag size={22}/>
          {cart.length > 0 && (
            <span className="absolute top-1 right-2 bg-[#d4af37] text-[#1a2f1c] text-[8px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
              {cart.length}
            </span>
          )}
          <span className="text-[7px] font-black uppercase">Carrito</span>
        </button>

        <button
          onClick={() => { setSelectedDept('transporte'); setView('home'); }}
          className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${selectedDept === 'transporte' ? 'bg-[#1a2f1c] text-white shadow-lg scale-110' : 'text-gray-400 hover:text-[#1a2f1c]'}`}
        >
          <Truck size={22}/>
          <span className="text-[7px] font-black uppercase">Fletes</span>
        </button>

        <button
          onClick={() => setView('jobs')}
          className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${view === 'jobs' ? 'bg-[#1a2f1c] text-white shadow-lg scale-110' : 'text-gray-400 hover:text-[#1a2f1c]'}`}
        >
          <Briefcase size={22}/>
          <span className="text-[7px] font-black uppercase">Trabajo</span>
        </button>
      </nav>

      {showCheckout && (
        <CheckoutModal
          cart={cart}
          config={data.config}
          departments={data.departments}
          onClose={() => setShowCheckout(false)}
          onClear={() => setCart([])}
          showToast={showToast}
        />
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          tasa={data.config.tasa_cambio}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
          isFavorite={isFavorite(selectedProduct.id!)}
          onToggleFavorite={() => toggleFavorite(selectedProduct.id!)}
        />
      )}
    </div>
  );
};

export default App;
