// Orquestrador de Resolução de Provas e Simulados

import { PROVIDERS_CONFIG } from '../config/providers.js';
import { callAIWithFallback } from '../core/ai_engine.js';
import { clickOptionReact } from '../core/react_fiber.js';
import { getQuestionCards, extractStatement, extractAlternatives } from './dom_parser.js';
import { saveGabarito } from './gabarito.js';

export async function runExamQueue(provider, model, onLog, onGabaritoUpdated) {
  const cards = getQuestionCards();
  const total = cards.length;
  const pName = PROVIDERS_CONFIG[provider]?.name || provider;

  if (onLog) onLog(`Iniciando resolução com ${pName} (${model}) [${total} questões]...`, 'info');

  if (total === 0) {
    if (onLog) onLog('Nenhuma questão encontrada na página.', 'error');
    return;
  }

  const gabaritoList = [];

  for (let i = 0; i < total; i++) {
    const q = cards[i];
    if (onLog) onLog(`[${i + 1}/${total}] Processando Questão ${q.index}...`, 'info');

    if (q.element) {
      q.element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      await new Promise(r => setTimeout(r, 300));
    }

    const statement = extractStatement(q.element, q.index);
    const alternatives = extractAlternatives(q.element);

    if (alternatives.length < 2) {
      if (onLog) onLog(`[${i + 1}/${total}] Alternativas não encontradas.`, 'error');
      continue;
    }

    try {
      if (onLog) onLog(`[${i + 1}/${total}] Consultando IA (${pName})...`, 'info');
      const ans = await callAIWithFallback(provider, model, statement, alternatives, onLog);
      const chosenLetter = ans.letra?.toUpperCase() || 'A';

      if (onLog) onLog(`[${i + 1}/${total}] -> Resposta: ${chosenLetter} (${ans.explicacao || ''})`, 'success');

      gabaritoList.push({
        q: q.index,
        letter: chosenLetter,
        explanation: ans.explicacao || ''
      });

      saveGabarito(`${pName} (${model})`, gabaritoList);
      if (onGabaritoUpdated) onGabaritoUpdated();

      const target = alternatives.find(o => o.letter === chosenLetter);
      if (target && target.element) {
        clickOptionReact(target.element);
      }
    } catch (err) {
      if (onLog) onLog(`[${i + 1}/${total}] Erro: ${err.message}`, 'error');
    }

    await new Promise(r => setTimeout(r, 500));
  }

  if (onLog) onLog('🎉 Prova respondida e Gabarito Salvo com Sucesso! 📝', 'success');
  if (onGabaritoUpdated) onGabaritoUpdated();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
