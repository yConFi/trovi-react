import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import CropperModal from './CropperModal';

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
    fotosUrls: propuesta.fotos_urls ?? [],
  });
  const [publicando, setPublicando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [estadoFoto, setEstadoFoto] = useState(null);
  const [cropperSrc, setCropperSrc] = useState(null);
  const [subiendoFotoAdicional, setSubiendoFotoAdicional] = useState(false);
  const [errorFotoAdicional, setErrorFotoAdicional] = useState(false);
  const [detallesAbiertos, setDetallesAbiertos] = useState(!!propuesta.nombre);

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubirFoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    setCropperSrc(URL.createObjectURL(file));
    e.target.value = '';
  }

  async function handleCropConfirm(blob) {
    const src = cropperSrc;
    setCropperSrc(null);
    URL.revokeObjectURL(src);
    setSubiendoFoto(true);
    setEstadoFoto(null);
    const path = `${Date.now()}.jpg`;
    const { error } = await supabase.storage.from('restaurantes').upload(path, blob, { contentType: 'image/jpeg' });
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
    setErrorFotoAdicional(false);
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('restaurantes').upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from('restaurantes').getPublicUrl(path);
      set('fotosUrls', [...form.fotosUrls, data.publicUrl]);
    } else {
      setErrorFotoAdicional(true);
    }
    setSubiendoFotoAdicional(false);
    e.target.value = '';
  }

  function eliminarFotoAdicional(url) {
    set('fotosUrls', form.fotosUrls.filter(u => u !== url));
  }

  function promoverAFotoPrincipal(url) {
    const nuevasFotos = form.fotosUrls.filter(u => u !== url);
    if (form.fotoUrl && !nuevasFotos.includes(form.fotoUrl)) nuevasFotos.push(form.fotoUrl);
    setForm(prev => ({ ...prev, fotoUrl: url, fotosUrls: nuevasFotos }));
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
                      onClick={() => promoverAFotoPrincipal(url)}
                      title="Hacer foto principal"
                      style={{ position: 'absolute', top: 4, left: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,92,58,0.85)', border: 'none', cursor: 'pointer', color: 'white', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >★</button>
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
            {errorFotoAdicional && <p style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600, marginTop: 6 }}>✕ Error al subir la foto.</p>}
          </div>
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
      {cropperSrc && (
        <CropperModal
          imageSrc={cropperSrc}
          onConfirm={handleCropConfirm}
          onCancelar={() => { URL.revokeObjectURL(cropperSrc); setCropperSrc(null); }}
        />
      )}
    </div>
  );
}

async function geocodificar(nombre, direccion, barrio, ciudad) {
  const intentos = [
    [nombre, direccion, barrio, ciudad].filter(Boolean).join(', '),
    [nombre, barrio, ciudad].filter(Boolean).join(', '),
    [barrio, ciudad, 'España'].filter(Boolean).join(', '),
    [ciudad, 'España'].filter(Boolean).join(', '),
  ].filter(Boolean);

  for (const query of intentos) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch {}
    await new Promise(r => setTimeout(r, 600));
  }
  return null;
}

