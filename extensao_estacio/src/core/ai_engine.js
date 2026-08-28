// Motor de Execução de IA (Anthropic Claude, Google Gemini, Groq, OpenRouter, Ollama, Mistral, OpenAI, DeepSeek) + Teste Live e Multi-Fallback

import { PROVIDERS_CONFIG } from '../config/providers.js';
import { getApiKeyFor, setApiKeyFor, setProviderStatus, getLiveProviders, getSaved, setSaved } from '../config/storage.js';
import { buildPhDExamPrompt } from './prompt_builder.js';
import { universalFetch } from './network.js';

export function parseAIResponse(rawText) {
  if (!rawText) return { letra: 'A', explicacao: '' };
  
  let letra = null;
  let explicacao = '';

  // 1. Tenta extrair JSON estruturado (mesmo que venha dentro de markdown ```json ... ```)
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.letra && typeof parsed.letra === 'string') {
        const lMatch = parsed.letra.match(/[A-E]/i);
        if (lMatch) letra = lMatch[0].toUpperCase();
      }
      if (parsed.explicacao && typeof parsed.explicacao === 'string') {
        explicacao = parsed.explicacao.trim();
      }
    }
  } catch (e) {}

  // 2. Se não encontrou letra no JSON, busca por padrões prioritários (evita pegar o artigo "A" no início da frase)
  if (!letra) {
    const lMatch = rawText.match(/"letra"\s*:\s*"([A-E])"/i) ||
                  rawText.match(/(?:letra|alternativa|opção|resposta|correta|item)\s*[:\s-]*\**([A-E])\b/i) ||
                  rawText.match(/\b([A-E])\s*\)/i) ||
                  rawText.match(/\b([A-E])\b/i);
    letra = lMatch ? lMatch[1].toUpperCase() : 'A';
  }

  // 3. Se não encontrou explicação limpa, extrai e sanitiza o texto
  if (!explicacao) {
    const expMatch = rawText.match(/"explicacao"\s*:\s*"([^"]+)"/i);
    if (expMatch) {
      explicacao = expMatch[1].trim();
    } else {
      // Limpa tags markdown de código e chaves json
      explicacao = rawText
        .replace(/```(?:json)?[\s\S]*?```/gi, '')
        .replace(/\{[\s\S]*?\}/g, '')
        .replace(/["'{}]/g, '')
        .trim();
      if (!explicacao) {
        // Fallback: pega o texto cru sem as tags
        explicacao = rawText.replace(/```(?:json)?\s*|\s*```/gi, '').trim();
      }
    }
  }

  // Remove quebras de linha excessivas e trunca para exibição limpa
  explicacao = explicacao.replace(/\s+/g, ' ').slice(0, 150).trim();

  return { letra: letra || 'A', explicacao };
}

