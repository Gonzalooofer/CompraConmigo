
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
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [country, setCountry] = useState(user.country || '');
  const [city, setCity] = useState(user.city || '');
  const [postalCode, setPostalCode] = useState(user.postalCode || '');
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
      color: selectedColor,
      phoneNumber: phoneNumber || undefined,
      country: country || undefined,
      city: city || undefined,
      postalCode: postalCode || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-slate-900 dark:to-slate-800">
          <h3 className="font-black text-xl text-slate-800 dark:text-slate-100">Editar Perfil</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full border-4 border-emerald-200 dark:border-emerald-800 shadow-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img 
                  src={avatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-all border-4 border-white dark:border-slate-900 group-hover:scale-110"
                    title="Subir foto"
                  >
                    <Camera size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerateAvatar}
                    className="p-2.5 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all border-4 border-white dark:border-slate-900 group-hover:scale-110"
                    title="Generar al azar"
                  >
                    <RefreshCw size={16} />
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
            <p className="text-xs text-slate-500 dark:text-slate-400">Toca la foto para cambiarla</p>
          </div>

          {/* Name Input */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombre Completo</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="Escribe tu nombre"
            />
          </div>

          {/* Phone Input */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Teléfono (Bizum)</label>
            <input 
              type="tel" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="Ej: +34 612 345 678"
            />
          </div>

          {/* Location Inputs */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">📍 Ubicación</label>
            
            <input 
              type="text" 
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="País"
            />
            
            <input 
              type="text" 
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="Ciudad"
            />
            
            <input 
              type="text" 
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="Código Postal"
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tu Color Favorito</label>
            <div className="flex flex-wrap gap-3 justify-center bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full transition-all ${color} ${
                    selectedColor === color 
                      ? 'ring-4 ring-slate-300 dark:ring-slate-600 scale-125 shadow-lg' 
                      : 'hover:scale-110 opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <button 
            type="submit"
            disabled={!name.trim()}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50 hover:from-emerald-700 hover:to-emerald-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Save size={18} />
            <span>Guardar Cambios</span>
          </button>

        </form>
      </div>
    </div>
  );
};
