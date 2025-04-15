import { Layout, Menu, Button, Badge, Input, Dropdown, Space, Drawer, Row, Col } from 'antd';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  SearchOutlined, 
  DownOutlined, 
  MenuOutlined,
  EnvironmentOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useState, useEffect } from 'react';
import ChatBox from '../components/ChatBox/ChatBox';
// import logo from '../logo.svg';

const { Header, Content, Footer } = Layout;
const { Search } = Input;

const UserLayout = () => {
  const { currentUser, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchVisible, setSearchVisible] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [isHeaderFixed, setIsHeaderFixed] = useState(false);

  // Logo URL
  const logoUrl = "/assets/images/uniqlo-logo.png";

  // Detect scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsHeaderFixed(true);
      } else {
        setIsHeaderFixed(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (value) => {
    navigate(`/products?search=${value}`);
    setSearchVisible(false);
  };

  // Các danh mục cho menu dropdown
  const menItems = [
    { key: 'men-tshirts', label: <Link to="/products?category=men&type=tshirts">Áo Thun</Link> },
    { key: 'men-shirts', label: <Link to="/products?category=men&type=shirts">Áo Sơ Mi</Link> },
    { key: 'men-pants', label: <Link to="/products?category=men&type=pants">Quần</Link> },
    { key: 'men-jackets', label: <Link to="/products?category=men&type=jackets">Áo Khoác</Link> },
    { key: 'men-accessories', label: <Link to="/products?category=men&type=accessories">Phụ Kiện</Link> }
  ];

  const womenItems = [
    { key: 'women-tshirts', label: <Link to="/products?category=women&type=tshirts">Áo Thun</Link> },
    { key: 'women-blouses', label: <Link to="/products?category=women&type=blouses">Áo Kiểu</Link> },
    { key: 'women-dresses', label: <Link to="/products?category=women&type=dresses">Váy Đầm</Link> },
    { key: 'women-pants', label: <Link to="/products?category=women&type=pants">Quần</Link> },
    { key: 'women-accessories', label: <Link to="/products?category=women&type=accessories">Phụ Kiện</Link> }
  ];

  const kidItems = [
    { key: 'kids-boys', label: <Link to="/products?category=kids&gender=boys">Bé Trai</Link> },
    { key: 'kids-girls', label: <Link to="/products?category=kids&gender=girls">Bé Gái</Link> },
    { key: 'kids-babies', label: <Link to="/products?category=kids&gender=babies">Trẻ Sơ Sinh</Link> }
  ];

  const collectionsItems = [
    { key: 'collections-summer', label: <Link to="/collections/summer">Bộ Sưu Tập Hè</Link> },
    { key: 'collections-winter', label: <Link to="/collections/winter">Bộ Sưu Tập Đông</Link> },
    { key: 'collections-special', label: <Link to="/collections/special">Thiết Kế Đặc Biệt</Link> }
  ];

  // Xác định menu item hiện tại
  const getActiveKey = () => {
    const path = location.pathname;
    const search = location.search;
    
    // Kiểm tra path và search params để xác định menu item active
    if (path === '/') return '1';
    if (path.includes('/products')) {
      if (search.includes('category=men')) return '2';
      if (search.includes('category=women')) return '3';
      if (search.includes('category=kids')) return '4';
      return '2'; // Mặc định là Nam nếu không có category
    }
    if (path.includes('/collections')) return '5';
    if (path.includes('/promotions')) return '6';
    if (path.includes('/stores')) return '7';
    return '1';
  };

  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      <Header 
        className={`site-header ${isHeaderFixed ? 'fixed-header' : ''}`}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 30px',
          position: isHeaderFixed ? 'fixed' : 'relative',
          width: '100%',
          zIndex: 1000,
          boxShadow: isHeaderFixed ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Logo */}
        <div className="logo" style={{ marginRight: '40px' }}>
          <Link to="/">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src={logoUrl} alt="Uniqlo Logo" style={{ height: '40px' }} />
            </div>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="desktop-nav" style={{ display: 'flex', flex: 1 }}>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[getActiveKey()]}
            style={{ flex: 1 }}
            className="main-menu"
          >
            <Menu.Item key="1">
              <Link to="/">Trang chủ</Link>
            </Menu.Item>

            {/* Menu Nam với dropdown */}
            <Menu.Item key="2">
              <Dropdown menu={{ items: menItems }} placement="bottomCenter">
                <Link to="/products?category=men">
                  <Space>
                    Nam
                    <DownOutlined />
                  </Space>
                </Link>
              </Dropdown>
            </Menu.Item>

            {/* Menu Nữ với dropdown */}
            <Menu.Item key="3">
              <Dropdown menu={{ items: womenItems }} placement="bottomCenter">
                <Link to="/products?category=women">
                  <Space>
                    Nữ
                    <DownOutlined />
                  </Space>
                </Link>
              </Dropdown>
            </Menu.Item>

            {/* Menu Trẻ em với dropdown */}
            <Menu.Item key="4">
              <Dropdown menu={{ items: kidItems }} placement="bottomCenter">
                <Link to="/products?category=kids">
                  <Space>
                    Trẻ Em
                    <DownOutlined />
                  </Space>
                </Link>
              </Dropdown>
            </Menu.Item>

            {/* Bộ sưu tập đặc biệt với dropdown */}
            <Menu.Item key="5">
              <Link to="/collections">
                Bộ Sưu Tập
              </Link>
            </Menu.Item>

            <Menu.Item key="6">
              <Link to="/promotions">Khuyến Mãi</Link>
            </Menu.Item>

            <Menu.Item key="7">
              <Link to="/stores">
                <Space>
                  <EnvironmentOutlined />
                  Cửa Hàng
                </Space>
              </Link>
            </Menu.Item>
          </Menu>
        </div>

        {/* Search, Cart, User Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Nút hiển thị thanh tìm kiếm */}
          <Button 
            type="link" 
            icon={<SearchOutlined style={{ fontSize: '20px', color: 'white' }} />} 
            onClick={() => setSearchVisible(!searchVisible)}
            style={{ padding: '0 8px' }}
          />

          {/* Danh sách yêu thích */}
          <Badge count={0} showZero>
            <Button 
              type="link" 
              icon={<HeartOutlined style={{ fontSize: '20px', color: 'white' }} />} 
              onClick={() => navigate('/wishlist')}
              style={{ padding: '0 8px' }}
            />
          </Badge>
          
          {/* Giỏ hàng */}
          <Badge count={getCartItemCount()} showZero>
            <Button 
              type="link" 
              icon={<ShoppingCartOutlined style={{ fontSize: '20px', color: 'white' }} />} 
              onClick={() => navigate('/cart')}
              style={{ padding: '0 8px' }}
            />
          </Badge>

          {/* User Menu */}
          {currentUser ? (
            <Dropdown 
              menu={{ 
                items: [
                  { key: 'profile', label: <Link to="/profile">Tài khoản của tôi</Link> },
                  { key: 'orders', label: <Link to="/orders">Đơn hàng</Link> },
                  ...(currentUser.role === 'admin' ? [{ key: 'admin', label: <Link to="/admin">Quản trị</Link> }] : []),
                  { key: 'logout', label: <span onClick={handleLogout}>Đăng xuất</span> }
                ]
              }} 
              placement="bottomRight"
            >
              <Button type="link" style={{ color: 'white', padding: '0 8px', marginLeft: '8px' }}>
                <Space>
                  <UserOutlined />
                  {currentUser.name}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          ) : (
            <Button type="primary" style={{ background: 'white', borderColor: 'white', color: '#ff0000' }} onClick={() => navigate('/login')}>
              Đăng nhập
            </Button>
          )}

          {/* Mobile Menu Button */}
          <Button 
            type="link" 
            className="mobile-menu-button"
            icon={<MenuOutlined style={{ fontSize: '20px', color: 'white' }} />} 
            onClick={() => setMobileMenuVisible(true)}
            style={{ display: 'none', marginLeft: '10px' }}
          />
        </div>
      </Header>

      {/* Thanh tìm kiếm */}
      {searchVisible && (
        <div className="search-bar" style={{ 
          padding: '20px', 
          background: '#ff0000', 
          position: isHeaderFixed ? 'fixed' : 'relative',
          top: isHeaderFixed ? '64px' : '0',
          width: '100%', 
          zIndex: 999,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Search
            placeholder="Tìm kiếm sản phẩm..."
            allowClear
            enterButton="Tìm kiếm"
            size="large"
            onSearch={handleSearch}
            style={{ maxWidth: '600px', margin: '0 auto' }}
          />
        </div>
      )}

      {/* Mobile Menu Drawer */}
      <Drawer
        title="Danh mục"
        placement="right"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        width={280}
      >
        <Menu mode="vertical" defaultSelectedKeys={[getActiveKey()]}>
          <Menu.Item key="1">
            <Link to="/">Trang chủ</Link>
          </Menu.Item>
          <Menu.SubMenu key="2" title="Nam">
            {menItems.map(item => (
              <Menu.Item key={item.key} onClick={() => setMobileMenuVisible(false)}>
                {item.label}
              </Menu.Item>
            ))}
          </Menu.SubMenu>
          <Menu.SubMenu key="3" title="Nữ">
            {womenItems.map(item => (
              <Menu.Item key={item.key} onClick={() => setMobileMenuVisible(false)}>
                {item.label}
              </Menu.Item>
            ))}
          </Menu.SubMenu>
          <Menu.SubMenu key="4" title="Trẻ Em">
            {kidItems.map(item => (
              <Menu.Item key={item.key} onClick={() => setMobileMenuVisible(false)}>
                {item.label}
              </Menu.Item>
            ))}
          </Menu.SubMenu>
          <Menu.SubMenu key="5" title="Bộ Sưu Tập">
            {collectionsItems.map(item => (
              <Menu.Item key={item.key} onClick={() => setMobileMenuVisible(false)}>
                {item.label}
              </Menu.Item>
            ))}
          </Menu.SubMenu>
          <Menu.Item key="6">
            <Link to="/promotions">Khuyến Mãi</Link>
          </Menu.Item>
          <Menu.Item key="7">
            <Link to="/stores">Cửa Hàng</Link>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="search">
            <Search
              placeholder="Tìm kiếm sản phẩm..."
              allowClear
              enterButton
              onSearch={handleSearch}
            />
          </Menu.Item>
        </Menu>
      </Drawer>

      <Content style={{ 
        padding: '0 50px', 
        marginTop: isHeaderFixed ? '84px' : '30px'
      }}>
        <div className="content-container" style={{ background: '#fff', padding: '32px', minHeight: 280, borderRadius: '8px' }}>
          <Outlet />
        </div>
      </Content>
      
      <Footer style={{ textAlign: 'center', padding: '40px 50px 20px' }}>
        <Row gutter={[48, 32]}>
          <Col xs={24} sm={8}>
            <h3>Về UNIQLO</h3>
            <p>Thời trang cao cấp với giá thành hợp lý</p>
            <p>Giờ làm việc: 8:00 - 22:00 hàng ngày</p>
          </Col>
          <Col xs={24} sm={8}>
            <h3>Liên Hệ</h3>
            <p>Hotline: 1900-xxxx-xx</p>
            <p>Email: info@uniqlo.com</p>
            <p>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</p>
          </Col>
          <Col xs={24} sm={8}>
            <h3>Chính Sách</h3>
            <p><Link to="/policy/shipping">Chính sách giao hàng</Link></p>
            <p><Link to="/policy/return">Chính sách đổi trả</Link></p>
            <p><Link to="/policy/payment">Phương thức thanh toán</Link></p>
          </Col>
        </Row>
        <div style={{ marginTop: 20, borderTop: '1px solid #f0f0f0', paddingTop: 20 }}>
          ©{new Date().getFullYear()} UNIQLO - Đồ án Website Bán Quần Áo
        </div>
      </Footer>
      
      {/* Chat Box Component */}
      <ChatBox />
    </Layout>
  );
};

export default UserLayout;
