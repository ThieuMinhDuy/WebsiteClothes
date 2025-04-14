import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getUserConversations, 
  sendMessage, 
  createConversation,
  markMessagesAsRead
} from '../services/api/chatApi';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [userConversations, setUserConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Lấy cuộc trò chuyện khi người dùng đăng nhập
  useEffect(() => {
    if (currentUser) {
      fetchUserConversations();
    } else {
      setUserConversations([]);
      setActiveConversation(null);
      setUnreadCount(0);
    }
  }, [currentUser]);

  // Cập nhật số tin nhắn chưa đọc
  useEffect(() => {
    if (userConversations.length > 0) {
      const count = userConversations.reduce((total, conversation) => {
        return total + (conversation.unreadCount?.user || 0);
      }, 0);
      setUnreadCount(count);
    } else {
      setUnreadCount(0);
    }
  }, [userConversations]);

  // Lấy cuộc trò chuyện của người dùng
  const fetchUserConversations = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const conversations = await getUserConversations(currentUser.id);
      setUserConversations(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Tạo cuộc trò chuyện mới
  const startNewConversation = async (subject, initialMessage) => {
    if (!currentUser) return null;
    
    setIsLoading(true);
    try {
      const newConversation = await createConversation(currentUser.id, subject);
      
      if (initialMessage) {
        const firstMessage = await sendMessage({
          userId: currentUser.id,
          conversationId: newConversation.id,
          text: initialMessage,
          sender: 'user'
        });
        
        // Cập nhật thông tin cuộc trò chuyện với tin nhắn đầu tiên
        newConversation.messages = [firstMessage];
      }
      
      setUserConversations([...userConversations, newConversation]);
      setActiveConversation(newConversation);
      setIsChatOpen(true);
      
      return newConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Gửi tin nhắn mới
  const sendNewMessage = async (conversationId, messageContent) => {
    if (!currentUser || !conversationId) return null;
    
    try {
      const newMessage = await sendMessage({
        userId: currentUser.id,
        conversationId: conversationId,
        text: messageContent,
        sender: 'user'
      });
      
      // Cập nhật danh sách tin nhắn trong state
      setUserConversations(prev => {
        return prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: [...(conv.messages || []), newMessage]
            };
          }
          return conv;
        });
      });
      
      if (activeConversation && activeConversation.id === conversationId) {
        setActiveConversation(prev => ({
          ...prev,
          messages: [...(prev.messages || []), newMessage]
        }));
      }
      
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  };

  // Đánh dấu tin nhắn đã đọc
  const markAsRead = async (conversationId) => {
    if (!currentUser || !conversationId) return;
    
    try {
      await markMessagesAsRead(currentUser.id);
      
      // Cập nhật state
      setUserConversations(prev => {
        return prev.map(conv => {
          if (conv.id === conversationId) {
            const updatedMessages = (conv.messages || []).map(msg => {
              if (msg.sender === 'admin' && !msg.read) {
                return { ...msg, read: true };
              }
              return msg;
            });
            
            return {
              ...conv,
              messages: updatedMessages,
              unreadCount: { ...conv.unreadCount, user: 0 }
            };
          }
          return conv;
        });
      });
      
      if (activeConversation && activeConversation.id === conversationId) {
        setActiveConversation(prev => {
          const updatedMessages = (prev.messages || []).map(msg => {
            if (msg.sender === 'admin' && !msg.read) {
              return { ...msg, read: true };
            }
            return msg;
          });
          
          return {
            ...prev,
            messages: updatedMessages,
            unreadCount: { ...prev.unreadCount, user: 0 }
          };
        });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Thiết lập cuộc trò chuyện hoạt động
  const setConversationActive = (conversation) => {
    setActiveConversation(conversation);
    
    if (conversation && conversation.unreadCount?.user > 0) {
      markAsRead(conversation.id);
    }
  };

  // Mở chat box
  const openChat = (conversation = null) => {
    setIsChatOpen(true);
    if (conversation) {
      setConversationActive(conversation);
    }
  };

  // Đóng chat box
  const closeChat = () => {
    setIsChatOpen(false);
  };

  // Làm mới dữ liệu cuộc trò chuyện
  const refreshConversations = () => {
    fetchUserConversations();
  };

  const value = {
    userConversations,
    activeConversation,
    isChatOpen,
    unreadCount,
    isLoading,
    startNewConversation,
    sendNewMessage,
    markAsRead,
    setConversationActive,
    openChat,
    closeChat,
    refreshConversations
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext; 