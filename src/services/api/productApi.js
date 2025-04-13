const getProducts = (filters = {}) => {
  return new Promise((resolve) => {
    // Mô phỏng độ trễ của API
    setTimeout(() => {
      let products = JSON.parse(localStorage.getItem('products')) || [];
      
      // Lọc theo danh mục
      if (filters.categoryId) {
        products = products.filter(p => p.categoryId === filters.categoryId);
      }
      
      // Lọc theo giá
      if (filters.minPrice !== undefined) {
        products = products.filter(p => p.price >= filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        products = products.filter(p => p.price <= filters.maxPrice);
      }
      
      // Tìm kiếm theo tên
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        products = products.filter(p => 
          p.name.toLowerCase().includes(keyword) || 
          p.description.toLowerCase().includes(keyword)
        );
      }
      
      resolve(products);
    }, 300);
  });
};

const getProductById = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const products = JSON.parse(localStorage.getItem('products')) || [];
      const product = products.find(p => p.id === id);
      
      if (product) {
        resolve(product);
      } else {
        reject(new Error('Không tìm thấy sản phẩm'));
      }
    }, 300);
  });
};

const getCategories = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const categories = JSON.parse(localStorage.getItem('categories')) || [];
      resolve(categories);
    }, 300);
  });
};

// Admin API
const createProduct = (productData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const products = JSON.parse(localStorage.getItem('products')) || [];
      
      // Lấy ID mới bằng cách tăng dần từ ID lớn nhất hiện tại
      let maxId = 0;
      if (products.length > 0) {
        const ids = products.map(p => {
          // Chuyển đổi id từ chuỗi sang số nếu có thể
          const numId = parseInt(p.id);
          return isNaN(numId) ? 0 : numId;
        });
        maxId = Math.max(...ids);
      }
      
      const newProduct = {
        ...productData,
        id: (maxId + 1).toString(),
        createdAt: new Date().toISOString()
      };
      
      products.push(newProduct);
      localStorage.setItem('products', JSON.stringify(products));
      
      resolve(newProduct);
    }, 500);
  });
};

const updateProduct = (id, productData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const products = JSON.parse(localStorage.getItem('products')) || [];
      const index = products.findIndex(p => p.id === id);
      
      if (index !== -1) {
        products[index] = { ...products[index], ...productData };
        localStorage.setItem('products', JSON.stringify(products));
        resolve(products[index]);
      } else {
        reject(new Error('Không tìm thấy sản phẩm'));
      }
    }, 500);
  });
};

const deleteProduct = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const products = JSON.parse(localStorage.getItem('products')) || [];
      const index = products.findIndex(p => p.id === id);
      
      if (index !== -1) {
        products.splice(index, 1);
        localStorage.setItem('products', JSON.stringify(products));
        resolve({ success: true });
      } else {
        reject(new Error('Không tìm thấy sản phẩm'));
      }
    }, 500);
  });
};

// Lấy các sản phẩm liên quan dựa trên id sản phẩm hiện tại và danh mục
const getRelatedProducts = (currentProductId, categoryId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const products = JSON.parse(localStorage.getItem('products')) || [];
      
      // Lọc sản phẩm cùng danh mục nhưng không phải sản phẩm hiện tại
      let relatedProducts = products.filter(p => 
        p.id !== currentProductId && 
        (p.categoryId === categoryId || p.category === categoryId)
      );
      
      // Nếu không có đủ sản phẩm liên quan, bổ sung thêm sản phẩm khác
      if (relatedProducts.length < 4) {
        const otherProducts = products
          .filter(p => p.id !== currentProductId && !relatedProducts.includes(p))
          .slice(0, 4 - relatedProducts.length);
        
        relatedProducts = [...relatedProducts, ...otherProducts];
      }
      
      // Giới hạn số lượng sản phẩm trả về
      resolve(relatedProducts.slice(0, 4));
    }, 300);
  });
};

