import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User, AuthTokens } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const userData = await authService.fetchCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('[AuthContext] Failed to fetch user:', error);
        // Clear invalid tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData: User, tokens: AuthTokens) => {
    // Store tokens and user data
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {!loading && children}
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

// Made with Bob
