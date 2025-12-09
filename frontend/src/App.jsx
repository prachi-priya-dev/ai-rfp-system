import { useEffect, useState } from 'react';
import Header from './components/Header';
import BackendHealth from './components/BackendHealth';
import AiAssistSection from './components/AiAssistSection';
import RfpForm from './components/RfpForm';
import RfpList from './components/RfpList';

const BACKEND_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000';

function App() {
  const [theme, setTheme] = useState('dark');

  const [health, setHealth] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [budgetCurrency, setBudgetCurrency] = useState('INR');
  const [deadline, setDeadline] = useState('');

  const [rfps, setRfps] = useState([]);
  const [loadingRfps, setLoadingRfps] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const [aiText, setAiText] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRfps();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const checkBackend = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/health`);
      const data = await res.json();
      setHealth(JSON.stringify(data, null, 2));
    } catch (err) {
      setHealth('Error: ' + err.message);
    }
  };

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
          budgetCurrency: budgetCurrency || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create RFP');
      }

      const created = await res.json();
      setRfps((prev) => [created, ...prev]);

      setTitle('');
      setDescription('');
      setBudget('');
      setBudgetCurrency('INR');
      setDeadline('');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

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

  const applyAiResultToForm = () => {
    if (!aiResult) return;

    if (aiResult.title) setTitle(aiResult.title);

    if (aiResult.summary) {
      const requirementsText =
        Array.isArray(aiResult.key_requirements) &&
        aiResult.key_requirements.length > 0
          ? '\n\nKey Requirements:\n- ' +
            aiResult.key_requirements.join('\n- ')
          : '';
      const deliverablesText =
        Array.isArray(aiResult.deliverables) &&
        aiResult.deliverables.length > 0
          ? '\n\nDeliverables:\n- ' +
            aiResult.deliverables.join('\n- ')
          : '';
      setDescription(
        `${aiResult.summary}${requirementsText}${deliverablesText}`,
      );
    }

    if (aiResult.budget_amount != null) {
      setBudget(String(aiResult.budget_amount));
    }

    if (aiResult.budget_currency) {
      setBudgetCurrency(aiResult.budget_currency);
    }

    if (aiResult.deadline) {
      setDeadline(aiResult.deadline);
    }
  };

  const filteredRfps = rfps.filter((rfp) => {
    if (!searchTerm.trim()) return true;

    const haystack = [
      rfp.title,
      rfp.description,
      rfp.budget != null ? String(rfp.budget) : '',
      rfp.deadline || '',
      rfp.budgetCurrency || '',
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(searchTerm.toLowerCase());
  });

  return (
    <div className={`app-root ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <div className="app-card">
        <Header theme={theme} onToggleTheme={toggleTheme} />

        <BackendHealth health={health} onCheck={checkBackend} />

        <AiAssistSection
          aiText={aiText}
          aiResult={aiResult}
          aiError={aiError}
          aiLoading={aiLoading}
          onAiTextChange={setAiText}
          onParseClick={handleParseWithAI}
          onApplyAiResult={applyAiResultToForm}
        />

        <RfpForm
          title={title}
          description={description}
          budget={budget}
          budgetCurrency={budgetCurrency}
          deadline={deadline}
          error={error}
          creating={creating}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onBudgetChange={setBudget}
          onBudgetCurrencyChange={setBudgetCurrency}
          onDeadlineChange={setDeadline}
          onSubmit={handleCreateRfp}
        />

        <RfpList
          rfps={filteredRfps}
          loading={loadingRfps}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>
    </div>
  );
}

export default App;
