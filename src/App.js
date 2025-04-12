import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/lib/locale/vi_VN';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { useAuth } from './contexts/AuthContext';
import { useEffect } from 'react';
import { initializeAppData } from './services/localStorage/initData';

// Layouts
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// User Pages
import HomePage from './pages/user/HomePage';
import LoginPage from './pages/user/LoginPage';
import RegisterPage from './pages/user/RegisterPage';
import ProductListPage from './pages/user/ProductListPage';
import ProductDetailPage from './pages/user/ProductDetailPage';
import CartPage from './pages/user/CartPage';
import CheckoutPage from './pages/user/CheckoutPage';
import ProfilePage from './pages/user/ProfilePage';
import OrderHistoryPage from './pages/user/OrderHistoryPage';

// Admin Pages
import ProductManagementPage from './pages/admin/ProductManagementPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import OrderManagementPage from './pages/admin/OrderManagementPage';
import UserManagementPage from './pages/admin/UserManagementPage';

// Protected Routes
const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  return currentUser && isAdmin ? children : <Navigate to="/" />;
};

function App() {
  useEffect(() => {
    // Khởi tạo dữ liệu mẫu
    initializeAppData();
  }, []);

  return (
    <ConfigProvider locale={viVN}>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<UserLayout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="products" element={<ProductListPage />} />
                <Route path="products/:id" element={<ProductDetailPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={
                  <PrivateRoute>
                    <CheckoutPage />
                  </PrivateRoute>
                } />
                <Route path="profile" element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                } />
                <Route path="orders" element={
                  <PrivateRoute>
                    <OrderHistoryPage />
                  </PrivateRoute>
                } />
              </Route>
              
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<ProductManagementPage />} />
                <Route path="orders" element={<OrderManagementPage />} />
                <Route path="users" element={<UserManagementPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
