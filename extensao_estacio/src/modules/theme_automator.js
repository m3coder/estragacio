// Automação de Conclusão de Temas / Disciplinas (Portal do Aluno com Detecção Visual do DOM e Retorno via Botão Voltar)

import { getBearerToken, getMatricula } from '../config/storage.js';
import { triggerNativeClick } from '../core/react_fiber.js';
import { waitForCards, getThemeCardsFromDom } from './dom_parser.js';

let isStateMachineRunning = false;
let autoLoopTimer = null;

export function isInsideThemeUrl(url) {
  if (!url) return false;
  return /\/conteudos\/[a-f0-9-]{36}/i.test(url) || url.includes('tema=') || url.includes('/temas/');
}

export function isCurrentlyInsideTheme() {
  const url = window.location.href;
  if (isInsideThemeUrl(url)) return true;

  // Detecção visual infalível no DOM (botão Voltar + cabeçalho do tema)
  const buttons = Array.from(document.querySelectorAll('button, a, [role="button"], span, div'));
  const hasVoltar = buttons.some(el => {
    const t = (el.innerText || el.getAttribute('aria-label') || '').trim().toLowerCase();
    return (t === 'voltar' || t === '← voltar' || t === '←' || t.startsWith('voltar')) && !el.closest('#estacio-suite-box');
  });

  const hasConcluirBtn = Array.from(document.querySelectorAll('button, [role="button"]')).some(el => {
    const t = (el.innerText || '').toLowerCase();
    return t.includes('marcar como conclu') && !el.closest('#estacio-suite-box');
  });

  const hasThemeHeader = /Tema\s*\d+\s*[-–|:]/i.test(document.body.innerText);

  return (hasVoltar && (hasConcluirBtn || hasThemeHeader));
}

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

export function harvestInPageContentUuids() {
  const uuids = new Set();
  const allLinks = Array.from(document.querySelectorAll('a[href*="/conteudos/"], button[data-uuid], [data-conteudo-id], [data-id]'));

  allLinks.forEach(el => {
    const href = el.href || el.getAttribute('data-href') || '';
    const match = href.match(/\/conteudos\/([a-f0-9-]{36})/i);
    if (match) uuids.add(match[1]);

    const directId = el.getAttribute('data-uuid') || el.getAttribute('data-conteudo-id') || el.getAttribute('data-id');
    if (directId && directId.length > 20 && /^[a-f0-9-]{36}$/i.test(directId)) uuids.add(directId);
  });

  return Array.from(uuids);
}

export async function fetchAllThemeSubContents(turmaId, temaId, token) {
  const discoveredUuids = new Set();

  const endpoints = [
    `https://apis.estudante.estacio.br/rest/turmas/${turmaId}/temas/${temaId}/conteudos`,
    `https://apis.estudante.estacio.br/rest/turmas/${turmaId}/temas/${temaId}`,
    `https://apis.estudante.estacio.br/rest/me/turmas/${turmaId}/temas/${temaId}/conteudos`
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json, text/plain, */*'
        }
      });
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.conteudos || data.itens || data.items || []);
        if (Array.isArray(items)) {
          items.forEach(item => {
            const uuid = item.idConteudo || item.conteudoUuid || item.uuid || item.id;
            if (uuid && typeof uuid === 'string' && uuid.length > 20) {
              discoveredUuids.add(uuid);
            }
          });
        }
      }
    } catch (e) {}
  }

  return Array.from(discoveredUuids);
}

export async function postConcluir(turmaId, temaId, conteudoUuid, token, matricula) {
  const matriculaParam = matricula ? `?matricula=${matricula}` : '';
  const endpointLegado = `https://apis.estudante.estacio.br/rest/turmas/${turmaId}/temas/${temaId}/conteudos/${conteudoUuid}/conclusoes${matriculaParam}`;
  const endpointNovo = `https://apis.estudante.estacio.br/rest/me/conteudos/${conteudoUuid}/concluir`;

  const headersBase = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json, text/plain, */*'
  };

  let success = false;

  try {
    const res = await fetch(endpointLegado, {
      method: 'POST',
      headers: headersBase
    });
    if (res.status >= 200 && res.status < 300) success = true;
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
    if (res.status >= 200 && res.status < 300) success = true;
  } catch (e) {}

  return success;
}

