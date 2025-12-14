import { useState } from "react";
import { apiGet, apiPost } from "../api/client";

export function useProposals() {
  const [selectedRfpId, setSelectedRfpId] = useState("");
  const [proposals, setProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [creatingProposal, setCreatingProposal] = useState(false);
  const [proposalError, setProposalError] = useState("");

  const [vendorName, setVendorName] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [proposalText, setProposalText] = useState("");

  const [vendorsForRfp, setVendorsForRfp] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");

  const [evaluation, setEvaluation] = useState(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState("");

  const loadProposals = async (rfpId) => {
    if (!rfpId) {
      setProposals([]);
      return;
    }
    try {
      setLoadingProposals(true);
      const data = await apiGet(`/api/rfps/${rfpId}/proposals`);
      setProposals(data);
    } catch (error) {
      console.error(error);
      setProposalError("Failed to load proposals");
    } finally {
      setLoadingProposals(false);
    }
  };

  const loadVendorsForRfp = async (rfpId) => {
    if (!rfpId) {
      setVendorsForRfp([]);
      return;
    }
    try {
      const data = await apiGet(`/api/rfps/${rfpId}/vendors`);
      setVendorsForRfp(data);
    } catch (error) {
      console.error(error);
      setVendorsForRfp([]);
    }
  };

  const selectRfp = async (rfpId) => {
    setSelectedRfpId(rfpId);
    setProposalError("");
    setEvaluation(null);
    setEvalError("");
    setVendorName("");
    setVendorEmail("");
    setProposalText("");
    setSelectedVendorId("");

    if (rfpId) {
      await loadProposals(rfpId);
      await loadVendorsForRfp(rfpId);
    } else {
      setProposals([]);
      setVendorsForRfp([]);
    }
  };

  const selectVendor = (vendorId) => {
    const id = vendorId ? Number(vendorId) : "";
    setSelectedVendorId(id);

    if (!id) {
      setVendorName("");
      setVendorEmail("");
      return;
    }

    const v = vendorsForRfp.find((x) => x.id === id);
    if (v) {
      setVendorName(v.name || "");
      setVendorEmail(v.email || "");
    }
  };

  const submitProposal = async (e) => {
    e.preventDefault();
    setProposalError("");

    if (!selectedRfpId) return setProposalError("Please select an RFP first.");
    if (!proposalText.trim())
      return setProposalError("Proposal text is required.");

    try {
      setCreatingProposal(true);

      const data = await apiPost(`/api/rfps/${selectedRfpId}/proposals`, {
        vendorName: vendorName || null,
        vendorEmail: vendorEmail || null,
        text: proposalText,
      });

      setProposals((prev) => [data.proposal, ...prev]);
      setVendorName("");
      setVendorEmail("");
      setProposalText("");
      setSelectedVendorId("");
    } catch (error) {
      console.error(error);
      setProposalError(error.message);
    } finally {
      setCreatingProposal(false);
    }
  };

  const evaluate = async () => {
    if (!selectedRfpId) return;

    setEvalLoading(true);
    setEvalError("");
    setEvaluation(null);

    try {
      const data = await apiGet(`/api/rfps/${selectedRfpId}/proposals/evaluate`);
      setEvaluation(data);
    } catch (error) {
      console.error(error);
      setEvalError(error.message);
    } finally {
      setEvalLoading(false);
    }
  };

  return {
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
  };
}
