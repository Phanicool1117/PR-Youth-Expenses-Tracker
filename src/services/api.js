// API Service for Google Apps Script Web App Integration
import { safeStorage } from '../utils/safeStorage';

let GAS_URL = import.meta.env.VITE_GAS_URL || 'https://script.google.com/macros/s/AKfycbwYP8fBmn_0wEt-m3LkpkKBveDmFeES9Ka8ZA3IcxbiPlEojDTIlcEwLslkgsbcfRLXrw/exec';

export function getGasUrl() {
  return safeStorage.getItem('PR_YOUTH_GAS_URL') || GAS_URL;
}

export function setGasUrl(url) {
  safeStorage.setItem('PR_YOUTH_GAS_URL', url);
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
  { memberId: 'ADMIN', name: 'Admin', role: 'Admin', password: 'admin123', status: 'Active', active: true },
  { memberId: 'PHANI001', name: 'Phani', role: 'Member', password: '001', status: 'Active', active: true },
  { memberId: 'VISHNU002', name: 'Vishnu', role: 'Member', password: '002', status: 'Active', active: true },
  { memberId: 'GANGA003', name: 'Ganga', role: 'Member', password: '003', status: 'Active', active: true },
  { memberId: 'SASI004', name: 'Sasi', role: 'Member', password: '004', status: 'Active', active: true },
  { memberId: 'PRASAD005', name: 'Prasad', role: 'Member', password: '005', status: 'Active', active: true },
  { memberId: 'BHARAT006', name: 'Bharat', role: 'Member', password: '006', status: 'Active', active: true },
  { memberId: 'PRY003', name: 'Srinivas', role: 'Member', password: '003', status: 'Active', active: true },
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
  const saved = safeStorage.getItem(LOCAL_STORAGE_MEMBERS_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  safeStorage.setItem(LOCAL_STORAGE_MEMBERS_KEY, JSON.stringify(DEFAULT_MEMBERS));
  return DEFAULT_MEMBERS;
}

function saveLocalMembers(members) {
  safeStorage.setItem(LOCAL_STORAGE_MEMBERS_KEY, JSON.stringify(members));
}

function getLocalExpenses() {
  const saved = safeStorage.getItem(LOCAL_STORAGE_EXPENSES_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return [];
}

function saveLocalExpenses(expenses) {
  safeStorage.setItem(LOCAL_STORAGE_EXPENSES_KEY, JSON.stringify(expenses));
}

function getLocalDonations() {
  const saved = safeStorage.getItem(LOCAL_STORAGE_DONATIONS_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return [];
}

function saveLocalDonations(donations) {
  safeStorage.setItem(LOCAL_STORAGE_DONATIONS_KEY, JSON.stringify(donations));
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
          9000
        );
        const json = await res.json();
        if (json.success) return json;
        return { success: false, message: json.message || 'Invalid User ID or Password.' };
      } catch (err) {
        console.warn('Backend login connection failed, checking local credentials', err);
      }
    }

    // Local Verification Fallback
    const members = getLocalMembers();
    const user = members.find(
      (m) =>
        m.memberId.toUpperCase() === cleanId &&
        String(m.password || '').trim() === cleanPass
    );

    if (user) {
      const statusStr = String(user.status || '').toLowerCase();
      const activeVal = String(user.active).toLowerCase();
      const isInactive =
        statusStr === 'inactive' ||
        activeVal === 'false' ||
        activeVal === '0' ||
        user.active === false;

      if (isInactive) {
        return {
          success: false,
          message: 'Your account is marked Inactive. Please contact the administrator.',
        };
      }

      return {
        success: true,
        data: {
          memberId: user.memberId,
          name: user.name,
          role: user.role || 'Member',
          status: 'Active',
          active: true,
        },
      };
    }

    return {
      success: false,
      message: 'Invalid User ID or Password.',
    };
  },

  // Get Admin Executive Dashboard Data
  async getAdminDashboard() {
    const currentUrl = getGasUrl();
    if (currentUrl && !currentUrl.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const res = await fetchWithTimeout(`${currentUrl}?action=getAdminDashboard`, {}, 9000);
        const json = await res.json();
        if (json.success && json.data) {
          return json;
        }
      } catch (err) {
        console.warn('Backend fetch failed, calculating local metrics', err);
      }
    }

    const expenses = getLocalExpenses();
    const donations = getLocalDonations();

    const totalDonations = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const currentBalance = totalDonations - totalExpenses;

    const categoryBreakdown = {};
    expenses.forEach((e) => {
      categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + (Number(e.amount) || 0);
    });

    const recentActivity = [...donations, ...expenses]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    return {
      success: true,
      data: {
        totalDonations,
        totalExpenses,
        currentBalance,
        expenseCount: expenses.length,
        categoryBreakdown,
        recentActivity,
      },
    };
  },

  // Get Member Dashboard Data
  async getMemberDashboard(memberId) {
    const currentUrl = getGasUrl();
    if (currentUrl && !currentUrl.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const res = await fetchWithTimeout(`${currentUrl}?action=getMemberDashboard&memberId=${encodeURIComponent(memberId)}`, {}, 9000);
        const json = await res.json();
        if (json.success && json.data) {
          return json;
        }
      } catch (err) {
        console.warn('Backend fetch failed, calculating local member metrics', err);
      }
    }

    const allExpenses = getLocalExpenses();
    const memberExpenses = allExpenses.filter((e) => e.memberId === memberId);
    const totalSpent = memberExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    return {
      success: true,
      data: {
        totalExpenses: totalSpent,
        recentActivity: memberExpenses.slice(0, 10),
      },
    };
  },

  // Get Dynamic Categories List from Google Sheets
  async getCategories() {
    const currentUrl = getGasUrl();
    if (currentUrl && !currentUrl.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const res = await fetchWithTimeout(`${currentUrl}?action=getCategories`, {}, 5000);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          safeStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(json.data));
          return json;
        }
      } catch (err) {
        console.warn('Backend categories fetch failed, using local categories', err);
      }
    }

    const savedCats = safeStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
    let categories = DEFAULT_CATEGORIES;
    if (savedCats) {
      try { categories = JSON.parse(savedCats); } catch (e) {}
    }
    return { success: true, data: categories };
  },

  // Get All Central Donations
  async getAllDonations() {
    const currentUrl = getGasUrl();
    if (currentUrl && !currentUrl.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const res = await fetchWithTimeout(`${currentUrl}?action=getAllDonations`, {}, 5000);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) return json;
      } catch (err) {
        console.warn('Backend fetch failed, using local donations', err);
      }
    }
    const donations = getLocalDonations().map((d) => ({
      ...d,
      type: 'Donation',
      subType: d.subType || 'Chanda',
      gender: d.gender || 'Male',
      titlePrefix: d.subType === 'Laddu' ? (d.gender === 'Female' ? 'Ms.' : 'Mr.') : (d.titlePrefix || 'Mr/Miss:'),
      category: d.subType === 'Laddu' ? 'Laddu Prasadam Auction' : 'Donation Received',
      note: d.notes || d.note || `Donor: ${d.donorName || d.name || 'Anonymous'}`,
    }));
    return { success: true, data: donations };
  },

  // Get All Expenses
  async getAllExpenses() {
    const currentUrl = getGasUrl();
    if (currentUrl && !currentUrl.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const res = await fetchWithTimeout(`${currentUrl}?action=getAllExpenses`, {}, 5000);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) return json;
      } catch (err) {
        console.warn('Backend fetch failed, using local expenses', err);
      }
    }
    return { success: true, data: getLocalExpenses() };
  },

  // Get All Members
  async getMembers() {
    const currentUrl = getGasUrl();
    if (currentUrl && !currentUrl.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const res = await fetchWithTimeout(`${currentUrl}?action=getMembers`, {}, 5000);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          saveLocalMembers(json.data);
          return json;
        }
      } catch (err) {
        console.warn('Backend fetch failed, using local members', err);
      }
    }
    return { success: true, data: getLocalMembers() };
  },

  // Add Member
  async addMember(payload) {
    const currentUrl = getGasUrl();
    if (currentUrl && !currentUrl.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const res = await fetchWithTimeout(currentUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'addMember', ...payload }),
        }, 8000);
        const json = await res.json();
        if (json.success) return json;
      } catch (err) {
        console.warn('Backend post failed, using local storage', err);
      }
    }

    const members = getLocalMembers();
    const cleanId = payload.memberId.toUpperCase();

    if (members.some((m) => m.memberId.toUpperCase() === cleanId)) {
      return { success: false, message: 'Member ID already exists.' };
    }

    const newMember = {
      memberId: cleanId,
      name: payload.name.trim(),
      password: payload.password.trim(),
      role: 'Member',
      status: 'Active',
      active: true,
    };

    members.push(newMember);
    saveLocalMembers(members);
    return { success: true, data: newMember };
  },

  // Update Member Status
  async updateMemberStatus(memberId, status) {
    const currentUrl = getGasUrl();
    const isActivating = status.toLowerCase() === 'active';

    if (currentUrl && !currentUrl.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const res = await fetchWithTimeout(currentUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'updateMemberStatus',
            memberId,
            status,
            active: isActivating,
          }),
        }, 8000);
        const json = await res.json();
        if (json.success) return json;
      } catch (err) {
        console.warn('Backend post failed, updating local storage', err);
      }
    }

    const members = getLocalMembers();
    const idx = members.findIndex((m) => m.memberId.toUpperCase() === memberId.toUpperCase());
    if (idx !== -1) {
      members[idx].status = status;
      members[idx].active = isActivating;
      saveLocalMembers(members);
      return { success: true, data: members[idx] };
    }

    return { success: false, message: 'Member not found.' };
  },

  // Reset Member Password
  async resetPassword(memberId, newPassword) {
    const currentUrl = getGasUrl();
    if (currentUrl && !currentUrl.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const res = await fetchWithTimeout(currentUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'resetPassword', memberId, newPassword }),
        }, 8000);
        const json = await res.json();
        if (json.success) return json;
      } catch (err) {
        console.warn('Backend post failed, updating local storage', err);
      }
    }

    const members = getLocalMembers();
    const idx = members.findIndex((m) => m.memberId.toUpperCase() === memberId.toUpperCase());
    if (idx !== -1) {
      members[idx].password = newPassword.trim();
      saveLocalMembers(members);
      return { success: true };
    }

    return { success: false, message: 'Member not found.' };
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
        }, 8000);
        const json = await res.json();
        if (json.success) return json;
      } catch (err) {
        console.warn('Backend post failed, saving locally', err);
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
    let savedCats = DEFAULT_CATEGORIES;
    const catStr = safeStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
    if (catStr) {
      try { savedCats = JSON.parse(catStr); } catch (e) {}
    }
    if (!savedCats.includes(payload.category)) {
      savedCats.push(payload.category);
      safeStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(savedCats));
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
        }, 8000);
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

  // Fetch Click Photo Gallery directly from Google Drive Master Folder
  async getClickGallery(folderId) {
    const currentUrl = getGasUrl();
    if (currentUrl && !currentUrl.includes('YOUR_DEPLOYMENT_ID')) {
      try {
        const queryParams = new URLSearchParams({
          action: 'getClickGallery',
          folderId: folderId || '',
        });
        const res = await fetchWithTimeout(`${currentUrl}?${queryParams.toString()}`, {}, 12000);
        const json = await res.json();
        if (json.success) return json;
      } catch (err) {
        console.warn('Backend getClickGallery failed, checking fallback', err);
      }
    }

    // Local fallback when backend is unreachable or not yet configured
    const savedGallery = safeStorage.getItem('PR_YOUTH_CLICK_GALLERY_CACHE');
    if (savedGallery) {
      try { return JSON.parse(savedGallery); } catch (e) {}
    }

    return {
      success: true,
      configured: false,
      message: 'Drive folder not configured or empty.',
      albums: [],
    };
  },
};
