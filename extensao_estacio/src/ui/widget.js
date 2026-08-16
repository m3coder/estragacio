// Construtor e Controlador da Interface do Widget (com Persistência e Limpeza de Dados)

import { PROVIDERS_CONFIG } from '../config/providers.js';
import { CAT_MASCOT_DATA_URI } from '../config/mascot.js';
import { getSaved, setSaved, getApiKeyFor, setApiKeyFor } from '../config/storage.js';
import { setupUniversalDraggable } from './draggable.js';
import { renderSavedGabarito, copyGabarito, copyAllLogs } from '../modules/gabarito.js';
import { reviewSingleQuestion } from '../modules/reviewer.js';
import { runExamQueue } from '../modules/exam_solver.js';
import { startThemeCompletion, processAutomatorStateMachine } from '../modules/theme_automator.js';

export function createSuiteWidget() {
  if (document.getElementById('estacio-suite-box')) return;

  const isExam = window.location.hostname.includes('saladeavaliacoes.com.br');
  let currentProvider = getSaved('active_provider', 'groq');
  let currentModel = getSaved('active_model', PROVIDERS_CONFIG[currentProvider]?.defaultModel || 'llama-3.3-70b-versatile');
  let reviewProvider = getSaved('review_provider', 'claude');
  let isBusy = false;

  const savedLogsRaw = localStorage.getItem('estacio_suite_logs');
  let initialLogs = [];
  try { initialLogs = JSON.parse(savedLogsRaw) || []; } catch(e) {}

  const box = document.createElement('div');
  box.id = 'estacio-suite-box';
  box.innerHTML = `
    <div class="box-inner">
      <div class="box-header" id="box-drag-handle">
        <div class="box-title">
          <img src="${CAT_MASCOT_DATA_URI}" class="cat-dancing-avatar" alt="Mascote">
          <span>Estácio Suite AI</span>
        </div>
        <div class="box-controls">
          <button id="btn-clear-header" class="box-ctrl-btn" title="Limpar Logs e Cache">🧹</button>
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
              <option value="claude" ${currentProvider === 'claude' ? 'selected' : ''}>Anthropic Claude (3.7 / 3.5)</option>
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

        <!-- Campo de Chave de API -->
        <div class="key-config-row">
          <span style="color:#94a3b8; font-size:10px; font-weight:700;">🔑 Chave:</span>
          <input type="password" id="box-key-input" class="key-config-input" placeholder="Cole sua chave aqui...">
          <button id="btn-save-key" style="background:#2563eb; border:none; color:#fff; border-radius:4px; padding:4px 8px; font-size:11px; cursor:pointer; font-weight:700;">Salvar</button>
        </div>

        ${isExam ? `
          <div style="display:flex; justify-content:space-between; font-size:11px; color:#94a3b8;">
            <span style="color:#a78bfa; font-weight:600;">Sala de Provas</span>
            <span style="color:#60a5fa; font-weight:700;">Pronto</span>
          </div>
          <button id="btn-action-main" class="box-btn box-btn-primary">
            <span>🎯</span> Resolver e Marcar Prova
          </button>

          <!-- Barra de Segunda Opinião / Revisão Direta -->
          <div class="review-config-bar">
            <span style="color:#c084fc; font-weight:700;">🔍 2ª Opinião com:</span>
            <select id="review-ai-select" class="ai-selector-select" style="font-size:11px; max-width:180px;">
              <option value="claude" ${reviewProvider === 'claude' ? 'selected' : ''}>Claude 3.7 Sonnet</option>
              <option value="mistral" ${reviewProvider === 'mistral' ? 'selected' : ''}>Mistral Large (PhD)</option>
              <option value="groq" ${reviewProvider === 'groq' ? 'selected' : ''}>Groq Llama 70B</option>
              <option value="gemini" ${reviewProvider === 'gemini' ? 'selected' : ''}>Gemini Flash</option>
              <option value="openai" ${reviewProvider === 'openai' ? 'selected' : ''}>ChatGPT (4o)</option>
              <option value="deepseek" ${reviewProvider === 'deepseek' ? 'selected' : ''}>DeepSeek R1</option>
            </select>
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
            <span>📝 Gabarito (Clique na questão p/ revisar)</span>
            <button id="btn-copy-gabarito" style="background:none; border:none; color:#38bdf8; cursor:pointer; font-size:11px; font-weight:700;">
              📋 Copiar
            </button>
          </div>
          <div id="gabarito-badges" class="gabarito-badges"></div>
        </div>

        <div class="box-log" id="box-log"></div>
      </div>

      <div class="box-footer">
        <span id="box-footer-model" style="color:#38bdf8; font-weight:600;">${PROVIDERS_CONFIG[currentProvider]?.name} (${currentModel})</span>
        <div style="display:flex; align-items:center; gap:6px;">
          <button id="btn-clear-footer" class="footer-btn" title="Limpar logs e dados acumulados">
            <span>🧹</span> Limpar
          </button>
          <button id="btn-copy-footer" class="footer-btn" title="Copiar todos os logs">
            <span>📋</span> Copiar
          </button>
        </div>
      </div>
    </div>
  `;

  // Imagem do mascote na bolha minimizada
  const minMascotImg = document.createElement('img');
  minMascotImg.src = CAT_MASCOT_DATA_URI;
  minMascotImg.className = 'cat-bubble-avatar';
  minMascotImg.style.display = 'none';
  box.appendChild(minMascotImg);

  const toggleBtn = document.createElement('div');
  toggleBtn.id = 'estacio-suite-toggle-btn';
  toggleBtn.innerHTML = `<img src="${CAT_MASCOT_DATA_URI}" class="cat-bubble-avatar" alt="Mascote">`;
  toggleBtn.title = 'Mostrar Estácio Suite AI';

  document.body.appendChild(box);
  document.body.appendChild(toggleBtn);

  setupUniversalDraggable(box, document.getElementById('box-drag-handle'));

  setupUniversalDraggable(box, box, () => {
    if (box.classList.contains('minimized')) {
      box.classList.remove('minimized');
      minMascotImg.style.display = 'none';
    }
  });

  setupUniversalDraggable(toggleBtn, toggleBtn, () => {
    box.classList.remove('hidden-box');
    box.classList.remove('minimized');
    minMascotImg.style.display = 'none';
    toggleBtn.style.display = 'none';
  });

  const logBox = document.getElementById('box-log');

  // Restaura logs persistentes
  if (initialLogs.length > 0) {
    initialLogs.forEach(entry => {
      if (entry && entry.text && entry.text !== 'undefined') {
        const div = document.createElement('div');
        div.className = `log-item ${entry.type || 'info'}`;
        div.textContent = entry.text;
        logBox.appendChild(div);
      }
    });
    logBox.scrollTop = logBox.scrollHeight;
  } else {
    const div = document.createElement('div');
    div.className = 'log-item info';
    div.textContent = `[${new Date().toLocaleTimeString()}] Pronto. IA: ${PROVIDERS_CONFIG[currentProvider]?.name} (${currentModel}) ativa.`;
    logBox.appendChild(div);
  }

  function log(msg, type = 'info') {
    if (!logBox || !msg || msg === 'undefined') return;
    const formatted = `[${new Date().toLocaleTimeString()}] ${msg}`;
    const div = document.createElement('div');
    div.className = `log-item ${type}`;
    div.textContent = formatted;
    logBox.appendChild(div);
    logBox.scrollTop = logBox.scrollHeight;

    // Persiste até os últimos 40 logs
    try {
      const current = JSON.parse(localStorage.getItem('estacio_suite_logs') || '[]');
      current.push({ text: formatted, type: type });
      if (current.length > 40) current.splice(0, current.length - 40);
      localStorage.setItem('estacio_suite_logs', JSON.stringify(current));
    } catch(e) {}
  }

  function clearAllStoredData() {
    localStorage.removeItem('estacio_suite_logs');
    localStorage.removeItem('estacio_last_gabarito');
    localStorage.removeItem('estacio_catalog_queue');
    sessionStorage.removeItem('estacio_catalog_queue');

    if (logBox) logBox.innerHTML = '';

    const gabaritoPanel = document.getElementById('gabarito-panel');
    const gabaritoBadges = document.getElementById('gabarito-badges');
    if (gabaritoPanel) gabaritoPanel.style.display = 'none';
    if (gabaritoBadges) gabaritoBadges.innerHTML = '';

    log('🧹 Todos os logs, gabaritos e filas foram limpos com sucesso!', 'success');
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

  function updateFooterLabel() {
    const footerEl = document.getElementById('box-footer-model');
    if (!footerEl) return;
    const pName = PROVIDERS_CONFIG[currentProvider]?.name || currentProvider;
    footerEl.textContent = `${pName} (${currentModel})`;
  }

  function refreshGabaritoUI() {
    const container = document.getElementById('gabarito-panel');
    const badgesEl = document.getElementById('gabarito-badges');
    renderSavedGabarito(container, badgesEl, reviewProvider, (qNum) => {
      reviewSingleQuestion(
        qNum,
        reviewProvider,
        log,
        (q, isReviewing) => {
          const badgeEl = document.getElementById(`badge-q-${q}`);
          if (badgeEl) badgeEl.classList.toggle('reviewing', isReviewing);
        },
        refreshGabaritoUI
      );
    });
  }

  const keyInput = document.getElementById('box-key-input');
  const aiSelect = document.getElementById('box-ai-select');
  const modelSelect = document.getElementById('box-model-select');

  renderModelOptions(currentProvider, currentModel);
  keyInput.value = getApiKeyFor(currentProvider);

  aiSelect.addEventListener('change', (e) => {
    currentProvider = e.target.value;
    currentModel = PROVIDERS_CONFIG[currentProvider]?.defaultModel;
    setSaved('active_provider', currentProvider);
    setSaved('active_model', currentModel);
    renderModelOptions(currentProvider, currentModel);
    keyInput.value = getApiKeyFor(currentProvider);
    updateFooterLabel();
    log(`IA alterada para: ${PROVIDERS_CONFIG[currentProvider]?.name} (${currentModel})`, 'success');

    if (!keyInput.value) {
      log(`⚠️ Nenhuma chave salva para ${PROVIDERS_CONFIG[currentProvider]?.name}. Cole sua chave e clique em Salvar.`, 'warning');
    }
  });

  modelSelect.addEventListener('change', (e) => {
    currentModel = e.target.value;
    setSaved('active_model', currentModel);
    updateFooterLabel();
    log(`Modelo alterado para: ${currentModel}`, 'info');
  });

  document.getElementById('btn-save-key').addEventListener('click', () => {
    const val = keyInput.value.trim();
    setApiKeyFor(currentProvider, val);
    if (val) {
      log(`✅ Chave para ${PROVIDERS_CONFIG[currentProvider]?.name} salva com sucesso!`, 'success');
    } else {
      log(`⚠️ Chave para ${PROVIDERS_CONFIG[currentProvider]?.name} removida.`, 'warning');
    }
  });

  const reviewSelect = document.getElementById('review-ai-select');
  if (reviewSelect) {
    reviewSelect.addEventListener('change', (e) => {
      reviewProvider = e.target.value;
      setSaved('review_provider', reviewProvider);
      log(`2ª Opinião configurada para: ${PROVIDERS_CONFIG[reviewProvider]?.name}`, 'info');
      refreshGabaritoUI();
    });
  }

  // Botões de Limpeza (Header e Footer)
  document.getElementById('btn-clear-header').addEventListener('click', (e) => {
    e.stopPropagation();
    clearAllStoredData();
  });
  document.getElementById('btn-clear-footer').addEventListener('click', (e) => {
    e.stopPropagation();
    clearAllStoredData();
  });

  // Botões de Cópia Silenciosa (Sem disparar log undefined)
  document.getElementById('btn-copy-header').addEventListener('click', (e) => {
    e.stopPropagation();
    copyAllLogs(document.getElementById('box-log'));
  });
  document.getElementById('btn-copy-footer').addEventListener('click', (e) => {
    e.stopPropagation();
    copyAllLogs(document.getElementById('box-log'));
  });

  document.getElementById('btn-copy-gabarito').addEventListener('click', (e) => {
    e.stopPropagation();
    copyGabarito();
  });

  document.getElementById('btn-min').addEventListener('click', (e) => {
    e.stopPropagation();
    const isMin = box.classList.toggle('minimized');
    minMascotImg.style.display = isMin ? 'block' : 'none';
  });

  document.getElementById('btn-hide').addEventListener('click', (e) => {
    e.stopPropagation();
    box.classList.add('hidden-box');
    toggleBtn.style.display = 'flex';
  });

  const actionBtn = document.getElementById('btn-action-main');
  if (isExam) {
    refreshGabaritoUI();
    actionBtn.addEventListener('click', async () => {
      if (isBusy) return;
      isBusy = true;
      actionBtn.disabled = true;
      try {
        await runExamQueue(currentProvider, currentModel, log, refreshGabaritoUI);
      } finally {
        isBusy = false;
        actionBtn.disabled = false;
      }
    });
  } else {
    actionBtn.addEventListener('click', () => {
      startThemeCompletion(log);
    });
  }

  // Executa State Machine inicial
  processAutomatorStateMachine(log);

  // Monitor Ativo de Rotas SPA
  let lastMonitoredUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== lastMonitoredUrl) {
      lastMonitoredUrl = window.location.href;
      processAutomatorStateMachine(log);
    }
  }, 1000);

  window.addEventListener('popstate', () => {
    lastMonitoredUrl = window.location.href;
    processAutomatorStateMachine(log);
  });
}
