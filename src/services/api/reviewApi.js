/**
 * Kiểm tra xem đây có phải là đánh giá đầu tiên của người dùng không
 * @param {string} userId - ID của người dùng
 * @returns {Promise<boolean>} true nếu là đánh giá đầu tiên, false nếu đã có đánh giá trước đó
 */
const checkFirstReview = (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Lấy danh sách đánh giá từ localStorage
      const reviews = JSON.parse(localStorage.getItem('productReviews')) || {};
      let userHasReviews = false;
      
      // Kiểm tra xem người dùng đã có đánh giá nào trước đó chưa
      Object.values(reviews).forEach(productReviews => {
        if (productReviews.some(review => review.userId === userId)) {
          userHasReviews = true;
        }
      });
      
      // Trả về true nếu người dùng chưa có đánh giá nào, false nếu ngược lại
      resolve(!userHasReviews);
    }, 500);
  });
};

/**
 * Lấy tất cả đánh giá trong hệ thống
 * @returns {Promise<Array>} Mảng chứa tất cả đánh giá
 */
const getAllReviews = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const reviewsObj = JSON.parse(localStorage.getItem('productReviews')) || {};
      const allReviews = [];
      
      // Gộp tất cả đánh giá từ các sản phẩm khác nhau vào một mảng
      Object.values(reviewsObj).forEach(reviews => {
        allReviews.push(...reviews);
      });
      
      // Sắp xếp đánh giá theo thời gian tạo (mới nhất trước)
      allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      resolve(allReviews);
    }, 500);
  });
};

/**
 * Lấy đánh giá theo ID sản phẩm
 * @param {string} productId - ID sản phẩm
 * @returns {Promise<Array>} Mảng chứa đánh giá của sản phẩm
 */
const getReviewsByProductId = (productId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const reviewsObj = JSON.parse(localStorage.getItem('productReviews')) || {};
      const productReviews = reviewsObj[productId] || [];
      
      // Sắp xếp đánh giá theo thời gian tạo (mới nhất trước)
      productReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      resolve(productReviews);
    }, 500);
  });
};

/**
 * Lấy đánh giá theo ID người dùng
 * @param {string} userId - ID người dùng
 * @returns {Promise<Array>} Mảng chứa đánh giá của người dùng
 */
const getReviewsByUserId = (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const reviewsObj = JSON.parse(localStorage.getItem('productReviews')) || {};
      const userReviews = [];
      
      // Lọc đánh giá của người dùng từ tất cả các sản phẩm
      Object.values(reviewsObj).forEach(reviews => {
        userReviews.push(...reviews.filter(review => review.userId === userId));
      });
      
      // Sắp xếp đánh giá theo thời gian tạo (mới nhất trước)
      userReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      resolve(userReviews);
    }, 500);
  });
};

/**
 * Thêm đánh giá mới
 * @param {Object} reviewData - Dữ liệu đánh giá
 * @returns {Promise<Object>} Đánh giá đã thêm
 */
const addReview = (reviewData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { productId, userId, userName, rating, comment, orderId } = reviewData;
      
      // Tải đánh giá hiện có
      const allReviews = JSON.parse(localStorage.getItem('productReviews')) || {};
      const productReviews = allReviews[productId] || [];
      
      // Tạo đánh giá mới
      const newReview = {
        id: Date.now().toString(),
        productId,
        userId,
        userName,
        rating,
        comment,
        orderId,
        createdAt: new Date().toISOString(),
        likes: 0,
        verified: true
      };
      
      // Thêm đánh giá mới vào danh sách
      productReviews.push(newReview);
      allReviews[productId] = productReviews;
      
      // Lưu vào localStorage
      localStorage.setItem('productReviews', JSON.stringify(allReviews));
      
      // Cập nhật trạng thái đánh giá cho đơn hàng
      updateOrderReviewStatus(orderId, productId);
      
      // Cập nhật rating trung bình cho sản phẩm
      updateProductAverageRating(productId);
      
      resolve(newReview);
    }, 500);
  });
};

/**
 * Cập nhật đánh giá
 * @param {string} reviewId - ID đánh giá cần cập nhật
 * @param {Object} updateData - Dữ liệu cập nhật
 * @returns {Promise<Object>} Đánh giá đã cập nhật
 */
