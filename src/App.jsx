import { useState, useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Header from './Header';
import RestaurantCard from './RestaurantCard';
import PrecioDropdown from './PrecioDropdown';
import AuthModal from './AuthModal';
import PropuestaModal from './PropuestaModal';
import AdminPanel from './AdminPanel';
import OrdenDropdown from './OrdenDropdown';
import EditarRestauranteModal from './EditarRestauranteModal';
import PerfilPanel from './PerfilPanel';
import RestauranteModal from './RestauranteModal';
import { supabase } from './supabase';
import { useSwipeClose } from './useSwipeClose';
import { mapearRestaurante, normalizar } from './utils';

function App() {
  const ridInicial = useRef(
    new URLSearchParams(window.location.search).get('r') ||
    (window.location.pathname.startsWith('/r/') ? window.location.pathname.slice(3) : null)
  );

  const [restaurantes, setRestaurantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [modalAuthAbierto, setModalAuthAbierto] = useState(false);
  const [modalPropuestaAbierto, setModalPropuestaAbierto] = useState(false);
  const [adminAbierto, setAdminAbierto] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [favoritos, setFavoritos] = useState([]);
  const [visitados, setVisitados] = useState([]);
  const [ocultarVisitados, setOcultarVisitados] = useState(false);
  const [miValoracion, setMiValoracion] = useState(null);

  const esAdmin = usuario?.email === 'rickybejarano@hotmail.com';
  const [ciudad, setCiudad] = useState("");
  const [tipo, setTipo] = useState("");
  const [ciudadDebounced, setCiudadDebounced] = useState("");
  const [tipoDebounced, setTipoDebounced] = useState("");
  const [precio, setPrecio] = useState("");
  const [chipsActivos, setChipsActivos] = useState([]);
  const [barrioActivo, setBarrioActivo] = useState("");
  const [restauranteActivo, setRestauranteActivo] = useState(null);
  const [editandoRestaurante, setEditandoRestaurante] = useState(false);
  const [orden, setOrden] = useState("");
  const [comoFuncionaAbierto, setComoFuncionaAbierto] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [destacadosExpandido, setDestacadosExpandido] = useState(true);
  const [mostrados, setMostrados] = useState(24);

  const comoFuncionaSwipe = useSwipeClose(() => setComoFuncionaAbierto(false));
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);

  const didDrag = useRef(false);

  function onScrollMouseDown(e) {
    e.preventDefault();
    isDragging.current = true;
    didDrag.current = false;
    dragStartX.current = e.pageX;
    scrollStartX.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = 'grabbing';
    scrollRef.current.style.userSelect = 'none';
  }

  function onScrollMouseMove(e) {
    if (!isDragging.current) return;
    const dx = e.pageX - dragStartX.current;
    if (Math.abs(dx) > 5) didDrag.current = true;
    scrollRef.current.scrollLeft = scrollStartX.current - dx;
  }

  function onScrollMouseUp() {
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
      scrollRef.current.style.userSelect = '';
    }
  }

  function onScrollClick(e) {
    if (didDrag.current) e.stopPropagation();
  }

  useEffect(() => {
    const anyOpen = !!(restauranteActivo || comoFuncionaAbierto || editandoRestaurante || adminAbierto || perfilAbierto || modalPropuestaAbierto || modalAuthAbierto);
    document.body.style.overflow = anyOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [restauranteActivo, comoFuncionaAbierto, editandoRestaurante, adminAbierto, perfilAbierto, modalPropuestaAbierto, modalAuthAbierto]);

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
      if (u) { cargarFavoritos(u.id); cargarVisitados(u.id); }
      else { setFavoritos([]); setVisitados([]); }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function cargarFavoritos(userId) {
    const { data } = await supabase.from('favoritos').select('restaurante_id').eq('user_id', userId);
    setFavoritos(data ? data.map(f => f.restaurante_id) : []);
  }

  async function cargarVisitados(userId) {
    const { data } = await supabase.from('visitados').select('restaurante_id').eq('user_id', userId);
    setVisitados(data ? data.map(v => v.restaurante_id) : []);
  }

  async function toggleVisitado(restauranteId) {
    if (!usuario) { setModalAuthAbierto(true); return; }
    if (visitados.includes(restauranteId)) {
      await supabase.from('visitados').delete().eq('user_id', usuario.id).eq('restaurante_id', restauranteId);
      setVisitados(prev => prev.filter(id => id !== restauranteId));
    } else {
      await supabase.from('visitados').insert({ user_id: usuario.id, restaurante_id: restauranteId });
      setVisitados(prev => [...prev, restauranteId]);
    }
  }

  async function abrirModal(restaurante) {
    setRestauranteActivo(restaurante);
    setMiValoracion(null);
    setLinkCopiado(false);
    window.history.replaceState(null, '', `/r/${restaurante.id}`);
    if (usuario) {
      const { data } = await supabase
        .from('valoraciones')
        .select('puntuacion')
        .eq('user_id', usuario.id)
        .eq('restaurante_id', restaurante.id)
        .maybeSingle();
      if (data) setMiValoracion(data.puntuacion);
    }
  }

  function cerrarModal() {
    setRestauranteActivo(null);
    window.history.replaceState(null, '', '/');
  }

  async function compartir() {
    const url = `${window.location.origin}/r/${restauranteActivo.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: restauranteActivo.nombre,
          text: restauranteActivo.porQueIr ?? `Descubre ${restauranteActivo.nombre} en Trovi`,
          url,
        });
      } catch (_) {}
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setLinkCopiado(true);
        setTimeout(() => setLinkCopiado(false), 2500);
      });
    }
  }

  async function valorar(puntuacion) {
    if (!usuario) { setModalAuthAbierto(true); return false; }
    const { error } = await supabase.from('valoraciones').upsert({
      user_id: usuario.id,
      restaurante_id: restauranteActivo.id,
      puntuacion,
    }, { onConflict: 'user_id,restaurante_id' });
    if (error) return false;
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
    return true;
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
      const { data, error } = await supabase.from('restaurantes').select('*').order('created_at', { ascending: false }).limit(200);
      if (error) {
        console.error('Error cargando restaurantes:', error);
      } else {
        const mapeados = data.map(mapearRestaurante);
        setRestaurantes(mapeados);

        if (ridInicial.current) {
          const r = mapeados.find(r => String(r.id) === ridInicial.current);
          if (r) setRestauranteActivo(r);
          ridInicial.current = null;
        }
      }
      setCargando(false);
    }
    cargarRestaurantes();
  }, []);

  const chips = [...new Set(restaurantes.flatMap(r => r.tipo))].sort();

  const filtradosSinBarrio = restaurantes.filter(r => {
    const q = normalizar(ciudadDebounced);
    const coincideCiudad = q === "" || normalizar(r.ciudad).includes(q) || normalizar(r.barrio).includes(q) || normalizar(r.nombre).includes(q);
    const coincideTipo = tipoDebounced === "" || r.tipo.some(t => normalizar(t).includes(normalizar(tipoDebounced)));
    const coincidePrecio = precio === "" || r.precioMedio <= parseInt(precio);
    const coincideChip = chipsActivos.length === 0 || chipsActivos.some(chip => r.tipo.includes(chip));
    return coincideCiudad && coincideTipo && coincidePrecio && coincideChip;
  });

  const barriosDisponibles = [...new Set(
    filtradosSinBarrio.map(r => r.barrio).filter(Boolean)
  )].sort();

  const filtrados = (barrioActivo
    ? filtradosSinBarrio.filter(r => r.barrio === barrioActivo)
    : filtradosSinBarrio
  ).filter(r => !ocultarVisitados || !visitados.includes(r.id))
  .sort((a, b) => {
    if (orden === "valoracion") return (parseFloat(b.valoracion) || 0) - (parseFloat(a.valoracion) || 0);
    if (orden === "precio") return (a.precioMedio || 0) - (b.precioMedio || 0);
    if (orden === "precio-desc") return (b.precioMedio || 0) - (a.precioMedio || 0);
    return 0;
  });

  useEffect(() => {
    setMostrados(24);
  }, [ciudadDebounced, tipoDebounced, precio, chipsActivos, barrioActivo, orden, ocultarVisitados]);

  function sorprendeme() {
    if (filtrados.length === 0) return;
    const r = filtrados[Math.floor(Math.random() * filtrados.length)];
    abrirModal(r);
  }

  function limpiar() {
    setCiudad("");
    setTipo("");
    setCiudadDebounced("");
    setTipoDebounced("");
    setPrecio("");
    setChipsActivos([]);
    setOrden("");
    setBarrioActivo("");
    setMostrados(24);
  }

  const hayFiltros = ciudad !== "" || tipo !== "" || precio !== "" || chipsActivos.length > 0 || barrioActivo !== "";

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
        onExplorar={() => document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth' })}
        onComoFunciona={() => setComoFuncionaAbierto(true)}
      />

      <section className="hero">
        <div className="container hero__inner">
          <h1 className="hero__title">Descubre dónde comer,<br />sin saber qué buscar.</h1>
          <p className="hero__subtitle">Pon tus filtros y descubre sitios que no conocías.</p>
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
            <button className="btn btn--primary search-bar__btn" onClick={() => document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth' })}>Ver sitios</button>
          </div>
        </div>
      </section>

      <section className="filters">
        <div className="container filters__inner">
          {chips.map(chip => (
            <button
              key={chip}
              className={`filter-chip${chipsActivos.includes(chip) ? ' filter-chip--active' : ''}`}
              onClick={() => setChipsActivos(prev =>
                prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
              )}
            >
              {chip}
            </button>
          ))}
          {usuario && visitados.length > 0 && (
            <button
              className={`filter-chip${ocultarVisitados ? ' filter-chip--active' : ''}`}
              onClick={() => setOcultarVisitados(v => !v)}
            >
              Ocultar visitados ({visitados.length})
            </button>
          )}
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

      {ciudadDebounced !== "" && barriosDisponibles.length >= 1 && (
        <section className="filters filters--barrios">
          <div className="container filters__inner">
            {barriosDisponibles.map(barrio => (
              <button
                key={barrio}
                className={`filter-chip filter-chip--barrio${barrioActivo === barrio ? ' filter-chip--active' : ''}`}
                onClick={() => setBarrioActivo(barrioActivo === barrio ? '' : barrio)}
              >
                {barrio}
              </button>
            ))}
          </div>
        </section>
      )}

      {restaurantes.length > 0 && (
        <section className="destacados">
          <div className="container">
            <button
              className="destacados__header"
              onClick={() => setDestacadosExpandido(v => !v)}
            >
              <h2 className="destacados__titulo">
                <span className="destacados__pulse" />
                Recién añadidos
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: destacadosExpandido ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}
                >
                  <polyline points="18 15 12 9 6 15"/>
                </svg>
              </h2>
            </button>
            <p className="destacados__subtitulo">Los últimos sitios en llegar a Trovi</p>
          </div>
          {destacadosExpandido && (
            <div className="destacados__scroll-wrap">
              <div
              className="destacados__scroll"
              ref={scrollRef}
              style={{ cursor: 'grab' }}
              onMouseDown={onScrollMouseDown}
              onMouseMove={onScrollMouseMove}
              onMouseUp={onScrollMouseUp}
              onMouseLeave={onScrollMouseUp}
              onClickCapture={onScrollClick}
            >
                {[...restaurantes]
                  .sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn))
                  .slice(0, 8)
                  .map(r => (
                  <div key={r.id} className="destacados__card">
                    <RestaurantCard
                      restaurante={r}
                      esFavorito={favoritos.includes(r.id)}
                      esVisitado={visitados.includes(r.id)}
                      onToggleFavorito={() => toggleFavorito(r.id)}
                      onClick={() => abrirModal(r)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <main id="resultados" className="container results">
        {filtrados.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                <span style={{ fontWeight: 600, color: '#111827' }}>{filtrados.length}</span> {filtrados.length === 1 ? 'sitio encontrado' : 'sitios encontrados'}
              </p>
              {filtrados.length > 1 && (
                <button
                  onClick={sorprendeme}
                  className="btn btn--outline"
                  style={{ fontSize: '0.8rem', padding: '5px 12px', whiteSpace: 'nowrap' }}
                >
                  Sorpréndeme
                </button>
              )}
            </div>
            <OrdenDropdown value={orden} onChange={setOrden} />
          </div>
        )}
        {cargando ? (
          <div className="cards-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-skeleton">
                <div className="card-skeleton__image" />
                <div className="card-skeleton__body">
                  <div className="card-skeleton__line card-skeleton__line--short" />
                  <div className="card-skeleton__line card-skeleton__line--xshort" />
                  <div className="card-skeleton__line" />
                </div>
              </div>
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state__icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            {hayFiltros ? (
              <>
                <h3>Sin resultados</h3>
                <p>No hay sitios con esos filtros. Prueba con otra ciudad o tipo de cocina.</p>
                <button className="btn btn--outline" onClick={limpiar}>Limpiar filtros</button>
              </>
            ) : (
              <>
                <h3>Aún no hay sitios por aquí</h3>
                <p>Sé el primero en proponer un restaurante para esta zona.</p>
                <button className="btn btn--primary" onClick={() => usuario ? setModalPropuestaAbierto(true) : setModalAuthAbierto(true)}>+ Proponer sitio</button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="cards-grid">
              {filtrados.slice(0, mostrados).map(r => (
                <RestaurantCard
                  key={r.id}
                  restaurante={r}
                  esFavorito={favoritos.includes(r.id)}
                  esVisitado={visitados.includes(r.id)}
                  onToggleFavorito={() => toggleFavorito(r.id)}
                  onClick={() => abrirModal(r)}
                />
              ))}
            </div>
            {filtrados.length > mostrados && (
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <button className="btn btn--outline" onClick={() => setMostrados(m => m + 24)}>
                  Mostrar {Math.min(24, filtrados.length - mostrados)} más
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <span className="logo">Trovi</span>
          <span>© {new Date().getFullYear()} Trovi · Hecho con ♥ en España</span>
          <div style={{ display: 'flex', gap: 20 }}>
            <button className="footer__link" onClick={() => document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth' })}>Explorar</button>
            <button className="footer__link" onClick={() => usuario ? setModalPropuestaAbierto(true) : setModalAuthAbierto(true)}>Proponer sitio</button>
          </div>
        </div>
      </footer>

      {adminAbierto && (
        <AdminPanel
          onClose={() => setAdminAbierto(false)}
          onPublicado={async () => {
            const { data } = await supabase.from('restaurantes').select('*');
            if (data) setRestaurantes(data.map(mapearRestaurante));
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

      {restauranteActivo && (
        <RestauranteModal
          restaurante={restauranteActivo}
          favoritos={favoritos}
          visitados={visitados}
          usuario={usuario}
          esAdmin={esAdmin}
          miValoracion={miValoracion}
          linkCopiado={linkCopiado}
          onCerrar={cerrarModal}
          onCompartir={compartir}
          onValorar={valorar}
          onToggleFavorito={toggleFavorito}
          onToggleVisitado={toggleVisitado}
          onEditar={() => setEditandoRestaurante(true)}
          onLoginClick={() => setModalAuthAbierto(true)}
        />
      )}
      {comoFuncionaAbierto && (
        <div className="modal-overlay modal-overlay--open" onClick={e => e.target === e.currentTarget && setComoFuncionaAbierto(false)}>
          <div className="modal" style={{ maxWidth: 480 }} ref={comoFuncionaSwipe.ref} onTouchStart={comoFuncionaSwipe.onTouchStart} onTouchMove={comoFuncionaSwipe.onTouchMove} onTouchEnd={comoFuncionaSwipe.onTouchEnd}>
            <button className="modal__close" onClick={() => setComoFuncionaAbierto(false)}>✕</button>
            <div className="modal__body" style={{ paddingTop: 36 }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', marginBottom: 8 }}>¿Cómo funciona Trovi?</h2>
              <p style={{ fontSize: '0.95rem', color: '#6b7280', marginBottom: 28 }}>Descubrir dónde comer nunca había sido tan fácil.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {[
                  {
                    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff5c3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
                    titulo: 'Pon tus filtros',
                    texto: 'Ciudad, tipo de cocina y precio máximo. Combínalos como quieras.',
                  },
                  {
                    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff5c3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>,
                    titulo: 'Descubre sitios',
                    texto: 'Ve restaurantes, bares y cafeterías seleccionados a mano para ti.',
                  },
                  {
                    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff5c3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
                    titulo: 'Guarda tus favoritos',
                    texto: 'Crea tu lista personal y tenla siempre a mano.',
                  },
                ].map(({ icon, titulo, texto }) => (
                  <div key={titulo} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff7f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {icon}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827', marginBottom: 4 }}>{titulo}</p>
                      <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.5 }}>{texto}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn--primary" style={{ width: '100%', marginTop: 28, padding: '12px' }} onClick={() => { setComoFuncionaAbierto(false); document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth' }); }}>
                Explorar sitios
              </button>
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

      {modalAuthAbierto && (
        <AuthModal
          onClose={() => setModalAuthAbierto(false)}
          onAuth={setUsuario}
        />
      )}
      <Analytics />
    </div>
  );
}

export default App;
