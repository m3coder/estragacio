// Popup Script - Sincronização Unificada com In-Page Widget e Teste Live de Modelos

document.addEventListener('DOMContentLoaded', async () => {
  const PROVIDERS = {
    groq: {
      name: "Groq (Ultra Rápido)",
      defaultModel: "llama-3.3-70b-versatile",
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      models: [
        { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (Excelente)" },
        { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 Distill 70B" }
      ]
    },
    claude: {
      name: "Anthropic Claude",
      defaultModel: "claude-3-7-sonnet-20250219",
      endpoint: "https://api.anthropic.com/v1/messages",
      models: [
        { id: "claude-3-7-sonnet-20250219", name: "Claude 3.7 Sonnet" },
        { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
        { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku" }
      ]
    },
    mistral: {
      name: "Mistral AI",
      defaultModel: "mistral-large-latest",
      endpoint: "https://api.mistral.ai/v1/chat/completions",
      models: [
        { id: "mistral-large-latest", name: "Mistral Large (PhD)" },
        { id: "codestral-latest", name: "Codestral" },
        { id: "mistral-small-latest", name: "Mistral Small" }
      ]
    },
    gemini: {
      name: "Google Gemini",
      defaultModel: "gemini-flash-latest",
      endpoint: "https://generativelanguage.googleapis.com/v1beta/models",
      models: [
        { id: "gemini-flash-latest", name: "Gemini Flash Latest" },
        { id: "gemini-pro-latest", name: "Gemini Pro Latest" },
        { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" }
      ]
    },
    openai: {
      name: "OpenAI (ChatGPT)",
      defaultModel: "gpt-4o",
      endpoint: "https://api.openai.com/v1/chat/completions",
      models: [
        { id: "gpt-4o", name: "GPT-4o (Precisão Máxima)" },
        { id: "gpt-4o-mini", name: "GPT-4o Mini" },
        { id: "o3-mini", name: "o3-mini (Raciocínio)" }
      ]
    },
    deepseek: {
      name: "DeepSeek",
      defaultModel: "deepseek-chat",
      endpoint: "https://api.deepseek.com/v1/chat/completions",
      models: [
        { id: "deepseek-chat", name: "DeepSeek V3" },
        { id: "deepseek-reasoner", name: "DeepSeek R1" }
      ]
    }
  };

  const providerSelect = document.getElementById('provider');
  const modelSelect = document.getElementById('modelSelect');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const statusMsg = document.getElementById('statusMessage');
  const statusBadge = document.getElementById('statusBadge');
  const toggleAllKeysBtn = document.getElementById('toggleAllKeysBtn');
  const allKeysPanel = document.getElementById('allKeysPanel');

  const keyGroq = document.getElementById('keyGroq');
  const keyClaude = document.getElementById('keyClaude');
  const keyMistral = document.getElementById('keyMistral');
  const keyGemini = document.getElementById('keyGemini');
  const keyOpenAI = document.getElementById('keyOpenAI');
  const keyDeepSeek = document.getElementById('keyDeepSeek');

  // Carrega configurações de chrome.storage.local ou fallback para localStorage
  async function loadStorageSettings() {
    let data = {};
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      data = await chrome.storage.local.get(null) || {};
    }

    const provider = data.estacio_active_provider || localStorage.getItem('estacio_active_provider') || 'groq';
    const model = data.estacio_active_model || localStorage.getItem('estacio_active_model') || PROVIDERS[provider]?.defaultModel;

    const keys = {
      groq: data.estacio_key_groq || localStorage.getItem('estacio_key_groq') || '',
      claude: data.estacio_key_claude || localStorage.getItem('estacio_key_claude') || '',
      mistral: data.estacio_key_mistral || localStorage.getItem('estacio_key_mistral') || '',
      gemini: data.estacio_key_gemini || localStorage.getItem('estacio_key_gemini') || '',
      openai: data.estacio_key_openai || localStorage.getItem('estacio_key_openai') || '',
      deepseek: data.estacio_key_deepseek || localStorage.getItem('estacio_key_deepseek') || ''
    };

    return { provider, model, keys };
  }

  async function saveStorageSettings(provider, model, keys) {
    const payload = {
      estacio_active_provider: provider,
      estacio_active_model: model,
      estacio_key_groq: keys.groq || '',
      estacio_key_claude: keys.claude || '',
      estacio_key_mistral: keys.mistral || '',
      estacio_key_gemini: keys.gemini || '',
      estacio_key_openai: keys.openai || '',
      estacio_key_deepseek: keys.deepseek || ''
    };

    // Salva em localStorage e chrome.storage.local para sincronização total
    Object.keys(payload).forEach(k => {
      localStorage.setItem(k, payload[k]);
    });

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set(payload);
    }
  }

  const { provider: initialProvider, model: initialModel, keys: initialKeys } = await loadStorageSettings();

  providerSelect.value = initialProvider;
  syncKeysToInputs(initialKeys);
  renderModels(initialProvider, initialModel);

  function syncKeysToInputs(keys) {
    keyGroq.value = keys.groq || '';
    keyClaude.value = keys.claude || '';
    keyMistral.value = keys.mistral || '';
    keyGemini.value = keys.gemini || '';
    keyOpenAI.value = keys.openai || '';
    keyDeepSeek.value = keys.deepseek || '';

    const currentP = providerSelect.value;
    apiKeyInput.value = keys[currentP] || '';
  }

  function getKeysFromInputs() {
    return {
      groq: keyGroq.value.trim(),
      claude: keyClaude.value.trim(),
      mistral: keyMistral.value.trim(),
      gemini: keyGemini.value.trim(),
      openai: keyOpenAI.value.trim(),
      deepseek: keyDeepSeek.value.trim()
    };
  }

  function renderModels(providerKey, selectedModelId) {
    modelSelect.innerHTML = '';
    const p = PROVIDERS[providerKey];
    if (!p) return;

    p.models.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.name;
      if (m.id === selectedModelId) opt.selected = true;
      modelSelect.appendChild(opt);
    });
  }

  providerSelect.addEventListener('change', () => {
    const currentP = providerSelect.value;
    const currentKeys = getKeysFromInputs();
    apiKeyInput.value = currentKeys[currentP] || '';
    renderModels(currentP, PROVIDERS[currentP]?.defaultModel);
  });

  apiKeyInput.addEventListener('input', () => {
    const currentP = providerSelect.value;
    const val = apiKeyInput.value.trim();
    if (currentP === 'groq') keyGroq.value = val;
    if (currentP === 'claude') keyClaude.value = val;
    if (currentP === 'mistral') keyMistral.value = val;
    if (currentP === 'gemini') keyGemini.value = val;
    if (currentP === 'openai') keyOpenAI.value = val;
    if (currentP === 'deepseek') keyDeepSeek.value = val;
  });

  toggleAllKeysBtn.addEventListener('click', (e) => {
    e.preventDefault();
    allKeysPanel.classList.toggle('hidden');
    toggleAllKeysBtn.textContent = allKeysPanel.classList.contains('hidden') ? '🔑 Ver Todas as Chaves' : '🔼 Ocultar Chaves';
  });

  saveBtn.addEventListener('click', async () => {
    const currentP = providerSelect.value;
    const currentM = modelSelect.value;
    const currentKeys = getKeysFromInputs();

    await saveStorageSettings(currentP, currentM, currentKeys);

    statusBadge.textContent = 'Salvo';
    statusBadge.style.background = '#10b981';
    statusMsg.className = 'status-msg success';
    statusMsg.textContent = '✅ Configurações salvas e sincronizadas com a página!';
    statusMsg.classList.remove('hidden');

    setTimeout(() => {
      statusBadge.textContent = 'Pronto';
      statusBadge.style.background = '';
      statusMsg.classList.add('hidden');
    }, 3000);
  });

  testBtn.addEventListener('click', async () => {
    const currentP = providerSelect.value;
    const currentKeys = getKeysFromInputs();
    const currentKey = currentKeys[currentP];
    const currentM = modelSelect.value;

    if (!currentKey) {
      statusMsg.className = 'status-msg error';
      statusMsg.textContent = `❌ Insira a chave para ${PROVIDERS[currentP]?.name} antes de testar.`;
      statusMsg.classList.remove('hidden');
      return;
    }

    testBtn.disabled = true;
    testBtn.textContent = 'Testando...';
    statusMsg.className = 'status-msg info';
    statusMsg.textContent = `📡 Enviando requisição de teste para ${PROVIDERS[currentP]?.name}...`;
    statusMsg.classList.remove('hidden');

    try {
      let isSuccess = false;
      const testPrompt = "Responda em JSON: {\"letra\": \"A\", \"explicacao\": \"OK\"}";

      if (currentP === 'claude') {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': currentKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({
            model: currentM || 'claude-3-7-sonnet-20250219',
            max_tokens: 100,
            messages: [{ role: 'user', content: testPrompt }]
          })
        });
        isSuccess = res.ok;
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || `HTTP ${res.status}`);
        }
      } else if (currentP === 'gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${currentM || 'gemini-flash-latest'}:generateContent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': currentKey
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: testPrompt }] }]
          })
        });
        isSuccess = res.ok;
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || `HTTP ${res.status}`);
        }
      } else {
        const endpoint = PROVIDERS[currentP]?.endpoint;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentKey}`
          },
          body: JSON.stringify({
            model: currentM,
            messages: [{ role: 'user', content: testPrompt }]
          })
        });
        isSuccess = res.ok;
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || `HTTP ${res.status}`);
        }
      }

      if (isSuccess) {
        localStorage.setItem(`estacio_status_${currentP}`, 'live');
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          await chrome.storage.local.set({ [`estacio_status_${currentP}`]: 'live' });
        }

        statusBadge.textContent = 'Live 🟢';
        statusBadge.style.background = '#10b981';
        statusMsg.className = 'status-msg success';
        statusMsg.textContent = `🎉 Conexão estabelecida com sucesso com ${PROVIDERS[currentP]?.name}!`;
      }
    } catch (err) {
      statusBadge.textContent = 'Erro';
      statusBadge.style.background = '#ef4444';
      statusMsg.className = 'status-msg error';
      statusMsg.textContent = `❌ Falha na conexão: ${err.message}`;
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = 'Testar Conexão Live';
    }
  });
});
