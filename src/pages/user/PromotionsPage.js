import { useState, useEffect } from 'react';
import { 
  Row, Col, Card, Typography, Divider, Spin, Empty, List, Breadcrumb, Badge, 
  Tooltip, Button, message, Tag
} from 'antd';
import { Link } from 'react-router-dom';
import { 
  ShoppingCartOutlined, HeartOutlined, EyeOutlined, 
  StarOutlined, FireOutlined
} from '@ant-design/icons';
import { getPromotionProducts } from '../../services/api/productApi';
import { useCart } from '../../contexts/CartContext';

const { Title, Text, Paragraph } = Typography;

const PromotionsPage = () => {
  const [promotionProducts, setPromotionProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [imageIndices, setImageIndices] = useState({});
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchPromotionProducts = async () => {
      try {
        setLoading(true);
        // Sử dụng API mới để lấy sản phẩm khuyến mãi
        const discountedProducts = await getPromotionProducts(20);
        setPromotionProducts(discountedProducts);
      } catch (error) {
        console.error('Error fetching promotion products:', error);
        message.error('Không thể tải danh sách sản phẩm khuyến mãi');
      } finally {
        setLoading(false);
      }
    };

    fetchPromotionProducts();
  }, []);

  // Hiệu ứng slide ảnh khi hover
  useEffect(() => {
    let slideInterval;
    
    if (hoveredProduct) {
      const product = promotionProducts.find(p => p.id === hoveredProduct);
      
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
  }, [hoveredProduct, promotionProducts]);

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Chọn mặc định size và màu đầu tiên
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
    <div className="promotion-page-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      {/* Banner Khuyến mãi */}
      <div 
        className="promotion-banner" 
        style={{ 
          background: 'linear-gradient(to right, #ff4d4d, #ff9966)', 
          borderRadius: '8px', 
          padding: '30px 40px',
          marginBottom: '40px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Title level={1} style={{ color: 'white', margin: 0, marginBottom: '16px', fontWeight: 'bold' }}>
          KHUYẾN MÃI HOT
        </Title>
        <Paragraph style={{ fontSize: '18px', margin: 0, maxWidth: '60%' }}>
          Săn ngay những sản phẩm giảm giá sốc - Giảm tối thiểu 20% - Bạn đã sẵn sàng để tiết kiệm?
        </Paragraph>
        <FireOutlined 
          style={{ 
            position: 'absolute', 
            right: '40px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            fontSize: '120px', 
            opacity: '0.5' 
          }} 
        />
      </div>

      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: '20px' }}>
        <Breadcrumb.Item>
          <Link to="/">Trang chủ</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Khuyến mãi</Breadcrumb.Item>
      </Breadcrumb>

      {/* Tiêu đề */}
      <Title level={2} style={{ marginBottom: '30px', textAlign: 'center' }}>
        SẢN PHẨM GIẢM GIÁ SỐC
        <Badge 
          count={`${promotionProducts.length} sản phẩm`} 
          style={{ backgroundColor: '#ff4d4d', marginLeft: '15px' }} 
        />
      </Title>

      <Divider style={{ marginBottom: '40px' }} />

      {/* Danh sách sản phẩm */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : promotionProducts.length === 0 ? (
        <Empty description="Không có sản phẩm khuyến mãi nào" />
      ) : (
        <List
          grid={{
            gutter: 24,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 4,
            xxl: 4,
          }}
          dataSource={promotionProducts}
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
                    bodyStyle={{ padding: '12px' }}
                    className="product-item"
                    style={{ position: 'relative' }}
                    cover={
                      <div style={{ position: 'relative', overflow: 'hidden' }}>
                        <img 
                          alt={item.name} 
                          src={getCurrentImage(item)}
                          style={{ 
                            height: 320, 
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
                            gap: '5px'
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
                              }}
                              style={{ backgroundColor: 'white', color: '#ff0000' }}
                            />
                          </Tooltip>
                        </div>
                        
                        {/* Badges */}
                        <div style={{ position: 'absolute', top: 10, left: 10 }}>
                          <Badge.Ribbon 
                            text={`-${item.discount}%`} 
                            color="#ff4d4d" 
                            style={{ fontWeight: 'bold' }} 
                          />
                        </div>
                      </div>
                    }
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ flex: '1 1 auto' }}>
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
                        
                        {/* Size options */}
                        <div className="product-sizes" style={{ marginBottom: 8 }}>
                          {(item.sizes || []).map(size => (
                            <Tag key={size}>{size}</Tag>
                          ))}
                        </div>
                      </div>
                      
                      <div style={{ 
                        flex: '1 1 auto',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        alignItems: 'flex-start'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: 4 }}>
                          <StarOutlined style={{ color: '#faad14' }} />
                          <Text>{Number(item.rating || 4.5).toFixed(1)}</Text>
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
                        
                        <Button 
                          type="primary" 
                          danger
                          icon={<ShoppingCartOutlined />}
                          style={{ marginTop: '12px', width: '100%' }}
                          onClick={(e) => handleAddToCart(e, item)}
                        >
                          Thêm vào giỏ
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </Link>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default PromotionsPage; 