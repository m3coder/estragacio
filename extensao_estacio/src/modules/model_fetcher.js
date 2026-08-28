// Descoberta Dinâmica de Modelos via API Oficial com Formatação Inteligente, Cache Unificado e Filtro Estrito Free/Paid

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
      setSaved(`models_ts_${provider}`, Date.now());
    }
  } catch (e) {}
}

export function isModelFree(provider, modelId, displayName = '') {
  const id = (modelId || '').toLowerCase();
  const name = (displayName || '').toLowerCase();

  // 1. Groq (Todos os modelos de texto suportados são 100% Free com 14.4k req/dia)
  if (provider === 'groq') {
    return !/whisper|tts|guard|embeddings|safeguard|distilbert/i.test(id);
  }

  // 2. OpenRouter (Modelos com tag :free ou roteador openrouter/free)
  if (provider === 'openrouter') {
    return id === 'openrouter/free' || id.endsWith(':free') || id.includes(':free');
  }

  // 3. Gemini (Apenas Flash text models da cota gratuita de 1.500 req/dia do AI Studio)
  if (provider === 'gemini') {
    // Rejeita qualquer modelo com imagem, gemma, custom tools, pro, embeddings, etc.
    if (/image|imagen|gemma|custom|banana|veo|lyria|aqa|embed|deep-research|live|audio/i.test(id)) {
      return false;
    }
    if (/banana|image|gemma|vision/i.test(name)) {
      return false;
    }
    // Aceita modelos Flash de texto padrão
    return /flash/i.test(id) || (!/pro/i.test(id) && /gemini-1\.5|gemini-2\.0|gemini-2\.5/i.test(id));
  }

  // 4. Ollama (100% Local e Ilimitado)
  if (provider === 'ollama') return true;

  // 5. Mistral (Apenas Codestral dev free tier e Mistral Small)
  if (provider === 'mistral') {
    return /codestral|small/i.test(id) && !/large|pixtral|embed/i.test(id);
  }

  // 6. Nous Research / Portal (portal.nousresearch.com)
  if (provider === 'nous') {
    return id.endsWith(':free') || /:free$/i.test(id) || id.includes(':free');
  }

  // 7. Provedores pagos por token (Claude, OpenAI, DeepSeek)
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
    return isModelFree(provider, m.id, m.name);
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
    if (modelId.includes('gemini-2.5-flash')) return 'Gemini 2.5 Flash (🎁 Grátis • Raciocínio & Rapidez • Recomendado)';
    if (modelId.includes('gemini-2.0-flash')) return 'Gemini 2.0 Flash (⚡ Grátis 1.500 req/dia • Mais Rápido)';
    if (modelId.includes('gemini-1.5-flash')) return 'Gemini 1.5 Flash (🎁 Grátis 1.500 req/dia • Estável)';
    if (modelId.includes('gemini-1.5-pro')) return 'Gemini 1.5 Pro (🧠 Grátis Cota Diária • Máximo Raciocínio)';
    if (modelId.includes('gemini-2.0-flash-lite')) return 'Gemini 2.0 Flash-Lite (⚡ Grátis • Ultra Rápido)';
    if (modelId.includes('gemini-2.5-pro')) return 'Gemini 2.5 Pro (💎 Pago • Frontier Reasoning)';
    if (modelId.includes('gemini-flash-latest')) return 'Gemini Flash Latest (🎁 Grátis AI Studio)';
    if (modelId.includes('gemini-pro-latest')) return 'Gemini Pro Latest (💎 Pago AI Studio)';
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
  } else if (provider === 'nous') {
    const isFree = isModelFree('nous', modelId, rawName);
    const freeBadge = isFree ? ' (🔥 100% Grátis)' : ' (💎 Pago)';
    if (modelId === 'poolside/laguna-s-2.1:free') return 'Poolside Laguna S 2.1 (🔥 100% Grátis • 118B Coding • Recomendado)';
    if (modelId === 'poolside/laguna-xs-2.1:free') return 'Poolside Laguna XS 2.1 (🔥 100% Grátis • Leve)';
    if (modelId === 'meituan/longcat-2.0:free') return 'Meituan LongCat 2.0 (🔥 100% Grátis • 1.6T MoE / 1M Context)';
    if (modelId === 'tencent/hy3:free') return 'Tencent Hy3 (🔥 100% Grátis • 295B MoE)';
    if (modelId === 'stepfun/step-3.7-flash:free') return 'StepFun Step 3.7 Flash (🔥 100% Grátis • Ultra Rápido)';
    if (modelId === 'upstage/solar-pro4:free') return 'Upstage Solar Pro 4 (🔥 100% Grátis • Raciocínio)';
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
    if (modelId.includes('claude-3-7-sonnet')) return `Claude 3.7 Sonnet (💎 Pago • Raciocínio Híbrido)${suffix}`;
    if (modelId.includes('claude-3-5-sonnet')) return `Claude 3.5 Sonnet (💎 Pago • Alta Precisão)${suffix}`;
    if (modelId.includes('claude-3-5-haiku')) return `Claude 3.5 Haiku (💎 Pago • Ultra Rápido & Econômico)${suffix}`;
    if (modelId.includes('claude-3-haiku')) return `Claude 3 Haiku (💎 Pago • Econômico)${suffix}`;
    if (modelId.includes('claude-3-opus')) return `Claude 3 Opus (💎 Pago • Frontier PhD)${suffix}`;
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

const inFlightFetches = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora de cache dinâmico

export async function fetchLiveModels(provider, apiKey, showPaid = null, force = false) {
  const allowPaid = showPaid !== null ? showPaid : getShowPaidModels();
  if (!apiKey && provider !== 'ollama') return getModelsForProvider(provider, allowPaid);

  if (!force) {
    const cached = getCachedModels(provider);
    const lastFetch = Number(getSaved(`models_ts_${provider}`, 0));
    const isFresh = (Date.now() - lastFetch) < CACHE_TTL_MS;
    if (cached && cached.length > 0 && isFresh) {
      return allowPaid ? cached : cached.filter(m => m.isFree !== false);
    }
  }

  if (inFlightFetches.has(provider)) {
    try {
      const list = await inFlightFetches.get(provider);
      return allowPaid ? list : list.filter(m => m.isFree !== false);
    } catch (e) {}
  }

  const fetchPromise = (async () => {
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
          .filter(m => isModelFree('groq', m.id, m.display_name))
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
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://estudante.estacio.br',
          'X-Title': 'Estacio Suite AI'
        }
      });
      if (res.ok) {
        const json = await res.json();
        const rawList = Array.isArray(json) ? json : (json.data || []);
        const filtered = rawList
          .filter(m => !/audio|whisper|moderation|embedding/i.test(m.id))
          .map(m => {
            const isFree = isModelFree('openrouter', m.id, m.name) || (m.pricing && m.pricing.prompt === "0" && m.pricing.completion === "0");
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
          saveCachedModels(provider, filtered);
          return allowPaid ? filtered : filtered.filter(m => m.isFree);
        }
      }
    }

    // 3. Nous Research / Portal (/v1/models)
    if (provider === 'nous') {
      try {
        const res = await universalFetch('https://inference-api.nousresearch.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const json = await res.json();
          const rawList = Array.isArray(json) ? json : (json.data || []);
          const seen = new Set();
          const models = rawList
            .filter(m => !/embed|moderation|audio/i.test(m.id))
            .filter(m => isModelFree('nous', m.id, m.name))
            .filter(m => {
              if (seen.has(m.id)) return false;
              seen.add(m.id);
              return true;
            })
            .map(m => ({
              id: m.id,
              name: formatDisplayName('nous', m),
              isFree: true
            }));

          models.sort((a, b) => {
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

          if (models.length > 0) {
            saveCachedModels(provider, models);
            return models;
          }
        }
      } catch (e) {}

      const curatedNous = PROVIDERS_CONFIG.nous?.models || [];
      saveCachedModels(provider, curatedNous);
      return curatedNous;
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
            isFree: isModelFree('mistral', m.id, m.name)
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
            const clean = (m.name || '').replace(/^models\//, '').toLowerCase();
            const dName = (m.displayName || '').toLowerCase();
            const methods = m.supportedGenerationMethods || [];
            const isGen = methods.length === 0 || methods.includes('generateContent');

            // Filtra rigorosamente ruídos, modelos de imagem, embeddings e ferramentas não-chat
            const isGarbage = /embedding|aqa|imagen|veo|lyria|banana|robotics|audio|tts|live|translate|computer-use|deep-research|image|custom-tools/i.test(clean) ||
                              /banana|image|vision|embedding|robotics/i.test(dName);

            return isGen && !isGarbage;
          })
          .map(m => {
            const cleanId = m.name.replace(/^models\//, '');
            const isFree = isModelFree('gemini', cleanId, m.displayName);
            return {
              id: cleanId,
              name: formatDisplayName('gemini', { id: cleanId, displayName: m.displayName }),
              isFree: isFree
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
            if (id.includes('gemini-flash-latest')) return 7;
            if (id.includes('gemini-pro-latest')) return 8;
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
    return getModelsForProvider(provider, allowPaid);
  } catch (e) {
    console.warn(`[ModelFetcher] Erro ao buscar modelos ao vivo de ${provider}:`, e);
    return getModelsForProvider(provider, allowPaid);
  }
})();

  inFlightFetches.set(provider, fetchPromise);
  try {
    const result = await fetchPromise;
    return allowPaid ? result : result.filter(m => m.isFree !== false);
  } finally {
    inFlightFetches.delete(provider);
  }
}
