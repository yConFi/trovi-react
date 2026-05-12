import { useState } from 'react';
import Header from './Header';
import RestaurantCard from './RestaurantCard';

const restaurantes = [
  {
    nombre: "La Pepita",
    emoji: "🥑",
    tipo: ["Brunch", "Cafeterías"],
    valoracion: 4.8,
    numValoraciones: 342,
    ciudad: "Madrid",
    barrio: "Malasaña",
    direccion: "Calle Ballesta, 12",
    horario: "Lun–Vie 9:00–17:00 · Sáb–Dom 10:00–18:00",
    descripcion: "Cafetería de especialidad con brunch todo el día. Carta de temporada con ingredientes de proximidad y el mejor aguacate de Malasaña.",
    porQueIr: "El brunch más instagrameable de Madrid sin colas eternas.",
    precioMedio: 14,
    precio: 2,
  },
  {
    nombre: "Yakitori Taro",
    emoji: "🍱",
    tipo: ["Japonesa", "Restaurantes"],
    valoracion: 4.6,
    numValoraciones: 218,
    ciudad: "Madrid",
    barrio: "Lavapiés",
    direccion: "Calle Argumosa, 7",
    horario: "Mar–Dom 13:30–15:30 · 20:30–23:30",
    descripcion: "Pequeño restaurante japonés de barrio. Especialidad en yakitori a la brasa y ramen casero. Solo 20 plazas.",
    porQueIr: "Yakitori auténtico a precio de barrio. Reserva con antelación.",
    precioMedio: 22,
    precio: 2,
  },
  {
    nombre: "Zezeo",
    emoji: "🍺",
    tipo: ["Tapas", "Bares"],
    valoracion: 4.5,
    numValoraciones: 511,
    ciudad: "Sevilla",
    barrio: "Utrera",
    direccion: "Plaza Mayor, 3",
    horario: "Todos los días 11:00–00:00",
    descripcion: "Bar de toda la vida con las mejores tapas de la zona. Especialidad en pringá, caracoles y montaditos.",
    porQueIr: "Tapa gratis con cada caña. El sitio donde comen los locales.",
    precioMedio: 10,
    precio: 1,
  },
  {
    nombre: "Toto Pizza",
    emoji: "🍕",
    tipo: ["Italiana", "Restaurantes"],
    valoracion: 4.7,
    numValoraciones: 189,
    ciudad: "Barcelona",
    barrio: "Gràcia",
    direccion: "Carrer de Verdi, 24",
    horario: "Mar–Dom 13:00–16:00 · 20:00–23:30",
    descripcion: "Pizzería napolitana con horno de leña importado de Italia. Masa de fermentación lenta de 48 horas y productos DOP.",
    porQueIr: "La pizza napolitana más honesta de Barcelona. Sin artificios.",
    precioMedio: 18,
    precio: 2,
  },
  {
    nombre: "Mar & Brasa",
    emoji: "🦞",
    tipo: ["Mediterránea", "Restaurantes"],
    valoracion: 4.9,
    numValoraciones: 97,
    ciudad: "Valencia",
    barrio: "El Carmen",
    direccion: "Calle dels Cavallers, 5",
    horario: "Mié–Lun 14:00–16:30 · 21:00–23:00",
    descripcion: "Restaurante de cocina mediterránea de mercado. El chef trabaja con pescadores locales y cambia la carta cada semana según la lonja.",
    porQueIr: "El producto más fresco del Mediterráneo a dos pasos del centro histórico.",
    precioMedio: 45,
    precio: 3,
  },
  {
    nombre: "Café Colón",
    emoji: "☕",
    tipo: ["Cafeterías", "Brunch"],
    valoracion: 4.4,
    numValoraciones: 403,
    ciudad: "Madrid",
    barrio: "Retiro",
    direccion: "Calle de O'Donnell, 8",
    horario: "Lun–Dom 8:00–20:00",
    descripcion: "Cafetería clásica madrileña con terraza interior. Conocida por sus churros con chocolate y su tostada con tomate.",
    porQueIr: "El desayuno madrileño de toda la vida, sin prisas y con buena terraza.",
    precioMedio: 8,
    precio: 1,
  },
];

const CHIPS = ["Todo", "Restaurantes", "Cafeterías", "Bares", "Japonesa", "Italiana", "Mediterránea", "Tapas", "Brunch"];

function App() {
  const [ciudad, setCiudad] = useState("");
  const [tipo, setTipo] = useState("");
  const [precio, setPrecio] = useState("");
  const [chipActivo, setChipActivo] = useState("Todo");
  const [hasBuscado, setHasBuscado] = useState(false);
  const [restauranteActivo, setRestauranteActivo] = useState(null);

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
      <Header />

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
              <select
                className="select-precio"
                value={precio}
                onChange={e => setPrecio(e.target.value)}
                style={{ border: 'none', outline: 'none', fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', background: 'transparent', cursor: 'pointer', width: '100%' }}
              >
                <option value="">Precio máx.</option>
                <option value="1">€ — Económico</option>
                <option value="2">€€ — Precio medio</option>
                <option value="3">€€€ — Especial</option>
              </select>
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
        {!hasBuscado ? (
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

      {restauranteActivo && (
        <div className="modal-overlay modal-overlay--open" onClick={e => e.target === e.currentTarget && setRestauranteActivo(null)}>
          <div className="modal">
            <button className="modal__close" onClick={() => setRestauranteActivo(null)}>✕</button>
            <div className="modal__image">{restauranteActivo.emoji}</div>
            <div className="modal__body">
              <div className="modal__tags">
                {restauranteActivo.tipo.map(t => <span key={t} className="card__tag">{t}</span>)}
              </div>
              <h2 className="modal__nombre">{restauranteActivo.nombre}</h2>
              <p className="modal__rating">★ {restauranteActivo.valoracion} · {restauranteActivo.numValoraciones} valoraciones · {restauranteActivo.barrio}, {restauranteActivo.ciudad}</p>
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
