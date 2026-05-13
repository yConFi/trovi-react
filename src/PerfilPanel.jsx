import { useState, useEffect } from 'react';
import { supabase } from './supabase';

const estadoConfig = {
  pendiente: { label: 'Pendiente', color: '#f59e0b', bg: '#fef3c7' },
  aprobado:  { label: 'Aprobado',  color: '#10b981', bg: '#d1fae5' },
  rechazado: { label: 'Rechazado', color: '#ef4444', bg: '#fee2e2' },
};

function PerfilPanel({ usuario, onClose }) {
  const [propuestas, setPropuestas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase
        .from('propuestas')
        .select('*')
        .eq('user_id', usuario.id)
        .order('created_at', { ascending: false });
      setPropuestas(data ?? []);
      setCargando(false);
    }
    cargar();
  }, [usuario.id]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#fafaf9', zIndex: 400, overflowY: 'auto' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#111827' }}>Mi perfil</h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 4 }}>{usuario.email}</p>
          </div>
          <button className="btn btn--outline" onClick={onClose}>← Volver</button>
        </div>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: 16 }}>Mis propuestas</h2>

        {cargando ? (
          <p style={{ color: '#6b7280' }}>Cargando…</p>
        ) : propuestas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 12 }}>📭</span>
            <p>Todavía no has propuesto ningún sitio.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {propuestas.map(p => {
              const estado = estadoConfig[p.estado] ?? estadoConfig.pendiente;
              return (
                <div key={p.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontWeight: 700, color: '#111827' }}>{p.nombre}</span>
                    <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                      {p.barrio ? `${p.barrio}, ` : ''}{p.ciudad}
                      {p.tipo ? ` · ${p.tipo}` : ''}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                      {new Date(p.created_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: estado.color, background: estado.bg, padding: '4px 12px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                    {estado.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default PerfilPanel;
