import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, getGasUrl, setGasUrl } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('PR_YOUTH_USER');
    return saved ? JSON.parse(saved) : null;
  });

  const [gasUrlState, setGasUrlState] = useState(() => getGasUrl());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (user) {
      localStorage.setItem('PR_YOUTH_USER', JSON.stringify(user));
    } else {
      localStorage.removeItem('PR_YOUTH_USER');
    }
  }, [user]);

  // Function to trigger live refresh across all active components
  const triggerRefresh = useCallback(() => {
    setIsSyncing(true);
    setRefreshTrigger((prev) => prev + 1);
    setLastSyncTime(new Date());
    setTimeout(() => setIsSyncing(false), 800);
  }, []);

  // Automatic Background Polling (Every 10 seconds when logged in)
  useEffect(() => {
    if (!user) return;

    const timer = setInterval(() => {
      triggerRefresh();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(timer);
  }, [user, triggerRefresh]);

  // Automatic Refresh on Window / Tab Focus (Whenever user switches back from Google Sheets)
  useEffect(() => {
    if (!user) return;

    const handleFocus = () => {
      triggerRefresh();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, triggerRefresh]);

  const login = async (usernameOrId, password) => {
    setIsLoading(true);
    try {
      const res = await api.login(usernameOrId, password);
      if (res.success && res.user) {
        setUser(res.user);
        setActiveTab('dashboard');
        triggerRefresh();
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err.message || 'An error occurred during login.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setActiveTab('dashboard');
  };

  const updateGasUrl = (url) => {
    setGasUrl(url);
    setGasUrlState(url);
    triggerRefresh();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        activeTab,
        setActiveTab,
        gasUrl: gasUrlState,
        updateGasUrl,
        isLoading,
        isSyncing,
        lastSyncTime,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
