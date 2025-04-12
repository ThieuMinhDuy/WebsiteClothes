const getOrders = (userId = null) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let orders = JSON.parse(localStorage.getItem('orders')) || [];
      
      // Nếu có userId, lọc theo người dùng
      if (userId) {
        orders = orders.filter(order => order.userId === userId);
      }
      
      resolve(orders);
    }, 300);
  });
};

const getOrderById = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const orders = JSON.parse(localStorage.getItem('orders')) || [];
      const order = orders.find(o => o.id === id);
      
      if (order) {
        resolve(order);
      } else {
        reject(new Error('Không tìm thấy đơn hàng'));
      }
    }, 300);
  });
};

const createOrder = (orderData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const orders = JSON.parse(localStorage.getItem('orders')) || [];
      
      const newOrder = {
        ...orderData,
        id: Date.now().toString(),
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      orders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify(orders));
      
      // Xóa giỏ hàng sau khi đặt hàng
      localStorage.removeItem('cart');
      
      resolve(newOrder);
    }, 500);
  });
};

const updateOrderStatus = (id, status) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const orders = JSON.parse(localStorage.getItem('orders')) || [];
      const index = orders.findIndex(o => o.id === id);
      
      if (index !== -1) {
        orders[index].status = status;
        orders[index].updatedAt = new Date().toISOString();
        localStorage.setItem('orders', JSON.stringify(orders));
        resolve(orders[index]);
      } else {
        reject(new Error('Không tìm thấy đơn hàng'));
      }
    }, 500);
  });
};

export {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus
};
