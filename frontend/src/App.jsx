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
import { useVendors } from "./hooks/useVendors";
import { useRfps } from "./hooks/useRfps";
import { useAiAssist } from "./hooks/useAiAssist";
import { useProposals } from "./hooks/useProposals";

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

  // RFP form state (stays in App because it's UI form-specific)
  // (If you want, we can move this to its own hook later too)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [budgetCurrency, setBudgetCurrency] = useState("INR");
  const [deadline, setDeadline] = useState("");
  const [selectedVendorIds, setSelectedVendorIds] = useState([]);

  // Apply AI result into Create RFP form
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

      setDescription(`${aiResult.summary}${requirementsText}${deliverablesText}`);
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

  const handleCreateRfp = async (e) => {
    e.preventDefault();
    setRfpError("");

    if (!title.trim() || !description.trim()) {
      setRfpError("Title and description are required");
      return;
    }

    try {
      await createRfp({
        payload: {
          title,
          description,
          budget: budget ? Number(budget) : null,
          deadline: deadline || null,
          budgetCurrency: budgetCurrency || null,
        },
        vendorIds: selectedVendorIds,
      });

      // clear form
      setTitle("");
      setDescription("");
      setBudget("");
      setBudgetCurrency("INR");
      setDeadline("");
      setSelectedVendorIds([]);
    } catch {
      // error already set in hook
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
          onSubmit={handleCreateRfp}
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
        />
      </div>
    </div>
  );
}

export default App;
