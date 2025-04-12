import { useState } from 'react';
import { Row, Col, Card, Table, Button, InputNumber, Empty, Typography, Space, Divider, message } from 'antd';
import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const handleQuantityChange = (index, value) => {
    updateQuantity(index, value);
  };
  
  const handleRemove = (index) => {
    removeFromCart(index);
    message.success('Đã xóa sản phẩm khỏi giỏ hàng');
  };
  
  const handleCheckout = () => {
    if (!currentUser) {
      message.warning('Vui lòng đăng nhập để thanh toán');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    
    navigate('/checkout');
  };
  
  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'product',
      key: 'product',
      render: (_, record) => (
        <div style={{ display: 'flex' }}>
          <img 
            src={record.images[0] || "https://via.placeholder.com/80x80?text=No+Image"} 
            alt={record.name}
            style={{ width: 80, height: 80, objectFit: 'cover', marginRight: 16 }}
          />
          <div>
            <Link to={`/products/${record.id}`}>
              <Text strong>{record.name}</Text>
            </Link>
            <div>
              <Text type="secondary">Size: {record.selectedSize}</Text>
            </div>
            <div>
              <Text type="secondary">Màu: {record.selectedColor}</Text>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price.toLocaleString('vi-VN')}đ`,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (_, record, index) => (
        <InputNumber 
          min={1} 
          value={record.quantity} 
          onChange={(value) => handleQuantityChange(index, value)}
        />
      ),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'total',
      key: 'total',
      render: (_, record) => `${(record.price * record.quantity).toLocaleString('vi-VN')}đ`,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record, index) => (
        <Button 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => handleRemove(index)}
        >
          Xóa
        </Button>
      ),
    },
  ];
  
  return (
    <div>
      <Title level={2}>Giỏ hàng của bạn</Title>
      
      {cart.length === 0 ? (
        <Empty 
          description={
            <span>Giỏ hàng trống</span>
          }
        >
          <Link to="/products">
            <Button type="primary" icon={<ShoppingOutlined />}>
              Tiếp tục mua sắm
            </Button>
          </Link>
        </Empty>
      ) : (
        <>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={18}>
              <Table 
                columns={columns}
                dataSource={cart}
                pagination={false}
                rowKey={(record, index) => index}
              />
            </Col>
            
            <Col xs={24} lg={6}>
              <Card title="Tổng tiền giỏ hàng">
                <div style={{ marginBottom: 16 }}>
                  <Row justify="space-between">
                    <Col>Tạm tính:</Col>
                    <Col><Text strong>{getCartTotal().toLocaleString('vi-VN')}đ</Text></Col>
                  </Row>
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <Row justify="space-between">
                    <Col>Phí vận chuyển:</Col>
                    <Col><Text strong>30.000đ</Text></Col>
                  </Row>
                </div>
                
                <Divider />
                
                <div style={{ marginBottom: 16 }}>
                  <Row justify="space-between">
                    <Col><Text strong>Tổng cộng:</Text></Col>
                    <Col>
                      <Text strong style={{ fontSize: '18px', color: 'red' }}>
                        {(getCartTotal() + 30000).toLocaleString('vi-VN')}đ
                      </Text>
                    </Col>
                  </Row>
                </div>
                
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button type="primary" size="large" block onClick={handleCheckout}>
                    Tiến hành thanh toán
                  </Button>
                  <Link to="/products">
                    <Button block>Tiếp tục mua sắm</Button>
                  </Link>
                </Space>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default CartPage;
