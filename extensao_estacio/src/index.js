// Entry Point Principal da Suíte Estácio AI

import './ui/widget.css';
import { createSuiteWidget } from './ui/widget.js';

(function initEstacioSuite() {
  'use strict';

  // Interceptador de Sessão e Tokens no Portal do Aluno
  if (typeof window !== 'undefined' && window.location.hostname.includes('estudante.estacio.br')) {
    const origFetch = window.fetch;
    window.fetch = async function (...args) {
      try {
        const headers = args[1]?.headers || {};
        let auth = headers['Authorization'] || headers['authorization'];
        if (auth && auth.startsWith('Bearer ')) {
          const token = auth.replace(/^Bearer\s+/i, '').trim();
          sessionStorage.setItem('estacio_bearer', token);
          window.__estacio_bearer = token;
        }
      } catch (e) {}
      return origFetch.apply(this, args);
    };

    const origXHR = window.XMLHttpRequest.prototype.setRequestHeader;
    window.XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
      if (header && header.toLowerCase() === 'authorization' && value && value.startsWith('Bearer ')) {
        const token = value.replace(/^Bearer\s+/i, '').trim();
        sessionStorage.setItem('estacio_bearer', token);
        window.__estacio_bearer = token;
      }
      return origXHR.apply(this, arguments);
    };
  }

  // Inicialização do Widget do DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createSuiteWidget);
  } else {
    createSuiteWidget();
  }
})();
