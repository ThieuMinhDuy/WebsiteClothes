import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra người dùng đã đăng nhập từ localStorage
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    try {
      console.log('Đang đăng nhập với email:', email);
      
      if (!email || !password) {
        console.error('Email hoặc mật khẩu trống');
        return { success: false, message: 'Vui lòng nhập cả email và mật khẩu' };
      }
      
      // Lấy danh sách người dùng
      let users = [];
      try {
        const usersJson = localStorage.getItem('users');
        console.log('Dữ liệu users từ localStorage:', usersJson);
        users = usersJson ? JSON.parse(usersJson) : [];
      } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error);
        users = [];
      }
      
      console.log('Danh sách người dùng:', JSON.stringify(users));
      
      // Email cần được normalize để so sánh không phân biệt hoa/thường
      const normalizedEmail = email.toLowerCase().trim();
      
      // Tìm người dùng theo email (không phân biệt chữ hoa/thường)
      const user = users.find(u => {
        const userEmail = (u.email || '').toLowerCase().trim();
        console.log(`So sánh: ${userEmail} vs ${normalizedEmail}, password khớp: ${u.password === password}`);
        return userEmail === normalizedEmail && u.password === password;
      });
      
      if (user) {
        console.log('Tìm thấy người dùng:', user);
        // Không lưu password vào currentUser
        const { password, ...userWithoutPassword } = user;
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        setCurrentUser(userWithoutPassword);
        return { success: true };
      }
      
      // Kiểm tra xem email có tồn tại không
      const userWithEmail = users.find(u => (u.email || '').toLowerCase().trim() === normalizedEmail);
      if (userWithEmail) {
        console.log('Email tồn tại nhưng mật khẩu không khớp');
        return { success: false, message: 'Mật khẩu không đúng' };
      }
      
      console.log('Không tìm thấy người dùng phù hợp');
      return { success: false, message: 'Email chưa được đăng ký' };
    } catch (error) {
      console.error('Lỗi khi đăng nhập:', error);
      return { success: false, message: 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại' };
    }
  };

  const register = (userData) => {
    console.log('Đang đăng ký người dùng mới:', userData);
    
    // Kiểm tra dữ liệu người dùng hợp lệ
    if (!userData.email || !userData.password || !userData.name) {
      console.error('Dữ liệu đăng ký thiếu trường bắt buộc:', userData);
      return { success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' };
    }
    
    try {
      // Lấy danh sách người dùng hiện có
      let users = [];
      try {
        const usersJson = localStorage.getItem('users');
        users = usersJson ? JSON.parse(usersJson) : [];
        console.log('Danh sách người dùng hiện tại:', users);
      } catch (error) {
        console.error('Lỗi khi đọc danh sách người dùng:', error);
        users = [];
      }
      
      // Kiểm tra email đã tồn tại (không phân biệt chữ hoa/thường)
      if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        console.log('Email đã tồn tại:', userData.email);
        return { success: false, message: 'Email đã được sử dụng' };
      }
      
      const newUser = {
        ...userData,
        id: Date.now().toString(),
        role: 'user',
        createdAt: new Date().toISOString()
      };
      
      // Thêm người dùng mới vào danh sách
      users.push(newUser);
      
      // Lưu vào localStorage
      try {
        const usersJson = JSON.stringify(users);
        localStorage.setItem('users', usersJson);
        console.log('Đã lưu danh sách người dùng mới:', usersJson);
        
        // Kiểm tra lại để đảm bảo đã lưu thành công
        const savedUsers = localStorage.getItem('users');
        console.log('Dữ liệu đã lưu:', savedUsers);
        
        console.log('Đã đăng ký thành công người dùng mới:', newUser);
        return { success: true };
      } catch (error) {
        console.error('Lỗi khi lưu người dùng mới:', error);
        return { success: false, message: 'Không thể lưu thông tin đăng ký, vui lòng thử lại' };
      }
    } catch (error) {
      console.error('Lỗi không xác định khi đăng ký:', error);
      return { success: false, message: 'Đã xảy ra lỗi khi đăng ký, vui lòng thử lại' };
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    isAdmin: currentUser?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
