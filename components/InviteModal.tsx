
import React, { useState } from 'react';
import { X, Link as LinkIcon, Mail, Check, Smartphone, Copy, Send, Loader2 } from 'lucide-react';
import * as api from '../services/api';

interface InviteModalProps {
  onClose: () => void;
  groupName: string;
  groupId: string;
  currentUserId: string;
}

export const InviteModal: React.FC<InviteModalProps> = ({ onClose, groupName, groupId, currentUserId }) => {
  const [tab, setTab] = useState<'direct' | 'share'>('direct');
  const [emailInput, setEmailInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Generate invite link
  const getInviteLink = () => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('join', groupId);
    url.searchParams.set('name', encodeURIComponent(groupName));
    return url.toString();
  };

  const inviteLink = getInviteLink();
  const shareMessage = `¡Únete a mi lista de compra "${groupName}" en CompraConmigo! 🛒\n\nEntra aquí para colaborar: ${inviteLink}`;

  // Enviar invitación por email
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    // Validación simple de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      setMessage({ type: 'error', text: 'Email no válido' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.request('/invitations/send', {
        method: 'POST',
        body: JSON.stringify({
          groupId,
          toEmail: emailInput.trim(),
          fromUserId: currentUserId
        })
      });

      setMessage({ type: 'success', text: `¡Invitación enviada a ${emailInput}!` });
      setEmailInput('');
      
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err?.message || 'Error al enviar la invitación' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  const handleEmail = () => {
    const subject = `Invitación al grupo ${groupName}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm md:max-w-2xl rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-900 shrink-0">
          <div>
             <h3 className="font-bold text-slate-800 dark:text-slate-100">Invitar Amigos</h3>
             <p className="text-xs text-slate-500 dark:text-slate-400">Grupo: {groupName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
          <button
            onClick={() => setTab('direct')}
            className={`flex-1 py-3 px-4 font-medium text-sm transition-all border-b-2 ${
              tab === 'direct'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Mail size={16} className="inline mr-2" />
            Invitar por Email
          </button>
          <button
            onClick={() => setTab('share')}
            className={`flex-1 py-3 px-4 font-medium text-sm transition-all border-b-2 ${
              tab === 'share'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <LinkIcon size={16} className="inline mr-2" />
            Compartir Enlace
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          
          {tab === 'direct' ? (
            <>
              {/* Email Direct Invite */}
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Email del amigo
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>

                {message && (
                  <div className={`p-3 rounded-lg text-sm font-medium ${
                    message.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                  }`}>
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !emailInput.trim()}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Enviar Invitación</span>
                    </>
                  )}
                </button>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-lg border border-blue-100 dark:border-blue-800">
                  ✨ Se enviará un email a tu amigo con un enlace y código para aceptar la invitación
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Share Link */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800 space-y-3">
                <p className="text-sm text-emerald-900 dark:text-emerald-200">Comparte el enlace o el código con tus amigos:</p>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg font-mono text-xs text-slate-600 dark:text-slate-300 break-all">
                  {inviteLink}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleWhatsApp}
                  className="flex items-center justify-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-100 dark:border-green-800 transition-all group"
                >
                  <Smartphone className="text-green-600 dark:text-green-400 mr-2" size={18} />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">WhatsApp</span>
                </button>

                <button 
                  onClick={handleEmail}
                  className="flex items-center justify-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-100 dark:border-blue-800 transition-all group"
                >
                  <Mail className="text-blue-600 dark:text-blue-400 mr-2" size={18} />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Correo</span>
                </button>

                <button 
                  onClick={handleCopy}
                  className="flex items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all col-span-2 group"
                >
                  {copied ? <Check className="text-emerald-500 mr-2" size={18} /> : <Copy className="text-slate-600 dark:text-slate-400 mr-2" size={18} />}
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{copied ? 'Link Copiado' : 'Copiar Link'}</span>
                </button>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 text-[10px] rounded-lg border border-amber-100 dark:border-amber-900/30">
                Nota: El método de email directo es más seguro. Los enlaces compartidos son públicos y cualquiera puede usarlos.
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

