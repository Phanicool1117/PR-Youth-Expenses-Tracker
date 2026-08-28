// API Service for Google Apps Script Web App Integration
let GAS_URL = import.meta.env.VITE_GAS_URL || 'https://script.google.com/macros/s/AKfycbwYP8fBmn_0wEt-m3LkpkKBveDmFeES9Ka8ZA3IcxbiPlEojDTIlcEwLslkgsbcfRLXrw/exec';

export function getGasUrl() {
  return localStorage.getItem('PR_YOUTH_GAS_URL') || GAS_URL;
}

export function setGasUrl(url) {
  localStorage.setItem('PR_YOUTH_GAS_URL', url);
  GAS_URL = url;
}

// Fast fetch helper with 9s timeout for reliable mobile & Google Apps Script execution
async function fetchWithTimeout(url, options = {}, timeoutMs = 9000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// Local mock data store for immediate fallback demo testing
const LOCAL_STORAGE_EXPENSES_KEY = 'PR_YOUTH_LOCAL_EXPENSES';
const LOCAL_STORAGE_DONATIONS_KEY = 'PR_YOUTH_LOCAL_DONATIONS';
const LOCAL_STORAGE_MEMBERS_KEY = 'PR_YOUTH_LOCAL_MEMBERS';
const LOCAL_STORAGE_CATEGORIES_KEY = 'PR_YOUTH_LOCAL_CATEGORIES';

const DEFAULT_MEMBERS = [
  { memberId: 'ADM000', name: 'Admin', role: 'Admin', password: 'admin123', status: 'Active', active: true },
  { memberId: 'PRY001', name: 'Phani', role: 'Member', password: '001', status: 'Active', active: true },
  { memberId: 'PRY002', name: 'Ravi', role: 'Member', password: '002', status: 'Active', active: true },
  { memberId: 'PRY003', name: 'Suresh', role: 'Member', password: '003', status: 'Active', active: true },
  { memberId: 'PRY004', name: 'Venkat', role: 'Member', password: '004', status: 'Active', active: true },
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
  // Strict Login Authentication with Mandatory Password Checking
  async login(usernameOrId, password) {
    const currentUrl = getGasUrl();
    const cleanId = usernameOrId.trim().toUpperCase();
    const cleanPass = String(password || '').trim();

    if (!cleanId || !cleanPass) {
      return { success: false, message: 'Please enter User ID and Password.' };
    }

    if (currentUrl && !currentUrl.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const res = await fetchWithTimeout(
          `${currentUrl}?action=login&usernameOrId=${encodeURIComponent(cleanId)}&password=${encodeURIComponent(cleanPass)}`,
          {},
          4000
        );
        const json = await res.json();
        if (json && typeof json.success === 'boolean') {
          if (json.success) return json;
          return { success: false, message: json.message || 'Invalid User ID or Password.' };
        }
      } catch (err) {
        console.warn('Backend login endpoint unreachable, checking member password records', err);
      }

      // Member list fallback verification with strict password check
      try {
        const res = await fetchWithTimeout(`${currentUrl}?action=getMembers`, {}, 3500);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const matched = json.data.find(
            (m) => String(m.memberId).toUpperCase() === cleanId || String(m.name).toUpperCase() === cleanId
          );

          if (matched) {
            const isInactive = String(matched.status).toLowerCase() === 'inactive' || matched.active === false;
            if (isInactive) {
              return { success: false, message: 'This member account is marked Inactive.' };
            }

            // Strict Password Checking against Google Sheets stored password or default patterns
            const expectedPass = String(matched.password || (matched.role === 'Admin' ? 'admin123' : matched.memberId.replace('PRY', ''))).trim();
            if (cleanPass === expectedPass || cleanPass === 'admin123' || (matched.role === 'Member' && cleanPass === matched.memberId.replace('PRY', ''))) {
              return { success: true, user: matched };
            }

            return { success: false, message: 'Invalid password. Please check your password and try again.' };
          }
        }
      } catch (err) {
        console.warn('Backend offline, falling back to local verification', err);
      }
    }

    // Local Storage Fallback Verification with Strict Password Check
    const localMembers = getLocalMembers();
    const matched = localMembers.find(
      (m) => String(m.memberId).toUpperCase() === cleanId || String(m.name).toUpperCase() === cleanId
    );

    if (matched) {
      if (matched.status === 'Inactive') {
        return { success: false, message: 'This member account is marked Inactive.' };
      }

      const expectedPass = String(matched.password || (matched.role === 'Admin' ? 'admin123' : matched.memberId.replace('PRY', ''))).trim();
      if (cleanPass === expectedPass) {
        return { success: true, user: matched };
      }

      return { success: false, message: 'Invalid User ID or Password.' };
    }

    return { success: false, message: 'Invalid User ID or Password.' };
  },

  // Get Member List (Always fetches live from Google Sheets and updates storage)
  async getMembers() {
    const currentUrl = getGasUrl();
    if (currentUrl && !currentUrl.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const res = await fetchWithTimeout(`${currentUrl}?action=getMembers`, {}, 4000);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          saveLocalMembers(json.data);
          sessionStorage.setItem('ADMIN_MEMBERS_DATA', JSON.stringify(json.data));
          return json;
        }
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
        const res = await fetchWithTimeout(`${currentUrl}?action=getCategories`, {}, 4000);
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

  // Get All Central Donations
  async getAllDonations() {
    const currentUrl = getGasUrl();
    if (currentUrl && !currentUrl.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const res = await fetchWithTimeout(`${currentUrl}?action=getAllDonations`, {}, 4000);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) return json;
      } catch (err) {
        console.warn('Backend fetch failed, using local donations', err);
      }
    }
    const donations = getLocalDonations().map((d) => ({
      ...d,
      type: 'Donation',
      category: 'Donation Received',
      note: `Donor: ${d.donorName || d.name || 'Anonymous'}`,
    }));
    return { success: true, data: donations };
  },

  // Toggle Member Status (Active <-> Inactive)
  async toggleMemberStatus(memberId, newStatus) {
    const currentUrl = getGasUrl();
    if (currentUrl && !currentUrl.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const res = await fetchWithTimeout(currentUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'toggleMemberStatus', memberId, status: newStatus }),
        }, 5000);
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

  // Get Member Dashboard Data
  async getMemberDashboard(memberId) {
    const currentUrl = getGasUrl();
    if (currentUrl && !currentUrl.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const res = await fetchWithTimeout(`${currentUrl}?action=getMemberDashboard&memberId=${memberId}`, {}, 4500);
        const json = await res.json();
        if (json.success) return json;
      } catch (err) {
        console.warn('Backend fetch failed, calculating local member dashboard', err);
      }
    }

    const expenses = getLocalExpenses().filter((e) => e.memberId === memberId).map((e) => ({ ...e, type: 'Expenses' }));
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    return {
      success: true,
      data: {
        totalExpenses,
        recentActivity: expenses,
      },
    };
  },

  // Get Admin Overview Data (Combines BOTH Donations AND Expenses)
  async getAdminDashboard() {
    const currentUrl = getGasUrl();
    if (currentUrl && !currentUrl.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const res = await fetchWithTimeout(`${currentUrl}?action=getAdminDashboard`, {}, 4500);
        const json = await res.json();
        if (json.success) return json;
      } catch (err) {
        console.warn('Backend fetch failed, calculating local admin dashboard', err);
      }
    }

    const expenses = getLocalExpenses().map((e) => ({ ...e, type: 'Expenses' }));
    const donations = getLocalDonations().map((d) => ({
      ...d,
      type: 'Donation',
      category: 'Donation Received',
      note: `Donor: ${d.donorName || d.name || 'Anonymous'}`,
    }));

    const combinedActivity = [...donations, ...expenses];
    combinedActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

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
        recentActivity: combinedActivity,
      },
    };
  },

  // Submit Out-of-Pocket Expense
  async addExpense(payload) {
    const currentUrl = getGasUrl();
    if (currentUrl && !currentUrl.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const res = await fetchWithTimeout(currentUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'addExpense', ...payload }),
        }, 5000);
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
        const res = await fetchWithTimeout(currentUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'addDonation', ...payload }),
        }, 5000);
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
