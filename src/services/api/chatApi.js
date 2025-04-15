// chatApi.js - Service để quản lý chat sử dụng localStorage

// Key để lưu trữ dữ liệu trò chuyện trong localStorage
const CONVERSATIONS_STORAGE_KEY = 'conversations';

/**
 * Lấy tất cả cuộc trò chuyện từ localStorage
 * @returns {Array} - Mảng các cuộc trò chuyện
 */
const getAllConversations = () => {
  const conversations = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
  return conversations ? JSON.parse(conversations) : [];
};

/**
 * Lưu tất cả cuộc trò chuyện vào localStorage
 * @param {Array} conversations - Mảng các cuộc trò chuyện
 */
const saveAllConversations = (conversations) => {
  localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
};

/**
 * Khởi tạo dữ liệu chat
 */
export const initChatData = () => {
  if (!localStorage.getItem(CONVERSATIONS_STORAGE_KEY)) {
    localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify([]));
  }
};

/**
 * Lấy tất cả cuộc trò chuyện của một người dùng
 * @param {string} userId - ID của người dùng
 * @returns {Promise<Array>} - Danh sách cuộc trò chuyện
 */
export const getUserConversations = async (userId) => {
  if (!userId) {
    throw new Error('UserId is required');
  }

  // Mô phỏng độ trễ của API thực tế
  await new Promise(resolve => setTimeout(resolve, 500));

  const conversations = getAllConversations();
  return conversations.filter(conv => conv.userId === userId);
};

/**
 * Tạo cuộc trò chuyện mới
 * @param {string} userId - ID của người dùng
 * @param {string} subject - Tiêu đề cuộc trò chuyện
 * @returns {Promise<Object>} - Thông tin cuộc trò chuyện mới
 */
export const createConversation = async (userId, subject) => {
  if (!userId || !subject) {
    throw new Error('UserId and subject are required');
  }

  // Mô phỏng độ trễ của API thực tế
  await new Promise(resolve => setTimeout(resolve, 500));

  const newConversation = {
    id: Date.now().toString(),
    userId,
    subject,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'open',
    messages: [],
    unreadCount: { user: 0, admin: 0 }
  };

  const conversations = getAllConversations();
  conversations.push(newConversation);
  saveAllConversations(conversations);

  return newConversation;
};

/**
 * Lấy thông tin cuộc trò chuyện của người dùng
 * @param {string} userId - ID của người dùng
 * @returns {Promise<Object>} - Cuộc trò chuyện của người dùng
 */
export const getConversation = async (userId) => {
  if (!userId) {
    throw new Error('UserId is required');
  }

  // Mô phỏng độ trễ của API thực tế
  await new Promise(resolve => setTimeout(resolve, 300));

  let conversations = getAllConversations();
  let conversation = conversations.find(c => c.userId === userId);

  // Nếu chưa có cuộc trò chuyện, tạo mới
  if (!conversation) {
    conversation = {
      id: Date.now().toString(),
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'open',
      messages: []
    };

    conversations.push(conversation);
    saveAllConversations(conversations);
  }

  return conversation;
};

/**
 * Gửi tin nhắn mới
 * @param {Object} messageData - Dữ liệu tin nhắn
 * @param {string} messageData.userId - ID của người dùng
 * @param {string} messageData.text - Nội dung tin nhắn
 * @param {string} messageData.sender - Người gửi (user/admin)
 * @param {string} [messageData.conversationId] - ID của cuộc trò chuyện (nếu có)
 * @returns {Promise<Object>} - Thông tin tin nhắn đã gửi
 */
