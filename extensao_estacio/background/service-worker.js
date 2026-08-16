// Estácio Solver Background Service Worker (Multi-Model Support with Smart Auto-Fallback)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CALL_AI') {
    handleAICallWithFallback(request.payload)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function handleAICallWithFallback(payload) {
  try {
    return await handleSingleAICall(payload);
  } catch (primaryError) {
    console.warn(`[AI Primary Error] ${payload.provider}: ${primaryError.message}. Tentando fallback...`);

    // Busca chaves salvas no storage para tentar fallback
    const settings = await new Promise(r => chrome.storage.sync.get(['apiKeys', 'apiKey'], r));
    const keys = settings.apiKeys || {};

    if (payload.provider === 'gemini' || primaryError.message.includes('high demand') || primaryError.message.includes('503') || primaryError.message.includes('quota')) {
      // 1. Tenta Groq se houver chave
      if (keys.groq) {
        try {
          return await handleSingleAICall({
            provider: 'groq',
            model: 'llama-3.3-70b-versatile',
            apiKey: keys.groq,
            prompt: payload.prompt
          });
        } catch (groqErr) {
          console.warn('[AI Fallback] Groq falhou, tentando próxima opção...');
        }
      }

      // 2. Tenta Mistral se houver chave
      if (keys.mistral) {
        try {
          return await handleSingleAICall({
            provider: 'mistral',
            model: 'mistral-large-latest',
            apiKey: keys.mistral,
            prompt: payload.prompt
          });
        } catch (mistralErr) {}
      }
    }

    throw primaryError;
  }
}

async function handleSingleAICall(payload) {
  const { provider, apiKey, model, endpoint: customEndpoint, prompt } = payload;

  if (!apiKey) {
    throw new Error(`Chave de API para ${provider} não configurada. Abra as opções da extensão.`);
  }

  // 1. Google Gemini
  if (provider === 'gemini') {
    let selectedModel = model || 'gemini-flash-latest';
    if (selectedModel.includes('1.5') || selectedModel.includes('2.0') || !selectedModel) {
      selectedModel = 'gemini-flash-latest';
    }

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
      throw new Error(err.error?.message || `Erro HTTP ${res.status}`);
    }

    const data = await res.json();
    const txt = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const match = txt.match(/"letra"\s*:\s*"([A-E])"/i) || txt.match(/\b([A-E])\b/i);
    return { letra: match ? match[1].toUpperCase() : 'A', explicacao: txt.slice(0, 100) };
  }

  // 2. OpenAI / DeepSeek / Groq / Mistral / Custom
  let endpoint = '';
  if (provider === 'openai') endpoint = 'https://api.openai.com/v1/chat/completions';
  else if (provider === 'deepseek') endpoint = 'https://api.deepseek.com/v1/chat/completions';
  else if (provider === 'groq') endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  else if (provider === 'mistral') endpoint = 'https://api.mistral.ai/v1/chat/completions';
  else endpoint = customEndpoint || 'https://api.mimocode.com/v1/chat/completions';

  const systemPrompt = `Você é um professor PhD especialista em provas acadêmicas e cálculo exato. Responda ESTRITAMENTE em formato JSON: {"letra": "A", "explicacao": "justificativa curta em 1 frase"}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || (provider === 'groq' ? 'llama-3.3-70b-versatile' : 'mistral-large-latest'),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1
    })
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error?.message || `Erro HTTP ${response.status} ao consultar IA`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  const match = content.match(/"letra"\s*:\s*"([A-E])"/i) || content.match(/\b([A-E])\b/i);
  return {
    letra: match ? match[1].toUpperCase() : 'A',
    explicacao: content.slice(0, 100)
  };
}
