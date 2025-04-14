import { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Carousel, Button, List, Spin, Divider, Space, Tag, Avatar, Rate } from 'antd';
import { 
  RightOutlined, 
  ShoppingCartOutlined, 
  FireOutlined, 
  GiftOutlined, 
  ThunderboltOutlined, 
  StarOutlined, 
  ArrowRightOutlined,
  DownOutlined 
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getProducts, getCategories } from '../../services/api/productApi';

// Sử dụng ảnh banner từ public folder

const { Title, Paragraph } = Typography;
const { Meta } = Card;

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [imageIndices, setImageIndices] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy tất cả sản phẩm
        const products = await getProducts();
        
        // Lấy 8 sản phẩm đầu tiên cho phần nổi bật
        setFeaturedProducts(products.slice(0, 8));
        
        // Lấy 4 sản phẩm tiếp theo cho phần mới về
        setNewArrivals(products.slice(8, 12));
        
        // Lấy danh sách danh mục
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Hiệu ứng slide ảnh khi hover
  useEffect(() => {
    let slideInterval;
    
    if (hoveredProduct) {
      const product = [...featuredProducts, ...newArrivals].find(p => p.id === hoveredProduct);
      
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
  }, [hoveredProduct, featuredProducts, newArrivals]);

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

  // Hero Section banners
  const heroBanners = [
    {
      id: 1,
      image: '/assets/images/bst hè.jpg',
      title: "BỘ SƯU TẬP HÈ 2025",
      description: "Tươi mát và phong cách với những thiết kế kẻ sọc thanh lịch cho mùa hè sôi động.",
      buttonText: "Mua ngay",
      buttonLink: "/collections/summer"
    },
    {
      id: 2,
      image: '/assets/images/thudong.jpg',
      title: "BỘ SƯU TẬP THU ĐÔNG 2025",
      description: "Khám phá những thiết kế mới nhất phù hợp cho mùa Thu Đông với chất liệu giữ ấm tối ưu và thiết kế thời thượng.",
      buttonText: "Mua ngay",
      buttonLink: "/collections/winter"
    },
    {
      id: 3,
      image: '/assets/images/heatech.jpg',
      title: "HEATTECH - CÔNG NGHỆ GIỮ NHIỆT",
      description: "Mỏng nhẹ nhưng vẫn giữ ấm hiệu quả trong thời tiết lạnh với công nghệ HEATTECH độc quyền.",
      buttonText: "Khám phá thêm",
      buttonLink: "/collections/heattech"
    },
    {
      id: 4,
      image: '/assets/images/aophong.webp',
      title: "UT - ÁO PHÔNG IN HỌA TIẾT",
      description: "Bộ sưu tập áo phông với những họa tiết độc quyền từ các nghệ sĩ toàn cầu và các thương hiệu nổi tiếng.",
      buttonText: "Xem bộ sưu tập",
      buttonLink: "/collections/ut"
    }
  ];

  // Carousel settings
  const carouselSettings = {
    autoplay: true,
    autoplaySpeed: 5000,
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    pauseOnHover: false,
    arrows: true
  };

  return (
    <div style={{ margin: '-32px -50px 0' }}>
      {/* Fullscreen Hero Section */}
      <div className="hero-section">
        <Carousel {...carouselSettings} className="hero-carousel">
          {heroBanners.map(banner => (
            <div key={banner.id} className="hero-carousel-item">
              <div className="hero-banner" style={{ 
                position: 'relative',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden'
              }}>
                <img 
                  src={banner.image}
                  alt={banner.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                />
                <div className="hero-content" style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  top: 0,
                  left: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  padding: '0 8%',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  zIndex: 2
                }}>
                  <div className="hero-content-inner" style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: '3rem',
                    maxWidth: '550px',
                    borderRadius: '0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    animation: 'fadeInUp 0.7s ease-out'
                  }}>
                    <Title style={{ fontSize: '2.8rem', marginBottom: '1.5rem', fontWeight: 'bold', color: '#000', lineHeight: '1.2' }}>
                      {banner.title}
                    </Title>
                    <Paragraph style={{ fontSize: '1.2rem', marginBottom: '2.5rem', color: '#333', lineHeight: '1.6' }}>
                      {banner.description}
                    </Paragraph>
                    <Link to={banner.buttonLink}>
                      <Button 
                        type="primary" 
                        size="large" 
                        style={{ 
                          backgroundColor: '#000', 
                          borderColor: '#000',
                          borderRadius: '0',
                          fontWeight: 'bold',
                          padding: '0 3rem',
                          height: '55px',
                          fontSize: '1.1rem',
                          display: 'flex',
                          alignItems: 'center',
                          boxShadow: 'none',
                          transition: 'all 0.3s ease'
                        }}
                        className="shop-now-btn"
                      >
                        {banner.buttonText}
                        <ArrowRightOutlined style={{ marginLeft: '10px' }} />
                      </Button>
                    </Link>
                  </div>
                </div>
                
                {/* Scroll Down Button */}
                <Button 
                  type="primary" 
                  size="large"
                  icon={<DownOutlined />}
                  style={{ 
                    position: 'absolute',
                    bottom: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'transparent', 
                    borderColor: 'white',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 3
                  }}
                  onClick={() => {
                    window.scrollTo({
                      top: window.innerHeight,
                      behavior: 'smooth'
                    });
                  }}
                />
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      {/* Content Section - Slides up from behind the hero */}
      <div style={{ 
        backgroundColor: 'white',
        position: 'relative',
        zIndex: 2,
      }}>
        {/* Benefits Section */}
        <Row gutter={[0, 0]} style={{ textAlign: 'center', padding: '80px 0 60px', background: '#ffffff', margin: '0' }}>
          <Col xs={24} sm={12} md={6}>
            <div style={{ padding: '20px', height: '100%', borderRight: '1px solid #f0f0f0' }}>
              <ThunderboltOutlined style={{ fontSize: '36px', color: '#000000', marginBottom: '20px' }} />
              <Title level={4} style={{ marginTop: '20px', fontSize: '18px', fontWeight: '500' }}>Giao Hàng Nhanh</Title>
              <Paragraph style={{ color: '#777', fontSize: '16px' }}>Nhận hàng trong 24h</Paragraph>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ padding: '20px', height: '100%', borderRight: '1px solid #f0f0f0' }}>
              <GiftOutlined style={{ fontSize: '36px', color: '#000000', marginBottom: '20px' }} />
              <Title level={4} style={{ marginTop: '20px', fontSize: '18px', fontWeight: '500' }}>Quà Tặng</Title>
              <Paragraph style={{ color: '#777', fontSize: '16px' }}>Cho đơn trên 500k</Paragraph>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ padding: '20px', height: '100%', borderRight: '1px solid #f0f0f0' }}>
              <StarOutlined style={{ fontSize: '36px', color: '#000000', marginBottom: '20px' }} />
              <Title level={4} style={{ marginTop: '20px', fontSize: '18px', fontWeight: '500' }}>Hàng Chất Lượng</Title>
              <Paragraph style={{ color: '#777', fontSize: '16px' }}>Bảo hành 30 ngày</Paragraph>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ padding: '20px', height: '100%' }}>
              <FireOutlined style={{ fontSize: '36px', color: '#000000', marginBottom: '20px' }} />
              <Title level={4} style={{ marginTop: '20px', fontSize: '18px', fontWeight: '500' }}>Ưu Đãi Hot</Title>
              <Paragraph style={{ color: '#777', fontSize: '16px' }}>Giảm giá mỗi ngày</Paragraph>
            </div>
          </Col>
        </Row>

        {/* Danh mục sản phẩm */}
        <div style={{ padding: '70px 0', maxWidth: '1400px', margin: '0 auto', padding: '70px 20px' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 60, fontSize: '36px', fontWeight: '600', textTransform: 'uppercase' }}>
            Danh Mục <span style={{ color: '#000' }}>Nổi Bật</span>
          </Title>
          
          <Row gutter={[24, 32]} justify="center">
            {loading ? (
              <Spin size="large" />
            ) : (
              categories.map(category => (
                <Col xs={12} sm={8} md={6} key={category.id}>
                  <Link to={`/products?category=${category.id}`}>
                    <Card
                      hoverable
                      style={{ 
                        borderRadius: '8px', 
                        overflow: 'hidden', 
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        height: '100%'
                      }}
                      cover={
                        <div style={{ 
                          height: 220, 
                          background: '#f5f5f5', 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          transition: 'all 0.3s ease'
                        }}>
                          <Typography.Title level={3} style={{ color: '#000', margin: 0, textAlign: 'center', padding: '0 10px' }}>
                            {category.name}
                          </Typography.Title>
                        </div>
                      }
                    >
                      <Meta 
                        title={<span style={{ fontSize: '18px', fontWeight: 'normal', padding: '10px 0 5px', textAlign: 'center', display: 'block' }}>{category.name}</span>}
                        description={
                          <Button type="link" style={{ padding: '5px 0', color: '#000', fontSize: '14px', display: 'block', margin: '0 auto', fontWeight: '300' }}>
                            Xem bộ sưu tập <RightOutlined />
                          </Button>
                        } 
                      />
                    </Card>
                  </Link>
                </Col>
              ))
            )}
          </Row>
        </div>

        {/* Promotion Section */}
        <div 
          style={{ 
            padding: '80px 0', 
            background: 'linear-gradient(to right, #ff4d4d, #ff8c00)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              backgroundImage: 'url("/assets/images/pattern.png")',
              opacity: 0.1,
              backgroundRepeat: 'repeat',
              zIndex: 1
            }}
          ></div>

          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2 }}>
            <Row gutter={[32, 32]} align="middle">
              <Col xs={24} md={12}>
                <div style={{ textAlign: 'left' }}>
                  <Title level={1} style={{ color: 'white', fontWeight: 'bold', marginBottom: '20px', fontSize: '48px' }}>
                    KHUYẾN MÃI LỚN
                  </Title>
                  <Title level={3} style={{ color: 'white', marginTop: 0, marginBottom: '30px', fontWeight: 'normal' }}>
                    Giảm giá đến 50% cho các sản phẩm chọn lọc
                  </Title>
                  <Paragraph style={{ color: 'white', fontSize: '18px', lineHeight: '1.6', marginBottom: '30px' }}>
                    Khám phá ngay bộ sưu tập sản phẩm giảm giá ít nhất 20%. Cơ hội không thể bỏ lỡ để sở hữu những món đồ chất lượng với giá cực tốt.
                  </Paragraph>
                  <Link to="/promotions">
                    <Button 
                      type="primary" 
                      size="large" 
                      style={{ 
                        background: 'white', 
                        borderColor: 'white', 
                        color: '#ff4d4d',
                        height: '50px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        width: '200px',
                        borderRadius: '4px'
                      }}
                    >
                      XEM NGAY <ArrowRightOutlined />
                    </Button>
                  </Link>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                  <FireOutlined style={{ position: 'absolute', top: '-30px', right: '60px', fontSize: '80px', color: 'white', opacity: 0.6 }} />
                  <div style={{ 
                    background: 'white', 
                    borderRadius: '50%', 
                    width: '300px', 
                    height: '300px', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    animation: 'pulse 2s infinite'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <Title level={1} style={{ color: '#ff4d4d', fontWeight: 'bold', margin: 0, fontSize: '80px' }}>
                        -50%
                      </Title>
                      <Title level={3} style={{ color: '#333', margin: 0 }}>
                        GIÁ SỐC
                      </Title>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* New Arrivals */}
        <div style={{ padding: '80px 0', background: '#f8f8f8', margin: '0' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '50px', fontSize: '36px', fontWeight: '600', textTransform: 'uppercase' }}>
              Sản Phẩm Mới
            </Title>
            
            <Row gutter={[32, 48]}>
              {loading ? (
                <Spin size="large" />
              ) : (
                newArrivals.map(item => (
                  <Col xs={24} sm={12} md={6} key={item.id}>
                    <Link to={`/products/${item.id}`}>
                      <Card
                        hoverable
                        style={{ 
                          borderRadius: '8px', 
                          overflow: 'hidden', 
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          height: '100%'
                        }}
                        bodyStyle={{ padding: '16px' }}
                        cover={
                          <div style={{ position: 'relative', overflow: 'hidden' }}>
                            <img 
                              alt={item.name} 
                              src={getCurrentImage(item)} 
                              style={{ 
                                height: 350, 
                                width: '100%', 
                                objectFit: 'cover',
                                transition: 'transform 0.5s ease'
                              }}
                              className="product-image"
                              onMouseOver={() => handleMouseEnter(item.id)}
                              onMouseOut={handleMouseLeave}
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
                            
                            <Tag color="#000" style={{ position: 'absolute', top: 10, right: 10, fontSize: '12px', fontWeight: '400' }}>
                              NEW
                            </Tag>
                          </div>
                        }
                      >
                        <Meta 
                          title={<span style={{ fontSize: '16px', fontWeight: '500', color: '#000' }}>{item.name}</span>}
                          description={
                            <>
                              <div style={{ height: '50px' }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '15px' }}>
                                  <Typography.Title level={5} style={{ color: 'red', margin: 0, fontWeight: '600', fontSize: '18px' }}>
                                    {item.price.toLocaleString('vi-VN')} đ
                                  </Typography.Title>
                                  {item.oldPrice && item.oldPrice > item.price && (
                                    <Typography.Text delete type="secondary" style={{ fontSize: '14px', marginLeft: '8px' }}>
                                      {item.oldPrice.toLocaleString('vi-VN')} đ
                                    </Typography.Text>
                                  )}
                                </div>
                                {!item.oldPrice || item.oldPrice <= item.price ? (
                                  <div style={{ height: '14px', marginTop: '4px' }}></div>
                                ) : null}
                              </div>
                              
                              <Button 
                                type="primary"
                                icon={<ShoppingCartOutlined />}
                                size="middle"
                                style={{ 
                                  marginTop: '15px', 
                                  borderRadius: '4px', 
                                  width: '100%',
                                  backgroundColor: '#000',
                                  borderColor: '#000'
                                }}
                              >
                                Thêm vào giỏ
                              </Button>
                            </>
                          } 
                        />
                      </Card>
                    </Link>
                  </Col>
                ))
              )}
            </Row>
            
            <div style={{ textAlign: 'center', marginTop: '60px' }}>
              <Link to="/products">
                <Button 
                  type="default" 
                  size="large" 
                  style={{ 
                    borderRadius: '0', 
                    borderColor: '#000', 
                    color: '#000',
                    padding: '0 50px',
                    height: '50px',
                    fontWeight: '400',
                    fontSize: '16px'
                  }}
                >
                  Xem tất cả sản phẩm <ArrowRightOutlined />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Sản phẩm nổi bật */}
        <div style={{ padding: '80px 0', maxWidth: '1400px', margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '50px', fontSize: '36px', fontWeight: '600', textTransform: 'uppercase' }}>
            Sản Phẩm Nổi Bật
          </Title>
          
          <List
            grid={{
              gutter: 32,
              xs: 1,
              sm: 2,
              md: 3,
              lg: 4,
              xl: 4,
              xxl: 4,
            }}
            loading={loading}
            dataSource={featuredProducts}
            renderItem={item => (
              <List.Item>
                <Link to={`/products/${item.id}`}>
                  <Card
                    hoverable
                    style={{ 
                      borderRadius: '8px', 
                      overflow: 'hidden', 
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      height: '100%'
                    }}
                    bodyStyle={{ padding: '16px' }}
                    cover={
                      <div style={{ position: 'relative', overflow: 'hidden' }}>
                        <img 
                          alt={item.name} 
                          src={getCurrentImage(item)} 
                          style={{ 
                            height: 350, 
                            width: '100%', 
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease'
                          }}
                          className="product-image"
                          onMouseOver={() => handleMouseEnter(item.id)}
                          onMouseOut={handleMouseLeave}
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
                        
                        {item.discount > 0 && (
                          <Tag color="#ff0000" style={{ position: 'absolute', top: 10, left: 10, fontSize: '12px', fontWeight: '400' }}>
                            -{item.discount}%
                          </Tag>
                        )}
                      </div>
                    }
                  >
                    <Meta 
                      title={<span style={{ fontSize: '16px', fontWeight: '500', color: '#000' }}>{item.name}</span>}
                      description={
                        <>
                          <div style={{ height: '50px' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '15px' }}>
                              <Typography.Title level={5} style={{ color: 'red', margin: 0, fontWeight: '600', fontSize: '18px' }}>
                                {item.price.toLocaleString('vi-VN')} đ
                              </Typography.Title>
                              {item.oldPrice && item.oldPrice > item.price && (
                                <Typography.Text delete type="secondary" style={{ fontSize: '14px', marginLeft: '8px' }}>
                                  {item.oldPrice.toLocaleString('vi-VN')} đ
                                </Typography.Text>
                              )}
                            </div>
                            {!item.oldPrice || item.oldPrice <= item.price ? (
                              <div style={{ height: '14px', marginTop: '4px' }}></div>
                            ) : null}
                          </div>
                          
                          <Button 
                            type="primary"
                            icon={<ShoppingCartOutlined />}
                            size="middle"
                            style={{ 
                              marginTop: '15px', 
                              borderRadius: '4px', 
                              width: '100%',
                              backgroundColor: '#000',
                              borderColor: '#000'
                            }}
                          >
                            Thêm vào giỏ
                          </Button>
                        </>
                      } 
                    />
                  </Card>
                </Link>
              </List.Item>
            )}
          />
          
          <div style={{ textAlign: 'center', marginTop: 60 }}>
            <Link to="/products">
              <Button 
                type="default" 
                size="large" 
                style={{ 
                  borderRadius: '0', 
                  borderColor: '#000', 
                  color: '#000',
                  padding: '0 50px',
                  height: '50px',
                  fontWeight: '400',
                  fontSize: '16px'
                }}
              >
                Xem tất cả sản phẩm <ArrowRightOutlined />
              </Button>
            </Link>
          </div>
        </div>

        {/* Banner quảng cáo */}
        <div style={{ 
          padding: '100px 0', 
          background: '#000000',
          color: '#fff',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
            <Title level={2} style={{ color: '#fff', fontSize: '42px', marginBottom: '30px', fontWeight: '600', letterSpacing: '1px' }}>
              Giảm Giá Đến 50% Cho Thành Viên Mới
            </Title>
            <Paragraph style={{ fontSize: '18px', marginBottom: '45px', color: '#cccccc', lineHeight: '1.7' }}>
              Đăng ký ngay hôm nay để nhận ưu đãi đặc biệt và thông tin về các bộ sưu tập mới nhất
            </Paragraph>
            <Link to="/register">
              <Button size="large" style={{ 
                background: '#fff', 
                color: '#000', 
                border: 'none', 
                height: '55px', 
                borderRadius: '0', 
                padding: '0 40px', 
                fontSize: '16px',
                fontWeight: '500'
              }}>
                Đăng Ký Ngay <ArrowRightOutlined />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
