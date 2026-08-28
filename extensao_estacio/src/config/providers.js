// Configuração de Modelos e Provedores de IA (Groq, Gemini, OpenRouter / Hermes, Ollama, Mistral, Claude, OpenAI, DeepSeek)

export const PROVIDERS_CONFIG = {
  groq: {
    name: "Groq",
    defaultModel: "llama-3.3-70b-versatile",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
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
    models: [
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash (🎁 Grátis • Raciocínio & Rapidez • Recomendado)", isFree: true },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (⚡ Grátis 1.500 req/dia • Mais Rápido)", isFree: true },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (🎁 Grátis 1.500 req/dia • Estável)", isFree: true },
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (🧠 Grátis Cota Diária • Máximo Raciocínio)", isFree: true },
      { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash-Lite (⚡ Grátis • Ultra Rápido)", isFree: true },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro (💎 Pago • Frontier Reasoning)", isFree: false }
    ]
  },
  openrouter: {
    name: "OpenRouter (Nous Hermes / Free Tier)",
    defaultModel: "openrouter/free",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    models: [
      { id: "openrouter/free", name: "OpenRouter Free Router (🔥 100% Grátis • Roteamento Automático)", isFree: true },
      { id: "google/gemma-4-31b-it:free", name: "Google Gemma 4 31B (🔥 100% Grátis)", isFree: true },
      { id: "google/gemma-4-26b-a4b-it:free", name: "Google Gemma 4 26B (🔥 100% Grátis)", isFree: true },
      { id: "nvidia/nemotron-3-ultra-550b-a55b:free", name: "NVIDIA Nemotron 3 Ultra (🔥 100% Grátis)", isFree: true },
      { id: "minimax/minimax-m3:free", name: "MiniMax M3 (🔥 100% Grátis)", isFree: true },
      { id: "z-ai/glm-5.2:free", name: "GLM 5.2 (🔥 100% Grátis)", isFree: true },
      { id: "liquid/lfm-2.5-2.6b:free", name: "Liquid LFM 2.5 (🔥 100% Grátis)", isFree: true },
      { id: "nousresearch/hermes-3-llama-3.1-405b", name: "Nous Hermes 3 405B (💎 Pago / Nous Research)", isFree: false },
      { id: "nousresearch/hermes-3-llama-3.1-70b", name: "Nous Hermes 3 70B (💎 Pago)", isFree: false }
    ]
  },
  ollama: {
    name: "Ollama (Local / Offline - 100% Grátis)",
    defaultModel: "llama3.3",
    endpoint: "http://localhost:11434/v1/chat/completions",
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
    models: [
      { id: "claude-3-7-sonnet-20250219", name: "Claude 3.7 Sonnet (💎 Pago • Raciocínio Híbrido)", isFree: false },
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet (💎 Pago • Alta Precisão)", isFree: false },
      { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku (💎 Pago • Ultra Rápido & Econômico)", isFree: false },
      { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku (💎 Pago • Econômico)", isFree: false },
      { id: "claude-3-opus-20240229", name: "Claude 3 Opus (💎 Pago • Frontier PhD)", isFree: false }
    ]
  },
  openai: {
    name: "OpenAI",
    defaultModel: "gpt-4o-mini",
    endpoint: "https://api.openai.com/v1/chat/completions",
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
    models: [
      { id: "deepseek-chat", name: "DeepSeek V3 (💎 Pago • Econômico)", isFree: false },
      { id: "deepseek-reasoner", name: "DeepSeek R1 (💎 Pago • Raciocínio Matemático Puro)", isFree: false }
    ]
  }
};
