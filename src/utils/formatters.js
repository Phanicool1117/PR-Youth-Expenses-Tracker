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

export function formatDate(val) {
  if (!val) return '';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (e) {
    try {
      const d = new Date(val);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch (e2) {
      return '';
    }
  }
}

export function formatDateTime(val) {
  if (!val) return '';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
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
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    try {
      const d = new Date(val);
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