export const sendMessage = async (messageData) => {
  const { userId, text, sender, conversationId } = messageData;
  
  if (!userId || !text || !sender) {
    throw new Error('UserId, text and sender are required');
  }

  // Mô phỏng độ trễ của API thực tế
  await new Promise(resolve => setTimeout(resolve, 500));

  let conversations = getAllConversations();
  let conversation;
  
  if (conversationId) {
    // Nếu có conversationId, tìm cuộc trò chuyện tương ứng
    conversation = conversations.find(c => c.id === conversationId && c.userId === userId);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }
  } else {
    // Nếu không có conversationId, tìm cuộc trò chuyện của user
    conversation = conversations.find(c => c.userId === userId);
  
    // Nếu chưa có cuộc trò chuyện, tạo mới
    if (!conversation) {
      conversation = {
        id: Date.now().toString(),
        userId,
        subject: 'Trò chuyện mới', // Tiêu đề mặc định
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'open',
        messages: [],
        unreadCount: { user: 0, admin: 0 }
      };
      conversations.push(conversation);
    }
  }

  // Tạo tin nhắn mới
  const newMessage = {
    id: Date.now().toString(),
    text,
    sender,
    timestamp: new Date().toISOString(),
    read: sender === 'admin' ? false : true // Tin nhắn của admin chưa đọc, tin nhắn của user đã đọc
  };

  // Thêm tin nhắn vào cuộc trò chuyện
  conversation.messages.push(newMessage);
  conversation.updatedAt = new Date().toISOString();
  
  // Cập nhật số tin nhắn chưa đọc
  if (sender === 'user') {
    conversation.unreadCount = conversation.unreadCount || { user: 0, admin: 0 };
    conversation.unreadCount.admin = (conversation.unreadCount.admin || 0) + 1;
  } else {
    conversation.unreadCount = conversation.unreadCount || { user: 0, admin: 0 };
    conversation.unreadCount.user = (conversation.unreadCount.user || 0) + 1;
  }

  // Cập nhật localStorage
  saveAllConversations(conversations);

  return newMessage;
};

/**
 * Đánh dấu tin nhắn là đã đọc
 * @param {string} userId - ID của người dùng
 * @returns {Promise<boolean>} - Kết quả thành công hay không
 */
export const markMessagesAsRead = async (userId) => {
  if (!userId) {
    throw new Error('UserId is required');
  }

  // Mô phỏng độ trễ của API thực tế
  await new Promise(resolve => setTimeout(resolve, 300));

  let conversations = getAllConversations();
  let conversation = conversations.find(c => c.userId === userId);

  if (!conversation) {
    return false;
  }

  // Đánh dấu tất cả tin nhắn từ admin là đã đọc
  let hasChanges = false;
  conversation.messages = conversation.messages.map(msg => {
    if (msg.sender === 'admin' && !msg.read) {
      hasChanges = true;
      return { ...msg, read: true };
    }
    return msg;
  });

  if (hasChanges) {
    conversation.updatedAt = new Date().toISOString();
    saveAllConversations(conversations);
  }

  return true;
};

/**
 * Lấy danh sách cuộc trò chuyện cho trang admin
 * @returns {Promise<Array>} - Danh sách cuộc trò chuyện
 */
export const getConversationsForAdmin = async () => {
  // Mô phỏng độ trễ của API thực tế
  await new Promise(resolve => setTimeout(resolve, 500));

  const conversations = getAllConversations();
  
  // Lấy danh sách người dùng từ localStorage
  const usersJson = localStorage.getItem('users');
  const users = usersJson ? JSON.parse(usersJson) : [];
  
  // Gắn thông tin người dùng vào mỗi cuộc trò chuyện
  return conversations.map(conversation => {
    const user = users.find(u => u.id === conversation.userId);
    return {
      ...conversation,
      userName: user ? user.name : `Khách hàng ${conversation.userId.substring(0, 8)}`
    };
  });
};

/**
 * Lấy số tin nhắn chưa đọc cho admin
 * @returns {Promise<number>} - Số tin nhắn chưa đọc
 */
export const getUnreadCountForAdmin = async () => {
  // Mô phỏng độ trễ của API thực tế
  await new Promise(resolve => setTimeout(resolve, 300));

  const conversations = getAllConversations();
  let count = 0;

  conversations.forEach(conversation => {
    count += conversation.messages.filter(
      msg => msg.sender === 'user' && !msg.read
    ).length;
  });

  return count;
};

/**
 * Đánh dấu tin nhắn là đã đọc cho admin
 * @param {string} conversationId - ID của cuộc trò chuyện
 * @returns {Promise<boolean>} - Kết quả thành công hay không
 */
