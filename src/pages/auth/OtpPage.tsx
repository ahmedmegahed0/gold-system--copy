import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/auth.service';
import { useAuth } from '../../core/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';

export const OtpPage: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  const { user, handleLoginSuccess } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('ar');

  // Store the email on mount so it survives state changes
  const emailRef = useRef(user?.email || '');
  const verifiedRef = useRef(false);

  useEffect(() => {
    // If already verified, don't redirect
    if (verifiedRef.current) return;
    
    // If no email (didn't come from login page), go back to login
    if (!emailRef.current) {
      navigate('/login', { replace: true });
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setLoading(true);
    setError('');
    try {
      const email = emailRef.current;
      if (!email) throw new Error('No user context');
      
      const session = await AuthService.verifyOtp({ email, otp });
      console.log('OTP Verify Response:', session);
      
      // Mark as verified BEFORE calling handleLoginSuccess to prevent redirect
      verifiedRef.current = true;
      handleLoginSuccess(session);
      
      // Navigate based on role
      const role = session.role?.toUpperCase() || '';
      if (role === 'OWNER') {
        navigate('/sales', { replace: true });
      } else {
        navigate('/sales', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.otpError'));
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 text-gold mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-charcoal mb-2">{t('auth.otpTitle')}</h1>
          <p className="text-sm text-gray-500 font-medium">{t('auth.otpSubtitle')}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-3 text-center">{t('auth.otpLabel')}</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all bg-gray-50 focus:bg-white text-center text-3xl tracking-[1em] font-bold text-charcoal font-mono"
              placeholder="••••••"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-4 px-4 bg-charcoal hover:bg-black text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('auth.loading') : t('auth.otpButton')}
          </button>
        </form>

        <div className="mt-8 text-center">
          {countdown > 0 ? (
            <p className="text-sm text-gray-500 font-medium">
              {t('auth.otpResendWait')} <span className="text-gold font-bold">{countdown}</span> ثانية
            </p>
          ) : (
            <button 
              onClick={() => setCountdown(60)} 
              className="text-sm font-bold text-gold hover:text-charcoal transition-colors"
            >
              {t('auth.otpResend')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
