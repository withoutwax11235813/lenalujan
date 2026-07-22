import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      console.error(err);
      setError('Email o contraseña incorrectos.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-base">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🪵</div>
          <h1 className="text-2xl font-bold text-slate-100">Leña Balance</h1>
          <p className="text-muted text-sm mt-1">Ingresá con tu cuenta de socio</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted mb-1 block">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="tap-target w-full rounded-xl bg-surface border border-surface2 px-4 py-3 text-base text-slate-100 outline-none focus:border-accent"
              placeholder="tuemail@ejemplo.com"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="text-sm text-muted mb-1 block">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="tap-target w-full rounded-xl bg-surface border border-surface2 px-4 py-3 text-base text-slate-100 outline-none focus:border-accent"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-danger text-sm bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="tap-target w-full rounded-xl bg-accent text-base font-semibold py-3 disabled:opacity-60 active:scale-[0.98] transition"
          >
            {busy ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
