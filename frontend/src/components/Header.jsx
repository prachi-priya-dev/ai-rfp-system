function Header({ theme, onToggleTheme }) {
  const isDark = theme === 'dark';

  return (
    <header className="header">
      <div>
        <h1 className="header-title">AI-Powered RFP Management System</h1>
        <p className="header-subtitle">
          Step 3: Use AI Assist to parse unstructured RFP text into structured
          data.
        </p>
      </div>

      <button
        type="button"
        className="theme-toggle"
        onClick={onToggleTheme}
        aria-label="Toggle light or dark theme"
      >
        {isDark ? '☀️ Light mode' : '🌙 Dark mode'}
      </button>
    </header>
  );
}

export default Header;
