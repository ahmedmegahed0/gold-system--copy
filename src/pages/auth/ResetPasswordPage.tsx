import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthService } from '../../services/auth.service';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';

export const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('ar');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await AuthService.resetPassword({ email, otp, newPassword });
      setSuccess(t('auth.resetSuccess'));
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(t('auth.resetError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-light-gray" 
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        backgroundImage: 'url("/auth-bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-[2px] z-0"></div>

      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher />
      </div>

      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-white/20 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-charcoal mb-3">{t('auth.resetTitle')}</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            {t('auth.resetSubtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 font-medium">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100 font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all bg-gray-50 focus:bg-white ${!isRtl && 'text-left'}`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">{t('auth.otpLabel')}</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all bg-gray-50 focus:bg-white tracking-widest text-center text-xl font-bold`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">{t('auth.newPassword')}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all bg-gray-50 focus:bg-white ${!isRtl && 'text-left'}`}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3.5 px-4 mt-2 bg-charcoal hover:bg-black text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? t('auth.saving') : t('auth.confirmReset')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-sm font-semibold text-gray-500 hover:text-charcoal transition-colors">
            {t('auth.cancelReturn')}
          </Link>
        </div>
      </div>
    </div>
  );
};
