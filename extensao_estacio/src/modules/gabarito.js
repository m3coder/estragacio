// Sistema de Gabarito Persistente e Cópia Formatada

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
      text += `Questão ${a.q}: [ ${a.letter} ]  ${a.explanation ? `(${a.explanation})` : ''}\n`;
    });

    text += `\n🎯 Resumo Compacto:\n`;
    text += data.answers.map(a => `${a.q}-${a.letter}`).join(' | ');

    copyTextToClipboard(text, () => {
      if (onSuccess) onSuccess('📋 Gabarito copiado para a área de transferência!');
    }, () => {
      if (onError) onError('Erro ao copiar gabarito.');
    });
  } catch (e) {
    if (onError) onError('Erro ao formatar gabarito.');
  }
}

export function copyAllLogs(logBoxElement, onSuccess) {
  if (!logBoxElement) return;
  const lines = Array.from(logBoxElement.querySelectorAll('.log-item, .widget-log-item')).map(el => el.textContent);
  copyTextToClipboard(lines.join('\n'), () => {
    if (onSuccess) onSuccess('📋 Logs copiados para a área de transferência!');
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
    containerEl.style.display = 'none';
    return;
  }

  containerEl.style.display = 'flex';
  badgesEl.innerHTML = '';

  data.answers.forEach(a => {
    const span = document.createElement('div');
    span.className = 'gabarito-badge';
    span.id = `badge-q-${a.q}`;
    const pName = PROVIDERS_CONFIG[reviewProvider]?.name || reviewProvider;
    span.title = `Clique para REVISAR Q${a.q} com ${pName}! (Resposta atual: ${a.letter})`;
    span.innerHTML = `<span class="badge-q">Q${a.q}:</span><span class="badge-a">${a.letter}</span><span class="badge-rev-icon">🔍</span>`;

    span.addEventListener('click', () => {
      if (onBadgeClick) onBadgeClick(a.q);
    });

    badgesEl.appendChild(span);
  });
}
