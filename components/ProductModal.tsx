import React, { useState } from 'react';
import { X, Plus, Minus, Heart, ChefHat, Loader2, Star } from 'lucide-react';
import { Product } from '../types';
import { getCookingTip } from '../services/geminiService';

interface ProductModalProps {
  product: Product;
  tasa: number;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  tasa,
  onClose,
  onAddToCart,
  isFavorite,
  onToggleFavorite
}) => {
  const [quantity, setQuantity] = useState(1);
  const [tip, setTip] = useState<string | null>(null);
  const [loadingTip, setLoadingTip] = useState(false);

  const fetchTip = async () => {
    if (tip) { setTip(null); return; }
    setLoadingTip(true);
    const result = await getCookingTip(product.nombre);
    setTip(result);
    setLoadingTip(false);
  };

  const handleAdd = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[2000] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-[3rem] max-w-4xl w-full shadow-2xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="relative">
          <div className="h-96 bg-[#f4f7f4] flex items-center justify-center p-8">
            <img
              src={product.imagen_url || 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=800'}
              className="max-h-full max-w-full object-contain"
              alt={product.nombre}
            />
          </div>

          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
          >
            <X size={24} />
          </button>

          <button
            onClick={onToggleFavorite}
            className="absolute top-6 left-6 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
          >
            <Heart size={24} fill={isFavorite ? '#d4af37' : 'none'} className={isFavorite ? 'text-[#d4af37]' : 'text-gray-400'} />
          </button>

          {product.destacado && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-[#d4af37] text-white px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
              <Star size={16} fill="white"/>
              <span className="font-black text-xs uppercase">Producto Destacado</span>
            </div>
          )}
        </div>

        <div className="p-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{product.departamento}</span>
              <h2 className="text-3xl font-black text-[#1a2f1c] mt-2 mb-3">{product.nombre}</h2>
              <p className="text-gray-500 leading-relaxed">
                {product.descripcion || 'Producto de alta calidad seleccionado especialmente para ti en JX4 Paracotos.'}
              </p>
            </div>
            <div className="text-right ml-6">
              <div className="text-4xl font-black text-[#1a2f1c]">${product.precio.toFixed(2)}</div>
              <div className="text-sm font-bold text-gray-400">Bs. {(product.precio * tasa).toLocaleString()}</div>
            </div>
          </div>

          <button
            onClick={fetchTip}
            className="w-full py-4 bg-[#fcf9f0] text-[#d4af37] rounded-2xl font-black text-sm flex items-center justify-center gap-2 mb-6 hover:bg-[#fef6e6] transition-all border-2 border-[#d4af37]/20"
          >
            <ChefHat size={20} />
            {loadingTip ? 'Consultando chef...' : tip ? 'Ocultar consejo' : 'Obtener consejo de cocina'}
          </button>

          {tip && (
            <div className="bg-[#fcf9f0] p-6 rounded-2xl mb-6 animate-fade-in border border-[#d4af37]/10">
              <p className="text-sm text-[#1a2f1c] font-bold italic leading-relaxed">"{tip}"</p>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 bg-[#f4f7f4] px-6 py-4 rounded-2xl">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 bg-white rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <Minus size={20} />
              </button>
              <span className="font-black text-2xl w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 bg-white rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            <button
              onClick={handleAdd}
              className="flex-1 bg-[#1a2f1c] text-white py-6 rounded-2xl font-black uppercase text-sm hover:bg-[#d4af37] transition-all shadow-xl active:scale-95"
            >
              Agregar ${(product.precio * quantity).toFixed(2)} al Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
