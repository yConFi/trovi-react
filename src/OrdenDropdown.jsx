import { useState, useEffect, useRef } from 'react';

const opciones = [
  { value: "valoracion", label: "Mejor valorados" },
  { value: "nuevos", label: "Más recientes" },
];

function OrdenDropdown({ value, onChange }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  const etiqueta = opciones.find(o => o.value === value)?.label || "Ordenar";

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
        className={`dropdown__trigger has-value`}
        type="button"
        onClick={() => setAbierto(a => !a)}
      >
        <span className="dropdown__label">{etiqueta}</span>
        <span className={`dropdown__arrow${abierto ? " dropdown__arrow--open" : ""}`}>▾</span>
      </button>
      {abierto && (
        <ul className="dropdown__menu" style={{ display: 'block', left: 'auto', right: 0 }}>
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

export default OrdenDropdown;