const getCollections = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const collections = [
        {
          id: 'winter',
          name: 'BỘ SƯU TẬP THU ĐÔNG 2025',
          description: 'Khám phá những thiết kế mới nhất phù hợp cho mùa Thu Đông với chất liệu giữ ấm tối ưu và thiết kế thời thượng.',
          image: '/assets/images/thudong.jpg',
          longDescription: 'Bộ sưu tập Thu Đông 2025 mang đến những thiết kế hiện đại, ấm áp với tông màu trầm ấm. Các sản phẩm được làm từ chất liệu cao cấp, giữ nhiệt tốt, phù hợp cho thời tiết lạnh.',
        },
        {
          id: 'heattech',
          name: 'HEATTECH - CÔNG NGHỆ GIỮ NHIỆT',
          description: 'Mỏng nhẹ nhưng vẫn giữ ấm hiệu quả trong thời tiết lạnh với công nghệ HEATTECH độc quyền.',
          image: '/assets/images/heatech.jpg',
          longDescription: 'Công nghệ HEATTECH độc quyền sử dụng sợi vải đặc biệt có khả năng chuyển đổi hơi ẩm từ cơ thể thành nhiệt, giúp giữ ấm hiệu quả mà vẫn mỏng nhẹ, thoải mái khi mặc.',
        },
        {
          id: 'ut',
          name: 'UT - ÁO PHÔNG IN HỌA TIẾT',
          description: 'Bộ sưu tập áo phông với những họa tiết độc quyền từ các nghệ sĩ toàn cầu và các thương hiệu nổi tiếng.',
          image: '/assets/images/aophong.webp',
          longDescription: 'UT (Unique T-shirt) là dòng áo phông với họa tiết độc đáo được hợp tác với các nghệ sĩ và thương hiệu nổi tiếng toàn cầu. Mỗi chiếc áo là một tác phẩm nghệ thuật, thể hiện cá tính riêng của người mặc.',
        },
        {
          id: 'summer',
          name: 'BỘ SƯU TẬP HÈ 2025',
          description: 'Tươi mát và phong cách với những thiết kế dành cho mùa hè sôi động.',
          image: '/assets/images/bst hè.jpg',
          longDescription: 'Bộ sưu tập Hè 2025 mang đến những thiết kế tươi mát với tông màu trung tính và kẻ sọc tinh tế. Các sản phẩm phù hợp cho mùa hè, dễ dàng mix-match với nhiều phong cách khác nhau từ đi làm đến dạo phố.',
          bannerImage: '/assets/images/bst hè.jpg',
          sections: [
            {
              title: 'Chất liệu cao cấp',
              description: 'Cotton và vải lanh cao cấp, thấm hút mồ hôi tốt, giúp bạn luôn cảm thấy thoải mái và thanh lịch trong mùa hè.'
            },
            {
              title: 'Thiết kế hiện đại',
              description: 'Họa tiết kẻ sọc vượt thời gian kết hợp với phom dáng rộng rãi, thoải mái mang lại vẻ hiện đại, thanh lịch.'
            },
            {
              title: 'Phong cách đa dạng',
              description: 'Dễ dàng kết hợp với nhiều trang phục khác, phù hợp cho cả trang phục công sở lẫn dạo phố, hẹn hò.'
            }
          ]
        }
      ];
      resolve(collections);
    }, 300);
  });
};

