// Entry Point Principal da Suíte Estácio AI

import './ui/widget.css';
import { createSuiteWidget } from './ui/widget.js';

(function initEstacioSuite() {
  'use strict';

  function saveCapturedToken(token) {
    if (!token || typeof token !== 'string' || token.length < 20) return;
    const clean = token.replace(/^Bearer\s+/i, '').trim();
    if (clean) {
      window.__estacio_bearer = clean;
      try { sessionStorage.setItem('estacio_bearer', clean); } catch (e) {}
      try { localStorage.setItem('estacio_bearer', clean); } catch (e) {}
    }
  }

  // Interceptador de Sessão e Tokens no Portal do Aluno (Isolated World + Main World)
  if (typeof window !== 'undefined' && window.location.hostname.includes('estudante.estacio.br')) {
    // 1. Intercepta no contexto do script atual
    const origFetch = window.fetch;
    window.fetch = async function (...args) {
      try {
        const headers = args[1]?.headers;
        if (headers) {
          let auth = null;
          if (typeof headers.get === 'function') {
            auth = headers.get('Authorization') || headers.get('authorization');
          } else if (Array.isArray(headers)) {
            const entry = headers.find(([k]) => k.toLowerCase() === 'authorization');
            if (entry) auth = entry[1];
          } else if (typeof headers === 'object') {
            auth = headers['Authorization'] || headers['authorization'];
          }
          if (auth && auth.startsWith('Bearer ')) {
            saveCapturedToken(auth);
          }
        }
      } catch (e) {}
      return origFetch.apply(this, args);
    };

    const origXHR = window.XMLHttpRequest.prototype.setRequestHeader;
    window.XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
      if (header && header.toLowerCase() === 'authorization' && value && value.startsWith('Bearer ')) {
        saveCapturedToken(value);
      }
      return origXHR.apply(this, arguments);
    };

    // 2. Intercepta no contexto do unsafeWindow (Tampermonkey / Violentmonkey) se disponível
    const pageWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : null;
    if (pageWindow && pageWindow !== window) {
      try {
        const uFetch = pageWindow.fetch;
        if (typeof uFetch === 'function') {
          pageWindow.fetch = async function (...args) {
            try {
              const headers = args[1]?.headers;
              if (headers) {
                let auth = null;
                if (typeof headers.get === 'function') {
                  auth = headers.get('Authorization') || headers.get('authorization');
                } else if (Array.isArray(headers)) {
                  const entry = headers.find(([k]) => k.toLowerCase() === 'authorization');
                  if (entry) auth = entry[1];
                } else if (typeof headers === 'object') {
                  auth = headers['Authorization'] || headers['authorization'];
                }
                if (auth && auth.startsWith('Bearer ')) {
                  saveCapturedToken(auth);
                }
              }
            } catch (e) {}
            return uFetch.apply(this, args);
          };
        }

        if (pageWindow.XMLHttpRequest && pageWindow.XMLHttpRequest.prototype) {
          const uXHR = pageWindow.XMLHttpRequest.prototype.setRequestHeader;
          pageWindow.XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
            if (header && header.toLowerCase() === 'authorization' && value && value.startsWith('Bearer ')) {
              saveCapturedToken(value);
            }
            return uXHR.apply(this, arguments);
          };
        }
      } catch (e) {}
    }

    // 3. Ouve evento de token capturado pelo Main World Interceptor (Chrome Extension MV3)
    window.addEventListener('estacio_token_captured', (e) => {
      if (e.detail && e.detail.token) {
        saveCapturedToken(e.detail.token);
      }
    });
  }

  // Inicialização do Widget do DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createSuiteWidget);
  } else {
    createSuiteWidget();
  }
})();
