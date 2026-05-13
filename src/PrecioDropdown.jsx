import { useState, useEffect, useRef } from 'react';

const opciones = [
  { value: "", label: "Precio máx." },
  { value: "15", label: "Hasta 15€ p.p." },
  { value: "30", label: "Hasta 30€ p.p." },
  { value: "50", label: "Hasta 50€ p.p." },
];

function PrecioDropdown({ value, onChange }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  const etiqueta = opciones.find(o => o.value === value)?.label || "Precio máx.";

  useEffect(() => {
    function cerrarSiClickFuera(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setAbierto(false);
      }
    }
    document.addEventListener("click", cerrarSiClickFuera);
    return () => document.removeEventListener("click", cerrarSiClickFuera);
  }, []);

  return (
    <div className="dropdown" ref={ref}>
      <button
        className={`dropdown__trigger${value ? " has-value" : ""}`}
        type="button"
        onClick={() => setAbierto(a => !a)}
      >
        <span className="dropdown__label">{etiqueta}</span>
        <span className={`dropdown__arrow${abierto ? " dropdown__arrow--open" : ""}`}>▾</span>
      </button>
      {abierto && (
        <ul className="dropdown__menu" style={{ display: 'block' }}>
          {opciones.map(opcion => (
            <li
              key={opcion.value}
              className={`dropdown__option${value === opcion.value ? " dropdown__option--selected" : ""}`}
              onClick={() => { onChange(opcion.value); setAbierto(false); }}
            >
              {opcion.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PrecioDropdown;
