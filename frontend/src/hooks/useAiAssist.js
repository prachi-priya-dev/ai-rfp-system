import { useState } from "react";
import { apiPost } from "../api/client";

export function useAiAssist() {
  const [aiText, setAiText] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const parseRfp = async () => {
    setAiError("");
    setAiResult(null);
    if (!aiText.trim()) {
      setAiError("Please paste some RFP text first.");
      return null;
    }
    try {
      setAiLoading(true);
      const data = await apiPost("/api/rfps/parse", { text: aiText });
      setAiResult(data.structuredRfp);
      return data.structuredRfp;
    } catch (err) {
      setAiError(err.message);
      return null;
    } finally {
      setAiLoading(false);
    }
  };

  return { aiText, setAiText, aiResult, aiLoading, aiError, parseRfp, setAiResult };
}
