import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../../services/auth.service';
import { useAuth } from '../../core/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { handleOtpPending, handleLoginSuccess } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('ar');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Call login API - backend will send OTP to user's email
      const response = await AuthService.login({ email, password });
      console.log('Login Response:', response);
      
      const role = response?.role || (response as any)?.user?.role || '';
      const isEmployee = typeof role === 'string' && role.toUpperCase() === 'EMPLOYEE';
      
      if (isEmployee || response.accessToken) {
        // Bypass OTP for employees or users who got a token directly
        handleLoginSuccess({ ...response, email } as any);
        navigate('/');
      } else {
        // Store email (and any data returned) for OTP page, but do NOT authenticate
        handleOtpPending({ ...response, email });
        
        // Go to OTP page for owners/others
        navigate('/otp');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.loginError'));
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
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 text-gold mb-4 shadow-sm border border-gold/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-charcoal mb-2">{t('auth.loginTitle')}</h1>
          <p className="text-sm text-gray-500 tracking-wide font-medium">{t('auth.loginSubtitle')}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all bg-white/80 focus:bg-white ${!isRtl && 'text-left'}`}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-charcoal">{t('auth.password')}</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-gold hover:text-charcoal transition-colors">
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all bg-white/80 focus:bg-white ${!isRtl && 'text-left'} ${isRtl ? 'pl-12' : 'pr-12'}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-4' : 'right-4'} text-gray-400 hover:text-gold transition-colors focus:outline-none flex items-center justify-center`}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 mt-2 bg-gold hover:bg-[#b59540] text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? t('auth.loading') : t('auth.loginButton')}
          </button>
        </form>
      </div>
    </div>
  );
};
