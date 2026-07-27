/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { UserSession } from '../../common/types/auth.types';

const SESSION_KEY = 'gms_user_session';
const TOKEN_KEY = 'accessToken';

/** Try to restore a saved session from localStorage on startup */
const getStoredSession = (): UserSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    if (raw && token) {
      const session = JSON.parse(raw) as UserSession;
      // Make sure the token is up to date
      session.accessToken = token;
      return session;
    }
  } catch {
    // Corrupted data – clear it
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }
  return null;
};

interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  handleLoginSuccess: (session: UserSession) => void;
  handleOtpPending: (session: Partial<UserSession>) => void;
  handleLogout: () => void;
  setLoading: (status: boolean) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Restore session on first load
  const storedSession = getStoredSession();

  const [user, setUser] = useState<UserSession | null>(storedSession);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!storedSession);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLoginSuccess = (session: UserSession) => {
    // Try multiple token key names from the session object
    const sessionAny = session as any;
    const token = session.accessToken || sessionAny.access_token || sessionAny.token || '';

    // Normalize the session with the found token
    const normalizedSession: UserSession = {
      id: session.id || sessionAny._id || '',
      fullName: session.fullName || sessionAny.full_name || '',
      email: session.email || '',
      role: session.role || 'EMPLOYEE',
      accessToken: token,
    };

    setUser(normalizedSession);
    setIsAuthenticated(true);
    setIsLoading(false);

    // Persist to localStorage so refresh keeps you logged in
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(normalizedSession));

    console.log('handleLoginSuccess - Token:', token ? `${token.substring(0, 20)}...` : 'NONE');
  };

  const handleOtpPending = (session: Partial<UserSession>) => {
    setUser(session as UserSession);
    setIsAuthenticated(false);
    // Don't persist – OTP is not yet verified
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  };

  const setLoading = (status: boolean) => {
    setIsLoading(status);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        handleLoginSuccess,
        handleOtpPending,
        handleLogout,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
