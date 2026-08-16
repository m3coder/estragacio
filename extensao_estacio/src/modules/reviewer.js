// Sistema de Revisão Individual com Segunda Opinião

import { PROVIDERS_CONFIG } from '../config/providers.js';
import { executeAICall } from '../core/ai_engine.js';
import { clickOptionReact } from '../core/react_fiber.js';
import { getQuestionCards, extractStatement, extractAlternatives } from './dom_parser.js';
import { getSavedGabarito, saveGabarito } from './gabarito.js';

export async function reviewSingleQuestion(qNum, targetProvider, onLog, onBadgeStateChange, onGabaritoUpdated) {
  if (!qNum || isNaN(qNum)) return;
  const cards = getQuestionCards();
  const q = cards.find(c => c.index === qNum);
  const pName = PROVIDERS_CONFIG[targetProvider]?.name || targetProvider;

  if (!q || !q.element) {
    if (onLog) onLog(`Questão ${qNum} não encontrada na página.`, 'error');
    return;
  }

  if (onBadgeStateChange) onBadgeStateChange(qNum, true);

  if (onLog) onLog(`[Revisão Q${qNum}] 🔍 Consultando ${pName}...`, 'info');
  q.element.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const statement = extractStatement(q.element, qNum);
  const alternatives = extractAlternatives(q.element);

  if (alternatives.length < 2) {
    if (onLog) onLog(`[Revisão Q${qNum}] Alternativas não encontradas.`, 'error');
    if (onBadgeStateChange) onBadgeStateChange(qNum, false);
    return;
  }

  try {
    const model = PROVIDERS_CONFIG[targetProvider]?.defaultModel;
    const ans = await executeAICall(targetProvider, model, statement, alternatives);
    const chosenLetter = ans.letra?.toUpperCase() || 'A';

    if (onLog) {
      onLog(`[Revisão Q${qNum}] ✅ ${pName} sugere alternativa: [ ${chosenLetter} ] (${ans.explicacao || ''})`, 'success');
    }

    // Aplica a nova resposta na tela
    const target = alternatives.find(o => o.letter === chosenLetter);
    if (target && target.element) {
      clickOptionReact(target.element);
    }

    // Atualiza o Gabarito Salvo
    let gabData = getSavedGabarito() || { timestamp: new Date().toLocaleString(), provider: targetProvider, answers: [] };
    const existingIdx = gabData.answers.findIndex(a => a.q === qNum);

    if (existingIdx >= 0) {
      gabData.answers[existingIdx].letter = chosenLetter;
      gabData.answers[existingIdx].explanation = `[Revisado por ${pName}] ${ans.explicacao || ''}`;
    } else {
      gabData.answers.push({ q: qNum, letter: chosenLetter, explanation: ans.explicacao || '' });
      gabData.answers.sort((a, b) => a.q - b.q);
    }

    saveGabarito(gabData.provider, gabData.answers);
    if (onGabaritoUpdated) onGabaritoUpdated();

  } catch (err) {
    if (onLog) onLog(`[Revisão Q${qNum}] Erro: ${err.message}`, 'error');
  } finally {
    if (onBadgeStateChange) onBadgeStateChange(qNum, false);
  }
}
