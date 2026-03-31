import { useState } from 'react';
import { CloseIcon, TrashIcon } from './Icons.jsx';

export default function ConfirmModal({ product, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    try {
      await onConfirm(product.id);
    } finally {
      setDeleting(false);
    }
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Delete confirmation">
      <div className="modal confirm-modal" style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h2>Delete Product</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center' }}>
          <div className="confirm-icon">
            <TrashIcon />
          </div>
          <h3>Are you sure?</h3>
          <p>
            You are about to permanently delete{' '}
            <strong>&ldquo;{product?.name}&rdquo;</strong>. This action cannot be undone.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose} disabled={deleting}>
            Cancel
          </button>
          <button className="btn-danger" onClick={handleConfirm} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
