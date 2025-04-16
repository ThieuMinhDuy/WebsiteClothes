// Danh sách voucher có sẵn trong hệ thống
const vouchers = [
  {
    id: 'WELCOME10',
    code: 'WELCOME10',
    type: 'percent',
    value: 10,
    minOrderValue: 200000,
    maxDiscount: 100000,
    description: 'Giảm 10% cho đơn hàng từ 200,000đ, tối đa 100,000đ',
    expiry: '2024-12-31',
    isActive: true,
    usageLimit: 1000,
    usageCount: 0
  },
  {
    id: 'FREESHIP',
    code: 'FREESHIP',
    type: 'shipping',
    value: 30000,
    minOrderValue: 500000,
    maxDiscount: 30000,
    description: 'Miễn phí vận chuyển cho đơn hàng từ 500,000đ',
    expiry: '2024-12-31',
    isActive: true,
    usageLimit: 1000,
    usageCount: 0
  },
  {
    id: 'SUMMER30',
    code: 'SUMMER30',
    type: 'percent',
    value: 30,
    minOrderValue: 1000000,
    maxDiscount: 300000,
    description: 'Giảm 30% cho đơn hàng từ 1,000,000đ, tối đa 300,000đ',
    expiry: '2024-08-31',
    isActive: true,
    usageLimit: 500,
    usageCount: 0
  },
  {
    id: 'FIXED50K',
    code: 'FIXED50K',
    type: 'fixed',
    value: 50000,
    minOrderValue: 300000,
    maxDiscount: 50000,
    description: 'Giảm 50,000đ cho đơn hàng từ 300,000đ',
    expiry: '2024-12-31',
    isActive: true,
    usageLimit: 1000,
    usageCount: 0
  }
];

/**
 * Lấy danh sách tất cả các voucher
 */
const getAllVouchers = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const storedVouchers = JSON.parse(localStorage.getItem('vouchers')) || vouchers;
      
      // Lần đầu chạy: nếu chưa có voucher trong localStorage, lưu vouchers mặc định
      if (!localStorage.getItem('vouchers')) {
        localStorage.setItem('vouchers', JSON.stringify(vouchers));
      }
      
      resolve(storedVouchers);
    }, 300);
  });
};

/**
 * Kiểm tra tính hợp lệ của voucher
 * @param {string} code - Mã voucher cần kiểm tra
 */
const validateVoucher = (code) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const storedVouchers = JSON.parse(localStorage.getItem('vouchers')) || vouchers;
      const voucher = storedVouchers.find(v => v.code === code);
      
      if (!voucher) {
        reject({ message: 'Mã giảm giá không tồn tại. Vui lòng kiểm tra lại!' });
        return;
      }
      
      // Kiểm tra trạng thái active
      if (!voucher.isActive) {
        reject({ message: 'Mã giảm giá đã hết hiệu lực hoặc bị khóa. Vui lòng sử dụng mã khác!' });
        return;
      }
      
      // Kiểm tra hạn sử dụng
      if (new Date(voucher.expiry) < new Date()) {
        const expiryDate = new Date(voucher.expiry).toLocaleDateString('vi-VN');
        reject({ message: `Mã giảm giá đã hết hạn vào ngày ${expiryDate}. Vui lòng sử dụng mã khác!` });
        return;
      }
      
      // Kiểm tra số lần sử dụng
      if (voucher.usageCount >= voucher.usageLimit) {
        reject({ message: 'Mã giảm giá đã đạt giới hạn lượt sử dụng. Vui lòng sử dụng mã khác!' });
        return;
      }
      
      resolve(voucher);
    }, 300);
  });
};

/**
 * Áp dụng voucher cho đơn hàng
 * @param {string} code - Mã voucher
 * @param {number} subtotal - Tổng tiền đơn hàng trước khi áp dụng voucher
 * @param {number} shippingFee - Phí vận chuyển
 */
const applyVoucher = (code, subtotal, shippingFee) => {
  return new Promise((resolve, reject) => {
    validateVoucher(code)
      .then(voucher => {
        // Kiểm tra giá trị đơn hàng tối thiểu
        if (subtotal < voucher.minOrderValue) {
          const missing = voucher.minOrderValue - subtotal;
          reject({ 
            message: `Đơn hàng chưa đạt giá trị tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')}đ để áp dụng mã giảm giá. Bạn cần thêm ${missing.toLocaleString('vi-VN')}đ nữa!` 
          });
          return;
        }
        
        let discount = 0;
        let newShippingFee = shippingFee;
        
        // Tính toán giảm giá dựa trên loại voucher
        switch (voucher.type) {
          case 'percent':
            discount = (subtotal * voucher.value) / 100;
            // Giới hạn số tiền giảm giá tối đa
            if (discount > voucher.maxDiscount) {
              discount = voucher.maxDiscount;
            }
            break;
            
          case 'fixed':
            discount = voucher.value;
            break;
            
          case 'shipping':
            newShippingFee = Math.max(0, shippingFee - voucher.value);
            discount = shippingFee - newShippingFee;
            break;
            
          default:
            discount = 0;
            break;
        }
        
        // Tăng số lần sử dụng voucher
        const storedVouchers = JSON.parse(localStorage.getItem('vouchers')) || vouchers;
        const updatedVouchers = storedVouchers.map(v => {
          if (v.code === code) {
            return {
              ...v,
              usageCount: v.usageCount + 1
            };
          }
          return v;
        });
        
        localStorage.setItem('vouchers', JSON.stringify(updatedVouchers));
        
        resolve({
          voucher,
          discount,
          shippingFee: newShippingFee,
          total: subtotal + newShippingFee - discount
        });
      })
      .catch(error => reject(error));
  });
};

/**
 * Tạo mã giảm giá 10% cho khách hàng khi đánh giá sản phẩm lần đầu
 * @param {string} userId - ID của người dùng
 */
const generateReviewVoucher = (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Tạo mã voucher duy nhất cho người dùng
      const timestamp = new Date().getTime().toString().slice(-6);
      const voucherCode = `REVIEW10_${userId.slice(0, 4)}_${timestamp}`;
      
      // Tạo đối tượng voucher mới
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 3); // Hạn sử dụng 3 tháng
      
      const newVoucher = {
        id: voucherCode,
        code: voucherCode,
        type: 'percent',
        value: 10,
        minOrderValue: 200000,
        maxDiscount: 100000,
        description: 'Giảm 10% cho đơn hàng từ 200,000đ, tối đa 100,000đ - Voucher dành cho khách đánh giá sản phẩm',
        expiry: expiryDate.toISOString().split('T')[0],
        isActive: true,
        usageLimit: 1,
        usageCount: 0,
        userId: userId // Gán voucher cho người dùng cụ thể
      };
      
      // Lưu voucher mới vào danh sách voucher trong localStorage
      const storedVouchers = JSON.parse(localStorage.getItem('vouchers')) || vouchers;
      storedVouchers.push(newVoucher);
      localStorage.setItem('vouchers', JSON.stringify(storedVouchers));
      
      // Lưu thông tin voucher vào localStorage của người dùng
      const userVouchers = JSON.parse(localStorage.getItem(`userVouchers_${userId}`)) || [];
      userVouchers.push(newVoucher);
      localStorage.setItem(`userVouchers_${userId}`, JSON.stringify(userVouchers));
      
      resolve(newVoucher);
    }, 500);
  });
};

export {
  getAllVouchers,
  validateVoucher,
  applyVoucher,
  generateReviewVoucher
}; 