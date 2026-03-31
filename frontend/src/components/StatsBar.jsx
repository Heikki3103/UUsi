import { BoxIcon, TagIcon, DollarIcon, AlertIcon } from './Icons.jsx';

export default function StatsBar({ products }) {
  const totalProducts = products.length;
  const totalValue = products.reduce((s, p) => s + p.quantity * p.price, 0);
  const lowStockCount = products.filter((p) => p.quantity > 0 && p.quantity <= 10).length;
  const categories = new Set(products.map((p) => p.category).filter(Boolean)).size;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon blue">
          <BoxIcon />
        </div>
        <div className="stat-info">
          <p>Products</p>
          <h3>{totalProducts}</h3>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon purple">
          <TagIcon />
        </div>
        <div className="stat-info">
          <p>Categories</p>
          <h3>{categories}</h3>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon green">
          <DollarIcon />
        </div>
        <div className="stat-info">
          <p>Stock Value</p>
          <h3>${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon amber">
          <AlertIcon />
        </div>
        <div className="stat-info">
          <p>Low Stock</p>
          <h3>{lowStockCount}</h3>
        </div>
      </div>
    </div>
  );
}
