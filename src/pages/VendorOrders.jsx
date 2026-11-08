import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function VendorOrders() {
  const navigate = useNavigate();
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')) || {});
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user.id || user.role !== 'vendor') { navigate('/'); return; }

    // Ilagay ang fetch logic sa loob ng useEffect
    fetch(`http://127.0.0.1:3000/api/orders?vendor_id=${user.id}`)
      .then(res => res.json())
      .then(data => setOrders(data));
  }, [navigate, user.id, user.role]);

  const updateStatus = async (id, newStatus) => {
    try {
      await fetch('http://127.0.0.1:3000/api/update_order_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, status: newStatus })
      });
      // I-refresh ang orders pagkatapos mag-update
      fetch(`http://127.0.0.1:3000/api/orders?vendor_id=${user.id}`)
        .then(res => res.json())
        .then(data => setOrders(data));
    } catch {
      alert('Failed to update status. Make sure LavaLust is running.');
    }
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
            <Link to="/vendor/menu">Menu Management</Link>
            <Link to="/vendor/orders" className="active">Incoming Orders</Link>
          </div>
          <div className="content-area">
            <h1>Incoming Orders</h1>
            <p className="page-sub">Manage and update the status of customer orders.</p>

            <div className="table-section">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Total</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Proof</th> {/* <-- BAGONG COLUMN */}
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>No orders yet.</td></tr>
                  ) : (
                    orders.map(o => (
                      <tr key={o.id}>
                        <td>#{o.id}</td>
                        <td>₱{parseFloat(o.total_amount).toFixed(2)}</td>
                        <td>{o.delivery_address}</td>
                        <td><span className={`badge ${o.status}`}>{o.status}</span></td>
                        <td>
                          {/* Kung delivered na at may proof, ipakita ang link */}
                          {o.proof_of_delivery ? (
                            <a 
                              href={o.proof_of_delivery} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: '#2563eb', textDecoration: 'underline', fontSize: '13px' }}
                            >
                              View Photo
                            </a>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '13px' }}>-</span>
                          )}
                        </td>
                        <td>
                          {o.status === 'pending' && (
                            <button className="btn-primary" style={{ padding: '5px 15px', width: 'auto', fontSize: '13px' }} onClick={() => updateStatus(o.id, 'preparing')}>
                              Accept
                            </button>
                          )}
                          {o.status === 'preparing' && (
                            <button className="btn-primary" style={{ padding: '5px 15px', width: 'auto', fontSize: '13px', background: '#10b981' }} onClick={() => updateStatus(o.id, 'ready')}>
                              Mark Ready
                            </button>
                          )}
                          {o.status === 'ready' && (
                            <span style={{ color: '#ea580c', fontWeight: '600', fontSize: '13px' }}>Waiting for Rider</span>
                          )}
                          {o.status === 'delivering' && (
                            <span style={{ color: '#10b981', fontWeight: '600', fontSize: '13px' }}>In Transit</span>
                          )}
                          {o.status === 'delivered' && (
                            <span style={{ color: '#94a3b8', fontSize: '13px' }}>Completed</span>
                          )}
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

export default VendorOrders;