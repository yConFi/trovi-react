import { useState } from 'react';
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

function EditarRestauranteModal({ restaurante, onGuardar, onCerrar }) {
  const [form, setForm] = useState({
    nombre: restaurante.nombre ?? '',
    emoji: restaurante.emoji ?? '🍽️',
    ciudad: restaurante.ciudad ?? '',
    barrio: restaurante.barrio ?? '',
    tipo: Array.isArray(restaurante.tipo) ? restaurante.tipo.join(', ') : restaurante.tipo ?? '',
    direccion: restaurante.direccion ?? '',
    horario: restaurante.horario ?? '',
    descripcion: restaurante.descripcion ?? '',
    porQueIr: restaurante.porQueIr ?? '',
    precioMedio: restaurante.precioMedio ?? '',
    fotoUrl: restaurante.fotoUrl ?? '',
  });
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [estadoFoto, setEstadoFoto] = useState(null);

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

  async function handleGuardar() {
    setGuardando(true);
    const tipoArray = form.tipo
      ? form.tipo.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const { error } = await supabase.from('restaurantes').update({
      nombre: form.nombre,
      emoji: form.emoji,
      tipo: tipoArray,
      ciudad: form.ciudad,
      barrio: form.barrio,
      direccion: form.direccion,
      horario: form.horario,
      descripcion: form.descripcion,
      por_que_ir: form.porQueIr,
      precio_medio: parseFloat(form.precioMedio) || 0,
      foto_url: form.fotoUrl || null,
    }).eq('id', restaurante.id);

    if (!error) {
      onGuardar({
        ...restaurante,
        nombre: form.nombre,
        emoji: form.emoji,
        tipo: tipoArray,
        ciudad: form.ciudad,
        barrio: form.barrio,
        direccion: form.direccion,
        horario: form.horario,
        descripcion: form.descripcion,
        porQueIr: form.porQueIr,
        precioMedio: parseFloat(form.precioMedio) || 0,
        fotoUrl: form.fotoUrl || null,
      });
    }
    setGuardando(false);
  }

  return (
    <div className="modal-overlay modal-overlay--open" onClick={e => e.target === e.currentTarget && onCerrar()}>
      <div className="modal" style={{ maxWidth: 580 }}>
        <button className="modal__close" onClick={onCerrar}>✕</button>
        <div className="modal__body" style={{ paddingTop: 40 }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 20 }}>Editar restaurante</h2>
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
                <input style={inputStyle} value={form.tipo} onChange={e => set('tipo', e.target.value)} />
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
                <input style={inputStyle} type="number" value={form.precioMedio} onChange={e => set('precioMedio', e.target.value)} />
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
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {!subiendoFoto && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                      )}
                      {subiendoFoto ? 'Subiendo…' : 'Subir'}
                    </span>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleSubirFoto} disabled={subiendoFoto} />
                  </label>
                </div>
                {estadoFoto === 'ok' && <p style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, marginTop: 6 }}>✓ Foto subida correctamente</p>}
                {estadoFoto === 'error' && <p style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600, marginTop: 6 }}>✕ Error al subir la foto.</p>}
                {form.fotoUrl && <img src={form.fotoUrl} alt="preview" style={{ marginTop: 10, width: '100%', height: 140, objectFit: 'cover', borderRadius: 10 }} />}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Descripción</label>
              <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>¿Por qué ir?</label>
              <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={form.porQueIr} onChange={e => set('porQueIr', e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button className="btn btn--primary" style={{ padding: '10px 24px' }} onClick={handleGuardar} disabled={guardando}>
                {guardando ? 'Guardando…' : '✓ Guardar cambios'}
              </button>
              <button className="btn btn--outline" style={{ padding: '10px 20px' }} onClick={onCerrar}>Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditarRestauranteModal;
