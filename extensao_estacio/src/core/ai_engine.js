// Motor de Execução de IA (Google Gemini, Groq, Mistral, OpenAI, DeepSeek) + Fallback

import { PROVIDERS_CONFIG } from '../config/providers.js';
import { getApiKeyFor } from '../config/storage.js';
import { buildPhDExamPrompt } from './prompt_builder.js';

export async function executeAICall(provider, model, statement, alternatives) {
  const apiKey = getApiKeyFor(provider);
  const pConfig = PROVIDERS_CONFIG[provider];

  if (!apiKey) {
    throw new Error(`Chave de API do ${pConfig?.name || provider} não configurada. Insira sua chave no campo e clique em Salvar.`);
  }

  const prompt = buildPhDExamPrompt(statement, alternatives);

  // 1. Google Gemini Endpoint
  if (provider === 'gemini') {
    const selectedModel = model || pConfig.defaultModel;
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent`;

    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const txt = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const match = txt.match(/"letra"\s*:\s*"([A-E])"/i) || txt.match(/\b([A-E])\b/i);
    return {
      letra: match ? match[1].toUpperCase() : 'A',
      explicacao: txt.slice(0, 100)
    };
  }

  // 2. OpenAI-compatible APIs (Groq, Mistral, OpenAI, DeepSeek)
  const endpoint = pConfig?.endpoint || 'https://api.groq.com/openai/v1/chat/completions';
  const selectedModel = model || pConfig?.defaultModel;

  const systemPrompt = `Você é um professor PhD especialista em provas acadêmicas e cálculo exato. Responda ESTRITAMENTE em formato JSON: {"letra": "A", "explicacao": "justificativa em 1 frase"}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Erro HTTP ${res.status}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  const match = content.match(/"letra"\s*:\s*"([A-E])"/i) || content.match(/\b([A-E])\b/i);

  return {
    letra: match ? match[1].toUpperCase() : 'A',
    explicacao: content.slice(0, 100)
  };
}

export async function callAIWithFallback(provider, model, statement, alternatives, onFallbackLog = null) {
  try {
    return await executeAICall(provider, model, statement, alternatives);
  } catch (err) {
    if (onFallbackLog) {
      onFallbackLog(`[Aviso] ${provider} falhou (${err.message}). Ativando fallback automático...`);
    }

    // 1. Tenta Groq
    const groqKey = getApiKeyFor('groq');
    if (groqKey && provider !== 'groq') {
      try {
        if (onFallbackLog) onFallbackLog('Fallback ativado: Consultando Groq Llama 3.3 70B...');
        return await executeAICall('groq', 'llama-3.3-70b-versatile', statement, alternatives);
      } catch (e) {}
    }

    // 2. Tenta Mistral
    const mistralKey = getApiKeyFor('mistral');
    if (mistralKey && provider !== 'mistral') {
      try {
        if (onFallbackLog) onFallbackLog('Fallback ativado: Consultando Mistral Large...');
        return await executeAICall('mistral', 'mistral-large-latest', statement, alternatives);
      } catch (e) {}
    }

    throw err;
  }
}
