// Sistema de Revisão Individual com Segunda Opinião e Mapeamento Visual

import { PROVIDERS_CONFIG } from '../config/providers.js';
import { executeAICall } from '../core/ai_engine.js';
import { clickOptionReact } from '../core/react_fiber.js';
import { navigateToQuestionCard, extractStatement, extractAlternatives } from './dom_parser.js';
import { updateGabaritoQuestion } from './gabarito.js';

export async function reviewSingleQuestion(qNum, targetProvider, onLog, onGabaritoUpdated) {
  if (!qNum || isNaN(qNum)) return;
  const pName = PROVIDERS_CONFIG[targetProvider]?.name || targetProvider;

  updateGabaritoQuestion(qNum, { status: 'processing' });
  if (onGabaritoUpdated) onGabaritoUpdated();

  if (onLog) onLog(`[Revisão Q${qNum}] 🔍 Consultando 2ª Opinião com ${pName}...`, 'info');

  const qCard = await navigateToQuestionCard(qNum);
  if (!qCard || !qCard.element) {
    if (onLog) onLog(`[Revisão Q${qNum}] Card da questão não encontrado na página.`, 'error');
    updateGabaritoQuestion(qNum, { status: 'failed', error: 'Card não localizado' });
    if (onGabaritoUpdated) onGabaritoUpdated();
    return;
  }

  const statement = extractStatement(qCard.element, qNum);
  const alternatives = extractAlternatives(qCard.element);

  if (alternatives.length < 2) {
    if (onLog) onLog(`[Revisão Q${qNum}] Alternativas não encontradas.`, 'error');
    updateGabaritoQuestion(qNum, { status: 'failed', error: 'Alternativas insuficientes' });
    if (onGabaritoUpdated) onGabaritoUpdated();
    return;
  }

  try {
    const model = PROVIDERS_CONFIG[targetProvider]?.defaultModel;
    const ans = await executeAICall(targetProvider, model, statement, alternatives);
    const chosenLetter = ans.letra?.toUpperCase() || 'A';

    if (onLog) {
      onLog(`[Revisão Q${qNum}] ✅ ${pName} sugere alternativa: [ ${chosenLetter} ] (${ans.explicacao || ''})`, 'success');
    }

    const target = alternatives.find(o => o.letter === chosenLetter);
    if (target && target.element) {
      clickOptionReact(target.element);
    }

    updateGabaritoQuestion(qNum, {
      status: 'done',
      letter: chosenLetter,
      explanation: `[Revisado por ${pName}] ${ans.explicacao || ''}`,
      error: null
    });
    if (onGabaritoUpdated) onGabaritoUpdated();

  } catch (err) {
    if (onLog) onLog(`[Revisão Q${qNum}] Erro: ${err.message}`, 'error');
    updateGabaritoQuestion(qNum, {
      status: 'failed',
      error: err.message
    });
    if (onGabaritoUpdated) onGabaritoUpdated();
  }
}
