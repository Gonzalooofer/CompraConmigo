
import React, { useState } from 'react';
import { X, Moon, Sun, Bell, Globe, Phone, Mail, LogOut, Trash2, ChevronRight, Crown, CreditCard } from 'lucide-react';
import { User } from '../types';
import { PlanModal } from './PlanModal';

interface SettingsModalProps {
  onClose: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  currentUser: User;
  onUpdateUser: (userId: string, data: Partial<User>) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  onClose, 
  isDarkMode, 
  onToggleTheme, 
  currentUser, 
  onUpdateUser,
  onLogout,
  onDeleteAccount
}) => {
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phoneNumber || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState('es');

  const handleSaveProfile = () => {
    onUpdateUser(currentUser.id, {
      email,
      phoneNumber: phone
    });
  };

  return (
    <>
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm sm:max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 shrink-0">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Configuración</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Plan Banner */}
          <div 
            onClick={() => setShowPlanModal(true)}
            className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 cursor-pointer relative overflow-hidden group"
          >
             <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Crown size={80} />
             </div>
             <div className="relative z-10 flex items-center justify-between">
                <div>
                   <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Tu Plan Actual</p>
                   <h4 className="text-xl font-black">{currentUser.plan === 'premium' ? 'Premium' : currentUser.plan === 'family' ? 'Familia' : 'Básico'}</h4>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg hover:bg-white/30 transition-colors">
                   <ChevronRight size={20} />
                </div>
             </div>
          </div>

          {/* Account Section */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cuenta y Contacto</label>
            
            <div className="space-y-3">
               <div className="relative group">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={handleSaveProfile}
                    placeholder="Tu correo electrónico"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium text-slate-800 dark:text-slate-200"
                 />
               </div>
               
               <div className="relative group">
                 <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onBlur={handleSaveProfile}
                    placeholder="Teléfono (para Bizum)"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium text-slate-800 dark:text-slate-200"
                 />
                 <p className="text-[10px] text-slate-400 mt-1 pl-1">Necesario para que te hagan Bizum automáticamente.</p>
               </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Preferencias</label>
            
            {/* Theme */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
               <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-500/20 text-orange-500'}`}>
                    {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Modo Oscuro</span>
               </div>
               <button 
                  onClick={onToggleTheme}
                  className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out ${isDarkMode ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
               <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-500">
                    <Bell size={18} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Notificaciones</span>
               </div>
               <button 
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out ${notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            </div>

            {/* Language */}
             <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
               <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-pink-500/20 text-pink-500">
                    <Globe size={18} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Idioma</span>
               </div>
               <select 
                 value={language}
                 onChange={(e) => setLanguage(e.target.value)}
                 className="bg-transparent text-sm font-bold text-slate-500 outline-none text-right"
               >
                 <option value="es">Español</option>
                 <option value="en">English</option>
                 <option value="fr">Français</option>
               </select>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
             <button 
               onClick={() => { onLogout(); onClose(); }}
               className="w-full flex items-center justify-between p-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors font-medium text-sm"
             >
               <span className="flex items-center space-x-2"><LogOut size={18} /> <span>Cerrar Sesión</span></span>
             </button>
             
             <button 
               onClick={onDeleteAccount}
               className="w-full flex items-center justify-between p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium text-sm"
             >
               <span className="flex items-center space-x-2"><Trash2 size={18} /> <span>Eliminar Cuenta</span></span>
             </button>
          </div>

        </div>
      </div>
    </div>

    {showPlanModal && (
      <PlanModal 
        currentUser={currentUser}
        onClose={() => setShowPlanModal(false)}
        onUpgrade={(plan) => {
          onUpdateUser(currentUser.id, { plan });
          setShowPlanModal(false);
        }}
      />
    )}
    </>
  );
};
