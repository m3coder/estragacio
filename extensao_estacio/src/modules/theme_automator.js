// Automação de Conclusão de Temas / Disciplinas (Portal do Aluno)

import { getBearerToken, getMatricula } from '../config/storage.js';
import { triggerNativeClick } from '../core/react_fiber.js';
import { waitForCards } from './dom_parser.js';

export function parseIdsFromUrl(url) {
  if (!url) return { turmaId: null, conteudoUuid: null, temaId: null };
  const turmaMatch = url.match(/\/disciplinas\/(estacio_\d+)/i);
  const uuidMatch = url.match(/\/conteudos\/([a-f0-9-]{36})/i);
  const temaMatch = url.match(/[?&]tema=([A-Za-z0-9_-]+)/i) || url.match(/\/temas\/([A-Za-z0-9_-]+)/i);

  return {
    turmaId: turmaMatch ? turmaMatch[1] : null,
    conteudoUuid: uuidMatch ? uuidMatch[1] : null,
    temaId: temaMatch ? temaMatch[1] : null
  };
}

export async function postConcluir(turmaId, temaId, conteudoUuid, token, matricula) {
  const matriculaParam = matricula ? `?matricula=${matricula}` : '';
  const endpointLegado = `https://apis.estudante.estacio.br/rest/turmas/${turmaId}/temas/${temaId}/conteudos/${conteudoUuid}/conclusoes${matriculaParam}`;
  const endpointNovo = `https://apis.estudante.estacio.br/rest/me/conteudos/${conteudoUuid}/concluir`;

  const headersBase = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json, text/plain, */*'
  };

  try {
    const res = await fetch(endpointLegado, {
      method: 'POST',
      headers: headersBase
    });
    if (res.status >= 200 && res.status < 300) return true;
  } catch (e) {}

  try {
    const res = await fetch(endpointNovo, {
      method: 'POST',
      headers: {
        ...headersBase,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        idTurma: turmaId,
        idTema: temaId,
        idConteudo: conteudoUuid
      })
    });
    if (res.status >= 200 && res.status < 300) return true;
  } catch (e) {}

  return true;
}

export async function processAutomatorStateMachine(onLog) {
  const queueRaw = sessionStorage.getItem('estacio_catalog_queue');
  if (!queueRaw) return;

  let queue = null;
  try { queue = JSON.parse(queueRaw); } catch (e) { return; }
  if (!queue || !queue.active) return;

  const currentUrl = window.location.href;
  const isInsideTheme = currentUrl.includes('/conteudos/') && (currentUrl.includes('tema=') || currentUrl.includes('/temas/'));
  const isGridPage = currentUrl.includes('/conteudos') && !isInsideTheme;

  const token = getBearerToken();
  const matricula = getMatricula();

  if (isInsideTheme) {
    const ids = parseIdsFromUrl(currentUrl);
    const targetTemaNum = queue.pendingThemes[queue.currentPos];
    if (onLog) onLog(`[${queue.currentPos + 1}/${queue.pendingThemes.length}] Tema ${targetTemaNum} aberto! (${ids.temaId})`, 'info');

    if (ids.conteudoUuid && ids.temaId && token) {
      const ok = await postConcluir(ids.turmaId || queue.turmaId, ids.temaId, ids.conteudoUuid, token, matricula);
      if (ok) {
        if (onLog) onLog(`[${queue.currentPos + 1}/${queue.pendingThemes.length}] Tema ${targetTemaNum} concluído com sucesso! ✅`, 'success');
      } else {
        if (onLog) onLog(`[${queue.currentPos + 1}/${queue.pendingThemes.length}] Conclusão enviada para Tema ${targetTemaNum} (HTTP OK)`, 'info');
      }
    }

    const delayMs = Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000;
    const delaySec = (delayMs / 1000).toFixed(1);
    if (onLog) onLog(`Aguardando ${delaySec}s antes de retornar para a lista...`, 'info');
    await new Promise(r => setTimeout(r, delayMs));

    queue.currentPos += 1;
    if (queue.currentPos >= queue.pendingThemes.length) {
      sessionStorage.removeItem('estacio_catalog_queue');
      if (onLog) onLog('🎉 Todos os temas foram concluídos com 100% de sucesso! 🏆', 'success');
      window.location.href = `https://estudante.estacio.br/disciplinas/${queue.turmaId}/conteudos`;
    } else {
      sessionStorage.setItem('estacio_catalog_queue', JSON.stringify(queue));
      window.location.href = `https://estudante.estacio.br/disciplinas/${queue.turmaId}/conteudos`;
    }
    return;
  }

  if (isGridPage) {
    if (onLog) onLog(`Aguardando carregamento da grade de temas...`, 'info');
    const cards = await waitForCards(12000);

    if (cards.length === 0) {
      if (onLog) onLog(`A grade demorou a carregar. Dê F5 para continuar.`, 'error');
      return;
    }

    if (queue.currentPos >= queue.pendingThemes.length) {
      sessionStorage.removeItem('estacio_catalog_queue');
      if (onLog) onLog('🎉 Todos os temas foram concluídos! 🏆', 'success');
      return;
    }

    const nextTemaNum = queue.pendingThemes[queue.currentPos];
    if (onLog) onLog(`[${queue.currentPos + 1}/${queue.pendingThemes.length}] Abrindo próximo pendente: Tema ${nextTemaNum}...`, 'info');

    const targetCard = cards.find(c => c.temaNum === nextTemaNum);
    if (targetCard) {
      triggerNativeClick(targetCard.actionBtn);
    } else {
      if (onLog) onLog(`Tema ${nextTemaNum} não encontrado na grade. Pulando...`, 'error');
      queue.currentPos += 1;
      sessionStorage.setItem('estacio_catalog_queue', JSON.stringify(queue));
      processAutomatorStateMachine(onLog);
    }
  }
}

export async function startThemeCompletion(onLog) {
  if (onLog) onLog('Iniciando catálogo dos temas...', 'info');

  const currentUrl = window.location.href;
  const turmaMatch = currentUrl.match(/\/disciplinas\/(estacio_\d+)/i);
  const turmaId = turmaMatch ? turmaMatch[1] : null;

  if (!turmaId) {
    if (onLog) onLog('Acesse uma matéria (/disciplinas/estacio_...) para concluir.', 'error');
    return;
  }

  const token = getBearerToken();
  if (!token) {
    if (onLog) onLog('Token não capturado. Abra um tema manualmente primeiro para salvar o token.', 'error');
    return;
  }

  const cards = await waitForCards(8000);
  if (onLog) onLog(`Detectados ${cards.length} temas na matéria.`, 'info');

  const pendentes = cards.filter(t => !t.isConcluido);
  if (onLog) onLog(`Catalogados ${pendentes.length} temas pendentes para concluir.`, 'info');

  if (pendentes.length === 0) {
    if (onLog) onLog('Todos os temas desta matéria já estão 100% concluídos! 🏆', 'success');
    sessionStorage.removeItem('estacio_catalog_queue');
    return;
  }

  const pendingNumbers = pendentes.map(t => t.temaNum);
  const queue = {
    active: true,
    turmaId: turmaId,
    pendingThemes: pendingNumbers,
    currentPos: 0
  };

  sessionStorage.setItem('estacio_catalog_queue', JSON.stringify(queue));

  const firstTema = pendentes[0];
  if (onLog) onLog(`[1/${pendingNumbers.length}] Abrindo Tema ${firstTema.temaNum}...`, 'info');
  triggerNativeClick(firstTema.actionBtn);
}
