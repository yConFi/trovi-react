function Header() {
  return (
    <header className="header">
      <div className="container header__inner">
        <a href="#" className="logo">Trovi</a>
        <nav className="nav">
          <a href="#">Explorar</a>
          <a href="#">Cómo funciona</a>
          <button className="btn btn--outline">Iniciar sesión</button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
