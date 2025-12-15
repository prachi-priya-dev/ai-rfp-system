function RfpForm({
  title,
  description,
  budget,
  budgetCurrency,
  deadline,
  error,
  creating,
  vendors,
  selectedVendorIds,
  onTitleChange,
  onDescriptionChange,
  onBudgetChange,
  onBudgetCurrencyChange,
  onDeadlineChange,
  onToggleVendor,
  onSubmit,
  mode,
  onCancelEdit,
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

        {vendors && vendors.length > 0 && (
          <div className="form-group">
            <label>Select Vendors (optional)</label>
            <div className="vendor-choices">
              {vendors.map((v) => (
                <label key={v.id} className="vendor-pill">
                  <input
                    type="checkbox"
                    checked={selectedVendorIds.includes(v.id)}
                    onChange={() => onToggleVendor(v.id)}
                  />
                  <span>
                    {v.name} ({v.email})
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={creating}>
          {creating
            ? mode === "edit"
              ? "Updating..."
              : "Creating..."
            : mode === "edit"
            ? "Update RFP"
            : "Create RFP"}
        </button>

        {mode === "edit" && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancelEdit}
            style={{ marginLeft: "0.75rem" }}
          >
            Cancel
          </button>
        )}
      </form>
    </section>
  );
}

export default RfpForm;
