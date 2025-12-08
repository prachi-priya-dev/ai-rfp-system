function RfpForm({
  title,
  description,
  budget,
  deadline,
  error,
  creating,
  onTitleChange,
  onDescriptionChange,
  onBudgetChange,
  onDeadlineChange,
  onSubmit,
}) {
  return (
    <section className="section section--plain">
      <h2 className="section-heading">Create New RFP</h2>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={onSubmit}>
        <div className="form-field">
          <label className="label">Title *</label>
          <input
            type="text"
            className="input"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g., Website Redesign for E-commerce Brand"
          />
        </div>

        <div className="form-field">
          <label className="label">Description *</label>
          <textarea
            className="textarea textarea--medium"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Describe the project requirements, scope, expectations..."
          />
        </div>

        <div className="form-row">
          <div className="form-field form-col">
            <label className="label">Budget (optional)</label>
            <input
              type="number"
              className="input"
              value={budget}
              onChange={(e) => onBudgetChange(e.target.value)}
              placeholder="e.g., 20000"
            />
          </div>

          <div className="form-field form-col">
            <label className="label">Deadline (optional)</label>
            <input
              type="date"
              className="input"
              value={deadline}
              onChange={(e) => onDeadlineChange(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn" disabled={creating}>
          {creating ? 'Creating...' : 'Create RFP'}
        </button>
      </form>
    </section>
  );
}

export default RfpForm;
