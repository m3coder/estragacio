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
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const btn = element.tagName === 'BUTTON' || element.tagName === 'A' ? element : element.querySelector('button, a') || element;

  const propKey = Object.keys(btn).find(k => k.startsWith('__reactProps$') || k.startsWith('__reactEventHandlers$'));
  if (propKey && btn[propKey]?.onClick) {
    try {
      btn[propKey].onClick({ preventDefault: () => {}, stopPropagation: () => {}, target: btn, currentTarget: btn, bubbles: true });
    } catch (e) {}
  }

  try { btn.click(); } catch (e) {}

  ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(evtName => {
    const evt = new MouseEvent(evtName, { bubbles: true, cancelable: true, view: window });
    btn.dispatchEvent(evt);
  });
}
