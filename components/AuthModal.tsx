
import React, { useState } from 'react';
import { X, User, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (name: string) => void;
  allowClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin, allowClose = true }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return;
    onLogin(name.trim());
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm ${!allowClose ? 'bg-slate-950' : ''}`}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
        <div className="p-8 text-center space-y-6">
          
          <div className="flex justify-between items-start">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-500 mx-auto ml-0 shadow-sm">
              <span className="text-3xl">👋</span>
            </div>
            {allowClose && (
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            )}
          </div>
          
          <div className="text-left space-y-2">
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              ¡Bienvenido!
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Introduce tu nombre para empezar a organizar tus compras.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="¿Cómo te llamas?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-lg font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600"
                autoFocus
              />
            </div>

            <button 
              type="submit"
              disabled={!name.trim()}
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50 hover:bg-emerald-700 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              <span>Entrar</span>
              <ArrowRight size={20} />
            </button>
          </form>

          <p className="text-xs text-slate-400 dark:text-slate-600 font-medium pt-2">
            Al entrar, te unirás automáticamente a tu grupo predeterminado.
          </p>
        </div>
      </div>
    </div>
  );
};
