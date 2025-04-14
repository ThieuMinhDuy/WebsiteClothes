import { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Empty, Steps, Spin, Typography, Modal, Descriptions, Divider, Rate, Input, message } from 'antd';
import { EyeOutlined, CheckCircleOutlined, ClockCircleOutlined, StopOutlined, StarOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { getOrders } from '../../services/api/orderApi';
import { checkProductReviewed, addProductReview } from '../../services/api/productApi';

const { Title, Text } = Typography;
const { Step } = Steps;
const { TextArea } = Input;

const OrderHistoryPage = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedItems, setReviewedItems] = useState({});

  // Tải đơn hàng của người dùng
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const ordersData = await getOrders(currentUser.id);
        setOrders(ordersData);
        
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
  const showReviewModal = (order, product) => {
    setCurrentOrder(order);
    setReviewProduct(product);
    setRating(5);
    setComment('');
    setReviewModalVisible(true);
  };

  // Gửi đánh giá sản phẩm
  const submitReview = async () => {
    if (!comment.trim()) {
      message.warning('Vui lòng nhập nội dung đánh giá');
      return;
    }
    
    setSubmittingReview(true);
    try {
      const reviewData = {
        productId: reviewProduct.id,
        userId: currentUser.id,
        userName: currentUser.name || currentUser.email,
        rating,
        comment: comment.trim(),
        orderId: currentOrder.id
      };
      
      await addProductReview(reviewData);
      
      // Cập nhật trạng thái đã đánh giá
      const key = `${currentOrder.id}-${reviewProduct.id}`;
      setReviewedItems(prev => ({ ...prev, [key]: true }));
      
      message.success('Cảm ơn bạn đã đánh giá sản phẩm!');
      setReviewModalVisible(false);
    } catch (error) {
      console.error('Lỗi khi gửi đánh giá:', error);
      message.error('Đã xảy ra lỗi khi gửi đánh giá. Vui lòng thử lại sau.');
    } finally {
      setSubmittingReview(false);
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
        onCancel={() => setReviewModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setReviewModalVisible(false)}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={submittingReview} 
            onClick={submitReview}
          >
            Gửi đánh giá
          </Button>,
        ]}
      >
        {reviewProduct && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
              <img 
                src={reviewProduct.images[0] || "https://via.placeholder.com/80x80?text=No+Image"} 
                alt={reviewProduct.name}
                style={{ width: 80, height: 80, objectFit: 'cover', marginRight: 16 }} 
              />
              <div>
                <Title level={4} style={{ margin: 0 }}>{reviewProduct.name}</Title>
                <div style={{ color: '#888' }}>
                  Size: {reviewProduct.selectedSize}, Màu: {reviewProduct.selectedColor}
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <Text strong>Đánh giá của bạn:</Text>
              <div style={{ marginTop: 8 }}>
                <Rate 
                  value={rating} 
                  onChange={setRating} 
                  style={{ fontSize: 32 }} 
                />
                <div style={{ marginTop: 4 }}>
                  {rating === 5 && <Text type="success">Rất hài lòng</Text>}
                  {rating === 4 && <Text type="success">Hài lòng</Text>}
                  {rating === 3 && <Text>Bình thường</Text>}
                  {rating === 2 && <Text type="warning">Không hài lòng</Text>}
                  {rating === 1 && <Text type="danger">Rất không hài lòng</Text>}
                </div>
              </div>
            </div>
            
            <div>
              <Text strong>Nhận xét chi tiết:</Text>
              <TextArea 
                rows={4} 
                value={comment} 
                onChange={e => setComment(e.target.value)}
                placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm (chất lượng, kiểu dáng, màu sắc, kích thước, ...)"
                maxLength={1000}
                showCount
                style={{ marginTop: 8 }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderHistoryPage;
