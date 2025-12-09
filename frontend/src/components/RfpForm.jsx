function RfpForm({
  title,
  description,
  budget,
  budgetCurrency,
  deadline,
  error,
  creating,
  onTitleChange,
  onDescriptionChange,
  onBudgetChange,
  onBudgetCurrencyChange,
  onDeadlineChange,
  onSubmit,
}) {
  return (
    <section className="section">
      <h2 className="section-heading">Create New RFP</h2>
      <p className="section-subtext">
        Fill in the details below to create a new RFP entry.
      </p>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            className="input"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g. Website + Mobile App for Grocery Chain"
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            className="textarea"
            rows={5}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Short description of the RFP..."
          />
        </div>

        <div className="form-row">
          <div className="form-group form-group--half">
            <label>Budget</label>
            <input
              type="number"
              className="input"
              value={budget}
              onChange={(e) => onBudgetChange(e.target.value)}
              placeholder="e.g. 75000"
            />
          </div>

          <div className="form-group form-group--half">
            <label>Currency</label>
            <select
              className="input"
              value={budgetCurrency}
              onChange={(e) => onBudgetCurrencyChange(e.target.value)}
            >
              <option value="">Select currency</option>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Deadline</label>
          <input
            type="date"
            className="input"
            value={deadline}
            onChange={(e) => onDeadlineChange(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={creating}>
          {creating ? 'Creating...' : 'Create RFP'}
        </button>
      </form>
    </section>
  );
}

export default RfpForm;
