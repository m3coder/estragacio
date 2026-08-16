// Lógica de Elemento Arrastável com Memória de Coordenadas e Clamping Inteligente de Viewport

export function clampElementToViewport(targetElement, margin = 16) {
  if (!targetElement) return;
  const rect = targetElement.getBoundingClientRect();
  const winW = window.innerWidth || document.documentElement.clientWidth;
  const winH = window.innerHeight || document.documentElement.clientHeight;

  if (rect.width === 0 || rect.height === 0) return;

  let currentLeft = rect.left;
  let currentTop = rect.top;
  let changed = false;

  // Ajusta se estiver saindo para a direita
  if (currentLeft + rect.width > winW - margin) {
    currentLeft = Math.max(margin, winW - rect.width - margin);
    changed = true;
  }
  // Ajusta se estiver saindo para a esquerda
  if (currentLeft < margin) {
    currentLeft = margin;
    changed = true;
  }

  // Ajusta se estiver saindo para baixo
  if (currentTop + rect.height > winH - margin) {
    currentTop = Math.max(margin, winH - rect.height - margin);
    changed = true;
  }
  // Ajusta se estiver saindo para cima
  if (currentTop < margin) {
    currentTop = margin;
    changed = true;
  }

  if (changed || targetElement.style.right || targetElement.style.bottom) {
    const leftPx = `${Math.round(currentLeft)}px`;
    const topPx = `${Math.round(currentTop)}px`;
    targetElement.style.left = leftPx;
    targetElement.style.top = topPx;
    targetElement.style.right = 'auto';
    targetElement.style.bottom = 'auto';

    localStorage.setItem('estacio_pos_left', leftPx);
    localStorage.setItem('estacio_pos_top', topPx);
  }
}

export function setupUniversalDraggable(targetElement, handleElement = null, onClickCallback = null) {
  const dragHandle = handleElement || targetElement;
  let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;
  let isDragging = false;

  const savedLeft = localStorage.getItem('estacio_pos_left');
  const savedTop = localStorage.getItem('estacio_pos_top');
  if (savedLeft && savedTop) {
    targetElement.style.left = savedLeft;
    targetElement.style.top = savedTop;
    targetElement.style.right = 'auto';
    targetElement.style.bottom = 'auto';
    requestAnimationFrame(() => {
      clampElementToViewport(targetElement);
    });
  }

  dragHandle.addEventListener('mousedown', (e) => {
    if (
      e.target.tagName === 'BUTTON' ||
      e.target.tagName === 'SELECT' ||
      e.target.tagName === 'INPUT' ||
      e.target.closest('button') ||
      e.target.closest('#box-header-cat')
    ) {
      return;
    }
    e.preventDefault();

    startX = e.clientX;
    startY = e.clientY;

    const rect = targetElement.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    isDragging = false;

    function onMouseMove(moveEvent) {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      if (Math.hypot(dx, dy) > 4) {
        if (!isDragging) {
          isDragging = true;
          targetElement.classList.add('is-dragging');
        }

        const winW = window.innerWidth || document.documentElement.clientWidth;
        const winH = window.innerHeight || document.documentElement.clientHeight;
        const elemW = targetElement.offsetWidth || 50;
        const elemH = targetElement.offsetHeight || 50;

        let targetL = initialLeft + dx;
        let targetT = initialTop + dy;

        // Limita dentro da viewport durante o arraste
        targetL = Math.max(8, Math.min(winW - elemW - 8, targetL));
        targetT = Math.max(8, Math.min(winH - elemH - 8, targetT));

        const newLeft = `${Math.round(targetL)}px`;
        const newTop = `${Math.round(targetT)}px`;
        targetElement.style.left = newLeft;
        targetElement.style.top = newTop;
        targetElement.style.right = 'auto';
        targetElement.style.bottom = 'auto';

        localStorage.setItem('estacio_pos_left', newLeft);
        localStorage.setItem('estacio_pos_top', newTop);
      }
    }

    function onMouseUp(upEvent) {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      targetElement.classList.remove('is-dragging');

      if (isDragging) {
        clampElementToViewport(targetElement);
      } else if (onClickCallback) {
        onClickCallback(upEvent);
      }
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}
