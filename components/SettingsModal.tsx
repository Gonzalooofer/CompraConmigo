
import React from 'react';
import { X, Moon, Sun, Monitor, ChevronRight } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, isDarkMode, onToggleTheme }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Configuración</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Apariencia</label>
            
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-500/20 text-orange-500'}`}>
                  {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-200">Modo Oscuro</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{isDarkMode ? 'Activado' : 'Desactivado'}</p>
                </div>
              </div>
              
              <button 
                onClick={onToggleTheme}
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out ${isDarkMode ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <div className="space-y-3 opacity-50 pointer-events-none grayscale">
             <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Notificaciones</label>
             <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 flex items-center justify-between">
               <span className="font-medium text-slate-700 dark:text-slate-300">Alertas de precios</span>
               <div className="w-14 h-8 bg-emerald-500 rounded-full p-1"><div className="w-6 h-6 bg-white rounded-full translate-x-6"></div></div>
             </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-400">Versión 2.0.1 (Beta)</p>
          </div>

        </div>
      </div>
    </div>
  );
};
