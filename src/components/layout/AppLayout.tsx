import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../core/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { 
  Box, 
  CircleDollarSign, 
  FileText, 
  Users, 
  UserCog, 
  History, 
  ShoppingCart, 
  Bell, 
  LogOut,
  Tags,
  Activity,
  FileSpreadsheet,
  Receipt,
  Menu,
  X,
  Banknote,
  Barcode
} from 'lucide-react';
import { useLiveNotifications } from '../../hooks/useLiveNotifications';
import { useNotificationsStore } from '../../store/notifications.store';

/* ──────────────────────────────────────────────
   THEME COLOR MAP — every module has its own accent
   ────────────────────────────────────────────── */
const THEME_COLORS: Record<string, { bg: string; text: string; activeBg: string }> = {
  '/sales':         { bg: 'bg-theme-sales/10',      text: 'text-theme-sales',      activeBg: 'bg-theme-sales/10' },
  '/scrap-sales':   { bg: 'bg-theme-scrap/10',      text: 'text-theme-scrap',      activeBg: 'bg-theme-scrap/10' },
  '/inventory':     { bg: 'bg-theme-inventory/10',  text: 'text-theme-inventory',  activeBg: 'bg-theme-inventory/10' },
  '/bullion-inventory': { bg: 'bg-theme-inventory/10',  text: 'text-theme-inventory',  activeBg: 'bg-theme-inventory/10' },
  '/categories':    { bg: 'bg-theme-categories/10', text: 'text-theme-categories', activeBg: 'bg-theme-categories/10' },
  '/scrap':         { bg: 'bg-theme-scrap/10',      text: 'text-theme-scrap',      activeBg: 'bg-theme-scrap/10' },
  '/invoices':      { bg: 'bg-theme-sales/10',      text: 'text-theme-sales',      activeBg: 'bg-theme-sales/10' },
  '/scrap-invoices':{ bg: 'bg-theme-scrap/10',      text: 'text-theme-scrap',      activeBg: 'bg-theme-scrap/10' },
  '/customers':     { bg: 'bg-theme-customers/10',  text: 'text-theme-customers',  activeBg: 'bg-theme-customers/10' },
  '/employees':     { bg: 'bg-theme-employees/10', text: 'text-theme-employees', activeBg: 'bg-theme-employees/10' },
  '/audit':         { bg: 'bg-theme-movements/10',  text: 'text-theme-movements',  activeBg: 'bg-theme-movements/10' },
  '/ledger':        { bg: 'bg-gold/10',             text: 'text-gold',             activeBg: 'bg-gold/10' },
  '/purchases-ledger': { bg: 'bg-gold/10',          text: 'text-gold',             activeBg: 'bg-gold/10' },
  '/profits-ledger':   { bg: 'bg-purple-50',        text: 'text-purple-600',       activeBg: 'bg-purple-50' },
  '/expenses':      { bg: 'bg-amber-50',            text: 'text-amber-600',        activeBg: 'bg-amber-50' },
  '/incomes':       { bg: 'bg-emerald-500/10',      text: 'text-emerald-600',      activeBg: 'bg-emerald-500/10' },
  '/notifications': { bg: 'bg-gold/10',             text: 'text-gold',             activeBg: 'bg-gold/10' },
  '/barcode-sales':   { bg: 'bg-indigo-50', text: 'text-indigo-600', activeBg: 'bg-indigo-50' },
  '/barcode-invoices':{ bg: 'bg-indigo-50', text: 'text-indigo-600', activeBg: 'bg-indigo-50' },
  '/barcode-inventory':{ bg: 'bg-indigo-50', text: 'text-indigo-600', activeBg: 'bg-indigo-50' },
};

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);
  const theme = THEME_COLORS[to] || { bg: 'bg-gold/10', text: 'text-gold', activeBg: 'bg-gold/10' };

  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
        isActive 
          ? `${theme.activeBg} ${theme.text} font-medium` 
          : 'text-gray-600 hover:bg-gray-50 hover:text-charcoal'
      }`}
    >
      <Icon size={20} className={isActive ? theme.text : 'text-gray-400'} />
      <span>{label}</span>
    </Link>
  );
};

export const AppLayout: React.FC = () => {
  const { user, handleLogout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Initialize live notifications hook
  useLiveNotifications();
  const { unreadCount, liveNotifications, isConnected } = useNotificationsStore();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const onLogout = () => {
    handleLogout();
    navigate('/login');
  };

  const isOwner = user?.role === 'OWNER';
  const isRtl = i18n.language.startsWith('ar');

  return (
    <div className="flex h-screen bg-light-gray text-charcoal overflow-hidden relative">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} z-50 w-64 bg-white flex flex-col shadow-2xl md:shadow-sm transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 print:hidden ${isRtl ? 'border-l border-gray-100' : 'border-r border-gray-100'} ${isMobileMenuOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')}`}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">duo dev</h1>
            <p className="text-sm text-gold font-medium">{t('nav.title')}</p>
          </div>
          <button 
            className="md:hidden text-gray-400 hover:text-charcoal transition-colors p-1"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {isOwner ? (
            <>
              {/* ── Sales & POS (Red) ── */}
              <div className="pt-2 pb-1">
                <span className="text-[10px] font-bold text-theme-sales/60 uppercase tracking-wider px-3">
                  {t('nav.sales')}
                </span>
              </div>
              <NavItem to="/sales" icon={ShoppingCart} label={t('nav.sales')} />
              <NavItem to="/invoices" icon={FileText} label={t('nav.invoices')} />
              <NavItem to="/bullion-sales" icon={ShoppingCart} label="بيع سبايك/جنيهات" />
              <NavItem to="/bullion-invoices" icon={FileText} label="فواتير السبايك" />
              <NavItem to="/barcode-sales" icon={Barcode} label="بيع قطع بالباركود" />
              <NavItem to="/barcode-invoices" icon={FileText} label="فواتير الباركود" />

              {/* ── Inventory (Blue) ── */}
              <div className="pt-4 pb-1">
                <span className="text-[10px] font-bold text-theme-inventory/60 uppercase tracking-wider px-3">
                  {t('nav.inventory')}
                </span>
              </div>
              <NavItem to="/inventory" icon={Box} label={t('nav.inventory')} />
              <NavItem to="/bullion-inventory" icon={Box} label="مخزن السبايك" />
              <NavItem to="/barcode-inventory" icon={Barcode} label="مخزن الباركود" />
              <NavItem to="/categories" icon={Tags} label={t('nav.categories')} />

              {/* ── Scrap Gold (Emerald Green) ── */}
              <div className="pt-4 pb-1">
                <span className="text-[10px] font-bold text-theme-scrap/60 uppercase tracking-wider px-3">
                  {t('nav.scrap')}
                </span>
              </div>
              <NavItem to="/scrap" icon={CircleDollarSign} label={t('nav.scrap')} />
              <NavItem to="/scrap-sales" icon={ShoppingCart} label={t('nav.scrapSales')} />
              <NavItem to="/scrap-invoices" icon={FileText} label={t('nav.scrapInvoices')} />

              {/* ── Customers (Gold) ── */}
              <div className="pt-4 pb-1">
                <span className="text-[10px] font-bold text-theme-customers/60 uppercase tracking-wider px-3">
                  {t('nav.customers')}
                </span>
              </div>
              <NavItem to="/customers" icon={Users} label={t('nav.customers')} />
              {/* ── Financials & Expenses (Amber) ── */}
              <div className="pt-4 pb-1">
                <span className="text-[10px] font-bold text-amber-600/60 uppercase tracking-wider px-3">
                  الماليات والمصروفات
                </span>
              </div>
              <NavItem to="/purchases-ledger" icon={FileSpreadsheet} label="دفتر المشتريات والخوارج" />
              <NavItem to="/incomes" icon={Banknote} label="الدخل والإيرادات" />
              <NavItem to="/expenses" icon={Receipt} label="المصاريف النثرية" />

              {/* ── System & Audit (Iron Gray) ── */}
              <div className="pt-4 pb-1">
                <span className="text-[10px] font-bold text-theme-movements/60 uppercase tracking-wider px-3">
                  النظام والمراقبة
                </span>
              </div>
              <NavItem to="/employees" icon={UserCog} label={t('nav.employees')} />
              <NavItem to="/audit" icon={History} label={t('nav.audit')} />
              <NavItem to="/ledger" icon={Activity} label="الخزنة وجرد الأرصدة" />
              <NavItem to="/notifications" icon={Bell} label="مركز التنبيهات" />
            </>
          ) : (
            <>
              <NavItem to="/sales" icon={ShoppingCart} label={t('nav.sales')} />
              <NavItem to="/invoices" icon={FileText} label={t('nav.invoices')} />
              <NavItem to="/bullion-sales" icon={ShoppingCart} label="بيع سبايك/جنيهات" />
              <NavItem to="/bullion-invoices" icon={FileText} label="فواتير السبايك" />
              <NavItem to="/barcode-sales" icon={Barcode} label="بيع قطع بالباركود" />
              <NavItem to="/barcode-invoices" icon={FileText} label="فواتير الباركود" />
              <NavItem to="/inventory" icon={Box} label={t('nav.inventory')} />
              <NavItem to="/bullion-inventory" icon={Box} label="مخزن السبايك" />
              <NavItem to="/barcode-inventory" icon={Barcode} label="مخزن الباركود" />
              <NavItem to="/scrap" icon={CircleDollarSign} label={t('nav.scrap')} />
              <NavItem to="/scrap-sales" icon={ShoppingCart} label={t('nav.scrapSales')} />
              <NavItem to="/scrap-invoices" icon={FileText} label={t('nav.scrapInvoices')} />
              <NavItem to="/customers" icon={Users} label={t('nav.customers')} />
              <NavItem to="/incomes" icon={Banknote} label="الدخل والإيرادات" />
              <NavItem to="/expenses" icon={Receipt} label="المصاريف النثرية" />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold uppercase">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-medium text-charcoal text-sm">{user?.fullName || 'User'}</p>
              <p className="text-xs text-gray-500">{isOwner ? t('nav.owner') : t('nav.employee')}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 w-full py-2 px-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen print:w-full relative">
        {/* Top Bar */}
        <header className="h-16 shrink-0 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 shadow-sm z-10 print:hidden">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-gray-600 hover:text-gold transition-colors p-1"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg sm:text-xl font-bold text-charcoal hidden sm:block">{t('nav.title')}</h2>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <LanguageSwitcher />
            {isOwner && (
              <div className="relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 text-gray-400 hover:text-gold transition-colors focus:outline-none"
                >
                  <Bell size={24} />
                  {unreadCount > 0 && (
                    <span className={`absolute top-1.5 ${isRtl ? 'right-1.5' : 'left-1.5'} min-w-[1.25rem] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center`}>
                      {unreadCount > 99 ? '+99' : unreadCount}
                    </span>
                  )}
                  {isConnected && unreadCount === 0 && (
                    <span className={`absolute top-1.5 ${isRtl ? 'right-1.5' : 'left-1.5'} w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white`}></span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotificationsOpen && (
                  <div className={`absolute top-full mt-2 ${isRtl ? 'left-0' : 'right-0'} w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50`}>
                    <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                      <h3 className="font-bold text-charcoal text-sm">الإشعارات اللحظية</h3>
                      <Link 
                        to="/notifications" 
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-xs font-bold text-gold hover:underline"
                      >
                        عرض الكل
                      </Link>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {liveNotifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-400 text-sm font-medium">
                          لا توجد إشعارات جديدة.
                        </div>
                      ) : (
                        liveNotifications.slice(0, 5).map(notif => (
                          <Link 
                            key={notif.id}
                            to="/notifications"
                            onClick={() => setIsNotificationsOpen(false)}
                            className="block p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors text-sm"
                          >
                            <p className="text-charcoal font-bold line-clamp-2 leading-relaxed">{notif.message}</p>
                            <span className="text-[10px] text-gray-400 font-bold mt-1 block" dir="ltr">
                              {new Date(notif.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
