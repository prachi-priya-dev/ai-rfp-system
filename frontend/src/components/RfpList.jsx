function RfpList({ rfps, loading }) {
  return (
    <section className="section section--plain">
      <h2 className="section-heading">Existing RFPs</h2>

      {loading ? (
        <p>Loading RFPs...</p>
      ) : rfps.length === 0 ? (
        <p className="rfp-list-empty">No RFPs yet. Create one above.</p>
      ) : (
        <div className="rfp-list">
          {rfps.map((rfp) => (
            <div key={rfp.id} className="rfp-card">
              <div className="rfp-card-header">
                <div>
                  <h3 className="rfp-card-title">{rfp.title}</h3>
                  <p className="rfp-card-description">{rfp.description}</p>
                </div>
                <div className="rfp-card-meta">
                  {rfp.budget != null && (
                    <div>
                      <strong>Budget:</strong> ₹{rfp.budget}
                    </div>
                  )}
                  {rfp.deadline && (
                    <div>
                      <strong>Deadline:</strong> {rfp.deadline}
                    </div>
                  )}
                  <div className="rfp-card-meta-muted">
                    Created:{' '}
                    {rfp.createdAt
                      ? new Date(rfp.createdAt).toLocaleString()
                      : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default RfpList;
