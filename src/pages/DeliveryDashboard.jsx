import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function DeliveryDashboard() {
  const [stats, setStats] = useState({ ready: 0, transit: 0, completed: 0 });
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    // Kunin ang orders mula sa API
    fetch('http://127.0.0.1:3000/api/orders')
      .then(res => res.json())
      .then(data => {
        let ready = 0, transit = 0, completed = 0;
        
        data.forEach(o => {
          if (o.status === 'ready') ready++;
          if (o.status === 'delivering') transit++;
          if (o.status === 'delivered') completed++;
        });

        setStats({ ready, transit, completed });
        setRecentTasks(data.slice(0, 5));
      })
      .catch(err => console.error("Error fetching orders:", err));
  }, []);

  return (
    <div className="app-container">
      <div className="dashboard-layout">
        <div className="topbar">
          <div className="logo">Food<span>Link</span></div>
          <div className="user-info">
            <span className="role-badge delivery">Delivery</span>
            <span className="name">Ramon Dela Cruz</span>
            <Link to="/" className="signout">Sign out</Link>
          </div>
        </div>
        <div className="main-body">
          <div className="sidebar">
            <div className="section-label">Delivery</div>
            <Link to="/delivery" className="active">Dashboard</Link>
            <Link to="/delivery/tasks">Assigned Deliveries</Link>
          </div>
          <div className="content-area">
            <h1>Delivery Dashboard</h1>
            <p className="page-sub">Ramon Dela Cruz · Today's delivery overview</p>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="label">Ready for Pickup</div>
                <div className="value">{stats.ready}</div>
                <div className="sub">Available tasks</div>
              </div>
              <div className="stat-card amber">
                <div className="label">In Transit</div>
                <div className="value">{stats.transit}</div>
                <div className="sub">On the way</div>
              </div>
              <div className="stat-card green">
                <div className="label">Completed Deliveries</div>
                <div className="value">{stats.completed}</div>
                <div className="sub">Successfully delivered</div>
              </div>
            </div>

            <div className="table-section">
              <h3>Recent Tasks</h3>
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Drop-off</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.length === 0 ? (
                    <tr><td colSpan="3" style={{ textAlign: 'center' }}>No assigned tasks.</td></tr>
                  ) : (
                    recentTasks.map(o => (
                      <tr key={o.id}>
                        <td>#{o.id}</td>
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

export default DeliveryDashboard;