export async function executeAICall(provider, model, statement, alternatives) {
  const apiKey = getApiKeyFor(provider);
  const pConfig = PROVIDERS_CONFIG[provider];

  if (!apiKey && provider !== 'ollama') {
    throw new Error(`Chave de API do ${pConfig?.name || provider} não configurada. Insira sua chave no campo e clique em Salvar.`);
  }

  const prompt = buildPhDExamPrompt(statement, alternatives);

  // 1. Anthropic Claude Messages API
  if (provider === 'claude') {
    const selectedModel = (model || pConfig?.defaultModel || 'claude-3-7-sonnet-20250219').trim();
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
      const rawMsg = err.error?.message || `HTTP ${res.status}`;
      if (/credit balance is too low|insufficient credits|purchase credits/i.test(rawMsg)) {
        throw new Error('Saldo insuficiente na Anthropic ($0.00). Sua chave é válida, mas sua conta em console.anthropic.com precisa de créditos pré-pagos.');
      }
      if (res.status === 401 || /invalid api key/i.test(rawMsg)) {
        throw new Error('Chave da Anthropic Claude inválida ou revogada.');
      }
      throw new Error(rawMsg);
    }

    const data = await res.json();
    const content = data.content?.[0]?.text || '';
    return parseAIResponse(content);
  }

  // 2. Google Gemini Endpoint
  if (provider === 'gemini') {
    let selectedModel = (model || pConfig?.defaultModel || 'gemini-2.5-flash').replace(/^models\//, '').trim();
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
      if (/not_found|404|is not found/i.test(msg)) {
        throw new Error(`Modelo '${selectedModel}' não encontrado na API do Gemini. Use 'gemini-2.5-flash' ou 'gemini-2.0-flash'.`);
      }
      if (/api_key_invalid|invalid api key/i.test(msg)) {
        throw new Error('Chave da API do Google Gemini inválida.');
      }
      throw new Error(msg);
    }

    const data = await res.json();
    const txt = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return parseAIResponse(txt);
  }

  // 3. OpenRouter (com headers recomendados e roteamento de modelos gratuitos)
  if (provider === 'openrouter') {
    let selectedModel = (model || pConfig?.defaultModel || 'openrouter/free').trim();
    const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    const systemPrompt = `Você é um professor PhD especialista em provas acadêmicas e cálculo exato. Responda ESTRITAMENTE em formato JSON: {"letra": "A", "explicacao": "justificativa em 1 frase"}`;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://estudante.estacio.br',
      'X-Title': 'Estacio Suite AI'
    };

    // OpenRouter aceita lista de modelos de fallback no payload
    const payloadModels = [
      selectedModel,
      'openrouter/free',
      'google/gemma-4-31b-it:free',
      'google/gemma-4-26b-a4b-it:free',
      'nvidia/nemotron-3-ultra-550b-a55b:free',
      'minimax/minimax-m3:free',
      'z-ai/glm-5.2:free'
    ].filter((v, i, a) => a.indexOf(v) === i);

    let lastOpenRouterErr = null;
    // Tenta primeiro com fallback array do OpenRouter
    try {
      const res = await universalFetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          model: selectedModel,
          models: payloadModels,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1
        })
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || '';
        return parseAIResponse(content);
      } else {
        const err = await res.json().catch(() => ({}));
        lastOpenRouterErr = new Error(err.error?.message || `HTTP ${res.status}`);
      }
    } catch (netErr) {
      lastOpenRouterErr = netErr;
    }

    // Se falhou, tenta individualmente os principais modelos gratuitos do OpenRouter
    for (const fbModel of payloadModels) {
      if (fbModel === selectedModel) continue;
      try {
        const res = await universalFetch(endpoint, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            model: fbModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            temperature: 0.1
          })
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content || '';
          return parseAIResponse(content);
        }
      } catch (e) {}
    }

    throw lastOpenRouterErr || new Error('Falha na requisição ao OpenRouter');
  }

  // 4. OpenAI-compatible APIs (Groq, Ollama, Mistral, OpenAI, DeepSeek)
  const endpoint = pConfig?.endpoint || 'https://api.groq.com/openai/v1/chat/completions';
  let selectedModel = (model || pConfig?.defaultModel || 'llama-3.3-70b-versatile').trim();
  // Sanitiza traços unicode que podem corromper IDs
  selectedModel = selectedModel.replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-');

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
    const rawMsg = err.error?.message || `Erro HTTP ${res.status}`;
    if (provider === 'groq' && /does not exist|model_not_found/i.test(rawMsg)) {
      // Tenta fallback interno imediato para Llama 3.1 8B no Groq
      try {
        const fbRes = await universalFetch(endpoint, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            temperature: 0.1
          })
        });
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          const fbContent = fbData.choices?.[0]?.message?.content || '';
          return parseAIResponse(fbContent);
        }
      } catch (e) {}
    }
    throw new Error(rawMsg);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  return parseAIResponse(content);
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
    // 1. Auto-recovery para OpenRouter (tenta modelos free atualizados)
    if (provider === 'openrouter') {
      const openRouterFallbacks = [
        'openrouter/free',
        'google/gemma-4-31b-it:free',
        'google/gemma-4-26b-a4b-it:free',
        'nvidia/nemotron-3-ultra-550b-a55b:free',
        'minimax/minimax-m3:free',
        'z-ai/glm-5.2:free',
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
                warning: `O modelo ${modelToTest} não aceitou requisição no OpenRouter. Chave validada via ${fallbackModel}!`
              };
            }
          } catch (fbErr) {}
        }
      }
    }

    // 2. Auto-recovery para Google Gemini
    if (provider === 'gemini' && /quota|rate limit|429|no longer available|not_found|404|is not found/i.test(err.message)) {
      const geminiFallbacks = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.0-flash-lite'];
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
    if (provider === 'groq' && /quota|rate limit|429|does not exist/i.test(err.message)) {
      const groqFallbacks = ['llama-3.1-8b-instant', 'deepseek-r1-distill-llama-70b', 'llama-3.3-70b-versatile'];
      for (const fbModel of groqFallbacks) {
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
                warning: `Chave do Groq validada via ${fbModel}!`
              };
            }
          } catch (fbErr) {}
        }
      }
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
