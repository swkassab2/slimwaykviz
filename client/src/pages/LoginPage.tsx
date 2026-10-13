import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const r = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });
      const d = await r.json();
      if (d.ok) navigate('/', { replace: true });
      else setError(d.error ?? 'Ошибка входа');
    } catch {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1>SlimWay</h1>
        <p>Квалификация клиентов · вход</p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
              autoComplete="current-password"
            />
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading || !password}>
              {loading ? 'Входим…' : 'Войти'}
            </button>
          </div>
          {error && <p className="error-msg">{error}</p>}
        </form>
      </div>
    </div>
  );
}
