
import React from 'react';
import { Beef, Bird, Sandwich, Fish } from 'lucide-react';
import { DepartmentSlug } from './types';

export const DEPARTMENTS: { slug: DepartmentSlug; name: string; icon: React.ReactNode; color: string }[] = [
  { slug: 'carnes', name: 'Carnes', icon: <Beef size={24} />, color: '#ef4444' },
  { slug: 'aves', name: 'Aves', icon: <Bird size={24} />, color: '#f59e0b' },
  { slug: 'embutidos', name: 'Embutidos', icon: <Sandwich size={24} />, color: '#10b981' },
  { slug: 'pescados', name: 'Pescados', icon: <Fish size={24} />, color: '#3b82f6' },
];

export const APP_CONFIG_DEFAULT = {
  tasa_cambio: 36.5,
  cintillo_promocional: '¡Envíos gratis en pedidos mayores a $50!',
  whatsapp_enabled: true
};