export function clickNativeVoltarButton() {
  const candidates = Array.from(document.querySelectorAll('button, a, [role="button"], span, div'));
  const voltarBtn = candidates.find(el => {
    const t = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || '').trim().toLowerCase();
    return (t === 'voltar' || t === '← voltar' || t === '←' || t.startsWith('voltar')) && !el.closest('#estacio-suite-box');
  });

  if (voltarBtn) {
    const clickTarget = voltarBtn.closest('button, a') || voltarBtn;
    triggerNativeClick(clickTarget);
    return true;
  }
  return false;
}

export async function tryClickInPageConcludeButton() {
  const buttons = Array.from(document.querySelectorAll('button, a'));
  const concludeBtn = buttons.find(b => {
    const txt = b.innerText.toLowerCase();
    return (txt.includes('marcar como conclu') || txt.includes('concluir') || txt.includes('finalizar')) && !b.closest('#estacio-suite-box');
  });

  if (concludeBtn) {
    try {
      triggerNativeClick(concludeBtn);
    } catch (e) {}
  }
}

export async function processAutomatorStateMachine(onLog) {
  if (isStateMachineRunning) return;

  const queueRaw = sessionStorage.getItem('estacio_catalog_queue');
  if (!queueRaw) return;

  let queue = null;
  try { queue = JSON.parse(queueRaw); } catch (e) { return; }
  if (!queue || !queue.active) return;

  const token = getBearerToken();
  const matricula = getMatricula();
  const insideTheme = isCurrentlyInsideTheme();

  // =========================================================================
  // CENÁRIO 1: O TEMA ESTÁ ABERTO NA TELA (Dentro do Visualizador de Conteúdo)
  // =========================================================================
  if (insideTheme) {
    isStateMachineRunning = true;
    try {
      const url = window.location.href;
      const ids = parseIdsFromUrl(url);
      const turmaId = ids.turmaId || queue.turmaId;
      
      // Identifica número do tema a partir do DOM ou da URL
      let temaId = ids.temaId;
      const headerText = document.body.innerText;
      const headerMatch = headerText.match(/Tema\s*(\d+)/i);
      const temaNum = headerMatch ? parseInt(headerMatch[1]) : (queue.pendingThemes[queue.currentPos] || 1);
      if (!temaId) temaId = `tema_${temaNum}`;

      if (onLog) onLog(`[Tema ${temaNum}] Aberto na tela! Coletando identificadores de conteúdo...`, 'info');

      // Coleta todos os UUIDs disponíveis
      const allUuids = new Set();
      if (ids.conteudoUuid) allUuids.add(ids.conteudoUuid);
      harvestInPageContentUuids().forEach(u => allUuids.add(u));

      // Busca na API da Estácio
      if (turmaId && token) {
        const apiUuids = await fetchAllThemeSubContents(turmaId, temaId, token);
        apiUuids.forEach(u => allUuids.add(u));
      }

      const uuidList = Array.from(allUuids);
      if (onLog) onLog(`[Tema ${temaNum}] Concluindo ${uuidList.length || 1} sub-item(ns)...`, 'info');

      // Envia conclusões para todos os UUIDs encontrados
      if (uuidList.length > 0) {
        for (let idx = 0; idx < uuidList.length; idx++) {
          const uuid = uuidList[idx];
          await postConcluir(turmaId, temaId, uuid, token, matricula);
          if (onLog) onLog(`  └─ [Sub-Item ${idx + 1}/${uuidList.length}] Concluído com sucesso! ✅`, 'success');
          await new Promise(r => setTimeout(r, 400));
        }
      } else if (ids.conteudoUuid) {
        await postConcluir(turmaId, temaId, ids.conteudoUuid, token, matricula);
      }

      // Tenta clicar no botão nativo "Marcar como concluído"
      await tryClickInPageConcludeButton();

      const delayMs = Math.floor(Math.random() * (3500 - 2000 + 1)) + 2000;
      const delaySec = (delayMs / 1000).toFixed(1);
      if (onLog) onLog(`Aguardando ${delaySec}s e clicando em [← Voltar]...`, 'info');
      await new Promise(r => setTimeout(r, delayMs));

      queue.currentPos += 1;
      sessionStorage.setItem('estacio_catalog_queue', JSON.stringify(queue));

      // DISPARA O CLIQUE REAL NO BOTÃO "← VOLTAR" NA TELA
      const clicked = clickNativeVoltarButton();
      if (clicked) {
        if (onLog) onLog('Botão [← Voltar] clicado com sucesso! ↩️', 'info');
      } else {
        if (onLog) onLog('Retornando pelo histórico do navegador...', 'info');
        window.history.back();
      }

      // Fallback seguro se não sair da tela em 2.5s
      setTimeout(() => {
        if (isCurrentlyInsideTheme()) {
          window.location.href = `https://estudante.estacio.br/disciplinas/${turmaId}/conteudos`;
        }
      }, 2500);

    } finally {
      isStateMachineRunning = false;
    }
    return;
  }

  // =========================================================================
  // CENÁRIO 2: ESTAMOS NA GRADE DE TEMAS / MATÉRIA
  // =========================================================================
  const gridCards = getThemeCardsFromDom();
  if (gridCards.length > 0) {
    isStateMachineRunning = true;
    try {
      const pendentes = gridCards.filter(c => c.isPendente);

      if (pendentes.length === 0) {
        sessionStorage.removeItem('estacio_catalog_queue');
        if (onLog) onLog('🏆 Todos os temas desta matéria estão 100% CONCLUÍDOS! Parabéns!', 'success');
        return;
      }

      if (onLog) onLog(`Restam ${pendentes.length} tema(s) pendente(s) na grade.`, 'info');

      queue.pendingThemes = pendentes.map(c => c.temaNum);
      queue.currentPos = 0;
      sessionStorage.setItem('estacio_catalog_queue', JSON.stringify(queue));

      const nextTema = pendentes[0];
      if (onLog) onLog(`Abrindo Tema ${nextTema.temaNum} (${nextTema.totalItems} itens)...`, 'info');

      await new Promise(r => setTimeout(r, 600));
      triggerNativeClick(nextTema.actionBtn);

    } finally {
      isStateMachineRunning = false;
    }
  }
}

