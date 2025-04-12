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
      
      const newProduct = {
        ...productData,
        id: Date.now().toString(),
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

export {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct
};
