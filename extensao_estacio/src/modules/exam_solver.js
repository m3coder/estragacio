// Orquestrador de Resolução de Provas e Simulados (com Retomada Incremental e Intervalo Anti-Rate-Limit)

import { PROVIDERS_CONFIG } from '../config/providers.js';
import { callAIWithFallback } from '../core/ai_engine.js';
import { clickOptionReact } from '../core/react_fiber.js';
import { getQuestionCards, extractStatement, extractAlternatives } from './dom_parser.js';
import { saveGabarito, getSavedGabarito } from './gabarito.js';

export async function runExamQueue(provider, model, onLog, onGabaritoUpdated) {
  const cards = getQuestionCards();
  const total = cards.length;
  const pName = PROVIDERS_CONFIG[provider]?.name || provider;

  if (total === 0) {
    if (onLog) onLog('Nenhuma questão encontrada na página.', 'error');
    return;
  }

  // Carrega respostas já obtidas anteriormente para não refazer do zero
  const existingGabarito = getSavedGabarito()?.answers || [];
  const gabaritoMap = new Map();
  existingGabarito.forEach(a => {
    if (a.q && a.letter && !a.explanation?.toLowerCase().includes('dados insuficientes') && !a.explanation?.toLowerCase().includes('erro')) {
      gabaritoMap.set(a.q, a);
    }
  });

  const alreadyCount = gabaritoMap.size;
  if (alreadyCount > 0 && onLog) {
    onLog(`Retomando prova: ${alreadyCount} questão(ões) já respondidas anteriormente serão aproveitadas! ⏩`, 'info');
  } else if (onLog) {
    onLog(`Iniciando resolução com ${pName} (${model}) [${total} questões]...`, 'info');
  }

  for (let i = 0; i < total; i++) {
    const q = cards[i];

    if (q.element) {
      q.element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      await new Promise(r => setTimeout(r, 250));
    }

    const statement = extractStatement(q.element, q.index);
    const alternatives = extractAlternatives(q.element);

    if (alternatives.length < 2) {
      if (onLog) onLog(`[${i + 1}/${total}] Alternativas não encontradas.`, 'error');
      continue;
    }

    // 1. CASO JÁ TENHA RESPOSTA SALVA: Apenas remarca na tela sem gastar cota de IA
    if (gabaritoMap.has(q.index)) {
      const saved = gabaritoMap.get(q.index);
      const chosenLetter = saved.letter;
      if (onLog) onLog(`[${i + 1}/${total}] Questão ${q.index} já respondida: [ ${chosenLetter} ] -> Marcando na tela ✅`, 'success');

      const target = alternatives.find(o => o.letter === chosenLetter);
      if (target && target.element) {
        clickOptionReact(target.element);
      }
      await new Promise(r => setTimeout(r, 350));
      continue;
    }

    // 2. CASO SEJA UMA QUESTÃO PENDENTE: Consulta IA com multi-fallback
    if (onLog) onLog(`[${i + 1}/${total}] Processando Questão ${q.index}...`, 'info');

    try {
      if (onLog) onLog(`[${i + 1}/${total}] Consultando IA (${pName})...`, 'info');
      const ans = await callAIWithFallback(provider, model, statement, alternatives, onLog);
      const chosenLetter = ans.letra?.toUpperCase() || 'A';

      if (onLog) onLog(`[${i + 1}/${total}] -> Resposta: ${chosenLetter} (${ans.explicacao || ''})`, 'success');

      gabaritoMap.set(q.index, {
        q: q.index,
        letter: chosenLetter,
        explanation: ans.explicacao || ''
      });

      // Salva imediatamente para não perder o progresso se houver falha na próxima
      const currentList = Array.from(gabaritoMap.values()).sort((a, b) => a.q - b.q);
      saveGabarito(`${pName} (${model})`, currentList);
      if (onGabaritoUpdated) onGabaritoUpdated();

      const target = alternatives.find(o => o.letter === chosenLetter);
      if (target && target.element) {
        clickOptionReact(target.element);
      }

      // Intervalo inteligente anti-429 entre chamadas de IA (1.8s a 2.5s)
      const pauseMs = Math.floor(Math.random() * (2500 - 1800 + 1)) + 1800;
      await new Promise(r => setTimeout(r, pauseMs));

    } catch (err) {
      if (onLog) onLog(`[${i + 1}/${total}] Questão ${q.index} falhou: ${err.message.slice(0, 90)}`, 'error');
      // Pausa de 3s após erro para aliviar cota antes da próxima questão
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  const finalCount = gabaritoMap.size;
  if (finalCount >= total) {
    if (onLog) onLog('🎉 Todas as 10 questões foram respondidas e salvas no Gabarito! 📝🏆', 'success');
  } else {
    if (onLog) onLog(`⚠️ Prova pausada: ${finalCount}/${total} respondidas. Clique novamente em Resolver para continuar as restantes!`, 'warning');
  }

  if (onGabaritoUpdated) onGabaritoUpdated();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
