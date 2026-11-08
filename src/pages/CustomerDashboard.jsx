import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function CustomerDashboard() {
  const [stats, setStats] = useState({ active_orders: 0, completed_orders: 0, total_spent: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')) || {});


  useEffect(() => {
    // Kunin ang orders mula sa API
    fetch('http://127.0.0.1:3000/api/orders?customer_id=1')
      .then(res => res.json())
      .then(data => {
        // Compute stats base sa orders
        let active = 0;
        let completed = 0;
        let spent = 0;
        
        data.forEach(o => {
          if (o.status === 'pending' || o.status === 'preparing' || o.status === 'delivering') active++;
          if (o.status === 'delivered') { completed++; spent += parseFloat(o.total_amount); }
        });

        setStats({ active_orders: active, completed_orders: completed, total_spent: spent });
        setRecentOrders(data.slice(0, 3));
      });
  }, []);

  return (
    <div className="app-container">
      <div className="dashboard-layout">
        <div className="topbar">
          <div className="logo">Food<span>Link</span></div>
          <div className="user-info">
            <span className="role-badge customer">Customer</span>
            <span className="name">{user.name}</span>
            <Link to="/" className="signout">Sign out</Link>
          </div>
        </div>
        <div className="main-body">
          <div className="sidebar">
            <div className="section-label">Customer</div>
            <Link to="/customer" className="active">Dashboard</Link>
            <Link to="/customer/browse">Browse Food</Link>
            <Link to="/customer/orders">My Orders</Link>
          </div>
          <div className="content-area">
            <h1>Customer Dashboard</h1>
            <p className="page-sub">Welcome back, {user.name}. Here's your food ordering overview.</p>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="label">Active Orders</div>
                <div className="value">{stats.active_orders}</div>
                <div className="sub">Orders currently in progress</div>
              </div>
              <div className="stat-card green">
                <div className="label">Completed Orders</div>
                <div className="value">{stats.completed_orders}</div>
                <div className="sub">Successfully delivered</div>
              </div>
              <div className="stat-card amber">
                <div className="label">Total Spent</div>
                <div className="value" style={{ color: '#b45309' }}>₱{stats.total_spent.toFixed(2)}</div>
                <div className="sub">Lifetime total</div>
              </div>
              <div className="stat-card purple">
                <div className="label">Favorite Vendor</div>
                <div className="value sm">Lola Nena's</div>
                <div className="sub">5 orders</div>
              </div>
            </div>

            <div className="table-section">
              <h3>Recent Orders</h3>
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Total</th>
                    <th>Address</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center' }}>No recent orders.</td></tr>
                  ) : (
                    recentOrders.map(o => (
                      <tr key={o.id}>
                        <td>#{o.id}</td>
                        <td>₱{o.total_amount}</td>
                        <td>{o.delivery_address}</td>
                        <td><span className={`badge ${o.status}`}>{o.status}</span></td>
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

export default CustomerDashboard;