import { useState } from 'react';
import { supabase } from './supabase';
import { useSwipeClose } from './useSwipeClose';
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

function EditarRestauranteModal({ restaurante, onGuardar, onEliminar, onCerrar }) {
  const { ref, onTouchStart, onTouchMove, onTouchEnd } = useSwipeClose(onCerrar);
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
    fotosUrls: restaurante.fotosUrls ?? [],
    destacado: restaurante.destacado ?? false,
  });
  const [guardando, setGuardando] = useState(false);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [estadoFoto, setEstadoFoto] = useState(null);
  const [cropperSrc, setCropperSrc] = useState(null);
  const [subiendoFotoAdicional, setSubiendoFotoAdicional] = useState(false);
  const [errorFotoAdicional, setErrorFotoAdicional] = useState(false);

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
      fotos_urls: form.fotosUrls,
      destacado: form.destacado,
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
        fotosUrls: form.fotosUrls,
        destacado: form.destacado,
      });
    }
    setGuardando(false);
  }

  return (
    <>
    <div className="modal-overlay modal-overlay--open" onClick={e => e.target === e.currentTarget && onCerrar()}>
      <div className="modal" style={{ maxWidth: 580 }} ref={ref} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
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
                <label style={labelStyle}>Provincia</label>
                <input style={inputStyle} value={form.ciudad} onChange={e => set('ciudad', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Barrio, pueblo o zona</label>
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
                <label style={labelStyle}>Foto principal (fachada)</label>
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
              <div style={{ gridColumn: 'span 2' }}>
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
            <div>
              <label style={labelStyle}>Descripción</label>
              <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>¿Por qué ir?</label>
              <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={form.porQueIr} onChange={e => set('porQueIr', e.target.value)} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
              <div
                onClick={() => set('destacado', !form.destacado)}
                style={{
                  width: 40, height: 22, borderRadius: 999, cursor: 'pointer',
                  background: form.destacado ? '#ff5c3a' : '#e5e7eb',
                  position: 'relative', transition: 'background 0.2s ease', flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute', top: 3, left: form.destacado ? 21 : 3,
                  width: 16, height: 16, borderRadius: '50%', background: 'white',
                  transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>Marcar como destacado</span>
            </label>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, gap: 10 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn--primary" style={{ padding: '10px 24px' }} onClick={handleGuardar} disabled={guardando}>
                  {guardando ? 'Guardando…' : '✓ Guardar cambios'}
                </button>
                <button className="btn btn--outline" style={{ padding: '10px 20px' }} onClick={onCerrar}>Cancelar</button>
              </div>
              {!confirmandoEliminar ? (
                <button
                  onClick={() => setConfirmandoEliminar(true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#ef4444', fontFamily: 'Inter, sans-serif', padding: '10px 4px' }}
                >
                  Eliminar restaurante
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 600 }}>¿Seguro?</span>
                  <button
                    className="btn"
                    style={{ padding: '8px 16px', fontSize: '0.85rem', background: '#ef4444', color: 'white', border: 'none' }}
                    onClick={() => onEliminar(restaurante.id)}
                  >
                    Sí, eliminar
                  </button>
                  <button
                    className="btn btn--outline"
                    style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                    onClick={() => setConfirmandoEliminar(false)}
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    {cropperSrc && (
      <CropperModal
        imageSrc={cropperSrc}
        onConfirm={handleCropConfirm}
        onCancelar={() => { URL.revokeObjectURL(cropperSrc); setCropperSrc(null); }}
      />
    )}
    </>
  );
}

export default EditarRestauranteModal;
