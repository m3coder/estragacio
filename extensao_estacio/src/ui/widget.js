// Widget In-Page Flutuante - Sincronização Unificada com Popup e Multi-Provedores de IA

import { CAT_MASCOT_DATA_URI } from '../config/mascot.js';
import { setupUniversalDraggable } from './draggable.js';
import { PROVIDERS_CONFIG } from '../config/providers.js';
import { getSaved, setSaved, getApiKeyFor, setApiKeyFor, getProviderStatus, setProviderStatus, onStorageChange, getShowPaidModels, setShowPaidModels } from '../config/storage.js';
import { copyAllLogs, copyGabarito, renderSavedGabarito, initGabaritoStructure } from '../modules/gabarito.js';
import { reviewSingleQuestion } from '../modules/reviewer.js';
import { runExamQueue, solveSingleQuestion, applySavedGabaritoToDOM } from '../modules/exam_solver.js';
import { startThemeCompletion, processAutomatorStateMachine } from '../modules/theme_automator.js';
import { testProviderKey } from '../core/ai_engine.js';
import { fetchLiveModels, getModelsForProvider } from '../modules/model_fetcher.js';
import { getTotalExamQuestionsCount } from '../modules/dom_parser.js';

export function createSuiteWidget() {
  if (document.getElementById('estacio-suite-box')) return;

  const ALL_PROVIDERS = ['groq', 'gemini', 'openrouter', 'ollama', 'mistral', 'claude', 'openai', 'deepseek'];

  const isExam = window.location.hostname.includes('saladeavaliacoes.com.br');
  let currentProvider = getSaved('active_provider', 'groq');
  let currentModel = getSaved('active_model', PROVIDERS_CONFIG[currentProvider]?.defaultModel || 'llama-3.3-70b-versatile');
  let reviewProvider = getSaved('review_provider', 'claude');
  let configTargetProvider = currentProvider;
  let showPaidModels = getShowPaidModels();
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
          <span class="title-gradient-text">Estácio Suite AI</span>
          <span class="version-badge">v2.5.5</span>
        </div>
        <div class="box-controls">
          <button id="btn-clear-header" class="box-ctrl-btn" title="Limpar Logs e Cache">🧹</button>
          <button id="btn-copy-header" class="box-ctrl-btn" title="Copiar Logs">📋</button>
          <button id="btn-min" class="box-ctrl-btn" title="Minimizar (vira bolha)">_</button>
          <button id="btn-hide" class="box-ctrl-btn" title="Ocultar (botão flutuante)">✕</button>
        </div>
      </div>

      <div class="box-body">
        <!-- Card 1: Seleção Inteligente de IA & Modelo -->
        <div class="ui-card">
          <div class="ui-form-row">
            <span class="ui-form-label">🤖 IA Ativa:</span>
            <select id="box-ai-select" class="ui-select"></select>
          </div>
          <div class="ui-form-row">
            <span class="ui-form-label">🧠 Modelo:</span>
            <select id="box-model-select" class="ui-select"></select>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding-top:2px;">
            <button id="btn-toggle-free-mode" class="pill-btn pill-btn-free" title="Alternar entre modelos 100% gratuitos ou todos os modelos">
              🟢 Apenas Free
            </button>
            <button id="btn-refresh-models" class="btn-secondary-action" title="Buscar modelos ao vivo da API">
              <span>🔄</span> Sincronizar
            </button>
          </div>
        </div>

        <!-- Card 2: Painel de Cadastro e Teste Live de Chaves -->
        <div class="ui-card">
          <div class="ui-card-header">
            <span style="color:#38bdf8; font-size:11px; font-weight:700;">🔑 Chave de API:</span>
            <select id="config-target-select" class="ui-select" style="max-width:145px; padding:3px 6px; font-size:10.5px;">
              <option value="groq">Groq</option>
              <option value="gemini">Google Gemini</option>
              <option value="openrouter">OpenRouter (Hermes)</option>
              <option value="ollama">Ollama (Local)</option>
              <option value="mistral">Mistral AI</option>
              <option value="claude">Anthropic Claude</option>
              <option value="openai">ChatGPT (OpenAI)</option>
              <option value="deepseek">DeepSeek</option>
            </select>
          </div>
          <div class="ui-form-row">
            <input type="password" id="box-key-input" class="ui-input" placeholder="Cole sua chave aqui...">
            <button id="btn-save-key" class="btn-secondary-action" style="background:#2563eb; color:#fff; border-color:#3b82f6; font-weight:700; padding:5px 10px;">
              🧪 Salvar
            </button>
          </div>
        </div>

        <!-- Card 3: Ação Principal e Contexto da Página -->
        ${isExam ? `
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; padding:0 2px;">
            <span style="color:#a78bfa; font-weight:700;">📍 Sala de Avaliações</span>
            <span style="color:#34d399; font-weight:700; background:rgba(16,185,129,0.15); padding:2px 7px; border-radius:12px; border:1px solid rgba(16,185,129,0.3);">🟢 Pronto</span>
          </div>
          <button id="btn-action-main" class="box-btn box-btn-primary">
            <span>🎯</span> Resolver e Marcar Prova
          </button>

          <!-- Barra de Segunda Opinião / Revisão Direta -->
          <div class="review-config-bar">
            <span style="color:#c084fc; font-weight:700; font-size:11px;">🔍 2ª Opinião com:</span>
            <select id="review-ai-select" class="ui-select" style="font-size:11px; max-width:180px;"></select>
          </div>
        ` : `
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; padding:0 2px;">
            <span style="color:#38bdf8; font-weight:700;">📍 Portal do Aluno</span>
            <span style="color:#34d399; font-weight:700; background:rgba(16,185,129,0.15); padding:2px 7px; border-radius:12px; border:1px solid rgba(16,185,129,0.3);">⚡ Auto-Temas</span>
          </div>
          <button id="btn-action-main" class="box-btn box-btn-success">
            <span>📚</span> Concluir Todos os Temas Desta Matéria
          </button>
        `}

        <!-- Card 4: Painel Visual do Gabarito Persistente -->
        <div id="gabarito-panel" class="gabarito-container" style="display:none;">
          <div class="gabarito-header">
            <span>📝 Gabarito (10 Questões)</span>
            <div class="gabarito-header-actions">
              <button id="btn-apply-gabarito" class="btn-gabarito-apply" title="Aplica todas as respostas salvas no gabarito diretamente na prova sem gastar IA">
                ⚡ Aplicar na Prova
              </button>
              <button id="btn-copy-gabarito" class="footer-btn" style="color:#38bdf8; font-weight:700;">
                📋 Copiar
              </button>
            </div>
          </div>
          <div id="gabarito-badges" class="gabarito-badges"></div>
        </div>

        <!-- Card 5: Terminal de Logs -->
        <div class="box-log" id="box-log"></div>
      </div>

      <div class="box-footer">
        <div style="display:flex; align-items:center; gap:6px; min-width:0; flex:1;">
          <span id="box-footer-model" style="color:#38bdf8; font-weight:600; font-size:11px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:130px;"></span>
          <div class="opacity-control-bar" title="Transparência quando o mouse estiver fora (Passe o mouse por cima para 100%)">
            <span style="font-size:10px; opacity:0.85;">👁️</span>
            <input type="range" id="box-opacity-slider" min="15" max="100" value="45" class="opacity-slider">
            <span id="box-opacity-val" class="opacity-val-badge">45%</span>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
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
    div.textContent = `[${new Date().toLocaleTimeString()}] Pronto. Suíte Estácio AI v2.5.5 pronta para uso.`;
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

    if (isExam) {
      initGabaritoStructure(10, PROVIDERS_CONFIG[currentProvider]?.name);
      refreshGabaritoUI();
    }

    log('🧹 Todos os logs, gabaritos e filas foram limpos com sucesso!', 'success');
  }

  function updateToggleBtnState() {
    const btn = document.getElementById('btn-toggle-free-mode');
    if (!btn) return;
    if (showPaidModels) {
      btn.textContent = '💎 Free + Pagos';
      btn.className = 'pill-btn pill-btn-paid';
      btn.title = 'Modo Completo Ativo (Mostrando modelos Free e Pagos). Clique para restringir a apenas 100% Free.';
    } else {
      btn.textContent = '🟢 Apenas Free';
      btn.className = 'pill-btn pill-btn-free';
      btn.title = 'Modo 100% Free Ativo (Modelos pagos ocultos). Clique para exibir modelos pagos.';
    }
  }

  // RENDERIZA TODOS OS PROVEDORES NO DROPDOWN COM ÍCONES DE STATUS
  function renderProviderOptions() {
    const aiSelect = document.getElementById('box-ai-select');
    const reviewSelect = document.getElementById('review-ai-select');

    if (aiSelect) {
      aiSelect.innerHTML = '';
      ALL_PROVIDERS.forEach(pKey => {
        const pConfig = PROVIDERS_CONFIG[pKey];
        const key = getApiKeyFor(pKey);
        const hasKey = Boolean(key);
        const badge = hasKey ? '🟢' : '🔑';
        const opt = document.createElement('option');
        opt.value = pKey;
        opt.textContent = `${badge} ${pConfig?.name || pKey}`;
        if (pKey === currentProvider) opt.selected = true;
        aiSelect.appendChild(opt);
      });
    }

    if (reviewSelect) {
      reviewSelect.innerHTML = '';
      ALL_PROVIDERS.forEach(pKey => {
        const pConfig = PROVIDERS_CONFIG[pKey];
        const key = getApiKeyFor(pKey);
        const hasKey = Boolean(key);
        const badge = hasKey ? '🟢' : '🔑';
        const opt = document.createElement('option');
        opt.value = pKey;
        opt.textContent = `${badge} ${pConfig?.name || pKey}`;
        if (pKey === reviewProvider) opt.selected = true;
        reviewSelect.appendChild(opt);
      });
    }

    renderModelOptions(currentProvider, currentModel);
    updateFooterLabel();
  }

  function renderModelOptions(providerKey, selectedModelId) {
    const modelSelect = document.getElementById('box-model-select');
    if (!modelSelect) return;
    modelSelect.innerHTML = '';

    const models = getModelsForProvider(providerKey, showPaidModels);

    models.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.name;
      if (m.id === selectedModelId) opt.selected = true;
      modelSelect.appendChild(opt);
    });

    if (models.length > 0 && !models.some(m => m.id === selectedModelId)) {
      currentModel = models[0].id;
      setSaved('active_model', currentModel);
      modelSelect.value = currentModel;
    }
  }

  async function refreshDynamicModelsFromAPI(providerKey, showLogs = false) {
    const key = getApiKeyFor(providerKey);
    if (!key && providerKey !== 'ollama') return;

    const pName = PROVIDERS_CONFIG[providerKey]?.name || providerKey;
    if (showLogs) log(`🔍 Consultando modelos disponíveis na API de ${pName}...`, 'info');

    try {
      const liveModels = await fetchLiveModels(providerKey, key, showPaidModels);
      if (liveModels.length > 0 && providerKey === currentProvider) {
        renderModelOptions(currentProvider, currentModel);
        updateFooterLabel();
        if (showLogs) log(`✅ [Live] ${liveModels.length} modelos sincronizados diretamente da API de ${pName}!`, 'success');
      }
    } catch (e) {
      if (showLogs) log(`⚠️ Não foi possível sincronizar modelos ao vivo: ${e.message}`, 'warning');
    }
  }

  function updateFooterLabel() {
    const footerEl = document.getElementById('box-footer-model');
    if (!footerEl) return;
    const pName = PROVIDERS_CONFIG[currentProvider]?.name || currentProvider;
    footerEl.textContent = `🟢 ${pName} (${currentModel})`;
  }

  function refreshGabaritoUI() {
    const container = document.getElementById('gabarito-panel');
    const badgesEl = document.getElementById('gabarito-badges');
    renderSavedGabarito(container, badgesEl, reviewProvider, async (qNum, currentStatus) => {
      if (isBusy) return;
      isBusy = true;
      try {
        if (currentStatus === 'done') {
          // Se já está concluída, clique revisa com 2ª opinião
          await reviewSingleQuestion(qNum, reviewProvider, log, refreshGabaritoUI);
        } else {
          // Se está pendente ou com falha, clique resolve imediatamente com a IA ativa
          await solveSingleQuestion(qNum, currentProvider, currentModel, log, refreshGabaritoUI);
        }
      } finally {
        isBusy = false;
      }
    });
  }

  const targetSelect = document.getElementById('config-target-select');
  const keyInput = document.getElementById('box-key-input');
  const aiSelect = document.getElementById('box-ai-select');
  const modelSelect = document.getElementById('box-model-select');
  const btnSaveKey = document.getElementById('btn-save-key');
  const btnRefreshModels = document.getElementById('btn-refresh-models');
  const btnToggleFreeMode = document.getElementById('btn-toggle-free-mode');
  const btnApplyGabarito = document.getElementById('btn-apply-gabarito');

  targetSelect.value = configTargetProvider;
  keyInput.value = getApiKeyFor(configTargetProvider);

  // Transparência Ociosa Customizável (Idle Opacity)
  const savedIdleOpacity = localStorage.getItem('estacio_idle_opacity') || '45';
  box.style.setProperty('--widget-idle-opacity', `${parseInt(savedIdleOpacity, 10) / 100}`);

  const opacitySlider = document.getElementById('box-opacity-slider');
  const opacityValBadge = document.getElementById('box-opacity-val');

  if (opacitySlider && opacityValBadge) {
    opacitySlider.value = savedIdleOpacity;
    opacityValBadge.textContent = `${savedIdleOpacity}%`;

    opacitySlider.addEventListener('input', (e) => {
      const val = e.target.value;
      opacityValBadge.textContent = `${val}%`;
      box.style.setProperty('--widget-idle-opacity', `${parseInt(val, 10) / 100}`);
      localStorage.setItem('estacio_idle_opacity', val);
    });
  }

  updateToggleBtnState();
  renderProviderOptions();
  refreshDynamicModelsFromAPI(currentProvider, false);

  // Inicializa e exibe o gabarito das 10 questões imediatamente na Sala de Provas
  if (isExam) {
    const totalQ = getTotalExamQuestionsCount();
    initGabaritoStructure(totalQ, PROVIDERS_CONFIG[currentProvider]?.name);
    refreshGabaritoUI();
  }

  // OUVE MUDANÇAS DE STORAGE EM TEMPO REAL DO POPUP
  onStorageChange(() => {
    showPaidModels = getShowPaidModels();
    updateToggleBtnState();
    currentProvider = getSaved('active_provider', 'groq');
    currentModel = getSaved('active_model', PROVIDERS_CONFIG[currentProvider]?.defaultModel);
    configTargetProvider = currentProvider;
    if (targetSelect) targetSelect.value = currentProvider;
    if (keyInput) keyInput.value = getApiKeyFor(currentProvider);
    renderProviderOptions();
    refreshDynamicModelsFromAPI(currentProvider, false);
    if (isExam) refreshGabaritoUI();
  });

  // BOTÃO DE ALTERNÂNCIA DE MODO FREE / PAGO
  if (btnToggleFreeMode) {
    btnToggleFreeMode.addEventListener('click', (e) => {
      e.preventDefault();
      showPaidModels = !showPaidModels;
      setShowPaidModels(showPaidModels);
      updateToggleBtnState();
      renderModelOptions(currentProvider, currentModel);
      updateFooterLabel();
      log(showPaidModels ? '💎 Modo Completo: Exibindo modelos Free e Pagos/Premium.' : '🟢 Modo 100% Free: Exibindo apenas modelos gratuitos.', 'info');
    });
  }

  // BOTÃO DE APLICAR GABARITO NA PROVA (SEM USAR IA)
  if (btnApplyGabarito) {
    btnApplyGabarito.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (isBusy) return;
      isBusy = true;
      btnApplyGabarito.disabled = true;
      btnApplyGabarito.textContent = '⏳ Marcando...';
      try {
        await applySavedGabaritoToDOM(log, refreshGabaritoUI);
      } finally {
        isBusy = false;
        btnApplyGabarito.disabled = false;
        btnApplyGabarito.textContent = '⚡ Aplicar na Prova';
      }
    });
  }

  // MUDANÇA DE IA ATIVA NO SELETOR PRINCIPAL
  aiSelect.addEventListener('change', async (e) => {
    currentProvider = e.target.value;
    currentModel = PROVIDERS_CONFIG[currentProvider]?.defaultModel;
    setSaved('active_provider', currentProvider);
    setSaved('active_model', currentModel);

    // Sincroniza o painel de chave para o provedor selecionado
    configTargetProvider = currentProvider;
    targetSelect.value = currentProvider;
    keyInput.value = getApiKeyFor(currentProvider);

    renderModelOptions(currentProvider, currentModel);
    updateFooterLabel();
    log(`IA ativa alterada para: ${PROVIDERS_CONFIG[currentProvider]?.name}`, 'success');
    await refreshDynamicModelsFromAPI(currentProvider, true);
  });

  // MUDANÇA DE ALVO NO PAINEL DE CHAVES
  targetSelect.addEventListener('change', (e) => {
    configTargetProvider = e.target.value;
    setSaved('config_target_provider', configTargetProvider);
    keyInput.value = getApiKeyFor(configTargetProvider);
  });

  // MUDANÇA MANUAL DE MODELO (DEFINIÇÃO INSTANTÂNEA)
  modelSelect.addEventListener('change', (e) => {
    currentModel = e.target.value;
    setSaved('active_model', currentModel);
    updateFooterLabel();
    log(`🎯 Modelo ativo definido para: ${currentModel}`, 'success');
  });

  // BOTÃO ATUALIZAR MODELOS AO VIVO
  if (btnRefreshModels) {
    btnRefreshModels.addEventListener('click', async (e) => {
      e.preventDefault();
      btnRefreshModels.disabled = true;
      btnRefreshModels.textContent = '⏳ Buscando...';
      await refreshDynamicModelsFromAPI(currentProvider, true);
      btnRefreshModels.disabled = false;
      btnRefreshModels.innerHTML = '<span>🔄</span> Sincronizar';
    });
  }

  // BOTÃO DE TESTAR & SALVAR CHAVE (TESTE LIVE COM MODELO ESPECÍFICO)
  btnSaveKey.addEventListener('click', async () => {
    const p = configTargetProvider;
    const val = keyInput.value.trim();
    const pName = PROVIDERS_CONFIG[p]?.name || p;
    const selectedModelFromDom = document.getElementById('box-model-select')?.value;
    const targetModelToTest = (p === currentProvider && selectedModelFromDom ? selectedModelFromDom : null) || currentModel || PROVIDERS_CONFIG[p]?.defaultModel;

    if (!val && p !== 'ollama') {
      setApiKeyFor(p, '');
      setSaved(`status_${p}`, 'error');
      renderProviderOptions();
      log(`Chave do ${pName} removida.`, 'warning');
      return;
    }

    btnSaveKey.disabled = true;
    btnSaveKey.textContent = '⏳ Testando...';
    log(`Testando chave de ${pName} (com modelo ${targetModelToTest})...`, 'info');

    try {
      const testRes = await testProviderKey(p, val || 'http://localhost:11434', targetModelToTest);
      setApiKeyFor(p, val || (p === 'ollama' ? 'http://localhost:11434' : ''));
      setSaved('active_provider', p);
      currentProvider = p;

      // Puxa lista real de modelos retornada pela API
      const dynamicModels = await fetchLiveModels(p, val, showPaidModels);
      if (testRes.model) {
        currentModel = testRes.model;
      } else if (dynamicModels.length > 0 && !dynamicModels.some(m => m.id === currentModel)) {
        currentModel = dynamicModels[0]?.id || PROVIDERS_CONFIG[p]?.defaultModel;
      }
      setSaved('active_model', currentModel);

      renderProviderOptions();
      if (testRes.warning) {
        log(`⚠️ ${testRes.warning}`, 'warning');
      }
      log(`✅ [Live] ${pName} configurado com sucesso e ativo! (Modelo: ${currentModel}) 🟢`, 'success');
    } catch (err) {
      log(`❌ Falha no teste do ${pName}: ${err.message}`, 'error');
    } finally {
      btnSaveKey.disabled = false;
      btnSaveKey.textContent = '🧪 Salvar';
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
