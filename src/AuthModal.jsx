import { useState } from 'react';
import { supabase } from './supabase';
import { useSwipeClose } from './useSwipeClose';

const inputStyle = {
  padding: '12px 16px',
  border: '1.5px solid #e5e7eb',
  borderRadius: 10,
  fontFamily: 'Inter, sans-serif',
  fontSize: '1rem',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.15s ease',
};

function AuthModal({ onClose, onAuth }) {
  const { ref, onTouchStart, onTouchMove, onTouchEnd } = useSwipeClose(onClose);
  const [modo, setModo] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [linkEnviado, setLinkEnviado] = useState(false);

  function cambiarModo(nuevoModo) {
    setModo(nuevoModo);
    setError('');
    setLinkEnviado(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);

    if (modo === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) {
        setError('No se pudo enviar el email. Comprueba la dirección.');
      } else {
        setLinkEnviado(true);
      }
      setCargando(false);
      return;
    }

    if (modo === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError('Email o contraseña incorrectos.');
      } else {
        onAuth(data.user);
        onClose();
      }
    } else {
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        setCargando(false);
        return;
      }
      const usernameClean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (!usernameClean) {
        setError('El nombre de usuario no puede estar vacío.');
        setCargando(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nombre: nombre.trim() || null, username: usernameClean } },
      });
      if (error) {
        setError('No se pudo crear la cuenta. Prueba con otro email.');
      } else {
        onAuth(data.user);
        onClose();
      }
    }

    setCargando(false);
  }

  return (
    <div className="modal-overlay modal-overlay--open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }} ref={ref} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <button className="modal__close" onClick={onClose}>✕</button>

        <div style={{ background: 'linear-gradient(135deg, #ff5c3a 0%, #ff8c6b 100%)', borderRadius: '20px 20px 0 0', padding: '28px 32px 24px', textAlign: 'center' }}>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>Trovi</span>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', marginTop: 4 }}>Descubre dónde comer en España</p>
        </div>

        <div className="modal__body" style={{ paddingTop: 28 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4, color: '#111827' }}>
            {modo === 'login' ? 'Bienvenido de nuevo' : modo === 'register' ? 'Crea tu cuenta' : 'Recuperar contraseña'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#6b7280', marginBottom: 22 }}>
            {modo === 'login' && <>¿No tienes cuenta? <button onClick={() => cambiarModo('register')} style={{ background: 'none', border: 'none', color: '#ff5c3a', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '0.88rem' }}>Regístrate</button></>}
            {modo === 'register' && <>¿Ya tienes cuenta? <button onClick={() => cambiarModo('login')} style={{ background: 'none', border: 'none', color: '#ff5c3a', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '0.88rem' }}>Inicia sesión</button></>}
            {modo === 'forgot' && <>Te enviaremos un link para restablecer tu contraseña.</>}
          </p>

          {linkEnviado ? (
            <div style={{ textAlign: 'center', padding: '20px 0 8px' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p style={{ fontWeight: 700, color: '#111827', marginBottom: 6 }}>Email enviado</p>
              <p style={{ fontSize: '0.88rem', color: '#6b7280', marginBottom: 20 }}>Revisa tu bandeja de entrada y sigue las instrucciones.</p>
              <button onClick={() => cambiarModo('login')} style={{ background: 'none', border: 'none', color: '#ff5c3a', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>← Volver al inicio de sesión</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {modo === 'register' && (
                <>
                  <input
                    type="text"
                    placeholder="Nombre de usuario * (ej: juangarcia)"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    required
                    maxLength={20}
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    placeholder="Tu nombre (opcional)"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    style={inputStyle}
                  />
                </>
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={inputStyle}
              />
              {modo !== 'forgot' && (
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={inputStyle}
                />
              )}
              {error && (
                <p style={{ color: '#ef4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </p>
              )}
              <button type="submit" className="btn btn--primary" disabled={cargando} style={{ marginTop: 4, padding: '13px', fontSize: '0.95rem' }}>
                {cargando ? 'Cargando…' : modo === 'login' ? 'Entrar' : modo === 'register' ? 'Crear cuenta' : 'Enviar link'}
              </button>
              {modo === 'login' && (
                <button type="button" onClick={() => cambiarModo('forgot')} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.85rem', cursor: 'pointer', padding: '4px 0', textAlign: 'center' }}>
                  ¿Olvidaste tu contraseña?
                </button>
              )}
              {modo === 'forgot' && (
                <button type="button" onClick={() => cambiarModo('login')} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.85rem', cursor: 'pointer', padding: '4px 0', textAlign: 'center' }}>
                  ← Volver al inicio de sesión
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
