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

function FormularioAprobacion({ propuesta, onPublicar, onCancelar }) {
  const [form, setForm] = useState({
    nombre: propuesta.nombre ?? '',
    ciudad: propuesta.ciudad ?? '',
    barrio: propuesta.barrio ?? '',
    tipo: propuesta.tipo ?? '',
    direccion: propuesta.direccion ?? '',
    horario: '',
    descripcion: propuesta.descripcion ?? '',
    porQueIr: propuesta.descripcion ?? '',
    precioMedio: '',
    emoji: '🍽️',
    fotoUrl: '',
  });
  const [publicando, setPublicando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubirFoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    setSubiendoFoto(true);
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('restaurantes').upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from('restaurantes').getPublicUrl(path);
      set('fotoUrl', data.publicUrl);
    }
    setSubiendoFoto(false);
  }

  async function handlePublicar() {
    setPublicando(true);
    await onPublicar(form);
    setPublicando(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Nombre</label>
          <input style={inputStyle} value={form.nombre} onChange={e => set('nombre', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Emoji</label>
          <input style={inputStyle} value={form.emoji} onChange={e => set('emoji', e.target.value)} placeholder="🍽️" />
        </div>
        <div>
          <label style={labelStyle}>Ciudad</label>
          <input style={inputStyle} value={form.ciudad} onChange={e => set('ciudad', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Barrio</label>
          <input style={inputStyle} value={form.barrio} onChange={e => set('barrio', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Tipo (separado por comas)</label>
          <input style={inputStyle} value={form.tipo} onChange={e => set('tipo', e.target.value)} placeholder="Ej: Japonesa, Restaurantes" />
        </div>
        <div>
          <label style={labelStyle}>Dirección</label>
          <input style={inputStyle} value={form.direccion} onChange={e => set('direccion', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Horario</label>
          <input style={inputStyle} value={form.horario} onChange={e => set('horario', e.target.value)} placeholder="Ej: Mar-Dom 13:00-23:00" />
        </div>
        <div>
          <label style={labelStyle}>Precio medio (€ p.p.)</label>
          <input style={inputStyle} type="number" value={form.precioMedio} onChange={e => set('precioMedio', e.target.value)} placeholder="Ej: 25" />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Foto</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input style={{ ...inputStyle, flex: 1 }} value={form.fotoUrl} onChange={e => set('fotoUrl', e.target.value)} placeholder="https://... o sube una imagen" />
            <label style={{
              padding: '10px 16px', border: '1.5px solid #e5e7eb', borderRadius: 10,
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#4b5563',
              background: 'white', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif',
              opacity: subiendoFoto ? 0.6 : 1,
            }}>
              {subiendoFoto ? 'Subiendo…' : '📎 Subir'}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleSubirFoto} disabled={subiendoFoto} />
            </label>
          </div>
          {form.fotoUrl && (
            <img src={form.fotoUrl} alt="preview" style={{ marginTop: 10, width: '100%', height: 140, objectFit: 'cover', borderRadius: 10 }} />
          )}
        </div>
      </div>
      <div>
        <label style={labelStyle}>Descripción</label>
        <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} />
      </div>
      <div>
        <label style={labelStyle}>¿Por qué ir?</label>
        <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={form.porQueIr} onChange={e => set('porQueIr', e.target.value)} placeholder="El gancho que aparece destacado en la tarjeta" />
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button
          className="btn btn--primary"
          style={{ padding: '10px 24px', fontSize: '0.9rem' }}
          onClick={handlePublicar}
          disabled={publicando}
        >
          {publicando ? 'Publicando…' : '✓ Publicar restaurante'}
        </button>
        <button
          className="btn btn--outline"
          style={{ padding: '10px 20px', fontSize: '0.9rem' }}
          onClick={onCancelar}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function AdminPanel({ onClose }) {
  const [propuestas, setPropuestas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [propuestaEditando, setPropuestaEditando] = useState(null);

  useEffect(() => {
    cargarPropuestas();
  }, []);

  async function cargarPropuestas() {
    const { data } = await supabase
      .from('propuestas')
      .select('*')
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: false });
    setPropuestas(data ?? []);
    setCargando(false);
  }

  async function notificar(email, nombre, estado) {
    try {
      await supabase.functions.invoke('notificar-propuesta', {
        body: { email, nombre, estado },
      });
    } catch (e) {
      console.error('Error enviando notificación:', e);
    }
  }

  async function publicar(propuesta, form) {
    const tipoArray = form.tipo
      ? form.tipo.split(',').map(t => t.trim()).filter(Boolean)
      : ['Restaurante'];

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
    });

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
    <div style={{ position: 'fixed', inset: 0, background: '#fafaf9', zIndex: 400, overflowY: 'auto' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#111827' }}>Panel de admin</h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 4 }}>Propuestas pendientes de revisión</p>
          </div>
          <button className="btn btn--outline" onClick={onClose}>← Volver</button>
        </div>

        {cargando ? (
          <p style={{ color: '#6b7280' }}>Cargando…</p>
        ) : propuestas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 12 }}>✅</span>
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
                  {p.ciudad && <span>📍 {p.barrio ? `${p.barrio}, ` : ''}{p.ciudad}</span>}
                  {p.tipo && <span>🍽️ {p.tipo}</span>}
                  {p.direccion && <span>🏠 {p.direccion}</span>}
                </div>
                {p.descripcion && (
                  <p style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.5 }}>{p.descripcion}</p>
                )}

                {propuestaEditando === p.id ? (
                  <div style={{ marginTop: 12, paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
                    <FormularioAprobacion
                      propuesta={p}
                      onPublicar={(form) => publicar(p, form)}
                      onCancelar={() => setPropuestaEditando(null)}
                    />
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <button
                      className="btn btn--primary"
                      style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                      onClick={() => setPropuestaEditando(p.id)}
                    >
                      ✓ Aprobar
                    </button>
                    <button
                      className="btn btn--outline"
                      style={{ padding: '8px 20px', fontSize: '0.85rem', color: '#ef4444', borderColor: '#fca5a5' }}
                      onClick={() => rechazar(p)}
                    >
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
