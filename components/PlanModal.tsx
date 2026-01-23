
import React from 'react';
import { X, Check, Star, Zap, Users } from 'lucide-react';
import { User } from '../types';

interface PlanModalProps {
  onClose: () => void;
  currentUser: User;
  onUpgrade: (plan: 'free' | 'premium' | 'family') => void;
}

export const PlanModal: React.FC<PlanModalProps> = ({ onClose, currentUser, onUpgrade }) => {
  const plans = [
    {
      id: 'free',
      name: 'Básico',
      price: 'Gratis',
      icon: <Zap size={20} />,
      features: ['Listas ilimitadas', 'Hasta 3 miembros', 'Escáner básico'],
      color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
      btnColor: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '2.99€/mes',
      icon: <Star size={20} />,
      features: ['Miembros ilimitados', 'Escáner IA ilimitado', 'Comparador de precios', 'Sin anuncios'],
      color: 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-500 border border-amber-200 dark:border-amber-500/30',
      btnColor: 'bg-amber-500 text-white shadow-lg shadow-amber-200 dark:shadow-amber-900/50'
    },
    {
      id: 'family',
      name: 'Familia',
      price: '4.99€/mes',
      icon: <Users size={20} />,
      features: ['Todo lo de Premium', 'Hasta 6 cuentas', 'Gestión de roles', 'Soporte prioritario'],
      color: 'bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-500/30',
      btnColor: 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50'
    }
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Mejorar Plan</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Desbloquea todo el potencial</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`p-5 rounded-2xl relative transition-transform hover:scale-[1.01] ${plan.color}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-sm`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h4 className="font-black text-lg">{plan.name}</h4>
                    <p className="font-medium opacity-80">{plan.price}</p>
                  </div>
                </div>
                {currentUser.plan === plan.id && (
                  <span className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    Actual
                  </span>
                )}
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm font-medium opacity-90">
                    <Check size={16} className="mr-2 opacity-70" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => { onUpgrade(plan.id as any); onClose(); }}
                disabled={currentUser.plan === plan.id}
                className={`w-full py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${plan.btnColor}`}
              >
                {currentUser.plan === plan.id ? 'Plan Actual' : `Elegir ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
