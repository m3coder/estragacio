// Construtor e Controlador da Interface do Widget (com Descoberta Dinâmica de Modelos via API Oficial)

import { PROVIDERS_CONFIG } from '../config/providers.js';
import { CAT_MASCOT_DATA_URI } from '../config/mascot.js';
import { getSaved, setSaved, getApiKeyFor, setApiKeyFor, getLiveProviders, getProviderStatus } from '../config/storage.js';
import { setupUniversalDraggable } from './draggable.js';
import { renderSavedGabarito, copyGabarito, copyAllLogs } from '../modules/gabarito.js';
import { reviewSingleQuestion } from '../modules/reviewer.js';
import { runExamQueue } from '../modules/exam_solver.js';
import { startThemeCompletion, processAutomatorStateMachine } from '../modules/theme_automator.js';
import { testProviderKey } from '../core/ai_engine.js';
import { fetchLiveModels, getModelsForProvider } from '../modules/model_fetcher.js';

export function createSuiteWidget() {
  if (document.getElementById('estacio-suite-box')) return;

  const isExam = window.location.hostname.includes('saladeavaliacoes.com.br');
  let configTargetProvider = getSaved('config_target_provider', 'groq');
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
        <!-- Seletor Principal de IA Ativa (Apenas IAs com teste Live Aprovado) -->
        <div class="ai-selector-container">
          <div class="ai-selector-row">
            <span style="color:#94a3b8; font-weight:700;">🤖 IA Ativa:</span>
            <select id="box-ai-select" class="ai-selector-select"></select>
          </div>
          <div class="ai-selector-row">
            <span style="color:#94a3b8; font-weight:700;">🧠 Modelo:</span>
            <select id="box-model-select" class="ai-selector-select"></select>
          </div>
        </div>

        <!-- Painel de Cadastro e Teste Live de Chaves -->
        <div class="key-config-container" style="background:#0f172a; border:1px solid #1e293b; border-radius:6px; padding:6px; margin:4px 0 8px 0; display:flex; flex-direction:column; gap:4px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:#38bdf8; font-size:10px; font-weight:700;">🔑 Adicionar/Testar Chave:</span>
            <select id="config-target-select" style="background:#1e293b; color:#cbd5e1; border:1px solid #334155; border-radius:4px; font-size:10px; padding:2px 4px;">
              <option value="groq">Groq</option>
              <option value="claude">Anthropic Claude</option>
              <option value="mistral">Mistral AI</option>
              <option value="gemini">Google Gemini</option>
              <option value="openai">ChatGPT (OpenAI)</option>
              <option value="deepseek">DeepSeek</option>
            </select>
          </div>
          <div style="display:flex; gap:4px;">
            <input type="password" id="box-key-input" class="key-config-input" placeholder="Cole sua chave aqui..." style="flex:1;">
            <button id="btn-save-key" style="background:#2563eb; border:none; color:#fff; border-radius:4px; padding:4px 8px; font-size:11px; cursor:pointer; font-weight:700; white-space:nowrap;">
              🧪 Testar & Salvar
            </button>
          </div>
        </div>

        ${isExam ? `
          <div style="display:flex; justify-content:space-between; font-size:11px; color:#94a3b8;">
            <span style="color:#a78bfa; font-weight:600;">Sala de Provas</span>
            <span style="color:#60a5fa; font-weight:700;">Pronto</span>
          </div>
          <button id="btn-action-main" class="box-btn box-btn-primary">
            <span>🎯</span> Resolver e Marcar Prova
          </button>

          <!-- Barra de Segunda Opinião / Revisão Direta (Apenas IAs Live) -->
          <div class="review-config-bar">
            <span style="color:#c084fc; font-weight:700;">🔍 2ª Opinião com:</span>
            <select id="review-ai-select" class="ai-selector-select" style="font-size:11px; max-width:180px;"></select>
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
        <span id="box-footer-model" style="color:#38bdf8; font-weight:600;"></span>
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
    div.textContent = `[${new Date().toLocaleTimeString()}] Pronto. Suíte Estácio AI pronta para uso.`;
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

  // RENDERIZA APENAS PROVEDORES QUE POSSUEM CHAVE E PASSARAM NO TESTE LIVE
  function renderLiveProviderOptions() {
    const aiSelect = document.getElementById('box-ai-select');
    const reviewSelect = document.getElementById('review-ai-select');
    const liveKeys = getLiveProviders();

    if (aiSelect) {
      aiSelect.innerHTML = '';
      if (liveKeys.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = '⚠️ Nenhuma IA Live (Testar chave abaixo)';
        aiSelect.appendChild(opt);
      } else {
        liveKeys.forEach(pKey => {
          const opt = document.createElement('option');
          opt.value = pKey;
          opt.textContent = `🟢 ${PROVIDERS_CONFIG[pKey]?.name || pKey}`;
          if (pKey === currentProvider) opt.selected = true;
          aiSelect.appendChild(opt);
        });

        if (!liveKeys.includes(currentProvider)) {
          currentProvider = liveKeys[0];
          currentModel = PROVIDERS_CONFIG[currentProvider]?.defaultModel;
          setSaved('active_provider', currentProvider);
          setSaved('active_model', currentModel);
        }
      }
    }

    if (reviewSelect) {
      reviewSelect.innerHTML = '';
      if (liveKeys.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = '⚠️ Sem IA Live';
        reviewSelect.appendChild(opt);
      } else {
        liveKeys.forEach(pKey => {
          const opt = document.createElement('option');
          opt.value = pKey;
          opt.textContent = `🟢 ${PROVIDERS_CONFIG[pKey]?.name || pKey}`;
          if (pKey === reviewProvider) opt.selected = true;
          reviewSelect.appendChild(opt);
        });
      }
    }

    renderModelOptions(currentProvider, currentModel);
    updateFooterLabel();
  }

  function renderModelOptions(providerKey, selectedModelId) {
    const modelSelect = document.getElementById('box-model-select');
    if (!modelSelect) return;
    modelSelect.innerHTML = '';

    const models = getModelsForProvider(providerKey);

    models.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.name;
      if (m.id === selectedModelId) opt.selected = true;
      modelSelect.appendChild(opt);
    });

    // Se o modelo salvo não estiver na lista, seleciona o primeiro
    if (models.length > 0 && !models.some(m => m.id === selectedModelId)) {
      currentModel = models[0].id;
      setSaved('active_model', currentModel);
      modelSelect.value = currentModel;
    }
  }

  async function refreshDynamicModelsFromAPI(providerKey) {
    const key = getApiKeyFor(providerKey);
    if (!key) return;

    try {
      const liveModels = await fetchLiveModels(providerKey, key);
      if (liveModels.length > 0 && providerKey === currentProvider) {
        renderModelOptions(currentProvider, currentModel);
        updateFooterLabel();
      }
    } catch (e) {}
  }

  function updateFooterLabel() {
    const footerEl = document.getElementById('box-footer-model');
    if (!footerEl) return;
    const pName = PROVIDERS_CONFIG[currentProvider]?.name || 'Nenhuma IA Live';
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

  const targetSelect = document.getElementById('config-target-select');
  const keyInput = document.getElementById('box-key-input');
  const aiSelect = document.getElementById('box-ai-select');
  const modelSelect = document.getElementById('box-model-select');
  const btnSaveKey = document.getElementById('btn-save-key');

  // Inicializa com chaves que já estão no storage
  const allProvidersList = ['groq', 'claude', 'mistral', 'gemini', 'openai', 'deepseek'];
  allProvidersList.forEach(p => {
    const k = getApiKeyFor(p);
    if (k && getProviderStatus(p) === 'untested') {
      setProviderStatus(p, 'live');
    }
  });

  targetSelect.value = configTargetProvider;
  keyInput.value = getApiKeyFor(configTargetProvider);

  renderLiveProviderOptions();
  refreshDynamicModelsFromAPI(currentProvider);

  targetSelect.addEventListener('change', (e) => {
    configTargetProvider = e.target.value;
    setSaved('config_target_provider', configTargetProvider);
    keyInput.value = getApiKeyFor(configTargetProvider);
  });

  aiSelect.addEventListener('change', async (e) => {
    currentProvider = e.target.value;
    currentModel = PROVIDERS_CONFIG[currentProvider]?.defaultModel;
    setSaved('active_provider', currentProvider);
    setSaved('active_model', currentModel);
    renderModelOptions(currentProvider, currentModel);
    updateFooterLabel();
    log(`IA ativa alterada para: ${PROVIDERS_CONFIG[currentProvider]?.name}`, 'success');
    await refreshDynamicModelsFromAPI(currentProvider);
  });

  modelSelect.addEventListener('change', (e) => {
    currentModel = e.target.value;
    setSaved('active_model', currentModel);
    updateFooterLabel();
    log(`Modelo alterado para: ${currentModel}`, 'info');
  });

  // BOTÃO DE TESTAR & SALVAR CHAVE (TESTE LIVE + DESCOBERTA DINÂMICA DE MODELOS)
  btnSaveKey.addEventListener('click', async () => {
    const p = configTargetProvider;
    const val = keyInput.value.trim();
    const pName = PROVIDERS_CONFIG[p]?.name || p;

    if (!val) {
      setApiKeyFor(p, '');
      setSaved(`status_${p}`, 'error');
      renderLiveProviderOptions();
      log(`Chave do ${pName} removida.`, 'warning');
      return;
    }

    btnSaveKey.disabled = true;
    btnSaveKey.textContent = '⏳ Testando...';
    log(`Testando chave e buscando modelos ao vivo de ${pName}...`, 'info');

    try {
      await testProviderKey(p, val);
      setApiKeyFor(p, val);
      setSaved('active_provider', p);
      currentProvider = p;

      // Puxa lista real de modelos retornada pela API
      const dynamicModels = await fetchLiveModels(p, val);
      currentModel = dynamicModels[0]?.id || PROVIDERS_CONFIG[p]?.defaultModel;
      setSaved('active_model', currentModel);

      renderLiveProviderOptions();
      log(`✅ [Live] ${pName} ativo com ${dynamicModels.length} modelos sincronizados diretamente da API! 🟢`, 'success');
    } catch (err) {
      log(`❌ Falha no teste do ${pName}: ${err.message}`, 'error');
    } finally {
      btnSaveKey.disabled = false;
      btnSaveKey.textContent = '🧪 Testar & Salvar';
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

  // Botões de Cópia Silenciosa
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
