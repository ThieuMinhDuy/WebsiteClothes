import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Badge, message, Spin, Avatar, Tooltip } from 'antd';
import { 
  MessageOutlined, 
  SendOutlined, 
  CloseOutlined, 
  UserOutlined, 
  CustomerServiceOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getUserFromLocalStorage } from '../../services/localStorage/userStorage';
import { getConversation, sendMessage, markMessagesAsRead } from '../../services/api/chatApi';
import './ChatBox.css';

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [conversation, setConversation] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const currentUser = getUserFromLocalStorage();
  const messageInputRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const response = await getConversation(currentUser.id);
      setConversation(response);
      
      // Calculate unread messages (only when chat is closed)
      if (!isOpen) {
        const unreadMessages = response.messages.filter(
          msg => msg.sender === 'admin' && !msg.read
        );
        setUnreadCount(unreadMessages.length);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
      message.error('Không thể tải tin nhắn. Vui lòng thử lại sau!');
    } finally {
      setLoading(false);
    }
  };

  // Fetch conversation initially and set up polling
  useEffect(() => {
    if (currentUser) {
      fetchConversation();
      
      // Poll for new messages every 2 seconds
      const intervalId = setInterval(fetchConversation, 2000);
      
      return () => clearInterval(intervalId);
    }
  }, [currentUser]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isOpen && currentUser && conversation && unreadCount > 0) {
      markMessagesAsRead(currentUser.id)
        .then(() => {
          setUnreadCount(0);
          fetchConversation();
        })
        .catch(error => {
          console.error('Error marking messages as read:', error);
        });
    }
  }, [isOpen, currentUser, conversation, unreadCount]);

  // Scroll to bottom when messages change or chat is opened
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      messageInputRef.current?.focus();
    }
  }, [conversation, isOpen]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser) return;
    
    try {
      await sendMessage({
        userId: currentUser.id,
        text: messageText.trim(),
        sender: 'user'
      });
      
      setMessageText('');
      fetchConversation();
    } catch (error) {
      console.error('Error sending message:', error);
      message.error('Không thể gửi tin nhắn. Vui lòng thử lại sau!');
    }
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-box-container">
      {isOpen ? (
        <div className="chat-box">
          <div className="chat-header">
            <div className="chat-title">
              <CustomerServiceOutlined />
              <span>Hỗ trợ khách hàng</span>
            </div>
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              onClick={toggleChat} 
              style={{ color: 'white' }}
            />
          </div>
          
          <div className="chat-messages">
            {loading && !conversation && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
              </div>
            )}
            
            {!loading && (!conversation || conversation.messages.length === 0) && (
              <div className="welcome-message">
                <p>Chào mừng bạn đến với hỗ trợ trực tuyến!</p>
                <p>Hãy gửi tin nhắn cho chúng tôi nếu bạn cần hỗ trợ.</p>
              </div>
            )}
            
            {conversation && conversation.messages.map((msg, index) => (
              <div 
                key={index}
                className={`message ${msg.sender === 'user' ? 'user-message' : 'admin-message'}`}
              >
                {msg.sender === 'admin' && (
                  <Avatar 
                    size="small" 
                    icon={<CustomerServiceOutlined />} 
                    style={{ marginRight: '8px', alignSelf: 'flex-end', backgroundColor: '#1890ff' }} 
                  />
                )}
                
                <div className="message-content">
                  {msg.text}
                  <div className="message-time">
                    {formatTime(msg.timestamp)}
                    {msg.sender === 'user' && (
                      <span className="read-status">
                        {msg.read ? ' • Đã xem' : ' • Đã gửi'}
                      </span>
                    )}
                  </div>
                </div>
                
                {msg.sender === 'user' && (
                  <Avatar 
                    size="small" 
                    icon={<UserOutlined />} 
                    style={{ marginLeft: '8px', alignSelf: 'flex-end', backgroundColor: '#1890ff' }} 
                  />
                )}
              </div>
            ))}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chat-input">
            {currentUser ? (
              <>
                <Input 
                  ref={messageInputRef}
                  placeholder="Nhập tin nhắn..." 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  autoFocus
                />
                <Button 
                  type="primary" 
                  shape="circle" 
                  icon={<SendOutlined />} 
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                />
              </>
            ) : (
              <div className="login-prompt">
                Vui lòng <Link to="/login">đăng nhập</Link> để sử dụng chức năng hỗ trợ!
              </div>
            )}
          </div>
        </div>
      ) : (
        <Tooltip title="Hỗ trợ trực tuyến">
          <Badge count={unreadCount} overflowCount={9}>
            <Button 
              type="primary" 
              shape="circle" 
              icon={<MessageOutlined />} 
              onClick={toggleChat}
              className="chat-button"
              size="large"
            />
          </Badge>
        </Tooltip>
      )}
    </div>
  );
};

export default ChatBox; 