// Estácio Solver - AI Interaction Helper (Multi-Model)

window.EstacioSolver = {
  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['provider', 'model', 'apiKey', 'endpoint', 'apiKeys'], (items) => {
        let provider = items.provider || 'gemini';
        let model = items.model || 'gemini-flash-latest';

        // Auto-migração de modelos legados descontinuados pelo Google
        if (provider === 'gemini' && (model.includes('1.5') || model.includes('2.0'))) {
          model = 'gemini-flash-latest';
        }

        let apiKeys = items.apiKeys || {};
        let apiKey = items.apiKey || apiKeys[provider] || '';

        resolve({
          provider: provider,
          model: model,
          apiKey: apiKey,
          endpoint: items.endpoint || ''
        });
      });
    });
  },

  formatPrompt(statement, alternatives) {
    let prompt = `Você é um professor PhD especialista em provas acadêmicas e cálculo exato.
Analise a questão passo a passo com raciocínio rigoroso e selecione a alternativa correta (A, B, C, D ou E).

ENUNCIADO:
${statement}

ALTERNATIVAS:
`;
    for (const alt of alternatives) {
      prompt += `${alt.letter}) ${alt.text}\n`;
    }

    prompt += `\nResponda ESTRITAMENTE em formato JSON:
{
  "letra": "A",
  "explicacao": "justificativa em 1 frase"
}`;
    return prompt;
  },

  async solveQuestion(data) {
    const settings = await this.getSettings();
    const prompt = this.formatPrompt(data.statement, data.alternatives);

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        type: 'CALL_AI',
        payload: {
          provider: settings.provider,
          apiKey: settings.apiKey,
          model: settings.model,
          endpoint: settings.endpoint,
          prompt: prompt
        }
      }, (response) => {
        if (!response) {
          reject(new Error('Erro de comunicação com a extensão.'));
          return;
        }
        if (!response.success) {
          reject(new Error(response.error || 'Falha ao resolver questão'));
          return;
        }
        resolve(response.data);
      });
    });
  }
};
