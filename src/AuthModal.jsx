import { useState } from 'react';
import { supabase } from './supabase';
import { useSwipeClose } from './useSwipeClose';

function AuthModal({ onClose, onAuth }) {
  const { ref, onTouchStart, onTouchMove, onTouchEnd } = useSwipeClose(onClose);
  const [modo, setModo] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);

    if (modo === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError('Email o contraseña incorrectos.');
      } else {
        onAuth(data.user);
        onClose();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
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
        <div className="modal__body" style={{ paddingTop: 40 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>
            {modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: 24 }}>
            {modo === 'login'
              ? '¿No tienes cuenta? '
              : '¿Ya tienes cuenta? '}
            <button
              onClick={() => { setModo(modo === 'login' ? 'register' : 'login'); setError(''); }}
              style={{ background: 'none', border: 'none', color: '#ff5c3a', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '0.9rem' }}
            >
              {modo === 'login' ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ padding: '12px 16px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', outline: 'none' }}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ padding: '12px 16px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', outline: 'none' }}
            />
            {error && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</p>}
            <button
              type="submit"
              className="btn btn--primary"
              disabled={cargando}
              style={{ marginTop: 4, padding: '13px', fontSize: '0.95rem' }}
            >
              {cargando ? 'Cargando…' : modo === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
