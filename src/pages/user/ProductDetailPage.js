import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Carousel, Card, Button, InputNumber, Select, Tabs, Descriptions, Rate, Divider, message } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, CheckOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { getProductById } from '../../services/api/productApi';
import { useCart } from '../../contexts/CartContext';
import React from 'react';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = React.createRef();
  
  const carouselSettings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    effect: 'fade',
  };
  
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const productData = await getProductById(id);
        setProduct(productData);
        
        // Thiết lập giá trị mặc định cho size và color
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0]);
        }
      } catch (error) {
        console.error('Lỗi khi tải chi tiết sản phẩm:', error);
        message.error('Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  if (loading || !product) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải...</div>;
  }
  
  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      message.warning('Vui lòng chọn kích thước và màu sắc');
      return;
    }
    
    addToCart(product, quantity, selectedSize, selectedColor);
    message.success(`Đã thêm ${product.name} vào giỏ hàng`);
  };
  
  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };
  
  const arrowButtonStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderColor: 'transparent',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
  };

  const arrowButtonHoverStyle = {
    transform: 'scale(1.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
  };

  const arrowButtonActiveStyle = {
    transform: 'scale(0.95)',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)'
  };
  
  return (
    <div>
      <Row gutter={[32, 32]}>
        {/* Ảnh sản phẩm */}
        <Col xs={24} md={12}>
          <Card>
            <div className="custom-carousel-container" style={{ position: 'relative' }}>
              <Carousel 
                ref={carouselRef}
                autoplay={false}
                afterChange={(current) => setCurrentSlide(current)}
                effect="fade"
                speed={500}
                dots={false}
              >
                {product.images.map((image, index) => (
                  <div key={index}>
                    <img 
                      src={image || "https://via.placeholder.com/500x500?text=No+Image"} 
                      alt={`${product.name} - Ảnh ${index + 1}`} 
                      style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'contain' }} 
                    />
                  </div>
                ))}
              </Carousel>
              
              {/* Nút điều hướng trái phải */}
              <div className="carousel-arrows" style={{ position: 'absolute', width: '100%', top: '50%', transform: 'translateY(-50%)', display: 'flex', justifyContent: 'space-between', padding: '0 16px', zIndex: 1 }}>
                <Button 
                  className="carousel-arrow-button carousel-arrow-left"
                  icon={<LeftOutlined />} 
                  onClick={() => carouselRef.current.prev()}
                  style={arrowButtonStyle}
                  onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, {
                      transform: 'scale(1.1)',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                    });
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.currentTarget.style, arrowButtonStyle);
                  }}
                  onMouseDown={(e) => {
                    Object.assign(e.currentTarget.style, {
                      transform: 'scale(0.95)',
                      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)'
                    });
                  }}
                  onMouseUp={(e) => {
                    Object.assign(e.currentTarget.style, {
                      transform: 'scale(1.1)',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                    });
                  }}
                />
                <Button 
                  className="carousel-arrow-button carousel-arrow-right"
                  icon={<RightOutlined />}
                  onClick={() => carouselRef.current.next()}
                  style={arrowButtonStyle}
                  onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, {
                      transform: 'scale(1.1)',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                    });
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.currentTarget.style, arrowButtonStyle);
                  }}
                  onMouseDown={(e) => {
                    Object.assign(e.currentTarget.style, {
                      transform: 'scale(0.95)',
                      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)'
                    });
                  }}
                  onMouseUp={(e) => {
                    Object.assign(e.currentTarget.style, {
                      transform: 'scale(1.1)',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                    });
                  }}
                />
              </div>
              
              {/* Hiển thị điểm tượng trưng cho vị trí slide */}
              <div className="carousel-dots" style={{ textAlign: 'center', marginTop: '10px' }}>
                {product.images.map((_, index) => (
                  <span 
                    key={index} 
                    onClick={() => carouselRef.current.goTo(index)}
                    style={{ 
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: currentSlide === index ? '#1890ff' : '#d9d9d9',
                      margin: '0 4px',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  />
                ))}
              </div>
              
              {/* Hiển thị thumbnail ảnh nhỏ để dễ chọn */}
              <div className="carousel-thumbnails" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginTop: '10px' }}>
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => carouselRef.current.goTo(index)}
                    style={{
                      width: '60px',
                      height: '60px',
                      margin: '0 4px',
                      padding: '2px',
                      border: currentSlide === index ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      cursor: 'pointer',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}
                  >
                    <img
                      src={image || "https://via.placeholder.com/60x60?text=No+Image"}
                      alt={`Thumbnail ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
        
        {/* Thông tin sản phẩm */}
        <Col xs={24} md={12}>
          <Title level={2}>{product.name}</Title>
          <Rate disabled defaultValue={4.5} /> <Text>(120 đánh giá)</Text>
          
          <Title level={3} style={{ color: 'red', margin: '16px 0' }}>
            {product.price.toLocaleString('vi-VN')}đ
          </Title>
          
          <Paragraph>{product.description}</Paragraph>
          
          <Divider />
          
          {/* Chọn kích thước */}
          <div style={{ marginBottom: 16 }}>
            <Text strong>Kích thước: </Text>
            <Select 
              value={selectedSize} 
              onChange={setSelectedSize}
              style={{ width: 120, marginLeft: 8 }}
            >
              {product.sizes.map(size => (
                <Option key={size} value={size}>{size}</Option>
              ))}
            </Select>
          </div>
          
          {/* Chọn màu sắc */}
          <div style={{ marginBottom: 16 }}>
            <Text strong>Màu sắc: </Text>
            <Select 
              value={selectedColor} 
              onChange={setSelectedColor}
              style={{ width: 120, marginLeft: 8 }}
            >
              {product.colors.map(color => (
                <Option key={color} value={color}>{color}</Option>
              ))}
            </Select>
          </div>
          
          {/* Chọn số lượng */}
          <div style={{ marginBottom: 24 }}>
            <Text strong>Số lượng: </Text>
            <InputNumber 
              min={1} 
              max={product.inStock} 
              value={quantity} 
              onChange={setQuantity} 
              style={{ marginLeft: 8 }}
            />
            <Text type="secondary" style={{ marginLeft: 8 }}>
              Còn lại: {product.inStock} sản phẩm
            </Text>
          </div>
          
          {/* Nút thêm vào giỏ và mua ngay */}
          <Row gutter={16}>
            <Col span={12}>
              <Button 
                type="primary" 
                size="large" 
                icon={<ShoppingCartOutlined />} 
                onClick={handleAddToCart}
                block
              >
                Thêm vào giỏ
              </Button>
            </Col>
            <Col span={12}>
              <Button 
                type="danger" 
                size="large" 
                onClick={handleBuyNow}
                block
              >
                Mua ngay
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
      
      {/* Tabs thông tin chi tiết */}
      <Tabs defaultActiveKey="1" style={{ marginTop: 48 }}>
        <TabPane tab="Chi tiết sản phẩm" key="1">
          <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
            <Descriptions.Item label="Tên sản phẩm">{product.name}</Descriptions.Item>
            <Descriptions.Item label="Danh mục">Áo thun</Descriptions.Item>
            <Descriptions.Item label="Kích thước có sẵn">{product.sizes.join(', ')}</Descriptions.Item>
            <Descriptions.Item label="Màu sắc có sẵn">{product.colors.join(', ')}</Descriptions.Item>
            <Descriptions.Item label="Mô tả">{product.description}</Descriptions.Item>
          </Descriptions>
        </TabPane>
        <TabPane tab="Đánh giá sản phẩm" key="2">
          <p>Chưa có đánh giá nào cho sản phẩm này.</p>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProductDetailPage;
