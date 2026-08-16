// Formatador de Prompts Especializados

export function buildPhDExamPrompt(statement, alternatives) {
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
}
