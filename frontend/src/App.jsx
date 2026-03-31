import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import StatsBar from './components/StatsBar.jsx';
import ProductTable from './components/ProductTable.jsx';
import ProductModal from './components/ProductModal.jsx';
import ConfirmModal from './components/ConfirmModal.jsx';
import Toast from './components/Toast.jsx';
import { InventoryIcon, SearchIcon, PlusIcon, AlertIcon } from './components/Icons.jsx';

const API = '/api';

let toastId = 0;

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [addEditModal, setAddEditModal] = useState(null); // null | 'add' | product object
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toasts, setToasts] = useState([]);
  const searchDebounce = useRef(null);
  const [searchInput, setSearchInput] = useState('');

  function addToast(message, type = 'success') {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, type }]);
  }

  function removeToast(id) {
    setToasts((t) => t.filter((x) => x.id !== id));
  }

  const fetchProducts = useCallback(async (q = search, cat = categoryFilter) => {
    try {
      const params = new URLSearchParams();
      if (q) params.set('search', q);
      if (cat) params.set('category', cat);
      const res = await fetch(`${API}/products?${params}`);
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      setProducts(data);
      setFetchError(null);
    } catch (err) {
      setFetchError(err.message);
    }
  }, [search, categoryFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API}/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (_e) {
      // silently ignore category fetch failures
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProducts(), fetchCategories()]).finally(() => setLoading(false));
    // fetchProducts and fetchCategories are stable references wrapped in useCallback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearchChange(e) {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setSearch(val);
      fetchWithFilters(val, categoryFilter);
    }, 300);
  }

  function handleCategoryChange(e) {
    const val = e.target.value;
    setCategoryFilter(val);
    fetchWithFilters(search, val);
  }

  async function fetchWithFilters(q, cat) {
    const params = new URLSearchParams();
    if (q) params.set('search', q);
    if (cat) params.set('category', cat);
    try {
      const res = await fetch(`${API}/products?${params}`);
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      setProducts(data);
      setFetchError(null);
    } catch (err) {
      setFetchError(err.message);
    }
  }

  async function handleSaveProduct(formData) {
    const isEditing = addEditModal && typeof addEditModal === 'object';
    try {
      const res = await fetch(
        isEditing ? `${API}/products/${addEditModal.id}` : `${API}/products`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        addToast(err.error || 'Failed to save product.', 'error');
        return;
      }
      setAddEditModal(null);
      await Promise.all([fetchWithFilters(search, categoryFilter), fetchCategories()]);
      addToast(isEditing ? 'Product updated successfully.' : 'Product added successfully.');
    } catch {
      addToast('Network error. Please try again.', 'error');
    }
  }

  async function handleDeleteConfirm(id) {
    try {
      const res = await fetch(`${API}/products/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        addToast('Failed to delete product.', 'error');
        return;
      }
      setDeleteTarget(null);
      await fetchWithFilters(search, categoryFilter);
      addToast('Product deleted.');
    } catch {
      addToast('Network error. Please try again.', 'error');
    }
  }

  async function handleUpdateQuantity(id, quantity) {
    try {
      const res = await fetch(`${API}/products/${id}/quantity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) {
        addToast('Failed to update quantity.', 'error');
        return;
      }
      const updated = await res.json();
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? updated : p))
      );
    } catch {
      addToast('Network error. Please try again.', 'error');
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <InventoryIcon />
          <h1>Inventory Manager</h1>
        </div>
        <button className="btn-primary" onClick={() => setAddEditModal('add')}>
          <PlusIcon /> Add Product
        </button>
      </header>

      <main className="main">
        {!loading && !fetchError && <StatsBar products={products} />}

        {fetchError && (
          <div className="error-banner" role="alert">
            <AlertIcon />
            <span>{fetchError} — Make sure the backend server is running on port 3001.</span>
          </div>
        )}

        <div className="toolbar">
          <div className="search-wrapper">
            <SearchIcon />
            <input
              className="search-input"
              type="search"
              placeholder="Search products by name, description or SKU…"
              value={searchInput}
              onChange={handleSearchChange}
              aria-label="Search products"
            />
          </div>
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={handleCategoryChange}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="table-wrapper">
          <div className="table-header">
            <h2>Products</h2>
            <span className="count-badge">{products.length} item{products.length !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner" role="status" aria-label="Loading products" />
            </div>
          ) : (
            <ProductTable
              products={products}
              onEdit={(p) => setAddEditModal(p)}
              onDelete={(p) => setDeleteTarget(p)}
              onUpdateQuantity={handleUpdateQuantity}
            />
          )}
        </div>
      </main>

      {addEditModal !== null && (
        <ProductModal
          product={addEditModal === 'add' ? null : addEditModal}
          categories={categories}
          onSave={handleSaveProduct}
          onClose={() => setAddEditModal(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          product={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
