
import React, { useState } from 'react';
import { X, Moon, Sun, Bell, Globe, Phone, Mail, LogOut, Trash2, ChevronRight, Crown, CreditCard, Shield, Copy, Check, Loader2, RefreshCw } from 'lucide-react';
import { User } from '../types';
import * as api from '../services/api';
import { PlanModal } from './PlanModal';
import { translations } from '../translations';

interface SettingsModalProps {
  onClose: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  currentUser: User;
  onUpdateUser: (userId: string, data: Partial<User>) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  isDarkMode,
  onToggleTheme,
  currentUser,
  onUpdateUser,
  onLogout,
  onDeleteAccount,
  language,
  onLanguageChange
}) => {
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phoneNumber || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [show2FASetup, setShow2FASetup] = useState(false);
  const [totpSecret, setTotpSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error2FA, setError2FA] = useState<string | null>(null);

  const handleSaveProfile = () => {
    onUpdateUser(currentUser.id, {
      email,
      phoneNumber: phone
    });
  };

  const start2FASetup = async () => {
    try {
      const resp: any = await api.setup2FA(currentUser.id);
      setTotpSecret(resp.secret);
      setQrCode(resp.qrCode);
      setBackupCodes(resp.backupCodes);
      setShow2FASetup(true);
    } catch (err) {
      console.error('2FA setup failed', err);
    }
  };

  const verifyAndEnable2FA = async () => {
    setIsVerifying2FA(true);
    setError2FA(null);
    try {
      await api.verify2FA(currentUser.id, totpSecret, verificationCode, backupCodes);
      onUpdateUser(currentUser.id, { twoFAEnabled: true });
      setShow2FASetup(false);
      setVerificationCode('');
    } catch (err) {
      setError2FA('Código inválido. Intenta de nuevo.');
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const disable2FA = async () => {
    if (confirm('¿Estás seguro de que quieres desactivar la autenticación en dos pasos?')) {
      try {
        await api.disable2FA(currentUser.id);
        onUpdateUser(currentUser.id, { twoFAEnabled: false });
      } catch (err) {
        console.error('Failed to disable 2FA', err);
      }
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedCode('all');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm sm:max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 shrink-0">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">{translations[language]?.settings || 'Configuración'}</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
              <X size={20} className="text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">

            {/* Plan Banner */}
            <div
              onClick={() => setShowPlanModal(true)}
              className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 cursor-pointer relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Crown size={80} />
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Tu Plan Actual</p>
                  <h4 className="text-xl font-black">{currentUser.plan === 'premium' ? 'Premium' : currentUser.plan === 'family' ? 'Familia' : 'Básico'}</h4>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg hover:bg-white/30 transition-colors">
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>

            {/* Account Section */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{translations[language]?.account || 'Cuenta y Contacto'}</label>

              <div className="space-y-3">
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={handleSaveProfile}
                    placeholder="Tu correo electrónico"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onBlur={handleSaveProfile}
                    placeholder="Teléfono (para Bizum)"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium text-slate-800 dark:text-slate-200"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 pl-1">Necesario para que te hagan Bizum automáticamente.</p>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Preferencias</label>

              {/* Theme */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-500/20 text-orange-500'}`}>
                    {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{translations[language]?.darkMode || 'Modo Oscuro'}</span>
                </div>
                <button
                  onClick={onToggleTheme}
                  className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out ${isDarkMode ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-500">
                    <Bell size={18} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Notificaciones</span>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out ${notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* 2FA Section */}
              <div className="flex flex-col space-y-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${currentUser.twoFAEnabled ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-500/20 text-slate-500'}`}>
                      <Shield size={18} />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{translations[language]?.twoFA || '2FA (Autenticador)'}</span>
                      <p className="text-[10px] text-slate-400 font-medium">{translations[language]?.twoFADesc || 'Mayor seguridad para tu cuenta'}</p>
                    </div>
                  </div>
                  <button
                    onClick={currentUser.twoFAEnabled ? disable2FA : start2FASetup}
                    className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out ${currentUser.twoFAEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${currentUser.twoFAEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {show2FASetup && (
                  <div className="mt-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-500/30 animate-in slide-in-from-top-2 duration-300">
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-3 text-center">Configurar Autenticador</h4>

                    <div className="flex justify-center mb-4 bg-white p-2 rounded-xl">
                      <img src={qrCode} alt="QR Code" className="w-32 h-32" />
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mb-4">
                      Escanea este código con Google Authenticator o Authy.
                    </p>

                    <div className="space-y-2 mb-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Códigos de Respaldo</p>
                      <div className="grid grid-cols-2 gap-2">
                        {backupCodes.slice(0, 4).map(code => (
                          <div key={code} className="text-[10px] font-mono bg-slate-50 dark:bg-slate-800 p-1 rounded text-center border border-slate-100 dark:border-slate-700">
                            {code}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={copyBackupCodes}
                        className="w-full py-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-lg transition-colors"
                      >
                        {copiedCode === 'all' ? <Check size={12} /> : <Copy size={12} />}
                        {copiedCode === 'all' ? '¡Copiados!' : 'Copiar códigos de respaldo'}
                      </button>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Introduce el código de 6 dígitos"
                        className="w-full px-4 py-2 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-base font-bold tracking-[0.5em]"
                      />
                      {error2FA && <p className="text-[10px] text-red-500 text-center font-bold">{error2FA}</p>}
                      <button
                        onClick={verifyAndEnable2FA}
                        disabled={verificationCode.length !== 6 || isVerifying2FA}
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center gap-2"
                      >
                        {isVerifying2FA ? <Loader2 className="animate-spin" size={16} /> : 'Activar 2FA'}
                      </button>
                      <button
                        onClick={() => setShow2FASetup(false)}
                        className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Language */}
              <div className="flex flex-col space-y-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-pink-500/20 text-pink-500">
                    <Globe size={18} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Idioma</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'es', label: 'Español', flag: '🇪🇸' },
                    { code: 'en', label: 'English', flag: '🇺🇸' },
                    { code: 'fr', label: 'Français', flag: '🇫🇷' }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${language === lang.code
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-transparent bg-white dark:bg-slate-700 hover:border-slate-200'
                        }`}
                    >
                      <span className="text-xl mb-1">{lang.flag}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <button
                onClick={() => { onLogout(); onClose(); }}
                className="w-full flex items-center justify-between p-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors font-medium text-sm"
              >
                <span className="flex items-center space-x-2"><LogOut size={18} /> <span>{translations[language]?.logout || 'Cerrar Sesión'}</span></span>
              </button>

              <button
                onClick={onDeleteAccount}
                className="w-full flex items-center justify-between p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium text-sm"
              >
                <span className="flex items-center space-x-2"><Trash2 size={18} /> <span>{translations[language]?.deleteAccount || 'Eliminar Cuenta'}</span></span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {showPlanModal && (
        <PlanModal
          currentUser={currentUser}
          onClose={() => setShowPlanModal(false)}
          onUpgrade={(plan) => {
            onUpdateUser(currentUser.id, { plan });
            setShowPlanModal(false);
          }}
        />
      )}
    </>
  );
};
