import { useState } from 'react';
import { EditIcon, TrashIcon, EmptyBoxIcon } from './Icons.jsx';

function getCategoryClass(category) {
  if (!category) return '';
  const lower = category.toLowerCase();
  if (lower.includes('electron')) return 'electronics';
  if (lower.includes('furni')) return 'furniture';
  if (lower.includes('health') || lower.includes('fitness')) return 'health';
  if (lower.includes('station')) return 'stationery';
  return '';
}

function QuantityControl({ product, onUpdateQuantity }) {
  const [value, setValue] = useState(String(product.quantity));
  const [saving, setSaving] = useState(false);

  async function commit(newVal) {
    const qty = parseInt(newVal, 10);
    if (isNaN(qty) || qty < 0 || qty === product.quantity) {
      setValue(String(product.quantity));
      return;
    }
    setSaving(true);
    await onUpdateQuantity(product.id, qty);
    setSaving(false);
  }

  function handleBlur() {
    commit(value);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') e.target.blur();
    if (e.key === 'Escape') { setValue(String(product.quantity)); e.target.blur(); }
  }

  function handleDecrement() {
    const newVal = Math.max(0, product.quantity - 1);
    setValue(String(newVal));
    onUpdateQuantity(product.id, newVal);
  }

  function handleIncrement() {
    const newVal = product.quantity + 1;
    setValue(String(newVal));
    onUpdateQuantity(product.id, newVal);
  }

  return (
    <div className="qty-control" style={{ opacity: saving ? 0.6 : 1 }}>
      <button className="qty-btn" onClick={handleDecrement} disabled={saving || product.quantity === 0} aria-label="Decrease quantity">
        −
      </button>
      <input
        className="qty-input"
        type="number"
        min="0"
        value={saving ? '…' : value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={saving}
        aria-label={`Quantity for ${product.name}`}
      />
      <button className="qty-btn" onClick={handleIncrement} disabled={saving} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}

export default function ProductTable({ products, onEdit, onDelete, onUpdateQuantity }) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <EmptyBoxIcon />
        <h3>No products found</h3>
        <p>Try adjusting your search or filters, or add a new product.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table" role="table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <div className="product-name">{product.name}</div>
                {product.description && (
                  <div className="product-desc" title={product.description}>
                    {product.description}
                  </div>
                )}
              </td>
              <td>
                {product.category ? (
                  <span className={`category-badge ${getCategoryClass(product.category)}`}>
                    {product.category}
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>—</span>
                )}
              </td>
              <td>
                {product.sku ? (
                  <span className="sku-badge">{product.sku}</span>
                ) : (
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>—</span>
                )}
              </td>
              <td className="price-cell">
                ${Number(product.price).toFixed(2)}
              </td>
              <td>
                <QuantityControl
                  product={product}
                  onUpdateQuantity={onUpdateQuantity}
                />
              </td>
              <td>
                <div className="actions-cell">
                  <button
                    className="btn-icon edit"
                    onClick={() => onEdit(product)}
                    title="Edit product"
                    aria-label={`Edit ${product.name}`}
                  >
                    <EditIcon />
                  </button>
                  <button
                    className="btn-icon danger"
                    onClick={() => onDelete(product)}
                    title="Delete product"
                    aria-label={`Delete ${product.name}`}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
