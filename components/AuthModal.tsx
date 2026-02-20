
import React, { useState, useEffect } from 'react';
import { X, Mail, Key, User, Phone, Globe, MapPin, Code, Camera, Upload, ArrowRight, Loader2, Shield, Copy, Check } from 'lucide-react';
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
  const [step, setStep] = useState<'credentials' | 'profile' | 'location' | 'photo' | 'totp-setup' | 'totp-login' | 'backup-codes' | 'code'>(isLoginMode ? 'credentials' : 'credentials');

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

  // 2FA
  const [totpSecret, setTotpSecret] = useState('');
  const [totpQR, setTotpQR] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [totpCode, setTotpCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Verification
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [userId, setUserId] = useState<string | null>(null); // For 2FA verification

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
        setUserId(resp.userId || resp.id);

        if (resp.message === '2FA_REQUIRED' || resp.twoFAEnabled) {
          setMessage('Código de autenticación requerido');
          setStep('totp-login');
        } else {
          setMessage(resp.warning ? 'Código enviado con problemas.' : 'Código de inicio de sesión enviado a tu correo.');
          setStep('code');
          setResendTimer(60);
        }
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
          } catch (_) { }
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
      setUserId(resp.userId || resp.id);

      // Setup 2FA - Generate QR and backup codes
      const twoFASetup: any = await api.setup2FA(resp.userId || resp.id);
      setTotpSecret(twoFASetup.secret);
      setTotpQR(twoFASetup.qrCode);
      setBackupCodes(twoFASetup.backupCodes);

      setMessage('Escanea el código QR con Google Authenticator o similar');
      setStep('totp-setup');
    } catch (err: any) {
      setMessage('Error al registrarse.');
    } finally {
      setLoading(false);
    }
  };

  const handleTOTPSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.verify2FA(userId!, totpSecret, totpCode, backupCodes);
      setMessage('2FA configurado correctamente. Ahora verifica tu email.');
      setTotpCode('');
      setStep('code');
      setResendTimer(60);
    } catch (err: any) {
      setMessage('Código TOTP inválido. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleTOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const resp: any = await api.verifyLogin2FA(userId!, totpCode, useBackupCode, rememberMe);
      onLogin(resp.user as UserType);
      if (resp.rememberMeToken) {
        localStorage.setItem('rememberMeToken', resp.rememberMeToken);
        localStorage.setItem('rememberMeUserId', userId!);
      }
      onClose();
    } catch (err: any) {
      setMessage('Código inválido o expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackupCodeCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLoginMode) {
        const user: any = await api.verifyLoginCode(email, code, rememberMe);
        if (user.rememberMeToken) {
          localStorage.setItem('rememberMeToken', user.rememberMeToken);
          localStorage.setItem('rememberMeUserId', user.id);
        }
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
    const steps = isLoginMode ? ['credentials', 'totp-login', 'code'] : ['credentials', 'profile', 'location', 'photo', 'totp-setup', 'backup-codes', 'code'];
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
                      : step === 'totp-setup'
                        ? 'Seguridad en 2 pasos'
                        : step === 'totp-login'
                          ? 'Verifica tu identidad'
                          : step === 'backup-codes'
                            ? 'Códigos de respaldo'
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
                      : step === 'totp-setup'
                        ? 'Configura autenticación de dos factores'
                        : step === 'totp-login'
                          ? 'Usa tu autenticador o código de respaldo'
                          : step === 'backup-codes'
                            ? 'Guarda estos códigos por si acaso'
                            : 'Revisa tu correo'}
            </p>
          </div>

          {message && (
            <div className={`text-sm p-3 rounded-lg animate-in fade-in ${message.includes('Error') || message.includes('incorrecta') || message.includes('incorrecto')
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
                      : step === 'totp-setup' ? handleTOTPSetup
                        : step === 'totp-login' ? handleTOTPLogin
                          : step === 'backup-codes' ? (() => { setStep('code'); return true; }) as any
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
                {isLoginMode && (
                  <label className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Recordarme en este dispositivo</span>
                  </label>
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

            {step === 'totp-setup' && (
              <>
                <div className="flex justify-center mb-4">
                  {totpQR && <img src={totpQR} alt="TOTP QR Code" className="w-48 h-48 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-2 bg-white" />}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  Escanea este código QR con Google Authenticator, Authy o Microsoft Authenticator
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded text-center break-all">
                  {totpSecret}
                </p>
                <div className="relative group">
                  <Code className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Código de 6 dígitos"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    maxLength={6}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 text-center font-mono tracking-widest"
                    autoFocus
                  />
                </div>
              </>
            )}

            {step === 'totp-login' && (
              <>
                <div className="relative group">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder={useBackupCode ? "Código de respaldo" : "Código de 6 dígitos"}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    maxLength={useBackupCode ? 8 : 6}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 text-center font-mono tracking-widest"
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setUseBackupCode(!useBackupCode)}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
                >
                  {useBackupCode ? 'Usar código TOTP' : 'Usar código de respaldo'}
                </button>
                <label className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Recuérdame en este dispositivo</span>
                </label>
              </>
            )}

            {step === 'backup-codes' && (
              <>
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center font-medium">
                  Guarda estos códigos en un lugar seguro. Úsalos si pierdes acceso a tu autenticador.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleBackupCodeCopy(code)}
                      className="p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center justify-between gap-2"
                    >
                      <span>{code}</span>
                      {copiedCode === code ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Copy size={14} className="text-slate-400" />
                      )}
                    </button>
                  ))}
                </div>
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
                        : step === 'totp-setup' ? !totpCode.trim()
                          : step === 'totp-login' ? !totpCode.trim()
                            : step === 'backup-codes' ? false
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
                  <span>
                    {step === 'code' || step === 'totp-login' ? 'Verificar'
                      : step === 'totp-setup' ? 'Guardar 2FA'
                        : step === 'backup-codes' ? 'Continuar'
                          : 'Continuar'}
                  </span>
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
