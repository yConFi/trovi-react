import { useState, useRef, useEffect } from 'react';

function Header({ usuario, esAdmin, onLoginClick, onLogout, onProponer, onAdmin, onPerfil, onExplorar, onComoFunciona }) {
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
          <a href="#" onClick={e => { e.preventDefault(); onExplorar(); }}>Explorar</a>
          <a href="#" onClick={e => { e.preventDefault(); onComoFunciona(); }}>Cómo funciona</a>
          <button className="btn btn--outline" onClick={onProponer}>+ Proponer sitio</button>

          {!usuario && (
            <div className="solo-movil" style={{ position: 'relative' }} ref={ref}>
              <button
                onClick={() => setMenuAbierto(a => !a)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </button>
              {menuAbierto && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                  background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)', minWidth: 190, zIndex: 200,
                  overflow: 'hidden', padding: 6,
                }}>
                  <MenuItem onClick={() => { onExplorar(); setMenuAbierto(false); }} icon={<IconExplorar />}>Explorar</MenuItem>
                  <MenuItem onClick={() => { onComoFunciona(); setMenuAbierto(false); }} icon={<IconInfo />}>Cómo funciona</MenuItem>
                  <MenuItem onClick={() => { onProponer(); setMenuAbierto(false); }} icon={<IconProponer />}>Proponer sitio</MenuItem>
                  <div style={{ borderTop: '1px solid #f3f4f6', margin: '6px 0' }} />
                  <MenuItem onClick={() => { onLoginClick(); setMenuAbierto(false); }} icon={<IconLogin />}>Iniciar sesión</MenuItem>
                </div>
              )}
            </div>
          )}
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
                  <div className="solo-movil" style={{ flexDirection: 'column' }}>
                    <MenuItem onClick={() => { onExplorar(); setMenuAbierto(false); }} icon={<IconExplorar />}>Explorar</MenuItem>
                    <MenuItem onClick={() => { onComoFunciona(); setMenuAbierto(false); }} icon={<IconInfo />}>Cómo funciona</MenuItem>
                    <MenuItem onClick={() => { onProponer(); setMenuAbierto(false); }} icon={<IconProponer />}>Proponer sitio</MenuItem>
                    <div style={{ borderTop: '1px solid #f3f4f6', margin: '6px 0' }} />
                  </div>
                  <MenuItem onClick={() => { onPerfil(); setMenuAbierto(false); }} icon={<IconPerfil />}>Mi perfil</MenuItem>
                  {esAdmin && <MenuItem onClick={() => { onAdmin(); setMenuAbierto(false); }} icon={<IconAdmin />}>Panel de admin</MenuItem>}
                  <MenuItem onClick={() => { onLogout(); setMenuAbierto(false); }} icon={<IconSalir />} danger>Cerrar sesión</MenuItem>
                </div>
              )}
            </div>
          ) : (
            <button
              className="no-movil"
              onClick={onLoginClick}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: '#4b5563', padding: '8px 4px' }}
            >
              Iniciar sesión
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

function MenuItem({ children, onClick, danger, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
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
      onMouseEnter={e => e.currentTarget.style.background = danger ? '#fef2f2' : '#f3f4f6'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      {icon && <span style={{ opacity: 0.5, display: 'flex', flexShrink: 0 }}>{icon}</span>}
      {children}
    </button>
  );
}

function IconExplorar() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}
function IconInfo() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
function IconProponer() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
}
function IconPerfil() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
}
function IconAdmin() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function IconSalir() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
function IconLogin() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>;
}

export default Header;
