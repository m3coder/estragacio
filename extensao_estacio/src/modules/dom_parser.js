// Extrator do DOM (Deduplicação Precisa por temaNum e Detecção Correta de Concluído/Pendente)

export function getQuestionCards() {
  const allTestIds = Array.from(document.querySelectorAll('[data-testid]'));
  let rawCards = allTestIds.filter(el => /^question-\d+$/i.test(el.getAttribute('data-testid')));

  if (rawCards.length === 0) {
    const wrapper = document.querySelector('[data-testid="wrapper-Practice"]') || document.body;
    rawCards = Array.from(wrapper.querySelectorAll('[id]')).filter(el => /^\d+$/.test(el.id));
  }

  rawCards.sort((a, b) => {
    const numA = parseInt(a.getAttribute('data-testid')?.replace('question-', '') || a.id || '0');
    const numB = parseInt(b.getAttribute('data-testid')?.replace('question-', '') || b.id || '0');
    return numA - numB;
  });

  return rawCards.map((el, i) => ({
    index: parseInt(el.getAttribute('data-testid')?.replace('question-', '') || el.id || `${i + 1}`),
    element: el
  }));
}

export function extractStatement(cardEl, qNum) {
  const typo = cardEl.querySelector('[data-testid="question-typography"]');
  if (typo) return typo.innerText.replace(/\s+/g, ' ').trim();
  const clone = cardEl.cloneNode(true);
  clone.querySelectorAll('button, #estacio-suite-box, #estacio-solver-widget').forEach(b => b.remove());
  return (clone.innerText || clone.textContent || `Questão ${qNum}`).replace(/\s+/g, ' ').trim();
}

export function extractAlternatives(cardEl) {
  const buttons = Array.from(cardEl.querySelectorAll('button')).filter(b => {
    const txt = b.innerText.trim();
    return !/marcar para revis/i.test(txt) && !b.closest('#estacio-suite-box') && !b.closest('#estacio-solver-widget');
  });

  const letters = ['A', 'B', 'C', 'D', 'E'];
  const options = [];

  buttons.forEach((btn, idx) => {
    const text = btn.innerText.trim();
    const badge = btn.querySelector('small, span, div, strong, b');
    const badgeText = badge ? badge.innerText.trim() : '';

    let letter = null;
    if (/^[A-E]$/i.test(badgeText)) letter = badgeText.toUpperCase();
    else if (/^[A-E]$/i.test(text)) letter = text.toUpperCase();
    else if (/^[A-E]\s*[\.\-\)]\s*/i.test(text)) letter = text[0].toUpperCase();
    else if (idx < letters.length) letter = letters[idx];

    if (letter && !options.some(o => o.letter === letter)) {
      options.push({
        letter: letter,
        element: btn,
        text: text.replace(/^[A-E]\s*[\.\-\)]?\s*/i, '').trim()
      });
    }
  });

  const sorted = [];
  letters.forEach(l => {
    const found = options.find(o => o.letter === l);
    if (found) sorted.push(found);
  });

  return sorted.length >= 2 ? sorted : options;
}

export function getThemeCardsFromDom() {
  const cardsMap = new Map();

  // Localiza todos os botões, links e containers que contêm "Tema X"
  const candidates = Array.from(document.querySelectorAll('button, a[href*="/conteudos/"], [role="button"], article, section, [class*="card"], div'));

  candidates.forEach((el) => {
    // Sobe até encontrar o container completo do card
    let card = el.closest('article, section, [class*="card"], div');
    if (!card) return;

    const text = (card.innerText || '').replace(/\s+/g, ' ').trim();
    
    // Ignora o banner de topo "Continue de onde parou" se não for o card de grade
    if (text.toLowerCase().includes('continue de onde parou') && !text.match(/Tema\s*1\s*\|/i)) {
      return;
    }

    const match = text.match(/Tema\s*(\d+)/i);
    if (match && text.length < 400) {
      const temaNum = parseInt(match[1]);

      // Deduplicação estrita: apenas 1 card registrado por temaNum
      if (!cardsMap.has(temaNum)) {
        const isConcluido = /conclu[ií]do/i.test(text);
        const itemsMatch = text.match(/(\d+)\s*Itens?/i);
        const totalItems = itemsMatch ? parseInt(itemsMatch[1]) : 1;

        const link = card.querySelector('a[href*="/conteudos/"]');
        const href = link ? link.href : (card.getAttribute('href') || '');

        // Botão de ação: a seta redonda [ → ] ou link
        const actionBtn = card.querySelector('button, [role="button"], a[href*="/conteudos/"]') || card;

        cardsMap.set(temaNum, {
          temaNum: temaNum,
          temaName: `Tema ${temaNum}`,
          totalItems: totalItems,
          cardEl: card,
          actionBtn: actionBtn,
          href: href,
          isConcluido: isConcluido,
          isPendente: !isConcluido
        });
      }
    }
  });

  const cards = Array.from(cardsMap.values());
  cards.sort((a, b) => a.temaNum - b.temaNum);
  return cards;
}

export async function waitForCards(timeoutMs = 12000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const cards = getThemeCardsFromDom();
    if (cards.length > 0) return cards;
    await new Promise(r => setTimeout(r, 400));
  }
  return [];
}
