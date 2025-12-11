import { useEffect, useState } from 'react';
import Header from './components/Header';
import BackendHealth from './components/BackendHealth';
import AiAssistSection from './components/AiAssistSection';
import RfpForm from './components/RfpForm';
import RfpList from './components/RfpList';
import VendorSection from './components/VendorSection';
import VendorProposalsSection from './components/VendorProposalsSection';

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

  // Vendors
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [creatingVendor, setCreatingVendor] = useState(false);
  const [vendorError, setVendorError] = useState('');
  const [selectedVendorIds, setSelectedVendorIds] = useState([]);

  // Proposals
  const [selectedRfpIdForProposals, setSelectedRfpIdForProposals] =
    useState('');
  const [proposals, setProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [creatingProposal, setCreatingProposal] = useState(false);
  const [proposalError, setProposalError] = useState('');
  const [proposalVendorName, setProposalVendorName] = useState('');
  const [proposalVendorEmail, setProposalVendorEmail] = useState('');
  const [proposalText, setProposalText] = useState('');
    const [proposalVendors, setProposalVendors] = useState([]);
  const [selectedProposalVendorId, setSelectedProposalVendorId] =
    useState('');


  useEffect(() => {
    fetchRfps();
    fetchVendors();
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

  const fetchVendors = async () => {
    try {
      setLoadingVendors(true);
      const res = await fetch(`${BACKEND_URL}/api/vendors`);
      const data = await res.json();
      setVendors(data);
    } catch (err) {
      console.error(err);
      setVendorError('Failed to load vendors');
    } finally {
      setLoadingVendors(false);
    }
  };

  const fetchProposalsForRfp = async (rfpId) => {
    if (!rfpId) {
      setProposals([]);
      return;
    }
    try {
      setLoadingProposals(true);
      const res = await fetch(
        `${BACKEND_URL}/api/rfps/${rfpId}/proposals`,
      );
      const data = await res.json();
      setProposals(data);
    } catch (err) {
      console.error(err);
      setProposalError('Failed to load proposals');
    } finally {
      setLoadingProposals(false);
    }
  };

  const handleCreateVendor = async (vendorInput) => {
    setVendorError('');
    try {
      setCreatingVendor(true);
      const res = await fetch(`${BACKEND_URL}/api/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorInput),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create vendor');
      }

      setVendors((prev) => [data, ...prev]);
    } catch (err) {
      console.error(err);
      setVendorError(err.message);
    } finally {
      setCreatingVendor(false);
    }
  };

  const handleUpdateVendor = async (id, updates) => {
    setVendorError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/vendors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update vendor');
      }

      setVendors((prev) =>
        prev.map((v) => (v.id === id ? data : v)),
      );
    } catch (err) {
      console.error(err);
      setVendorError(err.message);
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create RFP');
      }

      const created = data;

      // If vendors selected, link them to this RFP
      if (selectedVendorIds.length > 0) {
        await fetch(`${BACKEND_URL}/api/rfps/${created.id}/vendors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vendorIds: selectedVendorIds }),
        });
      }

      // Refresh list from backend (so vendorCount updates)
      await fetchRfps();

      // Clear form
      setTitle('');
      setDescription('');
      setBudget('');
      setBudgetCurrency('INR');
      setDeadline('');
      setSelectedVendorIds([]);
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
      rfp.vendorCount != null ? String(rfp.vendorCount) : '',
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(searchTerm.toLowerCase());
  });

  const handleToggleVendor = (vendorId) => {
    setSelectedVendorIds((prev) =>
      prev.includes(vendorId)
        ? prev.filter((id) => id !== vendorId)
        : [...prev, vendorId],
    );
  };

  const handleSendRfp = async (rfpId) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/rfps/${rfpId}/send`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}), // send to all linked vendors
        },
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to send RFP emails');
        return;
      }

      alert(data.message || 'RFP sent to vendors.');
    } catch (err) {
      console.error(err);
      alert('Error sending RFP: ' + err.message);
    }
  };

  const handleSelectRfpForProposals = (rfpId) => {
    setSelectedRfpIdForProposals(rfpId);
    setProposalError('');
    setProposalVendorName('');
    setProposalVendorEmail('');
    setProposalText('');
    if (rfpId) {
      fetchProposalsForRfp(rfpId);
      fetchVendorsForRfp(rfpId); 
    } else {
      setProposals([]);
    }
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    setProposalError('');

    if (!selectedRfpIdForProposals) {
      setProposalError('Please select an RFP first.');
      return;
    }
    if (!proposalText.trim()) {
      setProposalError('Proposal text is required.');
      return;
    }

    try {
      setCreatingProposal(true);

      const res = await fetch(
        `${BACKEND_URL}/api/rfps/${selectedRfpIdForProposals}/proposals`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vendorName: proposalVendorName || null,
            vendorEmail: proposalVendorEmail || null,
            text: proposalText,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save proposal');
      }

      // Prepend new proposal to list
      setProposals((prev) => [data.proposal, ...prev]);

      // Clear form
      setProposalVendorName('');
      setProposalVendorEmail('');
      setProposalText('');
    } catch (err) {
      console.error(err);
      setProposalError(err.message);
    } finally {
      setCreatingProposal(false);
    }
  };

    const handleSelectVendorForProposal = (vendorId) => {
    setSelectedProposalVendorId(vendorId || '');
    if (!vendorId) {
      // Clear fields if user chooses "no vendor"
      setProposalVendorName('');
      setProposalVendorEmail('');
      return;
    }

    const v = proposalVendors.find((vv) => vv.id === vendorId);
    if (v) {
      setProposalVendorName(v.name || '');
      setProposalVendorEmail(v.email || '');
    }
  };


    const fetchVendorsForRfp = async (rfpId) => {
    if (!rfpId) {
      setProposalVendors([]);
      return;
    }
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/rfps/${rfpId}/vendors`,
      );
      const data = await res.json();
      setProposalVendors(data);
    } catch (err) {
      console.error(err);
      // silently ignore here; proposals can still work without vendor list
    }
  };


  return (
    <div
      className={`app-root ${
        theme === 'dark' ? 'theme-dark' : 'theme-light'
      }`}
    >
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

        <VendorSection
          vendors={vendors}
          loading={loadingVendors}
          error={vendorError}
          creating={creatingVendor}
          onCreateVendor={handleCreateVendor}
          onUpdateVendor={handleUpdateVendor}
/>

        <RfpForm
          title={title}
          description={description}
          budget={budget}
          budgetCurrency={budgetCurrency}
          deadline={deadline}
          error={error}
          creating={creating}
          vendors={vendors}
          selectedVendorIds={selectedVendorIds}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onBudgetChange={setBudget}
          onBudgetCurrencyChange={setBudgetCurrency}
          onDeadlineChange={setDeadline}
          onToggleVendor={handleToggleVendor}
          onSubmit={handleCreateRfp}
        />

        <VendorProposalsSection
          rfps={rfps}
          selectedRfpId={selectedRfpIdForProposals}
          onSelectedRfpChange={handleSelectRfpForProposals}
          vendorsForRfp={proposalVendors}                 // 👈 NEW
          selectedVendorId={selectedProposalVendorId}     // 👈 NEW
          onSelectedVendorChange={handleSelectVendorForProposal}
          vendorName={proposalVendorName}
          vendorEmail={proposalVendorEmail}
          proposalText={proposalText}
          onVendorNameChange={setProposalVendorName}
          onVendorEmailChange={setProposalVendorEmail}
          onProposalTextChange={setProposalText}
          onSubmitProposal={handleSubmitProposal}
          creating={creatingProposal}
          error={proposalError}
          proposals={proposals}
          loadingProposals={loadingProposals}
        />

        <RfpList
          rfps={filteredRfps}
          loading={loadingRfps}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSendRfp={handleSendRfp}
        />
      </div>
    </div>
  );
}

export default App;
