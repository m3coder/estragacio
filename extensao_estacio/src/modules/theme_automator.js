// Automação de Conclusão de Temas / Disciplinas (Portal do Aluno com SPA Hook e Retorno Automático)

import { getBearerToken, getMatricula } from '../config/storage.js';
import { triggerNativeClick } from '../core/react_fiber.js';
import { waitForCards } from './dom_parser.js';

let isStateMachineRunning = false;
let lastHandledUrl = '';

export function isInsideThemeUrl(url) {
  if (!url) return false;
  return /\/conteudos\/[a-f0-9-]{36}/i.test(url) || url.includes('tema=') || url.includes('/temas/');
}

export function isGridPageUrl(url) {
  if (!url) return false;
  return url.includes('/disciplinas/') && !isInsideThemeUrl(url);
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

export function harvestInPageContentUuids() {
  const uuids = new Set();
  const allLinks = Array.from(document.querySelectorAll('a[href*="/conteudos/"], button[data-uuid], [data-conteudo-id]'));

  allLinks.forEach(el => {
    const href = el.href || el.getAttribute('data-href') || '';
    const match = href.match(/\/conteudos\/([a-f0-9-]{36})/i);
    if (match) uuids.add(match[1]);

    const directId = el.getAttribute('data-uuid') || el.getAttribute('data-conteudo-id');
    if (directId && directId.length > 20) uuids.add(directId);
  });

  return Array.from(uuids);
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

export function navigateBackToGrid(turmaId, onLog) {
  const gridUrl = `https://estudante.estacio.br/disciplinas/${turmaId}/conteudos`;
  if (onLog) onLog('Voltando para a grade de temas...', 'info');

  // 1. Tenta clicar no botão Voltar ou breadcrumb na tela
  const candidates = Array.from(document.querySelectorAll('button, a, [role="button"]'));
  const backBtn = candidates.find(el => {
    const txt = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || '').toLowerCase();
    return (txt.includes('voltar') || txt.includes('conteúdos') || txt.includes('disciplina')) && !el.closest('#estacio-suite-box');
  });

  if (backBtn) {
    try {
      triggerNativeClick(backBtn);
    } catch (e) {}
  }

  // 2. Dispara retorno no histórico do navegador
  try {
    window.history.back();
  } catch (e) {}

  // 3. Fallback garantido por URL se o SPA não voltar em 1.5s
  setTimeout(() => {
    if (isInsideThemeUrl(window.location.href)) {
      window.location.href = gridUrl;
    }
  }, 1800);
}

export async function processAutomatorStateMachine(onLog) {
  if (isStateMachineRunning) return;

  const queueRaw = sessionStorage.getItem('estacio_catalog_queue');
  if (!queueRaw) return;

  let queue = null;
  try { queue = JSON.parse(queueRaw); } catch (e) { return; }
  if (!queue || !queue.active) return;

  const currentUrl = window.location.href;
  const isInside = isInsideThemeUrl(currentUrl);
  const isGrid = isGridPageUrl(currentUrl);

  const token = getBearerToken();
  const matricula = getMatricula();

  // CENÁRIO 1: O tema está aberto (dentro do conteúdo)
  if (isInside) {
    isStateMachineRunning = true;
    try {
      const ids = parseIdsFromUrl(currentUrl);
      const targetTemaNum = queue.pendingThemes[queue.currentPos] || ids.temaId || 'Atual';
      if (onLog) onLog(`[Tema ${targetTemaNum}] Aberto com sucesso! Identificando todos os sub-itens...`, 'info');

      // 1. Coleta todos os UUIDs de sub-conteúdos (Ativo + API + Links na tela)
      const allUuids = new Set();
      if (ids.conteudoUuid) allUuids.add(ids.conteudoUuid);

      // Busca sub-itens via DOM
      harvestInPageContentUuids().forEach(u => allUuids.add(u));

      // Busca sub-itens via API
      if (ids.turmaId && ids.temaId && token) {
        const apiUuids = await fetchAllThemeSubContents(ids.turmaId || queue.turmaId, ids.temaId, token);
        apiUuids.forEach(u => allUuids.add(u));
      }

      const uuidList = Array.from(allUuids);
      if (onLog) onLog(`[Tema ${targetTemaNum}] Encontrados ${uuidList.length} sub-item(ns). Enviando conclusões...`, 'info');

      // 2. Envia conclusão para CADA sub-item do tema
      for (let idx = 0; idx < uuidList.length; idx++) {
        const uuid = uuidList[idx];
        await postConcluir(ids.turmaId || queue.turmaId, ids.temaId || `tema_${targetTemaNum}`, uuid, token, matricula);
        if (onLog) onLog(`  └─ [Item ${idx + 1}/${uuidList.length}] UUID: ${uuid.slice(0, 8)}... → Concluído ✅`, 'success');
        await new Promise(r => setTimeout(r, 400));
      }

      // 3. Tenta clicar no botão nativo "Marcar como concluído"
      await tryClickInPageConcludeButton();

      const delayMs = Math.floor(Math.random() * (4000 - 2500 + 1)) + 2500;
      const delaySec = (delayMs / 1000).toFixed(1);
      if (onLog) onLog(`Aguardando ${delaySec}s e retornando à grade...`, 'info');
      await new Promise(r => setTimeout(r, delayMs));

      queue.currentPos += 1;
      sessionStorage.setItem('estacio_catalog_queue', JSON.stringify(queue));

      // Executa o retorno imediato para a grade
      navigateBackToGrid(ids.turmaId || queue.turmaId, onLog);

    } finally {
      isStateMachineRunning = false;
    }
    return;
  }

  // CENÁRIO 2: Estamos na grade de conteúdos
  if (isGrid) {
    isStateMachineRunning = true;
    try {
      if (onLog) onLog(`Verificando temas pendentes na grade...`, 'info');
      const cards = await waitForCards(12000);

      if (cards.length === 0) {
        if (onLog) onLog(`A grade demorou a carregar. Aguardando...`, 'warning');
        return;
      }

      // Reavalia temas que ainda estão pendentes
      const pendentes = cards.filter(c => c.isPendente);

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
      if (onLog) onLog(`Abrindo próximo: Tema ${nextTema.temaNum} (${nextTema.totalItems} itens)...`, 'info');
      
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

  if (onLog) onLog('Catalogando temas da matéria...', 'info');

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
    if (onLog) onLog(`[1/${pendingNumbers.length}] Abrindo Tema ${firstTema.temaNum} (${firstTema.totalItems} itens)...`, 'info');
    triggerNativeClick(firstTema.actionBtn);
  });
}
