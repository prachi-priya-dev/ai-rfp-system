function formatBudget(budget, currency) {
  if (budget == null) return '—';

  const symbolMap = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
  };

  const symbol = symbolMap[currency] || '';
  const formattedNumber = Number(budget).toLocaleString('en-IN');

  if (symbol && currency) {
    return `${symbol}${formattedNumber} ${currency}`;
  }
  if (currency) {
    return `${formattedNumber} ${currency}`;
  }
  return formattedNumber;
}

function formatDateTime(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleString('en-GB'); // DD/MM/YYYY, HH:MM:SS
}

function RfpList({ rfps, loading, searchTerm, onSearchChange, onSendRfp }) {
  return (
    <section className="section">
      <h2 className="section-heading">Existing RFPs</h2>
      <p className="section-subtext">
        Browse RFPs you&apos;ve created. Use search to filter by title,
        description, budget, currency, or deadline.
      </p>

      <div className="rfp-search">
        <input
          type="text"
          className="rfp-search-input"
          placeholder="Search RFPs by title, description, budget or deadline..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {loading ? (
        <div>Loading RFPs...</div>
      ) : rfps.length === 0 ? (
        <div className="rfp-list-empty">No RFPs yet. Create your first one above.</div>
      ) : (
        <div className="rfp-list">
          {rfps.map((rfp) => (
            <article key={rfp.id} className="rfp-card">
              <div className="rfp-card-header">
                <div>
                  <h3 className="rfp-card-title">{rfp.title}</h3>
                  <p className="rfp-card-description">{rfp.description}</p>
                </div>
                <div className="rfp-card-meta">
                  {rfp.budget != null && (
                    <div>
                      <strong>Budget:</strong>{' '}
                      {formatBudget(rfp.budget, rfp.budgetCurrency)}
                    </div>
                  )}
                  {rfp.deadline && (
                    <div>
                      <strong>Deadline:</strong> {rfp.deadline}
                    </div>
                  )}
                  <div className="rfp-card-meta-muted">
                    Created: {formatDateTime(rfp.createdAt)}
                  </div>
                  {rfp.vendorCount > 0 && (
    <div className="rfp-card-meta-muted">
      <strong>Vendors:</strong>{' '}
      {rfp.vendorNames || `${rfp.vendorCount} selected`}
    </div>
  )}
          <div className="rfp-card-footer">
          <button
            type="button"
            className="btn btn-tertiary"
            onClick={() => onSendRfp(rfp.id)}
            disabled={rfp.vendorCount === 0}
          >
            {rfp.vendorCount === 0
              ? 'No vendors linked'
              : `Send to ${rfp.vendorCount} vendor(s)`}
          </button>
        </div>

                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default RfpList;
