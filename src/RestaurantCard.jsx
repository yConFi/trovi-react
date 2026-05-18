function RestaurantCard({ restaurante, onClick, esFavorito, esVisitado, onToggleFavorito }) {
  const { nombre, emoji, tipo, valoracion, numValoraciones, barrio, ciudad, precio, precioMedio, fotoUrl, propuestoPor, creadoEn } = restaurante;
  const esNuevo = numValoraciones === 0 && creadoEn && (Date.now() - new Date(creadoEn).getTime()) < 3 * 24 * 60 * 60 * 1000;

  return (
    <article className="card" onClick={onClick}>
      <div className="card__image" style={{ position: 'relative' }}>
        {fotoUrl
          ? <img src={fotoUrl} alt={nombre} loading="lazy" draggable="false" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : emoji}
        {esVisitado && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            background: 'rgba(16, 185, 129, 0.88)',
            color: 'white', fontSize: '0.68rem', fontWeight: 700,
            padding: '3px 8px', borderRadius: 999,
            display: 'flex', alignItems: 'center', gap: 4,
            backdropFilter: 'blur(4px)',
            letterSpacing: '0.02em',
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Visitado
          </div>
        )}
      </div>
      <div className="card__body">
        <div className="card__header">
          <h3 className="card__name">{nombre}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {numValoraciones > 0 ? (
              <div className="card__rating">
                ★ {valoracion} <span style={{ color: '#9ca3af', fontWeight: 400 }}>({numValoraciones})</span>
              </div>
            ) : esNuevo ? (
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981', background: '#d1fae5', padding: '3px 8px', borderRadius: 999 }}>Nuevo</span>
            ) : null}
            <button
              onClick={e => { e.stopPropagation(); onToggleFavorito(); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={esFavorito ? '#ff5c3a' : 'none'} stroke={esFavorito ? '#ff5c3a' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="card__tags">
          {tipo.map(t => <span key={t} className="card__tag">{t}</span>)}
        </div>
        <div className="card__footer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <span className="card__location">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
              {barrio ? `${barrio}, ` : ''}{ciudad}
            </span>
            <span style={{ fontSize: '0.7rem', color: propuestoPor ? '#ff5c3a' : '#9ca3af', fontWeight: 500 }}>
              {propuestoPor ? `@${propuestoPor}` : 'Trovi'}
            </span>
          </div>
          <span className="card__price" style={{ flexShrink: 0 }}>
            {precioMedio > 0 ? `${precioMedio}€ p.p.` : '—'}
          </span>
        </div>
      </div>
    </article>
  );
}

export default RestaurantCard;
