import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut } from "../api/client";

export function useVendors() {
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [creatingVendor, setCreatingVendor] = useState(false);
  const [vendorError, setVendorError] = useState("");

  const fetchVendors = async () => {
    try {
      setLoadingVendors(true);
      const data = await apiGet("/api/vendors");
      setVendors(data);
    } catch (error) {
      console.error(error);
      setVendorError("Failed to load vendors");
    } finally {
      setLoadingVendors(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const createVendor = async (vendorInput) => {
    setVendorError("");
    try {
      setCreatingVendor(true);
      const created = await apiPost("/api/vendors", vendorInput);
      setVendors((prev) => [created, ...prev]);
    } catch (error) {
      console.error(error);
      setVendorError(error.message);
    } finally {
      setCreatingVendor(false);
    }
  };

  const updateVendor = async (id, updates) => {
    setVendorError("");
    try {
      const updated = await apiPut(`/api/vendors/${id}`, updates);
      setVendors((prev) => prev.map((v) => (v.id === id ? updated : v)));
    } catch (error) {
      console.error(error);
      setVendorError(error.message);
    }
  };

  return {
    vendors,
    loadingVendors,
    creatingVendor,
    vendorError,
    fetchVendors,
    createVendor,
    updateVendor,
  };
}
