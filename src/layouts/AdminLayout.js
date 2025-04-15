import { Layout, Menu } from 'antd';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { 
  DashboardOutlined, 
  ShoppingOutlined,
  UserOutlined,
  OrderedListOutlined,
  LogoutOutlined,
  MessageOutlined,
  GiftOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header, Content, Footer, Sider } = Layout;

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div className="logo" style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.3)' }} />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            <Link to="/admin">Tổng quan</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<ShoppingOutlined />}>
            <Link to="/admin/products">Sản phẩm</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<OrderedListOutlined />}>
            <Link to="/admin/orders">Đơn hàng</Link>
          </Menu.Item>
          <Menu.Item key="4" icon={<UserOutlined />}>
            <Link to="/admin/users">Người dùng</Link>
          </Menu.Item>
          <Menu.Item key="5" icon={<MessageOutlined />}>
            <Link to="/admin/chat">Quản lý chat</Link>
          </Menu.Item>
          <Menu.Item key="6" icon={<GiftOutlined />}>
            <Link to="/admin/vouchers">Mã giảm giá</Link>
          </Menu.Item>
          <Menu.Item key="7" icon={<LogoutOutlined />} onClick={handleLogout}>
            Đăng xuất
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: 0, background: '#fff' }}>
          <div style={{ paddingLeft: 24, fontSize: '18px', fontWeight: 'bold' }}>
            Quản trị Website Bán Quần Áo
          </div>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360, background: '#fff' }}>
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          ©{new Date().getFullYear()} - Trang Quản Trị Website Bán Quần Áo
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
