import { useState } from 'react';

function VendorSection({
  vendors,
  loading,
  error,
  creating,
  onCreateVendor,
  onUpdateVendor,
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes] = useState('');
  const [localError, setLocalError] = useState('');

  // edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    if (!name.trim() || !email.trim()) {
      setLocalError('Name and email are required');
      return;
    }

    onCreateVendor({ name, email, company, notes });

    setName('');
    setEmail('');
    setCompany('');
    setNotes('');
  };

  const startEdit = (vendor) => {
    setEditingId(vendor.id);
    setEditName(vendor.name || '');
    setEditEmail(vendor.email || '');
    setEditCompany(vendor.company || '');
    setEditNotes(vendor.notes || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditEmail('');
    setEditCompany('');
    setEditNotes('');
  };

  const saveEdit = () => {
    if (!editName.trim() || !editEmail.trim()) {
      setLocalError('Name and email are required for update');
      return;
    }
    onUpdateVendor(editingId, {
      name: editName,
      email: editEmail,
      company: editCompany,
      notes: editNotes,
    });
    cancelEdit();
  };

  return (
    <section className="section">
      <h2 className="section-heading">Vendor Management</h2>
      <p className="section-subtext">
        Maintain your vendor master data (who they are and how to contact them).
      </p>

      {localError && <div className="error-box">{localError}</div>}
      {error && <div className="error-box">{error}</div>}

      {/* Add vendor form */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Vendor Name *</label>
          <input
            type="text"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Apex Solutions"
          />
        </div>

        <div className="form-group">
          <label>Vendor Email *</label>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. contact@apex.com"
          />
        </div>

        <div className="form-row">
          <div className="form-group form-group--half">
            <label>Company</label>
            <input
              type="text"
              className="input"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Optional company name"
            />
          </div>
          <div className="form-group form-group--half">
            <label>Notes</label>
            <input
              type="text"
              className="input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Good for infra projects"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-secondary" disabled={creating}>
          {creating ? 'Adding vendor...' : 'Add Vendor'}
        </button>
      </form>

      {/* Vendor list */}
      <div className="rfp-list" style={{ marginTop: '1rem' }}>
        {loading ? (
          <div>Loading vendors...</div>
        ) : vendors.length === 0 ? (
          <div className="rfp-list-empty">
            No vendors yet. Add your first vendor above.
          </div>
        ) : (
          vendors.map((v) => {
            const isEditing = editingId === v.id;

            return (
              <article key={v.id} className="rfp-card">
                <div className="rfp-card-header">
                  <div>
                    {!isEditing ? (
                      <>
                        <h3 className="rfp-card-title">{v.name}</h3>
                        <p className="rfp-card-description">
                          {v.company || 'No company specified'}
                        </p>
                      </>
                    ) : (
                      <>
                        <input
                          className="input"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          style={{ marginBottom: '0.35rem' }}
                        />
                        <input
                          className="input"
                          value={editCompany}
                          onChange={(e) => setEditCompany(e.target.value)}
                          placeholder="Company"
                        />
                      </>
                    )}
                  </div>

                  <div className="rfp-card-meta">
                    {!isEditing ? (
                      <>
                        <div>
                          <strong>Email:</strong> {v.email}
                        </div>
                        {v.notes && (
                          <div className="rfp-card-meta-muted">
                            {v.notes}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <input
                          className="input"
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          placeholder="Email"
                          style={{ marginBottom: '0.35rem' }}
                        />
                        <input
                          className="input"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Notes"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="rfp-card-footer">
                  {!isEditing ? (
                    <button
                      type="button"
                      className="btn btn-tertiary"
                      onClick={() => startEdit(v)}
                    >
                      Edit
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={saveEdit}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn-tertiary"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

export default VendorSection;
