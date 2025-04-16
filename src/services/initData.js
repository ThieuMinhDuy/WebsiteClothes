// Danh sách các voucher mẫu
const sampleVouchers = [
  {
    id: '1',
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minOrderValue: 200000,
    maxDiscount: 100000,
    description: 'Giảm 10% cho đơn hàng từ 200,000đ, tối đa 100,000đ',
    isActive: true,
    startDate: '2023-01-01',
    endDate: '2025-12-31',
    usageLimit: 100,
    usageCount: 0,
    isForNewUser: true,
    isForShipping: false
  },
  {
    id: '2',
    code: 'FREESHIP',
    type: 'shipping',
    value: 30000,
    minOrderValue: 300000,
    maxDiscount: 30000,
    description: 'Miễn phí vận chuyển cho đơn hàng từ 300,000đ',
    isActive: true,
    startDate: '2023-01-01',
    endDate: '2025-12-31',
    usageLimit: 200,
    usageCount: 0,
    isForNewUser: false,
    isForShipping: true
  },
  {
    id: '3',
    code: 'SUMMER30',
    type: 'percentage',
    value: 30,
    minOrderValue: 500000,
    maxDiscount: 200000,
    description: 'Giảm 30% cho đơn hàng từ 500,000đ, tối đa 200,000đ',
    isActive: true,
    startDate: '2023-06-01',
    endDate: '2025-12-31',
    usageLimit: 50,
    usageCount: 0,
    isForNewUser: false,
    isForShipping: false
  },
  {
    id: '4',
    code: 'FIXED100K',
    type: 'fixed',
    value: 100000,
    minOrderValue: 500000,
    maxDiscount: 100000,
    description: 'Giảm 100,000đ cho đơn hàng từ 500,000đ',
    isActive: true,
    startDate: '2023-01-01',
    endDate: '2025-12-31',
    usageLimit: 30,
    usageCount: 0,
    isForNewUser: false,
    isForShipping: false
  }
];

// Khởi tạo dữ liệu trong localStorage
const initializeLocalStorage = () => {
  console.log('Khởi tạo dữ liệu...');
  
  // Khởi tạo vouchers
  localStorage.setItem('vouchers', JSON.stringify(sampleVouchers));
  console.log('Đã khởi tạo vouchers:', sampleVouchers.length, 'vouchers');
  
  // Thêm bất kỳ dữ liệu mẫu nào khác tại đây...
};

// Hàm để gọi khi cần khởi tạo lại dữ liệu
const resetData = () => {
  console.log('Đang reset dữ liệu...');
  localStorage.removeItem('vouchers');
  
  // Khởi tạo lại dữ liệu
  initializeLocalStorage();
  
  console.log('Dữ liệu đã được reset thành công');
  return true;
};

// Xuất các hàm để sử dụng trong ứng dụng
export {
  initializeLocalStorage,
  resetData
}; 