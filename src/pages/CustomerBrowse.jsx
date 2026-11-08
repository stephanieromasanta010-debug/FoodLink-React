import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function CustomerBrowse() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState(''); // <-- BAGONG STATE PARA SA SEARCH

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'customer') { navigate('/'); return; }
    fetch('http://127.0.0.1:3000/api/products').then(res => res.json()).then(data => setProducts(data));
  }, [navigate]);

  // <-- BAGONG FILTER LOGIC
  const filteredProducts = products.filter(p => 
  p.name.toLowerCase().startsWith(search.toLowerCase())
);

  const handleAddToCart = (product, quantity) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    for (let i = 0; i < quantity; i++) {
      cart.push(product);
    }
    localStorage.setItem('cart', JSON.stringify(cart));

    setSuccessMsg(`${quantity}x ${product.name} added to cart!`);
  };

  return (
    <div className="app-container">
      <div className="dashboard-layout">
        <div className="topbar">
          <div className="logo">Food<span>Link</span></div>
          <div className="user-info">
            <span className="role-badge customer">Customer</span>
            <span className="name">{JSON.parse(localStorage.getItem('user'))?.name || 'Customer'}</span>
            <Link to="/" className="signout">Sign out</Link>
          </div>
        </div>
        <div className="main-body">
          <div className="sidebar">
            <div className="section-label">Customer</div>
            <Link to="/customer">Dashboard</Link>
            <Link to="/customer/browse" className="active">Browse Food</Link>
            <Link to="/customer/orders">My Orders</Link>
          </div>
          <div className="content-area">
            <h1>Browse Food</h1>
            <p className="page-sub">Order from local food businesses near you.</p>

            {/* SEARCH BAR */}
            <div style={{ marginBottom: '20px' }}>
              <input 
                type="text" 
                placeholder="🔍 Search food..." 
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

            {/* SUCCESS MESSAGE */}
            {successMsg && (
              <div style={{ background: '#d1fae5', color: '#059669', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #34d399', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{successMsg}</span>
                <Link to="/customer/checkout" style={{ fontWeight: 'bold', textDecoration: 'none', color: '#059669', background: '#fff', padding: '5px 15px', borderRadius: '5px' }}>
                  Go to Checkout →
                </Link>
              </div>
            )}

            {/* PRODUCT GRID - ginagamit na ang filteredProducts */}
            {filteredProducts.length === 0 ? (
              <p>No products found for "{search}".</p>
            ) : (
              <div className="product-grid">
                {filteredProducts.map(p => {
                  const qtyId = `qty-${p.id}`;
                  return (
                    <div key={p.id} className="stat-card" style={{ display: 'flex', flexDirection: 'column' }}>
                      <div className="label" style={{ color: '#ea580c', fontWeight: '600' }}>Vendor ID: {p.vendor_id}</div>
                      <div className="value" style={{ fontSize: '20px', marginBottom: '5px' }}>{p.name}</div>
                      <div className="sub" style={{ marginBottom: '15px' }}>{p.description}</div>
                      <div className="value" style={{ marginTop: 'auto', marginBottom: '15px' }}>₱{parseFloat(p.price).toFixed(2)}</div>
                      
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                          type="number" 
                          id={qtyId} 
                          defaultValue="1" 
                          min="1" 
                          style={{ width: '60px', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', textAlign: 'center' }}
                        />
                        <button 
                          className="btn-primary" 
                          style={{ flex: 1, padding: '10px' }}
                          onClick={() => {
                            const qty = parseInt(document.getElementById(qtyId).value) || 1;
                            handleAddToCart(p, qty);
                          }}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerBrowse;