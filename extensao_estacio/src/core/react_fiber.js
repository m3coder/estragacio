// Manipulador de Eventos React Fiber e Cliques Nativos

export function clickOptionReact(element) {
  if (!element) return;
  element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  try { element.focus(); } catch (e) {}

  const triggerReactHandler = (target) => {
    if (!target) return false;
    const propKey = Object.keys(target).find(k => k.startsWith('__reactProps$') || k.startsWith('__reactEventHandlers$'));
    if (propKey && target[propKey]?.onClick) {
      try {
        target[propKey].onClick({ preventDefault: () => {}, stopPropagation: () => {}, target: target, currentTarget: target, bubbles: true });
        return true;
      } catch (err) {}
    }
    return false;
  };

  triggerReactHandler(element);
  const btn = element.tagName === 'BUTTON' ? element : element.querySelector('button') || element.closest('button');
  if (btn) triggerReactHandler(btn);
  element.querySelectorAll('*').forEach(c => triggerReactHandler(c));

  try { element.click(); } catch (e) {}
  if (btn && btn !== element) { try { btn.click(); } catch (e) {} }

  ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(evtName => {
    const evt = new MouseEvent(evtName, { bubbles: true, cancelable: true, view: window });
    btn ? btn.dispatchEvent(evt) : element.dispatchEvent(evt);
  });

  element.classList.add('estacio-ai-marked');
}

export function triggerNativeClick(element) {
  if (!element) return;
  try {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (e) {}

  const btn = element.tagName === 'BUTTON' || element.tagName === 'A' ? element : element.querySelector('button, a') || element;

  try {
    btn.removeAttribute('disabled');
    btn.setAttribute('aria-disabled', 'false');
    if (btn.style) btn.style.pointerEvents = 'auto';
  } catch (e) {}

  try { btn.focus(); } catch (e) {}

  const triggerReactHandler = (target) => {
    if (!target) return false;
    const propKey = Object.keys(target).find(k => k.startsWith('__reactProps$') || k.startsWith('__reactEventHandlers$'));
    if (propKey && target[propKey]?.onClick) {
      try {
        target[propKey].onClick({ preventDefault: () => {}, stopPropagation: () => {}, target: target, currentTarget: target, bubbles: true });
        return true;
      } catch (err) {}
    }
    return false;
  };

  triggerReactHandler(element);
  if (btn && btn !== element) triggerReactHandler(btn);
  element.querySelectorAll('*').forEach(c => triggerReactHandler(c));

  try {
    if (typeof btn.click === 'function') btn.click();
    else if (typeof element.click === 'function') element.click();
  } catch (e) {}

  ['pointerover', 'mouseover', 'pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(evtName => {
    try {
      const evt = new MouseEvent(evtName, { bubbles: true, cancelable: true, view: window });
      (btn || element).dispatchEvent(evt);
    } catch (e) {}
  });
}
