import { useState, useEffect } from 'react';
import { CloseIcon } from './Icons.jsx';

const EMPTY_FORM = {
  name: '',
  description: '',
  category: '',
  sku: '',
  quantity: '0',
  price: '0',
};

export default function ProductModal({ product, categories, onSave, onClose }) {
  const isEditing = Boolean(product);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name ?? '',
        description: product.description ?? '',
        category: product.category ?? '',
        sku: product.sku ?? '',
        quantity: String(product.quantity ?? 0),
        price: String(product.price ?? 0),
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [product]);

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    const qty = parseInt(form.quantity, 10);
    if (isNaN(qty) || qty < 0) errs.quantity = 'Must be a non-negative whole number.';
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) errs.price = 'Must be a non-negative number.';
    return errs;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => { const n = { ...e }; delete n[name]; return n; });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        sku: form.sku.trim(),
        quantity: parseInt(form.quantity, 10),
        price: parseFloat(form.price),
      });
    } finally {
      setSaving(false);
    }
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label={isEditing ? 'Edit product' : 'Add product'}>
      <div className="modal">
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <CloseIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label" htmlFor="pm-name">
                  Name <span className="required">*</span>
                </label>
                <input
                  id="pm-name"
                  name="name"
                  className={`form-input${errors.name ? ' error' : ''}`}
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Wireless Keyboard"
                  autoFocus
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div className="form-group full-width">
                <label className="form-label" htmlFor="pm-description">
                  Description
                </label>
                <input
                  id="pm-description"
                  name="description"
                  className="form-input"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Short product description"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="pm-category">
                  Category
                </label>
                <input
                  id="pm-category"
                  name="category"
                  className="form-input"
                  value={form.category}
                  onChange={handleChange}
                  list="category-list"
                  placeholder="e.g. Electronics"
                />
                <datalist id="category-list">
                  {categories.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="pm-sku">
                  SKU
                </label>
                <input
                  id="pm-sku"
                  name="sku"
                  className="form-input"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="e.g. ELEC-KB-001"
                />
                <span className="form-hint">Leave blank to skip</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="pm-quantity">
                  Quantity <span className="required">*</span>
                </label>
                <input
                  id="pm-quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                  className={`form-input${errors.quantity ? ' error' : ''}`}
                  value={form.quantity}
                  onChange={handleChange}
                />
                {errors.quantity && <span className="form-error">{errors.quantity}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="pm-price">
                  Price ($) <span className="required">*</span>
                </label>
                <input
                  id="pm-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  className={`form-input${errors.price ? ' error' : ''}`}
                  value={form.price}
                  onChange={handleChange}
                />
                {errors.price && <span className="form-error">{errors.price}</span>}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