const getCollectionById = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const collections = [
        {
          id: 'winter',
          name: 'BỘ SƯU TẬP THU ĐÔNG 2025',
          description: 'Khám phá những thiết kế mới nhất phù hợp cho mùa Thu Đông với chất liệu giữ ấm tối ưu và thiết kế thời thượng.',
          image: '/assets/images/thudong.jpg',
          longDescription: 'Bộ sưu tập Thu Đông 2025 mang đến những thiết kế hiện đại, ấm áp với tông màu trầm ấm. Các sản phẩm được làm từ chất liệu cao cấp, giữ nhiệt tốt, phù hợp cho thời tiết lạnh.',
          bannerImage: '/assets/images/winter_banner.jpg',
          sections: [
            {
              title: 'Chất liệu cao cấp',
              description: 'Sử dụng len merino, cashmere và cotton hữu cơ để mang lại cảm giác ấm áp, mềm mại nhưng vẫn thoáng khí.'
            },
            {
              title: 'Thiết kế thời thượng',
              description: 'Phong cách tối giản nhưng tinh tế, dễ dàng mix & match với nhiều items khác trong tủ đồ của bạn.'
            },
            {
              title: 'Đa dạng màu sắc',
              description: 'Tông màu trầm ấm như nâu, be, xám, đen - dễ dàng phối hợp tạo nên phong cách riêng.'
            }
          ]
        },
        {
          id: 'heattech',
          name: 'HEATTECH - CÔNG NGHỆ GIỮ NHIỆT',
          description: 'Mỏng nhẹ nhưng vẫn giữ ấm hiệu quả trong thời tiết lạnh với công nghệ HEATTECH độc quyền.',
          image: '/assets/images/heatech.jpg',
          longDescription: 'Công nghệ HEATTECH độc quyền sử dụng sợi vải đặc biệt có khả năng chuyển đổi hơi ẩm từ cơ thể thành nhiệt, giúp giữ ấm hiệu quả mà vẫn mỏng nhẹ, thoải mái khi mặc.',
          bannerImage: '/assets/images/heattech_banner.jpg',
          sections: [
            {
              title: 'Công nghệ độc quyền',
              description: 'HEATTECH chuyển đổi hơi ẩm từ cơ thể thành nhiệt, giúp giữ ấm hiệu quả ngay cả trong thời tiết lạnh giá.'
            },
            {
              title: 'Mỏng nhẹ, thoải mái',
              description: 'Thiết kế mỏng nhẹ, co giãn tốt, thoải mái khi vận động và dễ dàng layering mà không gây cảm giác cồng kềnh.'
            },
            {
              title: 'Đa dạng sản phẩm',
              description: 'Từ áo giữ nhiệt, quần legging đến áo thun, có nhiều mức độ giữ ấm khác nhau phù hợp với nhiều hoạt động.'
            }
          ]
        },
        {
          id: 'ut',
          name: 'UT - ÁO PHÔNG IN HỌA TIẾT',
          description: 'Bộ sưu tập áo phông với những họa tiết độc quyền từ các nghệ sĩ toàn cầu và các thương hiệu nổi tiếng.',
          image: '/assets/images/aophong.webp',
          longDescription: 'UT (Unique T-shirt) là dòng áo phông với họa tiết độc đáo được hợp tác với các nghệ sĩ và thương hiệu nổi tiếng toàn cầu. Mỗi chiếc áo là một tác phẩm nghệ thuật, thể hiện cá tính riêng của người mặc.',
          bannerImage: '/assets/images/ut_banner.jpg',
          sections: [
            {
              title: 'Hợp tác độc quyền',
              description: 'Kết hợp cùng các nghệ sĩ, thương hiệu và IP nổi tiếng toàn cầu như Marvel, Disney, Star Wars...'
            },
            {
              title: 'Chất liệu cotton cao cấp',
              description: 'Sử dụng 100% cotton hữu cơ, mềm mại, thấm hút mồ hôi tốt, thoải mái khi mặc cả ngày dài.'
            },
            {
              title: 'Thiết kế đa dạng',
              description: 'Từ phong cách đơn giản, minimalist đến những họa tiết phức tạp, đầy màu sắc - phù hợp với mọi cá tính.'
            }
          ]
        },
        {
          id: 'summer',
          name: 'BỘ SƯU TẬP HÈ 2025',
          description: 'Tươi mát và phong cách với những thiết kế dành cho mùa hè sôi động.',
          image: '/assets/images/bst hè.jpg',
          longDescription: 'Bộ sưu tập Hè 2025 mang đến những thiết kế tươi mát với tông màu trung tính và kẻ sọc tinh tế. Các sản phẩm phù hợp cho mùa hè, dễ dàng mix-match với nhiều phong cách khác nhau từ đi làm đến dạo phố.',
          bannerImage: '/assets/images/bst hè.jpg',
          sections: [
            {
              title: 'Chất liệu cao cấp',
              description: 'Cotton và vải lanh cao cấp, thấm hút mồ hôi tốt, giúp bạn luôn cảm thấy thoải mái và thanh lịch trong mùa hè.'
            },
            {
              title: 'Thiết kế hiện đại',
              description: 'Họa tiết kẻ sọc vượt thời gian kết hợp với phom dáng rộng rãi, thoải mái mang lại vẻ hiện đại, thanh lịch.'
            },
            {
              title: 'Phong cách đa dạng',
              description: 'Dễ dàng kết hợp với nhiều trang phục khác, phù hợp cho cả trang phục công sở lẫn dạo phố, hẹn hò.'
            }
          ]
        }
      ];
      
      const collection = collections.find(c => c.id === id);
      if (collection) {
        resolve(collection);
      } else {
        reject(new Error('Không tìm thấy bộ sưu tập'));
      }
    }, 300);
  });
};

const getProductsByCollection = (collectionId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const products = JSON.parse(localStorage.getItem('products')) || [];
      const collectionProducts = products.filter(product => 
        product.collection === collectionId
      );
      resolve(collectionProducts);
    }, 300);
  });
};

export {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  getRelatedProducts,
  getCollections,
  getCollectionById,
  getProductsByCollection
};
