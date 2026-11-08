import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function VendorMenu() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', description: '', price: '' });
  const [search, setSearch] = useState(''); // <-- BAGONG STATE PARA SA SEARCH

  // Kunin ang totoong user para sa vendor_id
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')) || {});

  const fetchProducts = useCallback(() => {
    fetch('http://127.0.0.1:3000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  useEffect(() => {
    if (!user.id || user.role !== 'vendor') { navigate('/'); return; }
    fetchProducts();
  }, [navigate, user.id, user.role, fetchProducts]);

  // <-- BAGONG FILTER LOGIC
  const filteredProducts = products.filter(p => 
  p.name.toLowerCase().startsWith(search.toLowerCase())
);

  const handleAdd = () => {
    setFormData({ id: null, name: '', description: '', price: '' });
    setShowForm(true);
  };

  const handleEdit = (p) => {
    setFormData({ id: p.id, name: p.name, description: p.description, price: p.price });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await fetch(`http://127.0.0.1:3000/api/delete_product?id=${id}`);
      fetchProducts();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = formData.id ? 'http://127.0.0.1:3000/api/update_product' : 'http://127.0.0.1:3000/api/add_product';
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, vendor_id: user.id }) // <-- Gamitin ang totoong user.id
    });
    setShowForm(false);
    fetchProducts();
  };

  return (
    <div className="app-container">
      <div className="dashboard-layout">
        <div className="topbar">
          <div className="logo">Food<span>Link</span></div>
          <div className="user-info">
            <span className="role-badge vendor">Vendor</span>
            <span className="name">{user.name}</span>
            <Link to="/" className="signout">Sign out</Link>
          </div>
        </div>
        <div className="main-body">
          <div className="sidebar">
            <div className="section-label">Vendor</div>
            <Link to="/vendor">Dashboard</Link>
            <Link to="/vendor/menu" className="active">Menu Management</Link>
            <Link to="/vendor/orders">Incoming Orders</Link>
          </div>
          <div className="content-area">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h1>Menu Management</h1>
              <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} onClick={handleAdd}>+ Add Product</button>
            </div>

            {/* SEARCH BAR */}
            <div style={{ marginBottom: '20px' }}>
              <input 
                type="text" 
                placeholder="🔍 Search product..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ 
                  padding: '12px 16px', 
                  border: '1.5px solid #e2e8f0', 
                  borderRadius: '12px', 
                  width: '100%', 
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Form para sa Add/Edit */}
            {showForm && (
              <div className="table-section">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Name</label>
                    <div className="input-wrapper"><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <div className="input-wrapper"><input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
                  </div>
                  <div className="form-group">
                    <label>Price</label>
                    <div className="input-wrapper"><input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required /></div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>Save</button>
                    <button type="button" className="btn-primary" style={{ width: 'auto', padding: '10px 20px', background: '#e2e8f0', color: '#475569' }} onClick={() => setShowForm(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Products Table - gamit na ang filteredProducts */}
            <div className="table-section">
              <table>
                <thead><tr><th>Name</th><th>Description</th><th>Price</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center' }}>No products found.</td></tr>
                  ) : (
                    filteredProducts.map(p => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{p.description}</td>
                        <td>₱{p.price}</td>
                        <td>
                          <a style={{ color: '#2563eb', cursor: 'pointer', marginRight: '10px' }} onClick={() => handleEdit(p)}>Edit</a>
                          <a style={{ color: '#ef4444', cursor: 'pointer' }} onClick={() => handleDelete(p.id)}>Delete</a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorMenu;