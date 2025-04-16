import { Form, Input, Button, Card, message, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

const RegisterPage = () => {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      // Kiểm tra và gỡ bỏ khoảng trắng
      const cleanedValues = {
        ...values,
        email: values.email.trim(),
        name: values.name.trim(),
        phone: values.phone.trim(),
      };
      
      // Xóa trường confirmPassword trước khi đăng ký
      const { confirmPassword, ...userData } = cleanedValues;
      
      // Log dữ liệu sẽ gửi đi
      console.log('Dữ liệu đăng ký:', userData);
      
      // Kiểm tra lại các trường bắt buộc
      if (!userData.email || !userData.password || !userData.name || !userData.phone) {
        message.error('Vui lòng điền đầy đủ thông tin đăng ký!');
        setLoading(false);
        return;
      }
      
      setError(null);
      const result = register(userData);
      
      console.log('Kết quả đăng ký:', result);
      
      if (result.success) {
        message.success('Đăng ký thành công!');
        
        // Tự động đăng nhập sau khi đăng ký
        const loginResult = login(userData.email, userData.password);
        
        if (loginResult.success) {
          message.success('Đăng nhập tự động thành công!');
          navigate('/');
        } else {
          // Nếu đăng nhập tự động thất bại, chuyển về trang đăng nhập
          message.warning('Không thể đăng nhập tự động. Vui lòng đăng nhập thủ công.');
          navigate('/login', { state: { registeredEmail: userData.email } });
        }
      } else {
        setError(result.message || 'Đăng ký thất bại! Vui lòng thử lại.');
        message.error(result.message || 'Đăng ký thất bại!');
      }
    } catch (error) {
      console.error('Lỗi khi xử lý đăng ký:', error);
      setError('Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.');
      message.error('Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', marginTop: 50 }}>
      <Card title="Đăng ký tài khoản" bordered={false}>
        {error && (
          <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
        )}
        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          scrollToFirstError
          form={form}
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Họ tên" />
          </Form.Item>
          
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
              { whitespace: true, message: 'Email không được chứa khoảng trắng!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải có 10 chữ số!' }
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại (10 chữ số)" />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu (tối thiểu 6 ký tự)" />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Hai mật khẩu không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" />
          </Form.Item>
          
        

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading} disabled={loading}>
              Đăng ký
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;
