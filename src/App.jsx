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

function App() {
  return (
    <div>
      <Header />
      <main className="container results">
        <div className="cards-grid">
          {restaurantes.map((r, i) => (
            <RestaurantCard key={i} restaurante={r} onClick={() => {}} />
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
