import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../../services/auth.service';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
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
      await AuthService.forgotPassword({ email });
      setSuccess(t('auth.forgotSuccess'));
      setTimeout(() => navigate('/reset-password', { state: { email } }), 2000);
    } catch (err: any) {
      setError(t('auth.forgotError'));
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
          <h1 className="text-3xl font-extrabold text-charcoal mb-3">{t('auth.forgotTitle')}</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            {t('auth.forgotSubtitle')}
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

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gold hover:bg-[#b59540] text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? t('auth.sending') : t('auth.sendOtp')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-sm font-semibold text-gold hover:text-charcoal transition-colors">
            {t('auth.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
};
