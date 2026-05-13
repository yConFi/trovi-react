function Header({ usuario, onLoginClick, onLogout }) {
  return (
    <header className="header">
      <div className="container header__inner">
        <a href="#" className="logo">Trovi</a>
        <nav className="nav">
          <a href="#">Explorar</a>
          <a href="#">Cómo funciona</a>
          {usuario ? (
            <>
              <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{usuario.email}</span>
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
