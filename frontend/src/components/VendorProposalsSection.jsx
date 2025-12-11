// frontend/src/components/VendorProposalsSection.jsx
function VendorProposalsSection({
  rfps,
  selectedRfpId,
  onSelectedRfpChange,
  vendorsForRfp,
  selectedVendorId,
  onSelectedVendorChange,
  vendorName,
  vendorEmail,
  proposalText,
  onVendorNameChange,
  onVendorEmailChange,
  onProposalTextChange,
  onSubmitProposal,
  creating,
  error,
  proposals,
  loadingProposals,
}) {
  const handleSelectRfp = (e) => {
    const value = e.target.value;
    onSelectedRfpChange(value ? Number(value) : '');
  };

  const handleSelectVendor = (e) => {
    const value = e.target.value;
    onSelectedVendorChange(value ? Number(value) : '');
  };

  return (
    <section className="section">
      <h2 className="section-heading">Vendor Proposals</h2>
      <p className="section-subtext">
        Paste the vendor&apos;s email response for a specific RFP and let the
        system extract pricing and timeline automatically.
      </p>

      {error && <div className="error-box">{error}</div>}

      {/* RFP selector */}
      <div className="form-group">
        <label>Select RFP</label>
        {rfps.length === 0 ? (
          <div className="rfp-list-empty">
            No RFPs yet. Create an RFP first, then you can attach proposals
            here.
          </div>
        ) : (
          <select
            className="input"
            value={selectedRfpId || ''}
            onChange={handleSelectRfp}
          >
            <option value="">Choose an RFP...</option>
            {rfps.map((rfp) => (
              <option key={rfp.id} value={rfp.id}>
                {rfp.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Only show vendor + form when an RFP is selected */}
      {selectedRfpId && (
        <>
          {/* Vendor selector (optional) */}
          <div className="form-group">
            <label>Linked vendor (optional)</label>
            {vendorsForRfp.length === 0 ? (
              <div className="rfp-list-empty">
                No vendors linked to this RFP yet. You can still type vendor
                details manually below.
              </div>
            ) : (
              <select
                className="input"
                value={selectedVendorId || ''}
                onChange={handleSelectVendor}
              >
                <option value="">Choose a vendor or type manually...</option>
                {vendorsForRfp.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}{' '}
                    {v.email ? `(${v.email})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Proposal form */}
          <form onSubmit={onSubmitProposal}>
            <div className="form-row">
              <div className="form-group form-group--half">
                <label>Vendor Name</label>
                <input
                  type="text"
                  className="input"
                  value={vendorName}
                  onChange={(e) => onVendorNameChange(e.target.value)}
                  placeholder="e.g. Apex Solutions"
                />
              </div>
              <div className="form-group form-group--half">
                <label>Vendor Email</label>
                <input
                  type="email"
                  className="input"
                  value={vendorEmail}
                  onChange={(e) => onVendorEmailChange(e.target.value)}
                  placeholder="e.g. bids@apex.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Vendor email text (proposal body) *</label>
              <textarea
                className="textarea"
                rows={6}
                value={proposalText}
                onChange={(e) => onProposalTextChange(e.target.value)}
                placeholder="Paste the vendor's email response here..."
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating}
            >
              {creating ? 'Saving & parsing...' : 'Save & Parse Proposal'}
            </button>
          </form>
        </>
      )}

      {/* Proposals list */}
      <div className="rfp-list" style={{ marginTop: '1rem' }}>
        {selectedRfpId && (
          <>
            <h3 className="section-subheading">
              Proposals for selected RFP
            </h3>
            {loadingProposals ? (
              <div>Loading proposals...</div>
            ) : proposals.length === 0 ? (
              <div className="rfp-list-empty">
                No proposals yet for this RFP. Paste a vendor response above to
                create the first one.
              </div>
            ) : (
              proposals.map((p) => (
                <article key={p.id} className="rfp-card">
                  <div className="rfp-card-header">
                    <div>
                      <h3 className="rfp-card-title">
                        {p.vendorName || 'Unknown vendor'}
                      </h3>
                      <p className="rfp-card-description">
                        {p.vendorEmail || 'No email specified'}
                      </p>
                    </div>
                    <div className="rfp-card-meta">
                      <div>
                        <strong>Amount:</strong>{' '}
                        {p.amount != null
                          ? `${p.currency || ''} ${p.amount}`
                          : 'Not detected'}
                      </div>
                      {p.parsed && p.parsed.timeline && (
                        <div className="rfp-card-meta-muted">
                          Timeline: {p.parsed.timeline}
                        </div>
                      )}
                      <div className="rfp-card-meta-muted">
                        Received:{' '}
                        {new Date(p.createdAt).toLocaleString(undefined, {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>

                  {p.parsed && p.parsed.summary && (
                    <div className="rfp-card-body">
                      <strong>Summary:</strong>
                      <p>{p.parsed.summary}</p>
                    </div>
                  )}

                  {!p.parsed && (
                    <div className="rfp-card-body">
                      <strong>Raw excerpt:</strong>
                      <p>
                        {p.rawText.length > 200
                          ? p.rawText.slice(0, 200) + '...'
                          : p.rawText}
                      </p>
                    </div>
                  )}
                </article>
              ))
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default VendorProposalsSection;
