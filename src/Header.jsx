function Header({ usuario, esAdmin, onLoginClick, onLogout, onProponer, onAdmin, onPerfil }) {
  return (
    <header className="header">
      <div className="container header__inner">
        <a href="#" className="logo">Trovi</a>
        <nav className="nav">
          <a href="#">Explorar</a>
          <a href="#">Cómo funciona</a>
          <button className="btn btn--outline" onClick={onProponer}>+ Proponer sitio</button>
          {esAdmin && (
            <button className="btn btn--outline" onClick={onAdmin} style={{ borderColor: '#ff5c3a', color: '#ff5c3a' }}>Admin</button>
          )}
          {usuario ? (
            <>
              <button onClick={onPerfil} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#6b7280', padding: 0 }}>{usuario.email}</button>
              <button className="btn btn--outline" onClick={onLogout}>Cerrar sesión</button>
            </>
          ) : (
            <button className="btn btn--outline" onClick={onLoginClick}>Iniciar sesión</button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
