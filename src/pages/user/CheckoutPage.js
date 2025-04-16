import { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Radio, Divider, Row, Col, Card, Typography, Steps, message, Space, Modal, Checkbox, Tooltip, Tag, notification, Spin, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { createOrder } from '../../services/api/orderApi';
import { validateVoucher, applyVoucher } from '../../services/api/voucherApi';
import { CopyOutlined, CheckOutlined, InfoCircleOutlined, TagOutlined, ShoppingOutlined, FileTextOutlined, CheckCircleOutlined, CustomerServiceOutlined, CarOutlined, DeleteOutlined } from '@ant-design/icons';
import { sendSystemMessage } from '../../components/ChatBox/ChatBox';

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

  const [orderData, setOrderData] = useState(null);

  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingFee, setShippingFee] = useState(30000);
  const [orderSuccessModalVisible, setOrderSuccessModalVisible] = useState(false);
  const [voucherErrorMessage, setVoucherErrorMessage] = useState(null);

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
  
  // Xử lý khi áp dụng mã giảm giá
  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) {
      message.warning({
        content: 'Vui lòng nhập mã giảm giá',
        style: { marginTop: '20vh' },
      });
      return;
    }
    
    setVoucherLoading(true);
    console.log('Đang áp dụng mã giảm giá:', voucherCode);
    
    applyVoucher(voucherCode, getCartTotal(), shippingFee)
      .then(result => {
        setAppliedVoucher(result.voucher);
        setDiscountAmount(result.discount);
        setShippingFee(result.shippingFee);
        
        // Thông báo chi tiết và trực quan hơn dựa theo loại voucher
        let successMsg = '';
        let iconType = '';
        
        switch (result.voucher.type) {
          case 'percent':
            successMsg = `Chúc mừng! Bạn đã được giảm ${result.voucher.value}% (${result.discount.toLocaleString('vi-VN')}đ)`;
            iconType = 'success';
            break;
          case 'fixed':
            successMsg = `Chúc mừng! Bạn đã được giảm ${result.discount.toLocaleString('vi-VN')}đ`;
            iconType = 'success';
            break;
          case 'shipping':
            successMsg = `Chúc mừng! Bạn đã được miễn phí vận chuyển ${result.discount.toLocaleString('vi-VN')}đ`;
            iconType = 'success';
            break;
          default:
            successMsg = `Đã áp dụng mã giảm giá thành công`;
            iconType = 'success';
        }
        
        // Hiển thị thông báo thành công với chi tiết
        message.open({
          type: iconType,
          content: successMsg,
          duration: 5,
          style: {
            marginTop: '20vh',
          },
        });
      })
      .catch(error => {
        // Thông báo chi tiết khi có lỗi
        console.error('Lỗi khi áp dụng mã giảm giá:', error);
        
        let errorContent = error.message || 'Không thể áp dụng mã giảm giá. Vui lòng kiểm tra lại mã.';
        let errorTitle = 'Không thể áp dụng mã giảm giá';
        let errorType = 'error';
        let meoContent = '';
        let errorDuration = 7;
        
        // Kiểm tra lỗi cụ thể để hiển thị thông báo hướng dẫn
        if (errorContent.includes("không tồn tại")) {
          errorTitle = 'Mã giảm giá không tồn tại';
          meoContent = 'Vui lòng kiểm tra lại mã giảm giá. Mã có thể đã nhập sai.';
        }
        else if (errorContent.includes("chưa đạt giá trị tối thiểu")) {
          errorTitle = 'Đơn hàng chưa đạt giá trị tối thiểu';
          meoContent = 'Mẹo: Thêm sản phẩm vào giỏ hàng để đạt giá trị tối thiểu cho mã giảm giá này';
        } 
        else if (errorContent.includes("đã hết hạn")) {
          errorTitle = 'Mã giảm giá đã hết hạn';
          meoContent = 'Mẹo: Kiểm tra các mã giảm giá khác trong mục "Khuyến mãi" hoặc đánh giá sản phẩm để nhận mã mới';
        }
        else if (errorContent.includes("đã đạt giới hạn lượt sử dụng")) {
          errorTitle = 'Mã giảm giá đã hết lượt sử dụng';
          meoContent = 'Mẹo: Đánh giá sản phẩm để nhận mã giảm giá mới hoặc liên hệ bộ phận CSKH';
        }
        else if (errorContent.includes("đã hết hiệu lực")) {
          errorTitle = 'Mã giảm giá đã hết hiệu lực';
          meoContent = 'Mã này đã bị vô hiệu hóa. Vui lòng sử dụng mã khác.';
        }
        
        // Hiển thị thông báo hộp thoại lớn
        notification.error({
          message: errorTitle,
          description: (
            <div>
              <div>{errorContent}</div>
              {meoContent && (
                <div style={{ marginTop: '10px', fontSize: '13px', color: '#722ed1' }}>
                  <InfoCircleOutlined style={{ marginRight: '5px' }} />
                  {meoContent}
                </div>
              )}
            </div>
          ),
          duration: errorDuration,
          style: { width: 400 }
        });
        
        // Đồng thời hiển thị Alert trực tiếp trong trang
        setAppliedVoucher(null);
        setDiscountAmount(0);
        setShippingFee(30000); // Reset về phí vận chuyển mặc định
        
        // Thêm state để lưu thông báo lỗi
        setVoucherErrorMessage({
          title: errorTitle,
          content: errorContent,
          tip: meoContent
        });
      })
      .finally(() => {
        setVoucherLoading(false);
      });
  };
  
  // Xóa thông báo lỗi khi người dùng sửa mã voucher
  const handleVoucherCodeChange = (e) => {
    setVoucherCode(e.target.value);
    if (voucherErrorMessage) {
      setVoucherErrorMessage(null);
    }
  };
  
  // Xử lý khi hủy mã giảm giá
  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setDiscountAmount(0);
    setShippingFee(30000); // Reset về phí vận chuyển mặc định
    setVoucherCode('');
    message.info('Đã hủy mã giảm giá');
  };
  
  // Xử lý khi người dùng bấm nút "Đặt hàng"
  const handleSubmitOrder = () => {
    form.validateFields().then(formValues => {
      if (formValues.paymentMethod === 'cod') {
        // Hiển thị modal xác nhận thanh toán COD
        setCodConfirmVisible(true);
      } else {
        // Chuẩn bị dữ liệu đơn hàng
        prepareOrderData(formValues);
      }
    });
  };
  
  // Chuẩn bị dữ liệu đơn hàng
  const prepareOrderData = (formValues) => {
    // Tạo mã đơn hàng nếu chưa có
    const finalOrderCode = orderCode || generateOrderCode();
    setOrderCode(finalOrderCode);
    
    // Tạo đơn hàng mới
    const data = {
      userId: currentUser.id,
      orderCode: finalOrderCode,
      items: cart,
      shippingDetails: {
        name: formValues.name,
        phone: formValues.phone,
        email: formValues.email,
        address: formValues.address,
        notes: formValues.notes
      },
      paymentMethod: formValues.paymentMethod,
      subtotal: getCartTotal(),
      shippingFee: shippingFee,
      discount: discountAmount,
      voucher: appliedVoucher ? appliedVoucher.code : null,
      total: getCartTotal() + shippingFee - discountAmount,
      paymentStatus: formValues.paymentMethod === 'cod' ? 'pending' : 'processing'
    };
    
    setOrderData(data);
    
    // Nếu thanh toán bằng chuyển khoản, hiển thị QR
    if (formValues.paymentMethod === 'bank_transfer') {
      setQrVisible(true);
    } else {
      // Lưu đơn hàng và chuyển đến bước hoàn thành
      finalizeOrder(data);
    }
  };
  
  // Lưu đơn hàng và hoàn tất
  const finalizeOrder = async (data) => {
    setLoading(true);
    
    try {
      await createOrder(data);
      clearCart();
      setCurrentStep(2);
      message.success('Đặt hàng thành công!');
      
      // Nếu thanh toán bằng COD, chuyển đến trang order success
      if (data.paymentMethod === 'cod') {
        clearCart();
        // Chuyển đến trang order success với thông tin đơn hàng
        navigate('/order-success', { 
          state: { orderDetails: data }
        });
      } else {
        // Nếu thanh toán chuyển khoản, hiển thị QR
        setQrVisible(true);
      }
      
      // Gửi thông báo đặt hàng thành công qua chatbot
      try {
        await sendSystemMessage(
          currentUser.id, 
          `🎉 Đặt hàng thành công! 🎉\n\nĐơn hàng: ${data.orderCode}\nTổng tiền: ${data.total.toLocaleString('vi-VN')}đ\nPhương thức thanh toán: ${data.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}\n\nBạn có thể xem chi tiết đơn hàng trong mục "Đơn hàng của tôi". Cảm ơn bạn đã mua sắm tại CLOTHE Shop!`
        );
      } catch (chatError) {
        console.error('Lỗi khi gửi thông báo qua chat:', chatError);
      }

    } catch (error) {
      console.error('Lỗi khi đặt hàng:', error);
      notification.error({
        message: 'Đặt hàng thất bại',
        description: 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.',
        duration: 10
      });
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi xác nhận thanh toán COD
  const handleConfirmCOD = () => {
    setCodConfirmVisible(false);
    form.validateFields().then(formValues => {
      prepareOrderData(formValues);
    });
  };

  // Xử lý khi hoàn tất thanh toán chuyển khoản
  const handleCompletePayment = async () => {
    try {
      const formValues = await form.validateFields();
      const orderData = {
        userId: currentUser.id,
        orderCode: orderCode,
        items: cart,
        shippingDetails: {
          name: formValues.name,
          phone: formValues.phone,
          email: formValues.email,
          address: formValues.address,
          notes: formValues.notes
        },
        paymentMethod: 'bank_transfer',
        subtotal: getCartTotal(),
        shippingFee: shippingFee,
        discount: discountAmount,
        voucher: appliedVoucher ? appliedVoucher.code : null,
        total: getCartTotal() + shippingFee - discountAmount,
        paymentStatus: 'confirmed'
      };
      
      clearCart();
      setQrVisible(false);
      
      // Chuyển đến trang order success
      navigate('/order-success', { 
        state: { orderDetails: orderData }
      });
      
      notification.success({
        message: '✅ Thanh toán thành công!',
        description: `Đơn hàng ${orderCode} đã được xác nhận thanh toán thành công! Đang chuyển đến trang xác nhận đặt hàng...`,
        duration: 3,
        placement: 'topRight',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      });

      // Gửi thông báo xác nhận thanh toán qua chatbot
      try {
        await sendSystemMessage(
          currentUser.id, 
          `✅ Cảm ơn bạn đã hoàn tất thanh toán!\n\nĐơn hàng: ${orderCode}\nPhương thức: Chuyển khoản ngân hàng\n\nChúng tôi sẽ xử lý đơn hàng và thông báo cho bạn khi đơn hàng được vận chuyển.`
        );
      } catch (chatError) {
        console.error('Lỗi khi gửi thông báo thanh toán:', chatError);
      }
    } catch (error) {
      console.error('Lỗi khi hoàn tất thanh toán:', error);
    }
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
    const amount = getCartTotal() + shippingFee - discountAmount;
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
                  <Col span={16}><Text type="danger">{(getCartTotal() + shippingFee).toLocaleString('vi-VN')}đ</Text></Col>
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
          
          {/* Phần mã giảm giá */}
          <div style={{ marginBottom: 20 }}>
            <Row gutter={[8, 8]} align="middle">
              <Col span={16}>
                <Input
                  placeholder="Nhập mã giảm giá"
                  value={voucherCode}
                  onChange={handleVoucherCodeChange}
                  disabled={!!appliedVoucher}
                  prefix={<TagOutlined style={{ color: '#1890ff' }} />}
                />
              </Col>
              <Col span={8}>
                {!appliedVoucher ? (
                  <Button 
                    type="primary" 
                    onClick={handleApplyVoucher} 
                    loading={voucherLoading}
                    style={{ width: '100%' }}
                  >
                    Áp dụng
                  </Button>
                ) : (
                  <Button 
                    danger 
                    onClick={handleRemoveVoucher}
                    style={{ width: '100%' }}
                  >
                    Hủy mã
                  </Button>
                )}
              </Col>
            </Row>
            
            {/* Hiển thị thông báo lỗi voucher */}
            {voucherErrorMessage && (
              <Alert
                message={voucherErrorMessage.title}
                description={
                  <div>
                    <div>{voucherErrorMessage.content}</div>
                    {voucherErrorMessage.tip && (
                      <div style={{ marginTop: '10px', fontSize: '13px', color: '#722ed1' }}>
                        <InfoCircleOutlined style={{ marginRight: '5px' }} />
                        {voucherErrorMessage.tip}
                      </div>
                    )}
                  </div>
                }
                type="error"
                showIcon
                closable
                onClose={() => setVoucherErrorMessage(null)}
                style={{ marginTop: '10px' }}
              />
            )}
            
            {appliedVoucher && (
              <div className="applied-voucher-info" style={{ marginBottom: '15px' }}>
                <div style={{ 
                  border: '1px solid #b7eb8f', 
                  borderRadius: '6px', 
                  padding: '10px 15px',
                  backgroundColor: '#f6ffed',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#389e0d', display: 'flex', alignItems: 'center' }}>
                      <CheckCircleOutlined style={{ marginRight: '6px' }} /> 
                      Mã giảm giá: {appliedVoucher.code}
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                      {appliedVoucher.description}
                    </div>
                    <div style={{ fontSize: '13px', marginTop: '4px', color: '#f5222d', fontWeight: 'bold' }}>
                      Tiết kiệm: {discountAmount.toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                  <Button 
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      setAppliedVoucher(null);
                      setDiscountAmount(0);
                      setShippingFee(30000);
                      message.info('Đã xóa mã giảm giá');
                    }}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            )}
          </div>
          
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
                {shippingFee.toLocaleString('vi-VN')}đ
              </Col>
            </Row>
            
            {discountAmount > 0 && (
              <Row style={{ marginBottom: 8 }}>
                <Col span={16}>Giảm giá</Col>
                <Col span={8} style={{ textAlign: 'right', color: '#52c41a' }}>
                  -{discountAmount.toLocaleString('vi-VN')}đ
                </Col>
              </Row>
            )}
            
            <Divider style={{ margin: '12px 0' }} />
            
            <Row>
              <Col span={16}><Text strong>Tổng cộng</Text></Col>
              <Col span={8} style={{ textAlign: 'right' }}>
                <Text strong style={{ fontSize: '16px', color: 'red' }}>
                  {(getCartTotal() + shippingFee - discountAmount).toLocaleString('vi-VN')}đ
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
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ marginBottom: '20px' }}>
            <Spin size="large" />
          </div>
          <Title level={3}>Đang xử lý đơn hàng...</Title>
          <Paragraph>
            Vui lòng đợi trong giây lát, chúng tôi đang chuyển hướng bạn đến trang xác nhận đặt hàng.
          </Paragraph>
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
          Tổng số tiền cần thanh toán khi nhận hàng: <Text strong style={{ color: 'red' }}>{(getCartTotal() + shippingFee - discountAmount).toLocaleString('vi-VN')}đ</Text>
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
          key="complete" 
          type="primary" 
          onClick={handleCompletePayment}
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
              <Col span={14}><Text type="danger">{(getCartTotal() + shippingFee - discountAmount).toLocaleString('vi-VN')}đ</Text></Col>
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
              Sau khi chuyển khoản, hãy nhấn <Text strong>"Hoàn tất đơn hàng"</Text> để hoàn thành quá trình đặt hàng.
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
