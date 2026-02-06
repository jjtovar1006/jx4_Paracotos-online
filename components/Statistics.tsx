import React from 'react';
import { TrendingUp, ShoppingCart, DollarSign, Package } from 'lucide-react';
import { Order, Product } from '../types';

interface StatisticsProps {
  orders: Order[];
  products: Product[];
}

export const Statistics: React.FC<StatisticsProps> = ({ orders, products }) => {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const activeProducts = products.filter(p => p.disponible).length;

  const stats = [
    {
      label: 'Ingresos Totales',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: <DollarSign size={24} />,
      color: 'bg-green-500',
      bgLight: 'bg-green-50'
    },
    {
      label: 'Pedidos Realizados',
      value: totalOrders.toString(),
      icon: <ShoppingCart size={24} />,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50'
    },
    {
      label: 'Valor Promedio',
      value: `$${avgOrderValue.toFixed(2)}`,
      icon: <TrendingUp size={24} />,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50'
    },
    {
      label: 'Productos Activos',
      value: activeProducts.toString(),
      icon: <Package size={24} />,
      color: 'bg-orange-500',
      bgLight: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className={`${stat.bgLight} ${stat.color.replace('bg-', 'text-')} p-3 rounded-xl`}>
              {stat.icon}
            </div>
          </div>
          <div className="text-3xl font-black text-[#1a2f1c] mb-1">{stat.value}</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};
