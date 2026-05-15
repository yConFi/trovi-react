import { useState, useEffect } from 'react';
import { supabase } from './supabase';

const inputStyle = {
  padding: '10px 14px',
  border: '1.5px solid #e5e7eb',
  borderRadius: 10,
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.9rem',
  outline: 'none',
  width: '100%',
};

const labelStyle = {
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#6b7280',
  marginBottom: 4,
  display: 'block',
};

function FormularioRestaurante({ propuesta = {}, onPublicar, onCancelar, textoBoton = '✓ Publicar restaurante' }) {
  const [form, setForm] = useState({
    destacado: false,
    nombre: propuesta.nombre ?? '',
    ciudad: propuesta.ciudad ?? '',
    barrio: propuesta.barrio ?? '',
    tipo: propuesta.tipo ?? '',
    direccion: propuesta.direccion ?? '',
    horario: '',
    descripcion: propuesta.descripcion ?? '',
    porQueIr: '',
    precioMedio: '',
    emoji: '🍽️',
    fotoUrl: '',
    fotosUrls: [],
  });
  const [publicando, setPublicando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [estadoFoto, setEstadoFoto] = useState(null);
  const [subiendoFotoAdicional, setSubiendoFotoAdicional] = useState(false);
  const [detallesAbiertos, setDetallesAbiertos] = useState(!!propuesta.nombre);

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubirFoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    setSubiendoFoto(true);
    setEstadoFoto(null);
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('restaurantes').upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from('restaurantes').getPublicUrl(path);
      set('fotoUrl', data.publicUrl);
      setEstadoFoto('ok');
    } else {
      setEstadoFoto('error');
    }
    setSubiendoFoto(false);
  }

  async function handleSubirFotoAdicional(e) {
    const file = e.target.files[0];
    if (!file) return;
    setSubiendoFotoAdicional(true);
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('restaurantes').upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from('restaurantes').getPublicUrl(path);
      set('fotosUrls', [...form.fotosUrls, data.publicUrl]);
    }
    setSubiendoFotoAdicional(false);
    e.target.value = '';
  }

  function eliminarFotoAdicional(url) {
    set('fotosUrls', form.fotosUrls.filter(u => u !== url));
  }

  async function handlePublicar() {
    setPublicando(true);
    await onPublicar(form);
    setPublicando(false);
  }

  const puedePublicar = form.nombre.trim() && form.ciudad.trim() && form.tipo.trim() && form.porQueIr.trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Campos obligatorios */}
      <div style={{ background: '#fafaf9', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Obligatorios</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Nombre *</label>
            <input style={inputStyle} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: La Pepita" />
          </div>
          <div>
            <label style={labelStyle}>Provincia *</label>
            <input style={inputStyle} value={form.ciudad} onChange={e => set('ciudad', e.target.value)} placeholder="Ej: Sevilla" />
          </div>
          <div>
            <label style={labelStyle}>Tipo (separado por comas) *</label>
            <input style={inputStyle} value={form.tipo} onChange={e => set('tipo', e.target.value)} placeholder="Ej: Tapas, Restaurantes" />
          </div>
          <div>
            <label style={labelStyle}>Barrio, pueblo o zona</label>
            <input style={inputStyle} value={form.barrio} onChange={e => set('barrio', e.target.value)} placeholder="Ej: Triana" />
          </div>
        </div>
        <div>
          <label style={labelStyle}>¿Por qué ir? * <span style={{ fontWeight: 400, color: '#9ca3af' }}>— gancho que aparece en la tarjeta</span></label>
          <input style={inputStyle} value={form.porQueIr} onChange={e => set('porQueIr', e.target.value)} placeholder="Ej: Las mejores croquetas de Sevilla" />
        </div>
      </div>

      {/* Detalles opcionales */}
      <button
        type="button"
        onClick={() => setDetallesAbiertos(v => !v)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', padding: '2px 0', fontFamily: 'Inter, sans-serif' }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: detallesAbiertos ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
        {detallesAbiertos ? 'Ocultar detalles opcionales' : 'Añadir más detalles (opcional)'}
      </button>

      {detallesAbiertos && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Emoji</label>
              <input style={inputStyle} value={form.emoji} onChange={e => set('emoji', e.target.value)} placeholder="🍽️" />
            </div>
            <div>
              <label style={labelStyle}>Precio medio (€ p.p.)</label>
              <input style={inputStyle} type="number" value={form.precioMedio} onChange={e => set('precioMedio', e.target.value)} placeholder="Ej: 25" />
            </div>
            <div>
              <label style={labelStyle}>Dirección</label>
              <input style={inputStyle} value={form.direccion} onChange={e => set('direccion', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Horario</label>
              <input style={inputStyle} value={form.horario} onChange={e => set('horario', e.target.value)} placeholder="Ej: Mar-Dom 13:00-23:00" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} />
          </div>
          {propuesta.fotos_urls?.length > 0 && (
            <div>
              <label style={labelStyle}>Fotos del usuario — haz clic para usar como principal</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {propuesta.fotos_urls.map(url => (
                  <div key={url} onClick={() => set('fotoUrl', url)} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', aspectRatio: '1', cursor: 'pointer', outline: form.fotoUrl === url ? '2.5px solid #ff5c3a' : '2.5px solid transparent' }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {form.fotoUrl === url && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,92,58,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <label style={labelStyle}>Foto principal (fachada)</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input style={{ ...inputStyle, flex: 1 }} value={form.fotoUrl} onChange={e => set('fotoUrl', e.target.value)} placeholder="https://..." />
              <label style={{ padding: '10px 16px', border: '1.5px solid #e5e7eb', borderRadius: 10, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', background: 'white', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif', opacity: subiendoFoto ? 0.6 : 1 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {!subiendoFoto && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>}
                  {subiendoFoto ? 'Subiendo…' : 'Subir'}
                </span>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleSubirFoto} disabled={subiendoFoto} />
              </label>
            </div>
            {estadoFoto === 'ok' && <p style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, marginTop: 6 }}>✓ Foto subida</p>}
            {estadoFoto === 'error' && <p style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600, marginTop: 6 }}>✕ Error al subir</p>}
            {form.fotoUrl && <img src={form.fotoUrl} alt="preview" style={{ marginTop: 10, width: '100%', height: 140, objectFit: 'cover', borderRadius: 10 }} />}
          </div>
          <div>
            <label style={labelStyle}>Fotos adicionales</label>
            {form.fotosUrls.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
                {form.fotosUrls.map(url => (
                  <div key={url} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', aspectRatio: '1' }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={() => eliminarFotoAdicional(url)}
                      style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', color: 'white', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
            <label style={{ padding: '10px 16px', border: '1.5px dashed #e5e7eb', borderRadius: 10, cursor: subiendoFotoAdicional ? 'default' : 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', background: '#fafafa', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Inter, sans-serif', opacity: subiendoFotoAdicional ? 0.6 : 1 }}>
              {subiendoFotoAdicional ? 'Subiendo…' : '+ Añadir foto'}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleSubirFotoAdicional} disabled={subiendoFotoAdicional} />
            </label>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
            <div onClick={() => set('destacado', !form.destacado)} style={{ width: 40, height: 22, borderRadius: 999, cursor: 'pointer', background: form.destacado ? '#ff5c3a' : '#e5e7eb', position: 'relative', transition: 'background 0.2s ease', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 3, left: form.destacado ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>Marcar como destacado</span>
          </label>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button className="btn btn--primary" style={{ padding: '10px 24px', fontSize: '0.9rem' }} onClick={handlePublicar} disabled={publicando || subiendoFoto || !puedePublicar}>
          {publicando ? 'Publicando…' : textoBoton}
        </button>
        <button className="btn btn--outline" style={{ padding: '10px 20px', fontSize: '0.9rem' }} onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function AdminPanel({ onClose, onPublicado }) {
  const [propuestas, setPropuestas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [propuestaEditando, setPropuestaEditando] = useState(null);
  const [añadiendoNuevo, setAñadiendoNuevo] = useState(false);

  useEffect(() => {
    cargarPropuestas();
  }, []);

  async function cargarPropuestas() {
    const { data } = await supabase.from('propuestas').select('*').eq('estado', 'pendiente').order('created_at', { ascending: false });
    setPropuestas(data ?? []);
    setCargando(false);
  }

  async function notificar(email, nombre, estado) {
    try {
      await supabase.functions.invoke('notificar-propuesta', { body: { email, nombre, estado } });
    } catch (e) {
      console.error('Error enviando notificación:', e);
    }
  }

  async function insertarRestaurante(form) {
    const tipoArray = form.tipo ? form.tipo.split(',').map(t => t.trim()).filter(Boolean) : ['Restaurante'];
    await supabase.from('restaurantes').insert({
      nombre: form.nombre,
      emoji: form.emoji,
      tipo: tipoArray,
      valoracion: 0,
      num_valoraciones: 0,
      ciudad: form.ciudad,
      barrio: form.barrio,
      direccion: form.direccion,
      horario: form.horario || 'Consultar',
      descripcion: form.descripcion,
      por_que_ir: form.porQueIr,
      precio_medio: parseFloat(form.precioMedio) || 0,
      precio: 2,
      foto_url: form.fotoUrl || null,
      fotos_urls: form.fotosUrls ?? [],
      destacado: form.destacado ?? false,
    });
    if (onPublicado) onPublicado();
  }

  async function aprobar(propuesta, form) {
    await insertarRestaurante(form);
    await supabase.from('propuestas').update({ estado: 'aprobado' }).eq('id', propuesta.id);
    if (propuesta.user_email) await notificar(propuesta.user_email, form.nombre, 'aprobado');
    setPropuestas(prev => prev.filter(p => p.id !== propuesta.id));
    setPropuestaEditando(null);
  }

  async function rechazar(propuesta) {
    await supabase.from('propuestas').update({ estado: 'rechazado' }).eq('id', propuesta.id);
    if (propuesta.user_email) await notificar(propuesta.user_email, propuesta.nombre, 'rechazado');
    setPropuestas(prev => prev.filter(p => p.id !== propuesta.id));
  }

  async function añadirDirecto(form) {
    await insertarRestaurante(form);
    setAñadiendoNuevo(false);
  }

  const rowStyle = {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  };

  return (
    <div className="panel-fullscreen">
      <div className="panel-fullscreen__inner">
        <div className="panel-fullscreen__header">
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#111827' }}>
              {añadiendoNuevo ? 'Añadir restaurante' : 'Panel de admin'}
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 4 }}>
              {añadiendoNuevo ? 'Rellena los datos y publica directamente' : 'Propuestas pendientes de revisión'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {!añadiendoNuevo && (
              <button className="btn btn--primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }} onClick={() => setAñadiendoNuevo(true)}>
                + Añadir
              </button>
            )}
            <button className="btn btn--outline" onClick={añadiendoNuevo ? () => setAñadiendoNuevo(false) : onClose}>
              {añadiendoNuevo ? '← Volver' : '← Volver'}
            </button>
          </div>
        </div>

        {añadiendoNuevo ? (
          <FormularioRestaurante
            onPublicar={añadirDirecto}
            onCancelar={() => setAñadiendoNuevo(false)}
            textoBoton="✓ Añadir restaurante"
          />
        ) : cargando ? (
          <p style={{ color: '#6b7280' }}>Cargando…</p>
        ) : propuestas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto 12px' }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <p>No hay propuestas pendientes.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {propuestas.map(p => (
              <div key={p.id} style={rowStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#111827' }}>{p.nombre}</h3>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{new Date(p.created_at).toLocaleDateString('es-ES')}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {p.ciudad && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                      {p.barrio ? `${p.barrio}, ` : ''}{p.ciudad}
                    </span>
                  )}
                  {p.tipo && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>
                      {p.tipo}
                    </span>
                  )}
                </div>
                {p.descripcion && <p style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.5 }}>{p.descripcion}</p>}
                {p.fotos_urls?.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                    {p.fotos_urls.map(url => (
                      <img key={url} src={url} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6 }} />
                    ))}
                  </div>
                )}
                {propuestaEditando === p.id ? (
                  <div style={{ marginTop: 12, paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
                    <FormularioRestaurante
                      propuesta={p}
                      onPublicar={(form) => aprobar(p, form)}
                      onCancelar={() => setPropuestaEditando(null)}
                    />
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <button className="btn btn--primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }} onClick={() => setPropuestaEditando(p.id)}>
                      ✓ Aprobar
                    </button>
                    <button className="btn btn--outline" style={{ padding: '8px 20px', fontSize: '0.85rem', color: '#ef4444', borderColor: '#fca5a5' }} onClick={() => rechazar(p)}>
                      ✕ Rechazar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
