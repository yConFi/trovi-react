import { useRef } from 'react';

export function useSwipeClose(onClose, threshold = null) {
  const ref = useRef(null);
  const touchStartY = useRef(0);
  const dragOffset = useRef(0);

  function onTouchStart(e) {
    touchStartY.current = e.touches[0].clientY;
  }

  function onTouchMove(e) {
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0 && ref.current?.scrollTop === 0) {
      dragOffset.current = delta;
      ref.current.style.transform = `translateY(${delta}px)`;
      ref.current.style.transition = 'none';
    }
  }

  function onTouchEnd() {
    const limit = threshold ?? (ref.current
      ? ref.current.offsetHeight * 0.35
      : window.innerHeight * 0.5);
    if (dragOffset.current > limit) {
      onClose();
    } else if (ref.current) {
      ref.current.style.transform = '';
      ref.current.style.transition = 'transform 0.3s ease';
    }
    dragOffset.current = 0;
  }

  return { ref, onTouchStart, onTouchMove, onTouchEnd };
}
