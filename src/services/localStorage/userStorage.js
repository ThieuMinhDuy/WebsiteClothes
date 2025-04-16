/**
 * Lấy thông tin người dùng hiện tại từ localStorage
 * @returns {Object|null} Thông tin người dùng đã đăng nhập hoặc null nếu chưa đăng nhập
 */
export const getUserFromLocalStorage = () => {
  try {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng từ localStorage:', error);
    return null;
  }
};

/**
 * Lưu thông tin người dùng vào localStorage
 * @param {Object} user - Thông tin người dùng cần lưu
 */
export const saveUserToLocalStorage = (user) => {
  try {
    if (!user) {
      localStorage.removeItem('currentUser');
    } else {
      // Đảm bảo không lưu password vào localStorage
      const { password, ...userWithoutPassword } = user;
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    }
  } catch (error) {
    console.error('Lỗi khi lưu thông tin người dùng vào localStorage:', error);
  }
};

/**
 * Xóa thông tin người dùng khỏi localStorage (đăng xuất)
 */
export const removeUserFromLocalStorage = () => {
  try {
    localStorage.removeItem('currentUser');
  } catch (error) {
    console.error('Lỗi khi xóa thông tin người dùng khỏi localStorage:', error);
  }
};

/**
 * Kiểm tra người dùng có phải là admin không
 * @returns {boolean} True nếu người dùng là admin, ngược lại False
 */
export const isAdminUser = () => {
  const user = getUserFromLocalStorage();
  return user?.role === 'admin';
}; 