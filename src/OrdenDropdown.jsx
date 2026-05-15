import { useState, useEffect, useRef } from 'react';

const opciones = [
  { value: "", label: "Por defecto" },
  { value: "valoracion", label: "Mejor valorados" },
  { value: "precio", label: "Precio: menor primero" },
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
    <div className="dropdown" ref={ref} style={{ width: 'auto' }}>
      <button
        type="button"
        onClick={() => setAbierto(a => !a)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          border: '1.5px solid #e5e7eb',
          borderRadius: 999,
          background: 'white',
          padding: '7px 14px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.85rem',
          fontWeight: 500,
          color: '#4b5563',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#ff5c3a'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
      >
        {value && <span style={{ color: '#9ca3af', fontWeight: 400 }}>Ordenar:</span>}
        <span style={{ color: value ? '#111827' : '#9ca3af', fontWeight: value ? 600 : 400 }}>{value ? etiqueta : 'Ordenar'}</span>
        <span style={{ fontSize: '0.7rem', color: '#9ca3af', transition: 'transform 0.15s', display: 'inline-block', transform: abierto ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
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
