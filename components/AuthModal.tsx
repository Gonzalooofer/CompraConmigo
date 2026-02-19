
import React, { useState, useEffect } from 'react';
import { X, Mail, Key, User, Phone, Globe, MapPin, Code, Camera, Upload, ArrowRight, Loader2 } from 'lucide-react';
import * as api from '../services/api';
import { User as UserType } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: UserType) => void;
  allowClose?: boolean;
  mode?: 'login' | 'register';
}

const COUNTRIES = ['España', 'Argentina', 'México', 'Colombia', 'Chile', 'Perú', 'Venezuela', 'Otros'];

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin, allowClose = true, mode = 'register' }) => {
  const [isLoginMode, setIsLoginMode] = useState(mode === 'login');
  const [step, setStep] = useState<'credentials' | 'profile' | 'location' | 'photo' | 'code'>(isLoginMode ? 'credentials' : 'credentials');
  
  // Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Profile
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Location
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  
  // Photo
  const [avatar, setAvatar] = useState('');
  
  // Verification
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
        // Register - continue to next step
        if (!email.trim() || !password.trim() || !name.trim()) return;
        setStep('profile');
      }
    } catch (err: any) {
      if (isLoginMode) {
        if (err.status === 404) {
          setMessage('Email no encontrado.');
        } else if (err.status === 403) {
          setMessage('Cuenta no verificada. Se está reenviando...');
          try {
            await api.resendCode(email.trim());
            setResendTimer(60);
          } catch (_) {}
          setStep('code');
        } else if (err.status === 401) {
          setMessage('Contraseña incorrecta');
        } else {
          setMessage('Error al iniciar sesión.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('location');
  };

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('photo');
  };

  const handlePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const resp: any = await api.register({
        name: name.trim(),
        email: email.trim(),
        password,
        phoneNumber: phoneNumber || undefined,
        country: country || undefined,
        city: city || undefined,
        postalCode: postalCode || undefined
      });
      setMessage(
        resp.warning
          ? 'Cuenta creada pero no se pudo enviar el correo.'
          : 'Cuenta creada. Revisa tu correo para el código.'
      );
      setStep('code');
      setResendTimer(60);
    } catch (err: any) {
      setMessage('Error al registrarse.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLoginMode) {
        const user = await api.verifyLoginCode(email, code);
        onLogin(user as UserType);
        onClose();
      } else {
        const user = await api.verifyCode(email, code);
        onLogin(user as UserType);
        onClose();
      }
    } catch (err: any) {
      setMessage('Código incorrecto o expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getProgressBarPercentage = () => {
    const steps = isLoginMode ? ['credentials', 'code'] : ['credentials', 'profile', 'location', 'photo', 'code'];
    const currentIndex = steps.indexOf(step);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm transition-all duration-300 ${!allowClose ? 'bg-slate-950' : ''}`}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800">
        
        {/* Progress Bar */}
        {!isLoginMode && (
          <div className="h-1 bg-slate-200 dark:bg-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              style={{ width: `${getProgressBarPercentage()}%` }}
            />
          </div>
        )}

        <div className="p-8 text-center space-y-6">
          <div className="flex justify-between items-start">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-500 mx-auto ml-0 shadow-sm animate-in slide-in-from-left">
              <span className="text-3xl">👋</span>
            </div>
            {allowClose && (
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            )}
          </div>

          <div className="text-left space-y-2 animate-in fade-in duration-300">
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              {step === 'credentials' 
                ? (isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta')
                : step === 'profile'
                ? 'Cuéntanos sobre ti'
                : step === 'location'
                ? '¿Dónde vives?'
                : step === 'photo'
                ? 'Tu avatar'
                : 'Verifica tu email'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {step === 'credentials'
                ? (isLoginMode 
                  ? 'Escribe tu email y contraseña.'
                  : 'Email y contraseña seguros.')
                : step === 'profile'
                ? 'Tu nombre y teléfono'
                : step === 'location'
                ? 'País, ciudad y código postal'
                : step === 'photo'
                ? 'Sube una foto o genera un avatar'
                : 'Revisa tu correo'}
            </p>
          </div>

          {message && (
            <div className={`text-sm p-3 rounded-lg animate-in fade-in ${
              message.includes('Error') || message.includes('incorrecta') || message.includes('incorrecto')
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
            }`}>
              {message}
            </div>
          )}

          <form
            onSubmit={
              step === 'credentials' ? handleCredentialsSubmit
              : step === 'profile' ? handleProfileSubmit
              : step === 'location' ? handleLocationSubmit
              : step === 'photo' ? handlePhotoSubmit
              : handleCodeSubmit
            }
            className="space-y-4 pt-2 animate-in fade-in duration-300"
          >
            {step === 'credentials' && (
              <>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400"
                    autoFocus
                  />
                </div>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input
                    type="password"
                    placeholder="Contraseña segura"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400"
                  />
                </div>
                {!isLoginMode && (
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="Tu nombre completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400"
                    />
                  </div>
                )}
              </>
            )}

            {step === 'profile' && (
              <>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder={name}
                    disabled
                    className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 cursor-not-allowed"
                  />
                </div>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input
                    type="tel"
                    placeholder="+34 612 345 678 (opcional)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400"
                  />
                </div>
              </>
            )}

            {step === 'location' && (
              <>
                <div className="relative group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100"
                  >
                    <option value="">Selecciona país (opcional)</option>
                    {COUNTRIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Ciudad (opcional)"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400"
                  />
                </div>
                <div className="relative group">
                  <Code className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="CP (opcional)"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400"
                  />
                </div>
              </>
            )}

            {step === 'photo' && (
              <>
                <div className="flex justify-center">
                  {avatar ? (
                    <img 
                      src={avatar} 
                      alt="Avatar preview"
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-200 dark:border-emerald-800 shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                      <Camera size={32} />
                    </div>
                  )}
                </div>
                <label className="flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <Upload size={18} className="text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Subir foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </>
            )}

            {step === 'code' && (
              <>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Código de 6 dígitos"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 text-center text-lg font-mono tracking-widest"
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  disabled={resendTimer > 0}
                  onClick={handleResend}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                  {resendTimer > 0 ? `Reenviar en ${resendTimer}s` : 'Reenviar código'}
                </button>
              </>
            )}

            <button
              type="submit"
              disabled={loading || (
                step === 'credentials' ? (!isLoginMode ? !email.trim() || !password || !name.trim() : !email.trim() || !password)
                : step === 'profile' ? false
                : step === 'location' ? false
                : step === 'photo' ? false
                : !code.trim()
              )}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50 hover:from-emerald-700 hover:to-teal-700 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <span>{step === 'code' ? 'Verificar' : 'Continuar'}</span>
                  <ArrowRight size={18} />
                </>
              )}
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
                setStep('credentials');
              }}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
            >
              {isLoginMode ? '¿No tienes cuenta? Registrarse' : '¿Ya tienes cuenta? Iniciar sesión'}
            </button>
          )}

          <p className="text-xs text-slate-400 dark:text-slate-600 font-medium pt-2">
            {isLoginMode 
              ? 'Se te enviará un código para verificar tu identidad.'
              : step === 'credentials'
              ? 'Los datos son privados y seguros.'
              : 'Todos los pasos son opcionales'}
          </p>
        </div>
      </div>
    </div>
  );
};