export function startThemeCompletion(onLog) {
  const currentUrl = window.location.href;
  const turmaMatch = currentUrl.match(/\/disciplinas\/(estacio_\d+)/i);
  const turmaId = turmaMatch ? turmaMatch[1] : null;

  if (!turmaId) {
    if (onLog) onLog('Acesse a página de conteúdos da matéria (/disciplinas/estacio_...) para concluir.', 'error');
    return;
  }

  const token = getBearerToken();
  if (!token) {
    if (onLog) onLog('Token não capturado. Abra qualquer tema manualmente primeiro para salvar a sessão.', 'error');
    return;
  }

  if (onLog) onLog('Iniciando automação dos temas...', 'info');

  // Se já estiver dentro de um tema, conclui o tema atual primeiro
  if (isCurrentlyInsideTheme()) {
    const queue = {
      active: true,
      turmaId: turmaId,
      pendingThemes: [1],
      currentPos: 0
    };
    sessionStorage.setItem('estacio_catalog_queue', JSON.stringify(queue));
    processAutomatorStateMachine(onLog);
    return;
  }

  // Se estiver na grade, lê os cards e inicia o primeiro
  waitForCards(8000).then((cards) => {
    const pendentes = cards.filter(t => !t.isConcluido);
    if (onLog) onLog(`Catalogados ${pendentes.length} tema(s) pendente(s).`, 'info');

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
  });
}
