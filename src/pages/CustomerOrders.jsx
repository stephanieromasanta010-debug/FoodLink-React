import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const verifiedRef = useRef(false);

  const fetchOrders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    fetch(`${API_URL}/api/orders?customer_id=${user.id}`)
      .then(res => res.json())
      .then(data => setOrders(data));
  };

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (sessionId && !verifiedRef.current) {
      verifiedRef.current = true;
      
      fetch(`${API_URL}/api/verify_payment?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            alert('Payment Successful! Order placed.');
            fetchOrders();
            setSearchParams({});
          }
        })
        .catch(err => console.error("Verify error:", err));
    } else {
      fetchOrders();
    }
  }, [searchParams, setSearchParams]);

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
            <Link to="/customer/browse">Browse Food</Link>
            <Link to="/customer/orders" className="active">My Orders</Link>
          </div>
          <div className="content-area">
            <h1>My Orders</h1>
            <p className="page-sub">Track your current and past orders.</p>

            <div className="table-section">
              <h3>Order History</h3>
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Total</th>
                    <th>Address</th>
                    <th>Payment Method</th>
                    <th>Payment Status</th>
                    <th>Status</th>
                    <th>Proof of Delivery</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan="8" style={{ textAlign: 'center' }}>No orders yet. <Link to="/customer/browse">Browse Food</Link></td></tr>
                  ) : (
                    orders.map(o => (
                      <tr key={o.id}>
                        <td>#{o.id}</td>
                        <td>₱{parseFloat(o.total_amount).toFixed(2)}</td>
                        <td>{o.delivery_address}</td>
                        <td>{o.payment_method || 'N/A'}</td>
                        <td>
                          <span className={`badge ${o.payment_status === 'paid' ? 'delivered' : 'pending'}`}>
                            {o.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${o.status}`}>{o.status}</span>
                        </td>
                        <td>
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
                          <Link 
                            to={`/customer/orders/${o.id}`} 
                            style={{ color: '#2563eb', textDecoration: 'underline', fontSize: '13px' }}
                          >
                            View Details
                          </Link>
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

export default CustomerOrders;