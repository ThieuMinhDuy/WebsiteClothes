import { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, Form, Input, Select, Popconfirm, Switch, Spin, Typography, message } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import { getUsers, updateUser, deleteUser } from '../../services/api/userApi';

const { Title, Text } = Typography;
const { Option } = Select;

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [form] = Form.useForm();

  // Tải danh sách người dùng
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Lỗi khi tải người dùng:', error);
      message.error('Đã xảy ra lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Xử lý mở modal chỉnh sửa người dùng
  const showEditModal = (user) => {
    setCurrentUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      active: user.active !== false // Mặc định là true nếu không có trường active
    });
    setModalVisible(true);
  };

  // Xử lý lưu cập nhật người dùng
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      await updateUser(currentUser.id, values);
      message.success('Cập nhật người dùng thành công!');
      
      // Cập nhật danh sách người dùng
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === currentUser.id ? { ...user, ...values } : user
        )
      );
      
      setModalVisible(false);
    } catch (error) {
      console.error('Lỗi khi cập nhật người dùng:', error);
      message.error('Đã xảy ra lỗi khi cập nhật người dùng');
    }
  };

  // Xử lý xóa người dùng
  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      message.success('Xóa người dùng thành công!');
      setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
      message.error('Đã xảy ra lỗi khi xóa người dùng');
    }
  };

  // Định nghĩa cột cho bảng người dùng
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: role => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
        </Tag>
      ),
      filters: [
        { text: 'Quản trị viên', value: 'admin' },
        { text: 'Người dùng', value: 'user' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      render: (active) => (
        <Tag color={active !== false ? 'green' : 'red'}>
          {active !== false ? 'Đang hoạt động' : 'Đã khóa'}
        </Tag>
      ),
      filters: [
        { text: 'Đang hoạt động', value: true },
        { text: 'Đã khóa', value: false },
      ],
      onFilter: (value, record) => record.active === value,
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: createdAt => new Date(createdAt).toLocaleDateString('vi-VN'),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa người dùng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button 
              danger 
              icon={<DeleteOutlined />}
              disabled={record.role === 'admin'}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Quản lý người dùng</Title>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table 
          columns={columns} 
          dataSource={users} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      )}
      
      {/* Modal chỉnh sửa người dùng */}
      <Modal
        title="Chỉnh sửa thông tin người dùng"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
          >
            <Input disabled />
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
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select>
              <Option value="user">Người dùng</Option>
              <Option value="admin">Quản trị viên</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="active"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Đang hoạt động" 
              unCheckedChildren="Đã khóa" 
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="Mật khẩu mới (để trống nếu không thay đổi)"
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
