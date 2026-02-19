
import React, { useState } from 'react';
import { X, Mail, Key, ArrowRight, User } from 'lucide-react';
import * as api from '../services/api';
import { User as UserType } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: UserType) => void;
  allowClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin, allowClose = true }) => {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      // try register first; if user didn't type a name, use the part before @
      const regName = name.trim() || email.split('@')[0];
      await api.register({ name: regName, email: email.trim() });
      setMessage('Código enviado. Revisa tu correo.');
    } catch (err: any) {
      if (err.status === 409) {
        // already registered -> just send login code
        setMessage('Correo ya registrado. Enviando código.');
        try {
          await api.loginRequestCode(email.trim());
        } catch (inner) {
          setMessage('No se pudo enviar el código.');
        }
      } else {
        setMessage('Ocurrió un error, inténtalo nuevamente.');
      }
    } finally {
      setLoading(false);
      setStep('code');
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const user = await api.verifyCode(email.trim(), code.trim());
      onLogin(user as UserType);
      onClose();
    } catch (err: any) {
      setMessage('Código inválido o expirado.');
    } finally {
      setLoading(false);
    }
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
              {step === 'email' ? 'Ingresa tu correo' : 'Introduce el código'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              {step === 'email'
                ? 'Te enviaremos un código por Gmail para continuar.'
                : 'Revisa tu bandeja de entrada y escribe el código que recibiste.'}
            </p>
          </div>

          {message && (
            <div className="text-sm text-emerald-600 dark:text-emerald-400">
              {message}
            </div>
          )}

          <form
            onSubmit={step === 'email' ? handleEmailSubmit : handleCodeSubmit}
            className="space-y-4 pt-2"
          >
            {step === 'email' ? (
              <>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-lg font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600"
                    autoFocus
                  />
                </div>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Tu nombre (opcional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-lg font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600"
                  />
                </div>
              </>
            ) : (
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Código de 6 dígitos"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-lg font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600"
                  autoFocus
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (step === 'email' ? !email.trim() : !code.trim())}
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50 hover:bg-emerald-700 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              <span>{step === 'email' ? 'Enviar código' : 'Verificar'}</span>
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
