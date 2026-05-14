import { useState, useRef } from 'react';
import { supabase } from './supabase';

function PropuestaModal({ usuario, onClose }) {
  const [nombre, setNombre] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [barrio, setBarrio] = useState('');
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [fotosUrls, setFotosUrls] = useState([]);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function handleSubirFotos(e) {
    const files = Array.from(e.target.files).slice(0, 5 - fotosUrls.length);
    if (!files.length) return;
    setSubiendoFoto(true);
    const nuevas = [];
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const path = `propuestas/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('restaurantes').upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from('restaurantes').getPublicUrl(path);
        nuevas.push(data.publicUrl);
      }
    }
    setFotosUrls(prev => [...prev, ...nuevas]);
    setSubiendoFoto(false);
    e.target.value = '';
  }

  function eliminarFoto(url) {
    setFotosUrls(prev => prev.filter(u => u !== url));
  }

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
      fotos_urls: fotosUrls,
      user_id: usuario.id,
      user_email: usuario.email,
    });

    if (error) {
      setError('Ha ocurrido un error. Inténtalo de nuevo.');
    } else {
      setEnviado(true);
    }

    setCargando(false);
  }

  const modalRef = useRef(null);
  const touchStartY = useRef(0);
  const dragOffset = useRef(0);

  function onTouchStart(e) {
    touchStartY.current = e.touches[0].clientY;
  }

  function onTouchMove(e) {
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0 && modalRef.current?.scrollTop === 0) {
      dragOffset.current = delta;
      modalRef.current.style.transform = `translateY(${delta}px)`;
      modalRef.current.style.transition = 'none';
    }
  }

  function onTouchEnd() {
    if (dragOffset.current > window.innerHeight * 0.5) {
      onClose();
    } else if (modalRef.current) {
      modalRef.current.style.transform = '';
      modalRef.current.style.transition = 'transform 0.3s ease';
    }
    dragOffset.current = 0;
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
      <div className="modal" style={{ maxWidth: 480 }} ref={modalRef} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <button className="modal__close" onClick={onClose}>✕</button>
        <div className="modal__body" style={{ paddingTop: 40 }}>
          {enviado ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto 16px' }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
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
                <input type="text" placeholder="Nombre del restaurante *" value={nombre} onChange={e => setNombre(e.target.value)} required style={inputStyle} />
                <input type="text" placeholder="Provincia *" value={ciudad} onChange={e => setCiudad(e.target.value)} required style={inputStyle} />
                <input type="text" placeholder="Barrio, pueblo o zona (opcional)" value={barrio} onChange={e => setBarrio(e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Tipo de cocina *" value={tipo} onChange={e => setTipo(e.target.value)} required style={inputStyle} />
                <input type="text" placeholder="Dirección (opcional)" value={direccion} onChange={e => setDireccion(e.target.value)} style={inputStyle} />
                <textarea placeholder="¿Por qué merece estar en Trovi? (opcional)" value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: fotosUrls.length >= 3 ? '#10b981' : '#6b7280' }}>
                      Fotos ({fotosUrls.length}/5)
                      {fotosUrls.length < 3 && (
                        <span style={{ fontWeight: 400, color: '#9ca3af' }}> — mínimo 3</span>
                      )}
                    </span>
                    {fotosUrls.length < 5 && (
                      <label style={{ cursor: subiendoFoto ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 600, color: subiendoFoto ? '#9ca3af' : '#ff5c3a', fontFamily: 'Inter, sans-serif' }}>
                        {subiendoFoto ? 'Subiendo…' : '+ Añadir fotos'}
                        <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleSubirFotos} disabled={subiendoFoto} />
                      </label>
                    )}
                  </div>
                  {fotosUrls.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      {fotosUrls.map(url => (
                        <div key={url} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', aspectRatio: '1' }}>
                          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => eliminarFoto(url)}
                            style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', color: 'white', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {error && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</p>}
                <button type="submit" className="btn btn--primary" disabled={cargando || subiendoFoto || fotosUrls.length < 3} style={{ marginTop: 4, padding: '13px', fontSize: '0.95rem', opacity: fotosUrls.length < 3 ? 0.5 : 1 }}>
                  {cargando ? 'Enviando…' : fotosUrls.length < 3 ? `Añade ${3 - fotosUrls.length} foto${3 - fotosUrls.length > 1 ? 's' : ''} más para continuar` : 'Enviar propuesta'}
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
