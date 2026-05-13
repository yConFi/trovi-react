import { useState, useEffect } from 'react';
import Header from './Header';
import RestaurantCard from './RestaurantCard';
import PrecioDropdown from './PrecioDropdown';
import AuthModal from './AuthModal';
import PropuestaModal from './PropuestaModal';
import AdminPanel from './AdminPanel';
import { supabase } from './supabase';

const CHIPS = ["Todo", "Restaurantes", "Cafeterías", "Bares", "Japonesa", "Italiana", "Mediterránea", "Tapas", "Brunch"];

function App() {
  const [restaurantes, setRestaurantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [modalAuthAbierto, setModalAuthAbierto] = useState(false);
  const [modalPropuestaAbierto, setModalPropuestaAbierto] = useState(false);
  const [adminAbierto, setAdminAbierto] = useState(false);

  const esAdmin = usuario?.email === 'rickybejarano@hotmail.com';
  const [ciudad, setCiudad] = useState("");
  const [tipo, setTipo] = useState("");
  const [precio, setPrecio] = useState("");
  const [chipActivo, setChipActivo] = useState("Todo");
  const [hasBuscado, setHasBuscado] = useState(false);
  const [restauranteActivo, setRestauranteActivo] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUsuario(data.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function cargarRestaurantes() {
      const { data, error } = await supabase.from('restaurantes').select('*');
      if (error) {
        console.error('Error cargando restaurantes:', error);
      } else {
        const mapeados = data.map(r => ({
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
        }));
        setRestaurantes(mapeados);
      }
      setCargando(false);
    }
    cargarRestaurantes();
  }, []);

  const filtrados = restaurantes.filter(r => {
    const coincideCiudad = ciudad === "" || r.ciudad.toLowerCase().includes(ciudad.toLowerCase()) || r.barrio.toLowerCase().includes(ciudad.toLowerCase());
    const coincideTipo = tipo === "" || r.tipo.some(t => t.toLowerCase().includes(tipo.toLowerCase()));
    const coincidePrecio = precio === "" || r.precio <= parseInt(precio);
    const coincideChip = chipActivo === "Todo" || r.tipo.includes(chipActivo);
    return coincideCiudad && coincideTipo && coincidePrecio && coincideChip;
  });

  function buscar() {
    setHasBuscado(true);
  }

  return (
    <div>
      <Header
        usuario={usuario}
        esAdmin={esAdmin}
        onLoginClick={() => setModalAuthAbierto(true)}
        onLogout={() => supabase.auth.signOut()}
        onProponer={() => usuario ? setModalPropuestaAbierto(true) : setModalAuthAbierto(true)}
        onAdmin={() => setAdminAbierto(true)}
      />

      <section className="hero">
        <div className="container hero__inner">
          <h1 className="hero__title">Descubre dónde comer,<br />sin saber qué buscar.</h1>
          <p className="hero__subtitle">Pon tus filtros y Trovi te muestra los mejores sitios que aún no conoces.</p>
          <div className="search-bar">
            <div className="search-bar__field">
              <span className="search-bar__icon">📍</span>
              <input
                type="text"
                placeholder="Ciudad o zona"
                value={ciudad}
                onChange={e => setCiudad(e.target.value)}
                onKeyDown={e => e.key === "Enter" && buscar()}
              />
            </div>
            <div className="search-bar__divider"></div>
            <div className="search-bar__field">
              <span className="search-bar__icon">🍽️</span>
              <input
                type="text"
                placeholder="Tipo de comida"
                value={tipo}
                onChange={e => setTipo(e.target.value)}
                onKeyDown={e => e.key === "Enter" && buscar()}
              />
            </div>
            <div className="search-bar__divider"></div>
            <div className="search-bar__field">
              <span className="search-bar__icon">💶</span>
              <PrecioDropdown value={precio} onChange={setPrecio} />
            </div>
            <button className="btn btn--primary search-bar__btn" onClick={buscar}>Buscar</button>
          </div>
        </div>
      </section>

      <section className="filters">
        <div className="container filters__inner">
          {CHIPS.map(chip => (
            <button
              key={chip}
              className={`filter-chip${chipActivo === chip ? ' filter-chip--active' : ''}`}
              onClick={() => { setChipActivo(chip); setHasBuscado(true); }}
            >
              {chip}
            </button>
          ))}
        </div>
      </section>

      <main className="container results">
        {cargando ? (
          <div className="empty-state">
            <span className="empty-state__icon">⏳</span>
            <h3>Cargando restaurantes…</h3>
          </div>
        ) : !hasBuscado ? (
          <div className="welcome-state">
            <span className="welcome-state__icon">🗺️</span>
            <h2>¿Dónde comemos hoy?</h2>
            <p>Usa los filtros de arriba para descubrir sitios que no conocías.<br />Ciudad, tipo de comida, precio — tú decides.</p>
            <div className="welcome-state__hints">
              <button className="welcome-hint" onClick={() => setHasBuscado(true)}>📍 Por ciudad</button>
              <button className="welcome-hint" onClick={() => setHasBuscado(true)}>🍽️ Por tipo</button>
              <button className="welcome-hint" onClick={() => setHasBuscado(true)}>💶 Por precio</button>
            </div>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon">🍽️</span>
            <h3>Sin resultados</h3>
            <p>No hemos encontrado sitios con esos filtros. Prueba a cambiar la ciudad o el tipo de comida.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {filtrados.map((r, i) => (
              <RestaurantCard key={i} restaurante={r} onClick={() => setRestauranteActivo(r)} />
            ))}
          </div>
        )}
      </main>

      {adminAbierto && (
        <AdminPanel onClose={() => setAdminAbierto(false)} />
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
              <p className="modal__rating">★ {restauranteActivo.valoracion} · {restauranteActivo.numValoraciones} valoraciones · {restauranteActivo.barrio ? `${restauranteActivo.barrio}, ` : ''}{restauranteActivo.ciudad}</p>
              <p className="modal__gancho">"{restauranteActivo.porQueIr}"</p>
              <p className="modal__descripcion">{restauranteActivo.descripcion}</p>
              <div className="modal__info">
                <div className="modal__info-item"><span>📍</span><span>{restauranteActivo.direccion}</span></div>
                <div className="modal__info-item"><span>🕐</span><span>{restauranteActivo.horario}</span></div>
                <div className="modal__info-item"><span>💶</span><span>Precio medio por persona: {restauranteActivo.precioMedio}€</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
