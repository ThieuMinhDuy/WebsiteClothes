import { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Divider, Tag, Button, Space } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircleOutlined, ShoppingOutlined, FileTextOutlined, CustomerServiceOutlined, CarOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(10); // Đếm ngược 10 giây
  
  // Lấy thông tin đơn hàng từ state khi chuyển trang
  const { orderDetails } = location.state || {};
  
  // Nếu không có thông tin đơn hàng, chuyển hướng về trang chủ
  useEffect(() => {
    if (!orderDetails) {
      navigate('/');
    }
  }, [orderDetails, navigate]);
  
  // Đếm ngược và chuyển trang sau khi đếm xong
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else {
      timer = setTimeout(() => {
        navigate('/');
      }, 500);
    }
    return () => clearTimeout(timer);
  }, [countdown, navigate]);
  
  // Nếu không có thông tin đơn hàng, hiển thị trống
  if (!orderDetails) {
    return null;
  }
  
  return (
    <div style={{ padding: '40px 20px' }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        background: 'white', 
        padding: '40px', 
        borderRadius: '12px',
        border: '1px solid #f0f0f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ margin: '0 auto 30px', width: '120px', height: '120px', background: '#f6ffed', borderRadius: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircleOutlined style={{ fontSize: '90px', color: '#52c41a' }} />
          </div>
          <Title level={2} style={{ color: '#52c41a', marginBottom: '10px' }}>ĐẶT HÀNG THÀNH CÔNG!</Title>
          <Paragraph style={{ fontSize: '20px' }}>
            Cảm ơn bạn đã mua sắm tại CLOTHE Shop!
          </Paragraph>
          <div style={{ marginTop: '15px' }}>
            <Tag color="processing" style={{ fontSize: '16px', padding: '5px 15px' }}>
              Chuyển hướng sau {countdown} giây...
            </Tag>
          </div>
        </div>
        
        <div style={{ border: '1px solid #e8e8e8', borderRadius: '8px', padding: '20px', marginBottom: '30px' }}>
          <Row gutter={[16, 24]}>
            <Col xs={24} md={12}>
              <Card title="Thông tin đơn hàng" bordered={false} style={{ height: '100%' }}>
                <Paragraph>
                  <Text strong>Mã đơn hàng:</Text> <Text copyable style={{ fontSize: '16px' }}>{orderDetails.orderCode}</Text>
                </Paragraph>
                <Paragraph>
                  <Text strong>Trạng thái:</Text> <Tag color="gold" style={{ fontSize: '14px' }}>Chờ xác nhận</Tag>
                </Paragraph>
                <Paragraph>
                  <Text strong>Phương thức thanh toán:</Text> {orderDetails.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}
                </Paragraph>
                <Paragraph>
                  <Text strong>Tổng giá trị:</Text> <Text type="danger" style={{ fontWeight: 'bold' }}>{orderDetails.total.toLocaleString('vi-VN')}đ</Text>
                </Paragraph>
              </Card>
            </Col>
            
            <Col xs={24} md={12}>
              <Card title="Địa chỉ giao hàng" bordered={false} style={{ height: '100%' }}>
                <Paragraph><Text strong>Người nhận:</Text> {orderDetails.shippingDetails.name}</Paragraph>
                <Paragraph><Text strong>Số điện thoại:</Text> {orderDetails.shippingDetails.phone}</Paragraph>
                <Paragraph><Text strong>Email:</Text> {orderDetails.shippingDetails.email}</Paragraph>
                <Paragraph><Text strong>Địa chỉ:</Text> {orderDetails.shippingDetails.address}</Paragraph>
                {orderDetails.shippingDetails.notes && (
                  <Paragraph><Text strong>Ghi chú:</Text> {orderDetails.shippingDetails.notes}</Paragraph>
                )}
              </Card>
            </Col>
          </Row>
        </div>
        
        <Divider>
          <div style={{ padding: '5px 15px', background: '#f6ffed', borderRadius: '40px', display: 'inline-block' }}>
            <InfoCircleOutlined style={{ marginRight: '5px', color: '#52c41a' }} /> Thông tin hữu ích
          </div>
        </Divider>
        
        <Row gutter={[16, 16]} style={{ marginBottom: '30px' }}>
          <Col xs={24} md={8}>
            <Card style={{ height: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <ShoppingOutlined style={{ fontSize: '36px', color: '#1890ff', marginBottom: '12px' }} />
                <Paragraph><Text strong>Theo dõi đơn hàng</Text></Paragraph>
                <Paragraph>Bạn có thể xem và theo dõi trạng thái đơn hàng trong mục "Đơn hàng của tôi"</Paragraph>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} md={8}>
            <Card style={{ height: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <CustomerServiceOutlined style={{ fontSize: '36px', color: '#1890ff', marginBottom: '12px' }} />
                <Paragraph><Text strong>Hỗ trợ khách hàng</Text></Paragraph>
                <Paragraph>Gọi hotline: <Text strong>1900 1234</Text> hoặc trò chuyện với chúng tôi qua chat</Paragraph>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} md={8}>
            <Card style={{ height: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <CarOutlined style={{ fontSize: '36px', color: '#1890ff', marginBottom: '12px' }} />
                <Paragraph><Text strong>Thời gian giao hàng</Text></Paragraph>
                <Paragraph>Đơn hàng sẽ được giao trong vòng 2-5 ngày làm việc</Paragraph>
              </div>
            </Card>
          </Col>
        </Row>
        
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Space size="large">
            <Button 
              type="primary" 
              icon={<ShoppingOutlined />} 
              size="large"
              onClick={() => navigate('/')}
              style={{ height: 'auto', minHeight: '50px', padding: '8px 25px' }}
            >
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Tiếp tục mua sắm</div>
                <div style={{ fontSize: '12px' }}>Quay lại trang chủ</div>
              </div>
            </Button>
            <Button
              icon={<FileTextOutlined />}
              size="large"
              onClick={() => navigate('/orders')}
              style={{ height: 'auto', minHeight: '50px', padding: '8px 25px' }}
            >
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Xem đơn hàng</div>
                <div style={{ fontSize: '12px' }}>Theo dõi trạng thái đơn hàng</div>
              </div>
            </Button>
          </Space>
          
          <div style={{ marginTop: '20px' }}>
            <Paragraph type="secondary">
              Thông tin đơn hàng đã được gửi đến hộp tin nhắn và email của bạn
            </Paragraph>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage; 