import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, getGasUrl, setGasUrl } from '../services/api';
import { safeStorage } from '../utils/safeStorage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = safeStorage.getItem('PR_YOUTH_USER');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('Failed to parse saved user credentials', e);
      return null;
    }
  });

  const [gasUrlState, setGasUrlState] = useState(() => getGasUrl());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [donationSubTab, setDonationSubTab] = useState('chanda'); // 'chanda' | 'laddu'
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (user) {
      try {
        safeStorage.setItem('PR_YOUTH_USER', JSON.stringify(user));
      } catch (e) {
        console.warn('Failed to save user credentials', e);
      }
    } else {
      safeStorage.removeItem('PR_YOUTH_USER');
      safeStorage.clearSession();
    }
  }, [user]);

  // Check if current user was deactivated in Google Sheets
  const checkMemberDeactivation = useCallback(async () => {
    if (!user || user.role === 'Admin') return;

    try {
      const res = await api.getMembers();
      if (res.success && Array.isArray(res.data)) {
        const matched = res.data.find(
          (m) => String(m.memberId).toUpperCase() === String(user.memberId).toUpperCase()
        );

        if (matched) {
          const statusStr = String(matched.status || '').toLowerCase();
          const activeVal = String(matched.active).toLowerCase();
          const isInactive =
            statusStr === 'inactive' ||
            activeVal === 'false' ||
            activeVal === '0' ||
            matched.active === false;

          if (isInactive) {
            console.warn(`User ${user.memberId} has been deactivated in Google Sheets. Evicting session.`);
            setUser(null);
            safeStorage.clearSession();
            safeStorage.removeItem('PR_YOUTH_USER');
            alert('Your account has been marked Inactive by administrator. You have been logged out.');
          }
        }
      }
    } catch (err) {
      console.error('Failed to verify member status', err);
    }
  }, [user]);

  // Function to trigger live refresh across all active components on demand
  const triggerRefresh = useCallback(() => {
    setIsSyncing(true);
    setRefreshTrigger((prev) => prev + 1);
    setLastSyncTime(new Date());
    checkMemberDeactivation();
    setTimeout(() => setIsSyncing(false), 1200);
  }, [checkMemberDeactivation]);

  // Live Auto-Sync Every 10 Seconds
  useEffect(() => {
    if (!user) return;

    const timer = setInterval(() => {
      triggerRefresh();
    }, 10000);

    return () => clearInterval(timer);
  }, [user, triggerRefresh]);

  // Auto-sync when user focuses back on window/tab
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
        const baseline = {
          totalDonations: 0,
          totalExpenses: 0,
          currentBalance: 0,
          expenseCount: 0,
          categoryBreakdown: {},
          recentActivity: [],
        };
        if (!safeStorage.getSessionItem('ADMIN_DASH_DATA')) {
          safeStorage.setSessionItem('ADMIN_DASH_DATA', JSON.stringify(baseline));
        }
        if (!safeStorage.getSessionItem(`MEMBER_DASH_${res.user.memberId}`)) {
          safeStorage.setSessionItem(`MEMBER_DASH_${res.user.memberId}`, JSON.stringify(baseline));
        }

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
    safeStorage.clearSession();
    safeStorage.removeItem('PR_YOUTH_USER');
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
        donationSubTab,
        setDonationSubTab,
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
