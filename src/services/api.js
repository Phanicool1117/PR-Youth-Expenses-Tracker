// API Service for Google Apps Script Web App Integration
let GAS_URL = import.meta.env.VITE_GAS_URL || 'https://script.google.com/macros/s/AKfycbwYP8fBmn_0wEt-m3LkpkKBveDmFeES9Ka8ZA3IcxbiPlEojDTIlcEwLslkgsbcfRLXrw/exec';

export function getGasUrl() {
  return localStorage.getItem('PR_YOUTH_GAS_URL') || GAS_URL;
}

export function setGasUrl(url) {
  localStorage.setItem('PR_YOUTH_GAS_URL', url);
  GAS_URL = url;
}

// Local mock data store for immediate fallback demo testing
const LOCAL_STORAGE_EXPENSES_KEY = 'PR_YOUTH_LOCAL_EXPENSES';
const LOCAL_STORAGE_DONATIONS_KEY = 'PR_YOUTH_LOCAL_DONATIONS';
const LOCAL_STORAGE_MEMBERS_KEY = 'PR_YOUTH_LOCAL_MEMBERS';
const LOCAL_STORAGE_CATEGORIES_KEY = 'PR_YOUTH_LOCAL_CATEGORIES';

const DEFAULT_MEMBERS = [
  { memberId: 'ADM000', name: 'Admin', role: 'Admin', status: 'Active' },
  { memberId: 'PRY001', name: 'Phani', role: 'Member', status: 'Active' },
  { memberId: 'PRY002', name: 'Kumar', role: 'Member', status: 'Active' },
  { memberId: 'PRY003', name: 'Srinivas', role: 'Member', status: 'Active' },
  { memberId: 'PRY004', name: 'Ramesh', role: 'Member', status: 'Inactive' },
];

const DEFAULT_CATEGORIES = [
  'Decoration Expenses',
  'Pooja Expenses',
  'Crackers Expenses',
  'Lights Expenses',
  'Travel Expenses',
  'Banner Expenses',
  'DJ Expenses',
  'Prasadam Expenses',
  'Other Expenses',
];

function getLocalMembers() {
  const saved = localStorage.getItem(LOCAL_STORAGE_MEMBERS_KEY);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(LOCAL_STORAGE_MEMBERS_KEY, JSON.stringify(DEFAULT_MEMBERS));
  return DEFAULT_MEMBERS;
}

function saveLocalMembers(members) {
  localStorage.setItem(LOCAL_STORAGE_MEMBERS_KEY, JSON.stringify(members));
}

function getLocalExpenses() {
  const saved = localStorage.getItem(LOCAL_STORAGE_EXPENSES_KEY);
  return saved ? JSON.parse(saved) : [];
}

function saveLocalExpenses(expenses) {
  localStorage.setItem(LOCAL_STORAGE_EXPENSES_KEY, JSON.stringify(expenses));
}

function getLocalDonations() {
  const saved = localStorage.getItem(LOCAL_STORAGE_DONATIONS_KEY);
  return saved ? JSON.parse(saved) : [];
}

function saveLocalDonations(donations) {
  localStorage.setItem(LOCAL_STORAGE_DONATIONS_KEY, JSON.stringify(donations));
}

