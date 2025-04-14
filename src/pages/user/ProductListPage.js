import { useState, useEffect } from 'react';
import { Row, Col, Card, Input, Select, Slider, Button, Typography, List, Spin, Empty, Tag, message, Pagination, Checkbox, Divider, Tooltip, Radio, Space, Badge } from 'antd';
import { SearchOutlined, FilterOutlined, ShoppingCartOutlined, HeartOutlined, StarOutlined, UpOutlined, DownOutlined, ReloadOutlined, AppstoreOutlined, UnorderedListOutlined, EyeOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getProducts, getCategories } from '../../services/api/productApi';
import { useCart } from '../../contexts/CartContext';

const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;
const { Option } = Select;
const { Group: CheckboxGroup } = Checkbox;

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categoryId: '',
    keyword: '',
    minPrice: 0,
    maxPrice: 2000000,
    sortBy: 'newest',
    sizes: [],
    colors: [],
    materials: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(12);
  const [totalProducts, setTotalProducts] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [imageIndices, setImageIndices] = useState({});

  const { addToCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Giả định dữ liệu cho bộ lọc
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const availableColors = ['Trắng', 'Đen', 'Xanh', 'Đỏ', 'Vàng', 'Xám', 'Hồng'];
  const availableMaterials = ['Cotton', 'Linen', 'Polyester', 'Wool', 'Denim', 'Knit', 'Silk'];

  // Xử lý query params từ URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryId = params.get('category');
    const keyword = params.get('keyword');
    const page = params.get('page');
    const sort = params.get('sort');
    
    let newFilters = {...filters};
    
    if (categoryId) {
      newFilters.categoryId = categoryId;
    }
    if (keyword) {
      newFilters.keyword = keyword;
    }
    if (sort) {
      newFilters.sortBy = sort;
    }
    
    setFilters(newFilters);
    
    if (page) {
      setCurrentPage(parseInt(page));
    } else {
      setCurrentPage(1);
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
        } else if (filters.sortBy === 'popular') {
          sortedProducts.sort((a, b) => (b.sales || 0) - (a.sales || 0));
        }
        
        setTotalProducts(sortedProducts.length);
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

  // Hiệu ứng slide ảnh khi hover
  useEffect(() => {
    let slideInterval;
    
    if (hoveredProduct) {
      const product = products.find(p => p.id === hoveredProduct);
      
      if (product && product.images && product.images.length > 1) {
        // Bắt đầu interval để thay đổi ảnh
        slideInterval = setInterval(() => {
          setImageIndices(prev => {
            const currentIndex = prev[hoveredProduct] || 0;
            const nextIndex = (currentIndex + 1) % product.images.length;
            return {...prev, [hoveredProduct]: nextIndex};
          });
        }, 1000); // Thay đổi ảnh mỗi 1 giây
      }
    }
    
    return () => {
      if (slideInterval) {
        clearInterval(slideInterval);
      }
    };
  }, [hoveredProduct, products]);

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc
  };

  // Xử lý tìm kiếm
  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (filters.categoryId) searchParams.set('category', filters.categoryId);
    if (filters.keyword) searchParams.set('keyword', filters.keyword);
    if (filters.sortBy) searchParams.set('sort', filters.sortBy);
    searchParams.set('page', '1');
    
    navigate(`/products?${searchParams.toString()}`);
  };

  // Xử lý thay đổi trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('page', page.toString());
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

  // Xử lý thêm vào danh sách yêu thích
  const handleAddToWishlist = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    message.success(`Đã thêm ${product.name} vào danh sách yêu thích`);
  };

  // Lấy các sản phẩm cho trang hiện tại
  const getCurrentProducts = () => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return products.slice(indexOfFirstProduct, indexOfLastProduct);
  };

  // Thiết lập bố cục Grid dựa trên chế độ xem
  const getGridConfig = () => {
    if (viewMode === 'list') {
      return {
        gutter: 16,
        xs: 1,
        sm: 1,
        md: 1,
        lg: 1,
        xl: 1,
        xxl: 1,
      };
    }
    
    return {
      gutter: 24,
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 4,
      xxl: 4,
    };
  };

  // Reset bộ lọc
  const resetFilters = () => {
    setFilters({
      categoryId: '',
      keyword: '',
      minPrice: 0,
      maxPrice: 2000000,
      sortBy: 'newest',
      sizes: [],
      colors: [],
      materials: []
    });
    setCurrentPage(1);
    navigate('/products');
  };

  // Xử lý khi mouse enter vào card sản phẩm
  const handleMouseEnter = (productId) => {
    setHoveredProduct(productId);
    // Đặt lại index ảnh về 0 khi bắt đầu hover
    setImageIndices(prev => ({...prev, [productId]: 0}));
  };

  // Xử lý khi mouse leave khỏi card sản phẩm
  const handleMouseLeave = () => {
    setHoveredProduct(null);
  };

  // Lấy URL ảnh hiện tại cho sản phẩm
  const getCurrentImage = (product) => {
    if (!product.images || product.images.length === 0) {
      return "https://via.placeholder.com/300x300?text=No+Image";
    }
    
    if (hoveredProduct === product.id && product.images.length > 1) {
      const currentIndex = imageIndices[product.id] || 0;
      return product.images[currentIndex];
    }
    
    return product.images[0];
  };

  return (
    <Row gutter={[24, 0]}>
      {/* Sidebar filters - Desktop */}
      <Col xs={0} sm={0} md={6} lg={5} xl={5} className="filter-sidebar" style={{ display: filtersVisible ? 'block' : 'none' }}>
        <div className="filter-section" style={{ position: 'sticky', top: '84px' }}>
          <div className="filter-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0 }}>Bộ lọc</Title>
            <Button 
              type="text" 
              icon={<ReloadOutlined />}
              onClick={resetFilters}
              title="Đặt lại bộ lọc"
            />
          </div>
          
          <Divider style={{ margin: '12px 0' }} />
          
          {/* Danh mục */}
          <div className="filter-group">
            <Title level={5}>Danh mục</Title>
            <Select
              placeholder="Chọn danh mục"
              style={{ width: '100%', marginBottom: 16 }}
              value={filters.categoryId || undefined}
              onChange={(value) => handleFilterChange('categoryId', value)}
            >
              <Option value="">Tất cả danh mục</Option>
              {categories.map(category => (
                <Option key={category.id} value={category.id}>{category.name}</Option>
              ))}
            </Select>
          </div>
          
          <Divider style={{ margin: '12px 0' }} />
          
          {/* Khoảng giá */}
          <div className="filter-group">
            <Title level={5}>Khoảng giá</Title>
            <Text>
              {filters.minPrice.toLocaleString('vi-VN')}đ - {filters.maxPrice.toLocaleString('vi-VN')}đ
            </Text>
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
          </div>
          
          <Divider style={{ margin: '12px 0' }} />
          
          {/* Kích thước */}
          <div className="filter-group">
            <Title level={5}>Kích thước</Title>
            <div className="size-options">
              <CheckboxGroup
                options={availableSizes}
                value={filters.sizes}
                onChange={(values) => handleFilterChange('sizes', values)}
              />
            </div>
          </div>
          
          <Divider style={{ margin: '12px 0' }} />
          
          {/* Màu sắc */}
          <div className="filter-group">
            <Title level={5}>Màu sắc</Title>
            <div className="color-filters" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {availableColors.map(color => (
                <Tooltip title={color} key={color}>
                  <div 
                    className={`color-circle ${filters.colors.includes(color) ? 'selected' : ''}`}
                    style={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      backgroundColor: color.toLowerCase(),
                      border: filters.colors.includes(color) ? '2px solid #ff0000' : '1px solid #ccc',
                      cursor: 'pointer',
                      boxSizing: 'border-box'
                    }}
                    onClick={() => {
                      const newColors = filters.colors.includes(color) 
                        ? filters.colors.filter(c => c !== color) 
                        : [...filters.colors, color];
                      handleFilterChange('colors', newColors);
                    }}
                  />
                </Tooltip>
              ))}
            </div>
          </div>
          
          <Divider style={{ margin: '12px 0' }} />
          
          {/* Chất liệu */}
          <div className="filter-group">
            <Title level={5}>Chất liệu</Title>
            <CheckboxGroup
              options={availableMaterials}
              value={filters.materials}
              onChange={(values) => handleFilterChange('materials', values)}
            />
          </div>
          
          <Divider style={{ margin: '12px 0' }} />
          
          <Button type="primary" icon={<FilterOutlined />} onClick={handleSearch} block>
            Áp dụng bộ lọc
          </Button>
        </div>
      </Col>
      
      {/* Main content */}
      <Col xs={24} sm={24} md={filtersVisible ? 18 : 24} lg={filtersVisible ? 19 : 24} xl={filtersVisible ? 19 : 24}>
        <div className="product-list-container">
          {/* Header with total count, sort and view options */}
          <div className="product-list-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="left-section" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Toggle filter visibility on smaller screens */}
              <Button 
                type="text" 
                icon={filtersVisible ? <UpOutlined /> : <DownOutlined />}
                onClick={() => setFiltersVisible(!filtersVisible)}
                className="toggle-filters"
                style={{ display: 'inline-block', marginRight: 8 }}
              >
                {filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
              </Button>
              
              <Text>Hiển thị <strong>{products.length}</strong> sản phẩm</Text>
            </div>
            
            <div className="right-section" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* View mode switch */}
              <Radio.Group 
                value={viewMode} 
                onChange={(e) => setViewMode(e.target.value)}
                buttonStyle="solid"
                style={{ marginRight: 16 }}
              >
                <Radio.Button value="grid"><AppstoreOutlined /></Radio.Button>
                <Radio.Button value="list"><UnorderedListOutlined /></Radio.Button>
              </Radio.Group>
              
              {/* Sort dropdown */}
              <Select
                placeholder="Sắp xếp theo"
                style={{ width: 150 }}
                value={filters.sortBy}
                onChange={(value) => handleFilterChange('sortBy', value)}
              >
                <Option value="newest">Mới nhất</Option>
                <Option value="popular">Phổ biến nhất</Option>
                <Option value="priceAsc">Giá tăng dần</Option>
                <Option value="priceDesc">Giá giảm dần</Option>
              </Select>
            </div>
          </div>
          
          {/* Mobile filter dropdown */}
          <div className="mobile-filters" style={{ display: 'block', marginBottom: 16 }}>
            <Row gutter={[8, 8]}>
              <Col xs={24} sm={24} md={0}>
                <Input.Search
                  placeholder="Tìm kiếm sản phẩm"
                  value={filters.keyword}
                  onChange={(e) => handleFilterChange('keyword', e.target.value)}
                  onSearch={handleSearch}
                  style={{ marginBottom: 8 }}
                />
                <div style={{ display: 'flex', gap: 8, overflow: 'auto', paddingBottom: 8 }}>
                  <Select
                    placeholder="Danh mục"
                    style={{ width: 120, flex: 'none' }}
                    value={filters.categoryId || undefined}
                    onChange={(value) => handleFilterChange('categoryId', value)}
                  >
                    <Option value="">Tất cả</Option>
                    {categories.map(category => (
                      <Option key={category.id} value={category.id}>{category.name}</Option>
                    ))}
                  </Select>
                  
                  <Select
                    placeholder="Giá"
                    style={{ width: 100, flex: 'none' }}
                    onChange={(value) => {
                      if (value === 'low') {
                        handleFilterChange('minPrice', 0);
                        handleFilterChange('maxPrice', 500000);
                      } else if (value === 'mid') {
                        handleFilterChange('minPrice', 500000);
                        handleFilterChange('maxPrice', 1000000);
                      } else if (value === 'high') {
                        handleFilterChange('minPrice', 1000000);
                        handleFilterChange('maxPrice', 2000000);
                      }
                    }}
                  >
                    <Option value="low">Dưới 500k</Option>
                    <Option value="mid">500k-1tr</Option>
                    <Option value="high">Trên 1tr</Option>
                  </Select>
                  
                  <Select
                    placeholder="Kích thước"
                    style={{ width: 100, flex: 'none' }}
                    mode="multiple"
                    maxTagCount={1}
                    value={filters.sizes}
                    onChange={(values) => handleFilterChange('sizes', values)}
                  >
                    {availableSizes.map(size => (
                      <Option key={size} value={size}>{size}</Option>
                    ))}
                  </Select>
                  
                  <Button type="primary" icon={<FilterOutlined />} onClick={handleSearch}>
                    Lọc
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
          
          {/* Product List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
            </div>
          ) : products.length === 0 ? (
            <Empty 
              description="Không tìm thấy sản phẩm nào" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <>
              <List
                grid={getGridConfig()}
                dataSource={getCurrentProducts()}
                renderItem={item => (
                  <List.Item>
                    <Link to={`/products/${item.id}`}>
                      <div 
                        className="product-card"
                        onMouseEnter={() => handleMouseEnter(item.id)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <Card
                          hoverable
                          bodyStyle={{ padding: viewMode === 'list' ? '12px 24px' : '12px' }}
                          className="product-item"
                          style={{ position: 'relative' }}
                          cover={
                            <div style={{ position: 'relative', overflow: 'hidden' }}>
                              <img 
                                alt={item.name} 
                                src={getCurrentImage(item)} 
                                style={{ 
                                  height: viewMode === 'list' ? 200 : 320, 
                                  width: '100%',
                                  objectFit: 'cover',
                                  transition: 'all 0.3s ease'
                                }}
                                className="product-image"
                              />
                              
                              {/* Chỉ số slide ảnh */}
                              {hoveredProduct === item.id && item.images && item.images.length > 1 && (
                                <div style={{ 
                                  position: 'absolute', 
                                  bottom: '10px', 
                                  left: '50%', 
                                  transform: 'translateX(-50%)',
                                  display: 'flex',
                                  gap: '5px',
                                  zIndex: 2
                                }}>
                                  {item.images.map((_, index) => (
                                    <div 
                                      key={index}
                                      style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: (imageIndices[item.id] || 0) === index ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                                        boxShadow: '0 0 2px rgba(0, 0, 0, 0.5)'
                                      }}
                                    />
                                  ))}
                                </div>
                              )}
                              
                              {/* Overlay buttons on hover */}
                              <div 
                                className="product-hover-overlay" 
                                style={{ 
                                  position: 'absolute', 
                                  bottom: hoveredProduct === item.id ? '10px' : '-50px',
                                  left: '0',
                                  right: '0',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  gap: '10px',
                                  transition: 'all 0.3s ease',
                                  opacity: hoveredProduct === item.id ? 1 : 0
                                }}
                              >
                                <Tooltip title="Thêm vào giỏ hàng">
                                  <Button 
                                    type="primary" 
                                    shape="circle"
                                    icon={<ShoppingCartOutlined />}
                                    onClick={(e) => handleAddToCart(e, item)}
                                    style={{ backgroundColor: 'white', color: '#ff0000' }}
                                  />
                                </Tooltip>
                                <Tooltip title="Yêu thích">
                                  <Button 
                                    type="primary" 
                                    shape="circle"
                                    icon={<HeartOutlined />}
                                    onClick={(e) => handleAddToWishlist(e, item)}
                                    style={{ backgroundColor: 'white', color: '#ff0000' }}
                                  />
                                </Tooltip>
                                <Tooltip title="Xem nhanh">
                                  <Button 
                                    type="primary" 
                                    shape="circle"
                                    icon={<EyeOutlined />}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      navigate(`/products/${item.id}`);
                                    }}
                                    style={{ backgroundColor: 'white', color: '#ff0000' }}
                                  />
                                </Tooltip>
                              </div>
                              
                              {/* Badges */}
                              <div style={{ position: 'absolute', top: 10, left: 10 }}>
                                {item.isNew && (
                                  <Badge.Ribbon text="Mới" color="#ff0000" style={{ marginBottom: 5 }} />
                                )}
                                {item.discount > 0 && (
                                  <Badge.Ribbon text={`-${item.discount}%`} color="#ff8c00" />
                                )}
                              </div>
                            </div>
                          }
                        >
                          <div style={{ display: 'flex', flexDirection: viewMode === 'list' ? 'row' : 'column' }}>
                            <div style={{ flex: viewMode === 'list' ? '1 1 70%' : '1 1 auto' }}>
                              {/* Available colors */}
                              <div className="product-colors" style={{ 
                                display: 'flex', 
                                gap: '6px', 
                                marginBottom: '8px' 
                              }}>
                                {(item.colors || []).slice(0, 4).map(color => (
                                  <Tooltip title={color} key={color}>
                                    <div
                                      style={{
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '50%',
                                        backgroundColor: color.toLowerCase(),
                                        border: '1px solid #ddd'
                                      }}
                                    />
                                  </Tooltip>
                                ))}
                                {(item.colors || []).length > 4 && (
                                  <Tooltip title="Còn thêm màu">
                                    <div
                                      style={{
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '50%',
                                        backgroundColor: '#f5f5f5',
                                        border: '1px solid #ddd',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '10px'
                                      }}
                                    >
                                      +{item.colors.length - 4}
                                    </div>
                                  </Tooltip>
                                )}
                              </div>
                              
                              <Title level={5} ellipsis={{ rows: 1 }} style={{ marginTop: 0, marginBottom: 4 }}>
                                {item.name}
                              </Title>
                              
                              {viewMode === 'list' && (
                                <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>
                                  {item.description}
                                </Paragraph>
                              )}
                              
                              {/* Size options */}
                              <div className="product-sizes" style={{ marginBottom: 8 }}>
                                {(item.sizes || []).map(size => (
                                  <Tag key={size}>{size}</Tag>
                                ))}
                              </div>
                            </div>
                            
                            <div style={{ 
                              flex: viewMode === 'list' ? '1 1 30%' : '1 1 auto',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'flex-end',
                              alignItems: viewMode === 'list' ? 'flex-end' : 'flex-start'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: 4 }}>
                                <StarOutlined style={{ color: '#faad14' }} />
                                <Text>{(item.rating || 4.5).toFixed(1)}</Text>
                                <Text type="secondary">({item.reviews || 0})</Text>
                              </div>
                              
                              <div>
                                {item.discount > 0 && item.oldPrice !== item.price && (
                                  <Text delete type="secondary" style={{ marginRight: 8 }}>
                                    {item.oldPrice.toLocaleString('vi-VN')}đ
                                  </Text>
                                )}
                                <Title level={5} style={{ color: '#ff0000', margin: 0, display: 'inline-block' }}>
                                  {item.price.toLocaleString('vi-VN')}đ
                                </Title>
                              </div>
                              
                              {viewMode === 'list' && (
                                <Button 
                                  type="primary"
                                  icon={<ShoppingCartOutlined />}
                                  onClick={(e) => handleAddToCart(e, item)}
                                  style={{ marginTop: 12 }}
                                >
                                  Thêm vào giỏ
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      </div>
                    </Link>
                  </List.Item>
                )}
              />
              
              {/* Pagination */}
              <div style={{ textAlign: 'center', marginTop: 40, marginBottom: 20 }}>
                <Pagination
                  current={currentPage}
                  total={totalProducts}
                  pageSize={productsPerPage}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showQuickJumper
                />
              </div>
            </>
          )}
        </div>
      </Col>
    </Row>
  );
};

export default ProductListPage;