export const markMessagesAsReadForAdmin = async (conversationId) => {
  if (!conversationId) {
    throw new Error('ConversationId is required');
  }

  // Mô phỏng độ trễ của API thực tế
  await new Promise(resolve => setTimeout(resolve, 300));

  let conversations = getAllConversations();
  let conversation = conversations.find(c => c.id === conversationId);

  if (!conversation) {
    return false;
  }

  // Đánh dấu tất cả tin nhắn từ user là đã đọc
  let hasChanges = false;
  conversation.messages = conversation.messages.map(msg => {
    if (msg.sender === 'user' && !msg.read) {
      hasChanges = true;
      return { ...msg, read: true };
    }
    return msg;
  });

  if (hasChanges) {
    conversation.updatedAt = new Date().toISOString();
    saveAllConversations(conversations);
  }

  return true;
};

/**
 * Gửi tin nhắn với tư cách admin
 * @param {Object} messageData - Dữ liệu tin nhắn
 * @param {string} messageData.conversationId - ID của cuộc trò chuyện
 * @param {string} messageData.text - Nội dung tin nhắn
 * @param {string} messageData.adminName - Tên của admin
 * @returns {Promise<Object>} - Thông tin tin nhắn đã gửi
 */
export const sendAdminMessage = async (messageData) => {
  const { conversationId, text, adminName } = messageData;
  
  if (!conversationId || !text) {
    throw new Error('ConversationId and text are required');
  }

  // Mô phỏng độ trễ của API thực tế
  await new Promise(resolve => setTimeout(resolve, 500));

  let conversations = getAllConversations();
  let conversation = conversations.find(c => c.id === conversationId);

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Tạo tin nhắn mới
  const newMessage = {
    id: Date.now().toString(),
    text,
    sender: 'admin',
    adminName: adminName || 'Admin', // Lưu tên admin vào tin nhắn
    timestamp: new Date().toISOString(),
    read: false // Tin nhắn của admin chưa đọc bởi user
  };

  // Thêm tin nhắn vào cuộc trò chuyện
  conversation.messages.push(newMessage);
  conversation.updatedAt = new Date().toISOString();

  // Cập nhật localStorage
  saveAllConversations(conversations);

  return newMessage;
};

/**
 * Đóng cuộc trò chuyện
 * @param {string} userId - ID của người dùng
 * @param {string} conversationId - ID của cuộc trò chuyện
 * @returns {Promise<boolean>} - Kết quả thành công hay không
 */
export const closeConversation = async (userId, conversationId) => {
  if (!userId || !conversationId) {
    throw new Error('UserId and conversationId are required');
  }

  // Mô phỏng độ trễ của API thực tế
  await new Promise(resolve => setTimeout(resolve, 300));

  const conversations = getAllConversations();
  let conversation = conversations.find(
    c => c.userId === userId && c.id === conversationId
  );

  if (!conversation) {
    return false;
  }

  conversation.status = 'closed';
  conversation.updatedAt = new Date().toISOString();
  saveAllConversations(conversations);

  return true;
};

/**
 * Mở lại cuộc trò chuyện
 * @param {string} userId - ID của người dùng
 * @param {string} conversationId - ID của cuộc trò chuyện
 * @returns {Promise<boolean>} - Kết quả thành công hay không
 */
export const reopenConversation = async (userId, conversationId) => {
  if (!userId || !conversationId) {
    throw new Error('UserId and conversationId are required');
  }

  // Mô phỏng độ trễ của API thực tế
  await new Promise(resolve => setTimeout(resolve, 300));

  const conversations = getAllConversations();
  let conversation = conversations.find(
    c => c.userId === userId && c.id === conversationId
  );

  if (!conversation) {
    return false;
  }

  conversation.status = 'open';
  conversation.updatedAt = new Date().toISOString();
  saveAllConversations(conversations);

  return true;
};

/**
 * Xóa cuộc trò chuyện
 * @param {string} conversationId - ID của cuộc trò chuyện
 * @returns {Promise<boolean>} - Kết quả thành công hay không
 */
export const deleteConversation = async (conversationId) => {
  if (!conversationId) {
    throw new Error('ConversationId is required');
  }

  // Mô phỏng độ trễ của API thực tế
  await new Promise(resolve => setTimeout(resolve, 300));

  const conversations = getAllConversations();
  const updatedConversations = conversations.filter(c => c.id !== conversationId);
  
  if (updatedConversations.length === conversations.length) {
    return false; // Không tìm thấy cuộc trò chuyện để xóa
  }
  
  saveAllConversations(updatedConversations);
  return true;
};