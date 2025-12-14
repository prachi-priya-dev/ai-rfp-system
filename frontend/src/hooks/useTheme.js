import { useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState("dark");
  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  const themeClass = theme === "dark" ? "theme-dark" : "theme-light";
  return { theme, toggleTheme, themeClass };
}
