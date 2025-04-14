import React, { useState, useEffect, useRef } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  List, 
  Badge, 
  Typography, 
  Input, 
  Button, 
  Space, 
  Avatar, 
  Empty, 
  Spin,
  Tag,
  Tooltip,
  Modal,
  message,
  Radio,
  Popconfirm
} from 'antd';
import { 
  SendOutlined, 
  UserOutlined, 
  ShopOutlined, 
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import {
  getAllConversations,
  sendMessage,
  markMessagesAsRead,
  closeConversation,
  reopenConversation,
  getConversationsForAdmin,
  markMessagesAsReadForAdmin,
  sendAdminMessage,
  deleteConversation
} from '../../services/api/chatApi';
import './ChatManagementPage.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ChatManagementPage = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [activeUserId, setActiveUserId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const messagesEndRef = useRef(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Tải tất cả cuộc trò chuyện
  useEffect(() => {
    fetchAllConversations();
  }, []);

  // Auto-scroll đến tin nhắn mới nhất
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation]);

  // Lấy tất cả cuộc trò chuyện
  const fetchAllConversations = async () => {
    setLoading(true);
    try {
      const data = await getConversationsForAdmin();
      setConversations(data);
      
      if (data.length > 0 && !activeConversation) {
        setActiveConversation(data[0]);
        setActiveUserId(data[0].userId);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      message.error('Đã xảy ra lỗi khi tải danh sách cuộc trò chuyện');
    } finally {
      setLoading(false);
    }
  };

  // Làm mới danh sách cuộc trò chuyện
  const refreshConversations = async () => {
    setRefreshing(true);
    try {
      await fetchAllConversations();
    } finally {
      setRefreshing(false);
    }
  };

  // Xử lý khi chọn một cuộc trò chuyện
  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    
    try {
      // Đánh dấu tin nhắn là đã đọc
      await markMessagesAsReadForAdmin(conversation.id);
      
      // Cập nhật trạng thái đã đọc trong state
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === conversation.id
            ? {
                ...conv,
                messages: conv.messages.map(msg => 
                  msg.sender === 'user' && !msg.read
                    ? { ...msg, read: true }
                    : msg
                ),
                unreadCount: { ...conv.unreadCount, admin: 0 }
              }
            : conv
        )
      );
    } catch (error) {
      console.error('Lỗi khi đánh dấu tin nhắn đã đọc:', error);
    }
  };

  // Gửi tin nhắn mới
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    setSendingMessage(true);
    try {
      // Lấy thông tin admin hiện tại từ localStorage
      const currentAdmin = JSON.parse(localStorage.getItem('currentUser')) || {};
      const adminName = currentAdmin.username || currentAdmin.email || 'Admin';
      
      const message = await sendAdminMessage({
        conversationId: selectedConversation.id,
        text: newMessage.trim(),
        adminName: adminName // Thêm tên admin vào tin nhắn
      });
      
      // Cập nhật state
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === selectedConversation.id
            ? {
                ...conv,
                messages: [...conv.messages, {...message, adminName}],
                updatedAt: new Date().toISOString()
              }
            : conv
        )
      );
      
      setSelectedConversation(prev => ({
        ...prev,
        messages: [...prev.messages, {...message, adminName}],
        updatedAt: new Date().toISOString()
      }));
      
      setNewMessage('');
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      message.error('Đã xảy ra lỗi khi gửi tin nhắn');
    } finally {
      setSendingMessage(false);
    }
  };

  // Đóng cuộc trò chuyện
  const handleCloseConversation = async () => {
    if (!selectedConversation || !selectedConversation.userId) return;
    
    setChangingStatus(true);
    try {
      await closeConversation(selectedConversation.userId, selectedConversation.id);
      
      // Cập nhật state
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === selectedConversation.id
            ? { ...conv, status: 'closed' }
            : conv
        )
      );
      
      setSelectedConversation(prev => ({ ...prev, status: 'closed' }));
      message.success('Đã đóng cuộc trò chuyện');
    } catch (error) {
      console.error('Lỗi khi đóng cuộc trò chuyện:', error);
      message.error('Đã xảy ra lỗi khi đóng cuộc trò chuyện');
    } finally {
      setChangingStatus(false);
    }
  };

  // Mở lại cuộc trò chuyện
  const handleReopenConversation = async () => {
    if (!selectedConversation || !selectedConversation.userId) return;
    
    setChangingStatus(true);
    try {
      await reopenConversation(selectedConversation.userId, selectedConversation.id);
      
      // Cập nhật state
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === selectedConversation.id
            ? { ...conv, status: 'open' }
            : conv
        )
      );
      
      setSelectedConversation(prev => ({ ...prev, status: 'open' }));
      message.success('Đã mở lại cuộc trò chuyện');
    } catch (error) {
      console.error('Lỗi khi mở lại cuộc trò chuyện:', error);
      message.error('Đã xảy ra lỗi khi mở lại cuộc trò chuyện');
    } finally {
      setChangingStatus(false);
    }
  };

  // Xóa cuộc trò chuyện
  const handleDeleteConversation = async () => {
    try {
      setChangingStatus(true);
      console.log('Đang xóa cuộc trò chuyện ID:', selectedConversation.id);
      const success = await deleteConversation(selectedConversation.id);
      
      if (success) {
        // Cập nhật state
        const updatedConversations = conversations.filter(conv => conv.id !== selectedConversation.id);
        setConversations(updatedConversations);
        setSelectedConversation(updatedConversations.length > 0 ? updatedConversations[0] : null);
        message.success('Đã xóa cuộc trò chuyện');
      } else {
        message.error('Không thể xóa cuộc trò chuyện');
      }
    } catch (error) {
      console.error('Lỗi khi xóa cuộc trò chuyện:', error);
      message.error('Đã xảy ra lỗi khi xóa cuộc trò chuyện');
    } finally {
      setChangingStatus(false);
    }
  };

  // Format thời gian tin nhắn cuối
  const formatLastMessageTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInDays = Math.floor((now - messageTime) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      // Nếu là hôm nay, hiển thị giờ
      return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      // Nếu là hôm qua
      return 'Hôm qua';
    } else if (diffInDays < 7) {
      // Nếu trong tuần này
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return days[messageTime.getDay()];
    } else {
      // Nếu cũ hơn, hiển thị ngày/tháng
      return `${messageTime.getDate()}/${messageTime.getMonth() + 1}`;
    }
  };

  // Format thời gian cho chi tiết tin nhắn
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format ngày đầy đủ
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN');
  };

  // Lọc và sắp xếp cuộc trò chuyện
  const getFilteredConversations = () => {
    return conversations
      .filter(conv => {
        // Lọc theo trạng thái
        if (filterStatus !== 'all' && conv.status !== filterStatus) {
          return false;
        }
        
        // Lọc theo tìm kiếm
        if (searchTerm && !conv.userName?.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  };

  // Lấy thông tin tin nhắn cuối cùng
  const getLastMessageInfo = (conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return null;
    }
    
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    
    if (lastMessage.sender === 'admin') {
      return `${lastMessage.adminName || 'Admin'}: ${lastMessage.text.substring(0, 15)}${lastMessage.text.length > 15 ? '...' : ''}`;
    } else {
      return `${conversation.userName || 'Người dùng'}: ${lastMessage.text.substring(0, 15)}${lastMessage.text.length > 15 ? '...' : ''}`;
    }
  };

  // Xử lý phím Enter để gửi tin nhắn
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-management-page">
      <Title level={2}>Quản lý tin nhắn</Title>
      
      <Row gutter={16} className="chat-container">
        {/* Danh sách cuộc trò chuyện */}
        <Col xs={24} sm={8} md={6} className="conversations-list">
          <div className="list-header">
            <Title level={4}>Lịch sử trò chuyện</Title>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={refreshConversations}
              loading={refreshing}
            />
          </div>
          
          <div className="list-actions">
            <Input.Search
              placeholder="Tìm kiếm người dùng..."
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginBottom: 10 }}
              allowClear
            />
            
            <Radio.Group 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              buttonStyle="solid"
              size="small"
              style={{ marginBottom: 10 }}
            >
              <Radio.Button value="all">Tất cả</Radio.Button>
              <Radio.Button value="open">Đang mở</Radio.Button>
              <Radio.Button value="closed">Đã đóng</Radio.Button>
            </Radio.Group>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <Spin tip="Đang tải..." />
            </div>
          ) : (
            <>
              {conversations.length === 0 ? (
                <Empty description="Không có cuộc trò chuyện nào" />
              ) : (
                <List
                  dataSource={getFilteredConversations()}
                  renderItem={item => (
                    <List.Item 
                      className={`conversation-item ${selectedConversation?.id === item.id ? 'selected' : ''}`}
                      onClick={() => handleSelectConversation(item)}
                    >
                      <List.Item.Meta
                        avatar={
                          <Badge dot={item.status === 'open'} color="green" offset={[-2, 28]}>
                            <Avatar icon={<UserOutlined />} />
                          </Badge>
                        }
                        title={
                          <div className="conversation-title">
                            <span>{item.userName || `Người dùng #${item.userId.substring(0, 8)}`}</span>
                            <Text type="secondary" className="last-message-time">
                              {formatLastMessageTime(item.updatedAt)}
                            </Text>
                          </div>
                        }
                        description={
                          <div className="conversation-info">
                            <div className="conversation-last-message">
                              {item.messages && item.messages.length > 0 && 
                                <Text type="secondary" ellipsis={{ tooltip: true }} style={{ maxWidth: '100%' }}>
                                  {getLastMessageInfo(item)}
                                </Text>
                              }
                            </div>
                            <div className="conversation-status-tag">
                              {(item.unreadCount?.admin || 0) > 0 ? (
                                <Badge count={item.unreadCount.admin} style={{ backgroundColor: '#52c41a' }} />
                              ) : (
                                <Tag color={item.status === 'open' ? 'green' : 'red'} style={{ marginRight: 0 }}>
                                  {item.status === 'open' ? 'Đang mở' : 'Đã đóng'}
                                </Tag>
                              )}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </>
          )}
        </Col>
        
        {/* Chi tiết cuộc trò chuyện */}
        <Col xs={24} sm={16} md={18} className="chat-detail">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <div>
                  <Title level={4}>
                    {selectedConversation.userName || `Người dùng #${selectedConversation.userId.substring(0, 8)}`}
                  </Title>
                  <div className="chat-status">
                    <Tag 
                      icon={selectedConversation.status === 'open' ? <CheckCircleOutlined /> : <StopOutlined />}
                      color={selectedConversation.status === 'open' ? 'green' : 'red'}
                    >
                      {selectedConversation.status === 'open' ? 'Đang mở' : 'Đã đóng'}
                    </Tag>
                    <Text type="secondary">
                      Bắt đầu: {formatDate(selectedConversation.createdAt)}
                    </Text>
                  </div>
                </div>
                
                <div className="chat-actions">
                  {selectedConversation.status === 'open' ? (
                    <Space>
                      <Button 
                        type="primary" 
                        danger 
                        onClick={handleCloseConversation}
                        loading={changingStatus}
                        icon={<StopOutlined />}
                      >
                        Đóng hội thoại
                      </Button>
                      <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc chắn muốn xóa cuộc trò chuyện này? Hành động này không thể hoàn tác."
                        onConfirm={handleDeleteConversation}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                      >
                        <Button 
                          type="primary"
                          danger 
                          icon={<DeleteOutlined />} 
                        />
                      </Popconfirm>
                    </Space>
                  ) : (
                    <Space>
                      <Button 
                        type="primary" 
                        onClick={handleReopenConversation}
                        loading={changingStatus}
                        icon={<CheckCircleOutlined />}
                      >
                        Mở lại hội thoại
                      </Button>
                      <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc chắn muốn xóa cuộc trò chuyện này? Hành động này không thể hoàn tác."
                        onConfirm={handleDeleteConversation}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                      >
                        <Button 
                          type="primary"
                          danger 
                          icon={<DeleteOutlined />} 
                        />
                      </Popconfirm>
                    </Space>
                  )}
                </div>
              </div>
              
              <div className="messages-container">
                {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                  <div className="message-list">
                    {selectedConversation.messages.map((msg, index) => {
                      // Kiểm tra xem tin nhắn này có phải là ngày mới không
                      const isNewDay = index === 0 || 
                        new Date(msg.timestamp).toDateString() !== 
                        new Date(selectedConversation.messages[index - 1].timestamp).toDateString();
                      
                      return (
                        <div key={msg.id}>
                          {isNewDay && (
                            <div className="date-separator">
                              <span>{formatDate(msg.timestamp)}</span>
                            </div>
                          )}
                          
                          <div className={`message ${msg.sender === 'admin' ? 'admin-message' : 'user-message'}`}>
                            <div className="message-avatar">
                              <Avatar 
                                icon={msg.sender === 'admin' ? <MessageOutlined /> : <UserOutlined />}
                                style={{ backgroundColor: msg.sender === 'admin' ? '#1890ff' : '#f56a00' }}
                              />
                            </div>
                            
                            <div className="message-content">
                              <div className="message-header">
                                <Text strong>{msg.sender === 'admin' ? (msg.adminName || 'Admin') : selectedConversation.userName || 'Người dùng'}</Text>
                                <Text type="secondary">{formatTime(msg.timestamp)}</Text>
                              </div>
                              
                              <div className="message-text">{msg.text}</div>
                              
                              {msg.sender === 'admin' && (
                                <div className="message-status">
                                  {msg.read ? (
                                    <Text type="secondary" className="read-status">
                                      <CheckCircleOutlined /> Đã xem
                                    </Text>
                                  ) : (
                                    <Text type="secondary" className="read-status">
                                      <ClockCircleOutlined /> Đã gửi
                                    </Text>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <Empty description="Chưa có tin nhắn nào" />
                )}
              </div>
              
              <div className="message-input">
                <TextArea
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={selectedConversation.status !== 'open' || sendingMessage}
                  autoSize={{ minRows: 2, maxRows: 4 }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  loading={sendingMessage}
                  disabled={!newMessage.trim() || selectedConversation.status !== 'open'}
                >
                  Gửi
                </Button>
              </div>
            </>
          ) : (
            <div className="no-conversation-selected">
              <Empty description="Chọn một cuộc trò chuyện để xem" />
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ChatManagementPage; 