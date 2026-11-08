import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerBrowse from './pages/CustomerBrowse';
import CustomerOrders from './pages/CustomerOrders';
import CustomerCheckout from './pages/CustomerCheckout';
import VendorDashboard from './pages/VendorDashboard';
import VendorMenu from './pages/VendorMenu';
import VendorOrders from './pages/VendorOrders';
import DeliveryDashboard from './pages/DeliveryDashboard';
import DeliveryTasks from './pages/DeliveryTasks';
import OrderDetails from './pages/OrderDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/customer/browse" element={<CustomerBrowse />} />
        <Route path="/customer/orders" element={<CustomerOrders />} />
        <Route path="/customer/checkout" element={<CustomerCheckout />} />
        <Route path="/vendor" element={<VendorDashboard />} />
        <Route path="/vendor/menu" element={<VendorMenu />} />
        <Route path="/vendor/orders" element={<VendorOrders />} />
        <Route path="/delivery" element={<DeliveryDashboard />} />
        <Route path="/delivery/tasks" element={<DeliveryTasks />} />
        <Route path="/customer/orders/:id" element={<OrderDetails />} />
      </Routes>
    </Router>
  );
}

export default App;