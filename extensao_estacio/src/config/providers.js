// Configuração de Modelos e Provedores de IA (Groq, Mistral, Gemini, Claude, OpenAI, DeepSeek)

export const PROVIDERS_CONFIG = {
  groq: {
    name: "Groq",
    defaultModel: "llama-3.3-70b-versatile",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    models: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (Recomendado)" },
      { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 Distill 70B" },
      { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (Instantâneo)" }
    ]
  },
  claude: {
    name: "Anthropic Claude",
    defaultModel: "claude-3-7-sonnet-20250219",
    endpoint: "https://api.anthropic.com/v1/messages",
    models: [
      { id: "claude-3-7-sonnet-20250219", name: "Claude 3.7 Sonnet (Raciocínio Híbrido)" },
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet (Alta Precisão)" },
      { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku (Ultra Rápido)" }
    ]
  },
  mistral: {
    name: "Mistral AI",
    defaultModel: "mistral-large-latest",
    endpoint: "https://api.mistral.ai/v1/chat/completions",
    models: [
      { id: "mistral-large-latest", name: "Mistral Large (PhD / Mais Preciso)" },
      { id: "codestral-latest", name: "Codestral (Lógica & Código)" },
      { id: "mistral-small-latest", name: "Mistral Small" }
    ]
  },
  gemini: {
    name: "Google Gemini",
    defaultModel: "gemini-flash-latest",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models",
    models: [
      { id: "gemini-flash-latest", name: "Gemini Flash Latest (Grátis)" },
      { id: "gemini-pro-latest", name: "Gemini Pro Latest (Alta Precisão)" },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" }
    ]
  },
  openai: {
    name: "OpenAI",
    defaultModel: "gpt-4o",
    endpoint: "https://api.openai.com/v1/chat/completions",
    models: [
      { id: "gpt-4o", name: "GPT-4o (Precisão Máxima)" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini (Econômico)" },
      { id: "o3-mini", name: "o3-mini (Raciocínio)" }
    ]
  },
  deepseek: {
    name: "DeepSeek",
    defaultModel: "deepseek-chat",
    endpoint: "https://api.deepseek.com/v1/chat/completions",
    models: [
      { id: "deepseek-chat", name: "DeepSeek V3" },
      { id: "deepseek-reasoner", name: "DeepSeek R1 (Raciocínio Puro)" }
    ]
  }
};
