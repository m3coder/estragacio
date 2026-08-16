// Descoberta Dinâmica de Modelos via API Oficial com Formatação Inteligente, Cache Unificado e Filtro Free/Paid

import { PROVIDERS_CONFIG } from '../config/providers.js';
import { getSaved, setSaved, getShowPaidModels } from '../config/storage.js';
import { universalFetch } from '../core/network.js';

export function getCachedModels(provider) {
  try {
    const cached = getSaved(`models_${provider}`, null);
    if (Array.isArray(cached) && cached.length > 0) return cached;
    if (typeof cached === 'string') {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return null;
}

export function saveCachedModels(provider, modelsList) {
  try {
    if (Array.isArray(modelsList) && modelsList.length > 0) {
      setSaved(`models_${provider}`, modelsList);
    }
  } catch (e) {}
}

export function isModelFree(provider, modelId) {
  if (provider === 'groq' || provider === 'ollama') return true;
  if (provider === 'openrouter') return modelId.includes(':free');
  if (provider === 'gemini') {
    return !/gemini-2.5-pro|gemini-pro-latest/i.test(modelId);
  }
  if (provider === 'mistral') {
    return /codestral|small/i.test(modelId);
  }
  return false;
}

export function getModelsForProvider(provider, showPaid = null) {
  const allowPaid = showPaid !== null ? showPaid : getShowPaidModels();
  const cached = getCachedModels(provider);
  const rawList = (cached && cached.length > 0) ? cached : (PROVIDERS_CONFIG[provider]?.models || []);

  if (allowPaid) {
    return rawList;
  }

  // Modo Apenas Free (Default)
  const freeList = rawList.filter(m => {
    if (typeof m.isFree === 'boolean') return m.isFree;
    return isModelFree(provider, m.id);
  });

  if (freeList.length > 0) return freeList;
  return rawList; // Fallback se o provedor for exclusivamente pago (ex: Claude/OpenAI)
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
    if (modelId === 'gemini-2.5-flash') return 'Gemini 2.5 Flash (🎁 Grátis 1.500 req/dia • Mais Estável)';
    if (modelId === 'gemini-2.5-flash-lite') return 'Gemini 2.5 Flash-Lite (⚡ Grátis • Ultra Rápido)';
    if (modelId === 'gemini-3.7-flash') return 'Gemini 3.7 Flash (🎁 Grátis • Raciocínio Híbrido)';
    if (modelId === 'gemini-3.6-flash') return 'Gemini 3.6 Flash (🎁 Grátis 1.500 req/dia)';
    if (modelId === 'gemini-3.5-flash') return 'Gemini 3.5 Flash (🎁 Grátis 1.500 req/dia)';
    if (modelId === 'gemini-3.5-flash-lite') return 'Gemini 3.5 Flash-Lite (⚡ Grátis)';
    if (modelId === 'gemini-3.1-pro-preview') return 'Gemini 3.1 Pro Preview (🧠 Raciocínio Avançado)';
    if (modelId === 'gemini-3.1-flash-lite') return 'Gemini 3.1 Flash-Lite (⚡ Grátis)';
    if (modelId === 'gemini-3-flash-preview') return 'Gemini 3 Flash Preview (🎁 Grátis)';
    if (modelId === 'gemini-2.5-pro') return 'Gemini 2.5 Pro (💎 Pago • Deep Reasoning)';
    if (modelId === 'gemini-flash-latest') return 'Gemini Flash Latest (🎁 Grátis AI Studio)';
    if (modelId === 'gemini-pro-latest') return 'Gemini Pro Latest (🎁 Grátis AI Studio)';
  } else if (provider === 'openrouter') {
    const isFree = modelId.includes(':free');
    const freeBadge = isFree ? ' (🔥 100% Grátis)' : ' (💎 Pago)';
    if (modelId.includes('llama-3.3-70b-instruct:free')) return `Llama 3.3 70B Instruct (🔥 100% Grátis • Recomendado)`;
    if (modelId.includes('deepseek-r1:free')) return `DeepSeek R1 (🔥 100% Grátis • Raciocínio Puro)`;
    if (modelId.includes('gemini-2.0-flash-exp:free')) return `Gemini 2.0 Flash Exp (🔥 100% Grátis)`;
    if (modelId.includes('qwen-2.5-72b-instruct:free')) return `Qwen 2.5 72B (🔥 100% Grátis)`;
    if (modelId.includes('openrouter/auto:free')) return `OpenRouter Auto (🔥 100% Grátis • Roteamento)`;
    if (modelId.includes('hermes-3-llama-3.1-405b')) return `Nous Hermes 3 405B${freeBadge} (🎓 PhD)`;
    if (modelId.includes('hermes-3-llama-3.1-70b')) return `Nous Hermes 3 70B${freeBadge}`;
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
    if (modelId === 'pixtral-large-latest') return `Pixtral Large Latest (Visão & PhD)${suffix}`;
    if (modelId === 'ministral-8b-latest') return `Ministral 8B Latest${suffix}`;
    if (modelId.startsWith('mistral-medium')) return `Mistral Medium (${modelId})${suffix}`;
  } else if (provider === 'claude') {
    let suffix = '';
    if (modelItem?.capabilities?.thinking?.supported) suffix = ' (🧠 Thinking)';
    if (modelId === 'claude-opus-4-6') return `Claude Opus 4.6 (💎 Pago • Frontier PhD)${suffix}`;
    if (modelId.includes('claude-3-7-sonnet')) return `Claude 3.7 Sonnet (💎 Pago • Raciocínio Híbrido)${suffix}`;
    if (modelId.includes('claude-3-5-sonnet')) return `Claude 3.5 Sonnet (💎 Pago • Alta Precisão)${suffix}`;
    if (modelId.includes('claude-3-5-haiku')) return `Claude 3.5 Haiku (💎 Pago • Ultra Rápido)${suffix}`;
  } else if (provider === 'openai') {
    if (modelId === 'gpt-4o-mini') return 'GPT-4o Mini (💎 Pago • Econômico)';
    if (modelId === 'gpt-4o') return 'GPT-4o (💎 Pago • Precisão Máxima)';
    if (modelId === 'o3-mini') return 'o3-mini (💎 Pago • Raciocínio)';
    if (modelId === 'o1') return 'o1 (💎 Pago • Raciocínio PhD)';
  } else if (provider === 'deepseek') {
    if (modelId === 'deepseek-chat') return 'DeepSeek V3 (💎 Pago • Econômico)';
    if (modelId === 'deepseek-reasoner') return 'DeepSeek R1 (💎 Pago • Raciocínio Puro)';
  }

  if (rawName && rawName !== modelId) return `${rawName} (${modelId})`;
  return modelId;
}

export async function fetchLiveModels(provider, apiKey, showPaid = null) {
  const allowPaid = showPaid !== null ? showPaid : getShowPaidModels();
  if (!apiKey && provider !== 'ollama') return getModelsForProvider(provider, allowPaid);

  try {
    // 1. Groq (/openai/v1/models) - Todos 100% Free
    if (provider === 'groq') {
      const res = await universalFetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const json = await res.json();
        const rawList = Array.isArray(json) ? json : (json.data || []);
        const filtered = rawList
          .filter(m => !/whisper|tts|guard|embeddings|orpheus|safeguard|distilbert/i.test(m.id))
          .map(m => ({
            id: m.id,
            name: formatDisplayName('groq', m),
            isFree: true
          }));

        filtered.sort((a, b) => {
          const priority = (id) => {
            if (id.includes('llama-3.3-70b')) return 1;
            if (id.includes('deepseek-r1-distill-llama-70b')) return 2;
            if (id.includes('qwen')) return 3;
            if (id.includes('llama-3.1-8b')) return 4;
            if (id.includes('gpt-oss')) return 5;
            return 10;
          };
          return priority(a.id) - priority(b.id);
        });

        if (filtered.length > 0) {
          saveCachedModels(provider, filtered);
          return allowPaid ? filtered : filtered.filter(m => m.isFree);
        }
      }
    }

    // 2. OpenRouter (Nous Hermes, Free Models & Multi-Providers)
    if (provider === 'openrouter') {
      const res = await universalFetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const json = await res.json();
        const rawList = Array.isArray(json) ? json : (json.data || []);
        const filtered = rawList
          .filter(m => !/audio|whisper|moderation|embedding/i.test(m.id))
          .map(m => {
            const isFree = m.id.includes(':free');
            return {
              id: m.id,
              name: formatDisplayName('openrouter', m),
              isFree: isFree
            };
          });

        filtered.sort((a, b) => {
          if (a.isFree && !b.isFree) return -1;
          if (!a.isFree && b.isFree) return 1;
          if (a.id.includes('llama-3.3-70b') && !b.id.includes('llama-3.3-70b')) return -1;
          if (a.id.includes('deepseek-r1') && !b.id.includes('deepseek-r1')) return -1;
          return a.id.localeCompare(b.id);
        });

        if (filtered.length > 0) {
          saveCachedModels(provider, filtered);
          return allowPaid ? filtered : filtered.filter(m => m.isFree);
        }
      }
    }

    // 3. Ollama (Local / Offline Server) - Todos 100% Free
    if (provider === 'ollama') {
      try {
        const res = await universalFetch('http://localhost:11434/v1/models');
        if (res.ok) {
          const json = await res.json();
          const rawList = Array.isArray(json) ? json : (json.data || []);
          const models = rawList.map(m => ({
            id: m.id,
            name: formatDisplayName('ollama', m),
            isFree: true
          }));
          if (models.length > 0) {
            saveCachedModels(provider, models);
            return models;
          }
        }
      } catch (e) {
        try {
          const resTags = await universalFetch('http://localhost:11434/api/tags');
          if (resTags.ok) {
            const jsonTags = await resTags.json();
            const rawModels = jsonTags.models || [];
            const models = rawModels.map(m => ({
              id: m.name,
              name: formatDisplayName('ollama', { id: m.name }),
              isFree: true
            }));
            if (models.length > 0) {
              saveCachedModels(provider, models);
              return models;
            }
          }
        } catch (e2) {}
      }

      const curatedOllama = PROVIDERS_CONFIG.ollama.models;
      saveCachedModels(provider, curatedOllama);
      return curatedOllama;
    }

    // 4. Anthropic Claude (/v1/models)
    if (provider === 'claude') {
      try {
        const res = await universalFetch('https://api.anthropic.com/v1/models', {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const json = await res.json();
          const rawList = Array.isArray(json) ? json : (json.data || []);
          const filtered = rawList.map(m => ({
            id: m.id,
            name: formatDisplayName('claude', m),
            created_at: m.created_at,
            isFree: false
          }));

          filtered.sort((a, b) => {
            if (a.created_at && b.created_at) {
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            const priority = (id) => {
              if (id.includes('opus-4')) return 1;
              if (id.includes('3-7-sonnet')) return 2;
              if (id.includes('3-5-sonnet')) return 3;
              if (id.includes('3-5-haiku')) return 4;
              if (id.includes('3-opus')) return 5;
              return 10;
            };
            return priority(a.id) - priority(b.id);
          });

          if (filtered.length > 0) {
            saveCachedModels(provider, filtered);
            return filtered;
          }
        }
      } catch (e) {}

      const curatedClaude = PROVIDERS_CONFIG.claude.models;
      saveCachedModels(provider, curatedClaude);
      return curatedClaude;
    }

    // 5. Mistral AI (/v1/models)
    if (provider === 'mistral') {
      const res = await universalFetch('https://api.mistral.ai/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const json = await res.json();
        const rawList = Array.isArray(json) ? json : (json.data || []);
        const filtered = rawList
          .filter(m => !m.archived && m.capabilities?.completion_chat !== false && !/embed|moderation|ocr|audio/i.test(m.id))
          .map(m => ({
            id: m.id,
            name: formatDisplayName('mistral', m),
            isFree: /codestral|small/i.test(m.id)
          }));

        filtered.sort((a, b) => {
          const priority = (id) => {
            if (id === 'codestral-latest') return 1;
            if (id === 'mistral-small-latest') return 2;
            if (id === 'mistral-large-latest') return 3;
            return 10;
          };
          return priority(a.id) - priority(b.id);
        });

        if (filtered.length > 0) {
          saveCachedModels(provider, filtered);
          return allowPaid ? filtered : filtered.filter(m => m.isFree);
        }
      }
    }

    // 6. Google Gemini (v1beta/models)
    if (provider === 'gemini') {
      const res = await universalFetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const json = await res.json();
        const rawList = json.models || (Array.isArray(json) ? json : []);
        const filtered = rawList
          .filter(m => {
            const clean = (m.name || '').replace(/^models\//, '');
            const methods = m.supportedGenerationMethods || [];
            const isGen = methods.length === 0 || methods.includes('generateContent');
            return isGen && !/embedding|aqa|imagen|veo|lyria|banana|robotics|audio|tts|live|translate|computer-use|deep-research/i.test(clean);
          })
          .map(m => {
            const cleanId = m.name.replace(/^models\//, '');
            const isFree = !/gemini-2.5-pro|gemini-pro-latest/i.test(cleanId);
            return {
              id: cleanId,
              name: formatDisplayName('gemini', { id: cleanId, displayName: m.displayName }),
              isFree: isFree
            };
          });

        filtered.sort((a, b) => {
          const priority = (id) => {
            if (id === 'gemini-2.5-flash') return 1;
            if (id === 'gemini-2.5-flash-lite') return 2;
            if (id === 'gemini-3.7-flash') return 3;
            if (id === 'gemini-3.6-flash') return 4;
            if (id === 'gemini-3.5-flash') return 5;
            if (id === 'gemini-3.5-flash-lite') return 6;
            if (id === 'gemini-3.1-pro-preview') return 7;
            if (id === 'gemini-3.1-flash-lite') return 8;
            if (id === 'gemini-3-flash-preview') return 9;
            if (id === 'gemini-2.5-pro') return 10;
            if (id === 'gemini-flash-latest') return 11;
            return 20;
          };
          return priority(a.id) - priority(b.id);
        });

        if (filtered.length > 0) {
          saveCachedModels(provider, filtered);
          return allowPaid ? filtered : filtered.filter(m => m.isFree);
        }
      }
    }

    // 7. OpenAI (/v1/models)
    if (provider === 'openai') {
      const res = await universalFetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const json = await res.json();
        const rawList = Array.isArray(json) ? json : (json.data || []);
        const filtered = rawList
          .filter(m => /^(gpt-|o1|o3|chatgpt)/i.test(m.id) && !/realtime|audio|transcription|tts|embedding|moderation|preview-2024|instruct/i.test(m.id))
          .map(m => ({
            id: m.id,
            name: formatDisplayName('openai', m),
            isFree: false
          }));

        filtered.sort((a, b) => {
          const priority = (id) => {
            if (id === 'gpt-4o-mini') return 1;
            if (id === 'gpt-4o') return 2;
            if (id.startsWith('o3-mini')) return 3;
            if (id.startsWith('o1')) return 4;
            return 10;
          };
          return priority(a.id) - priority(b.id);
        });

        if (filtered.length > 0) {
          saveCachedModels(provider, filtered);
          return filtered;
        }
      }
    }

    // 8. DeepSeek (/models)
    if (provider === 'deepseek') {
      try {
        const res = await universalFetch('https://api.deepseek.com/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const json = await res.json();
          const rawList = Array.isArray(json) ? json : (json.data || []);
          const models = rawList.map(m => ({
            id: m.id,
            name: formatDisplayName('deepseek', m),
            isFree: false
          }));
          if (models.length > 0) {
            saveCachedModels(provider, models);
            return models;
          }
        }
      } catch (e) {}

      const curatedDeepSeek = PROVIDERS_CONFIG.deepseek.models;
      saveCachedModels(provider, curatedDeepSeek);
      return curatedDeepSeek;
    }
  } catch (e) {
    console.warn(`[ModelFetcher] Erro ao buscar modelos ao vivo de ${provider}:`, e);
  }

  return getModelsForProvider(provider, allowPaid);
}
