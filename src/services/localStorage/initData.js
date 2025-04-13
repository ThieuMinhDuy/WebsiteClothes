export const initializeAppData = () => {
  // Kiểm tra và khởi tạo dữ liệu nếu chưa có
  if (!localStorage.getItem('products')) {
    const sampleProducts = [
      {
        id: '1',
        name: 'Áo thun nam basic',
        price: 199000,
        oldPrice: 250000,
        discount: 20,
        description: 'Áo thun cotton 100% thoáng mát',
        categoryId: '1',
        collection: 'summer',
        images: ['https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Đen', 'Trắng', 'Xám'],
        inStock: 50,
        sold: 230,
        rating: 4.5,
        numReviews: 45
      },
      {
        id: '2',
        name: 'Quần jean nam slim fit',
        price: 450000,
        oldPrice: 500000,
        discount: 10,
        description: 'Quần jean co giãn, form slim fit',
        categoryId: '3',
        collection: 'winter',
        images: ['https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'],
        sizes: ['29', '30', '31', '32'],
        colors: ['Xanh đậm', 'Xanh nhạt'],
        inStock: 30,
        sold: 150,
        rating: 4.3,
        numReviews: 32
      },
      {
        id: '3',
        name: 'Áo thun UT họa tiết Marvel',
        price: 299000,
        oldPrice: 350000,
        discount: 15,
        description: 'Áo thun cotton với họa tiết Marvel độc quyền',
        categoryId: '1',
        collection: 'ut',
        images: ['https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Đen', 'Trắng', 'Xanh Navy'],
        inStock: 45,
        sold: 320,
        rating: 4.7,
        numReviews: 78
      },
      {
        id: '4',
        name: 'Áo giữ nhiệt Heattech cổ cao',
        price: 399000,
        oldPrice: 450000,
        discount: 12,
        description: 'Áo giữ nhiệt công nghệ Heattech giữ ấm hiệu quả',
        categoryId: '1',
        collection: 'heattech',
        images: ['https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Đen', 'Trắng', 'Be'],
        inStock: 60,
        sold: 410,
        rating: 4.8,
        numReviews: 93
      },
      {
        id: '5',
        name: 'Áo khoác lông cừu Thu Đông',
        price: 999000,
        oldPrice: 1200000,
        discount: 17,
        description: 'Áo khoác lông cừu cao cấp giữ ấm cực tốt',
        categoryId: '2',
        collection: 'winter',
        images: ['https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Đen', 'Be', 'Nâu'],
        inStock: 25,
        sold: 128,
        rating: 4.6,
        numReviews: 41
      },
      {
        id: '6',
        name: 'Quần shorts nam mùa hè',
        price: 259000,
        oldPrice: 300000,
        discount: 14,
        description: 'Quần shorts chất liệu nhẹ thoáng mát cho mùa hè',
        categoryId: '4',
        collection: 'summer',
        images: ['https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'],
        sizes: ['29', '30', '31', '32', '33'],
        colors: ['Đen', 'Xanh Navy', 'Be'],
        inStock: 40,
        sold: 215,
        rating: 4.4,
        numReviews: 56
      },
      {
        id: '7',
        name: 'Áo thun UT phiên bản giới hạn Star Wars',
        price: 349000,
        oldPrice: 399000,
        discount: 13,
        description: 'Áo thun họa tiết Star Wars phiên bản giới hạn',
        categoryId: '1',
        collection: 'ut',
        images: ['https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Đen', 'Trắng', 'Xám'],
        inStock: 35,
        sold: 287,
        rating: 4.8,
        numReviews: 63
      },
      {
        id: '8',
        name: 'Áo len thu đông cổ tròn',
        price: 599000,
        oldPrice: 700000,
        discount: 14,
        description: 'Áo len mềm mịn giữ ấm tốt',
        categoryId: '2',
        collection: 'winter',
        images: ['https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Đen', 'Xám', 'Be', 'Xanh Navy'],
        inStock: 45,
        sold: 176,
        rating: 4.7,
        numReviews: 52
      },
      {
        id: '9',
        name: 'Quần đùi thể thao mùa hè',
        price: 199000,
        oldPrice: 250000,
        discount: 20,
        description: 'Quần đùi thể thao thoáng mát, thấm hút mồ hôi tốt',
        categoryId: '4',
        collection: 'summer',
        images: ['https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Đen', 'Xanh Navy', 'Xám'],
        inStock: 55,
        sold: 235,
        rating: 4.5,
        numReviews: 48
      },
      {
        id: '10',
        name: 'Áo giữ nhiệt Heattech cổ thuyền',
        price: 349000,
        oldPrice: 399000,
        discount: 13,
        description: 'Áo giữ nhiệt Heattech mỏng nhẹ, mặc trong mùa lạnh',
        categoryId: '1',
        collection: 'heattech',
        images: ['https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Đen', 'Trắng', 'Be', 'Xám'],
        inStock: 70,
        sold: 345,
        rating: 4.6,
        numReviews: 87
      },
      {
        id: '11',
        name: 'Quần legging Heattech giữ nhiệt',
        price: 399000,
        oldPrice: 450000,
        discount: 11,
        description: 'Quần legging Heattech co giãn, giữ ấm hiệu quả',
        categoryId: '3',
        collection: 'heattech',
        images: ['https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Đen', 'Xám Đậm'],
        inStock: 40,
        sold: 267,
        rating: 4.9,
        numReviews: 72
      },
      {
        id: '12',
        name: 'Áo khoác phao nhẹ Thu Đông',
        price: 1290000,
        oldPrice: 1500000,
        discount: 14,
        description: 'Áo khoác phao siêu nhẹ, giữ ấm tốt',
        categoryId: '2',
        collection: 'winter',
        images: ['https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Đen', 'Xanh Navy', 'Be', 'Đỏ'],
        inStock: 30,
        sold: 156,
        rating: 4.7,
        numReviews: 43
      }
    ];
    localStorage.setItem('products', JSON.stringify(sampleProducts));
  }

  if (!localStorage.getItem('categories')) {
    const categories = [
      { id: '1', name: 'Áo thun' },
      { id: '2', name: 'Áo khoác' },
      { id: '3', name: 'Quần dài' },
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
