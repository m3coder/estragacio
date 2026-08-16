// Orquestrador de Resolução de Provas e Simulados (Fila Completa, Retry Individual e Aplicação Instantânea de Gabarito)

import { PROVIDERS_CONFIG } from '../config/providers.js';
import { callAIWithFallback, executeAICall } from '../core/ai_engine.js';
import { clickOptionReact } from '../core/react_fiber.js';
import { getQuestionCards, getTotalExamQuestionsCount, navigateToQuestionCard, extractStatement, extractAlternatives } from './dom_parser.js';
import { getSavedGabarito, saveGabarito, initGabaritoStructure, updateGabaritoQuestion } from './gabarito.js';
import { playSuccessSound, playCelebrationFanfare, playAttentionSound } from './audio_alerts.js';

export async function runExamQueue(provider, model, onLog, onGabaritoUpdated) {
  const total = getTotalExamQuestionsCount();
  const pName = PROVIDERS_CONFIG[provider]?.name || provider;

  if (total === 0) {
    if (onLog) onLog('Nenhuma questão encontrada na página.', 'error');
    return;
  }

  // 1. Mapeia e inicializa visualmente todas as questões imediatamente no Gabarito
  initGabaritoStructure(total, `${pName} (${model})`);
  if (onGabaritoUpdated) onGabaritoUpdated();

  const existingData = getSavedGabarito() || { answers: [] };
  const doneQuestions = new Set(
    existingData.answers
      .filter(a => a.status === 'done' || (a.letter && a.status !== 'failed'))
      .map(a => a.q)
  );

  const alreadyCount = doneQuestions.size;
  if (alreadyCount > 0 && onLog) {
    onLog(`Retomando prova: ${alreadyCount}/${total} questão(ões) já concluídas anteriormente! ⏩`, 'info');
  } else if (onLog) {
    onLog(`Iniciando resolução com ${pName} (${model}) [${total} questões mapeadas]...`, 'info');
  }

  for (let qNum = 1; qNum <= total; qNum++) {
    // Se já estiver concluída, apenas garante que está marcada na tela
    if (doneQuestions.has(qNum)) {
      const saved = existingData.answers.find(a => a.q === qNum);
      if (onLog) onLog(`[${qNum}/${total}] Questão ${qNum} já respondida: [ ${saved?.letter} ] ✅`, 'info');
      
      const qCard = await navigateToQuestionCard(qNum);
      if (qCard && qCard.element) {
        const alternatives = extractAlternatives(qCard.element);
        const target = alternatives.find(o => o.letter === saved?.letter);
        if (target && target.element) clickOptionReact(target.element);
      }
      continue;
    }

    // Marca questão como processando ao vivo
    updateGabaritoQuestion(qNum, { status: 'processing', provider: `${pName} (${model})` });
    if (onGabaritoUpdated) onGabaritoUpdated();

    if (onLog) onLog(`[${qNum}/${total}] Processando Questão ${qNum}...`, 'info');

    const qCard = await navigateToQuestionCard(qNum);
    if (!qCard || !qCard.element) {
      if (onLog) onLog(`[${qNum}/${total}] Não foi possível localizar o card da Questão ${qNum}.`, 'error');
      updateGabaritoQuestion(qNum, { status: 'failed', error: 'Card não localizado no DOM' });
      if (onGabaritoUpdated) onGabaritoUpdated();
      continue;
    }

    const statement = extractStatement(qCard.element, qNum);
    const alternatives = extractAlternatives(qCard.element);

    if (alternatives.length < 2) {
      if (onLog) onLog(`[${qNum}/${total}] Alternativas não encontradas na Questão ${qNum}.`, 'error');
      updateGabaritoQuestion(qNum, { status: 'failed', error: 'Alternativas insuficientes' });
      if (onGabaritoUpdated) onGabaritoUpdated();
      continue;
    }

    try {
      if (onLog) onLog(`[${qNum}/${total}] Consultando IA (${pName})...`, 'info');
      const ans = await callAIWithFallback(provider, model, statement, alternatives, onLog);
      const chosenLetter = ans.letra?.toUpperCase() || 'A';

      if (onLog) onLog(`[${qNum}/${total}] -> Resposta: ${chosenLetter} (${ans.explicacao || ''})`, 'success');

      // Marca a alternativa na tela
      const target = alternatives.find(o => o.letter === chosenLetter);
      if (target && target.element) {
        clickOptionReact(target.element);
      }

      try { playAttentionSound(); } catch (e) {}

      // Atualiza o Gabarito com status concluído (Verde)
      updateGabaritoQuestion(qNum, {
        status: 'done',
        letter: chosenLetter,
        explanation: ans.explicacao || '',
        error: null
      });
      doneQuestions.add(qNum);
      if (onGabaritoUpdated) onGabaritoUpdated();

      // Intervalo inteligente anti-429 entre chamadas (1.5s a 2.2s)
      const pauseMs = Math.floor(Math.random() * (2200 - 1500 + 1)) + 1500;
      await new Promise(r => setTimeout(r, pauseMs));

    } catch (err) {
      if (onLog) onLog(`[${qNum}/${total}] Questão ${qNum} falhou: ${err.message.slice(0, 85)}`, 'error');
      updateGabaritoQuestion(qNum, {
        status: 'failed',
        error: err.message.slice(0, 90)
      });
      if (onGabaritoUpdated) onGabaritoUpdated();
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  const finalData = getSavedGabarito();
  const finalDone = finalData?.answers?.filter(a => a.status === 'done' || a.letter).length || 0;

  if (finalDone >= total) {
    try { playCelebrationFanfare(); } catch (e) {}
    if (onLog) onLog('🎉 Todas as 10 questões foram respondidas e salvas com sucesso! 📝🏆', 'success');
  } else {
    if (onLog) onLog(`⚠️ Prova em andamento: ${finalDone}/${total} concluídas. Clique nos badges vermelhos para tentar novamente!`, 'warning');
  }

  if (onGabaritoUpdated) onGabaritoUpdated();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export async function solveSingleQuestion(qNum, provider, model, onLog, onGabaritoUpdated) {
  if (!qNum || isNaN(qNum)) return;
  const pName = PROVIDERS_CONFIG[provider]?.name || provider;

  updateGabaritoQuestion(qNum, { status: 'processing' });
  if (onGabaritoUpdated) onGabaritoUpdated();

  if (onLog) onLog(`[Retry/Resolver Q${qNum}] 🎯 Focando na Questão ${qNum}...`, 'info');

  const qCard = await navigateToQuestionCard(qNum);
  if (!qCard || !qCard.element) {
    if (onLog) onLog(`[Q${qNum}] Questão ${qNum} não encontrada na página.`, 'error');
    updateGabaritoQuestion(qNum, { status: 'failed', error: 'Card não encontrado' });
    if (onGabaritoUpdated) onGabaritoUpdated();
    return;
  }

  const statement = extractStatement(qCard.element, qNum);
  const alternatives = extractAlternatives(qCard.element);

  if (alternatives.length < 2) {
    if (onLog) onLog(`[Q${qNum}] Alternativas não encontradas.`, 'error');
    updateGabaritoQuestion(qNum, { status: 'failed', error: 'Alternativas não encontradas' });
    if (onGabaritoUpdated) onGabaritoUpdated();
    return;
  }

  try {
    if (onLog) onLog(`[Q${qNum}] Consultando ${pName} (${model})...`, 'info');
    const ans = await callAIWithFallback(provider, model, statement, alternatives, onLog);
    const chosenLetter = ans.letra?.toUpperCase() || 'A';

    if (onLog) {
      onLog(`[Q${qNum}] ✅ Resolvida com sucesso: [ ${chosenLetter} ] (${ans.explicacao || ''})`, 'success');
    }

    const target = alternatives.find(o => o.letter === chosenLetter);
    if (target && target.element) {
      clickOptionReact(target.element);
    }

    try { playSuccessSound(); } catch (e) {}

    updateGabaritoQuestion(qNum, {
      status: 'done',
      letter: chosenLetter,
      explanation: ans.explicacao || '',
      error: null
    });
    if (onGabaritoUpdated) onGabaritoUpdated();

  } catch (err) {
    if (onLog) onLog(`[Q${qNum}] ❌ Falha no retry: ${err.message}`, 'error');
    updateGabaritoQuestion(qNum, {
      status: 'failed',
      error: err.message
    });
    if (onGabaritoUpdated) onGabaritoUpdated();
  }
}

// APLICAÇÃO INSTANTÂNEA DAS RESPOSTAS DO GABARITO DIRETO NA PROVA (ZERO IA / SEM GASTAR COTA)
export async function applySavedGabaritoToDOM(onLog, onGabaritoUpdated) {
  const gabData = getSavedGabarito();
  const answers = gabData?.answers?.filter(a => a.letter) || [];

  if (answers.length === 0) {
    if (onLog) onLog('⚠️ Nenhum gabarito com respostas salvo para aplicar. Resolva as questões primeiro!', 'warning');
    return;
  }

  if (onLog) onLog(`⚡ Aplicando ${answers.length} respostas salvas diretamente na prova (0 IA)...`, 'info');

  let markedCount = 0;
  for (let i = 0; i < answers.length; i++) {
    const a = answers[i];
    const qNum = a.q;
    const chosenLetter = a.letter;

    const qCard = await navigateToQuestionCard(qNum);
    if (qCard && qCard.element) {
      const alternatives = extractAlternatives(qCard.element);
      const target = alternatives.find(o => o.letter === chosenLetter);
      if (target && target.element) {
        clickOptionReact(target.element);
        markedCount++;
        if (onLog) onLog(`[${i + 1}/${answers.length}] Q${qNum} marcada com [ ${chosenLetter} ] ✅`, 'success');
      } else {
        if (onLog) onLog(`[${i + 1}/${answers.length}] Q${qNum}: Alternativa ${chosenLetter} não encontrada na tela.`, 'warning');
      }
    } else {
      if (onLog) onLog(`[${i + 1}/${answers.length}] Q${qNum}: Card não localizado no DOM.`, 'error');
    }

    await new Promise(r => setTimeout(r, 200));
  }

  if (onLog) {
    if (markedCount > 0) {
      onLog(`🎉 Gabarito aplicado com sucesso! ${markedCount}/${answers.length} questões marcadas na prova.`, 'success');
    } else {
      onLog(`⚠️ Nenhuma questão pôde ser marcada na tela.`, 'error');
    }
  }

  if (onGabaritoUpdated) onGabaritoUpdated();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
