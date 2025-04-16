import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Input, Badge, message, Spin, Avatar, Tooltip, List, Typography, Divider } from 'antd';
import { 
  MessageOutlined, 
  SendOutlined, 
  CloseOutlined, 
  UserOutlined, 
  CustomerServiceOutlined,
  LoadingOutlined,
  CommentOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getUserFromLocalStorage } from '../../services/localStorage/userStorage';
import { getConversation, sendMessage, markMessagesAsRead, getConversationsForAdmin, markMessagesAsReadForAdmin, sendAdminMessage, sendSystemVoucher } from '../../services/api/chatApi';
import './ChatBox.css';
import { useAuth } from '../../contexts/AuthContext';

const { Text } = Typography;

// Hàm gửi tin nhắn tự động từ hệ thống
export const sendSystemMessage = async (userId, message, voucherInfo = null) => {
  try {
    console.log('Đang gửi tin nhắn hệ thống:', { userId, message, hasVoucher: !!voucherInfo });
    
    if (voucherInfo) {
      // Gửi tin nhắn kèm voucher
      const result = await sendSystemVoucher({
        userId,
        message,
        voucher: voucherInfo
      });
      console.log('Đã gửi tin nhắn voucher thành công:', result);
      return result;
    } else {
      // Gửi tin nhắn thông thường từ hệ thống/admin
      const result = await sendMessage({
        userId,
        text: message,
        sender: 'admin',
        isSystem: true
      });
      console.log('Đã gửi tin nhắn hệ thống thành công:', result);
      return result;
    }
  } catch (error) {
    console.error('Lỗi chi tiết khi gửi tin nhắn hệ thống:', error);
    return null;
  }
};

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [conversation, setConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const currentUser = getUserFromLocalStorage();
  const messageInputRef = useRef(null);
  const isAdmin = currentUser?.role === 'admin';
  
  // Lấy cuộc trò chuyện được chọn từ danh sách dựa vào ID
  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const fetchConversation = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      if (isAdmin) {
        // Fetch all conversations for admin
        const response = await getConversationsForAdmin();
        
        // Cập nhật trạng thái
        setConversations(response);
        
        // Calculate total unread messages when chat is closed
        if (!isOpen) {
          const totalUnread = response.reduce((total, conv) => {
            const unreadMessages = conv.messages.filter(
              msg => msg.sender === 'user' && !msg.read
            );
            return total + unreadMessages.length;
          }, 0);
          setUnreadCount(totalUnread);
        }
        
        // Chọn cuộc trò chuyện đầu tiên nếu chưa có cuộc trò chuyện nào được chọn
        if (response.length > 0 && !selectedConversationId) {
          setSelectedConversationId(response[0].id);
        }
      } else {
        // Regular user flow - fetch only their conversation
        const response = await getConversation(currentUser.id);
        setConversation(response);
        
        // Calculate unread messages (only when chat is closed)
        if (!isOpen) {
          const unreadMessages = response.messages.filter(
            msg => msg.sender === 'admin' && !msg.read
          );
          setUnreadCount(unreadMessages.length);
        }
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
      message.error('Không thể tải tin nhắn. Vui lòng thử lại sau!');
    } finally {
      setLoading(false);
    }
  }, [currentUser, isAdmin, isOpen, selectedConversationId]);

  // Fetch conversation initially and set up polling
  useEffect(() => {
    if (currentUser) {
      fetchConversation();
      
      // Poll for new messages every 2 seconds
      const intervalId = setInterval(fetchConversation, 2000);
      
      return () => clearInterval(intervalId);
    }
  }, [currentUser, fetchConversation]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isOpen && currentUser && !isAdmin && conversation && unreadCount > 0) {
      markMessagesAsRead(currentUser.id)
        .then(() => {
          setUnreadCount(0);
          fetchConversation();
        })
        .catch(error => {
          console.error('Error marking messages as read:', error);
        });
    } else if (isOpen && isAdmin && selectedConversationId) {
      markMessagesAsReadForAdmin(selectedConversationId)
        .then(() => {
          fetchConversation();
        })
        .catch(error => {
          console.error('Error marking messages as read:', error);
        });
    }
  }, [isOpen, currentUser, conversation, selectedConversationId, unreadCount, isAdmin, fetchConversation]);

  // Scroll to bottom when messages change or chat is opened
  useEffect(() => {
    if (isOpen) {
      // Đặt timeout để đảm bảo DOM đã cập nhật trước khi cuộn
      setTimeout(scrollToBottom, 100);
      messageInputRef.current?.focus();
    }
  }, [isOpen, scrollToBottom]);
  
  // Cuộn xuống dưới khi chọn một cuộc trò chuyện khác
  useEffect(() => {
    if (isAdmin && selectedConversationId && isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [selectedConversationId, isAdmin, isOpen, scrollToBottom]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser) return;
    
    try {
      if (isAdmin && selectedConversation) {
        await sendAdminMessage({
          conversationId: selectedConversation.id,
          text: messageText.trim(),
          adminName: currentUser.name || 'Admin'
        });
      } else {
        await sendMessage({
          userId: currentUser.id,
          text: messageText.trim(),
          sender: 'user'
        });
      }
      
      setMessageText('');
      await fetchConversation();
      scrollToBottom();
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
  
  // Format date cho tin nhắn
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN');
  };

  // Xử lý khi chọn một cuộc trò chuyện
  const handleSelectConversation = (conversationId) => {
    // Không làm gì nếu chọn cùng một cuộc trò chuyện
    if (selectedConversationId === conversationId) return;
    
    // Đặt ID cuộc trò chuyện mới
    setSelectedConversationId(conversationId);
  };
  
  // Lấy tin nhắn cuối cùng của một cuộc trò chuyện
  const getLastMessage = (conversation) => {
    if (!conversation || !conversation.messages || conversation.messages.length === 0) {
      return { text: 'Chưa có tin nhắn', timestamp: conversation?.createdAt || new Date().toISOString() };
    }
    return conversation.messages[conversation.messages.length - 1];
  };
  
  // Lấy số tin nhắn chưa đọc của một cuộc trò chuyện
  const getUnreadCountForConversation = (conversation) => {
    if (!conversation || !conversation.messages) return 0;
    
    if (isAdmin) {
      return conversation.messages.filter(msg => msg.sender === 'user' && !msg.read).length;
    } else {
      return conversation.messages.filter(msg => msg.sender === 'admin' && !msg.read).length;
    }
  };
  
  // Sắp xếp các cuộc trò chuyện theo thời gian cập nhật mới nhất
  const getSortedConversations = () => {
    if (!conversations || conversations.length === 0) return [];
    
    return [...conversations].sort((a, b) => {
      const aLastMsg = a.messages && a.messages.length > 0 
        ? a.messages[a.messages.length - 1].timestamp 
        : a.updatedAt;
      
      const bLastMsg = b.messages && b.messages.length > 0 
        ? b.messages[b.messages.length - 1].timestamp 
        : b.updatedAt;
      
      return new Date(bLastMsg) - new Date(aLastMsg);
    });
  };

  // Sắp xếp tin nhắn theo thời gian
  const getSortedMessages = (messages) => {
    if (!messages || messages.length === 0) return [];
    
    return [...messages].sort((a, b) => {
      return new Date(a.timestamp) - new Date(b.timestamp);
    });
  };

  // Nhóm tin nhắn theo ngày
  const groupMessagesByDate = (messages) => {
    if (!messages || messages.length === 0) return [];
    
    const groupedMessages = [];
    let currentDate = null;
    
    const sortedMessages = getSortedMessages(messages);
    
    sortedMessages.forEach(message => {
      const messageDate = new Date(message.timestamp).toDateString();
      
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        groupedMessages.push({
          type: 'date',
          date: messageDate,
          timestamp: message.timestamp
        });
      }
      
      groupedMessages.push({
        type: 'message',
        ...message
      });
    });
    
    return groupedMessages;
  };

  // Lấy danh sách tin nhắn đã nhóm và sắp xếp
  const getGroupedMessages = (messages) => {
    return groupMessagesByDate(messages || []);
  };

  // Danh sách cuộc trò chuyện đã sắp xếp
  const sortedConversations = getSortedConversations();

  // Hiển thị tin nhắn, bao gồm cả thông tin voucher đặc biệt nếu có
  const renderMessage = (msg) => {
    const isAdmin = msg.sender === 'admin';
    
    // Hàm sao chép mã voucher vào clipboard
    const copyVoucherCode = (code) => {
      navigator.clipboard.writeText(code)
        .then(() => {
          message.success('Đã sao chép mã giảm giá vào clipboard');
        })
        .catch(() => {
          message.error('Không thể sao chép mã. Vui lòng thử lại');
        });
    };
    
    // Nếu tin nhắn chứa thông tin voucher
    if (msg.voucherInfo) {
      return (
        <div 
          key={msg.id} 
          className={`message ${isAdmin ? 'admin-message' : 'user-message'}`}
        >
          <div className="voucher-message">
            <div className="voucher-header">
              <span role="img" aria-label="gift">🎁</span> Mã giảm giá đặc biệt
            </div>
            <div 
              className="voucher-code" 
              onClick={() => copyVoucherCode(msg.voucherInfo.code)}
              title="Nhấn để sao chép mã"
            >
              {msg.voucherInfo.code}
            </div>
            <div className="voucher-description">{msg.voucherInfo.description}</div>
            <div className="voucher-expiry">Hạn sử dụng: {new Date(msg.voucherInfo.expiry).toLocaleDateString('vi-VN')}</div>
            <div className="message-content">{msg.text || msg.content}</div>
          </div>
          <div className="message-time">{formatTime(msg.timestamp)}</div>
        </div>
      );
    }
    
    // Tin nhắn thông thường
    return (
      <div 
        key={msg.id} 
        className={`message ${isAdmin ? 'admin-message' : 'user-message'} ${msg.isSystem ? 'system-message' : ''}`}
      >
        {isAdmin && msg.isSystem ? (
          <div className="system-message-icon">🔔</div>
        ) : null}
        <div className="message-content">{msg.text || msg.content}</div>
        <div className="message-time">{formatTime(msg.timestamp)}</div>
      </div>
    );
  };

  return (
    <div className="chat-box-container">
      {isOpen ? (
        <div className={`chat-box ${isAdmin ? 'admin-chat-box' : ''}`}>
          <div className="chat-header">
            <div className="chat-title">
              <CustomerServiceOutlined />
              <span>
                {isAdmin 
                  ? `Chat Hỗ Trợ - ${selectedConversation ? selectedConversation.userName : 'Chọn cuộc trò chuyện'}`
                  : 'Hỗ trợ khách hàng'
                }
              </span>
            </div>
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              onClick={toggleChat} 
              style={{ color: 'white' }}
            />
          </div>
          
          {isAdmin ? (
            <div className="admin-chat-container">
              <div className="conversation-list">
                <div className="conversation-list-header">
                  <Text strong>Danh sách tin nhắn</Text>
                </div>
                
                {loading && conversations.length === 0 ? (
                  <div className="conversation-list-loading">
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />} />
                  </div>
                ) : (
                  <List
                    className="conversation-items"
                    dataSource={sortedConversations}
                    renderItem={item => {
                      const lastMessage = getLastMessage(item);
                      const unreadCount = getUnreadCountForConversation(item);
                      const isSelected = selectedConversationId === item.id;
                      
                      return (
                        <List.Item 
                          className={`conversation-item ${isSelected ? 'selected' : ''}`} 
                          onClick={() => handleSelectConversation(item.id)}
                        >
                          <div className="conversation-item-content">
                            <div className="conversation-info">
                              <div className="conversation-name">
                                <Text strong>{item.userName || 'Người dùng'}</Text>
                                {unreadCount > 0 && (
                                  <Badge count={unreadCount} size="small" />
                                )}
                              </div>
                              <Text type="secondary" className="conversation-time">
                                {formatDate(lastMessage.timestamp)}
                              </Text>
                            </div>
                            <div className="conversation-last-message">
                              {lastMessage.sender === 'admin' ? 'Bạn: ' : ''}
                              {lastMessage.text.length > 50 ? lastMessage.text.substring(0, 50) + '...' : lastMessage.text}
                            </div>
                          </div>
                        </List.Item>
                      );
                    }}
                  />
                )}
              </div>
              
              <div className="chat-content">
                {selectedConversation ? (
                  <>
                    <div className="chat-messages">
                      {getGroupedMessages(selectedConversation.messages).map((item, index) => {
                        if (item.type === 'date') {
                          return (
                            <div key={`date-${selectedConversationId}-${index}`} className="date-separator">
                              <span>{formatDate(item.timestamp)}</span>
                            </div>
                          );
                        }
                        
                        return renderMessage(item);
                      })}
                      
                      <div ref={messagesEndRef} />
                    </div>
                    
                    <div className="chat-input">
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
                    </div>
                  </>
                ) : (
                  <div className="no-conversation-selected">
                    <div className="welcome-message">
                      <p>Vui lòng chọn một cuộc trò chuyện để bắt đầu.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
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
                
                {conversation && getGroupedMessages(conversation.messages).map((item, index) => {
                  if (item.type === 'date') {
                    return (
                      <div key={`date-user-${index}`} className="date-separator">
                        <span>{formatDate(item.timestamp)}</span>
                      </div>
                    );
                  }
                  
                  return renderMessage(item);
                })}
                
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
            </>
          )}
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