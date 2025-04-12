import { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Spin, Select, Modal, Typography, Descriptions, Divider, message } from 'antd';
import { EyeOutlined, CheckCircleOutlined, ClockCircleOutlined, StopOutlined } from '@ant-design/icons';
import { getOrders, updateOrderStatus } from '../../services/api/orderApi';

const { Title, Text } = Typography;
const { Option } = Select;

// Trạng thái đơn hàng
const ORDER_STATUS = {
  pending: { color: 'gold', text: 'Chờ xác nhận', icon: <ClockCircleOutlined /> },
  confirmed: { color: 'blue', text: 'Đã xác nhận', icon: <CheckCircleOutlined /> },
  shipping: { color: 'cyan', text: 'Đang giao hàng', icon: <ClockCircleOutlined /> },
  delivered: { color: 'green', text: 'Đã giao hàng', icon: <CheckCircleOutlined /> },
  cancelled: { color: 'red', text: 'Đã hủy', icon: <StopOutlined /> }
};

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Tải danh sách đơn hàng
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const ordersData = await getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Lỗi khi tải đơn hàng:', error);
      message.error('Đã xảy ra lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Xem chi tiết đơn hàng
  const showOrderDetail = (order) => {
    setCurrentOrder(order);
    setModalVisible(true);
  };

  // Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (orderId, newStatus) => {
    setStatusLoading(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      message.success('Cập nhật trạng thái đơn hàng thành công!');
      
      // Cập nhật trạng thái trong state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } 
            : order
        )
      );
      
      // Cập nhật đơn hàng hiện tại nếu đang xem chi tiết
      if (currentOrder && currentOrder.id === orderId) {
        setCurrentOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      message.error('Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng');
    } finally {
      setStatusLoading(false);
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
      title: 'Khách hàng',
      dataIndex: 'shippingDetails',
      key: 'customer',
      render: shippingDetails => shippingDetails.name,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'shippingDetails',
      key: 'phone',
      render: shippingDetails => shippingDetails.phone,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: total => `${total.toLocaleString('vi-VN')}đ`,
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: createdAt => new Date(createdAt).toLocaleDateString('vi-VN'),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        const statusInfo = ORDER_STATUS[status] || { color: 'default', text: 'Không xác định', icon: null };
        return (
          <Tag color={statusInfo.color} icon={statusInfo.icon}>
            {statusInfo.text}
          </Tag>
        );
      },
      filters: Object.entries(ORDER_STATUS).map(([key, { text }]) => ({ text, value: key })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            onClick={() => showOrderDetail(record)}
          >
            Chi tiết
          </Button>
          <Select
            placeholder="Cập nhật trạng thái"
            style={{ width: 150 }}
            value={record.status}
            onChange={value => handleUpdateStatus(record.id, value)}
            loading={statusLoading}
          >
            {Object.entries(ORDER_STATUS).map(([status, { text }]) => (
              <Option key={status} value={status} disabled={record.status === status}>
                {text}
              </Option>
            ))}
          </Select>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Quản lý đơn hàng</Title>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table 
          columns={columns} 
          dataSource={orders} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
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
            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
              <Descriptions.Item label="Mã đơn hàng">
                <Text copyable>{currentOrder.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {new Date(currentOrder.createdAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Select
                  style={{ width: 200 }}
                  value={currentOrder.status}
                  onChange={value => handleUpdateStatus(currentOrder.id, value)}
                  loading={statusLoading}
                >
                  {Object.entries(ORDER_STATUS).map(([status, { text }]) => (
                    <Option key={status} value={status}>
                      {text}
                    </Option>
                  ))}
                </Select>
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {currentOrder.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider orientation="left">Thông tin khách hàng</Divider>
            
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
              ]}
              summary={() => (
                <Table.Summary>
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={2}></Table.Summary.Cell>
                    <Table.Summary.Cell>Tạm tính</Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text>{currentOrder.subtotal.toLocaleString('vi-VN')}đ</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={2}></Table.Summary.Cell>
                    <Table.Summary.Cell>Phí vận chuyển</Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text>{currentOrder.shippingFee.toLocaleString('vi-VN')}đ</Text>
                    </Table.Summary.Cell>
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
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagementPage;
