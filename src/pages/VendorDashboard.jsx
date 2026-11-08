import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function VendorDashboard() {
  const navigate = useNavigate();
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')) || {});
  const [stats, setStats] = useState({ pending: 0, preparing: 0, sales: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  const fetchData = useCallback(() => {
    if (!user.id) return;
    fetch(`http://127.0.0.1:3000/api/orders?vendor_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        let pending = 0, preparing = 0, sales = 0;
        const salesByDate = {};

        data.forEach(o => {
          if (o.status === 'pending') pending++;
          if (o.status === 'preparing') preparing++;
          if (o.status === 'delivered') {
            sales += parseFloat(o.total_amount);
            const date = new Date(o.created_at).toLocaleDateString();
            salesByDate[date] = (salesByDate[date] || 0) + parseFloat(o.total_amount);
          }
        });

        setStats({ pending, preparing, sales });
        setRecentOrders(data.slice(0, 5));

        // Chart data
        setChartData({
          labels: Object.keys(salesByDate),
          datasets: [{
            label: 'Daily Sales (₱)',
            data: Object.values(salesByDate),
            backgroundColor: '#ea580c',
            borderRadius: 8,
          }]
        });
      });
  }, [user.id]);

  useEffect(() => {
    if (!user.id || user.role !== 'vendor') { navigate('/'); return; }
    fetchData();
  }, [navigate, user.id, user.role, fetchData]);

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
            <Link to="/vendor" className="active">Dashboard</Link>
            <Link to="/vendor/menu">Menu Management</Link>
            <Link to="/vendor/orders">Incoming Orders</Link>
          </div>
          <div className="content-area">
            <h1>Vendor Dashboard</h1>
            <p className="page-sub">{user.name} · Business Overview</p>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="label">Pending Orders</div>
                <div className="value">{stats.pending}</div>
              </div>
              <div className="stat-card amber">
                <div className="label">Preparing</div>
                <div className="value">{stats.preparing}</div>
              </div>
              <div className="stat-card green">
                <div className="label">Total Sales</div>
                <div className="value">₱{stats.sales.toFixed(2)}</div>
              </div>
            </div>

            <div className="table-section">
              <h3>Sales Chart (Delivered Orders)</h3>
              <div style={{ height: '300px' }}>
                {chartData.labels.length > 0 ? (
                  <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                ) : (
                  <p>No delivered orders yet.</p>
                )}
              </div>
            </div>

            <div className="table-section">
              <h3>Recent Orders</h3>
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr><td colSpan="3" style={{ textAlign: 'center' }}>No orders yet.</td></tr>
                  ) : (
                    recentOrders.map(o => (
                      <tr key={o.id}>
                        <td>#{o.id}</td>
                        <td>₱{parseFloat(o.total_amount).toFixed(2)}</td>
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

export default VendorDashboard;