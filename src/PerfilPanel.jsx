import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import RestaurantCard from './RestaurantCard';

const estadoConfig = {
  pendiente: { label: 'Pendiente', color: '#f59e0b', bg: '#fef3c7' },
  aprobado:  { label: 'Aprobado',  color: '#10b981', bg: '#d1fae5' },
  rechazado: { label: 'Rechazado', color: '#ef4444', bg: '#fee2e2' },
};

const inputStyle = {
  padding: '11px 14px',
  border: '1.5px solid #e5e7eb',
  borderRadius: 10,
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.95rem',
  outline: 'none',
  width: '100%',
};

function Avatar({ nombre, email, size = 64 }) {
  const texto = nombre
    ? nombre.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : email.slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #ff5c3a 0%, #ff8c6b 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 700, fontSize: size * 0.35,
      flexShrink: 0, letterSpacing: '-0.5px',
    }}>
      {texto}
    </div>
  );
}

function PerfilPanel({ usuario, onClose, favoritos, onToggleFavorito, onVerRestaurante }) {
  const nombreActual = usuario.user_metadata?.nombre ?? '';
  const [propuestas, setPropuestas] = useState([]);
  const [restaurantesFav, setRestaurantesFav] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState(nombreActual);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState('');
  const [passwordLinkEnviado, setPasswordLinkEnviado] = useState(false);
  const [enviandoLink, setEnviandoLink] = useState(false);

  useEffect(() => {
    async function cargar() {
      const [{ data: props }, { data: favs }] = await Promise.all([
        supabase.from('propuestas').select('*').eq('user_id', usuario.id).order('created_at', { ascending: false }),
        supabase.from('favoritos').select('restaurantes(*)').eq('user_id', usuario.id),
      ]);
      setPropuestas(props ?? []);
      setRestaurantesFav(favs ? favs.map(f => ({
        id: f.restaurantes.id,
        nombre: f.restaurantes.nombre,
        emoji: f.restaurantes.emoji,
        tipo: f.restaurantes.tipo,
        valoracion: f.restaurantes.valoracion,
        numValoraciones: f.restaurantes.num_valoraciones,
        ciudad: f.restaurantes.ciudad,
        barrio: f.restaurantes.barrio,
        precio: f.restaurantes.precio,
        fotoUrl: f.restaurantes.foto_url,
        precioMedio: f.restaurantes.precio_medio,
      })) : []);
      setCargando(false);
    }
    cargar();
  }, [usuario.id]);

  async function guardarPerfil() {
    if (!nuevoNombre.trim()) { setErrorPerfil('El nombre no puede estar vacío.'); return; }
    setGuardandoPerfil(true);
    setErrorPerfil('');
    const { error } = await supabase.auth.updateUser({ data: { nombre: nuevoNombre.trim() } });
    if (error) {
      setErrorPerfil('No se pudo guardar. Inténtalo de nuevo.');
    } else {
      setEditandoPerfil(false);
    }
    setGuardandoPerfil(false);
  }

  async function enviarLinkPassword() {
    setEnviandoLink(true);
    await supabase.auth.resetPasswordForEmail(usuario.email, { redirectTo: window.location.origin });
    setPasswordLinkEnviado(true);
    setEnviandoLink(false);
  }

  return (
    <div className="panel-fullscreen">
      <div className="panel-fullscreen__inner">

        <div className="panel-fullscreen__header">
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827' }}>Mi perfil</h1>
          <button className="btn btn--outline" onClick={onClose}>← Volver</button>
        </div>

        {/* Tarjeta de perfil */}
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <Avatar nombre={nombreActual} email={usuario.email} size={60} />
            <div>
              <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827' }}>{nombreActual || usuario.email.split('@')[0]}</p>
              <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: 2 }}>{usuario.email}</p>
            </div>
          </div>

          {!editandoPerfil ? (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn--outline" style={{ fontSize: '0.85rem', padding: '8px 16px' }} onClick={() => { setEditandoPerfil(true); setNuevoNombre(nombreActual); setErrorPerfil(''); }}>
                Editar nombre
              </button>
              {!passwordLinkEnviado ? (
                <button className="btn btn--outline" style={{ fontSize: '0.85rem', padding: '8px 16px' }} onClick={enviarLinkPassword} disabled={enviandoLink}>
                  {enviandoLink ? 'Enviando…' : 'Cambiar contraseña'}
                </button>
              ) : (
                <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Link enviado a tu email
                </span>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                style={inputStyle}
                value={nuevoNombre}
                onChange={e => setNuevoNombre(e.target.value)}
                placeholder="Tu nombre"
                autoFocus
              />
              {errorPerfil && <p style={{ fontSize: '0.85rem', color: '#ef4444' }}>{errorPerfil}</p>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn--primary" style={{ fontSize: '0.85rem', padding: '8px 18px' }} onClick={guardarPerfil} disabled={guardandoPerfil}>
                  {guardandoPerfil ? 'Guardando…' : 'Guardar'}
                </button>
                <button className="btn btn--outline" style={{ fontSize: '0.85rem', padding: '8px 16px' }} onClick={() => setEditandoPerfil(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Favoritos */}
        {restaurantesFav.length > 0 && (
          <>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: 16 }}>Mis favoritos</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 40 }}>
              {restaurantesFav.map(r => (
                <RestaurantCard
                  key={r.id}
                  restaurante={r}
                  esFavorito={favoritos.includes(r.id)}
                  onToggleFavorito={() => onToggleFavorito(r.id)}
                  onClick={() => onVerRestaurante(r)}
                />
              ))}
            </div>
          </>
        )}

        {/* Propuestas */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: 16 }}>Mis propuestas</h2>
        {cargando ? (
          <p style={{ color: '#6b7280' }}>Cargando…</p>
        ) : propuestas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#6b7280' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto 12px' }}>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
            <p>Todavía no has propuesto ningún sitio.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {propuestas.map(p => {
              const estado = estadoConfig[p.estado] ?? estadoConfig.pendiente;
              return (
                <div key={p.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontWeight: 700, color: '#111827' }}>{p.nombre}</span>
                    <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                      {[p.barrio, p.ciudad, p.tipo].filter(Boolean).join(' · ')}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                      {new Date(p.created_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: estado.color, background: estado.bg, padding: '4px 12px', borderRadius: 999, whiteSpace: 'nowrap' }}>
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
