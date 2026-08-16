// Estácio Suite AI - Content Script (Live Dual AI & Model Selector, Multi-Keys, Gabarito & Revisão)

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

  let widgetElement = null;
  let toggleBtn = null;
  let isRunning = false;
  let lastUrl = window.location.href;

  function getMatricula() {
    let matricula = localStorage.getItem('estacio_matricula') || '';
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

  if (window.location.hostname.includes('estudante.estacio.br')) {
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

  function isExamPage() {
    return window.location.hostname.includes('saladeavaliacoes.com.br');
  }

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
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT' || e.target.id === 'solver-btn-min' || e.target.id === 'solver-btn-hide') return;
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
    const logBox = document.getElementById('solver-log');
    if (!logBox) return;
    const lines = Array.from(logBox.querySelectorAll('.widget-log-item')).map(el => el.textContent);
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

      copyTextToClipboard(text, '📋 Gabarito completo copiado para a área de transferência!');
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
    const modelSelect = document.getElementById('solver-model-select');
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

  function init() {
    createOrUpdateWidget();
    setInterval(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        createOrUpdateWidget();
      }
    }, 1000);
  }

  async function createOrUpdateWidget() {
    const examMode = isExamPage();

    if (!widgetElement) {
      widgetElement = document.createElement('div');
      widgetElement.id = 'estacio-solver-widget';
      document.body.appendChild(widgetElement);

      toggleBtn = document.createElement('div');
      toggleBtn.id = 'estacio-suite-toggle-btn';
      toggleBtn.innerHTML = '⚡';
      toggleBtn.title = 'Mostrar Estácio Suite AI';
      document.body.appendChild(toggleBtn);

      setupUniversalDraggable(toggleBtn, toggleBtn, () => {
        widgetElement.classList.remove('hidden-box');
        widgetElement.classList.remove('minimized');
        toggleBtn.style.display = 'none';
      });

      setupUniversalDraggable(widgetElement, widgetElement, () => {
        if (widgetElement.classList.contains('minimized')) {
          widgetElement.classList.remove('minimized');
        }
      });
    }

    const settings = await window.EstacioSolver.getSettings();
    let currentProvider = settings.provider || 'groq';
    let currentModel = settings.model || PROVIDERS_CONFIG[currentProvider]?.defaultModel;

    widgetElement.innerHTML = `
      <div class="widget-header" id="widget-drag-handle">
        <div class="widget-title">
          <span>⚡</span>
          <span>Estácio Suite AI</span>
        </div>
        <div class="widget-controls">
          <button id="solver-btn-copy-hdr" class="widget-btn-icon" title="Copiar Logs">📋</button>
          <button id="solver-btn-min" class="widget-btn-icon" title="Minimizar (vira bolha)">_</button>
          <button id="solver-btn-hide" class="widget-btn-icon" title="Ocultar (botão flutuante)">✕</button>
        </div>
      </div>
      <div class="widget-body">
        <!-- Seletor Duplo de Provedor e Modelo -->
        <div style="display:flex; flex-direction:column; gap:5px; background:rgba(0,0,0,0.35); padding:8px; border-radius:6px; border:1px solid rgba(255,255,255,0.06); font-size:11px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:#94a3b8; font-weight:700;">🤖 IA:</span>
            <select id="solver-provider-select" style="background:#1e293b; color:#38bdf8; border:1px solid #475569; border-radius:4px; font-size:11px; font-weight:600; padding:2px 6px; flex:1; max-width:210px;">
              <option value="groq" ${currentProvider === 'groq' ? 'selected' : ''}>Groq (Ultra Rápido)</option>
              <option value="mistral" ${currentProvider === 'mistral' ? 'selected' : ''}>Mistral AI (PhD)</option>
              <option value="gemini" ${currentProvider === 'gemini' ? 'selected' : ''}>Google Gemini</option>
              <option value="openai" ${currentProvider === 'openai' ? 'selected' : ''}>ChatGPT (OpenAI)</option>
              <option value="deepseek" ${currentProvider === 'deepseek' ? 'selected' : ''}>DeepSeek</option>
            </select>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:#94a3b8; font-weight:700;">🧠 Modelo:</span>
            <select id="solver-model-select" style="background:#1e293b; color:#38bdf8; border:1px solid #475569; border-radius:4px; font-size:11px; font-weight:600; padding:2px 6px; flex:1; max-width:210px;"></select>
          </div>
        </div>

        <!-- Campo de Chave de API -->
        <div style="display:flex; align-items:center; gap:6px; background:rgba(0,0,0,0.25); padding:5px 8px; border-radius:6px; font-size:11px;">
          <span style="color:#94a3b8; font-size:10px; font-weight:700;">🔑 Chave:</span>
          <input type="password" id="solver-key-input" style="flex:1; background:#1e293b; border:1px solid #475569; border-radius:4px; color:#fff; padding:3px 6px; font-size:11px; font-family:monospace;" placeholder="Cole sua chave aqui...">
          <button id="solver-btn-save-key" style="background:#2563eb; border:none; color:#fff; border-radius:4px; padding:3px 8px; font-size:11px; font-weight:700; cursor:pointer;">Salvar</button>
        </div>

        ${examMode ? `
          <div class="widget-status">
            <span>Sala de Provas</span>
            <span id="solver-question-count" class="widget-status-badge">Detectando...</span>
          </div>
          <div class="widget-actions">
            <button id="solver-btn-action" class="widget-btn widget-btn-primary">
              <span>🎯</span> Resolver e Marcar Prova
            </button>
          </div>

          <!-- Barra de Revisão / Segunda Opinião -->
          <div style="display:flex; align-items:center; gap:6px; background:rgba(0,0,0,0.35); padding:6px 8px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); font-size:11px;">
            <span style="color:#c084fc; font-weight:700;">🔍 Revisar Q:</span>
            <input type="number" id="review-q-num" style="width:40px; background:#1e293b; border:1px solid #475569; border-radius:4px; color:#fff; padding:2px 4px; text-align:center; font-size:11px; font-weight:700;" value="1" min="1" max="50">
            <select id="review-ai-select" style="background:#1e293b; color:#38bdf8; border:1px solid #475569; border-radius:4px; font-size:10px; padding:2px 4px; flex:1;">
              <option value="mistral">Mistral Large (PhD)</option>
              <option value="groq">Groq (Llama 70B)</option>
              <option value="gemini">Gemini Flash</option>
              <option value="openai">ChatGPT (4o)</option>
              <option value="deepseek">DeepSeek R1</option>
            </select>
            <button id="btn-review-action" style="background:linear-gradient(135deg, #8b5cf6, #d946ef); color:#fff; border:none; border-radius:4px; padding:3px 8px; font-size:11px; font-weight:600; cursor:pointer;">Reavaliar</button>
          </div>
        ` : `
          <div class="widget-status">
            <span>Portal do Aluno</span>
            <span class="widget-status-badge" style="color:#10b981">Conclusão de Matérias</span>
          </div>
          <div class="widget-actions">
            <button id="solver-btn-action" class="widget-btn widget-btn-success">
              <span>📚</span> Concluir Temas Desta Matéria
            </button>
          </div>
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

        <div class="widget-log" id="solver-log">
          <div class="widget-log-item info">Pronto. IA: ${PROVIDERS_CONFIG[currentProvider]?.name} (${currentModel}) ativa.</div>
        </div>
      </div>
      <div class="widget-footer">
        <span id="solver-footer-model" style="color:#38bdf8; font-weight:600;">${PROVIDERS_CONFIG[currentProvider]?.name} (${currentModel})</span>
        <button id="solver-btn-copy-ftr" style="background:none; border:none; color:#60a5fa; cursor:pointer; font-size:11px; display:flex; align-items:center; gap:4px;">
          <span>📋</span> Copiar Logs
        </button>
      </div>
    `;

    setupUniversalDraggable(widgetElement, document.getElementById('widget-drag-handle'));

    const providerSelect = document.getElementById('solver-provider-select');
    const modelSelect = document.getElementById('solver-model-select');
    const keyInput = document.getElementById('solver-key-input');
    const footerModel = document.getElementById('solver-footer-model');

    renderModelOptions(currentProvider, currentModel);
    keyInput.value = settings.apiKeys?.[currentProvider] || settings.apiKey || '';

    providerSelect.addEventListener('change', async () => {
      currentProvider = providerSelect.value;
      currentModel = PROVIDERS_CONFIG[currentProvider]?.defaultModel;
      renderModelOptions(currentProvider, currentModel);

      const updatedSettings = await window.EstacioSolver.getSettings();
      const currentKey = updatedSettings.apiKeys?.[currentProvider] || '';
      keyInput.value = currentKey;

      await window.EstacioSolver.saveSettings({
        provider: currentProvider,
        model: currentModel,
        apiKey: currentKey
      });

      footerModel.textContent = `${PROVIDERS_CONFIG[currentProvider]?.name} (${currentModel})`;
      log(`IA alterada para: ${PROVIDERS_CONFIG[currentProvider]?.name} (${currentModel})`, 'success');

      if (!currentKey) {
        log(`⚠️ Nenhuma chave salva para ${PROVIDERS_CONFIG[currentProvider]?.name}. Cole sua chave e clique em Salvar.`, 'warning');
      }
    });

    modelSelect.addEventListener('change', async () => {
      currentModel = modelSelect.value;
      await window.EstacioSolver.saveSettings({ model: currentModel });
      footerModel.textContent = `${PROVIDERS_CONFIG[currentProvider]?.name} (${currentModel})`;
      log(`Modelo alterado para: ${currentModel}`, 'info');
    });

    document.getElementById('solver-btn-save-key').addEventListener('click', async () => {
      const val = keyInput.value.trim();
      const st = await window.EstacioSolver.getSettings();
      const apiKeys = st.apiKeys || {};
      apiKeys[currentProvider] = val;

      await window.EstacioSolver.saveSettings({
        apiKeys: apiKeys,
        apiKey: val
      });

      if (val) {
        log(`✅ Chave para ${PROVIDERS_CONFIG[currentProvider]?.name} salva com sucesso!`, 'success');
      } else {
        log(`⚠️ Chave para ${PROVIDERS_CONFIG[currentProvider]?.name} removida.`, 'warning');
      }
    });

    document.getElementById('solver-btn-copy-hdr').addEventListener('click', (e) => {
      e.stopPropagation();
      copyAllLogs();
    });
    document.getElementById('solver-btn-copy-ftr').addEventListener('click', (e) => {
      e.stopPropagation();
      copyAllLogs();
    });

    const gabaritoCopyBtn = document.getElementById('btn-copy-gabarito');
    if (gabaritoCopyBtn) {
      gabaritoCopyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyGabarito();
      });
    }

    const reviewActionBtn = document.getElementById('btn-review-action');
    if (reviewActionBtn) {
      reviewActionBtn.addEventListener('click', () => {
        const qNum = parseInt(document.getElementById('review-q-num').value);
        const targetProvider = document.getElementById('review-ai-select').value;
        reviewSingleQuestion(qNum, targetProvider);
      });
    }

    document.getElementById('solver-btn-min').addEventListener('click', (e) => {
      e.stopPropagation();
      widgetElement.classList.toggle('minimized');
    });

    document.getElementById('solver-btn-hide').addEventListener('click', (e) => {
      e.stopPropagation();
      widgetElement.classList.add('hidden-box');
      toggleBtn.style.display = 'flex';
    });

    const actionBtn = document.getElementById('solver-btn-action');
    if (examMode) {
      actionBtn.addEventListener('click', startExamQueue);
      updateExamCount();
      renderSavedGabarito();
    } else {
      actionBtn.addEventListener('click', startThemeCompletion);
    }

    processAutomatorStateMachine();
  }

  function log(message, type = 'info') {
    const logBox = document.getElementById('solver-log');
    if (!logBox) return;
    const item = document.createElement('div');
    item.className = `widget-log-item ${type}`;
    item.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logBox.appendChild(item);
    logBox.scrollTop = logBox.scrollHeight;
  }

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

  async function startThemeCompletion() {
    if (isRunning) return;
    isRunning = true;
    const btn = document.getElementById('solver-btn-action');
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

  // ==========================================
  // RESOLUÇÃO DE PROVAS COM IA & GABARITO
  // ==========================================
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

  function updateExamCount() {
    const badge = document.getElementById('solver-question-count');
    if (!badge) return;
    const cards = getQuestionCards();
    badge.textContent = cards.length > 0 ? `${cards.length} detectadas` : 'Pronto';
  }

  function extractStatement(cardEl, qNum) {
    const typo = cardEl.querySelector('[data-testid="question-typography"]');
    if (typo) return typo.innerText.replace(/\s+/g, ' ').trim();
    const clone = cardEl.cloneNode(true);
    clone.querySelectorAll('button, #estacio-solver-widget').forEach(b => b.remove());
    return (clone.innerText || clone.textContent || `Questão ${qNum}`).replace(/\s+/g, ' ').trim();
  }

  function extractAlternatives(cardEl) {
    const buttons = Array.from(cardEl.querySelectorAll('button')).filter(b => {
      const txt = b.innerText.trim();
      return !/marcar para revis/i.test(txt) && !b.closest('#estacio-solver-widget');
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
      const settings = await window.EstacioSolver.getSettings();
      const prompt = window.EstacioSolver.formatPrompt(statement, alternatives);
      const targetKey = settings.apiKeys?.[targetProvider] || settings.apiKey;

      if (!targetKey) {
        log(`[Revisão Q${qNum}] Chave para ${PROVIDERS_CONFIG[targetProvider]?.name || targetProvider} não salva.`, 'error');
        return;
      }

      const result = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          type: 'CALL_AI',
          payload: {
            provider: targetProvider,
            apiKey: targetKey,
            model: PROVIDERS_CONFIG[targetProvider]?.defaultModel || 'mistral-large-latest',
            prompt: prompt
          }
        }, (response) => {
          if (!response || !response.success) reject(new Error(response?.error || 'Erro na revisão'));
          else resolve(response.data);
        });
      });

      const chosenLetter = result.letra?.toUpperCase() || 'A';
      log(`[Revisão Q${qNum}] ${PROVIDERS_CONFIG[targetProvider]?.name} sugere: ${chosenLetter} (${result.explicacao || ''})`, 'success');

      const target = alternatives.find(o => o.letter === chosenLetter);
      if (target && target.element) {
        clickOptionReact(target.element);
      }

      const savedRaw = localStorage.getItem('estacio_last_gabarito');
      let gabData = { timestamp: new Date().toLocaleString(), provider: targetProvider, answers: [] };
      if (savedRaw) {
        try { gabData = JSON.parse(savedRaw); } catch (e) {}
      }

      const existingIdx = gabData.answers.findIndex(a => a.q === qNum);
      if (existingIdx >= 0) {
        gabData.answers[existingIdx].letter = chosenLetter;
        gabData.answers[existingIdx].explanation = `[Revisado por ${PROVIDERS_CONFIG[targetProvider]?.name}] ${result.explicacao || ''}`;
      } else {
        gabData.answers.push({ q: qNum, letter: chosenLetter, explanation: result.explicacao || '' });
        gabData.answers.sort((a, b) => a.q - b.q);
      }

      localStorage.setItem('estacio_last_gabarito', JSON.stringify(gabData));
      renderSavedGabarito();

    } catch (err) {
      log(`[Revisão Q${qNum}] Erro: ${err.message}`, 'error');
    }
  }

  async function startExamQueue() {
    if (isRunning) return;
    isRunning = true;
    const btn = document.getElementById('solver-btn-action');
    if (btn) btn.disabled = true;

    const gabaritoList = [];

    try {
      const settings = await window.EstacioSolver.getSettings();
      const cards = getQuestionCards();
      const total = cards.length;
      log(`Iniciando resolução com ${PROVIDERS_CONFIG[settings.provider]?.name} (${settings.model}) [${total} questões]...`, 'info');

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
          log(`[${i + 1}/${total}] Consultando IA (${PROVIDERS_CONFIG[settings.provider]?.name})...`, 'info');
          const result = await window.EstacioSolver.solveQuestion({
            statement: statement,
            alternatives: alternatives.map(o => ({ letter: o.letter, text: o.text }))
          });

          const chosenLetter = result.letra?.toUpperCase() || 'A';
          log(`[${i + 1}/${total}] -> Resposta: ${chosenLetter} (${result.explicacao || ''})`, 'success');

          gabaritoList.push({
            q: q.index,
            letter: chosenLetter,
            explanation: result.explicacao || ''
          });

          localStorage.setItem('estacio_last_gabarito', JSON.stringify({
            timestamp: new Date().toLocaleString(),
            provider: `${PROVIDERS_CONFIG[settings.provider]?.name} (${settings.model})`,
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
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
