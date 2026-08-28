// Estácio Solver Background Service Worker (Proxy Fetch & Multi-Model Support with Smart Auto-Fallback)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'PROXY_FETCH') {
    fetch(request.url, request.options || {})
      .then(async (res) => {
        const text = await res.text();
        let parsed = text;
        try {
          parsed = JSON.parse(text);
        } catch (e) {}

        const headerObj = {};
        res.headers.forEach((val, key) => {
          headerObj[key.toLowerCase()] = val;
        });

        sendResponse({
          success: true,
          status: res.status,
          statusText: res.statusText,
          headers: headerObj,
          data: parsed
        });
      })
      .catch((err) => {
        sendResponse({
          success: false,
          error: err.message
        });
      });
    return true; // Keep channel open for async response
  }

  if (request.type === 'CALL_AI') {
    handleAICallWithFallback(request.payload)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

function parseResponseText(txt) {
  if (!txt) return { letra: 'A', explicacao: '' };
  let letra = null;
  let explicacao = '';

  try {
    const jsonMatch = txt.match(/\{[\s\S]*?\}/);
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

  if (!letra) {
    const match = txt.match(/"letra"\s*:\s*"([A-E])"/i) ||
                  txt.match(/(?:letra|alternativa|opção|resposta|correta|item)\s*[:\s-]*\**([A-E])\b/i) ||
                  txt.match(/\b([A-E])\s*\)/i) ||
                  txt.match(/\b([A-E])\b/i);
    letra = match ? match[1].toUpperCase() : 'A';
  }

  if (!explicacao) {
    const expMatch = txt.match(/"explicacao"\s*:\s*"([^"]+)"/i);
    if (expMatch) {
      explicacao = expMatch[1].trim();
    } else {
      explicacao = txt.replace(/```(?:json)?[\s\S]*?```/gi, '').replace(/\{[\s\S]*?\}/g, '').trim();
    }
  }

  return {
    letra: letra || 'A',
    explicacao: (explicacao || txt).replace(/\s+/g, ' ').slice(0, 150).trim()
  };
}

async function handleAICallWithFallback(payload) {
  try {
    return await handleSingleAICall(payload);
  } catch (primaryError) {
    console.warn(`[AI Primary Error] ${payload.provider}: ${primaryError.message}. Tentando fallback...`);

    // Busca chaves salvas no storage para tentar fallback
    const settings = await new Promise(r => chrome.storage.local.get(null, r));
    const groqKey = settings.estacio_key_groq || settings.apiKey;
    const mistralKey = settings.estacio_key_mistral;
    const openrouterKey = settings.estacio_key_openrouter;

    // 1. Tenta Groq se houver chave
    if (groqKey && payload.provider !== 'groq') {
      try {
        return await handleSingleAICall({
          provider: 'groq',
          model: 'llama-3.3-70b-versatile',
          apiKey: groqKey,
          prompt: payload.prompt
        });
      } catch (groqErr) {
        console.warn('[AI Fallback] Groq falhou, tentando próxima opção...');
      }
    }

    // 2. Tenta OpenRouter se houver chave
    if (openrouterKey && payload.provider !== 'openrouter') {
      try {
        return await handleSingleAICall({
          provider: 'openrouter',
          model: 'openrouter/free',
          apiKey: openrouterKey,
          prompt: payload.prompt
        });
      } catch (orErr) {}
    }

    // 3. Tenta Mistral se houver chave
    if (mistralKey && payload.provider !== 'mistral') {
      try {
        return await handleSingleAICall({
          provider: 'mistral',
          model: 'codestral-latest',
          apiKey: mistralKey,
          prompt: payload.prompt
        });
      } catch (mistralErr) {}
    }

    throw primaryError;
  }
}

async function handleSingleAICall(payload) {
  const { provider, apiKey, model, endpoint: customEndpoint, prompt } = payload;

  if (!apiKey && provider !== 'ollama') {
    throw new Error(`Chave de API para ${provider} não configurada. Abra as opções da extensão.`);
  }

  const systemPrompt = `Você é um professor PhD especialista em provas acadêmicas e cálculo exato. Responda ESTRITAMENTE em formato JSON: {"letra": "A", "explicacao": "justificativa curta em 1 frase"}`;

  // 1. Anthropic Claude
  if (provider === 'claude') {
    const selectedModel = (model || 'claude-3-7-sonnet-20250219').trim();
    const res = await fetch('https://api.anthropic.com/v1/messages', {
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
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.error?.message || `HTTP ${res.status}`;
      if (/credit balance is too low|purchase credits/i.test(msg)) {
        throw new Error('Saldo insuficiente na Anthropic ($0.00). Adicione créditos em console.anthropic.com.');
      }
      throw new Error(msg);
    }

    const data = await res.json();
    const txt = data.content?.[0]?.text || '';
    return parseResponseText(txt);
  }

  // 2. Google Gemini
  if (provider === 'gemini') {
    let selectedModel = (model || 'gemini-2.5-flash').replace(/^models\//, '').trim();
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
    return parseResponseText(txt);
  }

  // 3. OpenAI / DeepSeek / Groq / OpenRouter / Ollama / Mistral / Custom
  let endpoint = '';
  const headers = {
    'Content-Type': 'application/json'
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  if (provider === 'openai') endpoint = 'https://api.openai.com/v1/chat/completions';
  else if (provider === 'deepseek') endpoint = 'https://api.deepseek.com/v1/chat/completions';
  else if (provider === 'groq') endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  else if (provider === 'openrouter') {
    endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    headers['HTTP-Referer'] = 'https://estudante.estacio.br';
    headers['X-Title'] = 'Estacio Suite AI';
  }
  else if (provider === 'ollama') endpoint = 'http://localhost:11434/v1/chat/completions';
  else if (provider === 'mistral') endpoint = 'https://api.mistral.ai/v1/chat/completions';
  else endpoint = customEndpoint || 'https://api.groq.com/openai/v1/chat/completions';

  let selectedModel = (model || (provider === 'groq' ? 'llama-3.3-70b-versatile' : provider === 'openrouter' ? 'openrouter/free' : 'codestral-latest')).trim();
  selectedModel = selectedModel.replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-');

  const response = await fetch(endpoint, {
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

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error?.message || `Erro HTTP ${response.status} ao consultar IA`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  return parseResponseText(content);
}
