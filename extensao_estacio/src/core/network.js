// Módulo de Rede Universal com Bypass de CORS (Tampermonkey GM_xmlhttpRequest, Chrome Extension Background Proxy e fetch)

export async function universalFetch(url, options = {}) {
  // 1. Ambiente Tampermonkey / Violentmonkey (GM_xmlhttpRequest com bypass total de CORS)
  if (typeof GM_xmlhttpRequest !== 'undefined') {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: options.method || 'GET',
        url: url,
        headers: options.headers || {},
        data: options.body || null,
        timeout: options.timeout || 25000,
        onload: (res) => {
          resolve({
            ok: res.status >= 200 && res.status < 300,
            status: res.status,
            statusText: res.statusText || 'OK',
            headers: {
              get: (headerName) => {
                const headerMap = {};
                (res.responseHeaders || '').split('\r\n').forEach(line => {
                  const parts = line.split(': ');
                  if (parts[0]) headerMap[parts[0].toLowerCase()] = parts.slice(1).join(': ');
                });
                return headerMap[headerName.toLowerCase()] || null;
              }
            },
            json: async () => {
              try {
                return JSON.parse(res.responseText);
              } catch (e) {
                throw new Error(`Resposta da API não é JSON válido: ${res.responseText.slice(0, 100)}`);
              }
            },
            text: async () => res.responseText
          });
        },
        onerror: (err) => reject(new Error(err.statusText || 'Falha na requisição de rede (GM_xmlhttpRequest)')),
        ontimeout: () => reject(new Error('Tempo limite excedido na requisição'))
      });
    });
  }

  // 2. Ambiente Extensão Chrome (Tenta fetch direto; se falhar por CORS no Content Script, delega ao Background)
  try {
    const res = await fetch(url, options);
    return res;
  } catch (directErr) {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          type: 'PROXY_FETCH',
          url: url,
          options: {
            method: options.method || 'GET',
            headers: options.headers || {},
            body: options.body || null
          }
        }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message || directErr.message));
          } else if (!response || !response.success) {
            reject(new Error(response?.error || directErr.message || 'Falha no Proxy Fetch'));
          } else {
            resolve({
              ok: response.status >= 200 && response.status < 300,
              status: response.status,
              statusText: response.statusText || 'OK',
              headers: {
                get: (headerName) => (response.headers || {})[headerName.toLowerCase()] || null
              },
              json: async () => (typeof response.data === 'string' ? JSON.parse(response.data) : response.data),
              text: async () => (typeof response.data === 'string' ? response.data : JSON.stringify(response.data))
            });
          }
        });
      });
    }
    throw directErr;
  }
}
