
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
  onDeleteAccount: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
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
  onUpdateUser,
  onDeleteAccount,
  language,
  onLanguageChange
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
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
          {currentUser ? (
            <div
              className="flex items-center space-x-4 cursor-pointer group p-3 -ml-3 rounded-2xl hover:bg-white/80 dark:hover:bg-slate-700/80 transition-all"
              onClick={() => setShowProfileEdit(true)}
            >
              <div className="relative flex-shrink-0">
                <img src={currentUser.avatar} alt="Avatar" className="w-14 h-14 rounded-2xl border-3 border-white dark:border-slate-700 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all" />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-1.5 rounded-full border-2 border-white dark:border-slate-700 shadow-md">
                  <Edit2 size={12} className="text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 dark:text-slate-100 truncate text-sm">{currentUser.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[140px] mt-1" title={currentUser.email}>{currentUser.email || 'Editar perfil'}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wide mt-1.5">✓ Verificado</p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { onLogin(); onClose(); }}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50 hover:shadow-emerald-300 dark:hover:shadow-emerald-800/50 transition-all hover:scale-[1.02]"
            >
              Iniciar Sesión
            </button>
          )}
        </div>

        {/* Groups List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mis Grupos</h3>
              <button
                onClick={() => { onAddNewGroup(); onClose(); }}
                className="text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 p-2 rounded-lg transition-all hover:scale-110"
                title="Crear nuevo grupo"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="space-y-2">
              {groups.length === 0 ? (
                <div className="text-center py-6 px-3">
                  <p className="text-slate-400 dark:text-slate-500 text-sm">No hay grupos aún</p>
                  <p className="text-slate-300 dark:text-slate-600 text-xs mt-1">Crea uno para comenzar</p>
                </div>
              ) : (
                groups.map(group => (
                  <button
                    key={group.id}
                    onClick={() => { onSelectGroup(group.id); onClose(); }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${currentGroupId === group.id
                      ? 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/40 dark:to-emerald-800/30 border border-emerald-200 dark:border-emerald-500/40 shadow-sm'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                      }`}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shadow-sm flex-shrink-0 ${currentGroupId === group.id ? 'bg-white dark:bg-slate-700 scale-110' : 'bg-slate-100 dark:bg-slate-800'}`}>
                        {group.icon}
                      </div>
                      <div className="text-left min-w-0">
                        <p className={`font-bold text-sm truncate ${currentGroupId === group.id ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'}`}>
                          {group.name}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {group.members.length} {group.members.length === 1 ? 'miembro' : 'miembros'}
                        </p>
                      </div>
                    </div>
                    {currentGroupId === group.id && <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 flex-shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50 dark:bg-slate-900">
          <button
            onClick={() => { setShowSettings(true); onClose(); }}
            className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 rounded-xl transition-all font-medium text-sm group"
          >
            <Settings size={18} className="group-hover:rotate-12 transition-transform" />
            <span>Configuración</span>
          </button>
          {currentUser && (
            <button
              onClick={() => { onLogout(); onClose(); }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all font-medium text-sm group"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span>Cerrar Sesión</span>
            </button>
          )}
        </div>

      </div>

      {showSettings && currentUser && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          isDarkMode={isDarkMode}
          onToggleTheme={onToggleTheme}
          currentUser={currentUser}
          onUpdateUser={onUpdateUser}
          onLogout={onLogout}
          onDeleteAccount={onDeleteAccount}
          language={language}
          onLanguageChange={onLanguageChange}
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
