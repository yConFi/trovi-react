function RestaurantCard({ restaurante, onClick }) {
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
          <div className="card__rating">
            ★ {valoracion} <span style={{ color: '#9ca3af', fontWeight: 400 }}>({numValoraciones})</span>
          </div>
        </div>
        <div className="card__tags">
          {tipo.map(t => <span key={t} className="card__tag">{t}</span>)}
        </div>
        <div className="card__footer">
          <span className="card__location">📍 {barrio}, {ciudad}</span>
          <span className="card__price">{simbolosPrecio}</span>
        </div>
      </div>
    </article>
  );
}

export default RestaurantCard;
