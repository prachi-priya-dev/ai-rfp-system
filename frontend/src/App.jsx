// frontend/src/App.jsx
import Header from "./components/Header";
import { useState } from "react";
import BackendHealth from "./components/BackendHealth";
import AiAssistSection from "./components/AiAssistSection";
import RfpForm from "./components/RfpForm";
import RfpList from "./components/RfpList";
import VendorSection from "./components/VendorSection";
import VendorProposalsSection from "./components/VendorProposalsSection";

import { useTheme } from "./hooks/useTheme";
import { useHealth } from "./hooks/useHealth";
import { useVendors } from "./hooks/useVendor";
import { useRfps } from "./hooks/useRfp";
import { useAiAssist } from "./hooks/useAiAssist";
import { useProposals } from "./hooks/useProposal";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function App() {
  // Theme
  const { theme, toggleTheme, themeClass } = useTheme();

  // Health
  const { health, checkBackend } = useHealth();

  // Vendors
  const {
    vendors,
    loadingVendors,
    creatingVendor,
    vendorError,
    createVendor,
    updateVendor,
  } = useVendors();

  // RFPs
  const {
    rfps,
    filteredRfps,
    loadingRfps,
    creatingRfp,
    rfpError,
    setRfpError,
    searchTerm,
    setSearchTerm,
    createRfp,
    sendRfp,
    fetchRfps, // ⚠️ make sure your hook exports this (if not, tell me)
  } = useRfps();

  // AI Assist
  const { aiText, setAiText, aiResult, aiLoading, aiError, parseRfp } =
    useAiAssist();

  // Proposals
  const {
    selectedRfpId,
    selectRfp,
    proposals,
    loadingProposals,
    creatingProposal,
    proposalError,
    vendorName,
    vendorEmail,
    proposalText,
    setVendorName,
    setVendorEmail,
    setProposalText,
    vendorsForRfp,
    selectedVendorId,
    selectVendor,
    submitProposal,
    evaluation,
    evalLoading,
    evalError,
    evaluate,
  } = useProposals();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [budgetCurrency, setBudgetCurrency] = useState("INR");
  const [deadline, setDeadline] = useState("");
  const [selectedVendorIds, setSelectedVendorIds] = useState([]);

  // NEW: edit mode
  const [editingRfpId, setEditingRfpId] = useState(null);

  // Apply AI result into Create/Edit form
  const applyAiResultToForm = () => {
    if (!aiResult) return;

    if (aiResult.title) setTitle(aiResult.title);

    if (aiResult.summary) {
      const requirementsText =
        Array.isArray(aiResult.key_requirements) &&
        aiResult.key_requirements.length > 0
          ? "\n\nKey Requirements:\n- " + aiResult.key_requirements.join("\n- ")
          : "";

      const deliverablesText =
        Array.isArray(aiResult.deliverables) && aiResult.deliverables.length > 0
          ? "\n\nDeliverables:\n- " + aiResult.deliverables.join("\n- ")
          : "";

      setDescription(
        `${aiResult.summary}${requirementsText}${deliverablesText}`
      );
    }

    if (aiResult.budget_amount != null) setBudget(String(aiResult.budget_amount));
    if (aiResult.budget_currency) setBudgetCurrency(aiResult.budget_currency);
    if (aiResult.deadline) setDeadline(aiResult.deadline);
  };

  const handleToggleVendor = (vendorId) => {
    setSelectedVendorIds((prev) =>
      prev.includes(vendorId)
        ? prev.filter((id) => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  // ✅ Edit button handler (prefill form)
  const handleEditRfp = async (rfp) => {
    setEditingRfpId(rfp.id);

    setTitle(rfp.title || "");
    setDescription(rfp.description || "");
    setBudget(rfp.budget != null ? String(rfp.budget) : "");
    setBudgetCurrency(rfp.budgetCurrency || "INR");
    setDeadline(rfp.deadline || "");

    // load vendor links for this rfp so checkboxes get selected
    try {
      const res = await fetch(`${BACKEND_URL}/api/rfps/${rfp.id}/vendors`);
      const data = await res.json();
      setSelectedVendorIds(Array.isArray(data) ? data.map((v) => v.id) : []);
    } catch {
      setSelectedVendorIds([]);
    }

    // optional: scroll to top where form is
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingRfpId(null);
    setTitle("");
    setDescription("");
    setBudget("");
    setBudgetCurrency("INR");
    setDeadline("");
    setSelectedVendorIds([]);
    setRfpError("");
  };

  // ✅ Create OR Update (single submit)
  const handleCreateOrUpdateRfp = async (e) => {
    e.preventDefault();
    setRfpError("");

    if (!title.trim() || !description.trim()) {
      setRfpError("Title and description are required");
      return;
    }

    const payload = {
      title,
      description,
      budget: budget ? Number(budget) : null,
      deadline: deadline || null,
      budgetCurrency: budgetCurrency || null,
    };

    try {
      // UPDATE mode
      if (editingRfpId) {
        const res = await fetch(`${BACKEND_URL}/api/rfps/${editingRfpId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            vendorIds: selectedVendorIds,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update RFP");

        // refresh list
        if (fetchRfps) await fetchRfps();

        handleCancelEdit();
        return;
      }

      // CREATE mode
      await createRfp({
        payload,
        vendorIds: selectedVendorIds,
      });

      // clear form
      setTitle("");
      setDescription("");
      setBudget("");
      setBudgetCurrency("INR");
      setDeadline("");
      setSelectedVendorIds([]);
    } catch (err) {
      setRfpError(err.message || "Something went wrong");
    }
  };

  const handleSendRfp = async (rfpId) => {
    try {
      const data = await sendRfp(rfpId);
      alert(data.message || "RFP sent to vendors.");
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to send RFP emails");
    }
  };

  // ✅ Delete RFP
  const handleDeleteRfp = async (rfpId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/rfps/${rfpId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete RFP");

      // refresh list
      if (fetchRfps) await fetchRfps();

      // if user was editing the same rfp, cancel edit
      if (editingRfpId === rfpId) handleCancelEdit();
    } catch (err) {
      alert(err.message || "Failed to delete RFP");
    }
  };

  return (
    <div className={`app-root ${themeClass}`}>
      <div className="app-card">
        <Header theme={theme} onToggleTheme={toggleTheme} />

        <BackendHealth health={health} onCheck={checkBackend} />

        <AiAssistSection
          aiText={aiText}
          aiResult={aiResult}
          aiError={aiError}
          aiLoading={aiLoading}
          onAiTextChange={setAiText}
          onParseClick={parseRfp}
          onApplyAiResult={applyAiResultToForm}
        />

        <VendorSection
          vendors={vendors}
          loading={loadingVendors}
          error={vendorError}
          creating={creatingVendor}
          onCreateVendor={createVendor}
          onUpdateVendor={updateVendor}
        />

        <RfpForm
          mode={editingRfpId ? "edit" : "create"}
          onCancelEdit={handleCancelEdit}
          title={title}
          description={description}
          budget={budget}
          budgetCurrency={budgetCurrency}
          deadline={deadline}
          error={rfpError}
          creating={creatingRfp}
          vendors={vendors}
          selectedVendorIds={selectedVendorIds}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onBudgetChange={setBudget}
          onBudgetCurrencyChange={setBudgetCurrency}
          onDeadlineChange={setDeadline}
          onToggleVendor={handleToggleVendor}
          onSubmit={handleCreateOrUpdateRfp}
        />

        <VendorProposalsSection
          rfps={rfps}
          selectedRfpId={selectedRfpId}
          onSelectedRfpChange={selectRfp}
          vendorsForRfp={vendorsForRfp}
          selectedVendorId={selectedVendorId}
          onSelectedVendorChange={selectVendor}
          vendorName={vendorName}
          vendorEmail={vendorEmail}
          proposalText={proposalText}
          onVendorNameChange={setVendorName}
          onVendorEmailChange={setVendorEmail}
          onProposalTextChange={setProposalText}
          onSubmitProposal={submitProposal}
          creating={creatingProposal}
          error={proposalError}
          proposals={proposals}
          loadingProposals={loadingProposals}
          evaluation={evaluation}
          onEvaluate={evaluate}
          evalLoading={evalLoading}
          evalError={evalError}
        />

        <RfpList
          rfps={filteredRfps}
          loading={loadingRfps}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSendRfp={handleSendRfp}
          onEditRfp={handleEditRfp}
          onDeleteRfp={handleDeleteRfp}
        />
      </div>
    </div>
  );
}

export default App;
