import { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Radio, Divider, Row, Col, Card, Typography, Steps, message, Space, Modal, Checkbox } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { createOrder } from '../../services/api/orderApi';
import { CopyOutlined, CheckOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;

const CheckoutPage = () => {
  const [form] = Form.useForm();
  const { cart, getCartTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [orderCode, setOrderCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [qrVisible, setQrVisible] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [codConfirmVisible, setCodConfirmVisible] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  
  // Thiết lập giá trị mặc định từ thông tin người dùng
  useEffect(() => {
    if (currentUser) {
      form.setFieldsValue({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        address: currentUser.address,
        paymentMethod: 'cod'
      });
    }
  }, [currentUser, form]);
  
  // Kiểm tra giỏ hàng trống
  useEffect(() => {
    if (cart.length === 0) {
      message.warning('Giỏ hàng của bạn đang trống');
      navigate('/cart');
    }
  }, [cart, navigate]);
  
  // Sinh mã đơn hàng ngẫu nhiên
  const generateOrderCode = () => {
    const timestamp = new Date().getTime().toString().slice(-6);
    const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `HD${timestamp}${randomChars}`;
  };

  // Xử lý khi thay đổi phương thức thanh toán
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    
    // Nếu chọn chuyển khoản, tạo mã đơn hàng
    if (e.target.value === 'bank_transfer' && !orderCode) {
      setOrderCode(generateOrderCode());
    }
  };
  
  // Xử lý khi copy mã đơn hàng
  const handleCopyOrderCode = () => {
    navigator.clipboard.writeText(orderCode)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
        message.success('Đã sao chép mã đơn hàng');
      })
      .catch(err => {
        console.error('Lỗi khi sao chép:', err);
        message.error('Không thể sao chép mã đơn hàng');
      });
  };
  
  // Xử lý khi người dùng bấm nút "Đặt hàng"
  const handleSubmitOrder = () => {
    form.validateFields().then(values => {
      if (values.paymentMethod === 'cod') {
        // Hiển thị modal xác nhận thanh toán COD
        setCodConfirmVisible(true);
      } else {
        // Tiến hành đặt hàng với chuyển khoản
        onFinish(values);
      }
    });
  };
  
  const onFinish = async (values) => {
    setLoading(true);
    
    try {
      // Tạo mã đơn hàng nếu chưa có
      const finalOrderCode = orderCode || generateOrderCode();
      setOrderCode(finalOrderCode);
      
      // Tạo đơn hàng mới
      const orderData = {
        userId: currentUser.id,
        orderCode: finalOrderCode,
        items: cart,
        shippingDetails: {
          name: values.name,
          phone: values.phone,
          email: values.email,
          address: values.address,
          notes: values.notes
        },
        paymentMethod: values.paymentMethod,
        subtotal: getCartTotal(),
        shippingFee: 30000,
        total: getCartTotal() + 30000,
        paymentStatus: values.paymentMethod === 'cod' ? 'pending' : 'processing'
      };
      
      const order = await createOrder(orderData);
      
      // Nếu thanh toán bằng chuyển khoản, hiển thị QR
      if (values.paymentMethod === 'bank_transfer') {
        setQrVisible(true);
      } else {
        // Chuyển đến bước hoàn thành
        clearCart();
        setCurrentStep(2);
        message.success('Đặt hàng thành công!');
      }
      
    } catch (error) {
      console.error('Lỗi khi đặt hàng:', error);
      message.error('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi xác nhận thanh toán COD
  const handleConfirmCOD = () => {
    setCodConfirmVisible(false);
    form.validateFields().then(values => {
      onFinish(values);
    });
  };

  // Xử lý khi hoàn tất thanh toán chuyển khoản
  const handleCompletePayment = () => {
    clearCart();
    setQrVisible(false);
    setCurrentStep(2);
    message.success('Đặt hàng thành công!');
  };

  // Xử lý khi tự xác nhận đã chuyển khoản
  const handleSelfConfirmPayment = () => {
    setPaymentConfirmed(true);
    message.success('Cảm ơn bạn đã xác nhận thanh toán!');
  };
  
  const nextStep = () => {
    form.validateFields().then(() => {
      setCurrentStep(currentStep + 1);
    });
  };
  
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  // Tạo URL QR VietQR
  const getQRCodeUrl = () => {
    const amount = getCartTotal() + 30000;
    const bankCode = 'VCB'; // Vietcombank
    const accountNumber = '9979542918';
    const accountName = 'BUI+VAN+HIEP';
    const addInfo = orderCode || '';
    
    return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact.png?amount=${amount}&addInfo=${addInfo}&accountName=${accountName}`;
  };
  
  // Nội dung các bước
  const steps = [
    {
      title: 'Thông tin giao hàng',
      content: (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Form.Item
            name="name"
            label="Họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="address"
            label="Địa chỉ giao hàng"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ giao hàng!' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          
          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea rows={2} placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay địa điểm giao hàng chi tiết hơn" />
          </Form.Item>
        </div>
      )
    },
    {
      title: 'Thanh toán',
      content: (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Form.Item
            name="paymentMethod"
            label="Phương thức thanh toán"
            rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán!' }]}
          >
            <Radio.Group onChange={handlePaymentMethodChange}>
              <Radio value="cod">Thanh toán khi nhận hàng (COD)</Radio>
              <Radio value="bank_transfer">Chuyển khoản ngân hàng</Radio>
            </Radio.Group>
          </Form.Item>
          
          {paymentMethod === 'bank_transfer' && (
            <Card 
              style={{ marginTop: 16, background: '#f9f9f9', borderRadius: 8 }}
              title={<Text strong>Thông tin chuyển khoản</Text>}
            >
              <div style={{ marginBottom: 16 }}>
                <Row>
                  <Col span={8}><Text strong>Ngân hàng:</Text></Col>
                  <Col span={16}>Vietcombank</Col>
                </Row>
                <Row>
                  <Col span={8}><Text strong>Số tài khoản:</Text></Col>
                  <Col span={16}>9979542918</Col>
                </Row>
                <Row>
                  <Col span={8}><Text strong>Tên người nhận:</Text></Col>
                  <Col span={16}>BUI VAN HIEP</Col>
                </Row>
                <Row>
                  <Col span={8}><Text strong>Số tiền:</Text></Col>
                  <Col span={16}><Text type="danger">{(getCartTotal() + 30000).toLocaleString('vi-VN')}đ</Text></Col>
                </Row>
                <Row>
                  <Col span={8}><Text strong>Nội dung CK:</Text></Col>
                  <Col span={16}>
                    <Space>
                      <Text copyable>{orderCode}</Text>
                      <Button 
                        size="small" 
                        icon={copySuccess ? <CheckOutlined /> : <CopyOutlined />} 
                        onClick={handleCopyOrderCode}
                        type={copySuccess ? "primary" : "default"}
                      >
                        {copySuccess ? 'Đã sao chép' : 'Sao chép mã'}
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </div>
              <Text type="secondary">
                * Sau khi đặt hàng, mã QR sẽ hiển thị để quét thanh toán từ ứng dụng ngân hàng của bạn.
              </Text>
            </Card>
          )}
          
          <Divider />
          
          <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
            <Title level={5}>Thông tin đơn hàng</Title>
            
            {cart.map((item, index) => (
              <Row key={index} style={{ marginBottom: 8 }}>
                <Col span={16}>
                  {item.name} x {item.quantity} ({item.selectedSize}, {item.selectedColor})
                </Col>
                <Col span={8} style={{ textAlign: 'right' }}>
                  {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                </Col>
              </Row>
            ))}
            
            <Divider style={{ margin: '12px 0' }} />
            
            <Row style={{ marginBottom: 8 }}>
              <Col span={16}>Tạm tính</Col>
              <Col span={8} style={{ textAlign: 'right' }}>
                {getCartTotal().toLocaleString('vi-VN')}đ
              </Col>
            </Row>
            
            <Row style={{ marginBottom: 8 }}>
              <Col span={16}>Phí vận chuyển</Col>
              <Col span={8} style={{ textAlign: 'right' }}>
                30,000đ
              </Col>
            </Row>
            
            <Divider style={{ margin: '12px 0' }} />
            
            <Row>
              <Col span={16}><Text strong>Tổng cộng</Text></Col>
              <Col span={8} style={{ textAlign: 'right' }}>
                <Text strong style={{ fontSize: '16px', color: 'red' }}>
                  {(getCartTotal() + 30000).toLocaleString('vi-VN')}đ
                </Text>
              </Col>
            </Row>
          </div>
        </div>
      )
    },
    {
      title: 'Hoàn thành',
      content: (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <img 
            src="https://cdn-icons-png.flaticon.com/512/190/190411.png" 
            alt="Success" 
            style={{ width: 100, height: 100, margin: '0 auto 20px' }} 
          />
          <Title level={3}>Đặt hàng thành công!</Title>
          <Text>
            Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.
          </Text>
          <div style={{ marginTop: 20 }}>
            <Button type="primary" onClick={() => navigate('/')}>
              Quay lại trang chủ
            </Button>
          </div>
        </div>
      )
    }
  ];

  // Modal xác nhận thanh toán COD
  const renderCODConfirmModal = () => (
    <Modal
      title={<span><InfoCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />Xác nhận đặt hàng</span>}
      visible={codConfirmVisible}
      onOk={handleConfirmCOD}
      onCancel={() => setCodConfirmVisible(false)}
      okText="Xác nhận đặt hàng"
      cancelText="Hủy"
    >
      <div style={{ padding: '10px 0' }}>
        <Paragraph>
          Bạn đang chọn phương thức <Text strong>Thanh toán khi nhận hàng (COD)</Text>.
        </Paragraph>
        <Paragraph>
          Đơn hàng của bạn sẽ được giao đến địa chỉ: <Text strong>{form.getFieldValue('address')}</Text>
        </Paragraph>
        <Paragraph>
          Tổng số tiền cần thanh toán khi nhận hàng: <Text strong style={{ color: 'red' }}>{(getCartTotal() + 30000).toLocaleString('vi-VN')}đ</Text>
        </Paragraph>
        <Paragraph type="secondary">
          Lưu ý: Vui lòng chuẩn bị đúng số tiền khi nhận hàng để việc giao nhận được thuận lợi.
        </Paragraph>
      </div>
    </Modal>
  );

  // Modal QR thanh toán
  const renderQRModal = () => (
    <Modal
      title="Quét mã QR để thanh toán"
      visible={qrVisible}
      footer={[
        <Button 
          key="selfConfirm" 
          type={paymentConfirmed ? "default" : "primary"} 
          onClick={handleSelfConfirmPayment}
          disabled={paymentConfirmed}
          style={{ marginRight: 8 }}
        >
          {paymentConfirmed ? "Đã xác nhận thanh toán" : "Tôi đã thanh toán"}
        </Button>,
        <Button 
          key="complete" 
          type={paymentConfirmed ? "primary" : "default"} 
          onClick={handleCompletePayment}
          disabled={!paymentConfirmed}
        >
          Hoàn tất đơn hàng
        </Button>,
      ]}
      onCancel={() => setQrVisible(false)}
      width={400}
    >
      <div style={{ textAlign: 'center' }}>
        <img 
          src={getQRCodeUrl()} 
          alt="QR Code" 
          style={{ width: '100%', maxWidth: 300, margin: '0 auto' }} 
        />
        <div style={{ marginTop: 20 }}>
          <Title level={5}>Thông tin chuyển khoản</Title>
          <div style={{ textAlign: 'left' }}>
            <Row>
              <Col span={10}><Text strong>Ngân hàng:</Text></Col>
              <Col span={14}>Vietcombank</Col>
            </Row>
            <Row>
              <Col span={10}><Text strong>Số tài khoản:</Text></Col>
              <Col span={14}>9979542918</Col>
            </Row>
            <Row>
              <Col span={10}><Text strong>Tên người nhận:</Text></Col>
              <Col span={14}>BUI VAN HIEP</Col>
            </Row>
            <Row>
              <Col span={10}><Text strong>Số tiền:</Text></Col>
              <Col span={14}><Text type="danger">{(getCartTotal() + 30000).toLocaleString('vi-VN')}đ</Text></Col>
            </Row>
            <Row>
              <Col span={10}><Text strong>Nội dung CK:</Text></Col>
              <Col span={14}>
                <Space>
                  <Text>{orderCode}</Text>
                  <Button 
                    size="small" 
                    icon={copySuccess ? <CheckOutlined /> : <CopyOutlined />} 
                    onClick={handleCopyOrderCode}
                    type={copySuccess ? "primary" : "default"}
                  >
                    {copySuccess ? 'Đã sao chép' : 'Sao chép'}
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>
          <div style={{ marginTop: 16, padding: 10, border: '1px solid #f0f0f0', borderRadius: 8, backgroundColor: '#fafafa' }}>
            <Paragraph type="secondary">
              <InfoCircleOutlined style={{ color: '#1890ff', marginRight: 5 }} />
              Sử dụng ứng dụng ngân hàng để quét mã QR hoặc chuyển khoản thủ công với thông tin trên.
            </Paragraph>
            <Paragraph type="secondary">
              Sau khi chuyển khoản, hãy nhấn <Text strong>"Tôi đã thanh toán"</Text> và sau đó nhấn <Text strong>"Hoàn tất đơn hàng"</Text>.
            </Paragraph>
          </div>
        </div>
      </div>
    </Modal>
  );
  
  return (
    <div>
      <Title level={2}>Thanh toán</Title>
      
      <Steps current={currentStep} style={{ marginBottom: 40 }}>
        {steps.map(item => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ paymentMethod: 'cod' }}
        >
          {steps[currentStep].content}
          
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            {currentStep > 0 && currentStep < 2 && (
              <Button style={{ marginRight: 8 }} onClick={prevStep}>
                Quay lại
              </Button>
            )}
            
            {currentStep < 1 && (
              <Button type="primary" onClick={nextStep}>
                Tiếp tục
              </Button>
            )}
            
            {currentStep === 1 && (
              <Button type="primary" loading={loading} onClick={handleSubmitOrder}>
                Đặt hàng
              </Button>
            )}
          </div>
        </Form>
      </Card>
      
      {/* COD Confirm Modal */}
      {renderCODConfirmModal()}
      
      {/* QR Modal */}
      {renderQRModal()}
    </div>
  );
};

export default CheckoutPage;
