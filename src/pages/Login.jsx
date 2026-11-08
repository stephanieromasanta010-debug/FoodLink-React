import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.status === 'success') {
        // 1. I-SAVE ANG TOTOONG USER SA LOCALSTORAGE
        localStorage.setItem('user', JSON.stringify(data.user));

        // 2. I-redirect base sa role
        if (data.user.role === 'customer') navigate('/customer');
        if (data.user.role === 'vendor') navigate('/vendor');
        if (data.user.role === 'delivery') navigate('/delivery');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch {
      setError('Network error. Make sure LavaLust is running on port 3000.');
    }
  };

  return (
    <div className="app-container">
      <div className="auth-screen">
        <div className="auth-card">
          <h1>FoodLink</h1>
          <p className="sub">Local Food Ordering & Delivery Management System</p>

          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <div className="input-wrapper">
                <span className="icon">👤</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" required />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <span className="icon">🔒</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required />
              </div>
            </div>
            <button type="submit" className="btn-primary">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;