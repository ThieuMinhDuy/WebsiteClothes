import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Spin, Calendar, Badge } from 'antd';
import { UserOutlined, ShoppingOutlined, DollarOutlined, ShoppingCartOutlined, MessageOutlined } from '@ant-design/icons';
import { getUsers } from '../../services/api/userApi';
import { getOrders } from '../../services/api/orderApi';
import { getProducts } from '../../services/api/productApi';
import { getUnreadCountForAdmin } from '../../services/api/chatApi';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: [],
    unreadMessages: 0
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
        
        // Lấy số tin nhắn chưa đọc
        const unreadCount = await getUnreadCountForAdmin();
        
        setStats({
          totalUsers: users.length,
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue,
          recentOrders,
          lowStockProducts,
          unreadMessages: unreadCount
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

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      render: id => <Text copyable>{id.substring(0, 8)}</Text>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'shippingDetails',
      key: 'customer',
      render: shippingDetails => shippingDetails.name,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: total => `${total.toLocaleString('vi-VN')}đ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        let color = 'gold';
        let text = 'Chờ xác nhận';
        
        if (status === 'shipping') {
          color = 'blue';
          text = 'Đang giao';
        } else if (status === 'completed') {
          color = 'green';
          text = 'Hoàn thành';
        } else if (status === 'cancelled') {
          color = 'red';
          text = 'Đã hủy';
        }
        
        return <Badge color={color} text={text} />;
      },
    },
  ];

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
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Statistic
                  title="Tin nhắn chưa đọc"
                  value={stats.unreadMessages}
                  prefix={<MessageOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
                <div style={{ marginTop: 16 }}>
                  <Link to="/admin/chat">Quản lý tin nhắn</Link>
                </div>
              </Card>
            </Col>
          </Row>
          
          <Row gutter={16}>
            {/* Đơn hàng gần đây */}
            <Col xs={24} lg={12} style={{ marginBottom: 24 }}>
              <Card title="Đơn hàng gần đây">
                <Table
                  columns={columns}
                  dataSource={stats.recentOrders}
                  rowKey="id"
                  pagination={false}
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
