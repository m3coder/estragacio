document.addEventListener('DOMContentLoaded', async () => {
  const PROVIDERS = {
    groq: {
      name: "Groq (Ultra Rápido)",
      defaultModel: "llama-3.3-70b-versatile",
      models: [
        { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (Excelente)" },
        { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 Distill 70B" }
      ]
    },
    mistral: {
      name: "Mistral AI",
      defaultModel: "mistral-large-latest",
      models: [
        { id: "mistral-large-latest", name: "Mistral Large (Mais Preciso)" },
        { id: "mistral-small-latest", name: "Mistral Small (Rápido)" },
        { id: "codestral-latest", name: "Codestral" }
      ]
    },
    gemini: {
      name: "Google Gemini",
      defaultModel: "gemini-flash-latest",
      models: [
        { id: "gemini-flash-latest", name: "Gemini Flash Latest (Recomendado & Grátis)" },
        { id: "gemini-pro-latest", name: "Gemini Pro Latest (Alta Precisão)" },
        { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" }
      ]
    },
    openai: {
      name: "OpenAI (ChatGPT)",
      defaultModel: "gpt-4o",
      models: [
        { id: "gpt-4o", name: "GPT-4o (Precisão Máxima)" },
        { id: "gpt-4o-mini", name: "GPT-4o Mini (Rápido)" },
        { id: "o3-mini", name: "o3-mini (Raciocínio Lógico)" }
      ]
    },
    deepseek: {
      name: "DeepSeek",
      defaultModel: "deepseek-chat",
      models: [
        { id: "deepseek-chat", name: "DeepSeek V3" },
        { id: "deepseek-reasoner", name: "DeepSeek R1 (Raciocínio)" }
      ]
    },
    custom: {
      name: "MimoCode / Custom (Xiaomi)",
      defaultModel: "default",
      models: [{ id: "default", name: "Modelo Padrão" }]
    }
  };

  const providerSelect = document.getElementById('provider');
  const modelSelect = document.getElementById('modelSelect');
  const modelCustom = document.getElementById('modelCustom');
  const endpointGroup = document.getElementById('endpointGroup');
  const endpointInput = document.getElementById('endpointInput');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const statusMsg = document.getElementById('statusMessage');
  const statusBadge = document.getElementById('statusBadge');
  const toggleAllKeysBtn = document.getElementById('toggleAllKeysBtn');
  const allKeysPanel = document.getElementById('allKeysPanel');

  const keyMistral = document.getElementById('keyMistral');
  const keyGroq = document.getElementById('keyGroq');
  const keyGemini = document.getElementById('keyGemini');
  const keyOpenAI = document.getElementById('keyOpenAI');
  const keyDeepSeek = document.getElementById('keyDeepSeek');

  const settings = await chrome.storage.sync.get(['provider', 'model', 'apiKey', 'endpoint', 'apiKeys']);
  let apiKeys = settings.apiKeys || {
    groq: '',
    mistral: '',
    gemini: '',
    openai: '',
    deepseek: '',
    custom: ''
  };

  function syncKeysToInputs() {
    keyMistral.value = apiKeys.mistral || '';
    keyGroq.value = apiKeys.groq || '';
    keyGemini.value = apiKeys.gemini || '';
    keyOpenAI.value = apiKeys.openai || '';
    keyDeepSeek.value = apiKeys.deepseek || '';

    const currentP = providerSelect.value;
    apiKeyInput.value = apiKeys[currentP] || '';
  }

  function renderModels(providerKey, selectedModelId) {
    modelSelect.innerHTML = '';
    const p = PROVIDERS[providerKey];
    if (!p) return;

    if (providerKey === 'custom') {
      modelSelect.classList.add('hidden');
      modelCustom.classList.remove('hidden');
      modelCustom.value = selectedModelId || 'default';
      endpointGroup.classList.remove('hidden');
    } else {
      modelSelect.classList.remove('hidden');
      modelCustom.classList.add('hidden');
      endpointGroup.classList.add('hidden');

      p.models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.name;
        if (m.id === selectedModelId) opt.selected = true;
        modelSelect.appendChild(opt);
      });
    }

    apiKeyInput.value = apiKeys[providerKey] || '';
  }

  const currentProvider = settings.provider || 'groq';
  providerSelect.value = currentProvider;
  renderModels(currentProvider, settings.model || PROVIDERS[currentProvider]?.defaultModel);
  syncKeysToInputs();
  if (settings.endpoint) endpointInput.value = settings.endpoint;

  providerSelect.addEventListener('change', () => {
    const pKey = providerSelect.value;
    renderModels(pKey, PROVIDERS[pKey]?.defaultModel);
  });

  apiKeyInput.addEventListener('input', () => {
    const pKey = providerSelect.value;
    apiKeys[pKey] = apiKeyInput.value.trim();
    syncKeysToInputs();
  });

  toggleAllKeysBtn.addEventListener('click', () => {
    allKeysPanel.classList.toggle('hidden');
    toggleAllKeysBtn.textContent = allKeysPanel.classList.contains('hidden') ? '🔑 Ver Todas as Chaves' : '🔼 Ocultar Painel';
  });

  [keyMistral, keyGroq, keyGemini, keyOpenAI, keyDeepSeek].forEach(inp => {
    inp.addEventListener('input', () => {
      apiKeys.mistral = keyMistral.value.trim();
      apiKeys.groq = keyGroq.value.trim();
      apiKeys.gemini = keyGemini.value.trim();
      apiKeys.openai = keyOpenAI.value.trim();
      apiKeys.deepseek = keyDeepSeek.value.trim();
      apiKeyInput.value = apiKeys[providerSelect.value] || '';
    });
  });

  function showMessage(text, isError = false) {
    statusMsg.textContent = text;
    statusMsg.className = `status-msg ${isError ? 'error' : 'success'}`;
    statusMsg.classList.remove('hidden');
    setTimeout(() => statusMsg.classList.add('hidden'), 5000);
  }

  saveBtn.addEventListener('click', async () => {
    const pKey = providerSelect.value;
    const modelVal = pKey === 'custom' ? modelCustom.value.trim() : modelSelect.value;
    const activeKey = apiKeyInput.value.trim();

    apiKeys[pKey] = activeKey;

    await chrome.storage.sync.set({
      provider: pKey,
      model: modelVal,
      apiKey: activeKey,
      apiKeys: apiKeys,
      endpoint: endpointInput.value.trim()
    });

    showMessage(`Salvo com sucesso! Provedor Ativo: ${PROVIDERS[pKey]?.name} (${modelVal})`);
  });

  testBtn.addEventListener('click', async () => {
    statusBadge.textContent = 'Testando...';
    testBtn.disabled = true;

    const pKey = providerSelect.value;
    const modelVal = pKey === 'custom' ? modelCustom.value.trim() : modelSelect.value;
    const apiKey = apiKeyInput.value.trim() || apiKeys[pKey];

    if (!apiKey) {
      showMessage('Insira a chave da API deste provedor.', true);
      statusBadge.textContent = 'Sem Chave';
      testBtn.disabled = false;
      return;
    }

    try {
      if (pKey === 'gemini') {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelVal}:generateContent`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey
          },
          body: JSON.stringify({ contents: [{ parts: [{ text: "Responda apenas OK" }] }] })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || `HTTP ${res.status}`);
        }
      } else {
        let endpoint = '';
        if (pKey === 'openai') endpoint = 'https://api.openai.com/v1/chat/completions';
        else if (pKey === 'deepseek') endpoint = 'https://api.deepseek.com/v1/chat/completions';
        else if (pKey === 'groq') endpoint = 'https://api.groq.com/openai/v1/chat/completions';
        else if (pKey === 'mistral') endpoint = 'https://api.mistral.ai/v1/chat/completions';
        else endpoint = endpointInput.value.trim();

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: modelVal,
            messages: [{ role: 'user', content: 'Responda apenas OK' }],
            max_tokens: 10
          })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || `HTTP ${res.status}`);
        }
      }

      showMessage(`Conexão OK com ${PROVIDERS[pKey]?.name}!`);
      statusBadge.textContent = 'Ativo';
    } catch (err) {
      showMessage(`Falha na conexão: ${err.message}`, true);
      statusBadge.textContent = 'Erro';
    } finally {
      testBtn.disabled = false;
    }
  });
});
