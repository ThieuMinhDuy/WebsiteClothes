import { Form, Input, Button, Rate, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useContext, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { addReview, checkFirstReview } from '../../services/api/reviewApi';
import { generateReviewVoucher } from '../../services/api/voucherApi';
import { sendSystemMessage } from '../ChatBox/ChatBox';

const ReviewForm = ({ productId, onReviewAdded }) => {
  const [form] = Form.useForm();
  const { currentUser } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    if (!currentUser) {
      message.error('Bạn cần đăng nhập để đánh giá sản phẩm');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const review = {
        userId: currentUser.id,
        userName: currentUser.name || currentUser.email,
        productId,
        rating: values.rating,
        comment: values.comment,
        dateCreated: new Date().toISOString(),
      };

      await addReview(review);
      
      // Kiểm tra xem đây có phải là đánh giá đầu tiên của người dùng không
      const isFirstReview = await checkFirstReview(currentUser.id);
      
      // Nếu là đánh giá đầu tiên, tạo voucher ưu đãi
      if (isFirstReview) {
        const voucher = await generateReviewVoucher(currentUser.id);
        
        // Gửi thông báo và mã giảm giá qua chatbot
        const messageText = `Cảm ơn bạn đã đánh giá sản phẩm lần đầu! Chúng tôi đã tặng bạn một mã giảm giá 10% cho đơn hàng tiếp theo.`;
        try {
          await sendSystemMessage(currentUser.id, messageText, voucher);
          message.success('Cảm ơn bạn đã đánh giá! Bạn đã nhận được voucher giảm giá 10% trong hộp tin nhắn.');
        } catch (chatError) {
          console.error('Lỗi khi gửi tin nhắn voucher:', chatError);
          message.success('Cảm ơn bạn đã đánh giá! Bạn đã nhận được voucher giảm giá 10% cho lần mua hàng tiếp theo.');
        }
      } else {
        message.success('Cảm ơn bạn đã đánh giá sản phẩm!');
      }
      
      form.resetFields();
      if (onReviewAdded) {
        onReviewAdded(review);
      }
    } catch (error) {
      console.error('Error adding review:', error);
      message.error('Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      form={form}
      onFinish={handleSubmit}
      layout="vertical"
      className="review-form"
    >
      <Form.Item
        name="rating"
        rules={[{ required: true, message: 'Vui lòng chọn số sao đánh giá' }]}
        initialValue={5}
      >
        <Rate allowClear={false} />
      </Form.Item>
      
      <Form.Item
        name="comment"
        rules={[{ required: true, message: 'Vui lòng nhập nội dung đánh giá' }]}
      >
        <Input.TextArea 
          rows={4} 
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..." 
        />
      </Form.Item>
      
      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={isSubmitting}
        >
          Gửi đánh giá
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ReviewForm; 