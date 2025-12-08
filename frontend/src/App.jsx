import { useEffect, useState } from 'react';

const BACKEND_URL = 'http://localhost:4000';

function App() {
  // ----- Health check state -----
  const [health, setHealth] = useState(null);

  // ----- RFP form state -----
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');

  // ----- RFP list state -----
  const [rfps, setRfps] = useState([]);
  const [loadingRfps, setLoadingRfps] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // ----- AI parsing state -----
  const [aiText, setAiText] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Load RFPs on first render
  useEffect(() => {
    fetchRfps();
  }, []);

  // ---- API call: health check ----
  const checkBackend = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/health`);
      const data = await res.json();
      setHealth(JSON.stringify(data, null, 2));
    } catch (err) {
      setHealth('Error: ' + err.message);
    }
  };

  // ---- API call: get all RFPs ----
  const fetchRfps = async () => {
    try {
      setLoadingRfps(true);
      const res = await fetch(`${BACKEND_URL}/api/rfps`);
      const data = await res.json();
      setRfps(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load RFPs');
    } finally {
      setLoadingRfps(false);
    }
  };

  // ---- API call: create RFP ----
  const handleCreateRfp = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required');
      return;
    }

    try {
      setCreating(true);
      const res = await fetch(`${BACKEND_URL}/api/rfps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          budget: budget ? Number(budget) : null,
          deadline: deadline || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create RFP');
      }

      const created = await res.json();

      // Add new RFP at the top of the list
      setRfps((prev) => [created, ...prev]);

      // Clear form
      setTitle('');
      setDescription('');
      setBudget('');
      setDeadline('');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  // ---- API call: AI parse RFP text ----
  const handleParseWithAI = async () => {
    setAiError('');
    setAiResult(null);

    if (!aiText.trim()) {
      setAiError('Please paste some RFP text first.');
      return;
    }

    try {
      setAiLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/rfps/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiText }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse RFP with AI');
      }

      setAiResult(data.structuredRfp);
    } catch (err) {
      console.error(err);
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // ---- Use AI result to fill the create form ----
  const applyAiResultToForm = () => {
    if (!aiResult) return;

    if (aiResult.title) setTitle(aiResult.title);
    if (aiResult.summary) {
      const requirementsText =
        Array.isArray(aiResult.key_requirements) &&
        aiResult.key_requirements.length > 0
          ? '\n\nKey Requirements:\n- ' + aiResult.key_requirements.join('\n- ')
          : '';
      const deliverablesText =
        Array.isArray(aiResult.deliverables) && aiResult.deliverables.length > 0
          ? '\n\nDeliverables:\n- ' + aiResult.deliverables.join('\n- ')
          : '';
      setDescription(
        `${aiResult.summary}${requirementsText}${deliverablesText}`,
      );
    }
    if (aiResult.budget_amount != null) {
      setBudget(String(aiResult.budget_amount));
    }
    if (aiResult.deadline) {
      setDeadline(aiResult.deadline); // assume YYYY-MM-DD
    }
  };

  // ---------- JSX ----------
  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        background: '#f5f5f7',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        }}
      >
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ margin: 0 }}>AI-Powered RFP Management System</h1>
          <p style={{ marginTop: '0.5rem', color: '#555' }}>
            Step 3: Use OpenAI to parse unstructured RFP text into structured
            data.
          </p>
        </header>

        {/* Health check section */}
        <section
          style={{
            marginBottom: '2rem',
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            background: '#fafafa',
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Backend Health</h2>
          <button onClick={checkBackend} style={buttonStyle}>
            Check Backend Health
          </button>
          {health && (
            <pre
              style={{
                marginTop: '0.75rem',
                padding: '0.75rem',
                borderRadius: '8px',
                background: '#111827',
                color: '#e5e7eb',
                fontSize: '0.85rem',
                overflowX: 'auto',
              }}
            >
              {health}
            </pre>
          )}
        </section>

        {/* AI Assist section */}
        <section
          style={{
            marginBottom: '2rem',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            background: '#f9fafb',
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: '1.2rem' }}>
            AI Assist: Parse RFP Text
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#555' }}>
            Paste a long, unstructured RFP (for example, from an email or PDF),
            and let the model convert it into structured fields.
          </p>

          {aiError && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
                fontSize: '0.9rem',
              }}
            >
              {aiError}
            </div>
          )}

          <div style={formFieldStyle}>
            <label style={labelStyle}>Unstructured RFP text</label>
            <textarea
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              style={{
                ...inputStyle,
                minHeight: '150px',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
              placeholder="Paste a detailed RFP email or document text here..."
            />
          </div>

          <button
            type="button"
            style={buttonStyle}
            onClick={handleParseWithAI}
            disabled={aiLoading}
          >
            {aiLoading ? 'Analyzing with AI...' : 'Generate Structured RFP'}
          </button>

          {aiResult && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                AI Output (Structured JSON)
              </h3>
              <pre
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: '#0f172a',
                  color: '#e5e7eb',
                  fontSize: '0.85rem',
                  overflowX: 'auto',
                }}
              >
                {JSON.stringify(aiResult, null, 2)}
              </pre>

              <button
                type="button"
                style={{ ...buttonStyle, marginTop: '0.75rem' }}
                onClick={applyAiResultToForm}
              >
                Use this data in RFP form
              </button>
            </div>
          )}
        </section>

        {/* Create RFP form */}
        <section
          style={{
            marginBottom: '2rem',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: '1.2rem' }}>Create New RFP</h2>
          {error && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
                fontSize: '0.9rem',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleCreateRfp}>
            <div style={formFieldStyle}>
              <label style={labelStyle}>Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={inputStyle}
                placeholder="e.g., Website Redesign for E-commerce Brand"
              />
            </div>

            <div style={formFieldStyle}>
              <label style={labelStyle}>Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder="Describe the project requirements, scope, expectations..."
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ ...formFieldStyle, flex: 1, minWidth: '150px' }}>
                <label style={labelStyle}>Budget (optional)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g., 20000"
                />
              </div>

              <div style={{ ...formFieldStyle, flex: 1, minWidth: '150px' }}>
                <label style={labelStyle}>Deadline (optional)</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <button type="submit" style={buttonStyle} disabled={creating}>
              {creating ? 'Creating...' : 'Create RFP'}
            </button>
          </form>
        </section>

        {/* RFP List */}
        <section>
          <h2 style={{ marginTop: 0, fontSize: '1.2rem' }}>
            Existing RFPs
          </h2>
          {loadingRfps ? (
            <p>Loading RFPs...</p>
          ) : rfps.length === 0 ? (
            <p style={{ color: '#777' }}>No RFPs yet. Create one above.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {rfps.map((rfp) => (
                <div
                  key={rfp.id}
                  style={{
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0',
                    padding: '1rem 1.25rem',
                    background: '#ffffff',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0 }}>{rfp.title}</h3>
                      <p
                        style={{
                          marginTop: '0.35rem',
                          marginBottom: '0.5rem',
                          color: '#555',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {rfp.description}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                      {rfp.budget != null && (
                        <div>
                          <strong>Budget:</strong> ₹{rfp.budget}
                        </div>
                      )}
                      {rfp.deadline && (
                        <div>
                          <strong>Deadline:</strong> {rfp.deadline}
                        </div>
                      )}
                      <div style={{ marginTop: '0.25rem', color: '#888' }}>
                        Created:{' '}
                        {rfp.createdAt
                          ? new Date(rfp.createdAt).toLocaleString()
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// --- Simple inline styles for reuse ---
const inputStyle = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontSize: '0.95rem',
};

const labelStyle = {
  display: 'block',
  marginBottom: '0.35rem',
  fontSize: '0.9rem',
  fontWeight: 500,
};

const formFieldStyle = {
  marginBottom: '1rem',
};

const buttonStyle = {
  marginTop: '0.5rem',
  padding: '0.6rem 1.2rem',
  borderRadius: '999px',
  border: 'none',
  fontSize: '0.95rem',
  fontWeight: 500,
  cursor: 'pointer',
  background: '#2563eb',
  color: '#ffffff',
};

export default App;
