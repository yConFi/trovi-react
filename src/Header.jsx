import { useState, useRef, useEffect } from 'react';

function Header({ usuario, esAdmin, onLoginClick, onLogout, onProponer, onAdmin, onPerfil }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function cerrar(e) {
      if (ref.current && !ref.current.contains(e.target)) setMenuAbierto(false);
    }
    document.addEventListener('click', cerrar);
    return () => document.removeEventListener('click', cerrar);
  }, []);

  const inicial = usuario?.email?.[0].toUpperCase();

  return (
    <header className="header">
      <div className="container header__inner">
        <a href="#" className="logo">Trovi</a>
        <nav className="nav">
          <a href="#">Explorar</a>
          <a href="#">Cómo funciona</a>
          <button className="btn btn--outline" onClick={onProponer}>+ Proponer sitio</button>

          {usuario ? (
            <div style={{ position: 'relative' }} ref={ref}>
              <button
                onClick={() => setMenuAbierto(a => !a)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#ff5c3a',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  fontFamily: 'Inter, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {inicial}
              </button>

              {menuAbierto && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  background: 'white',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  minWidth: 180,
                  zIndex: 200,
                  overflow: 'hidden',
                  padding: 6,
                }}>
                  <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid #f3f4f6', marginBottom: 4 }}>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Conectado como</p>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{usuario.email}</p>
                  </div>
                  <MenuItem onClick={() => { onPerfil(); setMenuAbierto(false); }}>Mi perfil</MenuItem>
                  <MenuItem onClick={() => { onProponer(); setMenuAbierto(false); }}>+ Proponer sitio</MenuItem>
                  {esAdmin && <MenuItem onClick={() => { onAdmin(); setMenuAbierto(false); }}>Panel de admin</MenuItem>}
                  <MenuItem onClick={() => { onLogout(); setMenuAbierto(false); }} danger>Cerrar sesión</MenuItem>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn--outline" onClick={onLoginClick}>Iniciar sesión</button>
          )}
        </nav>
      </div>
    </header>
  );
}

function MenuItem({ children, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '9px 12px',
        fontSize: '0.9rem',
        color: danger ? '#ef4444' : '#4b5563',
        fontFamily: 'Inter, sans-serif',
        borderRadius: 8,
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      {children}
    </button>
  );
}

export default Header;
