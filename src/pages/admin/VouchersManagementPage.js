import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, Select, Tag, Typography, message, Space, Popconfirm, Card, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, GiftOutlined } from '@ant-design/icons';
import moment from 'moment';
import { getAllVouchers } from '../../services/api/voucherApi';

const { Title, Text } = Typography;
const { Option } = Select;

const VouchersManagementPage = () => {
  const [form] = Form.useForm();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentVoucher, setCurrentVoucher] = useState(null);
  
  // Tải danh sách mã giảm giá
  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const data = await getAllVouchers();
      setVouchers(data);
    } catch (error) {
      console.error('Lỗi khi tải vouchers:', error);
      message.error('Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchVouchers();
  }, []);
  
  // Xử lý khi mở modal thêm mới
  const handleAddVoucher = () => {
    form.resetFields();
    setCurrentVoucher(null);
    setEditMode(false);
    setModalVisible(true);
  };
  
  // Xử lý khi mở modal chỉnh sửa
  const handleEditVoucher = (voucher) => {
    setCurrentVoucher(voucher);
    setEditMode(true);
    form.setFieldsValue({
      ...voucher,
      expiry: moment(voucher.expiry)
    });
    setModalVisible(true);
  };
  
  // Xử lý khi lưu voucher
  const handleSaveVoucher = () => {
    form.validateFields().then(values => {
      const voucherData = {
        ...values,
        expiry: values.expiry.format('YYYY-MM-DD'),
        isActive: true
      };
      
      // Lấy vouchers hiện tại
      const currentVouchers = JSON.parse(localStorage.getItem('vouchers')) || [];
      
      if (editMode && currentVoucher) {
        // Cập nhật voucher hiện có
        const updatedVouchers = currentVouchers.map(v => {
          if (v.id === currentVoucher.id) {
            return {
              ...v,
              ...voucherData
            };
          }
          return v;
        });
        
        localStorage.setItem('vouchers', JSON.stringify(updatedVouchers));
        message.success('Đã cập nhật voucher thành công');
      } else {
        // Thêm voucher mới
        const newVoucher = {
          ...voucherData,
          id: `VOUCHER_${Date.now()}`,
          usageCount: 0
        };
        
        localStorage.setItem('vouchers', JSON.stringify([...currentVouchers, newVoucher]));
        message.success('Đã thêm voucher mới thành công');
      }
      
      setModalVisible(false);
      fetchVouchers();
    });
  };
  
  // Xử lý khi xóa voucher
  const handleDeleteVoucher = (voucherId) => {
    try {
      const currentVouchers = JSON.parse(localStorage.getItem('vouchers')) || [];
      const updatedVouchers = currentVouchers.filter(v => v.id !== voucherId);
      
      localStorage.setItem('vouchers', JSON.stringify(updatedVouchers));
      message.success('Đã xóa voucher thành công');
      fetchVouchers();
    } catch (error) {
      console.error('Lỗi khi xóa voucher:', error);
      message.error('Không thể xóa voucher');
    }
  };
  
  // Xử lý khi toggle trạng thái active
  const handleToggleStatus = (voucher) => {
    try {
      const currentVouchers = JSON.parse(localStorage.getItem('vouchers')) || [];
      const updatedVouchers = currentVouchers.map(v => {
        if (v.id === voucher.id) {
          return {
            ...v,
            isActive: !v.isActive
          };
        }
        return v;
      });
      
      localStorage.setItem('vouchers', JSON.stringify(updatedVouchers));
      message.success(`Đã ${voucher.isActive ? 'hủy kích hoạt' : 'kích hoạt'} voucher thành công`);
      fetchVouchers();
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái voucher:', error);
      message.error('Không thể thay đổi trạng thái voucher');
    }
  };
  
  // Cấu hình cột cho bảng
  const columns = [
    {
      title: 'Mã voucher',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        let typeText = '';
        let color = '';
        
        switch (type) {
          case 'percent':
            typeText = 'Giảm %';
            color = 'green';
            break;
          case 'fixed':
            typeText = 'Giảm tiền';
            color = 'purple';
            break;
          case 'shipping':
            typeText = 'Miễn phí vận chuyển';
            color = 'orange';
            break;
          default:
            typeText = type;
            color = 'default';
            break;
        }
        
        return <Tag color={color}>{typeText}</Tag>;
      }
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
      render: (value, record) => {
        if (record.type === 'percent') {
          return `${value}%`;
        } else {
          return `${value.toLocaleString('vi-VN')}đ`;
        }
      }
    },
    {
      title: 'Tối thiểu',
      dataIndex: 'minOrderValue',
      key: 'minOrderValue',
      render: (value) => `${value.toLocaleString('vi-VN')}đ`
    },
    {
      title: 'Giảm tối đa',
      dataIndex: 'maxDiscount',
      key: 'maxDiscount',
      render: (value) => `${value.toLocaleString('vi-VN')}đ`
    },
    {
      title: 'Lượt dùng',
      dataIndex: 'usageCount',
      key: 'usageCount',
      render: (count, record) => `${count}/${record.usageLimit}`
    },
    {
      title: 'Hạn sử dụng',
      dataIndex: 'expiry',
      key: 'expiry',
      render: (date) => {
        const expiryDate = moment(date);
        const isExpired = expiryDate.isBefore(moment());
        
        return (
          <div>
            <Text type={isExpired ? 'danger' : ''}>{expiryDate.format('DD/MM/YYYY')}</Text>
            {isExpired && <Tag color="red" style={{ marginLeft: 8 }}>Hết hạn</Tag>}
          </div>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        isActive ? <Tag color="success">Đang hoạt động</Tag> : <Tag color="error">Đã hủy</Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEditVoucher(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa voucher này?"
            onConfirm={() => handleDeleteVoucher(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              size="small" 
            />
          </Popconfirm>
          <Popconfirm
            title={`Bạn có chắc chắn muốn ${record.isActive ? 'hủy kích hoạt' : 'kích hoạt'} voucher này?`}
            onConfirm={() => handleToggleStatus(record)}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <Button 
              type={record.isActive ? 'default' : 'primary'}
              size="small"
            >
              {record.isActive ? 'Hủy kích hoạt' : 'Kích hoạt'}
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];
  
  const renderVoucherStats = () => {
    const totalVouchers = vouchers.length;
    const activeVouchers = vouchers.filter(v => v.isActive).length;
    const expiredVouchers = vouchers.filter(v => new Date(v.expiry) < new Date()).length;
    const usedVouchers = vouchers.reduce((total, v) => total + v.usageCount, 0);
    
    return (
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={2}>{totalVouchers}</Title>
              <Text>Tổng số voucher</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ color: '#52c41a' }}>{activeVouchers}</Title>
              <Text>Voucher đang hoạt động</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ color: '#fa8c16' }}>{expiredVouchers}</Title>
              <Text>Voucher đã hết hạn</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ color: '#1890ff' }}>{usedVouchers}</Title>
              <Text>Lượt sử dụng</Text>
            </div>
          </Card>
        </Col>
      </Row>
    );
  };
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>
          <GiftOutlined style={{ marginRight: 8 }} />
          Quản lý Voucher
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAddVoucher}
        >
          Thêm Voucher Mới
        </Button>
      </div>
      
      {renderVoucherStats()}
      
      <Table 
        columns={columns} 
        dataSource={vouchers} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1000 }}
      />
      
      <Modal
        title={editMode ? 'Chỉnh sửa Voucher' : 'Thêm Voucher Mới'}
        visible={modalVisible}
        onOk={handleSaveVoucher}
        onCancel={() => setModalVisible(false)}
        okText={editMode ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Mã Voucher"
                rules={[
                  { required: true, message: 'Vui lòng nhập mã voucher' },
                  { pattern: /^[A-Z0-9_]+$/, message: 'Mã voucher chỉ chứa chữ hoa, số và dấu gạch dưới' }
                ]}
              >
                <Input placeholder="VD: SUMMER2023" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Loại giảm giá"
                rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá' }]}
              >
                <Select placeholder="Chọn loại giảm giá">
                  <Option value="percent">Giảm theo phần trăm (%)</Option>
                  <Option value="fixed">Giảm số tiền cố định</Option>
                  <Option value="shipping">Miễn phí vận chuyển</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="value"
                label="Giá trị"
                rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  placeholder="Nhập giá trị giảm giá"
                  formatter={value => {
                    const { type } = form.getFieldsValue();
                    return type === 'percent' ? `${value}%` : `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                  }}
                  parser={value => {
                    const { type } = form.getFieldsValue();
                    return type === 'percent' ? value.replace('%', '') : value.replace(/\$\s?|(,*)/g, '');
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="minOrderValue"
                label="Giá trị đơn hàng tối thiểu"
                rules={[{ required: true, message: 'Vui lòng nhập giá trị đơn hàng tối thiểu' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={10000}
                  placeholder="Ví dụ: 200000"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maxDiscount"
                label="Giảm giá tối đa"
                rules={[{ required: true, message: 'Vui lòng nhập giảm giá tối đa' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={10000}
                  placeholder="Ví dụ: 100000"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiry"
                label="Hạn sử dụng"
                rules={[{ required: true, message: 'Vui lòng chọn hạn sử dụng' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  disabledDate={current => current && current < moment().startOf('day')}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="usageLimit"
                label="Giới hạn số lần sử dụng"
                rules={[{ required: true, message: 'Vui lòng nhập giới hạn số lần sử dụng' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  placeholder="Ví dụ: 100"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
              >
                <Input.TextArea placeholder="Mô tả ngắn gọn về voucher" rows={3} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default VouchersManagementPage; 