function PanelCoordenadas({ onVolver }) {
  const [restaurantes, setRestaurantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [progreso, setProgreso] = useState({});
  const [corrigiendo, setCorrigiendo] = useState(null);
  const [queryCorreccion, setQueryCorreccion] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    supabase.from('restaurantes').select('id, nombre, direccion, barrio, ciudad, lat, lng')
      .order('nombre').then(({ data }) => {
        setRestaurantes(data ?? []);
        setCargando(false);
      });
  }, []);

  async function geocodificarConQuery(r, query) {
    setProgreso(p => ({ ...p, [r.id]: 'cargando' }));
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.length > 0) {
        const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        await supabase.from('restaurantes').update({ lat: coords.lat, lng: coords.lng }).eq('id', r.id);
        setRestaurantes(prev => prev.map(x => x.id === r.id ? { ...x, ...coords } : x));
        setProgreso(p => ({ ...p, [r.id]: 'ok' }));
        setCorrigiendo(null);
        return;
      }
    } catch {}
    setProgreso(p => ({ ...p, [r.id]: 'error' }));
  }

  async function geocodificarUno(r) {
    const coords = await geocodificar(r.nombre, r.direccion, r.barrio, r.ciudad);
    if (coords) {
      await supabase.from('restaurantes').update({ lat: coords.lat, lng: coords.lng }).eq('id', r.id);
      setRestaurantes(prev => prev.map(x => x.id === r.id ? { ...x, ...coords } : x));
      setProgreso(p => ({ ...p, [r.id]: 'ok' }));
    } else {
      setProgreso(p => ({ ...p, [r.id]: 'error' }));
    }
  }

  async function geocodificarTodos() {
    const sinCoords = restaurantes.filter(r => !r.lat || !r.lng);
    for (const r of sinCoords) {
      await geocodificarUno(r);
      await new Promise(res => setTimeout(res, 1100));
    }
  }

  function abrirCorreccion(r) {
    setCorrigiendo(r.id);
    setQueryCorreccion([r.nombre, r.barrio, r.ciudad].filter(Boolean).join(', '));
  }

  const sinCoords = restaurantes.filter(r => !r.lat || !r.lng);
  const restaurantesFiltrados = restaurantes.filter(r =>
    r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.ciudad?.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.barrio?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827' }}>Coordenadas del mapa</h2>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 2 }}>
            {restaurantes.length - sinCoords.length} de {restaurantes.length} con ubicación
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {sinCoords.length > 0 && (
            <button className="btn btn--primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={geocodificarTodos}>
              Geocodificar todos ({sinCoords.length})
            </button>
          )}
          <button className="btn btn--outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={onVolver}>
            ← Volver
          </button>
        </div>
      </div>
      {cargando ? <p style={{ color: '#6b7280' }}>Cargando…</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            style={{ ...inputStyle, marginBottom: 4 }}
            placeholder="Buscar por nombre, ciudad o barrio…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          {restaurantesFiltrados.map(r => {
            const estado = progreso[r.id];
            const tieneCoords = r.lat && r.lng;
            const estaCorrigiendo = corrigiendo === r.id;
            return (
              <div key={r.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>{r.nombre}</p>
                    <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 2 }}>
                      {[r.direccion, r.barrio, r.ciudad].filter(Boolean).join(', ')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {estado === 'cargando' && <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>Buscando…</span>}
                    {estado === 'ok' && <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>✓ Guardado</span>}
                    {estado === 'error' && <span style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 600 }}>Sin resultados</span>}
                    {tieneCoords && !estado && (
                      <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>✓ {r.lat?.toFixed(4)}, {r.lng?.toFixed(4)}</span>
                    )}
                    {tieneCoords && estado !== 'cargando' && (
                      <button className="btn btn--outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => abrirCorreccion(r)}>
                        Corregir
                      </button>
                    )}
                    {!tieneCoords && estado !== 'ok' && estado !== 'cargando' && (
                      <button className="btn btn--outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => abrirCorreccion(r)}>
                        Geocodificar
                      </button>
                    )}
                  </div>
                </div>
                {estaCorrigiendo && (
                  <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                    <input
                      style={{ ...inputStyle, flex: 1, fontSize: '0.85rem', padding: '7px 12px' }}
                      value={queryCorreccion}
                      onChange={e => setQueryCorreccion(e.target.value)}
                      placeholder="Ej: Bar El Rinconcillo, Calle Gerona, Sevilla"
                      onKeyDown={e => e.key === 'Enter' && geocodificarConQuery(r, queryCorreccion)}
                    />
                    <button className="btn btn--primary" style={{ padding: '7px 14px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                      onClick={() => geocodificarConQuery(r, queryCorreccion)} disabled={estado === 'cargando'}>
                      Buscar
                    </button>
                    <button className="btn btn--outline" style={{ padding: '7px 12px', fontSize: '0.82rem' }}
                      onClick={() => setCorrigiendo(null)}>
                      ✕
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdminPanel({ onClose, onPublicado }) {
  const [propuestas, setPropuestas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [propuestaEditando, setPropuestaEditando] = useState(null);
  const [añadiendoNuevo, setAñadiendoNuevo] = useState(false);
  const [gestionandoCoordenadas, setGestionandoCoordenadas] = useState(false);

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

  async function insertarRestaurante(form, propuestoPor = null) {
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
      propuesto_por: propuestoPor ?? null,
    });
    if (onPublicado) onPublicado();
  }

  async function aprobar(propuesta, form) {
    await insertarRestaurante(form, propuesta.user_username ?? null);
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
              <>
                <button className="btn btn--outline" style={{ padding: '8px 18px', fontSize: '0.85rem' }} onClick={() => setGestionandoCoordenadas(true)}>
                  Coordenadas
                </button>
                <button className="btn btn--primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }} onClick={() => setAñadiendoNuevo(true)}>
                  + Añadir
                </button>
              </>
            )}
            <button className="btn btn--outline" onClick={añadiendoNuevo ? () => setAñadiendoNuevo(false) : onClose}>
              ← Volver
            </button>
          </div>
        </div>

        {gestionandoCoordenadas ? (
          <PanelCoordenadas onVolver={() => setGestionandoCoordenadas(false)} />
        ) : añadiendoNuevo ? (
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
