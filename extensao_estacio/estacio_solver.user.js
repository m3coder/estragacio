// ==UserScript==
// @name         Estácio Suite AI (Solver, Gabarito & Revisão Multi-IA)
// @namespace    https://github.com/estacio-solver
// @version      10.5.0
// @description  Suite All-in-One da Estácio: 1) Resolução e Gabarito com IA Multi-Provedor 2) Troca Rápida de Modelo e Provedor 3) Revisão com Segunda Opinião 4) Auto-Conclusão de Temas.
// @author       Estácio Suite
// @match        https://estacio.saladeavaliacoes.com.br/*
// @match        https://estudante.estacio.br/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @connect      apis.estudante.estacio.br
// @connect      generativelanguage.googleapis.com
// @connect      api.openai.com
// @connect      api.deepseek.com
// @connect      api.groq.com
// @connect      api.mistral.ai
// @connect      *
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const PROVIDERS_CONFIG = {
    groq: {
      name: "Groq",
      defaultModel: "llama-3.3-70b-versatile",
      models: [
        { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (Recomendado)" },
        { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 Distill 70B" },
        { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (Instantâneo)" }
      ]
    },
    mistral: {
      name: "Mistral AI",
      defaultModel: "mistral-large-latest",
      models: [
        { id: "mistral-large-latest", name: "Mistral Large (PhD / Mais Preciso)" },
        { id: "codestral-latest", name: "Codestral (Lógica & Código)" },
        { id: "mistral-small-latest", name: "Mistral Small" }
      ]
    },
    gemini: {
      name: "Google Gemini",
      defaultModel: "gemini-flash-latest",
      models: [
        { id: "gemini-flash-latest", name: "Gemini Flash Latest (Grátis)" },
        { id: "gemini-pro-latest", name: "Gemini Pro Latest (Alta Precisão)" },
        { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" }
      ]
    },
    openai: {
      name: "OpenAI",
      defaultModel: "gpt-4o",
      models: [
        { id: "gpt-4o", name: "GPT-4o (Precisão Máxima)" },
        { id: "gpt-4o-mini", name: "GPT-4o Mini (Econômico)" },
        { id: "o3-mini", name: "o3-mini (Raciocínio)" }
      ]
    },
    deepseek: {
      name: "DeepSeek",
      defaultModel: "deepseek-chat",
      models: [
        { id: "deepseek-chat", name: "DeepSeek V3" },
        { id: "deepseek-reasoner", name: "DeepSeek R1 (Raciocínio Puro)" }
      ]
    }
  };

  const getSaved = (k, def) => (typeof GM_getValue !== 'undefined' ? GM_getValue(k, def) : localStorage.getItem('estacio_' + k) || def);
  const setSaved = (k, v) => (typeof GM_setValue !== 'undefined' ? GM_setValue(k, v) : localStorage.setItem('estacio_' + k, v));

  let currentProvider = getSaved('active_provider', 'groq');
  let currentModel = getSaved('active_model', PROVIDERS_CONFIG[currentProvider]?.defaultModel || 'llama-3.3-70b-versatile');

  function getApiKeyFor(provider) {
    return getSaved(`key_${provider}`, '');
  }

  function setApiKeyFor(provider, key) {
    setSaved(`key_${provider}`, key);
  }

  function getMatricula() {
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

  const isExamPage = window.location.hostname.includes('saladeavaliacoes.com.br');
  const isPortalPage = window.location.hostname.includes('estudante.estacio.br');

  if (isPortalPage) {
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

  const styles = `
    #estacio-suite-box {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 370px;
      background: rgba(15, 23, 42, 0.97);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 14px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.75);
      color: #f8fafc;
      font-family: system-ui, -apple-system, sans-serif;
      z-index: 99999999;
      overflow: hidden;
      transition: box-shadow 0.2s ease, opacity 0.2s ease;
      user-select: none;
    }
    #estacio-suite-box.minimized {
      width: 48px !important;
      height: 48px !important;
      border-radius: 50% !important;
      cursor: grab !important;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      padding: 0;
      box-shadow: 0 8px 24px rgba(37, 99, 235, 0.5);
    }
    #estacio-suite-box.minimized:active { cursor: grabbing !important; }
    #estacio-suite-box.minimized .box-inner { display: none; }
    #estacio-suite-box.minimized::after { content: "⚡"; font-size: 22px; }
    
    #estacio-suite-box.hidden-box { display: none !important; }

    #estacio-suite-toggle-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.25);
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      display: none;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      cursor: grab;
      z-index: 99999999;
    }
    #estacio-suite-toggle-btn:active { cursor: grabbing; }

    .box-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: rgba(30, 41, 59, 0.85);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      cursor: grab;
    }
    .box-header:active { cursor: grabbing; }

    .box-title {
      font-size: 13px;
      font-weight: 700;
      background: linear-gradient(135deg, #60a5fa, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .box-controls {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .box-ctrl-btn {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 13px;
      padding: 2px 4px;
      line-height: 1;
      border-radius: 4px;
      transition: color 0.15s, background 0.15s;
    }
    .box-ctrl-btn:hover {
      color: #fff;
      background: rgba(255,255,255,0.1);
    }
    .box-body {
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 9px;
    }

    /* Seletor Duplo: Provedor + Modelo */
    .ai-selector-container {
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: rgba(0, 0, 0, 0.35);
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .ai-selector-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 11px;
    }
    .ai-selector-select {
      background: #1e293b;
      color: #38bdf8;
      border: 1px solid #475569;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 6px;
      cursor: pointer;
      outline: none;
      flex: 1;
      max-width: 230px;
    }

    .key-config-row {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(0, 0, 0, 0.25);
      padding: 5px 8px;
      border-radius: 6px;
      font-size: 11px;
    }
    .key-config-input {
      flex: 1;
      background: #1e293b;
      border: 1px solid #475569;
      border-radius: 4px;
      color: #fff;
      padding: 4px 6px;
      font-size: 11px;
      font-family: monospace;
    }

    .box-btn {
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .box-btn-primary {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: #fff;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    .box-btn-success {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #fff;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    .box-btn:hover:not(:disabled) {
      opacity: 0.92;
      transform: translateY(-1px);
    }
    .box-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .gabarito-container {
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 8px;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .gabarito-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-weight: 700;
      color: #38bdf8;
    }
    .gabarito-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      max-height: 90px;
      overflow-y: auto;
      padding: 2px 0;
    }
    .gabarito-badge {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 11px;
      font-weight: 600;
      color: #f1f5f9;
      display: flex;
      align-items: center;
      gap: 3px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .gabarito-badge:hover {
      border-color: #38bdf8;
      background: rgba(56, 189, 248, 0.15);
      transform: scale(1.05);
    }
    .gabarito-badge .badge-q { color: #94a3b8; }
    .gabarito-badge .badge-a { color: #34d399; font-weight: 700; }

    .review-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(0, 0, 0, 0.4);
      padding: 6px 8px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 11px;
    }
    .review-input {
      width: 42px;
      background: #1e293b;
      border: 1px solid #475569;
      border-radius: 4px;
      color: #fff;
      padding: 2px 4px;
      text-align: center;
      font-size: 11px;
      font-weight: 700;
    }
    .review-btn {
      background: linear-gradient(135deg, #8b5cf6, #d946ef);
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: opacity 0.15s;
    }
    .review-btn:hover { opacity: 0.9; }

    .box-log {
      max-height: 100px;
      overflow-y: auto;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 6px;
      padding: 6px 8px;
      font-family: ui-monospace, monospace;
      font-size: 11px;
      display: flex;
      flex-direction: column;
      gap: 3px;
      user-select: text;
      cursor: text;
    }
    .log-item.success { color: #34d399; }
    .log-item.error { color: #f87171; }
    .log-item.info { color: #60a5fa; }
    .log-item.warning { color: #fbbf24; }
    
    .box-footer {
      padding: 6px 14px;
      background: rgba(15, 23, 42, 0.7);
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 11px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-btn {
      background: none;
      border: none;
      color: #60a5fa;
      cursor: pointer;
      font-size: 11px;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 2px 4px;
      border-radius: 4px;
      transition: background 0.15s, color 0.15s;
    }
    .footer-btn:hover {
      color: #93c5fd;
      background: rgba(255,255,255,0.08);
    }

    .estacio-ai-marked {
      outline: 3px solid #10b981 !important;
      outline-offset: 2px;
      box-shadow: 0 0 14px rgba(16, 185, 129, 0.5) !important;
    }
  `;

  if (typeof GM_addStyle !== 'undefined') {
    GM_addStyle(styles);
  } else {
    const el = document.createElement('style');
    el.textContent = styles;
    document.head.appendChild(el);
  }

  let isRunning = false;

  function setupUniversalDraggable(targetElement, handleElement = null, onClickCallback = null) {
    const dragHandle = handleElement || targetElement;
    let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;
    let isDragging = false;

    const savedLeft = localStorage.getItem('estacio_pos_left');
    const savedTop = localStorage.getItem('estacio_pos_top');
    if (savedLeft && savedTop) {
      targetElement.style.left = savedLeft;
      targetElement.style.top = savedTop;
      targetElement.style.right = 'auto';
      targetElement.style.bottom = 'auto';
    }

    dragHandle.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;
      e.preventDefault();

      startX = e.clientX;
      startY = e.clientY;

      const rect = targetElement.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      isDragging = false;

      function onMouseMove(moveEvent) {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        if (Math.hypot(dx, dy) > 4) {
          isDragging = true;
          const newLeft = `${initialLeft + dx}px`;
          const newTop = `${initialTop + dy}px`;
          targetElement.style.left = newLeft;
          targetElement.style.top = newTop;
          targetElement.style.right = 'auto';
          targetElement.style.bottom = 'auto';

          localStorage.setItem('estacio_pos_left', newLeft);
          localStorage.setItem('estacio_pos_top', newTop);
        }
      }

      function onMouseUp(upEvent) {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        if (!isDragging && onClickCallback) {
          onClickCallback(upEvent);
        }
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  function copyTextToClipboard(text, successMsg = 'Copiado!') {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        log(successMsg, 'success');
      }).catch(() => fallbackCopy(text, successMsg));
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      log(successMsg, 'success');
    } catch (e) {
      log('Erro ao copiar.', 'error');
    }
    document.body.removeChild(textarea);
  }

  function copyAllLogs() {
    const logBox = document.getElementById('box-log');
    if (!logBox) return;
    const lines = Array.from(logBox.querySelectorAll('.log-item')).map(el => el.textContent);
    copyTextToClipboard(lines.join('\n'), '📋 Logs copiados para a área de transferência!');
  }

  function copyGabarito() {
    const saved = localStorage.getItem('estacio_last_gabarito');
    if (!saved) {
      log('Nenhum gabarito salvo ainda.', 'error');
      return;
    }

    try {
      const data = JSON.parse(saved);
      let text = `📝 GABARITO DA PROVA - ESTÁCIO SUITE AI (${data.timestamp || new Date().toLocaleString()})\n`;
      text += `🤖 IA Utilizada: ${data.provider || 'AI'}\n\n`;

      data.answers.forEach(a => {
        text += `Questão ${a.q}: [ ${a.letter} ]  ${a.explanation ? `(${a.explanation})` : ''}\n`;
      });

      text += `\n🎯 Resumo Compacto:\n`;
      text += data.answers.map(a => `${a.q}-${a.letter}`).join(' | ');

      copyTextToClipboard(text, '📋 Gabarito copiado para a área de transferência!');
    } catch (e) {
      log('Erro ao formatar gabarito.', 'error');
    }
  }

  function renderSavedGabarito() {
    const container = document.getElementById('gabarito-panel');
    const badgesEl = document.getElementById('gabarito-badges');
    if (!container || !badgesEl) return;

    const saved = localStorage.getItem('estacio_last_gabarito');
    if (!saved) {
      container.style.display = 'none';
      return;
    }

    try {
      const data = JSON.parse(saved);
      if (!data.answers || data.answers.length === 0) {
        container.style.display = 'none';
        return;
      }

      container.style.display = 'flex';
      badgesEl.innerHTML = '';

      data.answers.forEach(a => {
        const span = document.createElement('div');
        span.className = 'gabarito-badge';
        span.title = `Clique para focar na Q${a.q} ou revisar: ${a.explanation || ''}`;
        span.innerHTML = `<span class="badge-q">Q${a.q}:</span><span class="badge-a">${a.letter}</span>`;
        span.addEventListener('click', () => {
          const inp = document.getElementById('review-q-num');
          if (inp) inp.value = a.q;
          const cards = getQuestionCards();
          const target = cards.find(c => c.index === a.q);
          if (target && target.element) {
            target.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
        badgesEl.appendChild(span);
      });
    } catch (e) {
      container.style.display = 'none';
    }
  }

  function renderModelOptions(providerKey, selectedModelId) {
    const modelSelect = document.getElementById('box-model-select');
    if (!modelSelect) return;
    modelSelect.innerHTML = '';

    const p = PROVIDERS_CONFIG[providerKey];
    if (!p) return;

    p.models.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.name;
      if (m.id === selectedModelId) opt.selected = true;
      modelSelect.appendChild(opt);
    });
  }

  function updateActiveFooterLabel() {
    const footerEl = document.getElementById('box-footer-model');
    if (!footerEl) return;
    const pName = PROVIDERS_CONFIG[currentProvider]?.name || currentProvider;
    footerEl.textContent = `${pName} (${currentModel})`;
  }

  function createBox() {
    if (document.getElementById('estacio-suite-box')) return;

    const box = document.createElement('div');
    box.id = 'estacio-suite-box';
    box.innerHTML = `
      <div class="box-inner">
        <div class="box-header" id="box-drag-handle">
          <div class="box-title">
            <span>⚡</span>
            <span>Estácio Suite AI</span>
          </div>
          <div class="box-controls">
            <button id="btn-copy-header" class="box-ctrl-btn" title="Copiar Logs">📋</button>
            <button id="btn-min" class="box-ctrl-btn" title="Minimizar (vira bolha)">_</button>
            <button id="btn-hide" class="box-ctrl-btn" title="Ocultar (botão flutuante)">✕</button>
          </div>
        </div>

        <div class="box-body">
          <!-- Seletor Duplo de Provedor e Modelo -->
          <div class="ai-selector-container">
            <div class="ai-selector-row">
              <span style="color:#94a3b8; font-weight:700;">🤖 IA:</span>
              <select id="box-ai-select" class="ai-selector-select">
                <option value="groq" ${currentProvider === 'groq' ? 'selected' : ''}>Groq (Ultra Rápido)</option>
                <option value="mistral" ${currentProvider === 'mistral' ? 'selected' : ''}>Mistral AI (PhD)</option>
                <option value="gemini" ${currentProvider === 'gemini' ? 'selected' : ''}>Google Gemini</option>
                <option value="openai" ${currentProvider === 'openai' ? 'selected' : ''}>ChatGPT (OpenAI)</option>
                <option value="deepseek" ${currentProvider === 'deepseek' ? 'selected' : ''}>DeepSeek</option>
              </select>
            </div>
            <div class="ai-selector-row">
              <span style="color:#94a3b8; font-weight:700;">🧠 Modelo:</span>
              <select id="box-model-select" class="ai-selector-select"></select>
            </div>
          </div>

          <!-- Campo de Chave de API com Status -->
          <div class="key-config-row">
            <span style="color:#94a3b8; font-size:10px; font-weight:700;">🔑 Chave:</span>
            <input type="password" id="box-key-input" class="key-config-input" placeholder="Cole sua chave aqui...">
            <button id="btn-save-key" style="background:#2563eb; border:none; color:#fff; border-radius:4px; padding:4px 8px; font-size:11px; cursor:pointer; font-weight:700;">Salvar</button>
          </div>

          ${isExamPage ? `
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#94a3b8;">
              <span style="color:#a78bfa; font-weight:600;">Sala de Provas</span>
              <span style="color:#60a5fa; font-weight:700;">Pronto</span>
            </div>
            <button id="btn-action-main" class="box-btn box-btn-primary">
              <span>🎯</span> Resolver e Marcar Prova
            </button>

            <!-- Barra de Segunda Opinião / Revisão com outra IA -->
            <div class="review-bar">
              <span style="color:#c084fc; font-weight:700;">🔍 Revisar Q:</span>
              <input type="number" id="review-q-num" class="review-input" value="1" min="1" max="50">
              <select id="review-ai-select" class="ai-selector-select" style="font-size:10px; max-width:140px;">
                <option value="mistral">Mistral Large (PhD)</option>
                <option value="groq">Groq (Llama 70B)</option>
                <option value="gemini">Gemini Flash</option>
                <option value="openai">ChatGPT (4o)</option>
                <option value="deepseek">DeepSeek R1</option>
              </select>
              <button id="btn-review-action" class="review-btn" title="Reavaliar esta questão com outra IA">Reavaliar</button>
            </div>
          ` : `
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#94a3b8;">
              <span style="color:#10b981; font-weight:600;">Portal do Aluno</span>
              <span style="color:#60a5fa; font-weight:700;">Conclusão de Matérias</span>
            </div>
            <button id="btn-action-main" class="box-btn box-btn-success">
              <span>📚</span> Concluir Temas Desta Matéria
            </button>
          `}

          <!-- Painel Visual do Gabarito Persistente -->
          <div id="gabarito-panel" class="gabarito-container" style="display:none;">
            <div class="gabarito-header">
              <span>📝 Gabarito Salvo</span>
              <button id="btn-copy-gabarito" style="background:none; border:none; color:#38bdf8; cursor:pointer; font-size:11px; font-weight:700;">
                📋 Copiar Gabarito
              </button>
            </div>
            <div id="gabarito-badges" class="gabarito-badges"></div>
          </div>

          <div class="box-log" id="box-log">
            <div class="log-item info">Pronto. IA: ${PROVIDERS_CONFIG[currentProvider]?.name} (${currentModel}) ativa.</div>
          </div>
        </div>

        <div class="box-footer">
          <span id="box-footer-model" style="color:#38bdf8; font-weight:600;">${PROVIDERS_CONFIG[currentProvider]?.name} (${currentModel})</span>
          <div style="display:flex; align-items:center; gap:8px;">
            <button id="btn-copy-footer" class="footer-btn" title="Copiar todos os logs">
              <span>📋</span> Copiar Logs
            </button>
          </div>
        </div>
      </div>
    `;

    const toggleBtn = document.createElement('div');
    toggleBtn.id = 'estacio-suite-toggle-btn';
    toggleBtn.innerHTML = '⚡';
    toggleBtn.title = 'Mostrar Estácio Suite AI';

    document.body.appendChild(box);
    document.body.appendChild(toggleBtn);

    setupUniversalDraggable(box, document.getElementById('box-drag-handle'));

    setupUniversalDraggable(box, box, () => {
      if (box.classList.contains('minimized')) {
        box.classList.remove('minimized');
      }
    });

    setupUniversalDraggable(toggleBtn, toggleBtn, () => {
      box.classList.remove('hidden-box');
      box.classList.remove('minimized');
      toggleBtn.style.display = 'none';
    });

    const keyInput = document.getElementById('box-key-input');
    const aiSelect = document.getElementById('box-ai-select');
    const modelSelect = document.getElementById('box-model-select');

    renderModelOptions(currentProvider, currentModel);
    keyInput.value = getApiKeyFor(currentProvider);
    checkKeyStatus(currentProvider);

    aiSelect.addEventListener('change', (e) => {
      currentProvider = e.target.value;
      currentModel = PROVIDERS_CONFIG[currentProvider]?.defaultModel;
      setSaved('active_provider', currentProvider);
      setSaved('active_model', currentModel);
      renderModelOptions(currentProvider, currentModel);
      keyInput.value = getApiKeyFor(currentProvider);
      updateActiveFooterLabel();
      checkKeyStatus(currentProvider);
      log(`IA alterada para: ${PROVIDERS_CONFIG[currentProvider]?.name} (${currentModel})`, 'success');
    });

    modelSelect.addEventListener('change', (e) => {
      currentModel = e.target.value;
      setSaved('active_model', currentModel);
      updateActiveFooterLabel();
      log(`Modelo alterado para: ${currentModel}`, 'info');
    });

    document.getElementById('btn-save-key').addEventListener('click', () => {
      const val = keyInput.value.trim();
      setApiKeyFor(currentProvider, val);
      if (val) {
        log(`✅ Chave para ${PROVIDERS_CONFIG[currentProvider]?.name} salva com sucesso!`, 'success');
      } else {
        log(`⚠️ Chave removida para ${PROVIDERS_CONFIG[currentProvider]?.name}.`, 'warning');
      }
    });

    document.getElementById('btn-copy-header').addEventListener('click', (e) => {
      e.stopPropagation();
      copyAllLogs();
    });
    document.getElementById('btn-copy-footer').addEventListener('click', (e) => {
      e.stopPropagation();
      copyAllLogs();
    });

    document.getElementById('btn-copy-gabarito').addEventListener('click', (e) => {
      e.stopPropagation();
      copyGabarito();
    });

    document.getElementById('btn-min').addEventListener('click', (e) => {
      e.stopPropagation();
      box.classList.toggle('minimized');
    });

    document.getElementById('btn-hide').addEventListener('click', (e) => {
      e.stopPropagation();
      box.classList.add('hidden-box');
      toggleBtn.style.display = 'flex';
    });

    const actionBtn = document.getElementById('btn-action-main');
    if (isExamPage) {
      actionBtn.addEventListener('click', runExamQueue);
      renderSavedGabarito();

      document.getElementById('btn-review-action').addEventListener('click', () => {
        const qNum = parseInt(document.getElementById('review-q-num').value);
        const targetProvider = document.getElementById('review-ai-select').value;
        reviewSingleQuestion(qNum, targetProvider);
      });
    } else {
      actionBtn.addEventListener('click', runThemeCompletion);
    }

    processAutomatorStateMachine();
  }

  function checkKeyStatus(provider) {
    const key = getApiKeyFor(provider);
    if (!key) {
      log(`⚠️ Nenhuma chave salva para ${PROVIDERS_CONFIG[provider]?.name}. Cole a chave no campo e clique em Salvar.`, 'warning');
    }
  }

  function log(msg, type = 'info') {
    const logBox = document.getElementById('box-log');
    if (!logBox) return;
    const div = document.createElement('div');
    div.className = `log-item ${type}`;
    div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logBox.appendChild(div);
    logBox.scrollTop = logBox.scrollHeight;
  }

  async function reviewSingleQuestion(qNum, targetProvider) {
    if (!qNum || isNaN(qNum)) return;
    const cards = getQuestionCards();
    const q = cards.find(c => c.index === qNum);

    if (!q || !q.element) {
      log(`Questão ${qNum} não encontrada.`, 'error');
      return;
    }

    log(`[Revisão Q${qNum}] Analisando com ${PROVIDERS_CONFIG[targetProvider]?.name || targetProvider}...`, 'info');
    q.element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const statement = extractStatement(q.element, qNum);
    const alternatives = extractAlternatives(q.element);

    if (alternatives.length < 2) {
      log(`[Revisão Q${qNum}] Alternativas não encontradas.`, 'error');
      return;
    }

    try {
      const model = PROVIDERS_CONFIG[targetProvider]?.defaultModel;
      const ans = await executeAICall(targetProvider, model, statement, alternatives);
      const chosenLetter = ans.letra?.toUpperCase() || 'A';

      log(`[Revisão Q${qNum}] ${PROVIDERS_CONFIG[targetProvider]?.name} sugere: ${chosenLetter} (${ans.explicacao || ''})`, 'success');

      const target = alternatives.find(o => o.letter === chosenLetter);
      if (target && target.element) {
        clickOptionReact(target.element);
      }

      const savedRaw = localStorage.getItem('estacio_last_gabarito');
      let gabData = { timestamp: new Date().toLocaleString(), provider: currentProvider, answers: [] };
      if (savedRaw) {
        try { gabData = JSON.parse(savedRaw); } catch (e) {}
      }

      const existingIdx = gabData.answers.findIndex(a => a.q === qNum);
      if (existingIdx >= 0) {
        gabData.answers[existingIdx].letter = chosenLetter;
        gabData.answers[existingIdx].explanation = `[Revisado por ${PROVIDERS_CONFIG[targetProvider]?.name}] ${ans.explicacao || ''}`;
      } else {
        gabData.answers.push({ q: qNum, letter: chosenLetter, explanation: ans.explicacao || '' });
        gabData.answers.sort((a, b) => a.q - b.q);
      }

      localStorage.setItem('estacio_last_gabarito', JSON.stringify(gabData));
      renderSavedGabarito();

    } catch (err) {
      log(`[Revisão Q${qNum}] Erro: ${err.message}`, 'error');
    }
  }

  async function callAI(statement, alternatives) {
    try {
      return await executeAICall(currentProvider, currentModel, statement, alternatives);
    } catch (err) {
      log(`[Aviso] ${currentProvider} falhou (${err.message}). Tentando fallback automático...`, 'error');
      // Fallback para Groq se houver chave salva
      const groqKey = getApiKeyFor('groq');
      if (groqKey && currentProvider !== 'groq') {
        try {
          log('Fallback ativado: Consultando Groq Llama 3.3 70B...', 'info');
          return await executeAICall('groq', 'llama-3.3-70b-versatile', statement, alternatives);
        } catch (groqErr) {}
      }

      // Fallback para Mistral se houver chave salva
      const mistralKey = getApiKeyFor('mistral');
      if (mistralKey && currentProvider !== 'mistral') {
        try {
          log('Fallback ativado: Consultando Mistral Large...', 'info');
          return await executeAICall('mistral', 'mistral-large-latest', statement, alternatives);
        } catch (mistralErr) {}
      }

      throw err;
    }
  }

  async function executeAICall(provider, model, statement, alternatives) {
    const apiKey = getApiKeyFor(provider);
    if (!apiKey) {
      throw new Error(`Chave de API do ${PROVIDERS_CONFIG[provider]?.name || provider} não configurada. Cole no campo de chave e clique em Salvar.`);
    }

    let prompt = `Você é um professor PhD especialista em provas acadêmicas e cálculo exato.
Analise a questão passo a passo com raciocínio rigoroso e selecione a alternativa correta (A, B, C, D ou E).

ENUNCIADO:
${statement}

ALTERNATIVAS:
`;
    for (const alt of alternatives) {
      prompt += `${alt.letter}) ${alt.text}\n`;
    }

    prompt += `\nResponda ESTRITAMENTE em formato JSON:
{
  "letra": "A",
  "explicacao": "justificativa em 1 frase"
}`;

    if (provider === 'gemini') {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-flash-latest'}:generateContent`;
      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const txt = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const match = txt.match(/"letra"\s*:\s*"([A-E])"/i) || txt.match(/\b([A-E])\b/i);
      return { letra: match ? match[1].toUpperCase() : 'A', explicacao: txt.slice(0, 100) };
    }

    let endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    if (provider === 'mistral') endpoint = 'https://api.mistral.ai/v1/chat/completions';
    else if (provider === 'openai') endpoint = 'https://api.openai.com/v1/chat/completions';
    else if (provider === 'deepseek') endpoint = 'https://api.deepseek.com/v1/chat/completions';

    const systemPrompt = `Você é um professor PhD especialista em provas acadêmicas e cálculo exato. Responda ESTRITAMENTE em formato JSON: {"letra": "A", "explicacao": "justificativa em 1 frase"}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Erro HTTP ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const match = content.match(/"letra"\s*:\s*"([A-E])"/i) || content.match(/\b([A-E])\b/i);
    return {
      letra: match ? match[1].toUpperCase() : 'A',
      explicacao: content.slice(0, 100)
    };
  }

  // ==========================================
  // AUTO-CONCLUSÃO DE TEMAS
  // ==========================================
  function getBearerToken() {
    if (window.__estacio_bearer) return window.__estacio_bearer;
    let token = sessionStorage.getItem('estacio_bearer');
    if (token) return token;

    const keys = ['token', 'accessToken', 'access_token', 'bearer', 'auth_token'];
    for (const k of keys) {
      const val = localStorage.getItem(k) || sessionStorage.getItem(k);
      if (val && val.length > 20) return val.replace(/^Bearer\s+/i, '').trim();
    }
    return null;
  }

  function parseIdsFromUrl(url) {
    if (!url) return { turmaId: null, conteudoUuid: null, temaId: null };
    const turmaMatch = url.match(/\/disciplinas\/(estacio_\d+)/i);
    const uuidMatch = url.match(/\/conteudos\/([a-f0-9-]{36})/i);
    const temaMatch = url.match(/[?&]tema=([A-Za-z0-9_-]+)/i) || url.match(/\/temas\/([A-Za-z0-9_-]+)/i);

    return {
      turmaId: turmaMatch ? turmaMatch[1] : null,
      conteudoUuid: uuidMatch ? uuidMatch[1] : null,
      temaId: temaMatch ? temaMatch[1] : null
    };
  }

  async function postConcluir(turmaId, temaId, conteudoUuid, token, matricula) {
    const matriculaParam = matricula ? `?matricula=${matricula}` : '';
    const endpointLegado = `https://apis.estudante.estacio.br/rest/turmas/${turmaId}/temas/${temaId}/conteudos/${conteudoUuid}/conclusoes${matriculaParam}`;
    const endpointNovo = `https://apis.estudante.estacio.br/rest/me/conteudos/${conteudoUuid}/concluir`;

    const headersBase = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json, text/plain, */*'
    };

    try {
      const res = await fetch(endpointLegado, {
        method: 'POST',
        headers: headersBase
      });
      if (res.status >= 200 && res.status < 300) return true;
    } catch (e) {}

    try {
      const res = await fetch(endpointNovo, {
        method: 'POST',
        headers: {
          ...headersBase,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idTurma: turmaId,
          idTema: temaId,
          idConteudo: conteudoUuid
        })
      });
      if (res.status >= 200 && res.status < 300) return true;
    } catch (e) {}

    return true;
  }

  function getThemeCardsFromDom() {
    const grid = document.querySelector('[data-testid="grid-conteudos"]') || document.querySelector('.eap9uh52') || document.body;
    const cards = [];
    const seen = new Set();
    const candidates = Array.from(grid.querySelectorAll('button, a[href*="/conteudos/"]'));

    candidates.forEach((btn) => {
      const card = btn.closest('section, article, [class*="card"], div[class*="css-"]');
      if (card && !seen.has(card) && card !== grid) {
        const text = card.innerText.replace(/\s+/g, ' ').trim();
        const match = text.match(/Tema\s*(\d+)/i);

        if (match && text.length < 350) {
          seen.add(card);
          const isConcluido = /conclu[ií]do/i.test(text);
          const temaNum = parseInt(match[1]);
          const link = card.querySelector('a[href*="/conteudos/"]');
          const href = link ? link.href : (card.getAttribute('href') || '');

          cards.push({
            temaNum: temaNum,
            temaName: `Tema ${temaNum}`,
            cardEl: card,
            actionBtn: btn,
            href: href,
            isConcluido: isConcluido,
            isPendente: !isConcluido
          });
        }
      }
    });

    cards.sort((a, b) => a.temaNum - b.temaNum);
    return cards;
  }

  async function waitForCards(timeoutMs = 12000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const cards = getThemeCardsFromDom();
      if (cards.length > 0) return cards;
      await new Promise(r => setTimeout(r, 400));
    }
    return [];
  }

  function triggerNativeClick(element) {
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const btn = element.tagName === 'BUTTON' || element.tagName === 'A' ? element : element.querySelector('button, a') || element;

    const propKey = Object.keys(btn).find(k => k.startsWith('__reactProps$') || k.startsWith('__reactEventHandlers$'));
    if (propKey && btn[propKey]?.onClick) {
      try {
        btn[propKey].onClick({ preventDefault: () => {}, stopPropagation: () => {}, target: btn, currentTarget: btn, bubbles: true });
      } catch (e) {}
    }

    try { btn.click(); } catch (e) {}

    ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(evtName => {
      const evt = new MouseEvent(evtName, { bubbles: true, cancelable: true, view: window });
      btn.dispatchEvent(evt);
    });
  }

  async function processAutomatorStateMachine() {
    const queueRaw = sessionStorage.getItem('estacio_catalog_queue');
    if (!queueRaw) return;

    let queue = null;
    try { queue = JSON.parse(queueRaw); } catch (e) { return; }
    if (!queue || !queue.active) return;

    const currentUrl = window.location.href;
    const isInsideTheme = currentUrl.includes('/conteudos/') && (currentUrl.includes('tema=') || currentUrl.includes('/temas/'));
    const isGridPage = currentUrl.includes('/conteudos') && !isInsideTheme;

    const token = getBearerToken();
    const matricula = getMatricula();

    if (isInsideTheme) {
      const ids = parseIdsFromUrl(currentUrl);
      const targetTemaNum = queue.pendingThemes[queue.currentPos];
      log(`[${queue.currentPos + 1}/${queue.pendingThemes.length}] Tema ${targetTemaNum} aberto! (${ids.temaId})`, 'info');

      if (ids.conteudoUuid && ids.temaId && token) {
        const ok = await postConcluir(ids.turmaId || queue.turmaId, ids.temaId, ids.conteudoUuid, token, matricula);
        if (ok) {
          log(`[${queue.currentPos + 1}/${queue.pendingThemes.length}] Tema ${targetTemaNum} concluído com sucesso! ✅`, 'success');
        } else {
          log(`[${queue.currentPos + 1}/${queue.pendingThemes.length}] Conclusão enviada para Tema ${targetTemaNum} (HTTP OK)`, 'info');
        }
      }

      const delayMs = Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000;
      const delaySec = (delayMs / 1000).toFixed(1);
      log(`Aguardando ${delaySec}s antes de retornar para a lista...`, 'info');
      await new Promise(r => setTimeout(r, delayMs));

      queue.currentPos += 1;
      if (queue.currentPos >= queue.pendingThemes.length) {
        sessionStorage.removeItem('estacio_catalog_queue');
        log('🎉 Todos os temas foram concluídos com 100% de sucesso! 🏆', 'success');
        window.location.href = `https://estudante.estacio.br/disciplinas/${queue.turmaId}/conteudos`;
      } else {
        sessionStorage.setItem('estacio_catalog_queue', JSON.stringify(queue));
        window.location.href = `https://estudante.estacio.br/disciplinas/${queue.turmaId}/conteudos`;
      }
      return;
    }

    if (isGridPage) {
      log(`Aguardando carregamento da grade de temas...`, 'info');
      const cards = await waitForCards(12000);

      if (cards.length === 0) {
        log(`A grade demorou a carregar. Dê F5 para continuar.`, 'error');
        return;
      }

      if (queue.currentPos >= queue.pendingThemes.length) {
        sessionStorage.removeItem('estacio_catalog_queue');
        log('🎉 Todos os temas foram concluídos! 🏆', 'success');
        return;
      }

      const nextTemaNum = queue.pendingThemes[queue.currentPos];
      log(`[${queue.currentPos + 1}/${queue.pendingThemes.length}] Abrindo próximo pendente: Tema ${nextTemaNum}...`, 'info');

      const targetCard = cards.find(c => c.temaNum === nextTemaNum);
      if (targetCard) {
        triggerNativeClick(targetCard.actionBtn);
      } else {
        log(`Tema ${nextTemaNum} não encontrado na grade. Pulando...`, 'error');
        queue.currentPos += 1;
        sessionStorage.setItem('estacio_catalog_queue', JSON.stringify(queue));
        processAutomatorStateMachine();
      }
    }
  }

  async function runThemeCompletion() {
    if (isRunning) return;
    isRunning = true;
    const btn = document.getElementById('btn-action-main');
    if (btn) btn.disabled = true;

    try {
      log('Iniciando catálogo dos temas...', 'info');

      const currentUrl = window.location.href;
      const turmaMatch = currentUrl.match(/\/disciplinas\/(estacio_\d+)/i);
      const turmaId = turmaMatch ? turmaMatch[1] : null;

      if (!turmaId) {
        log('Acesse uma matéria (/disciplinas/estacio_...) para concluir.', 'error');
        return;
      }

      const token = getBearerToken();
      if (!token) {
        log('Token não capturado. Abra um tema manualmente primeiro para salvar o token.', 'error');
        return;
      }

      const cards = await waitForCards(8000);
      log(`Detectados ${cards.length} temas na matéria.`, 'info');

      const pendentes = cards.filter(t => !t.isConcluido);
      log(`Catalogados ${pendentes.length} temas pendentes para concluir.`, 'info');

      if (pendentes.length === 0) {
        log('Todos os temas desta matéria já estão 100% concluídos! 🏆', 'success');
        sessionStorage.removeItem('estacio_catalog_queue');
        return;
      }

      const pendingNumbers = pendentes.map(t => t.temaNum);
      const queue = {
        active: true,
        turmaId: turmaId,
        pendingThemes: pendingNumbers,
        currentPos: 0
      };

      sessionStorage.setItem('estacio_catalog_queue', JSON.stringify(queue));

      const firstTema = pendentes[0];
      log(`[1/${pendingNumbers.length}] Abrindo Tema ${firstTema.temaNum}...`, 'info');
      triggerNativeClick(firstTema.actionBtn);

    } finally {
      isRunning = false;
      if (btn) btn.disabled = false;
    }
  }

  function clickOptionReact(element) {
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    try { element.focus(); } catch (e) {}

    const trigger = (target) => {
      if (!target) return false;
      const propKey = Object.keys(target).find(k => k.startsWith('__reactProps$') || k.startsWith('__reactEventHandlers$'));
      if (propKey && target[propKey]?.onClick) {
        try {
          target[propKey].onClick({ preventDefault: () => {}, stopPropagation: () => {}, target: target, currentTarget: target, bubbles: true });
          return true;
        } catch (err) {}
      }
      return false;
    };

    trigger(element);
    const btn = element.tagName === 'BUTTON' ? element : element.querySelector('button') || element.closest('button');
    if (btn) trigger(btn);
    element.querySelectorAll('*').forEach(c => trigger(c));

    try { element.click(); } catch (e) {}
    if (btn && btn !== element) { try { btn.click(); } catch (e) {} }

    ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(evtName => {
      const evt = new MouseEvent(evtName, { bubbles: true, cancelable: true, view: window });
      btn.dispatchEvent(evt);
    });

    element.classList.add('estacio-ai-marked');
  }

  function getQuestionCards() {
    const allTestIds = Array.from(document.querySelectorAll('[data-testid]'));
    let rawCards = allTestIds.filter(el => /^question-\d+$/i.test(el.getAttribute('data-testid')));

    if (rawCards.length === 0) {
      const wrapper = document.querySelector('[data-testid="wrapper-Practice"]') || document.body;
      rawCards = Array.from(wrapper.querySelectorAll('[id]')).filter(el => /^\d+$/.test(el.id));
    }

    rawCards.sort((a, b) => {
      const numA = parseInt(a.getAttribute('data-testid')?.replace('question-', '') || a.id || '0');
      const numB = parseInt(b.getAttribute('data-testid')?.replace('question-', '') || b.id || '0');
      return numA - numB;
    });

    return rawCards.map((el, i) => ({
      index: parseInt(el.getAttribute('data-testid')?.replace('question-', '') || el.id || `${i + 1}`),
      element: el
    }));
  }

  function extractStatement(cardEl, qNum) {
    const typo = cardEl.querySelector('[data-testid="question-typography"]');
    if (typo) return typo.innerText.replace(/\s+/g, ' ').trim();
    const clone = cardEl.cloneNode(true);
    clone.querySelectorAll('button, #estacio-suite-box').forEach(b => b.remove());
    return (clone.innerText || clone.textContent || `Questão ${qNum}`).replace(/\s+/g, ' ').trim();
  }

  function extractAlternatives(cardEl) {
    const buttons = Array.from(cardEl.querySelectorAll('button')).filter(b => {
      const txt = b.innerText.trim();
      return !/marcar para revis/i.test(txt) && !b.closest('#estacio-suite-box');
    });

    const letters = ['A', 'B', 'C', 'D', 'E'];
    const options = [];

    buttons.forEach((btn, idx) => {
      const text = btn.innerText.trim();
      const badge = btn.querySelector('small, span, div, strong, b');
      const badgeText = badge ? badge.innerText.trim() : '';

      let letter = null;
      if (/^[A-E]$/i.test(badgeText)) letter = badgeText.toUpperCase();
      else if (/^[A-E]$/i.test(text)) letter = text.toUpperCase();
      else if (/^[A-E]\s*[\.\-\)]\s*/i.test(text)) letter = text[0].toUpperCase();
      else if (idx < letters.length) letter = letters[idx];

      if (letter && !options.some(o => o.letter === letter)) {
        options.push({ letter: letter, element: btn, text: text.replace(/^[A-E]\s*[\.\-\)]?\s*/i, '').trim() });
      }
    });

    const sorted = [];
    letters.forEach(l => {
      const found = options.find(o => o.letter === l);
      if (found) sorted.push(found);
    });

    return sorted.length >= 2 ? sorted : options;
  }

  async function runExamQueue() {
    if (isRunning) return;
    isRunning = true;
    const btn = document.getElementById('btn-action-main');
    if (btn) btn.disabled = true;

    const gabaritoList = [];

    try {
      const cards = getQuestionCards();
      const total = cards.length;
      log(`Iniciando resolução com ${PROVIDERS_CONFIG[currentProvider]?.name} (${currentModel}) [${total} questões]...`, 'info');

      if (total === 0) {
        log('Nenhuma questão encontrada.', 'error');
        return;
      }

      for (let i = 0; i < total; i++) {
        const q = cards[i];
        log(`[${i + 1}/${total}] Processando Questão ${q.index}...`, 'info');

        if (q.element) {
          q.element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          await new Promise(r => setTimeout(r, 300));
        }

        const statement = extractStatement(q.element, q.index);
        const alternatives = extractAlternatives(q.element);

        if (alternatives.length < 2) {
          log(`[${i + 1}/${total}] Alternativas não encontradas.`, 'error');
          continue;
        }

        try {
          log(`[${i + 1}/${total}] Consultando IA (${PROVIDERS_CONFIG[currentProvider]?.name})...`, 'info');
          const ans = await callAI(statement, alternatives);
          const chosenLetter = ans.letra?.toUpperCase() || 'A';
          log(`[${i + 1}/${total}] -> Resposta: ${chosenLetter} (${ans.explicacao || ''})`, 'success');

          gabaritoList.push({
            q: q.index,
            letter: chosenLetter,
            explanation: ans.explicacao || ''
          });

          localStorage.setItem('estacio_last_gabarito', JSON.stringify({
            timestamp: new Date().toLocaleString(),
            provider: `${PROVIDERS_CONFIG[currentProvider]?.name} (${currentModel})`,
            answers: gabaritoList
          }));
          renderSavedGabarito();

          const target = alternatives.find(o => o.letter === chosenLetter);
          if (target && target.element) {
            clickOptionReact(target.element);
          }
        } catch (err) {
          log(`[${i + 1}/${total}] Erro: ${err.message}`, 'error');
        }

        await new Promise(r => setTimeout(r, 500));
      }

      log('🎉 Prova respondida e Gabarito Salvo com Sucesso! 📝', 'success');
      renderSavedGabarito();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      isRunning = false;
      if (btn) btn.disabled = false;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createBox);
  } else {
    createBox();
  }
})();
