
import React, { useState, useEffect } from 'react';
import { X, Mail, Key, ArrowRight, User } from 'lucide-react';
import * as api from '../services/api';
import { User as UserType } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: UserType) => void;
  allowClose?: boolean;
  mode?: 'login' | 'register'; // login or register mode
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin, allowClose = true, mode = 'register' }) => {
  const [isLoginMode, setIsLoginMode] = useState(mode === 'login');
  const [step, setStep] = useState<'credentials' | 'code'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // resend timer
  const [resendTimer, setResendTimer] = useState(0);
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      if (isLoginMode) {
        // Login mode: verify password, then request login code
        if (!email.trim() || !password.trim()) return;
        
        const resp: any = await api.login(email.trim(), password);
        if (resp.warning) {
          setMessage('Código enviado, pero hay problemas al enviar el correo.');
        } else {
          setMessage('Código de inicio de sesión enviado a tu correo.');
        }
        setStep('code');
        setResendTimer(60);
      } else {
        // Register mode
        if (!email.trim() || !password.trim() || !name.trim()) return;
        
        const user = await api.login(email.trim(), password);
        // If login succeeds, user is already registered
        onLogin(user as UserType);
        onClose();
        return;
      }
    } catch (err: any) {
      if (isLoginMode) {
        if (err.status === 404) {
          setMessage('Email no encontrado.');
        } else if (err.status === 403) {
          setMessage('Cuenta no verificada. Se está reenviando el código...');
          try {
            const resp: any = await api.resendCode(email.trim());
            if (resp.warning) {
              setMessage('Código no enviado (problema de correo).');
            }
            setResendTimer(60);
          } catch (_){ }
          setStep('code');
        } else if (err.status === 401) {
          setMessage('Contraseña incorrecta');
        } else {
          setMessage('Error al iniciar sesión.');
        }
      } else {
        // Register mode
        if (err.status === 404) {
          // New user - register
          try {
            const resp: any = await api.register({
              name: name.trim(),
              email: email.trim(),
              password
            });
            setMessage(
              resp.warning
                ? 'Cuenta creada pero no se pudo enviar el correo.'
                : 'Cuenta creada. Revisa tu correo para el código.'
            );
            setStep('code');
            setResendTimer(60);
          } catch (regErr: any) {
            setMessage('Error al registrarse.');
          }
        } else if (err.status === 409) {
          setMessage('Este email ya está registrado. Usa el modo Login.');
        } else {
          setMessage('Error: ' + (err.message || 'Inténtalo nuevamente.'));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      if (isLoginMode) {
        // Verify login code
        const user = await api.verifyLoginCode(email.trim(), code.trim());
        onLogin(user as UserType);
        onClose();
      } else {
        // Verify registration code
        const user = await api.verifyCode(email.trim(), code.trim());
        onLogin(user as UserType);
        onClose();
      }
    } catch (err: any) {
      setMessage('Código inválido o expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      const resp: any = await api.resendCode(email.trim());
      if (resp.warning) {
        setMessage('Código no enviado (problema de correo).');
      } else {
        setMessage('Código reenviado');
      }
      setResendTimer(60);
    } catch (err: any) {
      setMessage(err.error || 'No se pudo reenviar.');
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
              {step === 'credentials' 
                ? (isLoginMode ? 'Iniciar Sesión' : 'Registrarse')
                : 'Introduce el código'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              {step === 'credentials'
                ? (isLoginMode 
                  ? 'Escribe tu email y contraseña para iniciar sesión.'
                  : 'Escribe tu email y una contraseña. Se enviará un código de verificación.')
                : 'Revisa tu correo y escribe el código que recibiste.'}
            </p>
          </div>

          {message && (
            <div className="text-sm text-emerald-600 dark:text-emerald-400">
              {message}
            </div>
          )}

          <form
            onSubmit={step === 'credentials' ? handleCredentialsSubmit : handleCodeSubmit}
            className="space-y-4 pt-2"
          >
            {step === 'credentials' ? (
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
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-lg font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600"
                  />
                </div>
                {!isLoginMode && (
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-lg font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600"
                    />
                  </div>
                )}
              </>
            ) : (
              <>
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
                <button
                  type="button"
                  disabled={resendTimer > 0}
                  onClick={handleResend}
                  className="text-xs text-emerald-600 hover:underline"
                >
                  {resendTimer > 0 ? `Reenviar en ${resendTimer}s` : 'Reenviar código'}
                </button>
              </>
            )}

            <button
              type="submit"
              disabled={loading || (step === 'credentials' ? (!isLoginMode ? !email.trim() || !password || !name.trim() : !email.trim() || !password) : !code.trim())}
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50 hover:bg-emerald-700 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              <span>{step === 'credentials' ? 'Continuar' : 'Verificar'}</span>
              <ArrowRight size={20} />
            </button>
          </form>

          {step === 'credentials' && (
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setEmail('');
                setPassword('');
                setName('');
                setMessage(null);
              }}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
            >
              {isLoginMode ? '¿No tienes cuenta? Registrarse' : '¿Ya tienes cuenta? Iniciar sesión'}
            </button>
          )}

          <p className="text-xs text-slate-400 dark:text-slate-600 font-medium pt-2">
            {isLoginMode 
              ? 'Se te enviará un código para verificar tu identidad.'
              : 'Al entrar, te unirás automáticamente a tu grupo predeterminado.'}
          </p>
        </div>
      </div>
    </div>
  );
};
