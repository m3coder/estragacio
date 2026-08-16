// Lógica de Elemento Arrastável com Memória de Coordenadas

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
  }

  dragHandle.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;
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
        isDragging = true;
        const newLeft = `${initialLeft + dx}px`;
        const newTop = `${initialTop + dy}px`;
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

      if (!isDragging && onClickCallback) {
        onClickCallback(upEvent);
      }
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}
