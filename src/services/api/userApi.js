const getUsers = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let users = JSON.parse(localStorage.getItem('users')) || [];
      
      // Không trả về mật khẩu
      const usersWithoutPassword = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      resolve(usersWithoutPassword);
    }, 300);
  });
};

const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const user = users.find(u => u.id === id);
      
      if (user) {
        // Không trả về mật khẩu
        const { password, ...userWithoutPassword } = user;
        resolve(userWithoutPassword);
      } else {
        reject(new Error('Không tìm thấy người dùng'));
      }
    }, 300);
  });
};

const updateUser = (id, userData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const index = users.findIndex(u => u.id === id);
      
      if (index !== -1) {
        // Nếu có mật khẩu mới, cập nhật mật khẩu
        if (userData.password) {
          users[index].password = userData.password;
        }
        
        // Cập nhật các trường khác
        const { password, ...otherData } = userData;
        users[index] = { ...users[index], ...otherData };
        
        localStorage.setItem('users', JSON.stringify(users));
        
        // Không trả về mật khẩu
        const { password: _, ...updatedUser } = users[index];
        resolve(updatedUser);
      } else {
        reject(new Error('Không tìm thấy người dùng'));
      }
    }, 500);
  });
};

const deleteUser = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const index = users.findIndex(u => u.id === id);
      
      if (index !== -1) {
        // Kiểm tra nếu là admin duy nhất thì không cho xóa
        const adminCount = users.filter(user => user.role === 'admin').length;
        if (users[index].role === 'admin' && adminCount <= 1) {
          reject(new Error('Không thể xóa admin duy nhất!'));
          return;
        }
        
        users.splice(index, 1);
        localStorage.setItem('users', JSON.stringify(users));
        resolve({ success: true });
      } else {
        reject(new Error('Không tìm thấy người dùng'));
      }
    }, 500);
  });
};

export {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};
