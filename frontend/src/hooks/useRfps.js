import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../api/client";

export function useRfps() {
  const [rfps, setRfps] = useState([]);
  const [loadingRfps, setLoadingRfps] = useState(false);
  const [creatingRfp, setCreatingRfp] = useState(false);
  const [rfpError, setRfpError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRfps = async () => {
    try {
      setLoadingRfps(true);
      const data = await apiGet("/api/rfps");
      setRfps(data);
    } catch (error) {
      console.error(error);
      setRfpError("Failed to load RFPs");
    } finally {
      setLoadingRfps(false);
    }
  };

  useEffect(() => {
    fetchRfps();
  }, []);

  const createRfp = async ({ payload, vendorIds }) => {
    setRfpError("");
    try {
      setCreatingRfp(true);
      const created = await apiPost("/api/rfps", payload);

      if (Array.isArray(vendorIds) && vendorIds.length > 0) {
        await apiPost(`/api/rfps/${created.id}/vendors`, { vendorIds });
      }

      await fetchRfps();
      return created;
    } catch (error) {
      console.error(error);
      setRfpError(error.message);
      throw error;
    } finally {
      setCreatingRfp(false);
    }
  };

  const sendRfp = async (rfpId) => {
    const data = await apiPost(`/api/rfps/${rfpId}/send`, {});
    return data;
  };

  const filteredRfps = useMemo(() => {
    if (!searchTerm.trim()) return rfps;
    const q = searchTerm.toLowerCase();

    return rfps.filter((rfp) => {
      const haystack = [
        rfp.title,
        rfp.description,
        rfp.budget != null ? String(rfp.budget) : "",
        rfp.deadline || "",
        rfp.budgetCurrency || "",
        rfp.vendorCount != null ? String(rfp.vendorCount) : "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [rfps, searchTerm]);

  return {
    rfps,
    filteredRfps,
    loadingRfps,
    creatingRfp,
    rfpError,
    searchTerm,
    setSearchTerm,
    fetchRfps,
    createRfp,
    sendRfp,
    setRfpError,
  };
}
