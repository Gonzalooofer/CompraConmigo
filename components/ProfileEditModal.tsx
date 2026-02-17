
import React, { useState, useRef } from 'react';
import { X, RefreshCw, Save, Camera } from 'lucide-react';
import { User } from '../types';

interface ProfileEditModalProps {
  user: User;
  onClose: () => void;
  onSave: (userId: string, data: Partial<User>) => void;
}

const COLORS = [
  'bg-emerald-500', 'bg-indigo-500', 'bg-orange-500', 'bg-pink-500',
  'bg-blue-500', 'bg-purple-500', 'bg-teal-500', 'bg-rose-500',
  'bg-red-500', 'bg-cyan-500', 'bg-lime-500', 'bg-fuchsia-500'
];

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const [selectedColor, setSelectedColor] = useState(user.color);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRegenerateAvatar = () => {
    const newSeed = Math.random().toString(36).substring(7);
    setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${newSeed}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setAvatar(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(user.id, {
      name,
      avatar,
      color: selectedColor
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Editar Perfil</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative group">
              <img 
                src={avatar} 
                alt="Avatar" 
                className={`w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-lg object-cover bg-slate-100`}
              />
              <div className="absolute -bottom-1 -right-1 flex space-x-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-emerald-600 text-white rounded-full shadow-md hover:bg-emerald-700 transition-colors border-2 border-white dark:border-slate-900"
                    title="Subir foto"
                  >
                    <Camera size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerateAvatar}
                    className="p-2 bg-slate-700 text-white rounded-full shadow-md hover:bg-slate-600 transition-colors border-2 border-white dark:border-slate-900"
                    title="Generar al azar"
                  >
                    <RefreshCw size={14} />
                  </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <p className="text-xs text-slate-400">Sube una foto o genera un avatar</p>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nombre</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tu Color</label>
            <div className="flex flex-wrap gap-3 justify-center">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full transition-all ${color} ${
                    selectedColor === color 
                      ? 'ring-4 ring-slate-200 dark:ring-slate-700 scale-110' 
                      : 'hover:scale-110 opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <button 
            type="submit"
            disabled={!name.trim()}
            className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Save size={18} />
            <span>Guardar Cambios</span>
          </button>

        </form>
      </div>
    </div>
  );
};
