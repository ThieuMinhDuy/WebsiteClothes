import { useState, useEffect } from 'react';
import { Row, Col, Card, Input, Select, Slider, Button, Typography, List, Spin, Empty, Tag, message } from 'antd';
import { SearchOutlined, FilterOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getProducts, getCategories } from '../../services/api/productApi';
import { useCart } from '../../contexts/CartContext';

const { Title, Text } = Typography;
const { Meta } = Card;
const { Option } = Select;

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categoryId: '',
    keyword: '',
    minPrice: 0,
    maxPrice: 2000000,
    sortBy: 'newest'
  });

  const { addToCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Xử lý query params từ URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryId = params.get('category');
    const keyword = params.get('keyword');

    if (categoryId) {
      setFilters(prev => ({ ...prev, categoryId }));
    }
    if (keyword) {
      setFilters(prev => ({ ...prev, keyword }));
    }
  }, [location.search]);

  // Tải dữ liệu sản phẩm và danh mục
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(filters),
          getCategories()
        ]);
        
        // Sắp xếp sản phẩm
        let sortedProducts = [...productsData];
        if (filters.sortBy === 'newest') {
          sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (filters.sortBy === 'priceAsc') {
          sortedProducts.sort((a, b) => a.price - b.price);
        } else if (filters.sortBy === 'priceDesc') {
          sortedProducts.sort((a, b) => b.price - a.price);
        }
        
        setProducts(sortedProducts);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filters]);

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Xử lý tìm kiếm
  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (filters.categoryId) searchParams.set('category', filters.categoryId);
    if (filters.keyword) searchParams.set('keyword', filters.keyword);
    
    navigate(`/products?${searchParams.toString()}`);
  };

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Nếu sản phẩm có nhiều size/màu, có thể điều hướng đến trang chi tiết
    // Hoặc chọn mặc định
    addToCart(product, 1, product.sizes[0], product.colors[0]);
    
    // Thông báo thành công
    message.success(`Đã thêm ${product.name} vào giỏ hàng`);
  };

  return (
    <div>
      <Title level={2}>Danh sách sản phẩm</Title>
      
      {/* Phần lọc và tìm kiếm */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={24} md={6} lg={6} xl={6}>
          <Input 
            placeholder="Tìm kiếm sản phẩm" 
            value={filters.keyword}
            onChange={(e) => handleFilterChange('keyword', e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
          />
        </Col>
        
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Select
            placeholder="Danh mục sản phẩm"
            style={{ width: '100%' }}
            value={filters.categoryId || undefined}
            onChange={(value) => handleFilterChange('categoryId', value)}
          >
            <Option value="">Tất cả danh mục</Option>
            {categories.map(category => (
              <Option key={category.id} value={category.id}>{category.name}</Option>
            ))}
          </Select>
        </Col>
        
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Select
            placeholder="Sắp xếp theo"
            style={{ width: '100%' }}
            value={filters.sortBy}
            onChange={(value) => handleFilterChange('sortBy', value)}
          >
            <Option value="newest">Mới nhất</Option>
            <Option value="priceAsc">Giá tăng dần</Option>
            <Option value="priceDesc">Giá giảm dần</Option>
          </Select>
        </Col>
        
        <Col xs={24} sm={24} md={6} lg={6} xl={6}>
          <Button type="primary" icon={<FilterOutlined />} onClick={handleSearch} block>
            Lọc sản phẩm
          </Button>
        </Col>
      </Row>
      
      {/* Thanh trượt giá */}
      <Row style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Text strong>Giá: {filters.minPrice.toLocaleString('vi-VN')}đ - {filters.maxPrice.toLocaleString('vi-VN')}đ</Text>
          <Slider
            range
            min={0}
            max={2000000}
            step={50000}
            value={[filters.minPrice, filters.maxPrice]}
            onChange={(values) => {
              handleFilterChange('minPrice', values[0]);
              handleFilterChange('maxPrice', values[1]);
            }}
            tipFormatter={value => `${value.toLocaleString('vi-VN')}đ`}
          />
        </Col>
      </Row>
      
      {/* Danh sách sản phẩm */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : products.length === 0 ? (
        <Empty description="Không tìm thấy sản phẩm nào" />
      ) : (
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 4,
            xxl: 4,
          }}
          dataSource={products}
          renderItem={item => (
            <List.Item>
              <Link to={`/products/${item.id}`}>
                <Card
                  hoverable
                  cover={
                    <img 
                      alt={item.name} 
                      src={item.images[0] || "https://via.placeholder.com/300x300?text=No+Image"} 
                      style={{ height: 300, objectFit: 'cover' }}
                    />
                  }
                  actions={[
                    <Button 
                      type="primary" 
                      icon={<ShoppingCartOutlined />}
                      onClick={(e) => handleAddToCart(e, item)}
                    >
                      Thêm vào giỏ
                    </Button>
                  ]}
                >
                  <Meta 
                    title={item.name} 
                    description={
                      <div>
                        <Text type="secondary">{item.description.slice(0, 50)}...</Text>
                        <div style={{ marginTop: 8 }}>
                          {item.colors.map(color => (
                            <Tag color="blue" key={color}>{color}</Tag>
                          ))}
                        </div>
                        <Title level={5} style={{ color: 'red', marginTop: 8 }}>
                          {item.price.toLocaleString('vi-VN')}đ
                        </Title>
                      </div>
                    } 
                  />
                </Card>
              </Link>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default ProductListPage;
