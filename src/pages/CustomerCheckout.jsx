import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

let debounceTimer;

function CustomerCheckout() {
  const navigate = useNavigate();
  const [cart] = useState(() => JSON.parse(localStorage.getItem('cart')) || []);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [computingDistance, setComputingDistance] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);
  const total = subtotal + deliveryFee;

  const computeDistance = async (customerLat, customerLng) => {
    setComputingDistance(true);
    const user = JSON.parse(localStorage.getItem('user'));
    const vendorId = cart[0]?.vendor_id || 1;

    try {
      const coordsRes = await fetch(`${API_URL}/api/get_coordinates?user_id=${user.id}&vendor_id=${vendorId}`);
      const vendorCoords = await coordsRes.json();

      if (vendorCoords.vendor_lat && vendorCoords.vendor_lng) {
        const distRes = await fetch(`${API_URL}/api/calculate_distance?vendor_lat=${vendorCoords.vendor_lat}&vendor_lng=${vendorCoords.vendor_lng}&customer_lat=${customerLat}&customer_lng=${customerLng}`);
        const distData = await distRes.json();

        if (distData.status === 'success') {
          setDistanceKm(distData.distance_km);
          setDeliveryFee(distData.delivery_fee);
          setLocationStatus(`✅ ${distData.distance_km} km from vendor (Delivery Fee: ₱${distData.delivery_fee})`);
        }
      }
    } catch (err) {
      console.error(err);
      setLocationStatus('❌ Failed to compute distance.');
    } finally {
      setComputingDistance(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('❌ Geolocation not supported.');
      return;
    }

    setLocationStatus('📍 Getting your GPS location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        console.log("=== GPS COORDINATES ===");
        console.log("Latitude:", lat);
        console.log("Longitude:", lng);
        console.log("Accuracy:", position.coords.accuracy, "meters");
        setLocationStatus(`📍 GPS found: ${lat.toFixed(4)}, ${lng.toFixed(4)}. Computing distance...`);
        
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          const vendorId = cart[0]?.vendor_id || 1;

          const coordsRes = await fetch(`${API_URL}/api/get_coordinates?user_id=${user.id}&vendor_id=${vendorId}`);
          const vendorCoords = await coordsRes.json();
          
          console.log('Vendor coords:', vendorCoords);

          if (!vendorCoords.vendor_lat || !vendorCoords.vendor_lng) {
            setLocationStatus('❌ Vendor location not found in database.');
            return;
          }

          const distRes = await fetch(`${API_URL}/api/calculate_distance?vendor_lat=${vendorCoords.vendor_lat}&vendor_lng=${vendorCoords.vendor_lng}&customer_lat=${lat}&customer_lng=${lng}`);
          const distData = await distRes.json();
          
          console.log('Distance result:', distData);

          if (distData.status === 'success') {
            setDistanceKm(distData.distance_km);
            setDeliveryFee(distData.delivery_fee);
            setLocationStatus(`✅ ${distData.distance_km} km from vendor (Delivery Fee: ₱${distData.delivery_fee})`);
          } else {
            setLocationStatus('❌ Could not compute distance. ' + (distData.message || ''));
          }
        } catch (err) {
          console.error('Distance error:', err);
          setLocationStatus('❌ Error: ' + err.message);
        }
      },
      (error) => {
        setLocationStatus('❌ Location error: ' + error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleAddressChange = (e) => {
    const newAddress = e.target.value;
    setAddress(newAddress);

    clearTimeout(debounceTimer);

    if (newAddress.length < 5) {
      setDeliveryFee(0);
      setDistanceKm(0);
      setLocationStatus('');
      return;
    }

    setLocationStatus('📍 Looking up address...');

    debounceTimer = setTimeout(async () => {
      try {
        const geocodeRes = await fetch(`${API_URL}/api/geocode_address?address=${encodeURIComponent(newAddress)}`);
        const geocodeData = await geocodeRes.json();

        if (geocodeData.status === 'success') {
          computeDistance(geocodeData.lat, geocodeData.lng);
        } else {
          setLocationStatus('❌ Address not found. Please try a more specific address.');
          setDeliveryFee(0);
          setDistanceKm(0);
        }
      } catch (err) {
        console.error(err);
        setLocationStatus('❌ Failed to look up address.');
      }
    }, 500);
  };

  const handleStripeCheckout = async () => {
    if (!address) { alert('Please enter delivery address.'); return; }
    if (cart.length === 0) { alert('Cart is empty.'); return; }
    if (deliveryFee === 0) { alert('Please set your location or address first.'); return; }

    setLoading(true);
    const user = JSON.parse(localStorage.getItem('user'));

    try {
      const response = await fetch(`${API_URL}/api/create_checkout_session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: cart,
          customer_id: user.id,
          vendor_id: cart[0].vendor_id || 1,
          address: address,
          delivery_fee: deliveryFee,
          distance_km: distanceKm
        })
      });
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        // Ipapakita nito ang totoong error galing Render
        alert("Stripe Error: " + (data.error || data.message || "Walang URL na nabalik."));
        console.error("Backend response:", data);
      }
    } catch {
      alert('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleCODCheckout = async () => {
    if (!address) { alert('Please enter delivery address.'); return; }
    if (cart.length === 0) { alert('Cart is empty.'); return; }
    if (deliveryFee === 0) { alert('Please set your location or address first.'); return; }

    setLoading(true);
    const user = JSON.parse(localStorage.getItem('user'));

    try {
      const response = await fetch(`${API_URL}/api/place_order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: user.id,
          vendor_id: cart[0].vendor_id || 1,
          address: address,
          total: total,
          payment_method: 'Cash on Delivery',
          cart: cart,
          delivery_fee: deliveryFee,
          distance_km: distanceKm
        })
      });
      const data = await response.json();
      if (data.status === 'success') {
        localStorage.removeItem('cart');
        alert('Order Placed!');
        navigate('/customer/orders');
      }
    } catch {
      alert('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="dashboard-layout">
        <div className="topbar">
          <div className="logo">Food<span>Link</span></div>
          <div className="user-info">
            <span className="role-badge customer">Customer</span>
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
            <h1>Checkout</h1>
            <div className="table-section">
              <h3>Order Summary</h3>
              <table>
                <thead><tr><th>Item</th><th>Price</th></tr></thead>
                <tbody>
                  {cart.map((item, i) => (
                    <tr key={i}><td>{item.name}</td><td>₱{parseFloat(item.price).toFixed(2)}</td></tr>
                  ))}
                  <tr>
                    <td style={{ textAlign: 'right' }}>Subtotal:</td>
                    <td>₱{subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'right' }}>Delivery Fee ({distanceKm} km):</td>
                    <td>₱{deliveryFee.toFixed(2)}</td>
                  </tr>
                  <tr style={{ fontWeight: 'bold', background: '#f8fafc' }}>
                    <td style={{ textAlign: 'right' }}>Total:</td>
                    <td>₱{total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="table-section" style={{ maxWidth: '600px' }}>
              <h3>Delivery Details</h3>
              
              <div className="form-group">
                <label>Option 1: Use My Current Location</label>
                <button className="btn-primary" onClick={handleGetLocation} disabled={computingDistance} style={{ background: '#2563eb' }}>
                  {computingDistance ? 'Getting location...' : '📍 Get My GPS Location'}
                </button>
              </div>

              <div style={{ textAlign: 'center', margin: '15px 0', color: '#94a3b8', fontSize: '13px' }}>— OR —</div>

              <div className="form-group">
                <label>Option 2: Enter Delivery Address</label>
                <div className="input-wrapper">
                  <input 
                    type="text" 
                    value={address} 
                    onChange={handleAddressChange} 
                    placeholder="e.g. Sapul, Calapan City" 
                  />
                </div>
              </div>

              {locationStatus && (
                <p style={{ 
                  fontSize: '13px', 
                  color: locationStatus.startsWith('✅') ? '#059669' : locationStatus.startsWith('❌') ? '#dc2626' : '#64748b',
                  marginTop: '10px',
                  padding: '8px',
                  background: locationStatus.startsWith('✅') ? '#f0fdf4' : locationStatus.startsWith('❌') ? '#fef2f2' : '#f8fafc',
                  borderRadius: '6px'
                }}>
                  {locationStatus}
                </p>
              )}

              <h3 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '16px' }}>Payment Method</h3>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" value="stripe" checked={paymentMethod === 'stripe'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  Pay Online (Stripe)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  Cash on Delivery
                </label>
              </div>

              {paymentMethod === 'stripe' ? (
                <button className="btn-primary" onClick={handleStripeCheckout} disabled={loading || computingDistance || deliveryFee === 0}>
                  {loading ? 'Redirecting to Stripe...' : `Pay with Stripe (₱${total.toFixed(2)})`}
                </button>
              ) : (
                <button className="btn-primary" onClick={handleCODCheckout} disabled={loading || computingDistance || deliveryFee === 0} style={{ background: '#10b981' }}>
                  {loading ? 'Placing order...' : `Place Order - COD (₱${total.toFixed(2)})`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerCheckout;