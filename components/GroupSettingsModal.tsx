
import React, { useState } from 'react';
import { X, Trash2, Crown, Shield, User as UserIcon, Save, AlertTriangle, UserPlus, Check } from 'lucide-react';
import { Group, User } from '../types';

interface GroupSettingsModalProps {
  group: Group;
  users: User[]; // All users available to map IDs to objects
  currentUser: User;
  onClose: () => void;
  onUpdateGroup: (groupId: string, data: Partial<Group>) => void;
  onDeleteGroup: (groupId: string) => void;
  onRemoveMember: (groupId: string, userId: string) => void;
  onToggleAdmin: (groupId: string, userId: string) => void;
  onAddMember: (groupId: string, name: string) => void; // New prop
}

const COLORS = [
  'bg-emerald-500', 'bg-indigo-500', 'bg-orange-500', 'bg-pink-500',
  'bg-blue-500', 'bg-purple-500', 'bg-teal-500', 'bg-rose-500'
];

const EMOJIS = ['🏠', '🎓', '🍕', '💼', '✈️', '🛒', '🎁', '👶', '🎮', '🏖️', '❤️'];

export const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({
  group,
  users,
  currentUser,
  onClose,
  onUpdateGroup,
  onDeleteGroup,
  onRemoveMember,
  onToggleAdmin,
  onAddMember
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'members'>('general');
  const [name, setName] = useState(group.name);
  const [icon, setIcon] = useState(group.icon);
  const [selectedColor, setSelectedColor] = useState(group.color);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // State for manual member add
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  const isAdmin = group.admins.includes(currentUser.id);

  const handleSave = () => {
    onUpdateGroup(group.id, {
      name,
      icon,
      color: selectedColor
    });
    onClose();
  };

  const handleAddManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemberName.trim()) {
      onAddMember(group.id, newMemberName.trim());
      setNewMemberName('');
      setIsAddingMember(false);
    }
  };

  const groupMembers = group.members.map(memberId => users.find(u => u.id === memberId)).filter(Boolean) as User[];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Ajustes del Grupo</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{group.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 shrink-0">
          <button 
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-3 text-sm font-bold transition-colors relative ${activeTab === 'general' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            General
            {activeTab === 'general' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
          </button>
          <button 
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-3 text-sm font-bold transition-colors relative ${activeTab === 'members' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Miembros ({group.members.length})
            {activeTab === 'members' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nombre</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isAdmin}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-60"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Icono</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                  {EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      disabled={!isAdmin}
                      onClick={() => setIcon(emoji)}
                      className={`w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center text-2xl transition-all border disabled:cursor-not-allowed ${
                        icon === emoji 
                          ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 scale-105 shadow-sm' 
                          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Color</label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      disabled={!isAdmin}
                      onClick={() => setSelectedColor(color)}
                      className={`w-9 h-9 rounded-full transition-all disabled:cursor-not-allowed ${color} ${
                        selectedColor === color 
                          ? 'ring-4 ring-slate-200 dark:ring-slate-700 scale-110' 
                          : 'hover:scale-110 opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {!isAdmin && (
                 <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 text-xs rounded-xl border border-amber-100 dark:border-amber-900/30">
                    Solo los administradores pueden editar los detalles del grupo.
                 </div>
              )}

              {isAdmin && (
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3">Zona de Peligro</h4>
                  {!showDeleteConfirm ? (
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full py-3 border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Trash2 size={18} />
                      <span>Eliminar Grupo</span>
                    </button>
                  ) : (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50 text-center space-y-3">
                      <div className="flex flex-col items-center text-red-600 dark:text-red-400">
                        <AlertTriangle size={32} className="mb-2" />
                        <p className="font-bold">¿Estás seguro?</p>
                        <p className="text-xs opacity-80">Esta acción no se puede deshacer y borrará todas las listas y gastos.</p>
                      </div>
                      <div className="flex space-x-2">
                         <button 
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 font-bold"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={() => onDeleteGroup(group.id)}
                          className="flex-1 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600"
                        >
                          Sí, Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-4">
              
              {/* Manual Add Button */}
              {isAdmin && !isAddingMember && (
                <button 
                  onClick={() => setIsAddingMember(true)}
                  className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 font-bold hover:border-emerald-500 hover:text-emerald-500 dark:hover:border-emerald-500/50 dark:hover:text-emerald-400 transition-colors flex items-center justify-center space-x-2 mb-4"
                >
                  <UserPlus size={18} />
                  <span>Añadir manualmente</span>
                </button>
              )}

              {/* Add Member Form */}
              {isAddingMember && (
                <form onSubmit={handleAddManualSubmit} className="mb-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl animate-in slide-in-from-top-2">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase">Nombre del nuevo miembro</label>
                      <div className="flex space-x-2">
                        <input 
                          type="text" 
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          placeholder="Ej. Abuela"
                          autoFocus
                          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <button 
                          type="submit"
                          disabled={!newMemberName.trim()}
                          className="px-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                        >
                          <Check size={18} />
                        </button>
                         <button 
                          type="button"
                          onClick={() => setIsAddingMember(false)}
                          className="px-3 bg-slate-200 dark:bg-slate-700 text-slate-500 rounded-lg hover:bg-slate-300"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400">Esto creará un usuario local para asignar gastos.</p>
                   </div>
                </form>
              )}

              {groupMembers.map(member => {
                const isMemberAdmin = group.admins.includes(member.id);
                const isSelf = member.id === currentUser.id;

                return (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center space-x-3">
                      <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-600" />
                      <div>
                        <div className="flex items-center space-x-1">
                          <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{member.name}</p>
                          {isMemberAdmin && <Crown size={14} className="text-yellow-500 fill-yellow-500" />}
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{member.email || 'Miembro manual'}</p>
                      </div>
                    </div>

                    {isAdmin && !isSelf && (
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => onToggleAdmin(group.id, member.id)}
                          className={`p-2 rounded-lg transition-colors ${isMemberAdmin ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                          title={isMemberAdmin ? "Quitar admin" : "Hacer admin"}
                        >
                          <Shield size={18} />
                        </button>
                        <button 
                          onClick={() => onRemoveMember(group.id, member.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Expulsar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                    {isSelf && (
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">Tú</span>
                    )}
                  </div>
                );
              })}

              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20 text-center">
                 <p className="text-xs text-blue-600 dark:text-blue-400">Invita a más personas desde la pantalla principal usando el botón "Invitar Amigos".</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        {activeTab === 'general' && isAdmin && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
             <button 
              onClick={handleSave}
              className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center space-x-2"
            >
              <Save size={18} />
              <span>Guardar Cambios</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
