function BackendHealth({ health, onCheck }) {
  return (
    <section className="section">
      <h2 className="section-heading">Backend Health</h2>

      <button className="btn" onClick={onCheck}>
        Check Backend Health
      </button>

      {health && <pre className="code-block">{health}</pre>}
    </section>
  );
}

export default BackendHealth;
