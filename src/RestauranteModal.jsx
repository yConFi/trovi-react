import { useState, useRef, useEffect } from 'react';
import ValoracionEstrellas from './ValoracionEstrellas';

function ModalCarrusel({ restaurante }) {
  const fotos = [
    ...(restaurante.fotoUrl ? [restaurante.fotoUrl] : []),
    ...(restaurante.fotosUrls ?? []).filter(u => u !== restaurante.fotoUrl),
  ].filter(Boolean);
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  function onCarruselTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function onCarruselTouchMove(e) {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > dy) e.stopPropagation();
  }

  function onCarruselTouchEnd(e) {
    e.stopPropagation();
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta < -50) setIdx(i => (i + 1) % fotos.length);
    else if (delta > 50) setIdx(i => (i - 1 + fotos.length) % fotos.length);
  }

  if (fotos.length === 0) {
    return <div className="modal__image">{restaurante.emoji}</div>;
  }

  return (
    <div className="modal__image" style={{ position: 'relative' }} onTouchStart={onCarruselTouchStart} onTouchMove={onCarruselTouchMove} onTouchEnd={onCarruselTouchEnd}>
      <img
        src={fotos[idx]}
        alt={restaurante.nombre}
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px 20px 0 0' }}
      />
      {fotos.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + fotos.length) % fotos.length); }}
            className="modal__carrusel-btn modal__carrusel-btn--prev"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button
            onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % fotos.length); }}
            className="modal__carrusel-btn modal__carrusel-btn--next"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <div className="modal__carrusel-dots">
            {fotos.map((_, i) => (
              <div
                key={i}
                onClick={e => { e.stopPropagation(); setIdx(i); }}
                className={`modal__carrusel-dot${i === idx ? ' modal__carrusel-dot--active' : ''}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RestauranteModal({ restaurante, favoritos, usuario, esAdmin, miValoracion, linkCopiado, onCerrar, onCompartir, onValorar, onToggleFavorito, onEditar, onLoginClick }) {
  const modalRef = useRef(null);
  const touchStartY = useRef(0);
  const dragOffset = useRef(0);
  const esFavorito = favoritos.includes(restaurante.id);

  useEffect(() => {
    if (modalRef.current) modalRef.current.style.transform = '';
    dragOffset.current = 0;
  }, [restaurante]);

  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;

    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      const delta = e.touches[0].clientY - touchStartY.current;
      if (delta > 0 && el.scrollTop === 0) {
        e.preventDefault();
        dragOffset.current = delta;
        el.style.transform = `translateY(${delta}px)`;
        el.style.transition = 'none';
      }
    };

    const handleTouchEnd = () => {
      const limit = el.offsetHeight * 0.3;
      if (dragOffset.current > limit) {
        onCerrar();
      } else {
        el.style.transform = '';
        el.style.transition = 'transform 0.3s ease';
      }
      dragOffset.current = 0;
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onCerrar]);

  return (
    <div className="modal-overlay modal-overlay--open" onClick={e => e.target === e.currentTarget && onCerrar()}>
      <div className="modal" ref={modalRef}>
        <button className="modal__close" onClick={onCerrar}>✕</button>
        {esAdmin && (
          <button className="modal__action-btn modal__action-btn--editar" onClick={onEditar}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        )}
        <button className="modal__action-btn modal__action-btn--favorito" onClick={() => onToggleFavorito(restaurante.id)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={esFavorito ? '#ff5c3a' : 'none'} stroke={esFavorito ? '#ff5c3a' : '#4b5563'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <ModalCarrusel restaurante={restaurante} />
        <div className="modal__body">
          <div className="modal__tags">
            {restaurante.tipo.map(t => <span key={t} className="card__tag">{t}</span>)}
          </div>
          <h2 className="modal__nombre">{restaurante.nombre}</h2>
          <p className="modal__rating">
            {restaurante.numValoraciones > 0
              ? `★ ${restaurante.valoracion} · ${restaurante.numValoraciones} valoraciones · `
              : 'Nuevo · '}
            {restaurante.barrio ? `${restaurante.barrio}, ` : ''}{restaurante.ciudad}
          </p>
          <p className="modal__gancho">"{restaurante.porQueIr}"</p>
          <p className="modal__descripcion">{restaurante.descripcion}</p>
          <div className="modal__info">
            <div className="modal__info-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
              <span>{restaurante.direccion}</span>
            </div>
            <div className="modal__info-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>{restaurante.horario}</span>
            </div>
            <div className="modal__info-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M17 6.5A7 7 0 1 0 17 17.5"/><path d="M4 10h10"/><path d="M4 14h10"/></svg>
              <span>{restaurante.precioMedio > 0 ? `${restaurante.precioMedio}€ p.p.` : '—'}</span>
            </div>
            <div className="modal__info-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
              <a
                href={(() => {
                  const query = encodeURIComponent([restaurante.nombre, restaurante.direccion, restaurante.barrio, restaurante.ciudad].filter(Boolean).join(', '));
                  const esMobil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
                  return esMobil ? `geo:0,0?q=${query}` : `https://www.google.com/maps/search/?api=1&query=${query}`;
                })()}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#ff5c3a', fontWeight: 600, textDecoration: 'underline' }}
              >
                Cómo llegar
              </a>
            </div>
            <div className="modal__info-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {restaurante.propuestoPor
                ? <span>Propuesto por <strong style={{ color: '#ff5c3a' }}>@{restaurante.propuestoPor}</strong></span>
                : <span>Publicado por <strong style={{ color: '#111827' }}>Trovi</strong></span>
              }
            </div>
            <div className="modal__info-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              <button
                onClick={onCompartir}
                className={`modal__compartir-btn${linkCopiado ? ' modal__compartir-btn--copiado' : ''}`}
              >
                {linkCopiado ? '¡Enlace copiado!' : 'Compartir restaurante'}
              </button>
            </div>
          </div>
          <ValoracionEstrellas
            miValoracion={miValoracion}
            onValorar={onValorar}
            usuario={usuario}
            onLoginClick={onLoginClick}
          />
        </div>
      </div>
    </div>
  );
}

export default RestauranteModal;
