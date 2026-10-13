import { useEffect, useState } from 'react';

type HealthState =
  | { status: 'loading' }
  | { status: 'ok'; time: string }
  | { status: 'error'; error: string };

export default function App() {
  const [health, setHealth] = useState<HealthState>({ status: 'loading' });

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setHealth({ status: 'ok', time: data.time });
        else setHealth({ status: 'error', error: data.error ?? 'Unknown error' });
      })
      .catch((e) => setHealth({ status: 'error', error: String(e) }));
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 480, margin: '60px auto', padding: '0 16px' }}>
      <h1>SlimWay · Квалификация</h1>
      {health.status === 'loading' && (
        <p style={{ color: '#888' }}>Проверяем соединение…</p>
      )}
      {health.status === 'ok' && (
        <div style={{ background: '#d4edda', color: '#155724', padding: '12px 16px', borderRadius: 6 }}>
          Сервер и Supabase подключены
        </div>
      )}
      {health.status === 'error' && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px 16px', borderRadius: 6 }}>
          {health.error}
        </div>
      )}
    </div>
  );
}
