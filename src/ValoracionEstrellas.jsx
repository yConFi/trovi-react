import { useState, useEffect } from 'react';

function ValoracionEstrellas({ miValoracion, miComentario, onValorar, usuario, onLoginClick }) {
  const [hover, setHover] = useState(0);
  const [seleccion, setSeleccion] = useState(miValoracion ?? 0);
  const [comentario, setComentario] = useState(miComentario ?? '');
  const [guardado, setGuardado] = useState(!!miValoracion);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setSeleccion(miValoracion ?? 0);
    setComentario(miComentario ?? '');
    setGuardado(!!miValoracion);
  }, [miValoracion, miComentario]);

  async function guardar() {
    setGuardando(true);
    const exito = await onValorar(seleccion, comentario);
    if (exito) setGuardado(true);
    setGuardando(false);
  }

  return (
    <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #f3f4f6' }}>
      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', marginBottom: 10 }}>
        {guardado ? `Tu valoración: ${seleccion}★` : '¿Has estado aquí? Valóralo'}
      </p>

      {!usuario ? (
        <button
          onClick={onLoginClick}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#ff5c3a', fontWeight: 600 }}
        >
          Inicia sesión para valorar →
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4, 5].map(n => {
                const activa = (hover || seleccion) >= n;
                return (
                  <button
                    key={n}
                    onClick={() => { if (!guardando) { setSeleccion(n); setGuardado(false); } }}
                    onMouseEnter={() => !guardando && setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    style={{ background: 'none', border: 'none', cursor: guardando ? 'default' : 'pointer', padding: 0, lineHeight: 1, opacity: guardando ? 0.5 : 1 }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill={activa ? '#ff5c3a' : 'none'} stroke={activa ? '#ff5c3a' : '#d1d5db'} strokeWidth="1.5" style={{ transition: 'fill 0.1s, stroke 0.1s' }}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                );
              })}
            </div>
            {guardado && (
              <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>✓ Guardado</span>
            )}
          </div>

          {seleccion > 0 && (
            <textarea
              value={comentario}
              onChange={e => { setComentario(e.target.value); setGuardado(false); }}
              placeholder="¿Qué destacarías? (opcional)"
              maxLength={200}
              rows={2}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 10,
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                color: '#111827',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          )}

          {seleccion > 0 && !guardado && (
            <button
              className="btn btn--primary"
              onClick={guardar}
              disabled={guardando}
              style={{ padding: '8px 16px', fontSize: '0.85rem', alignSelf: 'flex-start' }}
            >
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ValoracionEstrellas;