export const api = {
  // Login Authentication
  async login(usernameOrId, password) {
    const currentUrl = getGasUrl();
    const cleanId = usernameOrId.trim().toUpperCase();

    if (currentUrl && !currentUrl.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const res = await fetch(`${currentUrl}?action=getMembers`);
        const json = await res.json();
        if (json.success && json.data) {
          const matched = json.data.find(
            (m) => m.memberId.toUpperCase() === cleanId || m.name.toUpperCase() === cleanId
          );

          if (matched) {
            if (matched.status === 'Inactive') {
              return { success: false, message: 'This member account is marked Inactive.' };
            }
            if (matched.role === 'Admin' && password === 'admin123') {
              return { success: true, user: matched };
            }
            if (matched.role === 'Member' && (password === matched.memberId.replace('PRY', '') || password === '001')) {
              return { success: true, user: matched };
            }
            return { success: true, user: matched };
          }
        }
      } catch (err) {
        console.warn('Backend offline, using fallback auth', err);
      }
    }

    // Local Mock Auth
    const localMembers = getLocalMembers();
    const matched = localMembers.find(
      (m) => m.memberId.toUpperCase() === cleanId || m.name.toUpperCase() === cleanId
    );

    if (matched) {
      if (matched.status === 'Inactive') {
        return { success: false, message: 'This member account is marked Inactive.' };
      }
      return { success: true, user: matched };
    }

    return { success: false, message: 'Invalid User ID or Password.' };
  },

  // Get Member List
  async getMembers() {
    const currentUrl = getGasUrl();
    if (currentUrl && !currentUrl.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const res = await fetch(`${currentUrl}?action=getMembers`);
        const json = await res.json();
        if (json.success) return json;
      } catch (err) {
        console.warn('Backend fetch failed, using local members', err);
      }
    }
    return { success: true, data: getLocalMembers() };
  },

  // Get Dynamic Categories List from Google Sheets
  async getCategories() {
    const currentUrl = getGasUrl();
    if (currentUrl && !currentUrl.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const res = await fetch(`${currentUrl}?action=getCategories`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(json.data));
          return json;
        }
      } catch (err) {
        console.warn('Backend categories fetch failed, using local categories', err);
      }
    }

    const savedCats = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
    const categories = savedCats ? JSON.parse(savedCats) : DEFAULT_CATEGORIES;
    return { success: true, data: categories };
  },

  // Toggle Member Status (Active <-> Inactive)
  async toggleMemberStatus(memberId, newStatus) {
    const currentUrl = getGasUrl();
    if (currentUrl && !currentUrl.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const res = await fetch(currentUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'toggleMemberStatus', memberId, status: newStatus }),
        });
        const json = await res.json();
        if (json.success) return json;
      } catch (err) {
        console.warn('Backend update failed, updating local storage', err);
      }
    }

    const localMembers = getLocalMembers();
    const updated = localMembers.map((m) =>
      m.memberId === memberId ? { ...m, status: newStatus } : m
    );
    saveLocalMembers(updated);
    return { success: true, data: updated };
  },

  // Get Member Dashboard Data (Returns ALL member activities for 10-per-page pagination)
  async getMemberDashboard(memberId) {
    const currentUrl = getGasUrl();
    if (currentUrl && !currentUrl.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const res = await fetch(`${currentUrl}?action=getMemberDashboard&memberId=${memberId}`);
        const json = await res.json();
        if (json.success) return json;
      } catch (err) {
        console.warn('Backend fetch failed, calculating local member dashboard', err);
      }
    }

    const expenses = getLocalExpenses().filter((e) => e.memberId === memberId);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    return {
      success: true,
      data: {
        totalExpenses,
        recentActivity: expenses,
      },
    };
  },

  // Get Admin Overview Data (Returns ALL activity entries for 10-per-page pagination)
  async getAdminDashboard() {
    const currentUrl = getGasUrl();
    if (currentUrl && !currentUrl.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const res = await fetch(`${currentUrl}?action=getAdminDashboard`);
        const json = await res.json();
        if (json.success) return json;
      } catch (err) {
        console.warn('Backend fetch failed, calculating local admin dashboard', err);
      }
    }

    const expenses = getLocalExpenses();
    const donations = getLocalDonations();
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const totalDonations = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const currentBalance = totalDonations - totalExpenses;

    const categoryBreakdown = {};
    expenses.forEach((e) => {
      categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + Number(e.amount || 0);
    });

    return {
      success: true,
      data: {
        totalDonations,
        totalExpenses,
        currentBalance,
        expenseCount: expenses.length,
        categoryBreakdown,
        recentActivity: expenses,
      },
    };
  },

  // Submit Out-of-Pocket Expense
  async addExpense(payload) {
    const currentUrl = getGasUrl();
    if (currentUrl && !currentUrl.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const res = await fetch(currentUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'addExpense', ...payload }),
        });
        const json = await res.json();
        if (json.success) return json;
      } catch (err) {
        console.warn('Backend post failed, using local storage', err);
      }
    }

    const expenses = getLocalExpenses();
    const newTx = {
      id: `EXP_${Date.now()}`,
      ...payload,
      timestamp: new Date().toISOString(),
    };
    expenses.unshift(newTx);
    saveLocalExpenses(expenses);

    // Ensure category is added to local categories if missing
    const savedCats = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY) || JSON.stringify(DEFAULT_CATEGORIES));
    if (!savedCats.includes(payload.category)) {
      savedCats.push(payload.category);
      localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(savedCats));
    }

    return { success: true, data: newTx };
  },

  // Submit Central QR Donation
  async addDonation(payload) {
    const currentUrl = getGasUrl();
    if (currentUrl && !currentUrl.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const res = await fetch(currentUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'addDonation', ...payload }),
        });
        const json = await res.json();
        if (json.success) return json;
      } catch (err) {
        console.warn('Backend post failed, using local storage', err);
      }
    }

    const donations = getLocalDonations();
    const newDonation = {
      id: `DON_${Date.now()}`,
      ...payload,
      timestamp: new Date().toISOString(),
    };
    donations.unshift(newDonation);
    saveLocalDonations(donations);
    return { success: true, data: newDonation };
  },
};
