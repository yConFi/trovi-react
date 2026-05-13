import { useState, useEffect } from 'react';
import { supabase } from './supabase';

function AdminPanel({ onClose }) {
  const [propuestas, setPropuestas] = useState([]);
  const [cargando, setCargando] = useState(true);

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

  async function aprobar(propuesta) {
    const tipoArray = propuesta.tipo
      ? propuesta.tipo.split(',').map(t => t.trim()).filter(Boolean)
      : ['Restaurante'];

    await supabase.from('restaurantes').insert({
      nombre: propuesta.nombre,
      emoji: '🍽️',
      tipo: tipoArray,
      valoracion: 0,
      num_valoraciones: 0,
      ciudad: propuesta.ciudad,
      barrio: propuesta.barrio ?? '',
      direccion: propuesta.direccion ?? '',
      horario: 'Consultar',
      descripcion: propuesta.descripcion ?? '',
      por_que_ir: propuesta.descripcion ?? '',
      precio_medio: 0,
      precio: 2,
    });

    await supabase.from('propuestas').update({ estado: 'aprobado' }).eq('id', propuesta.id);
    if (propuesta.user_email) await notificar(propuesta.user_email, propuesta.nombre, 'aprobado');
    setPropuestas(prev => prev.filter(p => p.id !== propuesta.id));
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
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button
                    className="btn btn--primary"
                    style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                    onClick={() => aprobar(p)}
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
