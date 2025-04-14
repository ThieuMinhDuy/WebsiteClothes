import React, { useState, useEffect, useRef } from 'react';
import { 
  Button, 
  Input, 
  Badge, 
  Space, 
  Divider, 
  Typography, 
  Avatar, 
  Spin,
  List,
  Empty,
  Modal,
  Form,
  message,
  Tooltip,
  Popover
} from 'antd';
import { 
  MessageOutlined, 
  SendOutlined, 
  CloseOutlined, 
  UserOutlined,
  ShopOutlined,
  PlusOutlined,
  SmileOutlined,
  PaperClipOutlined,
  PictureOutlined,
  LikeOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import './ChatBox.css';

const { Text, Title } = Typography;
const { TextArea } = Input;

// Emoji picker data
const emojiGroups = [
  {
    group: 'Mặt cười',
    emojis: ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '😘']
  },
  {
    group: 'Cảm xúc',
    emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤘', '🤙', '👊', '👏', '🙌', '🤝', '❤️', '💔', '💯']
  },
  {
    group: 'Đồ vật',
    emojis: ['🎁', '🎈', '🎉', '🎊', '🎵', '🎬', '🎮', '📱', '💻', '⌚', '📷', '🔍', '💡', '💰']
  }
];

const ChatBox = () => {
  const { 
    userConversations, 
    activeConversation, 
    isChatOpen, 
    unreadCount, 
    isLoading,
    startNewConversation, 
    sendNewMessage, 
    setConversationActive, 
    openChat, 
    closeChat
  } = useChat();
  
  const { currentUser } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isNewConversationModalVisible, setIsNewConversationModalVisible] = useState(false);
  const [newConversationForm] = Form.useForm();
  const messagesEndRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Auto-scroll đến tin nhắn mới nhất
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation]);
  
  // Xử lý việc không thể chat khi chưa đăng nhập
  const handleOpenChat = () => {
    if (!currentUser) {
      message.warning('Vui lòng đăng nhập để sử dụng tính năng chat');
      return;
    }
    
    if (userConversations.length === 0) {
      setIsNewConversationModalVisible(true);
      return;
    }
    
    if (!activeConversation && userConversations.length > 0) {
      setConversationActive(userConversations[0]);
    }
    
    openChat();
  };
  
  // Xử lý gửi tin nhắn
  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    sendNewMessage(activeConversation.id, newMessage.trim());
    setNewMessage('');
    setShowEmojiPicker(false);
  };

  // Xử lý thêm emoji vào tin nhắn
  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };

  // Xử lý gửi nhanh emoji
  const handleQuickEmoji = (emoji) => {
    if (!activeConversation) return;
    sendNewMessage(activeConversation.id, emoji);
  };
  
  // Xử lý tạo cuộc trò chuyện mới
  const handleCreateConversation = async (values) => {
    const { subject, initialMessage } = values;
    
    const result = await startNewConversation(subject, initialMessage);
    if (result) {
      newConversationForm.resetFields();
      setIsNewConversationModalVisible(false);
    }
  };
  
  // Format thời gian
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Hiển thị ngày
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };
  
  // Xử lý phím Enter để gửi tin nhắn
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Emoji picker content
  const emojiPickerContent = (
    <div className="emoji-picker">
      {emojiGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="emoji-group">
          <div className="emoji-group-title">{group.group}</div>
          <div className="emoji-list">
            {group.emojis.map((emoji, emojiIndex) => (
              <span 
                key={emojiIndex} 
                className="emoji-item"
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
  
  return (
    <>
      {/* Chat Button */}
      <div className="chat-button-container">
        <Badge count={unreadCount} offset={[-5, 5]}>
          <Button 
            type="primary" 
            shape="circle" 
            icon={<MessageOutlined />} 
            size="large"
            onClick={handleOpenChat}
            className="chat-button"
          />
        </Badge>
      </div>
      
      {/* Chat Box */}
      <div className={`chat-box ${isChatOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="chat-header">
          <Space align="center">
            <Avatar icon={<ShopOutlined />} style={{ backgroundColor: '#f56a00' }} />
            <Text strong style={{ color: 'white', fontSize: '16px' }}>
              {currentUser ? 'Trò chuyện với Clothe Shop' : 'Chat'}
            </Text>
          </Space>
          <Button 
            type="text" 
            icon={<CloseOutlined />} 
            onClick={closeChat}
            style={{ color: 'white' }}
          />
        </div>
        
        {/* Body */}
        <div className="chat-body">
          {!currentUser ? (
            <div className="chat-login-required">
              <Title level={5}>Vui lòng đăng nhập để sử dụng tính năng chat</Title>
            </div>
          ) : isLoading ? (
            <div className="chat-loading">
              <Spin tip="Đang tải..." />
            </div>
          ) : (
            <>
              {/* Chat Messages */}
              <div className="chat-messages-container" style={{ width: '100%' }}>
                {!activeConversation ? (
                  <div className="no-conversation">
                    {userConversations.length === 0 ? (
                      <Empty 
                        description="Bạn chưa có cuộc trò chuyện nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      >
                        <Button 
                          type="primary" 
                          onClick={() => setIsNewConversationModalVisible(true)}
                        >
                          Bắt đầu cuộc trò chuyện
                        </Button>
                      </Empty>
                    ) : (
                      <Empty 
                        description="Chọn một cuộc trò chuyện để bắt đầu"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                ) : (
                  <>
                    <div className="chat-messages-header">
                      <Text strong>{activeConversation.subject}</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {activeConversation.status === 'open' ? 'Đang mở' : 'Đã đóng'}
                      </Text>
                    </div>
                    
                    <div className="chat-messages">
                      {activeConversation.messages && activeConversation.messages.length > 0 ? (
                        <>
                          {activeConversation.messages.map((msg, index) => {
                            const isFirstOfDay = index === 0 || 
                              formatDate(msg.timestamp) !== 
                              formatDate(activeConversation.messages[index - 1].timestamp);
                            
                            return (
                              <React.Fragment key={msg.id}>
                                {isFirstOfDay && (
                                  <div className="date-divider">
                                    <Text type="secondary">
                                      {formatDate(msg.timestamp)}
                                    </Text>
                                  </div>
                                )}
                                <div className={`message ${msg.sender === 'user' ? 'message-user' : 'message-admin'}`}>
                                  <div className="message-avatar">
                                    <Avatar 
                                      icon={msg.sender === 'user' ? <UserOutlined /> : <ShopOutlined />}
                                      style={{ 
                                        backgroundColor: msg.sender === 'user' ? '#1890ff' : '#f56a00' 
                                      }}
                                      size="small"
                                    />
                                  </div>
                                  <div className="message-content">
                                    <div className={`message-bubble ${msg.text && msg.text.length <= 2 && /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(msg.text) ? 'large-emoji' : ''}`}>
                                      {msg.text || msg.content}
                                    </div>
                                    <div className="message-time">
                                      <Text type="secondary" style={{ fontSize: '11px' }}>
                                        {formatTime(msg.timestamp)}
                                        {msg.sender !== 'user' && (
                                          <span className="message-status">
                                            {msg.read ? ' • Đã xem' : ''}
                                          </span>
                                        )}
                                      </Text>
                                    </div>
                                  </div>
                                </div>
                              </React.Fragment>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </>
                      ) : (
                        <div className="no-messages">
                          <Empty 
                            description="Chưa có tin nhắn nào"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Input Area - Cải tiến */}
                    {activeConversation.status === 'open' && (
                      <div className="chat-input-container">
                        <div className="chat-tools">
                          <Popover 
                            content={emojiPickerContent} 
                            trigger="click" 
                            placement="topLeft"
                            open={showEmojiPicker}
                            onOpenChange={setShowEmojiPicker}
                          >
                            <Button 
                              type="text" 
                              icon={<SmileOutlined />} 
                              className="chat-tool-button"
                            />
                          </Popover>
                          <Tooltip title="Gửi tệp (Đang phát triển)">
                            <Button 
                              type="text" 
                              icon={<PaperClipOutlined />} 
                              className="chat-tool-button"
                              disabled
                            />
                          </Tooltip>
                          <Tooltip title="Gửi hình ảnh (Đang phát triển)">
                            <Button 
                              type="text" 
                              icon={<PictureOutlined />} 
                              className="chat-tool-button"
                              disabled
                            />
                          </Tooltip>
                        </div>
                        <TextArea
                          placeholder="Nhập tin nhắn..."
                          autoSize={{ minRows: 1, maxRows: 4 }}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="chat-input"
                        />
                        <Button 
                          type="primary" 
                          icon={<SendOutlined />} 
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="send-button"
                        />
                      </div>
                    )}
                    
                    {/* Quick Emojis */}
                    {activeConversation.status === 'open' && (
                      <div className="quick-emoji-container">
                        <Tooltip title="Like">
                          <Button 
                            type="text" 
                            icon={<LikeOutlined />} 
                            onClick={() => handleQuickEmoji('👍')}
                            className="quick-emoji-button"
                          />
                        </Tooltip>
                        <Tooltip title="Yêu thích">
                          <Button 
                            type="text" 
                            icon={<HeartOutlined />} 
                            onClick={() => handleQuickEmoji('❤️')}
                            className="quick-emoji-button"
                          />
                        </Tooltip>
                        <Tooltip title="Haha">
                          <button 
                            className="emoji-only-button"
                            onClick={() => handleQuickEmoji('😂')}
                          >
                            😂
                          </button>
                        </Tooltip>
                        <Tooltip title="Wow">
                          <button 
                            className="emoji-only-button"
                            onClick={() => handleQuickEmoji('😮')}
                          >
                            😮
                          </button>
                        </Tooltip>
                      </div>
                    )}
                    
                    {activeConversation.status === 'closed' && (
                      <div className="conversation-closed">
                        <Text type="secondary">
                          Cuộc trò chuyện này đã kết thúc
                        </Text>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Modal tạo cuộc trò chuyện mới */}
      <Modal
        title="Tạo cuộc trò chuyện mới"
        open={isNewConversationModalVisible}
        onCancel={() => setIsNewConversationModalVisible(false)}
        footer={null}
      >
        <Form 
          form={newConversationForm}
          layout="vertical"
          onFinish={handleCreateConversation}
        >
          <Form.Item
            name="subject"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề cuộc trò chuyện' }]}
          >
            <Input placeholder="Ví dụ: Hỏi về sản phẩm, Tư vấn size quần áo..." />
          </Form.Item>
          
          <Form.Item
            name="initialMessage"
            label="Tin nhắn đầu tiên"
            rules={[{ required: true, message: 'Vui lòng nhập tin nhắn' }]}
          >
            <TextArea 
              placeholder="Nhập nội dung tin nhắn đầu tiên của bạn..." 
              autoSize={{ minRows: 3, maxRows: 5 }}
            />
          </Form.Item>
          
          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsNewConversationModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Tạo cuộc trò chuyện
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ChatBox; 