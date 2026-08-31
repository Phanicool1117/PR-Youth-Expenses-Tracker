// Bulletproof number, currency, and date/time formatters with universal fallback for all mobile browsers

export function formatCurrency(num) {
  try {
    const val = Number(num || 0);
    if (isNaN(val)) return '0';
    return val.toLocaleString('en-IN');
  } catch (e) {
    try {
      return Number(num || 0).toLocaleString();
    } catch (e2) {
      return String(num || 0);
    }
  }
}

// Safely parse date string into Date object without UTC timezone date shifting
function parseSafeDate(val) {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    // Match YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    // Match YYYY-MM-DDTHH:mm:ss...
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;
  }
  const fallback = new Date(val);
  return isNaN(fallback.getTime()) ? null : fallback;
}

export function formatDate(val) {
  if (!val) return '';
  try {
    const d = parseSafeDate(val);
    if (!d) return '';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (e) {
    try {
      const d = parseSafeDate(val);
      if (!d) return '';
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch (e2) {
      return '';
    }
  }
}

export function formatDateTime(val) {
  if (!val) return '';
  try {
    const d = parseSafeDate(val);
    if (!d) return '';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return formatDate(val);
  }
}

export function formatTime(val) {
  if (!val) return '';
  try {
    const d = parseSafeDate(val);
    if (!d) return '';
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    try {
      const d = parseSafeDate(val);
      if (!d) return '';
      let hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const strMinutes = minutes < 10 ? '0' + minutes : minutes;
      return `${hours}:${strMinutes} ${ampm}`;
    } catch (e2) {
      return '';
    }
  }
}
