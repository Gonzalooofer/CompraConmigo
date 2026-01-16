
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ProductItem, User } from '../types';

interface ExpenseSplitterProps {
  items: ProductItem[];
  users: User[];
}

export const ExpenseSplitter: React.FC<ExpenseSplitterProps> = ({ items, users }) => {
  // Only calculate for checked items (items actually bought)
  const boughtItems = items.filter(item => item.checked);
  const totalSpent = boughtItems.reduce((acc, item) => acc + (item.estimatedPrice * item.quantity), 0);
  
  const userExpenses = users.map(user => {
    let personalTotal = 0;
    let sharedPortion = 0;

    boughtItems.forEach(item => {
      const itemCost = item.estimatedPrice * item.quantity;
      if (item.assignedTo === user.id) {
        personalTotal += itemCost;
      } else if (!item.assignedTo) {
        sharedPortion += itemCost / users.length;
      }
    });

    return {
      name: user.name,
      value: personalTotal + sharedPortion,
      color: user.color.replace('bg-', 'text-') 
    };
  });

  const COLORS = ['#3b82f6', '#ec4899', '#22c55e', '#f59e0b'];

  return (
    <div className="pb-24 space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
        <p className="text-slate-500 font-medium mb-1">Gasto Total Realizado</p>
        <h2 className="text-4xl font-bold text-slate-800 dark:text-white">${totalSpent.toFixed(2)}</h2>
        <p className="text-xs text-slate-400 dark:text-slate-600 mt-2">Solo incluye ítems marcados</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 h-80">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 px-2">Desglose por Persona</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={userExpenses}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {userExpenses.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => `$${value.toFixed(2)}`} 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#94a3b8' }}/>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 px-2">Detalle</h3>
        {userExpenses.map((data, index) => (
          <div key={index} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">{data.name}</span>
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-100">${data.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
