import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function DeliveryTasks() {
  const navigate = useNavigate();
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')) || {});
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchOrders = useCallback(() => {
    if (!user.id) return;
    // Kunin LAHAT ng orders para makita ang "ready" na hindi pa naka-assign
    fetch(`http://127.0.0.1:3000/api/orders`)
      .then(res => res.json())
      .then(data => {
        // Ipakita ang orders kung:
        // 1. "ready" (pwede pang kunin ng kahit sinong rider)
        // 2. "delivering" at naka-assign sa rider na ito
        // 3. "delivered" at naka-assign sa rider na ito
        const filtered = data.filter(o => 
          o.status === 'ready' || 
          (o.status === 'delivering' && o.rider_id == user.id) ||
          (o.status === 'delivered' && o.rider_id == user.id)
        );
        setOrders(filtered);
      });
  }, [user.id]);

  useEffect(() => {
    if (!user.id || user.role !== 'delivery') { navigate('/'); return; }
    fetchOrders();
  }, [navigate, user.id, user.role, fetchOrders]);

  const handlePickUp = async (id) => {
    try {
      await fetch('http://127.0.0.1:3000/api/update_order_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: id, 
          status: 'delivering',
          rider_id: user.id 
        })
      });
      fetchOrders(); // I-refresh ang listahan pagkatapos mag-update
    } catch {
      alert('Failed to pick up. Make sure LavaLust is running.');
    }
  };

  const handleDeliver = async (e) => {
  e.preventDefault();
  if (!proofFile) { alert('Please upload a proof of delivery.'); return; }
  
  setUploading(true);

  const formData = new FormData();
  formData.append('file', proofFile);
  formData.append('upload_preset', 'foodlink_pod');

  try {
    const cloudinaryRes = await fetch('https://api.cloudinary.com/v1_1/t6rybwv1/image/upload', {
      method: 'POST',
      body: formData
    });
    const cloudinaryData = await cloudinaryRes.json();
    
    if (!cloudinaryData.secure_url) {
      throw new Error(cloudinaryData.error?.message || 'Cloudinary upload failed');
    }

    const response = await fetch('http://127.0.0.1:3000/api/update_order_status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: selectedOrder.id, 
        status: 'delivered',
        proof_of_delivery: cloudinaryData.secure_url // <-- Cloudinary URL
      })
    });
    const data = await response.json();

    if (data.status === 'success') {
      alert('Order Delivered! Proof uploaded.');
      setSelectedOrder(null);
      setProofFile(null);
      fetchOrders();
    } else {
      alert('Error: ' + data.message);
    }
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    setUploading(false);
  }
};

  return (
    <div className="app-container">
      <div className="dashboard-layout">
        <div className="topbar">
          <div className="logo">Food<span>Link</span></div>
          <div className="user-info">
            <span className="role-badge delivery">Delivery</span>
            <span className="name">{user.name}</span>
            <Link to="/" className="signout">Sign out</Link>
          </div>
        </div>
        <div className="main-body">
          <div className="sidebar">
            <div className="section-label">Delivery</div>
            <Link to="/delivery">Dashboard</Link>
            <Link to="/delivery/tasks" className="active">Assigned Deliveries</Link>
          </div>
          <div className="content-area">
            <h1>Assigned Deliveries</h1>
            <p className="page-sub">All deliveries assigned to you.</p>

            <div className="table-section">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center' }}>No assigned tasks.</td></tr>
                  ) : (
                    orders.map(o => (
                      <tr key={o.id}>
                        <td>#{o.id}</td>
                        <td>{o.delivery_address}</td>
                        <td><span className={`badge ${o.status}`}>{o.status}</span></td>
                        <td>
                          {o.status === 'ready' && (
                            <button className="btn-primary" style={{ padding: '5px 15px', width: 'auto', fontSize: '13px' }} onClick={() => handlePickUp(o.id)}>
                              Pick Up
                            </button>
                          )}
                          {o.status === 'delivering' && o.rider_id == user.id && (
                            <button className="btn-primary" style={{ padding: '5px 15px', width: 'auto', fontSize: '13px', background: '#10b981' }} onClick={() => setSelectedOrder(o)}>
                              Mark Delivered
                            </button>
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

            {/* Modal para sa Proof of Delivery */}
            {selectedOrder && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="table-section" style={{ maxWidth: '400px', width: '100%', margin: '20px' }}>
                  <h3>Proof of Delivery</h3>
                  <p style={{ fontSize: '14px', marginBottom: '15px' }}>Upload a photo for Order #{selectedOrder.id}.</p>
                  
                  <form onSubmit={handleDeliver}>
                    <div className="form-group">
                      <label>Take Photo (Camera)</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        onChange={(e) => setProofFile(e.target.files[0])} 
                        style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', width: '100%' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" className="btn-primary" disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Submit Proof'}
                      </button>
                      <button type="button" className="btn-primary" style={{ background: '#e2e8f0', color: '#475569' }} onClick={() => { setSelectedOrder(null); setProofFile(null); }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeliveryTasks;