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
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Không lưu password vào currentUser
      const { password, ...userWithoutPassword } = user;
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      setCurrentUser(userWithoutPassword);
      return { success: true };
    }
    
    return { success: false, message: 'Email hoặc mật khẩu không đúng' };
  };

  const register = (userData) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Kiểm tra email đã tồn tại
    if (users.find(u => u.email === userData.email)) {
      return { success: false, message: 'Email đã được sử dụng' };
    }
    
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      role: 'user',
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    return { success: true };
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