const updateReview = (reviewId, updateData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const reviewsObj = JSON.parse(localStorage.getItem('productReviews')) || {};
      let foundReview = null;
      let foundProductId = null;
      
      // Tìm đánh giá cần cập nhật
      Object.entries(reviewsObj).forEach(([productId, reviews]) => {
        const reviewIndex = reviews.findIndex(review => review.id === reviewId);
        if (reviewIndex !== -1) {
          foundReview = reviews[reviewIndex];
          foundProductId = productId;
        }
      });
      
      if (!foundReview || !foundProductId) {
        return reject(new Error('Không tìm thấy đánh giá'));
      }
      
      // Cập nhật đánh giá
      const updatedReview = { 
        ...foundReview, 
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      // Lưu vào localStorage
      const reviewIndex = reviewsObj[foundProductId].findIndex(review => review.id === reviewId);
      reviewsObj[foundProductId][reviewIndex] = updatedReview;
      localStorage.setItem('productReviews', JSON.stringify(reviewsObj));
      
      // Cập nhật rating trung bình cho sản phẩm nếu rating thay đổi
      if (updateData.rating) {
        updateProductAverageRating(foundProductId);
      }
      
      resolve(updatedReview);
    }, 500);
  });
};

/**
 * Xóa đánh giá
 * @param {string} reviewId - ID đánh giá cần xóa
 * @returns {Promise<boolean>} Trạng thái xóa thành công
 */
const deleteReview = (reviewId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const reviewsObj = JSON.parse(localStorage.getItem('productReviews')) || {};
      let foundProductId = null;
      
      // Tìm đánh giá cần xóa
      Object.entries(reviewsObj).forEach(([productId, reviews]) => {
        const reviewIndex = reviews.findIndex(review => review.id === reviewId);
        if (reviewIndex !== -1) {
          foundProductId = productId;
          // Xóa đánh giá khỏi mảng
          reviewsObj[productId].splice(reviewIndex, 1);
        }
      });
      
      if (!foundProductId) {
        return reject(new Error('Không tìm thấy đánh giá'));
      }
      
      // Lưu vào localStorage
      localStorage.setItem('productReviews', JSON.stringify(reviewsObj));
      
      // Cập nhật rating trung bình cho sản phẩm
      updateProductAverageRating(foundProductId);
      
      resolve(true);
    }, 500);
  });
};

/**
 * Cập nhật trạng thái đánh giá cho đơn hàng
 * @param {string} orderId - ID đơn hàng
 * @param {string} productId - ID sản phẩm
 * @private
 */
const updateOrderReviewStatus = (orderId, productId) => {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const orderIndex = orders.findIndex(order => order.id === orderId);
  
  if (orderIndex !== -1) {
    const order = orders[orderIndex];
    
    // Kiểm tra xem đơn hàng có mảng reviewedItems chưa
    if (!order.reviewedItems) {
      order.reviewedItems = [];
    }
    
    // Thêm productId vào mảng reviewedItems nếu chưa có
    if (!order.reviewedItems.includes(productId)) {
      order.reviewedItems.push(productId);
    }
    
    orders[orderIndex] = order;
    localStorage.setItem('orders', JSON.stringify(orders));
  }
};

/**
 * Cập nhật điểm đánh giá trung bình cho sản phẩm
 * @param {string} productId - ID sản phẩm
 * @private
 */
const updateProductAverageRating = (productId) => {
  const allReviews = JSON.parse(localStorage.getItem('productReviews')) || {};
  const productReviews = allReviews[productId] || [];
  
  if (productReviews.length === 0) return;
  
  // Tính điểm trung bình
  const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / productReviews.length;
  
  // Cập nhật vào sản phẩm
  const products = JSON.parse(localStorage.getItem('products')) || [];
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex !== -1) {
    products[productIndex].rating = {
      average: parseFloat(averageRating.toFixed(1)),
      count: productReviews.length
    };
    
    localStorage.setItem('products', JSON.stringify(products));
  }
};

// Xuất các hàm API
export {
  getAllReviews,
  getReviewsByProductId,
  getReviewsByUserId,
  addReview,
  updateReview,
  deleteReview,
  checkFirstReview
}; 