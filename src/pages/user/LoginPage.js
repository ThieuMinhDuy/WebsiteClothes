import { Form, Input, Button, Card, message, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Nếu chuyển từ trang đăng ký, tự động điền email
  useEffect(() => {
    if (location.state?.registeredEmail) {
      form.setFieldsValue({
        email: location.state.registeredEmail
      });
      
      // Hiển thị thông báo nếu chuyển từ trang đăng ký
      message.success('Tài khoản đã được tạo thành công. Vui lòng đăng nhập.');
    }
  }, [location.state, form]);

  const onFinish = (values) => {
    try {
      setLoading(true);
      setError(null);
      
      // Chuẩn hóa email để tránh lỗi do khoảng trắng
      const cleanedValues = {
        ...values,
        email: values.email.trim()
      };
      
      console.log('Thông tin đăng nhập:', { email: cleanedValues.email, hasPassword: !!cleanedValues.password });
      
      if (!cleanedValues.email || !cleanedValues.password) {
        setError('Vui lòng nhập cả email và mật khẩu');
        setLoading(false);
        return;
      }
      
      const result = login(cleanedValues.email, cleanedValues.password);
      console.log('Kết quả đăng nhập:', result);
      
      if (result.success) {
        message.success('Đăng nhập thành công!');
        navigate('/');
      } else {
        setError(result.message || 'Đăng nhập thất bại!');
        message.error(result.message || 'Đăng nhập thất bại!');
      }
    } catch (error) {
      console.error('Lỗi khi đăng nhập:', error);
      setError('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', marginTop: 50 }}>
      <Card title="Đăng nhập" bordered={false}>
        {error && (
          <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
        )}
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          form={form}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              style={{ width: '100%' }}
              loading={loading}
              disabled={loading}
            >
              Đăng nhập
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
