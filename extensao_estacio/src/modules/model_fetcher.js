// Descoberta Dinâmica de Modelos via API Oficial (Groq, Mistral, Gemini, Claude, OpenAI, DeepSeek)

import { PROVIDERS_CONFIG } from '../config/providers.js';

export function getCachedModels(provider) {
  try {
    const raw = localStorage.getItem(`estacio_models_${provider}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return null;
}

export function saveCachedModels(provider, modelsList) {
  try {
    if (Array.isArray(modelsList) && modelsList.length > 0) {
      localStorage.setItem(`estacio_models_${provider}`, JSON.stringify(modelsList));
    }
  } catch (e) {}
}

export function getModelsForProvider(provider) {
  const cached = getCachedModels(provider);
  if (cached) return cached;
  return PROVIDERS_CONFIG[provider]?.models || [];
}

export async function fetchLiveModels(provider, apiKey) {
  if (!apiKey) return getModelsForProvider(provider);

  try {
    // 1. Groq (/openai/v1/models)
    if (provider === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      if (res.ok) {
        const json = await res.json();
        const models = (json.data || [])
          .filter(m => !/whisper|tts|guard|embeddings/i.test(m.id))
          .map(m => ({ id: m.id, name: m.id }));
        if (models.length > 0) {
          saveCachedModels(provider, models);
          return models;
        }
      }
    }

    // 2. Anthropic Claude (/v1/models)
    if (provider === 'claude') {
      try {
        const res = await fetch('https://api.anthropic.com/v1/models', {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          }
        });
        if (res.ok) {
          const json = await res.json();
          const models = (json.data || []).map(m => ({
            id: m.id,
            name: m.display_name || m.id
          }));
          if (models.length > 0) {
            saveCachedModels(provider, models);
            return models;
          }
        }
      } catch (e) {}
    }

    // 3. Mistral AI (/v1/models)
    if (provider === 'mistral') {
      const res = await fetch('https://api.mistral.ai/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      if (res.ok) {
        const json = await res.json();
        const models = (json.data || [])
          .filter(m => !/embed/i.test(m.id))
          .map(m => ({ id: m.id, name: m.id }));
        if (models.length > 0) {
          saveCachedModels(provider, models);
          return models;
        }
      }
    }

    // 4. Google Gemini (v1beta/models)
    if (provider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (res.ok) {
        const json = await res.json();
        const models = (json.models || [])
          .filter(m => {
            const methods = m.supportedGenerationMethods || [];
            return methods.includes('generateContent') && !/embedding|aqa|imagen/i.test(m.name);
          })
          .map(m => {
            const cleanId = m.name.replace(/^models\//, '');
            return { id: cleanId, name: m.displayName ? `${m.displayName} (${cleanId})` : cleanId };
          });
        if (models.length > 0) {
          saveCachedModels(provider, models);
          return models;
        }
      }
    }

    // 5. OpenAI (/v1/models)
    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      if (res.ok) {
        const json = await res.json();
        const models = (json.data || [])
          .filter(m => /^(gpt-|o1|o3|chatgpt)/i.test(m.id) && !/realtime|audio|transcription|tts|embedding/i.test(m.id))
          .sort((a, b) => a.id.localeCompare(b.id))
          .map(m => ({ id: m.id, name: m.id }));
        if (models.length > 0) {
          saveCachedModels(provider, models);
          return models;
        }
      }
    }

    // 6. DeepSeek (/models)
    if (provider === 'deepseek') {
      const res = await fetch('https://api.deepseek.com/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      if (res.ok) {
        const json = await res.json();
        const models = (json.data || []).map(m => ({ id: m.id, name: m.id }));
        if (models.length > 0) {
          saveCachedModels(provider, models);
          return models;
        }
      }
    }
  } catch (e) {}

  return getModelsForProvider(provider);
}
