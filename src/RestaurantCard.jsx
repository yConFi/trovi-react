function RestaurantCard({ restaurante, onClick, esFavorito, onToggleFavorito }) {
  const { nombre, emoji, tipo, valoracion, numValoraciones, barrio, ciudad, precio, fotoUrl } = restaurante;

  const simbolosPrecio = Array.from({ length: 4 }, (_, i) =>
    i < precio
      ? <span key={i} style={{ color: '#111827' }}>€</span>
      : <span key={i} style={{ color: '#d1d5db' }}>€</span>
  );

  return (
    <article className="card" onClick={onClick}>
      <div className="card__image">
        {fotoUrl
          ? <img src={fotoUrl} alt={nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : emoji}
      </div>
      <div className="card__body">
        <div className="card__header">
          <h3 className="card__name">{nombre}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {numValoraciones > 0 ? (
              <div className="card__rating">
                ★ {valoracion} <span style={{ color: '#9ca3af', fontWeight: 400 }}>({numValoraciones})</span>
              </div>
            ) : (
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981', background: '#d1fae5', padding: '3px 8px', borderRadius: 999 }}>Nuevo</span>
            )}
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
          <span className="card__location">📍 {barrio ? `${barrio}, ` : ''}{ciudad}</span>
          <span className="card__price">{simbolosPrecio}</span>
        </div>
      </div>
    </article>
  );
}

export default RestaurantCard;
