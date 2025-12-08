import { useState } from 'react';

function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkBackend = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:4000/api/health');
      const data = await res.json();
      setHealth(JSON.stringify(data, null, 2));
    } catch (err) {
      setHealth('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>AI-Powered RFP Management System</h1>
      <p>Basic setup test: frontend ↔ backend connection</p>

      <button onClick={checkBackend} disabled={loading}>
        {loading ? 'Checking...' : 'Check Backend Health'}
      </button>

      {health && (
        <pre
          style={{
            marginTop: '1rem',
            padding: '1rem',
            border: '1px solid #ccc',
            borderRadius: '8px',
            background: '#f9f9f9',
          }}
        >
          {health}
        </pre>
      )}
    </div>
  );
}

export default App;
