// Camada de Armazenamento e Sessão (Compatível com GM_*, Chrome Storage e LocalStorage)

export function getSaved(key, defaultValue = '') {
  if (typeof GM_getValue !== 'undefined') {
    return GM_getValue(key, defaultValue);
  }
  const val = localStorage.getItem('estacio_' + key);
  return val !== null ? val : defaultValue;
}

export function setSaved(key, value) {
  if (typeof GM_setValue !== 'undefined') {
    GM_setValue(key, value);
    return;
  }
  localStorage.setItem('estacio_' + key, value);
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

export function getLiveProviders() {
  const all = ['groq', 'claude', 'mistral', 'gemini', 'openai', 'deepseek'];
  return all.filter(p => {
    const key = getApiKeyFor(p);
    const status = getProviderStatus(p);
    return Boolean(key && status === 'live');
  });
}

export function getBearerToken() {
  if (typeof window !== 'undefined' && window.__estacio_bearer) {
    return window.__estacio_bearer;
  }
  let token = sessionStorage.getItem('estacio_bearer');
  if (token) return token;

  const candidateKeys = ['token', 'accessToken', 'access_token', 'bearer', 'auth_token'];
  for (const k of candidateKeys) {
    const val = localStorage.getItem(k) || sessionStorage.getItem(k);
    if (val && val.length > 20) return val.replace(/^Bearer\s+/i, '').trim();
  }
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
