import { useState, useEffect } from 'react';

function ValoracionEstrellas({ miValoracion, onValorar }) {
  const [hover, setHover] = useState(0);
  const [seleccion, setSeleccion] = useState(miValoracion ?? 0);
  const [guardado, setGuardado] = useState(!!miValoracion);

  useEffect(() => {
    setSeleccion(miValoracion ?? 0);
    setGuardado(!!miValoracion);
  }, [miValoracion]);

  async function guardar() {
    await onValorar(seleccion);
    setGuardado(true);
  }

  return (
    <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #f3f4f6' }}>
      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', marginBottom: 10 }}>
        {guardado ? `Tu valoración: ${seleccion}★` : '¿Has estado aquí? Valóralo'}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1, 2, 3, 4, 5].map(n => {
            const activa = (hover || seleccion) >= n;
            return (
              <button
                key={n}
                onClick={() => { setSeleccion(n); setGuardado(false); }}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill={activa ? '#ff5c3a' : 'none'} stroke={activa ? '#ff5c3a' : '#d1d5db'} strokeWidth="1.5" style={{ transition: 'fill 0.1s, stroke 0.1s' }}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            );
          })}
        </div>
        {seleccion > 0 && !guardado && (
          <button
            className="btn btn--primary"
            onClick={guardar}
            style={{ padding: '6px 16px', fontSize: '0.85rem' }}
          >
            Guardar
          </button>
        )}
        {guardado && (
          <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>✓ Guardado</span>
        )}
      </div>
    </div>
  );
}

export default ValoracionEstrellas;
