export const initializeAppData = () => {
  // Kiểm tra và khởi tạo dữ liệu nếu chưa có
  if (!localStorage.getItem('products')) {
    const sampleProducts = [
      {
        id: '1',
        name: 'Áo thun nam basic',
        price: 199000,
        description: 'Áo thun cotton 100% thoáng mát',
        categoryId: '1',
        images: ['https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Đen', 'Trắng', 'Xám'],
        inStock: 50
      },
      {
        id: '2',
        name: 'Quần jean nam slim fit',
        price: 450000,
        description: 'Quần jean co giãn, form slim fit',
        categoryId: '3',
        images: ['https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'],
        sizes: ['29', '30', '31', '32'],
        colors: ['Xanh đậm', 'Xanh nhạt'],
        inStock: 30
      }
    ];
    localStorage.setItem('products', JSON.stringify(sampleProducts));
  }

  if (!localStorage.getItem('categories')) {
    const categories = [
      { id: '1', name: 'Áo thun' },
      { id: '2', name: 'Áo sơ mi' },
      { id: '3', name: 'Quần jean' },
      { id: '4', name: 'Quần short' }
    ];
    localStorage.setItem('categories', JSON.stringify(categories));
  }

  if (!localStorage.getItem('users')) {
    const users = [
      {
        id: '1',
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Admin',
        role: 'admin',
        phone: '0987654321',
        address: 'Hà Nội',
        avatar: null,
        createdAt: new Date().toISOString(),
        active: true
      }
    ];
    localStorage.setItem('users', JSON.stringify(users));
  }

  if (!localStorage.getItem('orders')) {
    localStorage.setItem('orders', JSON.stringify([]));
  }
};
