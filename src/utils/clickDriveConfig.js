import { safeStorage } from './safeStorage';

const CLICK_DRIVE_STORAGE_KEY = 'PR_YOUTH_CLICK_DRIVE_FOLDER_ID';
const CLICK_DRIVE_URL_KEY = 'PR_YOUTH_CLICK_DRIVE_FOLDER_URL';

// Extract pure Google Drive folder ID from full URLs or raw IDs
export function extractFolderId(input) {
  if (!input) return '';
  const trimmed = input.trim();
  // If it's a URL like https://drive.google.com/drive/folders/1abcXYZ...
  const match = trimmed.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return match[1];
  }
  // If URL with id= query param
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    return idMatch[1];
  }
  // If raw alphanumeric ID
  if (/^[a-zA-Z0-9_-]{15,}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

export function getClickDriveFolderId() {
  return safeStorage.getItem(CLICK_DRIVE_STORAGE_KEY) || '';
}

export function setClickDriveFolderId(idOrUrl) {
  const cleanId = extractFolderId(idOrUrl);
  if (cleanId) {
    safeStorage.setItem(CLICK_DRIVE_STORAGE_KEY, cleanId);
    safeStorage.setItem(CLICK_DRIVE_URL_KEY, `https://drive.google.com/drive/folders/${cleanId}`);
  } else {
    safeStorage.removeItem(CLICK_DRIVE_STORAGE_KEY);
    safeStorage.removeItem(CLICK_DRIVE_URL_KEY);
  }
  return cleanId;
}

export function getClickDriveFolderUrl() {
  const id = getClickDriveFolderId();
  if (id) {
    return `https://drive.google.com/drive/folders/${id}`;
  }
  return safeStorage.getItem(CLICK_DRIVE_URL_KEY) || 'https://drive.google.com';
}
