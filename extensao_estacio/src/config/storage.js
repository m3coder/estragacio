// Camada de Armazenamento e Sessão Unificada (GM_*, Chrome Storage e LocalStorage) com Live Event Sync

const storageListeners = new Set();

export function onStorageChange(callback) {
  storageListeners.add(callback);
  return () => storageListeners.delete(callback);
}

export function getSaved(key, defaultValue = '') {
  let val = null;
  if (typeof GM_getValue !== 'undefined') {
    val = GM_getValue(key, null);
  }
  if (val === null || val === undefined) {
    val = localStorage.getItem('estacio_' + key);
  }
  if (val === null || val === undefined) {
    return defaultValue;
  }
  try {
    if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
      return JSON.parse(val);
    }
  } catch (e) {}
  return val;
}

export function setSaved(key, value) {
  const serialized = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);

  // 1. Userscript Tampermonkey
  if (typeof GM_setValue !== 'undefined') {
    GM_setValue(key, serialized);
  }

  // 2. LocalStorage da Página / Popup
  try {
    localStorage.setItem('estacio_' + key, serialized);
  } catch (e) {}

  // 3. Chrome Extension Storage Sync
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ ['estacio_' + key]: serialized }).catch(() => {});
  }
}

export function getApiKeyFor(provider) {
  return getSaved(`key_${provider}`, '');
}

export function setApiKeyFor(provider, key) {
  setSaved(`key_${provider}`, key);
}

export function getProviderStatus(provider) {
  return getSaved(`status_${provider}`, 'untested'); // 'live', 'error', 'untested'
}

export function setProviderStatus(provider, status) {
  setSaved(`status_${provider}`, status);
}

export function getShowPaidModels() {
  return getSaved('show_paid_models', 'false') === 'true';
}

export function setShowPaidModels(showPaid) {
  setSaved('show_paid_models', showPaid ? 'true' : 'false');
}

export function getLiveProviders() {
  const all = ['groq', 'gemini', 'openrouter', 'ollama', 'mistral', 'claude', 'openai', 'deepseek'];
  return all.filter(p => {
    const key = getApiKeyFor(p);
    const status = getProviderStatus(p);
    return Boolean(key && (status === 'live' || status === 'untested'));
  });
}

// Sincronização inicial na carga da página (Puxa chaves e modelos salvos no Popup da Extensão)
export async function syncStorageFromChromeExtension() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      const all = await chrome.storage.local.get(null);
      if (all) {
        Object.keys(all).forEach(k => {
          if (k.startsWith('estacio_')) {
            localStorage.setItem(k, typeof all[k] === 'object' ? JSON.stringify(all[k]) : all[k]);
          }
        });
      }
    } catch (e) {}
  }
}

// Ouvinte de eventos do Chrome Storage para sincronização bidirecional em tempo real
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      Object.keys(changes).forEach(k => {
        if (k.startsWith('estacio_')) {
          const val = changes[k].newValue;
          try {
            localStorage.setItem(k, typeof val === 'object' ? JSON.stringify(val) : String(val !== undefined ? val : ''));
          } catch (e) {}
        }
      });

      storageListeners.forEach(cb => {
        try { cb(changes); } catch (e) {}
      });
    }
  });
}

// Ouvinte para captura de token vinda do Main World Interceptor
if (typeof window !== 'undefined') {
  window.addEventListener('estacio_token_captured', (e) => {
    if (e.detail && e.detail.token) {
      window.__estacio_bearer = e.detail.token;
      try { sessionStorage.setItem('estacio_bearer', e.detail.token); } catch (err) {}
      try { localStorage.setItem('estacio_bearer', e.detail.token); } catch (err) {}
      storageListeners.forEach(cb => {
        try { cb({ estacio_bearer: { newValue: e.detail.token } }); } catch (err) {}
      });
    }
  });
}

// Executa sincronização silenciosa inicial
syncStorageFromChromeExtension();

export function getBearerToken() {
  if (typeof window !== 'undefined' && window.__estacio_bearer) {
    return window.__estacio_bearer;
  }
  let token = sessionStorage.getItem('estacio_bearer') || localStorage.getItem('estacio_bearer');
  if (token && token.length > 20) return token.replace(/^Bearer\s+/i, '').trim();

  const candidateKeys = ['token', 'accessToken', 'access_token', 'bearer', 'auth_token', 'jwt', 'auth'];
  for (const k of candidateKeys) {
    const val = localStorage.getItem(k) || sessionStorage.getItem(k);
    if (val && val.length > 20) return val.replace(/^Bearer\s+/i, '').trim();
  }

  // Varredura de tokens OIDC/OAuth no localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('oidc.user') || key.includes('authority') || key.includes('token') || key.includes('auth'))) {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (item && item.access_token) {
            return item.access_token.replace(/^Bearer\s+/i, '').trim();
          }
        } catch (e) {}
      }
    }
  } catch (e) {}

  return null;
}

export function getMatricula() {
  let matricula = getSaved('matricula', '');
  if (matricula) return matricula;

  const token = getBearerToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.matricula) return payload.matricula;
      if (payload.preferred_username && /^\d+$/.test(payload.preferred_username)) return payload.preferred_username;
      if (payload.sub && /^\d+$/.test(payload.sub)) return payload.sub;
    } catch (e) {}
  }
  return '';
}
