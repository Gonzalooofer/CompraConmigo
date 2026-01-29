
import React, { useState } from 'react';
import { X, Plus, Settings, LogOut, Edit2 } from 'lucide-react';
import { Group, User } from '../types';
import { SettingsModal } from './SettingsModal';
import { ProfileEditModal } from './ProfileEditModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
  currentGroupId: string;
  onSelectGroup: (groupId: string) => void;
  onAddNewGroup: () => void;
  currentUser: User | null;
  onLogout: () => void;
  onLogin: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onUpdateUser: (userId: string, data: Partial<User>) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  groups,
  currentGroupId,
  onSelectGroup,
  onAddNewGroup,
  currentUser,
  onLogout,
  onLogin,
  isDarkMode,
  onToggleTheme,
  onUpdateUser
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed inset-y-0 left-0 w-3/4 max-w-xs bg-white dark:bg-slate-900 z-[51] transform transition-transform duration-300 ease-out shadow-2xl flex flex-col border-r border-slate-100 dark:border-slate-800 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <h2 className="text-xl font-black text-slate-800 dark:text-white">Menú</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* User Profile Section */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          {currentUser ? (
            <div 
              className="flex items-center space-x-3 cursor-pointer group p-2 -ml-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setShowProfileEdit(true)}
            >
              <div className="relative">
                <img src={currentUser.avatar} alt="Avatar" className="w-12 h-12 rounded-2xl border-2 border-white dark:border-slate-700 shadow-md group-hover:scale-105 transition-transform" />
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-700 p-0.5 rounded-full border border-slate-100 dark:border-slate-600">
                  <Edit2 size={10} className="text-slate-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-500 truncate">{currentUser.email || 'Editar perfil'}</p>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => { onLogin(); onClose(); }}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50"
            >
              Iniciar Sesión
            </button>
          )}
        </div>

        {/* Groups List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mis Grupos</h3>
              <button 
                onClick={() => { onAddNewGroup(); onClose(); }}
                className="text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-1 rounded transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div className="space-y-2">
              {groups.map(group => (
                <button
                  key={group.id}
                  onClick={() => { onSelectGroup(group.id); onClose(); }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    currentGroupId === group.id 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-500/30 ring-1 ring-emerald-500/20' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm ${currentGroupId === group.id ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800'} text-slate-800 dark:text-white`}>
                      {group.icon}
                    </div>
                    <div className="text-left">
                      <p className={`font-bold text-sm ${currentGroupId === group.id ? 'text-emerald-900 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {group.name}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        {group.members.length} miembros
                      </p>
                    </div>
                  </div>
                  {currentGroupId === group.id && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2 bg-slate-50 dark:bg-slate-900">
          <button 
            onClick={() => { setShowSettings(true); onClose(); }}
            className="w-full flex items-center space-x-3 p-3 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Settings size={18} />
            <span className="font-medium text-sm">Configuración</span>
          </button>
          {currentUser && (
            <button 
              onClick={() => { onLogout(); onClose(); }}
              className="w-full flex items-center space-x-3 p-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            >
              <LogOut size={18} />
              <span className="font-medium text-sm">Cerrar Sesión</span>
            </button>
          )}
        </div>

      </div>

      {showSettings && (
        <SettingsModal 
          onClose={() => setShowSettings(false)}
          isDarkMode={isDarkMode}
          onToggleTheme={onToggleTheme}
        />
      )}

      {showProfileEdit && currentUser && (
        <ProfileEditModal 
          user={currentUser}
          onClose={() => setShowProfileEdit(false)}
          onSave={onUpdateUser}
        />
      )}
    </>
  );
};
