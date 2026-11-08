import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Kunin ang order details
    fetch(`http://127.0.0.1:3000/api/order_details?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.order) { setOrder(data.order); setItems(data.items); }
      });
  }, [id]);

  if (!order) return <div style={{ padding: '40px' }}>Loading...</div>;

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
            <Link to="/customer/orders">My Orders</Link>
          </div>
          <div className="content-area">
            <button onClick={() => navigate(-1)} style={{ marginBottom: '15px', background: 'none', border: 'none', color: '#ea580c', cursor: 'pointer', fontSize: '14px' }}>
              ← Back to Orders
            </button>
            <h1>Order #{order.id}</h1>
            <p className="page-sub">
                Placed on {new Date(order.created_at.replace(' ', 'T')).toLocaleString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'UTC' // <-- ITO ANG MAGPAPATIGIL SA CONVERSION
                })}
                </p>

            <div className="table-section">
              <h3>Items</h3>
              <table>
                <thead><tr><th>Item</th><th>Quantity</th><th>Subtotal</th></tr></thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td>{item.product_name || 'Product #' + item.product_id}</td>
                      <td>{item.quantity}</td>
                      <td>₱{parseFloat(item.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-section">
              <h3>Order Summary</h3>
              <p><strong>Delivery Address:</strong> {order.delivery_address}</p>
              <p><strong>Payment Method:</strong> {order.payment_method}</p>
              <p><strong>Status:</strong> <span className={`badge ${order.status}`}>{order.status}</span></p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '10px' }}>Total: ₱{parseFloat(order.total_amount).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;