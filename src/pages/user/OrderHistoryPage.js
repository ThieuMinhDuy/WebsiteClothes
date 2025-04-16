import { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Empty, Steps, Spin, Typography, Modal, Descriptions, Divider, Rate, Input, message, Timeline, Tooltip, Row, Col, Card } from 'antd';
import { EyeOutlined, CheckCircleOutlined, ClockCircleOutlined, StopOutlined, StarOutlined, UserOutlined, ShoppingOutlined, CarOutlined, FormOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { getOrders } from '../../services/api/orderApi';
import { checkProductReviewed, addProductReview, saveReview } from '../../services/api/productApi';
import { generateReviewVoucher } from '../../services/api/voucherApi';
import { sendSystemMessage } from '../../components/ChatBox/ChatBox';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TextArea } = Input;

const OrderHistoryPage = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [currentOrderItem, setCurrentOrderItem] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedItems, setReviewedItems] = useState({});
  const [hasReviewed, setHasReviewed] = useState(false);
  const [voucherModalVisible, setVoucherModalVisible] = useState(false);
  const [reviewVoucher, setReviewVoucher] = useState(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  // Tải đơn hàng của người dùng
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const ordersData = await getOrders(currentUser.id);
        setOrders(ordersData);
        
        // Kiểm tra xem người dùng đã đánh giá lần nào chưa
        const reviewed = ordersData.some(order => 
          order.items && order.items.some(item => item.reviewed)
        );
        
        setHasReviewed(reviewed);
        
        // Khởi tạo đối tượng lưu trạng thái đánh giá của các sản phẩm
        const reviewedMap = {};
        for (const order of ordersData) {
          if (order.status === 'delivered' && order.items) {
            for (const item of order.items) {
              const key = `${order.id}-${item.id}`;
              reviewedMap[key] = order.reviewedItems?.includes(item.id) || false;
            }
          }
        }
        setReviewedItems(reviewedMap);
      } catch (error) {
        console.error('Lỗi khi tải lịch sử đơn hàng:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [currentUser]);

  // Hiển thị chi tiết đơn hàng
  const showOrderDetail = (order) => {
    setCurrentOrder(order);
    setModalVisible(true);
  };

  // Hiển thị modal đánh giá sản phẩm
  const showReviewModal = (order, item) => {
    setCurrentOrderItem({ order, item });
    setReviewForm({
      rating: 5,
      comment: ''
    });
    setReviewModalVisible(true);
  };

  // Gửi đánh giá sản phẩm
  const handleReviewSubmit = async () => {
    if (!currentOrderItem) return;

    try {
      const { order, item } = currentOrderItem;
      
      await saveReview({
        userId: currentUser.id,
        productId: item.id,
        orderId: order.id,
        orderItemId: item.cartItemId,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        reviewDate: new Date().toISOString(),
        userName: currentUser.name || 'Khách hàng',
      });

      // Kiểm tra xem đây có phải lần đánh giá đầu tiên không
      if (!hasReviewed) {
        // Tạo voucher giảm giá 10% cho khách hàng đánh giá lần đầu
        const voucher = await generateReviewVoucher(currentUser.id);
        
        // Lưu voucher để hiển thị trong modal
        setReviewVoucher(voucher);
        setVoucherModalVisible(true);
        setHasReviewed(true);
        
        // Gửi thông báo và mã giảm giá qua chatbot
        const messageContent = `Cảm ơn bạn đã đánh giá sản phẩm lần đầu! Chúng tôi đã tặng bạn một mã giảm giá 10% cho đơn hàng tiếp theo.`;
        try {
          await sendSystemMessage(currentUser.id, messageContent, voucher);
          message.success('Mã giảm giá đã được gửi đến hộp tin nhắn của bạn!');
        } catch (chatError) {
          console.error('Lỗi khi gửi tin nhắn voucher:', chatError);
        }
      }

      message.success('Đánh giá sản phẩm thành công!');
      setReviewModalVisible(false);
      
      // Cập nhật trạng thái đã đánh giá cho sản phẩm
      const updatedOrders = orders.map(o => {
        if (o.id === order.id) {
          return {
            ...o,
            items: o.items.map(i => {
              if (i.id === item.id) {
                return { ...i, reviewed: true };
              }
              return i;
            })
          };
        }
        return o;
      });
      
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Error submitting review:', error);
      message.error('Không thể gửi đánh giá. Vui lòng thử lại sau!');
    }
  };

  // Kiểm tra sản phẩm đã được đánh giá chưa
  const isProductReviewed = (orderId, productId) => {
    const key = `${orderId}-${productId}`;
    return reviewedItems[key] || false;
  };

  // Lấy trạng thái đơn hàng hiện tại
  const getCurrentStep = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'shipping': return 2;
      case 'delivered': return 3;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  // Định nghĩa cột cho bảng đơn hàng
  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      render: id => <Text copyable>{id}</Text>,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: createdAt => new Date(createdAt).toLocaleDateString('vi-VN'),
      sorter: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
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
        const statusMap = {
          pending: { color: 'gold', text: 'Chờ xác nhận', icon: <ClockCircleOutlined /> },
          confirmed: { color: 'blue', text: 'Đã xác nhận', icon: <CheckCircleOutlined /> },
          shipping: { color: 'cyan', text: 'Đang giao hàng', icon: <ClockCircleOutlined /> },
          delivered: { color: 'green', text: 'Đã giao hàng', icon: <CheckCircleOutlined /> },
          cancelled: { color: 'red', text: 'Đã hủy', icon: <StopOutlined /> }
        };
        return (
          <Tag color={statusMap[status].color} icon={statusMap[status].icon}>
            {statusMap[status].text}
          </Tag>
        );
      },
      filters: [
        { text: 'Chờ xác nhận', value: 'pending' },
        { text: 'Đã xác nhận', value: 'confirmed' },
        { text: 'Đang giao hàng', value: 'shipping' },
        { text: 'Đã giao hàng', value: 'delivered' },
        { text: 'Đã hủy', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />} 
          onClick={() => showOrderDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Lịch sử đơn hàng</Title>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : orders.length === 0 ? (
        <Empty 
          description="Bạn chưa có đơn hàng nào" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Table 
          columns={columns} 
          dataSource={orders} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
          expandable={{
            expandedRowKeys,
            onExpandedRowsChange: (expandedRows) => setExpandedRowKeys(expandedRows),
            expandedRowRender: (record) => (
              <div style={{ padding: 8 }}>
                <div style={{ marginBottom: 16 }}>
                  <Title level={5}>Chi tiết đơn hàng</Title>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>Mã đơn hàng:</Text> {record.id}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>Ngày đặt:</Text> {new Date(record.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>Địa chỉ giao hàng:</Text> {record.shippingDetails?.address}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>Phương thức thanh toán:</Text> {record.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}
                  </div>
                  {record.shippingDetails?.notes && (
                    <div style={{ marginBottom: 8 }}>
                      <Text strong>Ghi chú:</Text> {record.shippingDetails.notes}
                    </div>
                  )}
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <Title level={5}>Sản phẩm đã mua</Title>
                  {record.items.map((item, index) => (
                    <div 
                      key={index} 
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: index < record.items.length - 1 ? '1px solid #f0f0f0' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img 
                          src={item.images[0] || "https://via.placeholder.com/50x50?text=No+Image"} 
                          alt={item.name}
                          style={{ width: 70, height: 70, objectFit: 'cover', marginRight: 16 }} 
                        />
                        <div>
                          <div>{item.name}</div>
                          <div style={{ color: '#888', fontSize: 12 }}>
                            Size: {item.selectedSize}, Màu: {item.selectedColor} x {item.quantity}
                          </div>
                          <div style={{ fontWeight: 'bold' }}>
                            {item.price.toLocaleString('vi-VN')}đ
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        {record.status === 'completed' && (
                          <Button 
                            type={item.reviewed ? "default" : "primary"} 
                            icon={<FormOutlined />}
                            onClick={() => showReviewModal(record, item)}
                            disabled={item.reviewed}
                          >
                            {item.reviewed ? 'Đã đánh giá' : 'Đánh giá'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div>
                  <Title level={5}>Trạng thái đơn hàng</Title>
                  <Timeline>
                    <Timeline.Item color="green">
                      <Text strong>Đặt hàng thành công</Text><br />
                      <Text type="secondary">{new Date(record.createdAt).toLocaleString('vi-VN')}</Text>
                    </Timeline.Item>
                    
                    {record.status === 'processing' || record.status === 'shipped' || record.status === 'completed' ? (
                      <Timeline.Item color="blue">
                        <Text strong>Đang xử lý</Text><br />
                        <Text type="secondary">{new Date(new Date(record.createdAt).getTime() + 1000*60*60).toLocaleString('vi-VN')}</Text>
                      </Timeline.Item>
                    ) : (
                      <Timeline.Item color="gray">
                        <Text>Đang xử lý</Text>
                      </Timeline.Item>
                    )}
                    
                    {record.status === 'shipped' || record.status === 'completed' ? (
                      <Timeline.Item color="blue">
                        <Text strong>Đang giao hàng</Text><br />
                        <Text type="secondary">{new Date(new Date(record.createdAt).getTime() + 1000*60*60*24).toLocaleString('vi-VN')}</Text>
                      </Timeline.Item>
                    ) : (
                      <Timeline.Item color="gray">
                        <Text>Đang giao hàng</Text>
                      </Timeline.Item>
                    )}
                    
                    {record.status === 'completed' ? (
                      <Timeline.Item color="green">
                        <Text strong>Giao hàng thành công</Text><br />
                        <Text type="secondary">{new Date(new Date(record.createdAt).getTime() + 1000*60*60*24*3).toLocaleString('vi-VN')}</Text>
                      </Timeline.Item>
                    ) : (
                      <Timeline.Item color="gray">
                        <Text>Giao hàng thành công</Text>
                      </Timeline.Item>
                    )}
                  </Timeline>
                </div>
              </div>
            ),
          }}
        />
      )}
      
      {/* Modal chi tiết đơn hàng */}
      <Modal
        title="Chi tiết đơn hàng"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {currentOrder && (
          <div>
            {/* Hiển thị tiến trình đơn hàng */}
            {currentOrder.status !== 'cancelled' ? (
              <Steps current={getCurrentStep(currentOrder.status)} style={{ marginBottom: 30 }}>
                <Step title="Đặt hàng" description="Đã đặt hàng" />
                <Step title="Xác nhận" description="Đã xác nhận" />
                <Step title="Vận chuyển" description="Đang giao hàng" />
                <Step title="Hoàn thành" description="Đã giao hàng" />
              </Steps>
            ) : (
              <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <Tag color="red" icon={<StopOutlined />} style={{ padding: '5px 15px', fontSize: 16 }}>
                  Đơn hàng đã bị hủy
                </Tag>
              </div>
            )}
            
            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
              <Descriptions.Item label="Mã đơn hàng">
                <Text copyable>{currentOrder.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {new Date(currentOrder.createdAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {(() => {
                  const statusMap = {
                    pending: { color: 'gold', text: 'Chờ xác nhận' },
                    confirmed: { color: 'blue', text: 'Đã xác nhận' },
                    shipping: { color: 'cyan', text: 'Đang giao hàng' },
                    delivered: { color: 'green', text: 'Đã giao hàng' },
                    cancelled: { color: 'red', text: 'Đã hủy' }
                  };
                  return (
                    <Tag color={statusMap[currentOrder.status].color}>
                      {statusMap[currentOrder.status].text}
                    </Tag>
                  );
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {currentOrder.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider orientation="left">Thông tin giao hàng</Divider>
            
            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
              <Descriptions.Item label="Họ tên">{currentOrder.shippingDetails.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{currentOrder.shippingDetails.email}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{currentOrder.shippingDetails.phone}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">{currentOrder.shippingDetails.address}</Descriptions.Item>
              {currentOrder.shippingDetails.notes && (
                <Descriptions.Item label="Ghi chú" span={2}>{currentOrder.shippingDetails.notes}</Descriptions.Item>
              )}
            </Descriptions>
            
            <Divider orientation="left">Sản phẩm</Divider>
            
            <Table
              dataSource={currentOrder.items}
              rowKey={(item, index) => index}
              pagination={false}
              columns={[
                {
                  title: 'Sản phẩm',
                  dataIndex: 'name',
                  key: 'name',
                  render: (name, record) => (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <img 
                        src={record.images[0] || "https://via.placeholder.com/50x50?text=No+Image"} 
                        alt={name}
                        style={{ width: 50, height: 50, objectFit: 'cover', marginRight: 10 }} 
                      />
                      <div>
                        <div>{name}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>
                          Size: {record.selectedSize}, Màu: {record.selectedColor}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'Giá',
                  dataIndex: 'price',
                  key: 'price',
                  render: price => `${price.toLocaleString('vi-VN')}đ`,
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'quantity',
                  key: 'quantity',
                },
                {
                  title: 'Thành tiền',
                  key: 'total',
                  render: record => `${(record.price * record.quantity).toLocaleString('vi-VN')}đ`,
                },
                {
                  title: 'Đánh giá',
                  key: 'action',
                  render: (_, record) => (
                    currentOrder.status === 'delivered' && (
                      isProductReviewed(currentOrder.id, record.id) ? (
                        <Tag color="green" icon={<CheckCircleOutlined />}>Đã đánh giá</Tag>
                      ) : (
                        <Button 
                          type="primary" 
                          icon={<StarOutlined />} 
                          onClick={() => showReviewModal(currentOrder, record)}
                        >
                          Đánh giá
                        </Button>
                      )
                    )
                  ),
                },
              ]}
              summary={() => (
                <Table.Summary>
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={2}></Table.Summary.Cell>
                    <Table.Summary.Cell>Tạm tính</Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text>{currentOrder.subtotal.toLocaleString('vi-VN')}đ</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell></Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={2}></Table.Summary.Cell>
                    <Table.Summary.Cell>Phí vận chuyển</Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text>{currentOrder.shippingFee.toLocaleString('vi-VN')}đ</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell></Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={2}></Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text strong>Tổng cộng</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text strong style={{ color: 'red' }}>
                        {currentOrder.total.toLocaleString('vi-VN')}đ
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell></Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </div>
        )}
      </Modal>
      
      {/* Modal đánh giá sản phẩm */}
      <Modal
        title="Đánh giá sản phẩm"
        visible={reviewModalVisible}
        onOk={handleReviewSubmit}
        onCancel={() => setReviewModalVisible(false)}
        okText="Gửi đánh giá"
        cancelText="Hủy"
      >
        {currentOrderItem && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <img 
                src={currentOrderItem.item.images[0] || "https://via.placeholder.com/80x80?text=No+Image"} 
                alt={currentOrderItem.item.name}
                style={{ width: 100, height: 100, objectFit: 'cover' }}
              />
              <div style={{ marginTop: 8 }}>
                <Text strong>{currentOrderItem.item.name}</Text>
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <Text>Chất lượng sản phẩm</Text>
              <div>
                <Rate 
                  value={reviewForm.rating} 
                  onChange={value => setReviewForm({...reviewForm, rating: value})}
                />
              </div>
            </div>
            
            <div>
              <Text>Nhận xét của bạn</Text>
              <TextArea 
                rows={4} 
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                value={reviewForm.comment}
                onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
              />
            </div>
          </>
        )}
      </Modal>

      {/* Modal tặng voucher */}
      <Modal
        title={
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🎁 Chúc mừng!</div>
            <div>Bạn đã nhận được mã giảm giá</div>
          </div>
        }
        visible={voucherModalVisible}
        onOk={() => setVoucherModalVisible(false)}
        onCancel={() => setVoucherModalVisible(false)}
        okText="Đã hiểu"
        cancelButtonProps={{ style: { display: 'none' } }}
        centered
        bodyStyle={{ padding: '24px 24px 12px' }}
      >
        {reviewVoucher && (
          <Card style={{ 
            textAlign: 'center', 
            background: 'linear-gradient(135deg, #f6ffed, #d9f7be)',
            border: '1px solid #b7eb8f', 
            borderRadius: 8,
            marginBottom: 16
          }}>
            <Title level={3} style={{ color: '#52c41a', margin: 0 }}>
              {reviewVoucher.code}
            </Title>
            <Divider style={{ margin: '12px 0' }} />
            <Text>{reviewVoucher.description}</Text>
            <div style={{ marginTop: 12 }}>
              <Text type="secondary">Hạn sử dụng: {new Date(reviewVoucher.expiry).toLocaleDateString('vi-VN')}</Text>
            </div>
          </Card>
        )}
        <Paragraph>
          Cảm ơn bạn đã đánh giá sản phẩm. Chúng tôi đã tặng bạn mã giảm giá 10% 
          cho đơn hàng tiếp theo. Bạn có thể sử dụng mã này khi thanh toán.
        </Paragraph>
        <Paragraph type="secondary">
          Mã giảm giá sẽ được lưu trong tài khoản của bạn và có thể sử dụng cho đơn hàng 
          có giá trị từ 200.000đ trở lên.
        </Paragraph>
      </Modal>
    </div>
  );
};

export default OrderHistoryPage;
