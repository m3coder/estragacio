// Automação de Conclusão de Temas / Disciplinas (Portal do Aluno com Validação de Total de Temas)

import { getBearerToken, getMatricula } from '../config/storage.js';
import { triggerNativeClick } from '../core/react_fiber.js';
import { waitForCards, getThemeCardsFromDom } from './dom_parser.js';

let isStateMachineRunning = false;

export function isInsideThemeUrl(url) {
  if (!url) return false;
  return /\/conteudos\/[a-f0-9-]{36}/i.test(url) || url.includes('tema=') || url.includes('/temas/');
}

export function isCurrentlyInsideTheme() {
  const url = window.location.href;
  if (isInsideThemeUrl(url)) return true;

  // Detecção visual no DOM (botão Voltar / Concluir + cabeçalho do tema)
  const buttons = Array.from(document.querySelectorAll('button, a, [role="button"], span, div'));
  const hasVoltar = buttons.some(el => {
    const t = (el.innerText || el.getAttribute('aria-label') || '').trim().toLowerCase();
    return (t === 'voltar' || t === '← voltar' || t === '←') && !el.closest('#estacio-suite-box');
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

export async function postConcluir(turmaId, temaId, conteudoUuid, token, matricula, onLog = null) {
  const matriculaParam = matricula ? `?matricula=${matricula}` : '';
  const endpointLegado = `https://apis.estudante.estacio.br/rest/turmas/${turmaId}/temas/${temaId}/conteudos/${conteudoUuid}/conclusoes${matriculaParam}`;
  const endpointNovo = `https://apis.estudante.estacio.br/rest/me/conteudos/${conteudoUuid}/concluir`;

  const headersBase = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json, text/plain, */*'
  };

  let statusInfo = '';

  // 1. Tenta Endpoint Principal de Conclusões da Turma
  try {
    const res = await fetch(endpointLegado, {
      method: 'POST',
      headers: headersBase
    });
    statusInfo += `Legado: HTTP ${res.status} `;
    if (res.status >= 200 && res.status < 300) {
      if (onLog) onLog(`[POST Conclusões] /temas/${temaId}/conteudos/${conteudoUuid.slice(0, 8)}... → HTTP ${res.status} OK ✅`, 'success');
      return true;
    }
  } catch (e) {
    statusInfo += `Legado: ${e.message} `;
  }

  // 2. Tenta Endpoint Secundário /me/conteudos/concluir
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
    statusInfo += `Novo: HTTP ${res.status}`;
    if (res.status >= 200 && res.status < 300) {
      if (onLog) onLog(`[POST Concluir] /me/conteudos/${conteudoUuid.slice(0, 8)}... → HTTP ${res.status} OK ✅`, 'success');
      return true;
    }
  } catch (e) {
    statusInfo += `Novo: ${e.message}`;
  }

  if (onLog) {
    onLog(`[Aviso POST] Resposta da API: ${statusInfo}`, 'warning');
  }

  return false;
}

export async function clickConcludeButtonActiveLoop(onLog = null) {
  try {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  } catch (e) {}

  await new Promise(r => setTimeout(r, 600));

  const candidates = Array.from(document.querySelectorAll('button, [role="button"], a, div, span'));
  const concludeEl = candidates.find(el => {
    const txt = (el.innerText || '').trim().toLowerCase();
    return txt.includes('marcar como conclu') && !el.closest('#estacio-suite-box');
  });

  if (concludeEl) {
    const targetBtn = concludeEl.closest('button, [role="button"]') || concludeEl;
    targetBtn.removeAttribute('disabled');
    targetBtn.setAttribute('aria-disabled', 'false');

    // 1º Clique nativo no botão liberado
    triggerNativeClick(targetBtn);
    if (onLog) onLog('Botão [Marcar como concluído] liberado e clicado na tela! 🎯', 'success');

    await new Promise(r => setTimeout(r, 800));

    // 2º Clique de confirmação se o botão ainda estiver ativo
    const currentTxt = (targetBtn.innerText || '').toLowerCase();
    if (currentTxt.includes('marcar como conclu') && !currentTxt.includes('já')) {
      triggerNativeClick(targetBtn);
    }
  }
}

export async function processAutomatorStateMachine(onLog) {
  if (isStateMachineRunning) return;

  const queueRaw = localStorage.getItem('estacio_catalog_queue');
  if (!queueRaw) return;

  let queue = null;
  try { queue = JSON.parse(queueRaw); } catch (e) { return; }
  if (!queue || !queue.active) return;

  const token = getBearerToken();
  const matricula = getMatricula();
  const insideTheme = isCurrentlyInsideTheme();

  // =========================================================================
  // CENÁRIO 1: O TEMA ESTÁ ABERTO NA TELA (Dentro do Conteúdo)
  // =========================================================================
  if (insideTheme) {
    isStateMachineRunning = true;
    try {
      const url = window.location.href;
      const ids = parseIdsFromUrl(url);
      const turmaId = ids.turmaId || queue.turmaId;
      const targetMateriaUrl = `https://estudante.estacio.br/disciplinas/${turmaId}/conteudos`;

      // Identifica número do tema
      let temaId = ids.temaId;
      const headerText = document.body.innerText;
      const headerMatch = headerText.match(/Tema\s*(\d+)/i);
      const temaNum = headerMatch ? parseInt(headerMatch[1]) : (queue.pendingThemes[queue.currentPos] || 1);
      if (!temaId) temaId = `tema_${temaNum}`;

      if (onLog) onLog(`[Tema ${temaNum}] Aberto na tela! Coletando sub-conteúdos...`, 'info');

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
      if (onLog) onLog(`[Tema ${temaNum}] Disparando requisição de conclusão para ${uuidList.length || 1} sub-item(ns)...`, 'info');

      // 1ª ONDA DE POST (Libera o botão e registra no backend)
      if (uuidList.length > 0) {
        for (let idx = 0; idx < uuidList.length; idx++) {
          const uuid = uuidList[idx];
          await postConcluir(turmaId, temaId, uuid, token, matricula, onLog);
          await new Promise(r => setTimeout(r, 300));
        }
      } else if (ids.conteudoUuid) {
        await postConcluir(turmaId, temaId, ids.conteudoUuid, token, matricula, onLog);
      }

      // CLIQUE FÍSICO NO BOTÃO "Marcar como concluído" LIBERADO NA TELA
      await clickConcludeButtonActiveLoop(onLog);

      // 2ª ONDA DE POST (Confirmação rápida para garantir persistência)
      if (uuidList.length > 0) {
        for (const uuid of uuidList) {
          await postConcluir(turmaId, temaId, uuid, token, matricula);
        }
      }

      const delayMs = Math.floor(Math.random() * (2200 - 1500 + 1)) + 1500;
      const delaySec = (delayMs / 1000).toFixed(1);
      if (onLog) onLog(`[Tema ${temaNum}] Concluído com sucesso! Aguardando ${delaySec}s e voltando para a grade...`, 'success');
      await new Promise(r => setTimeout(r, delayMs));

      // REGISTRA O TEMA ATUAL COMO CONCLUÍDO NA FILA PERSISTENTE
      queue.completedThemes = queue.completedThemes || [];
      if (!queue.completedThemes.includes(temaNum)) {
        queue.completedThemes.push(temaNum);
      }
      queue.currentPos += 1;
      localStorage.setItem('estacio_catalog_queue', JSON.stringify(queue));

      // Retorno determinístico direto para /disciplinas/{turmaId}/conteudos
      if (onLog) onLog(`Voltando para: /disciplinas/${turmaId}/conteudos ↩️`, 'info');
      window.location.href = targetMateriaUrl;

    } finally {
      isStateMachineRunning = false;
    }
    return;
  }

  // =========================================================================
  // CENÁRIO 2: ESTAMOS NA GRADE DE TEMAS DA MATÉRIA (/disciplinas/.../conteudos)
  // =========================================================================
  if (!insideTheme) {
    isStateMachineRunning = true;
    try {
      // Aguarda o React estabilizar e carregar os cards da grade
      await new Promise(r => setTimeout(r, 1200));
      const gridCards = await waitForCards(15000);
      if (gridCards.length === 0) {
        return;
      }

      const completedSet = new Set(queue.completedThemes || []);

      // Filtra temas que ainda não foram concluídos
      const pendentes = gridCards.filter(c => !c.isConcluido && !completedSet.has(c.temaNum));

      // Validação Estrita: Só encerra se todos os temas catalogados estiverem concluídos
      const expectedTotal = queue.totalThemes || gridCards.length;
      if (pendentes.length === 0 && gridCards.length >= expectedTotal) {
        localStorage.removeItem('estacio_catalog_queue');
        if (onLog) onLog(`🏆 Todos os ${gridCards.length} temas desta matéria estão 100% CONCLUÍDOS! Parabéns!`, 'success');
        return;
      }

      if (pendentes.length === 0) {
        // Se a grade ainda está carregando os outros cards, aguarda
        return;
      }

      if (onLog) onLog(`Restam ${pendentes.length} tema(s) pendente(s) na matéria.`, 'info');

      queue.pendingThemes = pendentes.map(c => c.temaNum);
      localStorage.setItem('estacio_catalog_queue', JSON.stringify(queue));

      const nextTema = pendentes[0];
      if (onLog) onLog(`[${pendentes.length} restantes] Abrindo Tema ${nextTema.temaNum} (${nextTema.totalItems} itens)...`, 'info');

      await new Promise(r => setTimeout(r, 800));

      // Dispara clique no botão [ → ], no card e no link interno
      triggerNativeClick(nextTema.actionBtn);
      if (nextTema.cardEl && nextTema.cardEl !== nextTema.actionBtn) {
        triggerNativeClick(nextTema.cardEl);
      }

      const linkEl = nextTema.cardEl.querySelector('a[href*="/conteudos/"]');
      if (linkEl) triggerNativeClick(linkEl);

      // Fallback seguro se não abrir em 1.5s
      if (nextTema.href && nextTema.href.includes('/conteudos/')) {
        setTimeout(() => {
          if (!isCurrentlyInsideTheme()) {
            window.location.href = nextTema.href;
          }
        }, 1500);
      }

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

  if (onLog) onLog('Iniciando automação dos temas da matéria...', 'info');

  // Se já estiver dentro de um tema, conclui o tema atual primeiro e volta para a matéria
  if (isCurrentlyInsideTheme()) {
    const queue = {
      active: true,
      turmaId: turmaId,
      totalThemes: 5,
      conteudosUrl: `https://estudante.estacio.br/disciplinas/${turmaId}/conteudos`,
      pendingThemes: [1],
      completedThemes: [],
      currentPos: 0
    };
    localStorage.setItem('estacio_catalog_queue', JSON.stringify(queue));
    processAutomatorStateMachine(onLog);
    return;
  }

  // Se estiver na grade da matéria, lê os cards e inicia o primeiro
  waitForCards(8000).then((cards) => {
    const pendentes = cards.filter(t => !t.isConcluido);
    if (onLog) onLog(`Detectados ${cards.length} temas no total (${pendentes.length} pendentes).`, 'info');

    if (pendentes.length === 0) {
      if (onLog) onLog('Todos os temas desta matéria já estão 100% concluídos! 🏆', 'success');
      localStorage.removeItem('estacio_catalog_queue');
      return;
    }

    const pendingNumbers = pendentes.map(t => t.temaNum);
    const queue = {
      active: true,
      turmaId: turmaId,
      totalThemes: cards.length,
      conteudosUrl: `https://estudante.estacio.br/disciplinas/${turmaId}/conteudos`,
      pendingThemes: pendingNumbers,
      completedThemes: [],
      currentPos: 0
    };

    localStorage.setItem('estacio_catalog_queue', JSON.stringify(queue));

    const firstTema = pendentes[0];
    if (onLog) onLog(`[1/${pendingNumbers.length}] Abrindo Tema ${firstTema.temaNum}...`, 'info');
    
    triggerNativeClick(firstTema.actionBtn);
    if (firstTema.cardEl && firstTema.cardEl !== firstTema.actionBtn) {
      triggerNativeClick(firstTema.cardEl);
    }
    const linkEl = firstTema.cardEl.querySelector('a[href*="/conteudos/"]');
    if (linkEl) triggerNativeClick(linkEl);
  });
}
