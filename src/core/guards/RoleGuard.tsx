import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RoleGuardProps {
  allowedRole: 'OWNER' | 'EMPLOYEE';
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen" dir="rtl">جاري التحميل...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Strict role check. If user doesn't match the allowedRole, redirect to a safe page.
  if (user.role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
