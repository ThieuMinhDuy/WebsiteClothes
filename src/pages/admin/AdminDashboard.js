import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Spin, Calendar, Badge } from 'antd';
import { UserOutlined, ShoppingOutlined, DollarOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { getUsers } from '../../services/api/userApi';
import { getOrders } from '../../services/api/orderApi';
import { getProducts } from '../../services/api/productApi';

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: []
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Tải tất cả dữ liệu cần thiết
        const [users, products, orders] = await Promise.all([
          getUsers(),
          getProducts(),
          getOrders()
        ]);
        
        // Tính doanh thu
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        
        // Lọc sản phẩm có số lượng thấp (ít hơn 10)
        const lowStockProducts = products
          .filter(product => product.inStock < 10)
          .sort((a, b) => a.inStock - b.inStock)
          .slice(0, 5);
        
        // Lấy 5 đơn hàng gần nhất
        const recentOrders = [...orders]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        
        setStats({
          totalUsers: users.length,
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue,
          recentOrders,
          lowStockProducts
        });
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Tạo dữ liệu lịch từ đơn hàng
  const getCalendarData = (value) => {
    if (!stats.recentOrders.length) return null;
    
    const dateStr = value.format('YYYY-MM-DD');
    const ordersOnDate = stats.recentOrders.filter(order => 
      new Date(order.createdAt).toISOString().split('T')[0] === dateStr
    );
    
    return ordersOnDate.length ? ordersOnDate.length : null;
  };

  // Render nội dung ô lịch
  const dateCellRender = (value) => {
    const ordersCount = getCalendarData(value);
    return ordersCount ? (
      <Badge count={ordersCount} style={{ backgroundColor: '#52c41a' }} />
    ) : null;
  };

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Thống kê tổng quan */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tổng người dùng"
                  value={stats.totalUsers}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tổng sản phẩm"
                  value={stats.totalProducts}
                  prefix={<ShoppingOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tổng đơn hàng"
                  value={stats.totalOrders}
                  prefix={<ShoppingCartOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Doanh thu"
                  value={stats.totalRevenue}
                  prefix={<DollarOutlined />}
                  suffix="đ"
                  formatter={value => `${value.toLocaleString('vi-VN')}`}
                />
              </Card>
            </Col>
          </Row>
          
          <Row gutter={16}>
            {/* Đơn hàng gần đây */}
            <Col xs={24} lg={12} style={{ marginBottom: 24 }}>
              <Card title="Đơn hàng gần đây">
                <Table
                  dataSource={stats.recentOrders}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    {
                      title: 'Mã đơn',
                      dataIndex: 'id',
                      key: 'id',
                      render: id => id.slice(0, 8) + '...',
                    },
                    {
                      title: 'Khách hàng',
                      dataIndex: 'shippingDetails',
                      key: 'customer',
                      render: details => details.name,
                    },
                    {
                      title: 'Trạng thái',
                      dataIndex: 'status',
                      key: 'status',
                      render: status => {
                        const statusMap = {
                          pending: { color: 'gold', text: 'Chờ xác nhận' },
                          confirmed: { color: 'blue', text: 'Đã xác nhận' },
                          shipping: { color: 'cyan', text: 'Đang giao' },
                          delivered: { color: 'green', text: 'Đã giao' },
                          cancelled: { color: 'red', text: 'Đã hủy' }
                        };
                        return <Badge color={statusMap[status].color} text={statusMap[status].text} />;
                      },
                    },
                    {
                      title: 'Tổng tiền',
                      dataIndex: 'total',
                      key: 'total',
                      render: total => `${total.toLocaleString('vi-VN')}đ`,
                    },
                  ]}
                />
              </Card>
            </Col>
            
            {/* Sản phẩm sắp hết hàng */}
            <Col xs={24} lg={12} style={{ marginBottom: 24 }}>
              <Card title="Sản phẩm sắp hết hàng">
                <Table
                  dataSource={stats.lowStockProducts}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    {
                      title: 'Sản phẩm',
                      dataIndex: 'name',
                      key: 'name',
                      render: (name, record) => (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <img 
                            src={record.images[0] || "https://via.placeholder.com/40x40?text=No+Image"} 
                            alt={name}
                            style={{ width: 40, height: 40, objectFit: 'cover', marginRight: 10 }} 
                          />
                          <Text ellipsis>{name}</Text>
                        </div>
                      ),
                    },
                    {
                      title: 'Còn lại',
                      dataIndex: 'inStock',
                      key: 'inStock',
                      render: inStock => (
                        <Text type={inStock <= 5 ? "danger" : "warning"} strong={inStock <= 5}>
                          {inStock}
                        </Text>
                      ),
                    },
                    {
                      title: 'Giá',
                      dataIndex: 'price',
                      key: 'price',
                      render: price => `${price.toLocaleString('vi-VN')}đ`,
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row>
          
          {/* Lịch đơn hàng */}
          <Row>
            <Col span={24}>
              <Card title="Lịch đơn hàng">
                <Calendar fullscreen={false} dateCellRender={dateCellRender} />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
