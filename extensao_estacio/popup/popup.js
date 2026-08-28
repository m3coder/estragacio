// Popup Script - Sincronização Unificada com In-Page Widget e Busca Dinâmica de Modelos da API com Filtro Free/Paid

document.addEventListener('DOMContentLoaded', async () => {
  const PROVIDERS = {
    groq: {
      name: "Groq (Ultra Rápido)",
      defaultModel: "llama-3.3-70b-versatile",
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      modelsEndpoint: "https://api.groq.com/openai/v1/models",
      models: [
        { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (🔥 100% Grátis • 14.4k req/dia • Recomendado)", isFree: true },
        { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 Distill 70B (🔥 100% Grátis • Raciocínio)", isFree: true },
        { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (⚡ 100% Grátis • Ultra Rápido)", isFree: true }
      ]
    },
    gemini: {
      name: "Google Gemini",
      defaultModel: "gemini-2.5-flash",
      endpoint: "https://generativelanguage.googleapis.com/v1beta/models",
      modelsEndpoint: "https://generativelanguage.googleapis.com/v1beta/models",
      models: [
        { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash (🎁 Grátis • Raciocínio & Rapidez • Recomendado)", isFree: true },
        { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (⚡ Grátis 1.500 req/dia • Mais Rápido)", isFree: true },
        { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (🎁 Grátis 1.500 req/dia • Estável)", isFree: true },
        { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (🧠 Grátis Cota Diária • Máximo Raciocínio)", isFree: true },
        { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash-Lite (⚡ Grátis • Ultra Rápido)", isFree: true },
        { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro (💎 Pago • Frontier Reasoning)", isFree: false }
      ]
    },
    nous: {
      name: "Nous Research / Portal",
      defaultModel: "poolside/laguna-s-2.1:free",
      endpoint: "https://inference-api.nousresearch.com/v1/chat/completions",
      modelsEndpoint: "https://inference-api.nousresearch.com/v1/models",
      models: [
        { id: "poolside/laguna-s-2.1:free", name: "Poolside Laguna S 2.1 (🔥 100% Grátis • 118B Coding • Recomendado)", isFree: true },
        { id: "meituan/longcat-2.0:free", name: "Meituan LongCat 2.0 (🔥 100% Grátis • 1.6T MoE / 1M Context)", isFree: true },
        { id: "tencent/hy3:free", name: "Tencent Hy3 (🔥 100% Grátis • 295B MoE)", isFree: true },
        { id: "stepfun/step-3.7-flash:free", name: "StepFun Step 3.7 Flash (🔥 100% Grátis • Ultra Rápido)", isFree: true },
        { id: "upstage/solar-pro4:free", name: "Upstage Solar Pro 4 (🔥 100% Grátis • Raciocínio)", isFree: true },
        { id: "poolside/laguna-xs-2.1:free", name: "Poolside Laguna XS 2.1 (🔥 100% Grátis • Leve)", isFree: true }
      ]
    },
    openrouter: {
      name: "OpenRouter (Free Router / Modelos Free)",
      defaultModel: "openrouter/free",
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      modelsEndpoint: "https://openrouter.ai/api/v1/models",
      models: [
        { id: "openrouter/free", name: "OpenRouter Free Router (🔥 100% Grátis • Roteamento Automático)", isFree: true },
        { id: "google/gemma-4-31b-it:free", name: "Google Gemma 4 31B (🔥 100% Grátis)", isFree: true },
        { id: "google/gemma-4-26b-a4b-it:free", name: "Google Gemma 4 26B (🔥 100% Grátis)", isFree: true },
        { id: "nvidia/nemotron-3-ultra-550b-a55b:free", name: "NVIDIA Nemotron 3 Ultra (🔥 100% Grátis)", isFree: true },
        { id: "minimax/minimax-m3:free", name: "MiniMax M3 (🔥 100% Grátis)", isFree: true },
        { id: "z-ai/glm-5.2:free", name: "GLM 5.2 (🔥 100% Grátis)", isFree: true },
        { id: "liquid/lfm-2.5-2.6b:free", name: "Liquid LFM 2.5 (🔥 100% Grátis)", isFree: true }
      ]
    },
    ollama: {
      name: "Ollama (Local / Offline)",
      defaultModel: "llama3.3",
      endpoint: "http://localhost:11434/v1/chat/completions",
      modelsEndpoint: "http://localhost:11434/v1/models",
      models: [
        { id: "llama3.3", name: "Llama 3.3 (Local • Offline • Ilimitado)", isFree: true },
        { id: "deepseek-r1", name: "DeepSeek R1 (Local • Raciocínio)", isFree: true },
        { id: "hermes3", name: "Hermes 3 (Local • Nous Research)", isFree: true },
        { id: "qwen2.5", name: "Qwen 2.5 (Local)", isFree: true },
        { id: "mistral", name: "Mistral (Local)", isFree: true }
      ]
    },
    mistral: {
      name: "Mistral AI",
      defaultModel: "codestral-latest",
      endpoint: "https://api.mistral.ai/v1/chat/completions",
      modelsEndpoint: "https://api.mistral.ai/v1/models",
      models: [
        { id: "codestral-latest", name: "Codestral Latest (💡 Grátis Dev / Lógica Exata)", isFree: true },
        { id: "mistral-small-latest", name: "Mistral Small Latest (⚡ Econômico & Rápido)", isFree: true },
        { id: "mistral-large-latest", name: "Mistral Large Latest (💎 Pago • PhD / Máxima Precisão)", isFree: false }
      ]
    },
    claude: {
      name: "Anthropic Claude",
      defaultModel: "claude-3-7-sonnet-20250219",
      endpoint: "https://api.anthropic.com/v1/messages",
      modelsEndpoint: "https://api.anthropic.com/v1/models",
      models: [
        { id: "claude-3-7-sonnet-20250219", name: "Claude 3.7 Sonnet (💎 Pago • Raciocínio Híbrido)", isFree: false },
        { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet (💎 Pago • Alta Precisão)", isFree: false },
        { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku (💎 Pago • Ultra Rápido & Econômico)", isFree: false },
        { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku (💎 Pago • Econômico)", isFree: false },
        { id: "claude-3-opus-20240229", name: "Claude 3 Opus (💎 Pago • Frontier PhD)", isFree: false }
      ]
    },
    openai: {
      name: "OpenAI (ChatGPT)",
      defaultModel: "gpt-4o-mini",
      endpoint: "https://api.openai.com/v1/chat/completions",
      modelsEndpoint: "https://api.openai.com/v1/models",
      models: [
        { id: "gpt-4o-mini", name: "GPT-4o Mini (💎 Pago • Econômico)", isFree: false },
        { id: "gpt-4o", name: "GPT-4o (💎 Pago • Precisão Máxima)", isFree: false },
        { id: "o3-mini", name: "o3-mini (💎 Pago • Raciocínio)", isFree: false }
      ]
    },
    deepseek: {
      name: "DeepSeek",
      defaultModel: "deepseek-chat",
      endpoint: "https://api.deepseek.com/v1/chat/completions",
      modelsEndpoint: "https://api.deepseek.com/models",
      models: [
        { id: "deepseek-chat", name: "DeepSeek V3 (💎 Pago • Econômico)", isFree: false },
        { id: "deepseek-reasoner", name: "DeepSeek R1 (💎 Pago • Raciocínio Puro)", isFree: false }
      ]
    }
  };

  const providerSelect = document.getElementById('provider');
  const modelSelect = document.getElementById('modelSelect');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const refreshModelsBtn = document.getElementById('refreshModelsBtn');
  const toggleFreeModeBtn = document.getElementById('toggleFreeModeBtn');
  const modelLoadingNotice = document.getElementById('modelLoadingNotice');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const statusMsg = document.getElementById('statusMessage');
  const statusBadge = document.getElementById('statusBadge');
  const toggleAllKeysBtn = document.getElementById('toggleAllKeysBtn');
  const allKeysPanel = document.getElementById('allKeysPanel');

  const keyGroq = document.getElementById('keyGroq');
  const keyGemini = document.getElementById('keyGemini');
  const keyNous = document.getElementById('keyNous');
  const keyOpenRouter = document.getElementById('keyOpenRouter');
  const keyOllama = document.getElementById('keyOllama');
  const keyMistral = document.getElementById('keyMistral');
  const keyClaude = document.getElementById('keyClaude');
  const keyOpenAI = document.getElementById('keyOpenAI');
  const keyDeepSeek = document.getElementById('keyDeepSeek');

  let showPaidModels = false;

  function updateToggleBtnState() {
    if (!toggleFreeModeBtn) return;
    if (showPaidModels) {
      toggleFreeModeBtn.textContent = '💎 Free + Pagos';
      toggleFreeModeBtn.style.background = '#701a75';
      toggleFreeModeBtn.style.color = '#f5d0fe';
      toggleFreeModeBtn.style.borderColor = '#a21caf';
    } else {
      toggleFreeModeBtn.textContent = '🟢 Apenas Free';
      toggleFreeModeBtn.style.background = '#065f46';
      toggleFreeModeBtn.style.color = '#a7f3d0';
      toggleFreeModeBtn.style.borderColor = '#059669';
    }
  }

  function formatDisplayName(provider, modelItem) {
    const modelId = typeof modelItem === 'string' ? modelItem : (modelItem.id || '');
    const rawName = typeof modelItem === 'object' ? (modelItem.display_name || modelItem.name || modelItem.displayName || '') : '';

    if (provider === 'groq') {
      if (modelId.includes('llama-3.3-70b')) return 'Llama 3.3 70B (🔥 100% Grátis • 14.4k req/dia • Recomendado)';
      if (modelId.includes('deepseek-r1-distill-llama-70b')) return 'DeepSeek R1 Distill 70B (🔥 100% Grátis • Raciocínio)';
      if (modelId.includes('llama-3.1-8b')) return 'Llama 3.1 8B (⚡ 100% Grátis • Ultra Rápido)';
      if (modelId.includes('qwen')) return `Qwen (${modelId}) (🔥 100% Grátis)`;
      if (modelId.includes('gpt-oss-120b')) return 'GPT-OSS 120B (🔥 100% Grátis)';
      if (modelId.includes('gpt-oss-20b')) return 'GPT-OSS 20B (🔥 100% Grátis)';
      if (modelId.includes('compound')) return `Groq Compound (${modelId}) (🔥 100% Grátis)`;
    } else if (provider === 'gemini') {
      if (modelId.includes('gemini-2.5-flash')) return 'Gemini 2.5 Flash (🎁 Grátis • Raciocínio & Rapidez • Recomendado)';
      if (modelId.includes('gemini-2.0-flash')) return 'Gemini 2.0 Flash (⚡ Grátis 1.500 req/dia • Mais Rápido)';
      if (modelId.includes('gemini-1.5-flash')) return 'Gemini 1.5 Flash (🎁 Grátis 1.500 req/dia • Estável)';
      if (modelId.includes('gemini-1.5-pro')) return 'Gemini 1.5 Pro (🧠 Grátis Cota Diária • Máximo Raciocínio)';
      if (modelId.includes('gemini-2.0-flash-lite')) return 'Gemini 2.0 Flash-Lite (⚡ Grátis • Ultra Rápido)';
      if (modelId.includes('gemini-2.5-pro')) return 'Gemini 2.5 Pro (💎 Pago • Frontier Reasoning)';
      if (modelId.includes('gemini-flash-latest')) return 'Gemini Flash Latest (🎁 Grátis AI Studio)';
      if (modelId.includes('gemini-pro-latest')) return 'Gemini Pro Latest (💎 Pago AI Studio)';
    } else if (provider === 'nous') {
      const isFree = /hy3|longcat|solar|step|laguna/i.test(modelId) || /hy3|longcat|solar|step|laguna/i.test(rawName);
      const freeBadge = isFree ? ' (🔥 100% Grátis)' : ' (💎 Pago)';
      if (modelId === 'poolside/laguna-s-2.1:free') return 'Poolside Laguna S 2.1 (🔥 100% Grátis • 118B Coding • Recomendado)';
      if (modelId === 'poolside/laguna-xs-2.1:free') return 'Poolside Laguna XS 2.1 (🔥 100% Grátis • Leve)';
      if (modelId === 'meituan/longcat-2.0:free') return 'Meituan LongCat 2.0 (🔥 100% Grátis • 1.6T MoE / 1M Context)';
      if (modelId === 'tencent/hy3:free') return 'Tencent Hy3 (🔥 100% Grátis • 295B MoE)';
      if (modelId === 'stepfun/step-3.7-flash:free') return 'StepFun Step 3.7 Flash (🔥 100% Grátis • Ultra Rápido)';
      if (modelId === 'upstage/solar-pro4:free') return 'Upstage Solar Pro 4 (🔥 100% Grátis • Raciocínio)';
      if (rawName && rawName !== modelId) return `${rawName}${freeBadge}`;
      return `${modelId}${freeBadge}`;
    } else if (provider === 'openrouter') {
      const isFree = modelId === 'openrouter/free' || modelId.includes(':free');
      const freeBadge = isFree ? ' (🔥 100% Grátis)' : ' (💎 Pago)';
      if (modelId === 'openrouter/free') return 'OpenRouter Free Router (🔥 100% Grátis • Roteamento Automático)';
      if (modelId.includes('gemma-4-31b')) return 'Google Gemma 4 31B (🔥 100% Grátis)';
      if (modelId.includes('gemma-4-26b')) return 'Google Gemma 4 26B (🔥 100% Grátis)';
      if (modelId.includes('nemotron-3-ultra')) return 'NVIDIA Nemotron 3 Ultra (🔥 100% Grátis)';
      if (modelId.includes('minimax-m3')) return 'MiniMax M3 (🔥 100% Grátis)';
      if (modelId.includes('glm-5.2')) return 'GLM 5.2 (🔥 100% Grátis)';
      if (modelId.includes('lfm-2.5')) return 'Liquid LFM 2.5 (🔥 100% Grátis)';
      if (modelId.includes('llama-3.3-70b-instruct:free')) return `Llama 3.3 70B Instruct (🔥 100% Grátis)`;
      if (modelId.includes('deepseek-r1:free')) return `DeepSeek R1 (🔥 100% Grátis)`;
      if (modelId.includes('gemini-2.0-flash-exp:free')) return `Gemini 2.0 Flash Exp (🔥 100% Grátis)`;
      if (modelId.includes('qwen-2.5-72b-instruct:free')) return `Qwen 2.5 72B (🔥 100% Grátis)`;
      if (rawName && rawName !== modelId) return `${rawName}${freeBadge}`;
      return `${modelId}${freeBadge}`;
    } else if (provider === 'ollama') {
      if (modelId.includes('hermes')) return `Hermes (${modelId}) (Local • Nous Research)`;
      if (modelId.includes('llama3.3') || modelId.includes('llama-3.3')) return `Llama 3.3 (${modelId}) (Local • Ilimitado)`;
      if (modelId.includes('deepseek-r1')) return `DeepSeek R1 (${modelId}) (Local • Raciocínio)`;
      if (modelId.includes('qwen')) return `Qwen (${modelId}) (Local)`;
      if (rawName && rawName !== modelId) return `${rawName} (${modelId}) (Local • Offline)`;
      return `${modelId} (Local • Offline)`;
    } else if (provider === 'mistral') {
      let suffix = '';
      if (modelItem?.capabilities?.reasoning) suffix = ' (🧠 Raciocínio)';
      else if (modelItem?.capabilities?.vision) suffix = ' (👁️ Visão)';

      if (modelId === 'codestral-latest') return `Codestral Latest (💡 Grátis Dev / Lógica Exata)${suffix}`;
      if (modelId === 'mistral-small-latest') return `Mistral Small Latest (⚡ Econômico & Rápido)${suffix}`;
      if (modelId === 'mistral-large-latest') return `Mistral Large Latest (💎 Pago • PhD / Máxima Precisão)${suffix}`;
    } else if (provider === 'claude') {
      let suffix = '';
      if (modelItem?.capabilities?.thinking?.supported) suffix = ' (🧠 Thinking)';
      if (modelId.includes('claude-3-7-sonnet')) return `Claude 3.7 Sonnet (💎 Pago • Raciocínio Híbrido)${suffix}`;
      if (modelId.includes('claude-3-5-sonnet')) return `Claude 3.5 Sonnet (💎 Pago • Alta Precisão)${suffix}`;
      if (modelId.includes('claude-3-5-haiku')) return `Claude 3.5 Haiku (💎 Pago • Ultra Rápido & Econômico)${suffix}`;
      if (modelId.includes('claude-3-haiku')) return `Claude 3 Haiku (💎 Pago • Econômico)${suffix}`;
      if (modelId.includes('claude-3-opus')) return `Claude 3 Opus (💎 Pago • Frontier PhD)${suffix}`;
    } else if (provider === 'openai') {
      if (modelId === 'gpt-4o-mini') return 'GPT-4o Mini (💎 Pago • Econômico)';
      if (modelId === 'gpt-4o') return 'GPT-4o (💎 Pago • Precisão Máxima)';
      if (modelId === 'o3-mini') return 'o3-mini (💎 Pago • Raciocínio)';
    } else if (provider === 'deepseek') {
      if (modelId === 'deepseek-chat') return 'DeepSeek V3 (💎 Pago • Econômico)';
      if (modelId === 'deepseek-reasoner') return 'DeepSeek R1 (💎 Pago • Raciocínio Puro)';
    }

    if (rawName && rawName !== modelId) return `${rawName} (${modelId})`;
    return modelId;
  }

  // Carrega configurações de chrome.storage.local ou fallback para localStorage
  async function loadStorageSettings() {
    let data = {};
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      data = await chrome.storage.local.get(null) || {};
    }

    const savedProvider = data.estacio_active_provider || localStorage.getItem('estacio_active_provider') || 'groq';
    const savedModel = data.estacio_active_model || localStorage.getItem('estacio_active_model') || PROVIDERS[savedProvider]?.defaultModel || 'llama-3.3-70b-versatile';
    const showPaidSaved = data.estacio_show_paid_models !== undefined ? (data.estacio_show_paid_models === 'true' || data.estacio_show_paid_models === true) : (localStorage.getItem('estacio_show_paid_models') === 'true');
    showPaidModels = showPaidSaved;

    const keys = {
      groq: data.estacio_key_groq || localStorage.getItem('estacio_key_groq') || data.apiKey || localStorage.getItem('apiKey') || '',
      gemini: data.estacio_key_gemini || localStorage.getItem('estacio_key_gemini') || '',
      nous: data.estacio_key_nous || localStorage.getItem('estacio_key_nous') || '',
      openrouter: data.estacio_key_openrouter || localStorage.getItem('estacio_key_openrouter') || '',
      ollama: data.estacio_key_ollama || localStorage.getItem('estacio_key_ollama') || 'http://localhost:11434',
      mistral: data.estacio_key_mistral || localStorage.getItem('estacio_key_mistral') || '',
      claude: data.estacio_key_claude || localStorage.getItem('estacio_key_claude') || '',
      openai: data.estacio_key_openai || localStorage.getItem('estacio_key_openai') || '',
      deepseek: data.estacio_key_deepseek || localStorage.getItem('estacio_key_deepseek') || ''
    };

    return { provider: savedProvider, model: savedModel, keys, data };
  }

  async function saveStorageSettings(provider, model, keys) {
    const toSave = {
      estacio_active_provider: provider,
      estacio_active_model: model,
      estacio_show_paid_models: showPaidModels ? 'true' : 'false',
      estacio_key_groq: keys.groq || '',
      estacio_key_gemini: keys.gemini || '',
      estacio_key_nous: keys.nous || '',
      estacio_key_openrouter: keys.openrouter || '',
      estacio_key_ollama: keys.ollama || 'http://localhost:11434',
      estacio_key_mistral: keys.mistral || '',
      estacio_key_claude: keys.claude || '',
      estacio_key_openai: keys.openai || '',
      estacio_key_deepseek: keys.deepseek || '',
      apiKey: keys.groq || keys[provider] || ''
    };

    Object.keys(toSave).forEach(k => {
      try { localStorage.setItem(k, toSave[k]); } catch (e) {}
    });

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set(toSave);
    }
  }

  async function getCachedModelsFor(providerKey, data = null) {
    const defaultList = PROVIDERS[providerKey]?.models || [];
    try {
      let cached = null;
      if (data && data[`estacio_models_${providerKey}`]) {
        cached = data[`estacio_models_${providerKey}`];
      } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const res = await chrome.storage.local.get([`estacio_models_${providerKey}`]);
        cached = res[`estacio_models_${providerKey}`];
      }

      if (!cached) {
        const localCached = localStorage.getItem(`estacio_models_${providerKey}`);
        if (localCached) cached = JSON.parse(localCached);
      }

      if (Array.isArray(cached) && cached.length > 0) return cached;
    } catch (e) {}
    return defaultList;
  }

  async function saveCachedModelsFor(providerKey, modelsList) {
    try {
      localStorage.setItem(`estacio_models_${providerKey}`, JSON.stringify(modelsList));
      localStorage.setItem(`estacio_models_ts_${providerKey}`, Date.now().toString());
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({
          [`estacio_models_${providerKey}`]: modelsList,
          [`estacio_models_ts_${providerKey}`]: Date.now()
        });
      }
    } catch (e) {}
  }

  async function fetchLiveModelsFromAPI(providerKey, apiKey) {
    if (!apiKey && providerKey !== 'ollama') return getCachedModelsFor(providerKey);

    if (modelLoadingNotice) {
      modelLoadingNotice.style.display = 'block';
    }

    try {
      // 1. Groq
      if (providerKey === 'groq') {
        const res = await fetch('https://api.groq.com/openai/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const json = await res.json();
          const raw = Array.isArray(json) ? json : (json.data || []);
          const filtered = raw
            .filter(m => !/whisper|tts|guard|embeddings|orpheus|safeguard|distilbert/i.test(m.id))
            .map(m => ({ id: m.id, name: formatDisplayName('groq', m), isFree: true }));

          if (filtered.length > 0) {
            await saveCachedModelsFor(providerKey, filtered);
            return filtered;
          }
        }
      }

      // 2. OpenRouter
      if (providerKey === 'openrouter') {
        const res = await fetch('https://openrouter.ai/api/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://estudante.estacio.br',
            'X-Title': 'Estacio Suite AI'
          }
        });
        if (res.ok) {
          const json = await res.json();
          const raw = json.data || [];
          const filtered = raw
            .filter(m => !/audio|whisper|moderation|embedding/i.test(m.id))
            .map(m => {
              const isFree = m.id === 'openrouter/free' || m.id.includes(':free') || (m.pricing && m.pricing.prompt === '0' && m.pricing.completion === '0');
              return {
                id: m.id,
                name: formatDisplayName('openrouter', m),
                isFree: isFree
              };
            });

          filtered.sort((a, b) => {
            if (a.id === 'openrouter/free') return -1;
            if (b.id === 'openrouter/free') return 1;
            if (a.isFree && !b.isFree) return -1;
            if (!a.isFree && b.isFree) return 1;
            if (a.id.includes('gemma-4') && !b.id.includes('gemma-4')) return -1;
            if (a.id.includes('nemotron') && !b.id.includes('nemotron')) return -1;
            return a.id.localeCompare(b.id);
          });

          if (filtered.length > 0) {
            await saveCachedModelsFor(providerKey, filtered);
            return showPaidModels ? filtered : filtered.filter(m => m.isFree);
          }
        }
      }

      // 2b. Nous Research
      if (providerKey === 'nous') {
        const res = await fetch('https://inference-api.nousresearch.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const json = await res.json();
          const raw = Array.isArray(json) ? json : (json.data || []);
          const seen = new Set();
          const filtered = raw
            .filter(m => !/embed|moderation|audio/i.test(m.id))
            .filter(m => /hy3|longcat|solar|step|laguna/i.test(m.id) || /hy3|longcat|solar|step|laguna/i.test(m.name || ''))
            .filter(m => {
              if (seen.has(m.id)) return false;
              seen.add(m.id);
              return true;
            })
            .map(m => ({ id: m.id, name: formatDisplayName('nous', m), isFree: true }));

          filtered.sort((a, b) => {
            const priority = (id) => {
              if (id.includes('laguna-s') || id.includes('laguna_s')) return 1;
              if (id.includes('longcat')) return 2;
              if (id.includes('hy3')) return 3;
              if (id.includes('step')) return 4;
              if (id.includes('solar')) return 5;
              if (id.includes('laguna-xs') || id.includes('laguna_xs')) return 6;
              if (id.includes('laguna')) return 7;
              return 20;
            };
            return priority(a.id) - priority(b.id);
          });

          if (filtered.length > 0) {
            await saveCachedModelsFor(providerKey, filtered);
            return filtered;
          }
        }
      }

      // 3. Ollama
      if (providerKey === 'ollama') {
        try {
          const res = await fetch('http://localhost:11434/v1/models');
          if (res.ok) {
            const json = await res.json();
            const raw = Array.isArray(json) ? json : (json.data || []);
            const models = raw.map(m => ({ id: m.id, name: formatDisplayName('ollama', m), isFree: true }));
            if (models.length > 0) {
              await saveCachedModelsFor(providerKey, models);
              return models;
            }
          }
        } catch (e) {}
      }

      // 4. Claude
      if (providerKey === 'claude') {
        try {
          const res = await fetch('https://api.anthropic.com/v1/models', {
            headers: {
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'anthropic-dangerous-direct-browser-access': 'true',
              'Content-Type': 'application/json'
            }
          });
          if (res.ok) {
            const json = await res.json();
            const raw = Array.isArray(json) ? json : (json.data || []);
            const models = raw.map(m => ({
              id: m.id,
              name: formatDisplayName('claude', m),
              created_at: m.created_at,
              isFree: false
            }));

            if (models.length > 0) {
              await saveCachedModelsFor(providerKey, models);
              return models;
            }
          }
        } catch (e) {}
      }

      // 5. Mistral
      if (providerKey === 'mistral') {
        const res = await fetch('https://api.mistral.ai/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const json = await res.json();
          const raw = Array.isArray(json) ? json : (json.data || []);
          const filtered = raw
            .filter(m => !m.archived && m.capabilities?.completion_chat !== false && !/embed|moderation|ocr|audio/i.test(m.id))
            .map(m => ({ id: m.id, name: formatDisplayName('mistral', m), isFree: /codestral|small/i.test(m.id) }));

          if (filtered.length > 0) {
            await saveCachedModelsFor(providerKey, filtered);
            return showPaidModels ? filtered : filtered.filter(m => m.isFree);
          }
        }
      }

      // 6. Gemini
      if (providerKey === 'gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const json = await res.json();
          const raw = json.models || (Array.isArray(json) ? json : []);
          const filtered = raw
            .filter(m => {
              const clean = (m.name || '').replace(/^models\//, '');
              const methods = m.supportedGenerationMethods || [];
              const isGen = methods.length === 0 || methods.includes('generateContent');
              return isGen && !/embedding|aqa|imagen|veo|lyria|banana|robotics|audio|tts|live|translate|computer-use|deep-research/i.test(clean);
            })
            .map(m => {
              const cleanId = m.name.replace(/^models\//, '');
              return {
                id: cleanId,
                name: formatDisplayName('gemini', { id: cleanId, displayName: m.displayName }),
                isFree: !/gemini-2.5-pro/i.test(cleanId)
              };
            });

          filtered.sort((a, b) => {
            const priority = (id) => {
              if (id.includes('gemini-2.5-flash')) return 1;
              if (id.includes('gemini-2.0-flash')) return 2;
              if (id.includes('gemini-1.5-flash')) return 3;
              if (id.includes('gemini-1.5-pro')) return 4;
              if (id.includes('gemini-2.0-flash-lite')) return 5;
              if (id.includes('gemini-2.5-pro')) return 6;
              return 20;
            };
            return priority(a.id) - priority(b.id);
          });

          if (filtered.length > 0) {
            await saveCachedModelsFor(providerKey, filtered);
            return showPaidModels ? filtered : filtered.filter(m => m.isFree);
          }
        }
      }

      // 7. OpenAI
      if (providerKey === 'openai') {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const json = await res.json();
          const raw = Array.isArray(json) ? json : (json.data || []);
          const filtered = raw
            .filter(m => /^(gpt-|o1|o3|chatgpt)/i.test(m.id) && !/realtime|audio|transcription|tts|embedding|moderation|preview-2024|instruct/i.test(m.id))
            .map(m => ({ id: m.id, name: formatDisplayName('openai', m), isFree: false }));

          if (filtered.length > 0) {
            await saveCachedModelsFor(providerKey, filtered);
            return filtered;
          }
        }
      }

      // 8. DeepSeek
      if (providerKey === 'deepseek') {
        try {
          const res = await fetch('https://api.deepseek.com/models', {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          });
          if (res.ok) {
            const json = await res.json();
            const raw = Array.isArray(json) ? json : (json.data || []);
            const models = raw.map(m => ({ id: m.id, name: formatDisplayName('deepseek', m), isFree: false }));
            if (models.length > 0) {
              await saveCachedModelsFor(providerKey, models);
              return models;
            }
          }
        } catch (e) {}
      }
    } catch (err) {
      console.warn(`[Popup] Falha ao consultar modelos de ${providerKey}:`, err);
    } finally {
      if (modelLoadingNotice) {
        modelLoadingNotice.style.display = 'none';
      }
    }

    return getCachedModelsFor(providerKey);
  }

  function renderModelsList(modelsList, selectedModelId) {
    modelSelect.innerHTML = '';
    const filtered = showPaidModels ? modelsList : modelsList.filter(m => m.isFree !== false);
    const listToUse = filtered.length > 0 ? filtered : modelsList;

    listToUse.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.name;
      if (m.id === selectedModelId) opt.selected = true;
      modelSelect.appendChild(opt);
    });

    if (listToUse.length > 0 && !listToUse.some(m => m.id === selectedModelId)) {
      modelSelect.value = listToUse[0].id;
    }
  }

  async function updateModelsDropdown(providerKey, selectedModelId = null) {
    const currentKeys = getKeysFromInputs();
    const apiKey = currentKeys[providerKey];

    // 1. Renderiza modelos em cache imediatamente
    const cached = await getCachedModelsFor(providerKey);
    renderModelsList(cached, selectedModelId || PROVIDERS[providerKey]?.defaultModel);

    // 2. Se houver chave (ou for Ollama), busca da API ao vivo
    if (apiKey || providerKey === 'ollama') {
      const live = await fetchLiveModelsFromAPI(providerKey, apiKey);
      if (live && live.length > 0) {
        renderModelsList(live, modelSelect.value || selectedModelId || PROVIDERS[providerKey]?.defaultModel);
      }
    }
  }

  const { provider: initialProvider, model: initialModel, keys: initialKeys, data: initialData } = await loadStorageSettings();

  providerSelect.value = initialProvider;
  syncKeysToInputs(initialKeys);
  updateToggleBtnState();

  // Renderiza inicial com cache e busca ao vivo em seguida
  const initialCached = await getCachedModelsFor(initialProvider, initialData);
  renderModelsList(initialCached, initialModel);
  if (initialKeys[initialProvider] || initialProvider === 'ollama') {
    fetchLiveModelsFromAPI(initialProvider, initialKeys[initialProvider]).then(live => {
      if (live && live.length > 0) {
        renderModelsList(live, initialModel);
      }
    });
  }

  function syncKeysToInputs(keys) {
    keyGroq.value = keys.groq || '';
    keyGemini.value = keys.gemini || '';
    keyNous.value = keys.nous || '';
    keyOpenRouter.value = keys.openrouter || '';
    keyOllama.value = keys.ollama || 'http://localhost:11434';
    keyMistral.value = keys.mistral || '';
    keyClaude.value = keys.claude || '';
    keyOpenAI.value = keys.openai || '';
    keyDeepSeek.value = keys.deepseek || '';

    const currentP = providerSelect.value;
    apiKeyInput.value = keys[currentP] || (currentP === 'ollama' ? 'http://localhost:11434' : '');
  }

  function getKeysFromInputs() {
    return {
      groq: keyGroq.value.trim(),
      gemini: keyGemini.value.trim(),
      nous: keyNous.value.trim(),
      openrouter: keyOpenRouter.value.trim(),
      ollama: keyOllama.value.trim() || 'http://localhost:11434',
      mistral: keyMistral.value.trim(),
      claude: keyClaude.value.trim(),
      openai: keyOpenAI.value.trim(),
      deepseek: keyDeepSeek.value.trim()
    };
  }

  if (toggleFreeModeBtn) {
    toggleFreeModeBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      showPaidModels = !showPaidModels;
      try {
        localStorage.setItem('estacio_show_paid_models', showPaidModels ? 'true' : 'false');
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          await chrome.storage.local.set({ estacio_show_paid_models: showPaidModels ? 'true' : 'false' });
        }
      } catch (e) {}
      updateToggleBtnState();
      await updateModelsDropdown(providerSelect.value, modelSelect.value);
    });
  }

  providerSelect.addEventListener('change', async () => {
    const currentP = providerSelect.value;
    const currentKeys = getKeysFromInputs();
    apiKeyInput.value = currentKeys[currentP] || (currentP === 'ollama' ? 'http://localhost:11434' : '');
    await updateModelsDropdown(currentP, PROVIDERS[currentP]?.defaultModel);
  });

  apiKeyInput.addEventListener('input', () => {
    const currentP = providerSelect.value;
    const val = apiKeyInput.value.trim();
    if (currentP === 'groq') keyGroq.value = val;
    if (currentP === 'gemini') keyGemini.value = val;
    if (currentP === 'nous') keyNous.value = val;
    if (currentP === 'openrouter') keyOpenRouter.value = val;
    if (currentP === 'ollama') keyOllama.value = val;
    if (currentP === 'mistral') keyMistral.value = val;
    if (currentP === 'claude') keyClaude.value = val;
    if (currentP === 'openai') keyOpenAI.value = val;
    if (currentP === 'deepseek') keyDeepSeek.value = val;
  });

  refreshModelsBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const currentP = providerSelect.value;
    const currentKeys = getKeysFromInputs();
    const currentKey = currentKeys[currentP];

    if (!currentKey && currentP !== 'ollama') {
      statusMsg.className = 'status-msg warning';
      statusMsg.textContent = `⚠️ Insira a chave da API para buscar a lista de modelos.`;
      statusMsg.classList.remove('hidden');
      setTimeout(() => statusMsg.classList.add('hidden'), 3000);
      return;
    }

    refreshModelsBtn.disabled = true;
    refreshModelsBtn.textContent = '⏳ Buscando...';

    const live = await fetchLiveModelsFromAPI(currentP, currentKey);
    if (live && live.length > 0) {
      renderModelsList(live, modelSelect.value);
      statusMsg.className = 'status-msg success';
      statusMsg.textContent = `✅ ${live.length} modelos carregados diretamente da API!`;
      statusMsg.classList.remove('hidden');
      setTimeout(() => statusMsg.classList.add('hidden'), 3000);
    }

    refreshModelsBtn.disabled = false;
    refreshModelsBtn.textContent = '🔄 Atualizar Modelos';
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

    if (!currentKey && currentP !== 'ollama') {
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
          const msg = err.error?.message || `HTTP ${res.status}`;
          if (/credit balance is too low|purchase credits/i.test(msg)) {
            throw new Error('Saldo insuficiente na Anthropic ($0.00). Sua chave é válida, mas seu saldo em console.anthropic.com está zerado.');
          }
          throw new Error(msg);
        }
      } else if (currentP === 'gemini') {
        const selectedM = (currentM || 'gemini-2.5-flash').replace(/^models\//, '');
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedM}:generateContent`, {
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
      } else if (currentP === 'openrouter') {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentKey}`,
            'HTTP-Referer': 'https://estudante.estacio.br',
            'X-Title': 'Estacio Suite AI'
          },
          body: JSON.stringify({
            model: currentM || 'openrouter/free',
            messages: [{ role: 'user', content: testPrompt }]
          })
        });
        isSuccess = res.ok;
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || `HTTP ${res.status}`);
        }
      } else if (currentP === 'ollama') {
        const res = await fetch('http://localhost:11434/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: currentM || 'llama3.3',
            messages: [{ role: 'user', content: testPrompt }]
          })
        });
        isSuccess = res.ok;
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || `HTTP ${res.status} (Ollama está rodando?)`);
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
            model: currentM || PROVIDERS[currentP]?.defaultModel,
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
        statusMsg.className = 'status-msg success';
        statusMsg.textContent = `✅ [Live] Conexão com ${PROVIDERS[currentP]?.name} funcionando 100%!`;
      }
    } catch (e) {
      statusMsg.className = 'status-msg error';
      statusMsg.textContent = `❌ Erro no teste: ${e.message}`;
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = 'Testar Conexão Live';
    }
  });
});
