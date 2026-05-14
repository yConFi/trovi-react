import { useState, useEffect } from 'react';
import Header from './Header';
import RestaurantCard from './RestaurantCard';
import PrecioDropdown from './PrecioDropdown';
import AuthModal from './AuthModal';
import PropuestaModal from './PropuestaModal';
import AdminPanel from './AdminPanel';
import ValoracionEstrellas from './ValoracionEstrellas';
import OrdenDropdown from './OrdenDropdown';
import EditarRestauranteModal from './EditarRestauranteModal';
import PerfilPanel from './PerfilPanel';
import { supabase } from './supabase';

const CHIPS = ["Todo", "Restaurantes", "Cafeterías", "Bares", "Japonesa", "Italiana", "Mediterránea", "Tapas", "Brunch"];

function App() {
  const [restaurantes, setRestaurantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [modalAuthAbierto, setModalAuthAbierto] = useState(false);
  const [modalPropuestaAbierto, setModalPropuestaAbierto] = useState(false);
  const [adminAbierto, setAdminAbierto] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [favoritos, setFavoritos] = useState([]);
  const [miValoracion, setMiValoracion] = useState(null);

  const esAdmin = usuario?.email === 'rickybejarano@hotmail.com';
  const [ciudad, setCiudad] = useState("");
  const [tipo, setTipo] = useState("");
  const [ciudadDebounced, setCiudadDebounced] = useState("");
  const [tipoDebounced, setTipoDebounced] = useState("");
  const [precio, setPrecio] = useState("");
  const [chipActivo, setChipActivo] = useState("Todo");
  const [restauranteActivo, setRestauranteActivo] = useState(null);
  const [editandoRestaurante, setEditandoRestaurante] = useState(false);
  const [orden, setOrden] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setCiudadDebounced(ciudad), 300);
    return () => clearTimeout(t);
  }, [ciudad]);

  useEffect(() => {
    const t = setTimeout(() => setTipoDebounced(tipo), 300);
    return () => clearTimeout(t);
  }, [tipo]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUsuario(data.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUsuario(u);
      if (u) cargarFavoritos(u.id);
      else setFavoritos([]);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function cargarFavoritos(userId) {
    const { data } = await supabase.from('favoritos').select('restaurante_id').eq('user_id', userId);
    setFavoritos(data ? data.map(f => f.restaurante_id) : []);
  }

  async function abrirModal(restaurante) {
    setRestauranteActivo(restaurante);
    setMiValoracion(null);
    if (usuario) {
      const { data } = await supabase
        .from('valoraciones')
        .select('puntuacion')
        .eq('user_id', usuario.id)
        .eq('restaurante_id', restaurante.id)
        .single();
      if (data) setMiValoracion(data.puntuacion);
    }
  }

  async function valorar(puntuacion) {
    if (!usuario) { setModalAuthAbierto(true); return; }
    await supabase.from('valoraciones').upsert({
      user_id: usuario.id,
      restaurante_id: restauranteActivo.id,
      puntuacion,
    }, { onConflict: 'user_id,restaurante_id' });
    setMiValoracion(puntuacion);

    const { data } = await supabase
      .from('valoraciones')
      .select('puntuacion')
      .eq('restaurante_id', restauranteActivo.id);

    if (data) {
      const media = (data.reduce((acc, v) => acc + parseFloat(v.puntuacion), 0) / data.length).toFixed(1);
      const count = data.length;
      await supabase.from('restaurantes').update({ valoracion: media, num_valoraciones: count }).eq('id', restauranteActivo.id);
      setRestaurantes(prev => prev.map(r => r.id === restauranteActivo.id ? { ...r, valoracion: media, numValoraciones: count } : r));
      setRestauranteActivo(prev => ({ ...prev, valoracion: media, numValoraciones: count }));
    }
  }

  async function toggleFavorito(restauranteId) {
    if (!usuario) { setModalAuthAbierto(true); return; }
    if (favoritos.includes(restauranteId)) {
      await supabase.from('favoritos').delete().eq('user_id', usuario.id).eq('restaurante_id', restauranteId);
      setFavoritos(prev => prev.filter(id => id !== restauranteId));
    } else {
      await supabase.from('favoritos').insert({ user_id: usuario.id, restaurante_id: restauranteId });
      setFavoritos(prev => [...prev, restauranteId]);
    }
  }

  useEffect(() => {
    async function cargarRestaurantes() {
      const { data, error } = await supabase.from('restaurantes').select('*');
      if (error) {
        console.error('Error cargando restaurantes:', error);
      } else {
        const mapeados = data.map(r => ({
          id: r.id,
          nombre: r.nombre,
          emoji: r.emoji,
          tipo: Array.isArray(r.tipo) ? r.tipo : (r.tipo ?? '').split(',').map(t => t.trim()).filter(Boolean),
          valoracion: r.valoracion,
          numValoraciones: r.num_valoraciones,
          ciudad: r.ciudad,
          barrio: r.barrio,
          direccion: r.direccion,
          horario: r.horario,
          descripcion: r.descripcion,
          porQueIr: r.por_que_ir,
          precioMedio: r.precio_medio,
          precio: r.precio,
          fotoUrl: r.foto_url,
          creadoEn: r.created_at,
        }));
        setRestaurantes(mapeados);
      }
      setCargando(false);
    }
    cargarRestaurantes();
  }, []);

  const filtrados = restaurantes.filter(r => {
    const coincideCiudad = ciudadDebounced === "" || r.ciudad.toLowerCase().includes(ciudadDebounced.toLowerCase()) || r.barrio.toLowerCase().includes(ciudadDebounced.toLowerCase());
    const coincideTipo = tipoDebounced === "" || r.tipo.some(t => t.toLowerCase().includes(tipoDebounced.toLowerCase()));
    const coincidePrecio = precio === "" || r.precioMedio <= parseInt(precio);
    const coincideChip = chipActivo === "Todo" || r.tipo.includes(chipActivo);
    return coincideCiudad && coincideTipo && coincidePrecio && coincideChip;
  }).sort((a, b) => {
    if (orden === "valoracion") return (parseFloat(b.valoracion) || 0) - (parseFloat(a.valoracion) || 0);
    if (orden === "nuevos") return new Date(b.creadoEn) - new Date(a.creadoEn);
    return 0;
  });

  function limpiar() {
    setCiudad("");
    setTipo("");
    setCiudadDebounced("");
    setTipoDebounced("");
    setPrecio("");
    setChipActivo("Todo");
    setOrden("");
  }

  const hayFiltros = ciudad !== "" || tipo !== "" || precio !== "" || chipActivo !== "Todo";

  return (
    <div>
      <Header
        usuario={usuario}
        esAdmin={esAdmin}
        onLoginClick={() => setModalAuthAbierto(true)}
        onLogout={() => supabase.auth.signOut()}
        onProponer={() => usuario ? setModalPropuestaAbierto(true) : setModalAuthAbierto(true)}
        onAdmin={() => setAdminAbierto(true)}
        onPerfil={() => setPerfilAbierto(true)}
      />

      <section className="hero">
        <div className="container hero__inner">
          <h1 className="hero__title">Descubre dónde comer,<br />sin saber qué buscar.</h1>
          <p className="hero__subtitle">Pon tus filtros. Trovi hace el resto.</p>
          <div className="search-bar">
            <div className="search-bar__field">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
              <input
                type="text"
                placeholder="Ciudad o zona"
                value={ciudad}
                onChange={e => setCiudad(e.target.value)}
              />
            </div>
            <div className="search-bar__divider"></div>
            <div className="search-bar__field">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
                <path d="M7 2v20"/>
                <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
              </svg>
              <input
                type="text"
                placeholder="Tipo de comida"
                value={tipo}
                onChange={e => setTipo(e.target.value)}
              />
            </div>
            <div className="search-bar__divider"></div>
            <div className="search-bar__field">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M17 6.5A7 7 0 1 0 17 17.5"/>
                <path d="M4 10h10"/>
                <path d="M4 14h10"/>
              </svg>
              <PrecioDropdown value={precio} onChange={setPrecio} />
            </div>
            <button className="btn btn--primary search-bar__btn" onClick={() => document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth' })}>Buscar</button>
          </div>
        </div>
      </section>

      <section className="filters">
        <div className="container filters__inner">
          {CHIPS.map(chip => (
            <button
              key={chip}
              className={`filter-chip${chipActivo === chip ? ' filter-chip--active' : ''}`}
              onClick={() => setChipActivo(chip)}
            >
              {chip}
            </button>
          ))}
          {hayFiltros && (
            <button
              onClick={limpiar}
              className="filter-chip"
              style={{ color: '#ef4444', borderColor: '#fca5a5' }}
            >
              ✕ Limpiar
            </button>
          )}
        </div>
      </section>

      <main id="resultados" className="container results">
        {filtrados.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              <span style={{ fontWeight: 600, color: '#111827' }}>{filtrados.length}</span> {filtrados.length === 1 ? 'sitio encontrado' : 'sitios encontrados'}
            </p>
            <OrdenDropdown value={orden} onChange={setOrden} />
          </div>
        )}
        {cargando ? (
          <div className="empty-state">
            <svg className="empty-state__icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ff5c3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <h3>Cargando restaurantes…</h3>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state__icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
              <path d="M7 2v20"/>
              <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
            </svg>
            <h3>Sin resultados</h3>
            <p>No hemos encontrado sitios con esos filtros. Prueba a cambiar la ciudad o el tipo de comida.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {filtrados.map((r, i) => (
              <RestaurantCard
                key={i}
                restaurante={r}
                esFavorito={favoritos.includes(r.id)}
                onToggleFavorito={() => toggleFavorito(r.id)}
                onClick={() => abrirModal(r)}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <span className="logo">Trovi</span>
          <span>© {new Date().getFullYear()} Trovi · Hecho con ♥ en España</span>
          <div style={{ display: 'flex', gap: 20 }}>
            <a href="#" style={{ color: '#9ca3af' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='#9ca3af'}>Explorar</a>
            <a href="#" style={{ color: '#9ca3af' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='#9ca3af'} onClick={e => { e.preventDefault(); usuario ? setModalPropuestaAbierto(true) : setModalAuthAbierto(true); }}>Proponer sitio</a>
          </div>
        </div>
      </footer>

      {adminAbierto && (
        <AdminPanel
          onClose={() => setAdminAbierto(false)}
          onPublicado={async () => {
            const { data } = await supabase.from('restaurantes').select('*');
            if (data) setRestaurantes(data.map(r => ({
              id: r.id, nombre: r.nombre, emoji: r.emoji,
              tipo: Array.isArray(r.tipo) ? r.tipo : (r.tipo ?? '').split(',').map(t => t.trim()).filter(Boolean),
              valoracion: r.valoracion, numValoraciones: r.num_valoraciones,
              ciudad: r.ciudad, barrio: r.barrio, direccion: r.direccion,
              horario: r.horario, descripcion: r.descripcion,
              porQueIr: r.por_que_ir, precioMedio: r.precio_medio,
              precio: r.precio, fotoUrl: r.foto_url, creadoEn: r.created_at,
            })));
          }}
        />
      )}

      {perfilAbierto && (
        <PerfilPanel
          usuario={usuario}
          onClose={() => setPerfilAbierto(false)}
          favoritos={favoritos}
          onToggleFavorito={toggleFavorito}
          onVerRestaurante={r => abrirModal(r)}
        />
      )}

      {modalPropuestaAbierto && (
        <PropuestaModal
          usuario={usuario}
          onClose={() => setModalPropuestaAbierto(false)}
        />
      )}

      {modalAuthAbierto && (
        <AuthModal
          onClose={() => setModalAuthAbierto(false)}
          onAuth={setUsuario}
        />
      )}

      {restauranteActivo && (
        <div className="modal-overlay modal-overlay--open" onClick={e => e.target === e.currentTarget && setRestauranteActivo(null)}>
          <div className="modal">
            <button className="modal__close" onClick={() => setRestauranteActivo(null)}>✕</button>
            {esAdmin && (
              <button
                onClick={() => setEditandoRestaurante(true)}
                style={{
                  position: 'absolute', top: 16, right: 96, zIndex: 1,
                  background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '50%',
                  width: 32, height: 32, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            )}
            <button
              onClick={() => toggleFavorito(restauranteActivo.id)}
              style={{
                position: 'absolute', top: 16, right: 56, zIndex: 1,
                background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '50%',
                width: 32, height: 32, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={favoritos.includes(restauranteActivo.id) ? '#ff5c3a' : 'none'} stroke={favoritos.includes(restauranteActivo.id) ? '#ff5c3a' : '#4b5563'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
            <div className="modal__image">
              {restauranteActivo.fotoUrl
                ? <img src={restauranteActivo.fotoUrl} alt={restauranteActivo.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px 20px 0 0' }} />
                : restauranteActivo.emoji}
            </div>
            <div className="modal__body">
              <div className="modal__tags">
                {restauranteActivo.tipo.map(t => <span key={t} className="card__tag">{t}</span>)}
              </div>
              <h2 className="modal__nombre">{restauranteActivo.nombre}</h2>
              <p className="modal__rating">
                {restauranteActivo.numValoraciones > 0
                  ? `★ ${restauranteActivo.valoracion} · ${restauranteActivo.numValoraciones} valoraciones · `
                  : '✨ Nuevo · '}
                {restauranteActivo.barrio ? `${restauranteActivo.barrio}, ` : ''}{restauranteActivo.ciudad}
              </p>
              <p className="modal__gancho">"{restauranteActivo.porQueIr}"</p>
              <p className="modal__descripcion">{restauranteActivo.descripcion}</p>
              <div className="modal__info">
                <div className="modal__info-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                  <span>{restauranteActivo.direccion}</span>
                </div>
                <div className="modal__info-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>{restauranteActivo.horario}</span>
                </div>
                <div className="modal__info-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M17 6.5A7 7 0 1 0 17 17.5"/><path d="M4 10h10"/><path d="M4 14h10"/></svg>
                  <span>{restauranteActivo.precioMedio}€ p.p.</span>
                </div>
                <div className="modal__info-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restauranteActivo.nombre} ${restauranteActivo.direccion || restauranteActivo.ciudad}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#ff5c3a', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    Ver en Google Maps
                  </a>
                </div>
              </div>

              <ValoracionEstrellas
                miValoracion={miValoracion}
                onValorar={valorar}
              />
            </div>
          </div>
        </div>
      )}
      {editandoRestaurante && restauranteActivo && (
        <EditarRestauranteModal
          restaurante={restauranteActivo}
          onCerrar={() => setEditandoRestaurante(false)}
          onGuardar={actualizado => {
            setRestaurantes(prev => prev.map(r => r.id === actualizado.id ? actualizado : r));
            setRestauranteActivo(actualizado);
            setEditandoRestaurante(false);
          }}
          onEliminar={async id => {
            await supabase.from('restaurantes').delete().eq('id', id);
            setRestaurantes(prev => prev.filter(r => r.id !== id));
            setRestauranteActivo(null);
            setEditandoRestaurante(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
