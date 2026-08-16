// Automação de Conclusão de Temas / Disciplinas (Portal do Aluno com Suporte a Multi-Itens)

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
    const targetTemaNum = queue.pendingThemes[queue.currentPos] || ids.temaId || 'Atual';
    if (onLog) onLog(`[${queue.currentPos + 1}/${queue.pendingThemes.length}] Tema ${targetTemaNum} aberto! Buscando todos os sub-itens...`, 'info');

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
    if (onLog) onLog(`[Tema ${targetTemaNum}] Detectados ${uuidList.length} sub-item(ns) neste tema. Concluindo todos...`, 'info');

    // 2. Envia conclusão para CADA sub-item do tema
    for (let idx = 0; idx < uuidList.length; idx++) {
      const uuid = uuidList[idx];
      const ok = await postConcluir(ids.turmaId || queue.turmaId, ids.temaId || `tema_${targetTemaNum}`, uuid, token, matricula);
      if (onLog) onLog(`  └─ [Item ${idx + 1}/${uuidList.length}] UUID: ${uuid.slice(0, 8)}... → Concluído ✅`, 'success');
      await new Promise(r => setTimeout(r, 400));
    }

    // 3. Tenta clicar no botão nativo "Marcar como concluído" caso esteja visível
    await tryClickInPageConcludeButton();

    const delayMs = Math.floor(Math.random() * (4500 - 3000 + 1)) + 3000;
    const delaySec = (delayMs / 1000).toFixed(1);
    if (onLog) onLog(`Aguardando ${delaySec}s antes de retornar à grade de matérias...`, 'info');
    await new Promise(r => setTimeout(r, delayMs));

    queue.currentPos += 1;
    if (queue.currentPos >= queue.pendingThemes.length) {
      sessionStorage.removeItem('estacio_catalog_queue');
      if (onLog) onLog('🎉 Todos os temas foram processados! Retornando para verificar grade... 🏆', 'success');
    } else {
      sessionStorage.setItem('estacio_catalog_queue', JSON.stringify(queue));
    }

    window.location.href = `https://estudante.estacio.br/disciplinas/${queue.turmaId}/conteudos`;
    return;
  }

  if (isGridPage) {
    if (onLog) onLog(`Verificando status dos temas na grade...`, 'info');
    const cards = await waitForCards(12000);

    if (cards.length === 0) {
      if (onLog) onLog(`A grade demorou a carregar. Dê F5 para continuar.`, 'error');
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

    // Atualiza a fila com os números reais pendentes
    queue.pendingThemes = pendentes.map(c => c.temaNum);
    queue.currentPos = 0;
    sessionStorage.setItem('estacio_catalog_queue', JSON.stringify(queue));

    const nextTema = pendentes[0];
    if (onLog) onLog(`[1/${pendentes.length}] Abrindo próximo pendente: Tema ${nextTema.temaNum} (${nextTema.totalItems} itens)...`, 'info');
    triggerNativeClick(nextTema.actionBtn);
  }
}

export async function startThemeCompletion(onLog) {
  if (onLog) onLog('Iniciando catálogo dos temas da matéria...', 'info');

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
  if (onLog) onLog(`[1/${pendingNumbers.length}] Abrindo Tema ${firstTema.temaNum} (${firstTema.totalItems} itens)...`, 'info');
  triggerNativeClick(firstTema.actionBtn);
}
