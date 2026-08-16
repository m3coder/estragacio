// Sistema de Gabarito Persistente, Mapeamento Visual Completo (Verde=Concluído, Vermelho=Falha, Cinza=Pendente) e 1-Click Retry/Revisão

import { PROVIDERS_CONFIG } from '../config/providers.js';

export function getSavedGabarito() {
  const saved = localStorage.getItem('estacio_last_gabarito');
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch (e) {
    return null;
  }
}

export function saveGabarito(providerLabel, answersList) {
  const payload = {
    timestamp: new Date().toLocaleString(),
    provider: providerLabel,
    answers: answersList
  };
  localStorage.setItem('estacio_last_gabarito', JSON.stringify(payload));
  return payload;
}

export function initGabaritoStructure(totalQuestions = 10, providerLabel = 'AI') {
  let existing = getSavedGabarito();
  let answers = existing?.answers ? [...existing.answers] : [];

  // Remove qualquer resquício de questões que excedam o total real (ex: Q11-Q15 antigas)
  answers = answers.filter(a => a.q <= totalQuestions);

  for (let q = 1; q <= totalQuestions; q++) {
    if (!answers.some(a => a.q === q)) {
      answers.push({
        q: q,
        status: 'pending', // 'pending', 'processing', 'done', 'failed'
        letter: null,
        explanation: '',
        error: null
      });
    }
  }

  answers.sort((a, b) => a.q - b.q);
  return saveGabarito(existing?.provider || providerLabel, answers);
}

export function resetGabaritoAnswers(totalQuestions = 10, providerLabel = 'AI') {
  const answers = [];
  for (let q = 1; q <= totalQuestions; q++) {
    answers.push({
      q: q,
      status: 'pending',
      letter: null,
      explanation: '',
      error: null
    });
  }
  return saveGabarito(providerLabel, answers);
}

export function updateGabaritoQuestion(qNum, { status, letter, explanation, error, provider }) {
  let data = getSavedGabarito() || { timestamp: new Date().toLocaleString(), provider: provider || 'AI', answers: [] };
  let item = data.answers.find(a => a.q === qNum);

  if (!item) {
    item = { q: qNum, status: 'pending', letter: null, explanation: '', error: null };
    data.answers.push(item);
  }

  if (status !== undefined) item.status = status;
  if (letter !== undefined) item.letter = letter;
  if (explanation !== undefined) item.explanation = explanation;
  if (error !== undefined) item.error = error;
  if (provider) data.provider = provider;

  data.answers.sort((a, b) => a.q - b.q);
  saveGabarito(data.provider, data.answers);
  return data;
}

export function copyGabarito(onSuccess, onError) {
  const data = getSavedGabarito();
  if (!data || !data.answers || data.answers.length === 0) {
    if (onError) onError('Nenhum gabarito salvo ainda.');
    return;
  }

  try {
    let text = `📝 GABARITO DA PROVA - ESTÁCIO SUITE AI (${data.timestamp || new Date().toLocaleString()})\n`;
    text += `🤖 IA Utilizada: ${data.provider || 'AI'}\n\n`;

    data.answers.forEach(a => {
      if (a.letter) {
        text += `Questão ${a.q}: [ ${a.letter} ]  ${a.explanation ? `(${a.explanation})` : ''}\n`;
      } else {
        text += `Questão ${a.q}: [ Pendente ]\n`;
      }
    });

    const answeredOnly = data.answers.filter(a => a.letter);
    if (answeredOnly.length > 0) {
      text += `\n🎯 Resumo Compacto:\n`;
      text += answeredOnly.map(a => `${a.q}-${a.letter}`).join(' | ');
    }

    copyTextToClipboard(text, () => {
      if (onSuccess) onSuccess();
    }, () => {
      if (onError) onError();
    });
  } catch (e) {
    if (onError) onError();
  }
}

export function copyAllLogs(logBoxElement, onSuccess) {
  if (!logBoxElement) return;
  const lines = Array.from(logBoxElement.querySelectorAll('.log-item, .widget-log-item')).map(el => el.textContent);
  copyTextToClipboard(lines.join('\n'), () => {
    if (onSuccess) onSuccess();
  });
}

export function copyTextToClipboard(text, onSuccess, onError) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(onSuccess).catch(() => fallbackCopy(text, onSuccess, onError));
  } else {
    fallbackCopy(text, onSuccess, onError);
  }
}

function fallbackCopy(text, onSuccess, onError) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    if (onSuccess) onSuccess();
  } catch (e) {
    if (onError) onError();
  }
  document.body.removeChild(textarea);
}

export function renderSavedGabarito(containerEl, badgesEl, reviewProvider, onBadgeClick) {
  if (!containerEl || !badgesEl) return;
  const data = getSavedGabarito();

  if (!data || !data.answers || data.answers.length === 0) {
    // Se não há dados, inicializa as 10 questões para mapear de imediato
    initGabaritoStructure(10);
  }

  const currentData = getSavedGabarito();
  if (!currentData || !currentData.answers || currentData.answers.length === 0) {
    containerEl.style.display = 'none';
    return;
  }

  // Atualiza título do cabeçalho com o total real de questões
  const headerSpan = containerEl.querySelector('.gabarito-header > span:first-child');
  if (headerSpan) {
    headerSpan.textContent = `📝 Gabarito (${currentData.answers.length} Questões)`;
  }

  containerEl.style.display = 'flex';
  badgesEl.innerHTML = '';

  const pName = PROVIDERS_CONFIG[reviewProvider]?.name || reviewProvider;

  currentData.answers.forEach(a => {
    const span = document.createElement('div');
    span.id = `badge-q-${a.q}`;

    let status = a.status || (a.letter ? 'done' : 'pending');

    if (status === 'done' || (a.letter && status !== 'failed')) {
      span.className = 'gabarito-badge badge-done';
      span.title = `Questão ${a.q}: [ ${a.letter} ] - ${a.explanation || 'Concluída'}\n👉 Clique para REVISAR (2ª Opinião com ${pName})!`;
      span.innerHTML = `<span class="badge-q">Q${a.q}:</span> <b class="badge-letter">${a.letter}</b>`;
    } else if (status === 'failed') {
      span.className = 'gabarito-badge badge-failed';
      span.title = `Questão ${a.q} falhou: ${a.error || 'Erro'}\n👉 Clique para RETRY / TENTAR NOVAMENTE!`;
      span.innerHTML = `<span class="badge-q">Q${a.q}:</span> <b class="badge-fail">❌</b>`;
    } else if (status === 'processing') {
      span.className = 'gabarito-badge badge-processing';
      span.title = `Questão ${a.q} sendo processada pela IA...`;
      span.innerHTML = `<span class="badge-q">Q${a.q}:</span> <b class="badge-proc">🔄</b>`;
    } else {
      // Pending
      span.className = 'gabarito-badge badge-pending';
      span.title = `Questão ${a.q} pendente.\n👉 Clique para RESOLVER AGORA com a IA ativa!`;
      span.innerHTML = `<span class="badge-q">Q${a.q}:</span> <b class="badge-pend">-</b>`;
    }

    span.addEventListener('click', () => {
      if (onBadgeClick) onBadgeClick(a.q, status);
    });

    badgesEl.appendChild(span);
  });
}
