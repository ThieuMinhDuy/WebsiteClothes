import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Tabs, Typography, message, Spin, Upload, Avatar } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, UploadOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { updateUser } from '../../services/api/userApi';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ProfilePage = () => {
  const { currentUser, logout } = useAuth();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);

  // Thiết lập form với thông tin người dùng hiện tại
  useEffect(() => {
    if (currentUser) {
      profileForm.setFieldsValue({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        address: currentUser.address,
      });
      
      // Nếu có avatar, hiển thị nó
      if (currentUser.avatar) {
        setAvatar(currentUser.avatar);
      }
    }
  }, [currentUser, profileForm]);

  // Xử lý cập nhật thông tin
  const handleUpdateProfile = async (values) => {
    setLoading(true);
    try {
      // Cập nhật avatar nếu có
      if (avatar && avatar !== currentUser.avatar) {
        values.avatar = avatar;
      }

      // Gọi API cập nhật thông tin
      await updateUser(currentUser.id, values);
      
      message.success('Cập nhật thông tin thành công!');
      
      // Cập nhật thông tin trong localStorage (currentUser)
      const updatedUser = { ...currentUser, ...values };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Sau khi cập nhật, người dùng cần đăng nhập lại để nhận thông tin mới
      setTimeout(() => {
        logout();
        message.info('Vui lòng đăng nhập lại để cập nhật thông tin.');
      }, 2000);
      
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin:', error);
      message.error('Đã xảy ra lỗi khi cập nhật thông tin!');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đổi mật khẩu
  const handleChangePassword = async (values) => {
    setLoading(true);
    try {
      // Gọi API đổi mật khẩu
      await updateUser(currentUser.id, { password: values.newPassword });
      
      message.success('Đổi mật khẩu thành công!');
      passwordForm.resetFields();
      
      // Sau khi đổi mật khẩu, người dùng cần đăng nhập lại
      setTimeout(() => {
        logout();
        message.info('Vui lòng đăng nhập lại với mật khẩu mới.');
      }, 2000);
      
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      message.error('Đã xảy ra lỗi khi đổi mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý upload avatar
  const handleAvatarChange = (info) => {
    if (info.file.status === 'done') {
      // Trong môi trường thực tế, file sẽ được upload lên server và trả về URL
      // Ở đây chúng ta giả lập bằng cách đọc file thành base64
      const reader = new FileReader();
      reader.addEventListener('load', () => setAvatar(reader.result));
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  if (!currentUser) {
    return <Spin size="large" />;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={2}>Thông tin tài khoản</Title>
      
      <Tabs defaultActiveKey="profile">
        <TabPane tab="Thông tin cá nhân" key="profile">
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar 
                size={100} 
                icon={<UserOutlined />}
                src={avatar}
                style={{ backgroundColor: '#1890ff' }}
              />
              <div style={{ marginTop: 16 }}>
                <Upload 
                  name="avatar"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    // Giả lập upload thành công
                    const isImage = file.type.startsWith('image/');
                    if (!isImage) {
                      message.error('Bạn chỉ có thể tải lên file ảnh!');
                    }
                    return isImage;
                  }}
                  onChange={handleAvatarChange}
                  customRequest={({ onSuccess }) => setTimeout(() => onSuccess("ok"), 0)}
                >
                  <Button icon={<UploadOutlined />}>Thay đổi ảnh đại diện</Button>
                </Upload>
              </div>
            </div>
            
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleUpdateProfile}
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
                <Input prefix={<MailOutlined />} disabled />
              </Form.Item>
              
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
              
              <Form.Item
                name="address"
                label="Địa chỉ"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
              >
                <Input.TextArea rows={3} />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  Cập nhật thông tin
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane tab="Đổi mật khẩu" key="password">
          <Card>
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleChangePassword}
            >
              <Form.Item
                name="currentPassword"
                label="Mật khẩu hiện tại"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              
              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Hai mật khẩu không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  Đổi mật khẩu
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
