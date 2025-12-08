function AiAssistSection({
  aiText,
  aiResult,
  aiError,
  aiLoading,
  onAiTextChange,
  onParseClick,
  onApplyAiResult,
}) {
  return (
    <section className="section">
      <h2 className="section-heading">AI Assist: Parse RFP Text</h2>
      <p className="section-subtext">
        Paste a long, unstructured RFP (for example, from an email or PDF), and
        let the system convert it into structured fields.
      </p>

      {aiError && <div className="error-box">{aiError}</div>}

      <div className="form-field">
        <label className="label">Unstructured RFP text</label>
        <textarea
          className="textarea textarea--large"
          value={aiText}
          onChange={(e) => onAiTextChange(e.target.value)}
          placeholder="Paste a detailed RFP email or document text here..."
        />
      </div>

      <button
        type="button"
        className="btn"
        onClick={onParseClick}
        disabled={aiLoading}
      >
        {aiLoading ? 'Analyzing...' : 'Generate Structured RFP'}
      </button>

      {aiResult && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 className="section-heading" style={{ fontSize: '1rem' }}>
            AI Output (Structured JSON)
          </h3>
          <pre className="ai-output">
            {JSON.stringify(aiResult, null, 2)}
          </pre>

          <button
            type="button"
            className="btn"
            style={{ marginTop: '0.75rem' }}
            onClick={onApplyAiResult}
          >
            Use this data in RFP form
          </button>
        </div>
      )}
    </section>
  );
}

export default AiAssistSection;
