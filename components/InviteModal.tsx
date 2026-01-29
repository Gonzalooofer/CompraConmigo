
import React, { useState } from 'react';
import { X, Link as LinkIcon, Mail, Check, Smartphone, Copy } from 'lucide-react';

interface InviteModalProps {
  onClose: () => void;
  groupName: string;
  groupId: string;
}

export const InviteModal: React.FC<InviteModalProps> = ({ onClose, groupName, groupId }) => {
  const [copied, setCopied] = useState(false);
  
  // Generate a real link based on the current location
  const getInviteLink = () => {
    if (typeof window === 'undefined') return '';
    
    // USAR window.location.href en lugar de origin para incluir subdirectorios (GitHub Pages)
    // Creamos un objeto URL basado en la dirección actual completa
    const url = new URL(window.location.href);
    
    // Limpiamos cualquier parámetro de búsqueda previo para generar un enlace limpio
    url.search = ''; 
    url.hash = ''; // Limpiamos hash si existiera

    // Agregamos los parámetros de invitación
    url.searchParams.set('join', groupId);
    url.searchParams.set('name', encodeURIComponent(groupName));
    
    return url.toString();
  };

  const inviteLink = getInviteLink();
  const message = `¡Únete a mi lista de compra "${groupName}" en CompraConmigo! 🛒\n\nEntra aquí para colaborar: ${inviteLink}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleEmail = () => {
    const subject = `Invitación al grupo ${groupName}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleInstagram = () => {
    handleCopy();
    window.location.href = "instagram://"; 
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm md:max-w-2xl rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 shrink-0">
          <div>
             <h3 className="font-bold text-slate-800 dark:text-slate-100">Invitar Amigos</h3>
             <p className="text-xs text-slate-500 dark:text-slate-400">Grupo: {groupName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={handleWhatsApp}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-100 dark:border-green-800 transition-all group"
            >
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white mb-2 shadow-lg shadow-green-200 dark:shadow-green-900/50 group-hover:scale-110 transition-transform">
                <Smartphone size={24} />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">WhatsApp</span>
            </button>

            <button 
              onClick={handleEmail}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-100 dark:border-blue-800 transition-all group"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white mb-2 shadow-lg shadow-blue-200 dark:shadow-blue-900/50 group-hover:scale-110 transition-transform">
                <Mail size={24} />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Correo</span>
            </button>

            <button 
              onClick={handleInstagram}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/40 border border-pink-100 dark:border-pink-800 transition-all group"
            >
              <div className="w-12 h-12 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white mb-2 shadow-lg shadow-pink-200 dark:shadow-pink-900/50 group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Instagram</span>
            </button>

            <button 
              onClick={handleCopy}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all group"
            >
              <div className="w-12 h-12 bg-slate-700 dark:bg-slate-600 rounded-full flex items-center justify-center text-white mb-2 shadow-lg shadow-slate-300 dark:shadow-slate-900/50 group-hover:scale-110 transition-transform">
                {copied ? <Check size={24} /> : <Copy size={24} />}
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="truncate text-xs text-slate-500 dark:text-slate-400 px-2 font-mono flex-1 select-all">
              {inviteLink}
            </div>
            <button onClick={handleCopy} className="p-2 ml-2 bg-white dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 shadow-sm hover:scale-105 transition-transform shrink-0">
               {copied ? <Check size={16} className="text-emerald-500" /> : <LinkIcon size={16} />}
            </button>
          </div>
          
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 text-[10px] rounded-xl border border-amber-100 dark:border-amber-900/30">
            Nota: Al compartir este enlace, tus amigos podrán unirse a una copia de este grupo. Para sincronización en tiempo real, se requiere conexión a internet y backend.
          </div>

        </div>
      </div>
    </div>
  );
};
