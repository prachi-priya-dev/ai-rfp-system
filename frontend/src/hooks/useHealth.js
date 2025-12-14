import { useState } from "react";
import { apiGet } from "../api/client";

export function useHealth() {
  const [health, setHealth] = useState(null);

  const checkBackend = async () => {
    try {
      const data = await apiGet("/api/health");
      setHealth(JSON.stringify(data, null, 2));
    } catch (err) {
      setHealth("Error: " + err.message);
    }
  };

  return { health, checkBackend };
}
