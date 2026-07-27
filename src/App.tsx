import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './core/context/AuthContext';
import { ProtectedRoute } from './core/guards/ProtectedRoute';
import { RoleGuard } from './core/guards/RoleGuard';
import { AppLayout } from './components/layout/AppLayout';

import { LoginPage } from './pages/auth/LoginPage';
import { OtpPage } from './pages/auth/OtpPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { InventoryPage } from './pages/workspace/InventoryPage';
import { ScrapPage } from './pages/workspace/ScrapPage';
import { ScrapSalesCounterPage } from './pages/workspace/ScrapSalesCounterPage';
import { ScrapInvoicesPage } from './pages/workspace/ScrapInvoicesPage';
import { SalesCounterPage } from './pages/workspace/SalesCounterPage';
import { EmployeesPage } from './pages/workspace/EmployeesPage';
import { CategoriesPage } from './pages/workspace/CategoriesPage';
import { AuditPage } from './pages/workspace/AuditPage';
import { LedgerPage } from './pages/workspace/LedgerPage';
import { PurchasesLedgerPage } from './pages/workspace/PurchasesLedgerPage';
import { ExpensesPage } from './pages/workspace/ExpensesPage';
import { NotificationsPage } from './pages/workspace/NotificationsPage';
import { CustomersPage } from './pages/workspace/CustomersPage';
import { InvoicesPage } from './pages/workspace/InvoicesPage';
import { ProfitLedgerPage } from './pages/workspace/ProfitLedgerPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Auth Flow for Owner */}
          <Route path="/otp" element={<OtpPage />} />

          {/* Protected Main Workspace */}
          <Route path="/" element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* Default redirect based on strict roles logic inside components, but here we default to sales or dashboard */}
              <Route index element={<Navigate to="/sales" replace />} />
              
              {/* Both Roles */}
              <Route path="sales" element={<SalesCounterPage />} />
              <Route path="scrap-sales" element={<ScrapSalesCounterPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="scrap-invoices" element={<ScrapInvoicesPage />} />

              {/* Owner Only Routes */}
              <Route element={<RoleGuard allowedRole="OWNER" />}>
                {/* Inventory & Categories are protected by role */}
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="scrap" element={<ScrapPage />} />
                <Route path="employees" element={<EmployeesPage />} />
                <Route path="audit" element={<AuditPage />} />
                <Route path="ledger" element={<LedgerPage />} />
                <Route path="purchases-ledger" element={<PurchasesLedgerPage />} />
                <Route path="profits-ledger" element={<ProfitLedgerPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
              </Route>
              
              {/* Unauthorized Fallback */}
              <Route path="unauthorized" element={
                <div className="flex items-center justify-center h-full flex-col gap-4">
                  <h1 className="text-4xl text-charcoal font-bold">403</h1>
                  <p className="text-gray-500">غير مصرح لك بالوصول إلى هذه الصفحة</p>
                </div>
              } />
            </Route>
          </Route>

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
