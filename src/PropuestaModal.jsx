import { useState } from 'react';
import { supabase } from './supabase';

function PropuestaModal({ usuario, onClose }) {
  const [nombre, setNombre] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [barrio, setBarrio] = useState('');
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);

    const { error } = await supabase.from('propuestas').insert({
      nombre,
      ciudad,
      barrio,
      tipo,
      descripcion,
      direccion,
      user_id: usuario.id,
    });

    if (error) {
      setError('Ha ocurrido un error. Inténtalo de nuevo.');
    } else {
      setEnviado(true);
    }

    setCargando(false);
  }

  const inputStyle = {
    padding: '12px 16px',
    border: '1.5px solid #e5e7eb',
    borderRadius: 10,
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.95rem',
    outline: 'none',
    width: '100%',
  };

  return (
    <div className="modal-overlay modal-overlay--open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <button className="modal__close" onClick={onClose}>✕</button>
        <div className="modal__body" style={{ paddingTop: 40 }}>
          {enviado ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: 16 }}>🎉</span>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>¡Propuesta enviada!</h2>
              <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: 24 }}>
                Revisaremos el sitio y lo publicaremos si cumple los requisitos. Gracias por contribuir.
              </p>
              <button className="btn btn--primary" onClick={onClose}>Cerrar</button>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>Proponer restaurante</h2>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: 24 }}>
                Lo revisaremos antes de publicarlo.
              </p>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  type="text"
                  placeholder="Nombre del restaurante *"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  required
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Ciudad *"
                  value={ciudad}
                  onChange={e => setCiudad(e.target.value)}
                  required
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Barrio (opcional)"
                  value={barrio}
                  onChange={e => setBarrio(e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Tipo de cocina *"
                  value={tipo}
                  onChange={e => setTipo(e.target.value)}
                  required
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Dirección (opcional)"
                  value={direccion}
                  onChange={e => setDireccion(e.target.value)}
                  style={inputStyle}
                />
                <textarea
                  placeholder="¿Por qué merece estar en Trovi? (opcional)"
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
                {error && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</p>}
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={cargando}
                  style={{ marginTop: 4, padding: '13px', fontSize: '0.95rem' }}
                >
                  {cargando ? 'Enviando…' : 'Enviar propuesta'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PropuestaModal;
