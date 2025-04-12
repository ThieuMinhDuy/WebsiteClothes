import { Layout, Menu, Button, Badge } from 'antd';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const { Header, Content, Footer } = Layout;

const UserLayout = () => {
  const { currentUser, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div className="logo" style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', marginRight: '20px' }}>
          <Link to="/" style={{ color: 'white' }}>CLOTHES SHOP</Link>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['1']}
          style={{ flex: 1 }}
        >
          <Menu.Item key="1">
            <Link to="/">Trang chủ</Link>
          </Menu.Item>
          <Menu.Item key="2">
            <Link to="/products">Sản phẩm</Link>
          </Menu.Item>
        </Menu>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Badge count={getCartItemCount()} showZero>
            <Button 
              type="link" 
              icon={<ShoppingCartOutlined style={{ fontSize: '24px', color: 'white' }} />} 
              onClick={() => navigate('/cart')}
            />
          </Badge>
          {currentUser ? (
            <Menu theme="dark" mode="horizontal" style={{ marginLeft: '10px' }}>
              <Menu.SubMenu 
                key="user" 
                icon={<UserOutlined />}
                title={currentUser.name}
              >
                <Menu.Item key="profile">
                  <Link to="/profile">Tài khoản</Link>
                </Menu.Item>
                <Menu.Item key="orders">
                  <Link to="/orders">Đơn hàng</Link>
                </Menu.Item>
                {currentUser.role === 'admin' && (
                  <Menu.Item key="admin">
                    <Link to="/admin">Quản trị</Link>
                  </Menu.Item>
                )}
                <Menu.Item key="logout" onClick={handleLogout}>
                  Đăng xuất
                </Menu.Item>
              </Menu.SubMenu>
            </Menu>
          ) : (
            <Button type="primary" onClick={() => navigate('/login')}>
              Đăng nhập
            </Button>
          )}
        </div>
      </Header>
      <Content style={{ padding: '0 50px', marginTop: '20px' }}>
        <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
          <Outlet />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        ©{new Date().getFullYear()} Clothes Shop - Đồ án Website Bán Quần Áo
      </Footer>
    </Layout>
  );
};

export default UserLayout;
