// Motor de Execução de IA (Anthropic Claude, Google Gemini, Groq, OpenRouter, Ollama, Mistral, OpenAI, DeepSeek) + Teste Live e Multi-Fallback

import { PROVIDERS_CONFIG } from '../config/providers.js';
import { getApiKeyFor, setApiKeyFor, setProviderStatus, getLiveProviders, getSaved, setSaved } from '../config/storage.js';
import { buildPhDExamPrompt } from './prompt_builder.js';
import { universalFetch } from './network.js';

export async function executeAICall(provider, model, statement, alternatives) {
  const apiKey = getApiKeyFor(provider);
  const pConfig = PROVIDERS_CONFIG[provider];

  if (!apiKey && provider !== 'ollama') {
    throw new Error(`Chave de API do ${pConfig?.name || provider} não configurada. Insira sua chave no campo e clique em Testar & Salvar.`);
  }

  const prompt = buildPhDExamPrompt(statement, alternatives);

  // 1. Anthropic Claude Messages API
  if (provider === 'claude') {
    const selectedModel = model || pConfig.defaultModel;
    const claudeUrl = 'https://api.anthropic.com/v1/messages';

    const systemPrompt = `Você é um professor PhD especialista em provas acadêmicas e cálculo exato. Responda ESTRITAMENTE em formato JSON no formato: {"letra": "A", "explicacao": "justificativa em 1 frase"}`;

    const res = await universalFetch(claudeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: selectedModel,
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.1
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const content = data.content?.[0]?.text || '';
    const match = content.match(/"letra"\s*:\s*"([A-E])"/i) || content.match(/\b([A-E])\b/i);
    return {
      letra: match ? match[1].toUpperCase() : 'A',
      explicacao: content.slice(0, 100)
    };
  }

  // 2. Google Gemini Endpoint
  if (provider === 'gemini') {
    const selectedModel = model || pConfig.defaultModel;
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent`;

    const res = await universalFetch(geminiUrl, {
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
      const msg = err.error?.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }

    const data = await res.json();
    const txt = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const match = txt.match(/"letra"\s*:\s*"([A-E])"/i) || txt.match(/\b([A-E])\b/i);
    return {
      letra: match ? match[1].toUpperCase() : 'A',
      explicacao: txt.slice(0, 100)
    };
  }

  // 3. OpenAI-compatible APIs (Groq, OpenRouter, Ollama, Mistral, OpenAI, DeepSeek)
  const endpoint = pConfig?.endpoint || 'https://api.groq.com/openai/v1/chat/completions';
  const selectedModel = model || pConfig?.defaultModel;

  const systemPrompt = `Você é um professor PhD especialista em provas acadêmicas e cálculo exato. Responda ESTRITAMENTE em formato JSON: {"letra": "A", "explicacao": "justificativa em 1 frase"}`;

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const res = await universalFetch(endpoint, {
    method: 'POST',
    headers: headers,
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

export async function testProviderKey(provider, testKey, specificModel = null) {
  const pConfig = PROVIDERS_CONFIG[provider];
  if (!testKey && provider !== 'ollama') throw new Error('Chave de API não informada.');

  const originalKey = getApiKeyFor(provider);
  if (testKey || provider === 'ollama') {
    setApiKeyFor(provider, testKey || 'local');
  }

  let modelToTest = specificModel || getSaved('active_model') || pConfig.defaultModel;

  const testStatement = "Resolva esta questão acadêmica de teste: Quanto é 2 + 2?";
  const testAlternatives = [
    { letter: "A", text: "4" },
    { letter: "B", text: "5" }
  ];

  try {
    const result = await executeAICall(provider, modelToTest, testStatement, testAlternatives);
    if (result && result.letra) {
      setProviderStatus(provider, 'live');
      return { success: true, result, model: modelToTest };
    }
    throw new Error('Resposta sem formato esperado.');
  } catch (err) {
    // 1. Auto-recovery para OpenRouter (se slug :free foi descontinuado pelo provedor)
    if (provider === 'openrouter') {
      const openRouterFallbacks = [
        'meta-llama/llama-3.3-70b-instruct:free',
        'deepseek/deepseek-r1:free',
        'google/gemini-2.0-flash-exp:free',
        'openrouter/auto:free',
        'nousresearch/hermes-3-llama-3.1-405b'
      ];
      for (const fallbackModel of openRouterFallbacks) {
        if (fallbackModel !== modelToTest) {
          try {
            const fbResult = await executeAICall(provider, fallbackModel, testStatement, testAlternatives);
            if (fbResult && fbResult.letra) {
              setProviderStatus(provider, 'live');
              setSaved('active_model', fallbackModel);
              return {
                success: true,
                result: fbResult,
                model: fallbackModel,
                warning: `O modelo ${modelToTest} não aceitou requisição gratuita no OpenRouter. Chave validada via ${fallbackModel}!`
              };
            }
          } catch (fbErr) {}
        }
      }
    }

    // 2. Auto-recovery para Google Gemini (modelo descontinuado ou cooldown de RPM / rate limit temporário)
    if (provider === 'gemini' && /quota|rate limit|429|no longer available|not_found|404/i.test(err.message)) {
      const geminiFallbacks = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
      for (const fbModel of geminiFallbacks) {
        if (fbModel !== modelToTest) {
          try {
            const fbResult = await executeAICall(provider, fbModel, testStatement, testAlternatives);
            if (fbResult && fbResult.letra) {
              setProviderStatus(provider, 'live');
              setSaved('active_model', fbModel);
              return {
                success: true,
                result: fbResult,
                model: fbModel,
                warning: `O modelo ${modelToTest} estava indisponível na API do Google. Chave validada automaticamente via ${fbModel}!`
              };
            }
          } catch (fbErr) {}
        }
      }
    }

    // 3. Auto-recovery para Groq
    if (provider === 'groq' && /quota|rate limit|429/i.test(err.message)) {
      try {
        const fbResult = await executeAICall(provider, 'llama-3.1-8b-instant', testStatement, testAlternatives);
        if (fbResult && fbResult.letra) {
          setProviderStatus(provider, 'live');
          setSaved('active_model', 'llama-3.1-8b-instant');
          return { success: true, result: fbResult, model: 'llama-3.1-8b-instant', warning: `Chave validada via Llama 3.1 8B!` };
        }
      } catch (fbErr) {}
    }

    setProviderStatus(provider, 'error');
    setApiKeyFor(provider, originalKey);
    throw err;
  }
}

export async function callAIWithFallback(provider, model, statement, alternatives, onFallbackLog = null) {
  const liveList = getLiveProviders();
  const fallbackQueue = [
    { p: provider, m: model },
    ...liveList.filter(p => p !== provider).map(p => ({ p, m: PROVIDERS_CONFIG[p]?.defaultModel }))
  ];

  let lastError = null;

  for (let attempt = 0; attempt < fallbackQueue.length; attempt++) {
    const current = fallbackQueue[attempt];

    try {
      if (attempt > 0 && onFallbackLog) {
        onFallbackLog(`Fallback ativado: Consultando ${PROVIDERS_CONFIG[current.p]?.name || current.p}...`, 'info');
      }
      return await executeAICall(current.p, current.m, statement, alternatives);
    } catch (err) {
      lastError = err;
      const isRateLimit = /429|quota|rate limit/i.test(err.message);
      
      if (onFallbackLog) {
        onFallbackLog(`[Aviso] ${PROVIDERS_CONFIG[current.p]?.name || current.p} falhou (${err.message.slice(0, 80)}...).`, 'warning');
      }

      if (isRateLimit && attempt === fallbackQueue.length - 1) {
        if (onFallbackLog) onFallbackLog(`Aguardando 4s de respiro para alívio de cota...`, 'info');
        await new Promise(r => setTimeout(r, 4000));
        try {
          return await executeAICall(current.p, current.m, statement, alternatives);
        } catch (retryErr) {
          lastError = retryErr;
        }
      }
    }
  }

  throw lastError || new Error('Todas as IAs ativas falharam.');
}
